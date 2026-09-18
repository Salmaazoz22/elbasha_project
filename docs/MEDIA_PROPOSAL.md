# Al-Basha — Media Proposal (client photos & videos, batch 1)

**Date:** 2026-09-15 · **Updated:** 2026-09-16 (client answers batch 2) · **Status:** ideas 1–4 and 6 are built; idea 5 is deferred and idea 7 still waits on the client's project numbers. See [§5 Build log](#5-build-log--what-was-built-2026-09-16) for exactly what shipped, what changed against this proposal, and what is still waiting on the client.
**Source:** `incoming-photos&videos/` (git-ignored, originals untouched). Working copies are in `media-work/` (git-ignored).
**Companion files:**
- [`media-mapping.csv`](media-mapping.csv) — new names ↔ original names, sizes, SHA-256
- [`photo-triage.xlsx`](photo-triage.xlsx) — one row per item, with thumbnails and ratings
- `photo-triage.pdf` — Arabic contact sheet for the client (not committed)

**Hard rules still apply:**
- No invented business data.
- A photo appears on a **project card** only after the client confirms which project it shows.
- Faces need publishing permission.

---

## 1. What we received

| | Files | Distinct | Rated A | Rated B | Rated C |
|---|---|---|---|---|---|
| Photos | 196 | **115** (81 exact duplicates) | **7** | 49 | 59 (+81 duplicates) |
| Videos | 47 | 43 (4 duplicates or re-encodes) | **2** | 34 | 11 |

**Technical reality**

*Photos*
- All 196 are WhatsApp copies: no EXIF, JPEG quality ≈ 71, longest side ≤ 1600 px.
- The strongest photos (graders, roads) are **1280×720**. They're fine for cards, backgrounds with an overlay, and galleries, but **no photo is sharp enough for a full-width 1920 px hero**.
- 7 photos are byte-identical to images already on the site or archived: 032, 108, 122, 154, 171, 179, and 164 (the archived `slider3.jpg`).

*Videos*
- 45 of the 47 are WhatsApp copies at about 478×850 / 848×478. They're usable as short, small clips, not as large backgrounds.
- **Two are masters:**
  - **video-046** (`FINAL.mp4`): 1920×1080, 50 fps, HEVC, 12.5 Mb/s, 3:12.5. This is a much better copy of the edit the site currently uses (a 1920×864, 2.9 Mb/s file), and it includes aerial shots.
  - **video-047** (`reel 1.mp4`): 1080×1920 vertical, 50 fps, 22.7 s, ending on the logo card.

**Coverage by likely section** (guessed from content; *the client must confirm*):

| Section | Distinct photos (A/B/C) | Videos (A/B/C) | Comment |
|---|---|---|---|
| Roads & infrastructure | 7 / 20 / 17 | 2 / 28 / 8 | Strong: grading, graders, loaders, rollers, concrete slopes, one asphalt-and-markings drive |
| Development & maintenance | 0 / 27 / 37 | 0 / 0 / 0 | Many curb & interlock photos, mostly average light; several show police sites |
| Bridges & axes | 0 / 2 / 1 | 0 / 1 / 0 | Only retaining walls under a flyover (stamped) and slope protection under a bridge |
| Brick factories | 0 / 0 / 0 | 0 / 5 / 3 | Only low-resolution interior clips (steel sheds, rebar, formwork); no exterior or finished factory |
| Unclear | 0 / 0 / 4 | — | Includes 2 photos with another photographer's watermark |

**Coverage by subject** (distinct photos + videos; an item can have several subjects): earthworks & grading 52 · equipment 44 · curb & interlock 42 · workers 21 · materials & trucks 19 · concrete slopes 8 · buildings & factories 8 · surveying 6 · curb painting 3 · excavation & trenching 3 · retaining walls 3 · bridge 3 · barriers 2 · asphalt & road marking 2 · aerial 2 (video-046, plus one watermarked photo) · **road signs 0 · bridge painting 0 · asphalt paving in progress 0**.

**Duplicates and near-duplicates**
- **Exact copies:** 81 photos (the `_1` files) and 1 video (005 = 004).
- **Re-encoded video copies:** 014≈003, 028≈006, 042≈013.
- **Near-duplicate photo groups** (keep the first, which is the one rated A or B):

| Kept | Near-duplicates |
|---|---|
| 177 | 179 |
| 184 | 185, 186, 171 |
| 172 | 191 |
| 164 | 190 |
| 167 | 168, 175, 176 |
| 169 | 170, 174, 189 |
| 183 | 187 |
| 045 | 049 |
| 018 | 020 |
| 052 | 058, 068 |
| 056 | 064 |
| 099 | 106, 132 |
| 142 | 148, 150 |

**Never publish without a decision from the client**

| Item | Problem |
|---|---|
| 047, 054, 056, 060, 062, 064, 070, 087, 110, 118, 140 | Police stations, police vehicles, checkpoints or guard towers |
| 162, 165 | Another photographer's watermark; landscape doesn't match the company's work |
| video-016 | A third-party company logo ("SG … Group") on a surveyor's vest, plus a clear face |
| 154, 156, 158 | Printed "Ahmed A.B · 20 February 2024" camera stamps |
| 017 | Military personnel |

## 2. Curation summary

### A-rated (the only items that should carry large placements)

| Item | Why it is A | Best use |
|---|---|---|
| **video-046** | 1920×1080 50 fps master of the company edit; cinematic ground and aerial shots | Hero stills or loop, re-cut work video |
| **video-047** | 1080×1920 50 fps vertical reel with logo end card | Mobile version of the work video |
| **photo-177** | Grader on red earth under a cloudy sky; strong subject and colour | Featured card, CTA or section background |
| **photo-178** | Grader with a surveyor holding a range pole; shows execution plus survey control | About page, "Road construction" service |
| **photo-184** | Long graded road with leading lines to a grader on the horizon | Section / page-hero background |
| **photo-172** | Sharp CAT grader portrait | Equipment strip, service card |
| **photo-164** | Clean graded road beside a dune | Background with navy overlay |
| **photo-160** | Diagonal concrete slope panels against the sky | "Concrete slopes & New Jersey barriers" service |
| **photo-120** | Dump truck tipping, with dust | "Material supply" service |

### Why most items are C

| Reason | Items |
|---|---|
| Exact duplicates | 81 photos |
| Near-duplicates or re-encoded copies of a better item | 16 photos, 4 videos (incl. exact copy 005) |
| Security-sensitive content | 11 photos |
| Tilted, sun-in-frame, shadow or car interior | 018, 024, 089, 116, 146, 188, videos 002, 017, 035 |
| People in the foreground who can't be cropped out | 017, 026, 039, 041, 054, 114, 138, videos 032, 036 |
| Third-party branding, decals or watermarks | 072, 079, 081, 112, 162, 165, video-016 |
| Flat, hazy or cluttered, with no clear subject | 005, 022, 030, 052, 077, 085, 091, 097, 099, 104, 144, 173, 181, 194 |
| Stamp that can't be cropped | 156 |

Each item's one-line reason is in `photo-triage.xlsx`.

---

## 3. Proposal: how this material can make the site better

Every idea below stays static, free and fast:
- Media is self-hosted.
- Videos are compressed, muted, lazy-loaded, have a poster, and pause for `prefers-reduced-motion`.
- Images are responsive WebP + JPEG with explicit sizes.
- Nothing ships without the client's confirmation where a project or a face is involved.

### Idea 1 — Rebuild the hero stills and the work video from the high-quality master · **P0** · ✅ built

**What it needs:**
- video-046 as the source for:
  - 2 new hero stills (Arabic and English versions, subject framed to leave room for the text);
  - a re-encode of the existing 52 s highlight at the same byte budget;
  - the poster frame.
- video-047 as a vertical 9:16 variant for phones.

**What it adds:**
- The current hero stills and highlight come from a 2.9 Mb/s, 1920×864 file. The new master has 4× the bitrate and full 16:9 framing, so the same 6 MB budget will look visibly sharper.
- A portrait reel on phones fills the screen instead of a letterboxed strip.

**Performance cost:**
- **Zero or negative.** Same byte budget.
- Hero stills stay at WebP 1920/1280/960 (≈60–110 KB).
- The phone reel is ~3–4 MB (720×1280, VP9 + H.264), loaded only when scrolled into view on narrow screens (via `<source media>`); desktops never download it.

**Checks:**
- The aerial segments must be confirmed as the company's own footage, since the edit already carries their logo.
- The split-screen blur transitions at 138–154 s must be skipped again.

```
Phone (≤ 48em)                 Desktop
┌───────────────────┐          ┌──────────────────────────────────────────────┐
│ [9:16 reel 047]   │          │  من أعمالنا في الموقع                         │
│  muted · loop     │          │ ┌──────────────────────────────────────────┐ │
│  poster frame     │          │ │ 16:9 highlight re-cut from video-046     │ │
│ [⏸ إيقاف الفيديو] │          │ │ poster · lazy · pause button             │ │
└───────────────────┘          │ └──────────────────────────────────────────┘ │
                               └──────────────────────────────────────────────┘
```

### Idea 2 — Image-led "featured services" row plus section backgrounds · **P1** · ✅ built

**What it needs:**
- Featured services (4 large image cards):

  | Service | Photo |
  |---|---|
  | Road construction | **177** or **178** |
  | Concrete slopes & New Jersey barriers | **160** (alternative 124) |
  | Material supply | **120** |
  | Curb & interlock | best B from 045 / 102 / 095 / 101 |

- The other 6 services keep their icon cards. We have no usable photos for signs, bridge painting or brick factories, and road marking only in low-resolution video.
- Section backgrounds, all with a navy overlay (text contrast unchanged):

  | Placement | Photo |
  |---|---|
  | CTA band | **184** |
  | Projects page hero | **164** |
  | About page hero | **177** |

**What it adds:**
- The services section stops looking like a generic icon list. The four most visual services get real site photos, and the page gains depth without fake stock.

**Performance cost:**
- 4 card images at 480/800 w WebP (≈30–60 KB each), lazy-loaded.
- Page-hero backgrounds on inner pages become the LCP image. They load eagerly with `fetchpriority="high"`: ≈70–110 KB at 1280 w (1280×720 sources, never upscaled beyond that).
- About +1 image.

**Rule:** service images show the *type of work*, with neutral alt text describing what is visible. No project names.

```
خدماتنا
┌─────────────────────┬─────────────────────┐
│  [photo 177]        │  [photo 160]        │   ← 4 featured image cards
│  بناء الطرق          │  الميول والنيوجيرسي  │     (2×2 on phones)
├─────────────────────┼─────────────────────┤
│  [photo 120]        │  [curb & interlock] │
│  توريد المواد        │  بردورة وإنترلوك     │
└─────────────────────┴─────────────────────┘
┌──────┬──────┬──────┬──────┬──────┬──────┐
│ icon │ icon │ icon │ icon │ icon │ icon │     ← remaining 6 services as today
└──────┴──────┴──────┴──────┴──────┴──────┘
```

### Idea 3 — "من مواقعنا" gallery with subject filters and a lightbox · **P1** · ✅ built

**What it needs:**
- B- and A-rated distinct photos, grouped by **subject** rather than project:

  | Filter | Candidate photos |
  |---|---|
  | الطرق والتسوية (roads & grading) | 164, 177, 178, 184, 012, 136, 142, 169, 182, 183 |
  | البردورة والإنترلوك (curb & interlock) | 045, 102, 095, 101, 043, 038, 014, 076, 093, 196 |
  | الميول والحواجز (slopes & barriers) | 160, 124, 152 |
  | المعدات (equipment) | 172, 180, 126, 130, 134, 015 |

- 24–30 images in total, after the client's face permissions (faces in 009, 034, 043, 083, 095).

**What it adds:**
- Real proof of work at scale, without claiming project names.
- Later, when the client maps photos to projects in the triage PDF, the same images can move onto project cards (the 23 empty ones) with correct captions.

**Implementation:**
- A static grid; filter chips are buttons (`aria-pressed`) that show or hide items with no page reload.
- The lightbox uses the native `<dialog>`: arrow keys and Escape work, focus returns to the thumbnail, and swipe on touch.
- Without JavaScript, the thumbnails link to the full image.

**Performance cost:**
- Thumbnails at 400/600 w WebP (≈20–35 KB each), `loading="lazy"`.
- The full 1280 w image (≈80–120 KB) loads only when opened.
- JavaScript under 3 KB.
- Nothing above the fold on page load.

**Where:** a new section on `/projects/` (below the categories), or its own page `/gallery/` with a link from the home page.

```
/projects/  (below the 4 project categories)
من مواقعنا
[ الكل ] [ الطرق والتسوية ] [ البردورة والإنترلوك ] [ الميول والحواجز ] [ المعدات ]
┌────┬────┬────┬────┐
│ 177│ 184│ 045│ 160│   ← lazy thumbnails, 4 / 3 / 2 columns
├────┼────┼────┼────┤
│ 102│ 172│ 124│ 095│
└────┴────┴────┴────┘
          ↓ click
┌──────────────────────────────┐
│  ‹   [ full 1280 w image ]  › │   <dialog> lightbox · Esc · ← →
│      وصف ما يظهر في الصورة    │   caption = visible content only
└──────────────────────────────┘
```

### Idea 4 — About page imagery · **P1** · ✅ built

**What it needs:**
- **178** (grader plus surveyor) as the About photo. It replaces the logo card that is currently hidden on phones.
- Optionally **184** as the About page-hero background.

**What it adds:** a human, on-site image beside the company paragraph, instead of repeating the logo.

**Performance cost:** one lazy image (≈60–90 KB).

**Needs:** the client's confirmation that the photo may be used generally, since no person is identifiable.

### Idea 5 — "Work in progress" clip wall from the short videos · **P2** · ⏸ not built

**What it needs:** 4–6 very short (3–4 s) muted loops cut from B-rated clips:

| Clip | Source video |
|---|---|
| Asphalt with fresh markings | **010** |
| Road-marking machine | **031** (only after face permission) |
| Concrete slope pouring | **044** / **041** |
| Slope protection under a bridge | **029** |
| Vibratory roller | **039** |
| Grader close-up | **026** / **037** |

**What it adds:**
- Motion and variety, and the only footage of asphalt, road marking and slope-concrete work.
- It shows services that have no good photos.

**Performance cost:**
- Each loop is re-encoded at its native low resolution (≈480 px, ~250–400 KB).
- Only the loops in view play; the rest keep their posters.
- Reduced motion shows stills only.
- Total ~2 MB, loaded only when the section is reached.

**Risk:** low resolution means the tiles must stay small (≤ 360 px). Any larger looks soft.

```
مشاهد من التنفيذ
┌──────┬──────┬──────┐
│ 010  │ 044  │ 039  │   small muted loops (poster until visible)
├──────┼──────┼──────┤
│ 029  │ 026  │ 031* │   * only with face permission
└──────┴──────┴──────┘
```

### Idea 6 — Equipment / capabilities strip · **P2** · ✅ built (2026-09-16)

**What it needs:**

| Equipment | Source |
|---|---|
| Grader | **172** |
| Bulldozer | 126 |
| Excavator | 134 |
| Loader | frame from video-025 |
| Roller | frame from video-039 |
| Dump truck | **120** |
| Concrete mixer | 124 |

**What it adds:** a quick visual of capability.

**Blocker (resolved 2026-09-16):** captions like «معداتنا» (our equipment) are a **business claim**, so the strip
needed to know whether the company owns these machines or rents them. The client confirmed in answers batch 2 that
the equipment in the photo and video batch is **company-owned**, which is what allows the «معداتنا» / "Our Equipment"
wording. Labels still describe only what is in the frame: no counts, no fleet size and no maker's name, even where
one is legible on the machine.

**What was actually built, and why it differs from the table above:** four photo cards — **172** (grader), **180**
(grader with the operator in the cab), **83** (wheel loader) and **36** (plate compactor) — in a scroll-snap row on
the **About** page, below "Our Expertise". The proposal's other sources did not survive a second look:

- **Frames from video-025 and video-039** were dropped. Those masters are **848×478**, and the extracted frames are
  960×542 upscales — too soft next to a 1280×720 photo. `ffmpeg` is also no longer installed on the build machine,
  so fresh frames could not be pulled anyway.
- **126 (bulldozer), 134 (excavator), 120 (dump truck) and 124 (mixer)** were left out: 126 and 134 are already
  gallery items, 120 is already the material-supply service card, and 124 was dropped during the gallery build for
  identifiable faces, a "CIFA" logo and a readable plate.
- **172 and 180 moved out of the gallery** into the strip, so no photo appears twice on the site. The gallery stayed
  at 22 items because 95 and the cropped 162 took their place.

**Performance cost:** 7 small images (≈20–30 KB each), lazy, in a horizontal scroll-snap row with no JavaScript.

```
المعدات في مواقع العمل   ← wording depends on the client's answer
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐  → scroll-snap
│ 172  ││ 126  ││ 134  ││ v025 ││ v039 ││ 120  │
│جريدر ││بلدوزر││ حفار ││ لودر ││ هراس ││ قلاب │
└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘
```

### Idea 7 — Fill the 23 empty project cards · **P0 as a process, not a build** · ⏸ waiting on the client

**What it needs:**
- The client's answers in `photo-triage.pdf` ("صورة 177 = مشروع 5").
- Then the photo pipeline (`scripts/media.mjs`) and a `projects.json` update.

**What it adds:** real photos on project cards — the audit's main content gap.

**Current state:**
- **2026-09-18:** the first card is filled. The client sent media batch 2 for project 30, so it is attributed without guessing (§7).
- No batch-1 item can be placed yet.
- Roads photos probably belong to the Asyut Western Road / Future of Egypt / October projects, but that is a guess, and the rule says no guessing.
- Several curb and interlock photos show police sites and must not be used, whatever project they belong to.

### Not recommended

- **Hero background video loop** from video-046: a nice effect, but it adds ~2–3 MB and competes with the LCP image. Better stills (Idea 1) get ~90% of the effect for 0 KB. Revisit only if the client insists. (P2)
- **Any use of the 11 police or security images, the watermarked photos 162/165, or video-016**, regardless of quality.
- **Upscaling 1280×720 photos to 1920 px** for a full hero: they would look soft on large screens.

## 4. Order of work if approved

| Step | Work | Depends on |
|---|---|---|
| 1 | Send `photo-triage.pdf`; ask for project numbers, face permissions, and the source of 162/165 and video-016 | — |
| 2 | **Idea 1** (hero stills + work video from video-046/047) | — |
| 3 | **Idea 2** (featured services + backgrounds) and **Idea 4** (About image) | — |
| 4 | **Idea 3** (gallery) | Face permissions |
| 5 | **Idea 7** (project cards) | Client's project mapping |
| 6 | **Ideas 5 and 6** | Client decisions |

Each step keeps the current QA gates:
- `npm run build` checks;
- axe with 0 violations;
- no horizontal overflow;
- Lighthouse mobile ≥ 90;
- reduced-motion behaviour verified.

---

## 5. Build log — what was built (2026-09-16)

Client approval: build ideas 1–4, skip the equipment strip (idea 6) until ownership is confirmed.
Hard exclusions kept throughout: police and military sites (047, 054, 056, 060, 062, 064, 070, 087, 110, 118, 140, 017),
the watermarked photos 162 and 165, the stamped 154/156/158, the flagged face items (009, 034, 043, 083, 095, video-031),
video-016, and anything with third-party logos, decals or plates (007, 011, 072, 079, 081, 112).

| Step | Commit | What shipped |
|---|---|---|
| 1 — hero video and stills | `33afc73`, `a86e607` | Highlight re-cut from FINAL.mp4 (1280×576, 52 s, WebM 6.23 MiB + MP4 6.83 MiB), phone reel from `reel 1.mp4` (720×1280, 13 s, WebM 3.12 MiB + MP4 3.57 MiB), both posters, and new hero stills |
| 2 — services and backgrounds | `8c76cca` | Four photo service cards (177, 120, 014, 160) and three backdrop photos under the navy overlay (CTA 184, projects hero 164, about hero 177) |
| 3 — gallery | `edd79cd` | "من مواقعنا / From our sites" on `/projects/`: 22 photos, 4 subject filters, `<dialog>` lightbox, lazy thumbnails |
| 4 — About imagery | `a7e615c` | Photo 178 next to the company paragraph, replacing the logo card |
| 5 — equipment strip | — | Deliberately skipped (see idea 6) |

### Changes against the proposal, and why

- **FINAL.mp4 is letterboxed.** The 1920×1080 master has 108 px grey bars top and bottom; its actual picture is
  1920×864, exactly the frame of the older master. So the promised "full 16:9 framing" does not exist — the bars are
  cropped off and the output keeps the 20:9 frame at a higher bitrate. The gain is image quality, not framing.
- **The phone reel is cut, not just trimmed.** Between 2.4 s and 5.96 s a worker walks past the camera with his face
  clearly visible. The triage sheet had video-047 marked "no faces", which was wrong. Those seconds are cut, so the
  reel runs 13 s instead of 17 s. If the client gets that worker's permission, the segment can go back in.
- **Landscape phones keep the landscape video.** A 9:16 reel in a sideways phone is tiny, so the `<source media>`
  query is `(min-width: 48em), (orientation: landscape)`.
- **Curb & interlock service card: photo 014, cropped.** The full frame shows two workers with visible faces; the card
  uses the lower part of the frame (paving only) and the full photo is **not** in the gallery.
- **Material supply card: photo 120.** The truck carries a decorative "FULLOPTION" decal and an "M I S" marking. They
  are illegible at card size, but they are third-party text on a vehicle we do not know the owner of. Flag it if the
  client would rather not show that truck: `[[NEEDS_CLIENT: is the tipper in photo 120 the company's own truck?]]`.
- **Gallery is 22 photos, not 24–30.** Four candidates were dropped after a second look at full size, because faces
  are identifiable: 003, 014, 124 (also a "CIFA" mixer logo and a readable plate) and 196 (also a branded truck).
  Photos already used elsewhere on the site (164, 177, 120) are not repeated in the gallery.
- **No project attribution anywhere.** Every gallery item has an empty `"project"` field in `src/data/gallery.json`,
  waiting for the client's answers. The 23 photo-less project cards are unchanged.

### Performance after the build

Mobile Lighthouse (median of 3 runs, `http://127.0.0.1:4173`, the gate is ≥ 90):

| Page | Before the media build | After | LCP after | CLS after | Page weight after |
|---|---|---|---|---|---|
| Home ar / en | 90 / 92 | **92 / 93** | 2.40 s / 2.36 s | 0 / 0 | 284 / 255 KiB |
| Projects ar / en | 92 / 95 | **94 / 96** | 1.96 s / 1.75 s | 0.001 / 0 | 173 / 142 KiB |
| About ar / en | 96 / 95 | **93 / 96** | 2.13 s / 1.94 s | 0 / 0 | 202 / 171 KiB |
| Contact ar / en | 99 / 96 | **99 / 97** | 1.74 s / 1.57 s | 0 / 0 | 95 / 64 KiB |
| 404 | 100 | **100** | 1.73 s | 0 | 91 KiB |

Desktop stays at 99–100 on every page. The video files themselves are not in these numbers: they load only when the
video scrolls into view, and the gallery's full-size photos only when a thumbnail is opened.

Two performance fixes were needed along the way, both recorded in the commits: the phone poster was re-encoded at
quality 60 (86 KB → 58 KB) because it loads next to the hero image, and the two About buttons now stack on phones,
because side by side they fit with the fallback font but wrap once Cairo loads (a 0.095 layout shift).

### Still pending

| # | Item | Blocked on |
|---|---|---|
| 1 | Photos on the 23 empty project cards (idea 7) | The client's project numbers in `photo-triage.pdf` |
| 2 | Filling the `"project"` field of the 22 gallery items | Same answers |
| 3 | Clip wall from the short videos (idea 5) | Deferred by the client on 2026-09-16; the sources are 848×478 and `ffmpeg` is no longer installed |
| 4 | Putting the cut 2.4–5.96 s back into the phone reel | Permission from the worker shown |
| 5 | Photos 9, 34 and 43 (October New police district) | **New question, item 36 of `CLIENT_REQUESTS.md`.** Face permission was granted but does not cover the site |
| 6 | Photo 165 | Published only if cropped, and the mark cannot be cropped cleanly — see below |
| 7 | 154 / 156 / 158 | Only usable cropped; confirm the crops are acceptable |
| 8 | A proper About photo (team, fleet or office) | Client; photo 178 is the interim |
| 9 | Whether photo 120's tipper is the company's own truck | Client |

---

## 6. Build log — client answers batch 2 (2026-09-16)

The client answered five things: video-046 and its aerial footage are the company's own; all equipment in the batch
is company-owned; the six face items are cleared for publishing; 162 and 165 are company work with publishing
rights (crop the photographer's mark if it can be done cleanly); video-016's "SG" logo is a partner contractor and
is cleared; and the Facebook and LinkedIn links on the site are correct and complete.

| What shipped | Detail |
|---|---|
| Equipment strip (idea 6) | «معداتنا» / "Our Equipment" on the About page: photos 172, 180, 83 and 36 in a scroll-snap row |
| Gallery additions | **95** (worker bedding hexagonal pavers, face now cleared) and **162** (aerial interchange, cropped) |
| Gallery removals | **172** and **180** moved into the equipment strip, so the gallery holds at 22 items |
| Hero | Unchanged. The client confirmed video-046 and its aerial shots are the company's own, so the current stills stay and the request for a replacement hero image was dropped from `CLIENT_REQUESTS.md` |

### Judgement calls, and why

- **Photos 9, 34 and 43 were not published, despite the face permission.** All three were taken at one site: the
  October New police district. Photo 9 shows the building signed «منطقة شرطة المصانع» and «مأمورية أكتوبر الجديدة»
  with the Ministry of Interior emblem, a marked "شرطة مصر / EGYPTIAN POLICE" vehicle and a uniformed officer; 34
  shows the same vehicle and compound; 43 is the same walkway, barrel, worker and officer. The standing exclusion is
  **police and military sites**, and permission from the workers does not lift it. They are now item 36 of
  `CLIENT_REQUESTS.md`, which asks whether the authority itself has cleared the work, and for alternative photos of
  the same curb-and-interlock work at another site.
- **162 was cropped; 165 was not published.** On 162 the "AT Photography" mark sits in the top band (x 745–862,
  y 42–142 of the 1600×1200 frame) over distant fields, so the top 155 px come off and the composition is untouched.
  On 165 the same mark sits mid-right **over the bridge railing**: removing it costs ~12% of the width and the
  railing sweep with it. The client's own rule was "crop it out if it can be done cleanly, otherwise leave it out".
- **video-016 was cleared but not used.** The only place a short clip would go is the idea-5 clip wall, which is not
  built, so it has no home yet. Same for video-031, whose faces are also now cleared.
- **The triage records observation, not permission.** `faces` and `text` in `photo-triage.xlsx` still say what is
  actually in each frame; a new **"Client clearance (batch 2)"** column carries the permission, and the client-facing
  `photo-triage.pdf` simply stops asking the settled questions. Its last page now asks the one open question.

### Checks after this batch

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass |
| Horizontal overflow, 8 pages × 320/360/390/768/1280/1920 px | ✅ `scrollWidth === clientWidth` everywhere |
| Equipment row at 390 px | ✅ scrolls inside itself (4 cards, 251 px each); it does not push the page |
| Lighthouse | Not re-run. See the note in `QA_REPORT.md` §15e |

---

## 7. Build log — media batch 2: project 30 (2026-09-18)

With client answers batch 6 the client added projects 29–32 and sent six WhatsApp photos for **project 30,
International Coastal Road Development** (`incoming-photos&videos/batch2/`). They were triaged with the batch-1
method (same metrics, computed on a 1024 px thumbnail; same A/B/C scale) and numbered **197–202** in send order in
`photo-triage.xlsx`, where the "Project #" column now reads 30 for all six.

| # | What it shows | Rating | Use |
|---|---|---|---|
| 197 | Grader levelling red earth beside the live carriageway | A | **Project card, lead photo** |
| 202 | The graded road bed, machines at the far end; a surveyor at the right edge | B | **Project card**, cropped to x < 760 so the surveyor (face in profile) is left out |
| 199 | Tipper trailer unloading earth in a cloud of dust | A | **Project card** |
| 198 | Water tanker wetting the subgrade | B | Gallery («الطرق والتسوية») |
| 200 | Grader cut off by the left edge | B | Gallery («الطرق والتسوية») |
| 201 | Graded road bed at sunset | C | Not used: the photographer's long shadow is in every 4:3 crop |

- **No faces that need permission, no stamps or watermarks, no police or military sites** in anything published.
  Operators in the grader cabs are silhouettes.
- **Markings.** 197 carries the CAT/Caterpillar maker badge. 199 has decals on the tailgate (a religious phrase),
  the trailer maker's marks and a fleet number on the second trailer. None of it is another company's branding, so
  both are published. The markings are recorded in the triage in case the client objects.
- **Sources are 960×1280 portrait.** Every crop is a 4:3 landscape band of 960×720 (202: 760×570), below the
  1200×900 card spec. These are the best the sources allow. The originals, sent as documents, would be sharper;
  `projects-inventory.xlsx` notes this as optional.
- **A card with several photos.** `projects.json` gains `photos` (lead first). On the projects page the card shows the
  lead photo with a "3 صور / 3 photos" badge, and opens the set in the gallery's viewer. Without JavaScript it links to
  the full-size lead photo. Cards with one photo are unchanged, and the home page still shows the first four projects with photos.
- **No photo appears twice:** the three card photos are not in the gallery. The gallery grows from 25 to 27 items, and its
  lead now says most photos are *not yet* attributed. Its `project` field reads "30" for 198 and 200.
- **`photo-triage.pdf`** leaves attributed items out of the "which project?" grid, so it still asks about the same 92
  items. Its project list now runs to 32 and still fits on one page.
