// Generates the web highlight video, its poster and the hero stills from the
// master file in source-assets/. Run with `npm run video`.
// Requires ffmpeg with libvpx-vp9, libx264 and libwebp (set FFMPEG=path if it is not on PATH).
import { spawnSync } from 'node:child_process';
import { mkdirSync, statSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const MASTER = join(ROOT, 'source-assets/video/Final.mp4');
const OUT_DIR = join(ROOT, 'src/assets/video');
const STILLS_DIR = join(ROOT, 'source-assets/images/video-stills');

// Clean ranges picked from a 1 fps frame review of Final.mp4 (3:12).
// Skips the dust transition (~75 s), split-screen blurs (~138–154 s) and the logo fade-out (~187 s).
const SEGMENTS = [
  { start: 76.5, end: 112 }, // grader at work under blue sky, incl. wheel/blade close-ups
  { start: 155.5, end: 172 }, // aerial shot along the finished road
];
const SIZE = { w: 1280, h: 576 }; // keeps the master's 20:9 aspect ratio
const STILLS = [
  { t: 93, name: 'hero-ar' }, // grader left of frame → room for RTL text on the right
  { t: 96, name: 'hero-en' }, // grader right of frame → room for LTR text on the left
];

function ff(args) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (r.error) throw new Error(`Cannot run ffmpeg (${FFMPEG}): ${r.error.message}`);
  if (r.status !== 0) throw new Error(`ffmpeg exited with ${r.status}`);
}

const trims = SEGMENTS.map((s, i) => `[0:v]trim=start=${s.start}:end=${s.end},setpts=PTS-STARTPTS[s${i}]`).join(';');
const filter = `${trims};${SEGMENTS.map((_, i) => `[s${i}]`).join('')}concat=n=${SEGMENTS.length}:v=1:a=0,` +
  `scale=${SIZE.w}:${SIZE.h}:flags=lanczos,fps=30000/1001,format=yuv420p[v]`;
const common = ['-i', MASTER, '-filter_complex', filter, '-map', '[v]', '-an'];

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(STILLS_DIR, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'elbasha-video-'));
const nullOut = process.platform === 'win32' ? 'NUL' : '/dev/null';

try {
  const webm = join(OUT_DIR, 'highlight.webm');
  const vp9 = ['-c:v', 'libvpx-vp9', '-b:v', '950k', '-minrate', '450k', '-maxrate', '1450k',
    '-deadline', 'good', '-cpu-used', '2', '-row-mt', '1', '-g', '150', '-passlogfile', join(tmp, 'vp9')];
  console.log('VP9 pass 1/2…');
  ff([...common, ...vp9, '-pass', '1', '-f', 'webm', nullOut]);
  console.log('VP9 pass 2/2…');
  ff([...common, ...vp9, '-pass', '2', webm]);

  const mp4 = join(OUT_DIR, 'highlight.mp4');
  const x264 = ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-b:v', '1050k', '-maxrate', '1600k',
    '-bufsize', '2100k', '-g', '150', '-movflags', '+faststart', '-passlogfile', join(tmp, 'x264')];
  console.log('H.264 pass 1/2…');
  ff([...common, ...x264, '-pass', '1', '-f', 'mp4', nullOut]);
  console.log('H.264 pass 2/2…');
  ff([...common, ...x264, '-pass', '2', mp4]);

  // Poster = first frame of the cut, so nothing jumps when playback starts.
  const poster = join(OUT_DIR, 'highlight-poster.webp');
  ff(['-ss', String(SEGMENTS[0].start), '-i', MASTER, '-frames:v', '1',
    '-vf', `scale=${SIZE.w}:${SIZE.h}:flags=lanczos`, '-c:v', 'libwebp', '-quality', '80', poster]);

  // Full-resolution stills used as hero images (processed further by `npm run media`).
  for (const s of STILLS) {
    ff(['-ss', String(s.t), '-i', MASTER, '-frames:v', '1', '-q:v', '2', join(STILLS_DIR, `${s.name}.jpg`)]);
  }

  for (const f of [webm, mp4, poster]) {
    console.log(`${f.replace(ROOT, '.')}  ${(statSync(f).size / 1048576).toFixed(2)} MiB`);
  }
  const total = SEGMENTS.reduce((a, s) => a + s.end - s.start, 0);
  console.log(`Duration ≈ ${total.toFixed(1)} s`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
