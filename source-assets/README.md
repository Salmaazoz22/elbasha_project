# source-assets — originals (NOT deployed)

Original files from the first upload (commit `9123227`, tag `original-upload`).
Nothing in this folder is copied to `dist/`, so nothing here is published.

| Folder | Contents |
|---|---|
| `images/` | Original logo, favicon and project photos. `npm run media` generates optimised web versions into `src/assets/img/` and `src/public/`. |
| `images/client-photos/` | Byte-identical copies of the client photos used on the site (numbers as in `docs/photo-triage.xlsx`). |
| `video/` | `Final.mp4` (70.5 MiB, 1920×864, 3:12): the first copy of the company edit, kept for history. No longer used by the scripts. |

**Video masters outside git.** Since 2026-09-16 `npm run video` reads the higher-quality masters from the client delivery:
`FINAL.mp4` (video-046, 1920×1080 with baked-in bars around a 1920×864 picture, 286 MB) and `reel 1.mp4` (video-047, 1080×1920, 52 MB).
The first is above GitHub's 100 MB limit, so both stay in the git-ignored `incoming-photos&videos/` folder (or wherever
`VIDEO_MASTER` / `REEL_MASTER` point). Keep a backup of both files outside this machine.

Do not delete these files without client approval.

Unused originals (`reel 1.mp4`, `slider1–3.jpg`, `مصانع الطوب.txt`) were moved to the git-ignored `/archive` folder at the repository root (client decision, 2026-09-15). They exist only on the machine where the move was made, and in git history at tag `original-upload`.
