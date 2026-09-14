// Local preview server for dist/ that behaves like the static host:
// case-sensitive paths, /dir → /dir/ redirects, 404.html, _headers, _redirects, gzip/brotli, Range requests.
//   node scripts/serve.mjs [--drafts] [--port 4173] [--no-compress]
import { createServer } from 'node:http';
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const ROOT = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const OUT = join(ROOT, args.includes('--drafts') ? 'dist-drafts' : 'dist');
const PORT = Number(args[args.indexOf('--port') + 1]) || 4173;
const COMPRESS = !args.includes('--no-compress');

if (!existsSync(OUT)) {
  console.error(`${OUT} not found — run npm run build first.`);
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm',
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest))/;

// ---------- _headers / _redirects ----------
function parseHeaders(file) {
  if (!existsSync(file)) return [];
  const rules = [];
  let current = null;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      const pattern = new RegExp(`^${line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
      current = { pattern, headers: {} };
      rules.push(current);
    } else if (current) {
      const i = line.indexOf(':');
      current.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}
const headerRules = parseHeaders(join(OUT, '_headers'));
const redirects = new Map();
if (existsSync(join(OUT, '_redirects'))) {
  for (const line of readFileSync(join(OUT, '_redirects'), 'utf8').split(/\r?\n/)) {
    const [from, to, code] = line.trim().split(/\s+/);
    if (from && !from.startsWith('#') && to) redirects.set(from, { to, code: Number(code) || 302 });
  }
}

// Exact-case existence check (Windows/macOS file systems are case-insensitive; hosts are not).
function existsExactCase(relPath) {
  let dir = OUT;
  for (const segment of relPath.split('/').filter(Boolean)) {
    if (!existsSync(dir) || !statSync(dir).isDirectory() || !readdirSync(dir).includes(segment)) return false;
    dir = join(dir, segment);
  }
  return true;
}

function send(req, res, status, file, extra = {}) {
  const type = TYPES[extname(file)] || 'application/octet-stream';
  const headers = { 'Content-Type': type, ...extra };
  const path = new URL(req.url, 'http://x').pathname;
  for (const rule of headerRules) if (rule.pattern.test(path)) Object.assign(headers, rule.headers);
  const size = statSync(file).size;

  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range && status === 200) {
    const start = range[1] ? Number(range[1]) : size - Number(range[2]);
    const end = range[1] && range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, { ...headers, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    createReadStream(file, { start, end }).pipe(res);
    return;
  }

  const accept = req.headers['accept-encoding'] || '';
  if (COMPRESS && COMPRESSIBLE.test(type)) {
    const body = readFileSync(file);
    if (accept.includes('br')) {
      res.writeHead(status, { ...headers, 'Content-Encoding': 'br', Vary: 'Accept-Encoding' });
      res.end(brotliCompressSync(body));
      return;
    }
    if (accept.includes('gzip')) {
      res.writeHead(status, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
      res.end(gzipSync(body));
      return;
    }
  }
  res.writeHead(status, { ...headers, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  if (req.method === 'HEAD') res.end();
  else createReadStream(file).pipe(res);
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (path.includes('..')) {
    res.writeHead(400).end();
    return;
  }

  const redirect = redirects.get(path);
  if (redirect) {
    res.writeHead(redirect.code, { Location: redirect.to }).end();
    return;
  }

  const relPath = path.replace(/^\//, '');
  if (path.endsWith('/') && existsExactCase(`${relPath}index.html`)) return send(req, res, 200, join(OUT, relPath, 'index.html'));
  if (!path.endsWith('/') && existsExactCase(relPath) && statSync(join(OUT, relPath)).isFile()) {
    if (/^_(headers|redirects)$/.test(relPath)) return send(req, res, 404, join(OUT, '404.html'));
    return send(req, res, 200, join(OUT, relPath));
  }
  if (!path.endsWith('/') && existsExactCase(`${relPath}/index.html`)) {
    res.writeHead(308, { Location: `${path}/${url.search}` }).end();
    return;
  }
  send(req, res, 404, join(OUT, '404.html'));
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Previewing ${OUT} at http://127.0.0.1:${PORT}/ (compression ${COMPRESS ? 'on' : 'off'})`);
});
