// Generates the company video (full edit with its audio), its poster and the hero stills. Run with `npm run video`.
// Requires ffmpeg with libvpx-vp9, libopus, libx264, aac and libwebp (set FFMPEG=path if it is not on PATH).
//
// The master is NOT in git (286 MB, above GitHub's 100 MB file limit). The default points to the client delivery
// folder; override with VIDEO_MASTER. See source-assets/README.md.
//   VIDEO_MASTER  FINAL.mp4 — 1920×1080 (picture 1920×864 between baked-in grey bars), 50 fps HEVC 10-bit, stereo AAC,
//                 3:12.5 company edit (client delivery 2026-09, video-046 in docs/photo-triage.xlsx). It opens and closes
//                 on the company logo.
//
//   npm run video            everything below
//   npm run video -- final   the company video and its poster only
//   npm run video -- stills  the hero stills only (then run `npm run media`)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const VIDEO_MASTER = resolve(ROOT, process.env.VIDEO_MASTER || 'incoming-photos&videos/FINAL.mp4');
const OUT_DIR = join(ROOT, 'src/assets/video');
const STILLS_DIR = join(ROOT, 'source-assets/images/video-stills');
const CROP = '1920:864:0:108'; // FINAL.mp4 is letterboxed: 108 px bars top and bottom (luma ≈ 11) → 20:9 picture

// The whole edit, with sound (client answers batch 8, 2026-09-18): autoplays muted in the hero from tablet width up,
// and plays with sound on request. Budget chosen by the client after test encodes of the dustiest 20 s: 1280×576
// keeps today's quality at ≈ 17 MB (WebM) / ≈ 21.5 MB (MP4); 960 px would fit ~10 MB but is visibly soft full-width.
// Both stay under Cloudflare Pages' 25 MiB per-file limit, and browsers stream them (range requests).
const FINAL = {
  name: 'final',
  size: { w: 1280, h: 576 },
  vp9: '650k', opus: '64k',
  x264: '800k', aac: '96k',
  poster: 189.5, // the closing logo over the finished road: the frame the video also ends on
};
const STILLS = [
  { t: 93, name: 'hero-ar' }, // grader left of frame → room for RTL text on the right
  { t: 96, name: 'hero-en' }, // grader right of frame → room for LTR text on the left
];
const FPS = 25; // exactly half of the 50 fps master

function ff(args) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (r.error) throw new Error(`Cannot run ffmpeg (${FFMPEG}): ${r.error.message}`);
  if (r.status !== 0) throw new Error(`ffmpeg exited with ${r.status}`);
}

if (!existsSync(VIDEO_MASTER)) throw new Error(`Master not found: ${VIDEO_MASTER} (set VIDEO_MASTER)`);
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(STILLS_DIR, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'elbasha-video-'));
const nullOut = process.platform === 'win32' ? 'NUL' : '/dev/null';

function encode(job) {
  const { w, h } = job.size;
  const vf = `crop=${CROP},scale=${w}:${h}:flags=lanczos,fps=${FPS},format=yuv420p`;
  const input = ['-i', VIDEO_MASTER, '-vf', vf, '-map', '0:v:0'];
  const gop = String(FPS * 5); // a keyframe every 5 s, so "restart from the beginning" and seeking stay cheap

  // Two-pass: pass 1 analyses the picture only; pass 2 writes picture + sound.
  const webm = join(OUT_DIR, `${job.name}.webm`);
  const vp9 = ['-c:v', 'libvpx-vp9', '-b:v', job.vp9, '-minrate', `${Math.round(parseInt(job.vp9) * 0.5)}k`,
    '-maxrate', `${Math.round(parseInt(job.vp9) * 1.5)}k`, '-deadline', 'good', '-cpu-used', '2', '-row-mt', '1',
    '-g', gop, '-passlogfile', join(tmp, `${job.name}-vp9`)];
  console.log(`${job.name}: VP9 pass 1/2…`);
  ff([...input, ...vp9, '-pass', '1', '-an', '-f', 'webm', nullOut]);
  console.log(`${job.name}: VP9 + Opus pass 2/2…`);
  ff([...input, '-map', '0:a:0', ...vp9, '-pass', '2', '-c:a', 'libopus', '-b:a', job.opus, webm]);

  const mp4 = join(OUT_DIR, `${job.name}.mp4`);
  const x264 = ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-b:v', job.x264,
    '-maxrate', `${Math.round(parseInt(job.x264) * 1.5)}k`, '-bufsize', `${parseInt(job.x264) * 2}k`, '-g', gop,
    '-movflags', '+faststart', '-passlogfile', join(tmp, `${job.name}-x264`)];
  console.log(`${job.name}: H.264 pass 1/2…`);
  ff([...input, ...x264, '-pass', '1', '-an', '-f', 'mp4', nullOut]);
  console.log(`${job.name}: H.264 + AAC pass 2/2…`);
  ff([...input, '-map', '0:a:0', ...x264, '-pass', '2', '-c:a', 'aac', '-b:a', job.aac, mp4]);

  const poster = join(OUT_DIR, `${job.name}-poster.webp`);
  ff(['-ss', String(job.poster), '-i', VIDEO_MASTER, '-frames:v', '1',
    '-vf', `crop=${CROP},scale=${w}:${h}:flags=lanczos`, '-c:v', 'libwebp', '-quality', '80', poster]);

  for (const f of [webm, mp4, poster]) console.log(`${f.replace(ROOT, '.')}  ${(statSync(f).size / 1048576).toFixed(2)} MiB`);
  console.log(`${job.name}: ${w}×${h}, ${FPS} fps, full length, with audio`);
}

try {
  const only = process.argv.slice(2);
  if (!only.length || only.includes(FINAL.name)) encode(FINAL);
  if (!only.length || only.includes('stills')) {
    // Full-resolution stills used as hero images and hero video posters (processed further by `npm run media`).
    for (const s of STILLS) {
      ff(['-ss', String(s.t), '-i', VIDEO_MASTER, '-frames:v', '1', '-vf', `crop=${CROP}`, '-q:v', '2', join(STILLS_DIR, `${s.name}.jpg`)]);
    }
    console.log('hero stills: 1920×864 at', STILLS.map((s) => `${s.t}s`).join(', '));
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
