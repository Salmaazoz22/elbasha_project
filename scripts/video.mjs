// Generates the work videos, their posters and the hero stills. Run with `npm run video`.
// Requires ffmpeg with libvpx-vp9, libx264 and libwebp (set FFMPEG=path if it is not on PATH).
//
// Masters are NOT in git (the 1080p master is 286 MB, above GitHub's 100 MB file limit). Defaults point to the
// client delivery folder; override with VIDEO_MASTER / REEL_MASTER. See source-assets/README.md.
//   VIDEO_MASTER  FINAL.mp4 — 1920×1080 (picture 1920×864 between baked-in grey bars), 50 fps company edit (client delivery 2026-09, video-046 in docs/photo-triage.xlsx)
//   REEL_MASTER   reel 1.mp4 — 1080×1920, 50 fps vertical reel (video-047)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const VIDEO_MASTER = resolve(ROOT, process.env.VIDEO_MASTER || 'incoming-photos&videos/FINAL.mp4');
const REEL_MASTER = resolve(ROOT, process.env.REEL_MASTER || 'incoming-photos&videos/reel 1.mp4');
const OUT_DIR = join(ROOT, 'src/assets/video');
const STILLS_DIR = join(ROOT, 'source-assets/images/video-stills');

// Landscape highlight (desktop/tablet). Clean ranges from a 1 fps frame review; the 1080p master is frame-aligned
// with the earlier 1920×864 copy (mean difference < 1 grey level), so the same cut points apply.
// FINAL.mp4 is letterboxed: 108 px bars top and bottom (luma ≈ 11), so the picture is cropped to 1920×864 first.
// Skips the dust transition (~75 s), split-screen blurs (~138–154 s) and the logo fade-out (~187 s).
const HIGHLIGHT = {
  master: VIDEO_MASTER,
  segments: [
    { start: 76.5, end: 112 }, // grader at work under blue sky, incl. wheel/blade close-ups
    { start: 155.5, end: 172 }, // aerial shot along the finished road
  ],
  crop: '1920:864:0:108', // remove the baked-in bars → 20:9 picture
  size: { w: 1280, h: 576 },
  vp9: '1000k', x264: '1100k',
  name: 'highlight',
};
// Vertical reel (phones). Cuts: 0.25 s motion blur at the start; 2.4–5.96 s, where a worker walks past the camera
// with his face visible (no publishing permission yet, see docs/MEDIA_PROPOSAL.md); the whip-pan blur at ~15.5 s;
// and the white logo card from ~17.75 s, so the loop never flashes white inside the dark section. 5.96 s is a scene cut.
const REEL = {
  master: REEL_MASTER,
  segments: [
    { start: 0.5, end: 2.4 }, // grader approaching along the road bed (distant)
    { start: 5.96, end: 15.3 }, // grader passes; blade and wheel close-ups
    { start: 15.7, end: 17.5 }, // grader and a distant surveyor, long lens
  ],
  size: { w: 720, h: 1280 },
  vp9: '2000k', x264: '2300k',
  posterQuality: 60, // phones fetch this poster on page load, next to the hero image
  name: 'reel',
};
const STILLS = [
  { t: 93, name: 'hero-ar' }, // grader left of frame → room for RTL text on the right
  { t: 96, name: 'hero-en' }, // grader right of frame → room for LTR text on the left
];
const FPS = 25; // exactly half of the 50 fps masters

function ff(args) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (r.error) throw new Error(`Cannot run ffmpeg (${FFMPEG}): ${r.error.message}`);
  if (r.status !== 0) throw new Error(`ffmpeg exited with ${r.status}`);
}

for (const m of [VIDEO_MASTER, REEL_MASTER]) {
  if (!existsSync(m)) throw new Error(`Master not found: ${m} (set VIDEO_MASTER / REEL_MASTER)`);
}
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(STILLS_DIR, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'elbasha-video-'));
const nullOut = process.platform === 'win32' ? 'NUL' : '/dev/null';

function encode(job) {
  const { w, h } = job.size;
  const trims = job.segments.map((s, i) => `[0:v]trim=start=${s.start}:end=${s.end},setpts=PTS-STARTPTS[s${i}]`).join(';');
  const filter = `${trims};${job.segments.map((_, i) => `[s${i}]`).join('')}concat=n=${job.segments.length}:v=1:a=0,` +
    `${job.crop ? `crop=${job.crop},` : ''}scale=${w}:${h}:flags=lanczos,fps=${FPS},format=yuv420p[v]`;
  const common = ['-i', job.master, '-filter_complex', filter, '-map', '[v]', '-an'];
  const gop = String(FPS * 5);

  const webm = join(OUT_DIR, `${job.name}.webm`);
  const vp9 = ['-c:v', 'libvpx-vp9', '-b:v', job.vp9, '-minrate', `${Math.round(parseInt(job.vp9) * 0.5)}k`,
    '-maxrate', `${Math.round(parseInt(job.vp9) * 1.5)}k`, '-deadline', 'good', '-cpu-used', '2', '-row-mt', '1',
    '-g', gop, '-passlogfile', join(tmp, `${job.name}-vp9`)];
  console.log(`${job.name}: VP9 pass 1/2…`);
  ff([...common, ...vp9, '-pass', '1', '-f', 'webm', nullOut]);
  console.log(`${job.name}: VP9 pass 2/2…`);
  ff([...common, ...vp9, '-pass', '2', webm]);

  const mp4 = join(OUT_DIR, `${job.name}.mp4`);
  const x264 = ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-b:v', job.x264,
    '-maxrate', `${Math.round(parseInt(job.x264) * 1.5)}k`, '-bufsize', `${parseInt(job.x264) * 2}k`, '-g', gop,
    '-movflags', '+faststart', '-passlogfile', join(tmp, `${job.name}-x264`)];
  console.log(`${job.name}: H.264 pass 1/2…`);
  ff([...common, ...x264, '-pass', '1', '-f', 'mp4', nullOut]);
  console.log(`${job.name}: H.264 pass 2/2…`);
  ff([...common, ...x264, '-pass', '2', mp4]);

  // Poster = first frame of the cut, so nothing jumps when playback starts.
  const poster = join(OUT_DIR, `${job.name}-poster.webp`);
  ff(['-ss', String(job.segments[0].start), '-i', job.master, '-frames:v', '1',
    '-vf', `${job.crop ? `crop=${job.crop},` : ''}scale=${w}:${h}:flags=lanczos`, '-c:v', 'libwebp', '-quality', String(job.posterQuality ?? 80), poster]);

  const duration = job.segments.reduce((a, s) => a + s.end - s.start, 0);
  for (const f of [webm, mp4, poster]) console.log(`${f.replace(ROOT, '.')}  ${(statSync(f).size / 1048576).toFixed(2)} MiB`);
  console.log(`${job.name}: ${w}×${h}, ${FPS} fps, ≈ ${duration.toFixed(1)} s, no audio`);
}

try {
  // `npm run video -- highlight` re-encodes one job only; stills are always refreshed.
  const only = process.argv.slice(2);
  for (const job of [HIGHLIGHT, REEL]) if (!only.length || only.includes(job.name)) encode(job);
  // Full-resolution stills used as hero images (processed further by `npm run media`).
  for (const s of STILLS) {
    ff(['-ss', String(s.t), '-i', VIDEO_MASTER, '-frames:v', '1', '-vf', `crop=${HIGHLIGHT.crop}`, '-q:v', '2', join(STILLS_DIR, `${s.name}.jpg`)]);
  }
  console.log('hero stills: 1920×864 at', STILLS.map((s) => `${s.t}s`).join(', '));
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
