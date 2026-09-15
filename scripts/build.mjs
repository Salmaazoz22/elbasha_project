// Zero-dependency static build: src/ → dist/ (or dist-drafts/ with --drafts).
//   node scripts/build.mjs            production: omits blocks whose data is still [[NEEDS_CLIENT]]
//   node scripts/build.mjs --drafts   review build: shows every [[NEEDS_CLIENT]] marker visibly, noindex
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, posix, relative, resolve } from 'node:path';
import { layout } from '../src/templates/layout.mjs';
import * as pages from '../src/templates/pages.mjs';
import { isMarker } from '../src/templates/lib.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');
const drafts = process.argv.includes('--drafts');
const OUT = join(ROOT, drafts ? 'dist-drafts' : 'dist');

loadDotEnv(join(ROOT, '.env'));
const SITE_URL = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
if (SITE_URL && !/^https:\/\/[^/]+$/.test(SITE_URL)) {
  fail(`SITE_URL must look like https://example.com (got "${SITE_URL}")`);
}

const readJson = (p) => JSON.parse(readFileSync(join(SRC, p), 'utf8'));
const site = readJson('data/site.json');
const { services } = readJson('data/services.json');
const { categories, projects } = readJson('data/projects.json');
const images = readJson('data/images.json');
const i18n = { ar: readJson('i18n/ar.json'), en: readJson('i18n/en.json') };

const PAGES = [
  { key: 'home', path: { ar: '/', en: '/en/' } },
  { key: 'projects', path: { ar: '/projects/', en: '/en/projects/' } },
  { key: 'about', path: { ar: '/about/', en: '/en/about/' } },
  { key: 'contact', path: { ar: '/contact/', en: '/en/contact/' } },
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// ---------- Assets: content-hashed copies under /assets ----------
const assetMap = new Map();
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);
const walk = (dir) => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const assetsDir = join(SRC, 'assets');
const allAssets = walk(assetsDir).map((abs) => ({ abs, rel: relative(assetsDir, abs).split('\\').join('/') }));

function emitAsset({ rel }, buf) {
  const ext = extname(rel);
  const hashed = `${rel.slice(0, -ext.length)}.${hash(buf)}${ext}`;
  const dest = join(OUT, 'assets', hashed);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, buf);
  assetMap.set(rel, `/assets/${hashed}`);
}
// Non-CSS first so CSS url() references can be rewritten to hashed paths.
for (const a of allAssets.filter((a) => !a.rel.endsWith('.css'))) emitAsset(a, readFileSync(a.abs));
for (const a of allAssets.filter((a) => a.rel.endsWith('.css'))) {
  const css = readFileSync(a.abs, 'utf8').replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q, ref) => {
    if (/^(data:|https?:|#)/.test(ref)) return m;
    const key = posix.normalize(posix.join(posix.dirname(a.rel), ref));
    if (!assetMap.has(key)) fail(`${a.rel}: url(${ref}) not found`);
    return `url("${assetMap.get(key)}")`;
  });
  emitAsset(a, Buffer.from(css));
}
const asset = (rel) => {
  if (!assetMap.has(rel)) fail(`Unknown asset: ${rel}`);
  return assetMap.get(rel);
};

// ---------- Public files copied as-is to the site root ----------
cpSync(join(SRC, 'public'), OUT, { recursive: true });
cpSync(join(assetsDir, 'fonts/OFL-Cairo.txt'), join(OUT, 'OFL-Cairo.txt'));

// ---------- Pages ----------
const report = new Set();
const year = new Date().getFullYear();
const abs = SITE_URL ? (path) => SITE_URL + path : null;
// Pages without a language counterpart (404) link to the home page of the requested language.
const url = (key, lang) => (PAGES.find((p) => p.key === key) ?? PAGES[0]).path[lang];

function context(lang) {
  const other = lang === 'ar' ? 'en' : 'ar';
  return {
    lang, dir: lang === 'ar' ? 'rtl' : 'ltr', t: i18n[lang], other: i18n[other],
    site, services, categories, projects, images, asset, url, abs, drafts, report, year,
  };
}

function writePage(path, html) {
  const file = path.endsWith('/') ? join(OUT, path, 'index.html') : join(OUT, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

for (const lang of ['ar', 'en']) {
  for (const p of PAGES) {
    const ctx = context(lang);
    const page = { key: p.key, ...pages[p.key](ctx) };
    page.structuredData = structuredData(ctx, p.key);
    writePage(p.path[lang], layout(ctx, page));
  }
}
{
  const ctx = context('ar');
  writePage('/404.html', layout(ctx, { key: 'notFound', ...pages.notFound(ctx, i18n.en) }));
}

// ---------- robots.txt, sitemap.xml, web manifest ----------
const robots = drafts
  ? 'User-agent: *\nDisallow: /\n'
  : `User-agent: *\nAllow: /\n${SITE_URL ? `\nSitemap: ${SITE_URL}/sitemap.xml\n` : ''}`;
writeFileSync(join(OUT, 'robots.txt'), robots);

if (SITE_URL && !drafts) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = PAGES.flatMap((p) => ['ar', 'en'].map((lang) => `  <url>
    <loc>${SITE_URL}${p.path[lang]}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}${p.path.ar}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${p.path.en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${p.path.ar}"/>
  </url>`));
  writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`);
}

writeFileSync(join(OUT, 'site.webmanifest'), JSON.stringify({
  name: site.brand.name.ar,
  short_name: site.brand.shortName.ar,
  lang: 'ar',
  dir: 'rtl',
  start_url: '/',
  display: 'browser',
  background_color: '#F7F5F2',
  theme_color: '#184098',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
}, null, 2) + '\n');

// ---------- Structured data (disabled until real data exists) ----------
function structuredData(ctx, key) {
  if (key !== 'home' || !site.structuredData?.enabled) return null;
  const c = site.contact;
  const required = [site.brand.legalName, c.address.en, c.serviceArea.en];
  if (required.some(isMarker) || !SITE_URL) {
    fail('structuredData.enabled is true but legalName/address/serviceArea are still [[NEEDS_CLIENT]] or SITE_URL is unset.');
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: site.brand.legalName,
    alternateName: [site.brand.name.ar, site.brand.name.en],
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/${images.og.file}`,
    telephone: c.primaryPhone.tel,
    email: c.email,
    address: c.address.en,
    areaServed: c.serviceArea.en,
    sameAs: site.social.map((s) => s.url),
  }).replace(/</g, '\\u003c');
}

// ---------- Summary ----------
const files = walk(OUT);
const total = files.reduce((n, f) => n + statSync(f).size, 0);
console.log(`Built ${drafts ? 'DRAFTS' : 'production'} site → ${relative(ROOT, OUT)} (${files.length} files, ${(total / 1048576).toFixed(1)} MiB)`);
if (!SITE_URL) console.warn('⚠ SITE_URL is not set: canonical, hreflang, og:url/og:image and sitemap.xml were omitted. Set it for production (see .env.example).');
if (report.size) {
  console.log(`${drafts ? 'Shown' : 'Hidden'} blocks awaiting client input (${report.size} unique [[NEEDS_CLIENT]] markers):`);
  for (const m of [...report].sort()) console.log(`  - ${m}`);
}
const draftDescriptions = services.filter((s) => s.description?.draft).map((s) => s.name.en);
if (draftDescriptions.length) {
  console.log(`Draft service descriptions awaiting client review (draft: true): ${draftDescriptions.length}`);
  for (const n of draftDescriptions) console.log(`  - ${n}`);
}
if (!existsSync(join(OUT, 'index.html'))) fail('dist/index.html was not generated');

function loadDotEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}
