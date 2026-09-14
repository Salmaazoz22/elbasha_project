// Post-build checks for dist/ (or dist-drafts/ with --drafts). Zero dependencies; exits 1 on any error.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const drafts = process.argv.includes('--drafts');
const OUT = join(ROOT, drafts ? 'dist-drafts' : 'dist');
const MAX_FILE = 25 * 1024 * 1024; // Cloudflare Pages per-file limit

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

if (!existsSync(OUT)) {
  console.error(`✖ ${relative(ROOT, OUT)} does not exist. Run the build first.`);
  process.exit(1);
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const files = walk(OUT);
const rel = (f) => relative(OUT, f).split('\\').join('/');
const fileSet = new Set(files.map(rel));

// ---------- Files ----------
const allowedTxt = new Set(['robots.txt', 'licenses.txt', 'OFL-Cairo.txt']);
for (const f of files) {
  const r = rel(f);
  if (statSync(f).size > MAX_FILE) err(r, `larger than 25 MiB (${(statSync(f).size / 1048576).toFixed(1)} MiB)`);
  if (r.endsWith('.txt') && !allowedTxt.has(r.split('/').pop().replace(/\.[0-9a-f]{10}\.txt$/, '.txt'))) err(r, 'unexpected .txt file in deploy output');
  if (/source-assets|\.mp4$/.test(r) && !r.startsWith('assets/video/')) err(r, 'source asset leaked into deploy output');
  if (/[\u0600-\u06FF]/.test(r)) err(r, 'non-ASCII file name in deploy output');
}
for (const required of ['index.html', 'en/index.html', '404.html', 'robots.txt', '_headers', '_redirects', 'favicon.ico', 'site.webmanifest']) {
  if (!fileSet.has(required)) err(required, 'missing');
}

// ---------- Resolve internal URLs ----------
function resolveUrl(url) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return 'self';
  const p = decodeURI(clean).replace(/^\//, '');
  if (p === '' || p.endsWith('/')) return fileSet.has(`${p}index.html`) ? `${p}index.html` : null;
  if (fileSet.has(p)) return p;
  if (!extname(p) && fileSet.has(`${p}/index.html`)) return `${p}/index.html`;
  return null;
}

const htmlFiles = files.filter((f) => f.endsWith('.html'));
const docs = new Map(htmlFiles.map((f) => [rel(f), readFileSync(f, 'utf8')]));
const ids = new Map([...docs].map(([k, h]) => [k, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const titles = new Map();
const descriptions = new Map();
const external = new Set();
let markerCount = 0;

for (const [file, html] of docs) {
  const is404 = file === '404.html';
  const langMatch = html.match(/<html lang="(ar|en)" dir="(rtl|ltr)"/);
  if (!langMatch) err(file, '<html> is missing lang/dir');
  else if ((langMatch[1] === 'ar') !== (langMatch[2] === 'rtl')) err(file, `lang="${langMatch[1]}" does not match dir="${langMatch[2]}"`);
  if (file.startsWith('en/') && langMatch?.[1] !== 'en') err(file, 'English page is not lang="en"');

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(file, `expected exactly one <h1>, found ${h1}`);
  if (!/<main id="main"/.test(html)) err(file, 'missing <main id="main">');
  if (!/class="skip-link" href="#main"/.test(html)) err(file, 'missing skip link');

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  if (!title) err(file, 'missing <title>');
  else if (titles.has(title)) err(file, `duplicate <title> (also ${titles.get(title)})`);
  else titles.set(title, file);

  const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  if (!is404) {
    if (!desc) err(file, 'missing meta description');
    else if (descriptions.has(desc)) err(file, `duplicate meta description (also ${descriptions.get(desc)})`);
    else descriptions.set(desc, file);
    if (!drafts && /name="robots" content="noindex"/.test(html)) err(file, 'indexable page has noindex');
  } else if (!/name="robots" content="noindex"/.test(html)) {
    err(file, '404 page should be noindex');
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\salt="/.test(tag)) err(file, `<img> without alt: ${tag.slice(0, 80)}`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) err(file, `<img> without width/height: ${tag.slice(0, 80)}`);
  }

  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(m[0])) err(file, `target=_blank without rel=noopener: ${m[0].slice(0, 80)}`);
  }

  // href / src / poster / srcset references
  const refs = [];
  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/\s(?:srcset|imagesrcset)="([^"]+)"/g)) {
    for (const part of m[1].split(',')) refs.push(part.trim().split(/\s+/)[0]);
  }
  for (const ref of refs) {
    if (/^(https?:)?\/\//.test(ref)) {
      external.add(ref);
      continue;
    }
    if (/^(mailto:|tel:|data:)/.test(ref)) continue;
    if (ref.startsWith('#')) {
      if (ref.length > 1 && !ids.get(file).has(ref.slice(1))) err(file, `broken in-page anchor ${ref}`);
      continue;
    }
    if (!ref.startsWith('/')) {
      err(file, `relative URL (use root-relative): ${ref}`);
      continue;
    }
    const target = resolveUrl(ref);
    if (!target) err(file, `broken link ${ref}`);
    else if (ref.includes('#') && target.endsWith('.html')) {
      const hash = ref.split('#')[1];
      if (hash && !ids.get(target)?.has(hash)) err(file, `broken anchor ${ref}`);
    }
  }

  if (/lorem ipsum/i.test(html)) err(file, 'contains "lorem ipsum"');
  const markers = (html.match(/\[\[NEEDS_CLIENT/g) || []).length;
  markerCount += markers;
  if (markers && !drafts) err(file, `${markers} [[NEEDS_CLIENT]] marker(s) leaked into the production build`);
}

// ---------- CSS url() references ----------
for (const f of files.filter((x) => x.endsWith('.css'))) {
  const css = readFileSync(f, 'utf8');
  for (const m of css.matchAll(/url\("?([^")]+)"?\)/g)) {
    if (!m[1].startsWith('data:') && !resolveUrl(m[1])) err(rel(f), `broken url(${m[1]})`);
  }
}

// ---------- Sitemap ----------
if (fileSet.has('sitemap.xml')) {
  const xml = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length !== 8) err('sitemap.xml', `expected 8 URLs, found ${locs.length}`);
  for (const loc of locs) {
    if (!resolveUrl(new URL(loc).pathname)) err('sitemap.xml', `URL has no page: ${loc}`);
  }
} else if (!drafts) {
  warnings.push('sitemap.xml not generated (SITE_URL unset).');
}

// ---------- Report ----------
const total = files.reduce((n, f) => n + statSync(f).size, 0);
console.log(`Checked ${relative(ROOT, OUT)}: ${htmlFiles.length} HTML pages, ${files.length} files, ${(total / 1048576).toFixed(1)} MiB`);
console.log(`External links (${external.size}):`);
for (const u of [...external].sort()) console.log(`  ${u}`);
if (drafts) console.log(`[[NEEDS_CLIENT]] markers rendered: ${markerCount}`);
for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  console.error(`✖ ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('✔ All checks passed');
