// Image pipeline: source-assets/images → src/assets/img (responsive WebP + JPEG),
// src/public (favicons, OG image) and src/data/images.json (sizes for templates).
// Run with `npm run media` (installs sharp on demand; it is not a build dependency).
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'source-assets/images');
const IMG = join(ROOT, 'src/assets/img');
const PUB = join(ROOT, 'src/public');
mkdirSync(IMG, { recursive: true });
mkdirSync(PUB, { recursive: true });

const manifest = {};
const kb = (b) => `${(b / 1024).toFixed(1)} KB`;

/**
 * Crop (optional), then write each width as WebP + JPEG. Never upscales.
 * Records { width, height, webp: [{ w, file }], jpg: [...] } under `key`.
 */
async function responsive(key, file, { crop, widths, quality = 72, ratio }) {
  let base = sharp(join(SRC, file)).rotate();
  if (crop) base = base.extract(crop);
  const buf = await base.toBuffer();
  const { width, height } = await sharp(buf).metadata();
  const entry = ratio ? { width: Math.min(width, Math.max(...widths)), height: 0, webp: [], jpg: [] } : { width, height, webp: [], jpg: [] };
  if (ratio) entry.height = Math.round(entry.width / ratio);
  for (const w of [...new Set(widths.map((x) => Math.min(x, width)))]) {
    const name = `${key}-${w}`;
    // `ratio` centre-crops to a fixed aspect ratio (gallery thumbnails); otherwise the frame is kept.
    const resized = ratio
      ? sharp(buf).resize({ width: w, height: Math.round(w / ratio), fit: 'cover', position: 'centre', withoutEnlargement: true })
      : sharp(buf).resize({ width: w, withoutEnlargement: true });
    const webp = await resized.clone().webp({ quality, effort: 6 }).toFile(join(IMG, `${name}.webp`));
    const jpg = await resized.clone().jpeg({ quality: quality + 6, mozjpeg: true, progressive: true }).toFile(join(IMG, `${name}.jpg`));
    entry.webp.push({ w, file: `img/${name}.webp` });
    entry.jpg.push({ w, file: `img/${name}.jpg` });
    console.log(`${name}  webp ${kb(webp.size)}  jpg ${kb(jpg.size)}`);
  }
  manifest[key] = entry;
}

// ---------- Hero (stills from the company's own video, see scripts/video.mjs) ----------
// Desktop: full 20:9 frame. Mobile: 4:5 crop around the grader (native pixels, no upscaling).
await responsive('hero-ar', 'video-stills/hero-ar.jpg', { widths: [960, 1280, 1920], quality: 68 });
await responsive('hero-ar-mobile', 'video-stills/hero-ar.jpg', { crop: { left: 435, top: 0, width: 691, height: 864 }, widths: [480, 691], quality: 68 });
await responsive('hero-en', 'video-stills/hero-en.jpg', { widths: [960, 1280, 1920], quality: 68 });
await responsive('hero-en-mobile', 'video-stills/hero-en.jpg', { crop: { left: 790, top: 0, width: 691, height: 864 }, widths: [480, 691], quality: 68 });

// ---------- Project photos (4:3) ----------
await responsive('project-future-of-egypt', 'مستقبل_مصر.jpg', { crop: { left: 160, top: 0, width: 960, height: 720 }, widths: [480, 800, 960] });
// Starts at x=260 so the camera timestamp overlay (bottom-left) is cropped out.
await responsive('project-amr-ibn-al-as-axis', 'محور_عمرو_بنالعاص.jpg', { crop: { left: 260, top: 0, width: 796, height: 597 }, widths: [480, 796] });
await responsive('project-october-western-sector', 'الطريق_الغربي_اكتوبر.jpg', { crop: { left: 0, top: 500, width: 1200, height: 900 }, widths: [480, 800, 1200] });
await responsive('project-wadi-el-natrun', 'وادي_النطرون.jpg', { crop: { left: 0, top: 300, width: 720, height: 540 }, widths: [480, 720] });

// ---------- Client photos, batch 1 (source-assets/images/client-photos, numbers as in docs/photo-triage.xlsx) ----------
// Only items rated A/B with no faces, stamps, police/military sites or third-party branding (docs/MEDIA_PROPOSAL.md),
// except where the client has since cleared them (see the gallery notes below).
// Not attributed to any project until the client confirms which project each photo shows.
// Service cards, 4:3.
await responsive('service-road-construction', 'client-photos/photo-177.jpg', { crop: { left: 320, top: 0, width: 960, height: 720 }, widths: [480, 720, 960] });
await responsive('service-material-supply', 'client-photos/photo-120.jpg', { crop: { left: 0, top: 250, width: 1200, height: 900 }, widths: [480, 720, 960] });
// Starts below the two workers standing near the pallets (y < 780).
await responsive('service-curbstone-interlock', 'client-photos/photo-014.jpg', { crop: { left: 160, top: 820, width: 1040, height: 780 }, widths: [480, 720, 960] });
// Starts below the sun.
await responsive('service-slopes-barriers', 'client-photos/photo-160.jpg', { crop: { left: 0, top: 400, width: 960, height: 720 }, widths: [480, 720, 960] });
// Backgrounds under a navy overlay (≥ 0.75 behind text), so a lower quality is invisible. 1280×720 sources, never upscaled.
await responsive('bg-cta', 'client-photos/photo-184.jpg', { widths: [640, 960, 1280], quality: 55 });
await responsive('bg-projects', 'client-photos/photo-164.jpg', { widths: [640, 960, 1280], quality: 55 });
await responsive('bg-about', 'client-photos/photo-177.jpg', { widths: [640, 960, 1280], quality: 55 });

// About page photo (the 16:9 frame, no crop).
await responsive('about-photo', 'client-photos/photo-178.jpg', { widths: [480, 760, 1280] });

// ---------- Site gallery (projects page). Thumbnails are 4:3 centre crops; the lightbox uses the full frame. ----------
for (const n of [178, 184, 169, 12, 142, 136, 1, 101, 102, 45, 38, 108, 66, 32, 95, 160, 152, 182, 126, 130, 134]) {
  const file = `client-photos/photo-${String(n).padStart(3, '0')}.jpg`;
  await responsive(`gallery-${n}`, file, { widths: [400, 760], quality: 68, ratio: 4 / 3 });
  await responsive(`gallery-${n}-full`, file, { widths: [760, 1280], quality: 72 });
}

// Photo 162 gets the same gallery treatment but is cropped first: the photographer's watermark sits in the top
// band (x 745-862, y 42-142 of the 1600x1200 frame), so the top 155 px come off. The client confirmed the company
// owns the photo and may publish it (answers batch 2, 2026-09-16); the crop only removes the third-party mark.
{
  const file = 'client-photos/photo-162.jpg';
  const crop = { left: 0, top: 155, width: 1600, height: 1045 };
  await responsive('gallery-162', file, { crop, widths: [400, 760], quality: 68, ratio: 4 / 3 });
  await responsive('gallery-162-full', file, { crop, widths: [760, 1280], quality: 72 });
}

// Photos 9, 34 and 43 are the October New police district. The client confirmed the authority cleared publishing
// (answers batch 4, 2026-09-17); the crops still keep police signage, emblems and the marked vehicles out of frame.
// Both armoured vans in the background read "EGYPTIAN POLICE". All three crops are 4:3, so the thumbnail and the
// lightbox show the same picture.
//   9: below the station signs, emblems and flags (y < 250) and right of the van's marking (x 397-435); only an
//      unmarked panel of the van remains. The officer stands among the workers and cannot be cropped without them.
//  34: below the van (y < 170); the bending worker and the walkway carry the frame.
//  43: below the van, the officer and the workers (y < 255): the finished walkway on its own.
for (const [n, crop] of [
  [9, { left: 440, top: 250, width: 840, height: 630 }],
  [34, { left: 150, top: 180, width: 1036, height: 777 }],
  [43, { left: 100, top: 255, width: 936, height: 702 }],
]) {
  const file = `client-photos/photo-${String(n).padStart(3, '0')}.jpg`;
  await responsive(`gallery-${n}`, file, { crop, widths: [400, 760], quality: 68, ratio: 4 / 3 });
  await responsive(`gallery-${n}-full`, file, { crop, widths: [760, 1280], quality: 72 });
}

// ---------- Client photos, batch 2: project 30 (International Coastal Road Development) ----------
// Six 960x1280 portrait WhatsApp photos the client sent for project 30 (2026-09-18), numbered 197-202 in
// docs/photo-triage.xlsx. All crops are 4:3 landscape bands, so the card, the thumbnail and the lightbox show the
// same picture; at 960 px wide they are below the 1200x900 card spec, which is the best these sources allow.
// Project card set (lead first). 202 stops at x=760 so the surveyor at the right edge is left out.
await responsive('project-30-grader', 'client-photos/photo-197.jpg', { crop: { left: 0, top: 300, width: 960, height: 720 }, widths: [480, 800, 960] });
await responsive('project-30-roadbed', 'client-photos/photo-202.jpg', { crop: { left: 0, top: 480, width: 760, height: 570 }, widths: [480, 760] });
await responsive('project-30-tipper', 'client-photos/photo-199.jpg', { crop: { left: 0, top: 330, width: 960, height: 720 }, widths: [480, 800, 960] });
// The rest of the usable photos go to the gallery (201 is rated C: the photographer's shadow is in every crop).
for (const [n, crop] of [
  [198, { left: 0, top: 340, width: 960, height: 720 }],
  [200, { left: 0, top: 330, width: 960, height: 720 }],
]) {
  const file = `client-photos/photo-${n}.jpg`;
  await responsive(`gallery-${n}`, file, { crop, widths: [400, 760], quality: 68, ratio: 4 / 3 });
  await responsive(`gallery-${n}-full`, file, { crop, widths: [760, 1280], quality: 72 });
}

// ---------- Equipment strip (About page): small 4:3 cards in a scroll-snap row, lazy ----------
// The client confirmed the machines in the batch are company-owned (answers batch 2, 2026-09-16), which is what
// the «معداتنا» wording needs. Labels describe only what is visible: no counts, no fleet size, no brand names.
for (const n of [172, 180, 83, 36]) {
  const file = `client-photos/photo-${String(n).padStart(3, '0')}.jpg`;
  await responsive(`equipment-${n}`, file, { widths: [320, 640], quality: 68, ratio: 4 / 3 });
}

// ---------- Logo (client answers batch 8, 2026-09-18: more prominent) ----------
// Source: logo-hires.png, the 1299×945 raster inside the client's logo.pdf (a Photoshop export, not vector). It is the
// same artwork as the old logo.png but cleaner and larger: the mark is 1004×674 px (was 812×447), with the full name
// underneath. Largest clean display size at 2 image px per CSS px: mark ≈ 500×335, full logo ≈ 510×425 CSS px.
// The outer white becomes transparent by flood fill from the edges, so interior whites (the house window) stay.
async function transparentLogo(extract) {
  const { data, info } = await sharp(join(SRC, 'logo-hires.png')).extract(extract).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const isWhite = (i) => data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    const i = p * 4;
    if (!isWhite(i)) continue;
    data[i + 3] = 0;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  return sharp(data, { raw: info }).trim({ threshold: 1 }).png().toBuffer();
}
// Palette PNG is smaller than WebP for this flat artwork, so only PNG is shipped.
async function logoPng(key, buf, height) {
  const meta = await sharp(buf).metadata();
  const width = Math.round((meta.width * height) / meta.height);
  const out = await sharp(buf).resize({ height }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(join(IMG, `${key}.png`));
  manifest[key] = { width, height, png: `img/${key}.png` };
  console.log(`${key} ${width}x${height}  png ${kb(out.size)}`);
}
// Mark only (house, bridge, calligraphy; everything above the tagline, which starts at y = 722): header and footer.
// 192 px tall = 2x the 96 px footer size, and 3x the 64 px header size.
await logoPng('logo', await transparentLogo({ left: 0, top: 0, width: 1299, height: 721 }), 192);
// Full logo with the Arabic and English name: About page, shown ≈ 260 px wide → 2x.
await logoPng('logo-full', await transparentLogo({ left: 0, top: 0, width: 1299, height: 945 }), 432);

// ---------- Favicons (derived from the 368 px icon; no vector source exists) ----------
{
  const icon = join(SRC, 'fav_icon.png');
  const square = async (size, bg) => {
    let img = sharp(icon).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    if (bg) {
      const pad = Math.round(size * 0.1);
      const inner = await sharp(icon).resize(size - 2 * pad, size - 2 * pad, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toBuffer();
      img = sharp({ create: { width: size, height: size, channels: 4, background: bg } }).composite([{ input: inner, gravity: 'center' }]);
    }
    return img.png({ compressionLevel: 9, palette: true }).toBuffer();
  };
  const white = { r: 255, g: 255, b: 255, alpha: 1 };
  writeFileSync(join(PUB, 'apple-touch-icon.png'), await square(180, white));
  writeFileSync(join(PUB, 'icon-192.png'), await square(192, white));
  writeFileSync(join(PUB, 'icon-512.png'), await square(512, white));
  writeFileSync(join(PUB, 'favicon-32.png'), await square(32));

  // favicon.ico with PNG-encoded 16/32/48 entries (supported by all current browsers).
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((s) => square(s)));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = 6 + 16 * sizes.length;
  const dir = sizes.map((s, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    return e;
  });
  writeFileSync(join(PUB, 'favicon.ico'), Buffer.concat([header, ...dir, ...pngs]));
  console.log('favicons written');
}

// ---------- Open Graph image 1200x630: real site photo + the full logo artwork (no rendered text) ----------
{
  const bg = await sharp(join(SRC, 'video-stills/hero-ar.jpg')).resize(1200, 630, { fit: 'cover', position: 'left' }).toBuffer();
  const shade = Buffer.from(
    `<svg width="1200" height="630"><defs><linearGradient id="g" x1="1" x2="0" y1="0" y2="0">
      <stop offset="0" stop-color="#0B1B3F" stop-opacity="0.92"/><stop offset="0.55" stop-color="#0B1B3F" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#0B1B3F" stop-opacity="0.05"/></linearGradient></defs>
      <rect width="1200" height="630" fill="url(#g)"/>
      <rect x="640" y="115" width="500" height="400" rx="24" fill="#ffffff"/>
      <rect x="640" y="507" width="500" height="8" fill="#F07820"/></svg>`);
  const logoArt = await sharp(join(SRC, 'About.jpg')).resize({ width: 440 }).png().toBuffer();
  const { height: lh } = await sharp(logoArt).metadata();
  await sharp(bg)
    .composite([{ input: shade, top: 0, left: 0 }, { input: logoArt, top: Math.round(115 + (392 - lh) / 2), left: 670 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(PUB, 'og-image.jpg'));
  manifest.og = { width: 1200, height: 630, file: 'og-image.jpg' };
  console.log('og-image.jpg written');
}

writeFileSync(join(ROOT, 'src/data/images.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('src/data/images.json written');
