// Client-facing PDF from a Markdown document in docs/ (Arabic-first, A4, the site's own Cairo).
// Run with `npm run docs:pdf` (installs puppeteer-core on demand; it is not a build dependency).
// The PDFs themselves are git-ignored: they are generated from the Markdown and sent by WhatsApp or email.
//   node scripts/docs-pdf.mjs [docs/CLIENT_REQUESTS.md ...]
import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find((p) => existsSync(p));
if (!CHROME) throw new Error('Google Chrome not found; it renders the PDF.');

const docs = process.argv.slice(2);
if (!docs.length) docs.push('docs/CLIENT_REQUESTS.md');

const esc = (s) => s.replace(/&(?!#?\w+;)/g, '&amp;').replace(/<(?!\/?(?:bdi|br|strong|em|code|div)\b)/g, '&lt;');

/**
 * Markdown -> HTML for the subset these client documents use: headings, paragraphs, bullet lists
 * (one nesting level), tables, horizontal rules, raw <div>/<bdi>/<br>, **bold** and `code`.
 * Deliberately small: the project ships no Markdown dependency.
 */
function render(md) {
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  const lines = md.split(/\r?\n/);
  const out = [];
  let list = null;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { closeList(); continue; }
    if (/^<\/?div\b/.test(t)) { closeList(); out.push(t); continue; }
    if (/^---+$/.test(t)) { closeList(); out.push('<hr>'); continue; }

    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) { closeList(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }

    // table: a header row followed by the |---|---| separator
    if (t.startsWith('|') && /^\|[\s:|-]+\|$/.test((lines[i + 1] || '').trim())) {
      closeList();
      const cells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => inline(c.trim()));
      const head = cells(t);
      const body = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) body.push(cells(lines[i++]));
      i--;
      out.push(`<table><thead><tr>${head.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${
        body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }

    const li = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (li) {
      const nested = li[1].length >= 2;
      if (!list) { list = 'ul'; out.push('<ul>'); }
      out.push(nested ? `<li class="sub">${inline(li[2])}</li>` : `<li>${inline(li[2])}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${inline(t)}</p>`);
  }
  closeList();
  return out.join('\n');
}

const fontUrl = (f) => pathToFileURL(join(ROOT, 'src/assets/fonts', f)).href;
const CSS = `
@font-face{font-family:"Cairo";font-weight:400 800;src:url("${fontUrl('cairo-arabic.woff2')}") format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+0870-08FF,U+200C-200E,U+FB50-FDFF,U+FE70-FEFF;}
@font-face{font-family:"Cairo";font-weight:400 800;src:url("${fontUrl('cairo-latin.woff2')}") format("woff2");unicode-range:U+0000-00FF,U+2000-200B,U+2012-206F,U+2190-21FF,U+2212;}
@page{size:A4;margin:14mm 12mm 16mm}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:"Cairo","Segoe UI",Tahoma,sans-serif;color:#1f2937;font-size:9.5pt;line-height:1.7}
h1{font-size:17pt;color:#184098;margin:0 0 4mm;line-height:1.35}
h2{font-size:12.5pt;color:#fff;background:#184098;padding:2mm 3mm;border-radius:2px;margin:7mm 0 3mm}
h3{font-size:11pt;color:#184098;margin:5mm 0 2mm}
p{margin:0 0 2.5mm}
hr{border:0;border-top:1px solid #d1d5db;margin:6mm 0}
ul{margin:0 0 3mm;padding-inline-start:5mm}
li{margin:0 0 1.2mm}
li.sub{list-style:none;position:relative;padding-inline-start:3mm;color:#4b5563}
li.sub::before{content:"–";position:absolute;inset-inline-start:0}
code{font-family:Consolas,monospace;font-size:8.5pt;background:#f3f4f6;padding:0 1mm;border-radius:2px;direction:ltr;display:inline-block}
table{width:100%;border-collapse:collapse;margin:0 0 4mm;font-size:8.5pt;page-break-inside:auto}
tr{page-break-inside:avoid}
th{background:#184098;color:#fff;font-weight:700;text-align:start}
th,td{border:1px solid #cbd5e1;padding:1.6mm 2mm;vertical-align:top}
tbody tr:nth-child(even){background:#f8fafc}
td:first-child{text-align:center;font-weight:700;color:#184098;white-space:nowrap}
bdi{direction:ltr;unicode-bidi:isolate}
`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--allow-file-access-from-files', '--disable-gpu'] });
try {
  for (const rel of docs) {
    const src = join(ROOT, rel);
    const md = readFileSync(src, 'utf8');
    const rtl = /dir="rtl"/.test(md);
    const html = `<!DOCTYPE html><html lang="${rtl ? 'ar' : 'en'}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<title>${esc(basename(rel, '.md'))}</title><style>${CSS}</style></head><body>${render(md)}</body></html>`;
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 120000 });
    await page.evaluate(() => document.fonts.ready);
    const out = join(ROOT, rel.replace(/\.md$/, '.pdf'));
    await page.pdf({
      path: out, format: 'A4', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<div></div>',
      footerTemplate: '<div style="width:100%;font-size:8px;color:#6b7280;text-align:center;font-family:Arial,sans-serif;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    });
    await page.close();
    console.log(`${rel} -> ${rel.replace(/\.md$/, '.pdf')}  ${(statSync(out).size / 1024).toFixed(0)} KB`);
  }
} finally {
  await browser.close();
}
