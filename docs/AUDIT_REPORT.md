# Al-Basha (الباشا) Website — Audit Report

**Phase:** 2 (Audit Report) · **Date:** 2026-09-14 · **Status:** ✅ approved by client on 2026-09-14 — no project files were changed during the audit. Client answers to §15 items 1, 3, 4, 5 are recorded in §12.2 and §15.

**Method.** I read every source file, checked every asset (dimensions, format, size, MD5 hash), and served the site locally (`python -m http.server`). I drove it in headless Chrome with puppeteer at 360 / 390 / 768 / 1280 / 1920 px. I also ran Lighthouse 13.4.1 in mobile and desktop mode on all 4 pages, tested keyboard tab order, the language toggle and the contact form, and checked external links with `curl`. All tooling was installed in a scratch directory, not in the project.

**Finding IDs.** Each finding has an ID (`B-xx` broken, `U-xx` UI/UX, `C-xx` content, `A-xx` assets, `S-xx` SEO, `P-xx` performance, `X-xx` accessibility, `D-xx` deployment) and a priority: **P0** critical, **P1** important, **P2** nice to have. Section 14 lists them all by priority.

---

## 1. Current Project State

### 1.1 What the site is
A marketing website for **El Basha for General Supplies & Contracting — الباشا للتوريدات العمومية والمقاولات** (this is the wording on the logo; the pages use other name variants, see C-07). It is an Egyptian contractor doing road and infrastructure work.

**Services found in the project** (from `مصانع الطوب.txt` and the pages):
- Brick factories (مصانع الطوب)
- Road marking and pedestrian crossings (تخطيط الطرق وعبور المشاة)
- Guide and warning sign installation (تركيب اللافتات الإرشادية والتحذيرية)
- Building construction (الإنشاءات للمباني)
- Curbstone and interlock installation (بردورة وإنترلوك)
- Concrete slopes and New Jersey barriers (الميول الخرسانية والنيوجيرسي)
- Painting of bridges and New Jersey barriers (دهانات الكباري والنيوجيرسي)
- On the home page only: "Road Construction", "Material Supply", "Infrastructure"

**Portfolio found in the project:** 27 named projects in 4 groups:
- Road & infrastructure (5)
- Bridges & axes (4)
- Development & maintenance (14)
- Brick factories (4)

The projects include the Ring Road, Asyut Western Road, Suez–Sokhna and several 6th of October sectors.

**Who the site is for** — *my inference, needs confirmation:* government and public-sector project owners, and main contractors looking for subcontractors, in Egypt. So the audience is mostly Arabic-speaking.

**What the site does today:**
- Shows a hero, a video, a services grid, a portfolio page, an about page and a contact page.
- The only CTA is "Contact Us", which opens the contact page.
- The contact form is supposed to post to Formspree, but it does not work (B-01).

### 1.2 Tech stack
| Item | Finding |
|---|---|
| Framework | None. Static HTML5, one CSS file, vanilla JS |
| Build tool / package.json / lockfile | None |
| Node | None needed (v24.19.0 is installed on this machine) |
| Lint / format / TS config | None |
| Third-party (CDN) | animate.css 4.1.1, WOW.js 1.1.2, Font Awesome 6.5.0 (not on index) |
| Form backend | Formspree endpoint `https://formspree.io/f/mjkeplye` in `JS/contact.js` |
| Git | 1 commit (`9123227 Initial upload of ELBASHA project`), remote `github.com/Salmaazoz22/elbasha_project` (public, reachable) |
| Tests | None |

### 1.3 File tree (as found)
```
/
├── مصانع الطوب.txt          384 B    client's services list (plain text note)
├── HTML/
│   ├── index.html            6.3 KB  home
│   ├── About.html            5.6 KB  about   ← capital "A"; every link points to "about.html"
│   ├── services.html        12.0 KB  actually a PROJECTS portfolio
│   └── contact.html          4.5 KB  contact info + form
├── CSS/
│   ├── style.css             9.7 KB  the only stylesheet in use (552 lines)
│   └── services.css          1.9 KB  NOT linked by any page (dead)
├── JS/
│   ├── script.js             393 B   language toggle
│   └── contact.js            937 B   Formspree submit — NOT included by contact.html
├── imgs/   12 files, 1.8 MB total (see §7)
└── videos/
    ├── Final.mp4           70.5 MiB  1920×864 H.264 + AAC stereo audio, 3 min 12 s — used on home
    └── reel 1.mp4          10.4 MiB  1080×1080 stored, displays 9:16 vertical, 22.7 s — unused
```
There is no root `index.html`, no README, no `.gitignore`, no `robots.txt`, no sitemap and no 404 page.

**Local environment note.** On this machine git reports *"detected dubious ownership in repository at 'D:/ELBASHA'"* because the folder is owned by a different Windows account. I worked around it per command during the audit (`git -c safe.directory=D:/ELBASHA`). **Resolved 2026-09-14:** `git config --global --add safe.directory D:/ELBASHA` was run at the user's request.

---

## 2. What Is Good (keep)

1. **A static site with no build step.** That fits a 4-page brochure site. It deploys anywhere for free and has nothing to break. **Keep the no-framework approach.**
2. **Real, specific business content.** The 27 named projects and the services list are real client data and the strongest trust signal on the site. Every project name has Arabic and English versions.
3. **Real project photos.** They show graders on desert roads, interlock and curb work, and geogrid/retaining work. They are authentic and on-topic, much better than stock.
4. **A real, distinctive logo.** It has a clear identity: orange calligraphic "الباشا", a navy roof and a bridge motif.
5. **Real contact channels already exist:**
   - 3 phone numbers
   - 1 email
   - Facebook, which resolves (HTTP 200) to the page "شركة الباشا للتوريدات العمومية والمقاولات"
   - LinkedIn (HTTP 200)
6. **A bilingual intent.** Arabic strings already exist for every heading and card.
7. **No console errors on 3 of 4 pages.** Lighthouse Best Practices is 96–100.
8. **No secrets.** The Formspree form ID is meant to be public by design. `grep` for key/token/secret patterns found nothing.
9. **Reasonable base CSS decisions:**
   - `box-sizing: border-box`
   - sticky header
   - `object-fit: cover` on cards
   - an `auto-fit, minmax(250px, 1fr)` grid on the projects page (this grid already reflows well)
10. **Keyboard focus is not suppressed globally.** The browser's default focus ring shows on links and buttons.

---

## 3. What Is Missing

| ID | Missing | Priority |
|---|---|---|
| M-01 | Mobile navigation (the header has no small-screen layout) | P0 |
| M-02 | Root `index.html`. The site only exists under `/HTML/` | P0 |
| M-03 | A working contact channel. The form is not wired (B-01); phones are not `tel:` links; there is no WhatsApp | P0 |
| M-04 | Photos for 23 of 27 projects (see §7) | P0 (client) |
| M-05 | `<main>` landmark on index and About; `<h1>` on services and contact | P1 |
| M-06 | Per-page `<title>`, meta description, canonical, Open Graph/Twitter tags, `hreflang` | P1 |
| M-07 | `robots.txt`, `sitemap.xml`, favicon set (ico/svg/apple-touch), web manifest | P1 |
| M-08 | Address, service area, working hours, map | P1 (client) |
| M-09 | Descriptions for each service (currently titles only) | P1 (client) |
| M-10 | A CTA on services, about and project pages (only the home hero has one) | P1 |
| M-11 | Form states: labels, loading/disabled, inline error/success, spam honeypot | P1 |
| M-12 | Active-page indicator in the nav | P2 |
| M-13 | 404 page | P2 |
| M-14 | `prefers-reduced-motion` handling | P1 |
| M-15 | README, `.gitignore`, `docs/` | P2 |
| M-16 | Structured data (`GeneralContractor`) — possible only after client data is confirmed | P2 |

---

## 4. What Is Broken

All of these were verified in the browser, not just read from the code.

| ID | Issue | Evidence | Priority |
|---|---|---|---|
| **B-01** | **The contact form silently loses every message.** `contact.html` never includes `JS/contact.js`, so the form does a native GET submit to itself. The user sees the page reload with no feedback, nothing is sent, and the visitor's name, email, phone and message end up in the URL (browser history, server logs, analytics). | After submit the URL was `contact.html?name=Test&email=a%40b.co&phone=&message=hi` | **P0** |
| **B-02** | **23 of 27 project images return 404** on `services.html`. The cards show broken-image icons with the text "Project". | 404s: `slider.jpg`, `project2–9.jpg`, `project11–14.jpg`, `project16–21.jpg`, `factory1–4.jpg` | **P0** |
| **B-03** | **"About" links will 404 in production.** The file is `About.html`, but all 4 pages link to `about.html`. It works locally only because Windows is case-insensitive. Every free host (GitHub Pages, Netlify, Cloudflare Pages, Vercel) serves from case-sensitive storage. | `HTML/index.html:32`, `About.html:42`, `services.html:41`, `contact.html:41` | **P0** |
| **B-04** | **No root entry point.** Deployed as-is, `https://domain/` returns 404 or a directory listing; the home page would be at `/HTML/index.html`. | tree | **P0** |
| **B-05** | **Horizontal scrolling on phones on every page.** The header (logo + 4 links + AR button) does not wrap. On the home page the services grid is 5 fixed columns of 180 px images and the video box is 1000 px wide. On About the logo image has a fixed 400 px height, which makes it 551 px wide. | Page width at 360/390 px viewport: **index 1040 px**, About 571 px, services 461 px, contact 461 px. At 768 px: index still 1040 px. | **P0** |
| B-06 | **Social icons are invisible on the home page.** Font Awesome is not loaded on `index.html`, so the `<i class="fab …">` icons render nothing. The links are still focusable but empty. | computed `::before` content = `none` | P1 |
| B-07 | **Video autoplay never happens.** `autoplay` without `muted` is blocked by browsers, so the paused first frame shows. That frame is a paper schedule, not construction work. | probe: `paused: true, muted: false` | P1 |
| B-08 | **The language toggle has several defects:** | `JS/script.js` | P1 |
|  | (a) it resets to English on every page change (the choice is not saved); |  |  |
|  | (b) `<html lang>` stays `en` while Arabic is shown; |  |  |
|  | (c) `dir` is set on `<body>` instead of `<html>`; |  |  |
|  | (d) the default HTML text differs from `data-en` (hero shows "BRIDGES AND ROADS CONSTRUCTION", toggling back shows "Roads and bridges construction"; the About paragraph is cut off with "…" until toggled); |  |  |
|  | (e) many strings are never translated: "Contact Us" hero button, "Send", "Phone:", "Email:", the copyright line, the success message, the page title; |  |  |
|  | (f) search engines never see the Arabic text, because it only lives in `data-ar` attributes. |  |  |
| B-09 | **Inconsistent navigation on About.** "Services" goes to `index.html#services` (other pages go to `services.html`). "Contact" goes to `index.html#contact`, an anchor that does not exist. | `About.html:41,43` | P1 |
| B-10 | **Dead render-blocking libraries.** WOW.js and animate.css load on every page, but no element uses `.wow` or `animate__*` classes. | `grep` found 0 uses | P1 |
| B-11 | **The contact form's JS error handling (once wired) is weak:** `alert()` popups, no loading state, the button can be double-submitted, and the success message is English-only. | `JS/contact.js` | P1 |
| B-12 | **Dead CSS.** `CSS/services.css` is not linked anywhere. `.slider`, `.prev`, `.next`, `.slides`, `.cards`, `.hero.small-hero` and `.main-header` are unused. `.card`, `.card h3` and `.card:hover` are each defined twice in `style.css`, with conflicting values. | `CSS/style.css:374-393` vs `429-453` | P2 |
| B-13 | **Copyright year is hardcoded** as "© 2025". | footers | P2 |
| B-14 | **`About.jpg` is actually a PNG** with a `.jpg` extension (wrong MIME type when served). | Pillow: format PNG | P2 |
| B-15 | **`logo.png` has an opaque white background and a dark vertical line along its right edge.** That line is visible next to the logo in the header. | pixel sample at x=815 | P2 |

---

## 5. UI/UX Problems

| ID | Problem | Priority |
|---|---|---|
| U-01 | **Off-brand colour.** The UI accent is amber `#f4a100`, but the logo uses orange ≈ `#F07820` and navy ≈ `#184098`. Navy appears nowhere on the site, so the page and the logo feel unrelated. | P1 |
| U-02 | **Not visibly Arabic-first.** It defaults to English and LTR, uses Arial with no Arabic typeface, and has no RTL-aware layout (hard-coded `margin-left`, `padding-left: 80px`, `text-align: left`). | P1 (default language is a client decision, see §15) |
| U-03 | **Weak hero:** | P1 |
|  | • the text sits in a grey translucent box over a busy photo; |  |
|  | • the description ends in "…", so it reads unfinished; |  |
|  | • the CTA is small (110×35 px) and fails contrast (X-01); |  |
|  | • there is no phone or WhatsApp CTA, although phone is probably the real conversion; |  |
|  | • `100vh` on mobile hides the CTA behind browser chrome on some devices; |  |
|  | • `page1.jpg` is only 1280×720, so it is upscaled and soft on 1920 px screens. |  |
| U-04 | **The services grid misrepresents the services.** 8 of 10 services use the *same* grader photo. The circular crop plus the 1.15× scale and rotate(3°) hover looks template-like. There are no descriptions, and the cards are not links. | P1 |
| U-05 | **The core content is undersold and mislabeled.** 27 real projects are the best trust signal, but they live on a page labeled "Services" (`services.html`, nav "Services / خدماتنا"). The home "From Our Work / مشاريعنا" section shows only a video. The page has no intro, count or CTA. It stacks 31 headings of equal visual weight, and 23 cards are broken (B-02). | P0 (together with B-02) |
| U-06 | **The 3-minute video (70 MiB) is the second thing on the page**, ahead of the services. Its first frame is a paper sheet. It is a heavy, low-signal block in a prime position. | P1 |
| U-07 | **No consistent layout system.** Content widths are 600, 700, 900, 1000 and 1200 px across sections. Vertical spacing is ad hoc (20/40/60 px). Section titles are centred and small at 2rem. | P1 |
| U-08 | **Contact page:** | P1 |
|  | • two stacked boxes in a 900 px column, even on desktop; |  |
|  | • phone numbers cannot be tapped; |  |
|  | • no WhatsApp; |  |
|  | • the form uses mixed "Name / الاسم" placeholders instead of labels; |  |
|  | • the focus style is a faint amber glow; |  |
|  | • success/error is shown with `alert()`. |  |
| U-09 | **Header:** no active-page state; the language button is far from the nav on desktop; nav links are 17 px tall (too small to tap); there is no mobile menu (B-05). | P0 on mobile |
| U-10 | **About page:** the full logo image (400 px tall) is used as the hero. The list uses "✔️" emoji as bullets; they render differently across OSes and screen readers read them aloud. The copy is one generic sentence. | P1 |
| U-11 | **Footer:** centred text only. No nav links, address or hours. Social icons have no labels. | P2 |
| U-12 | **Interaction states:** | P1 |
|  | • Hover exists on links and buttons. |  |
|  | • Focus uses browser defaults. |  |
|  | • Active and disabled states are missing. |  |
|  | • Form loading, error and empty states are missing. |  |
|  | • Broken images show the raw browser broken-image icon. |  |
| U-13 | **The entrance animation (`fadeZoom`) runs on page load** for all 10 service items, even though they are below the fold, so users never see it. It also ignores reduced-motion settings. | P2 |

---

## 6. Content Problems

| ID | Problem | Priority |
|---|---|---|
| C-01 | **Truncated copy.** The hero paragraph ends in "…". The About paragraph shows "…projects..." until the language is toggled. | P0 |
| C-02 | **Thin company description.** The About page has one generic sentence ("committed to delivering quality and excellence"). There is no history, scope, equipment, classification or region. *I will not invent any of these* → §15. | P1 (client) |
| C-03 | **Mislabeled sections:** | P1 |
|  | • nav "Services" opens the projects list; |  |
|  | • "From Our Work" is "مشاريعنا" (Our Projects) in Arabic; |  |
|  | • home "Services" are a different list from About "Expertise" (Road Construction / Material Supply / Infrastructure appear only on home; the About list merges "Material supply and brick factories"). |  |
| C-04 | **English translations that don't match the Arabic:** | P1 (confirm spellings with client) |
|  | • "El-Masallat Road – Suez" vs "طريق المثلث" (= El-Mothallath / Triangle Road); |  |
|  | • "Natrn Valley" → Wadi El Natrun; |  |
|  | • "Ring Road Development – Mansouria Exit" is missing "هرم" (Haram); |  |
|  | • "Asyut Western Road – Asyut Gate October" is ambiguous. |  |
| C-05 | **Arabic spelling and orthography:** | P1 |
|  | • "اعمال" → "أعمال"; |  |
|  | • "الارشادية" → "الإرشادية"; |  |
|  | • "انتير لوك" → "إنترلوك"; |  |
|  | • "النيو جيرس" → "النيوجيرسي"; |  |
|  | • "الكبارى" → "الكباري"; |  |
|  | • "توريد الموارد" (About) vs "توريد المواد" (home); |  |
|  | • trailing space in "وادي النطرون ". |  |
| C-06 | **Possible overclaim.** The hero says "BRIDGES AND ROADS CONSTRUCTION / تشييد الطرق والكبارى", but the services list includes bridge *painting*, not bridge construction. There is a "Bridge & Axis Projects" group, but its scope is not stated. *Needs client confirmation.* | P1 (client) |
| C-07 | **The company name is inconsistent:** | P1 (client) |
|  | • "ElBasha Construction" (all page titles) |  |
|  | • "El-Basha Company" (footer) |  |
|  | • "El-Basha Egyptian Company / شركة الباشا المصرية" (hero) |  |
|  | • "EL BASHA for General Supplies & Contracting / الباشا للتوريدات العمومية والمقاولات" (logo) |  |
|  | • "شركة الباشا للتوريدات العمومية والمقاولات" (Facebook) |  |
| C-08 | **Project cards carry only a name** — no location, owner, year, scope or status. That is acceptable, but it is weak for trust; add details only if the client supplies them. | P2 (client) |
| C-09 | **Missing contact details:** no address, service area, working hours, WhatsApp, or which number is for which purpose. | P1 (client) |
| C-10 | **No trust signals** (clients, certifications, classification, years). **None exist in the project, so none will be added.** Slots are marked `[[NEEDS_CLIENT]]` only if the client wants them. | P1 (client) |
| C-11 | **`مصانع الطوب.txt` is a working note in the repo root.** Deployed from root, it would be public. | P2 |
| C-12 | **Placeholder / lorem text: none found.** | — |

---

## 7. Image / Asset Requirements

### 7.1 Current asset inventory
| File | Real format | Pixels | Size | Used where | Rendered at | Issues |
|---|---|---|---|---|---|---|
| `logo.png` | PNG RGBA (opaque white bg) | 822×447 | 116 KB | header, all pages | 92×50 | ~99% of bytes wasted (Lighthouse: 118 KB savings); white box; dark line on right edge; no SVG |
| `fav_icon.png` | PNG RGBA | 368×368 | 111 KB | favicon (declared as 32 and 16) | 16–32 | far too heavy; no .ico/SVG/apple-touch |
| `About.jpg` | **PNG** | 720×523 | 336 KB | About hero | 551×400 | wrong extension; it's the logo with text; 281 KB savings |
| `page1.jpg` | JPEG progressive | 1280×720 | 117 KB | hero background + 8 service circles | full-width / 180×180 | too small for desktop hero; reused for 8 different services |
| `brdora.jpg` | JPEG | 899×1599 (portrait) | 177 KB | home service 8 (curbs/interlock) | 180×180 | 173 KB savings |
| `مستقبل_مصر.jpg` | JPEG | 1280×720 | 127 KB | project "Future of Egypt" | 265×200 | **identical (same MD5) to `slider1.jpg`** |
| `محور_عمرو_بنالعاص.jpg` | JPEG | 1280×597 | 180 KB | project "Amr Ibn Al-As Axis" | 265×200 | **visible camera timestamp overlay "Ahmed A.B · 20 February 2024 3:10 pm"** (bottom-left); bystanders visible; 170 KB savings |
| `الطريق_الغربي_اكتوبر.jpg` | JPEG | 1200×1600 (portrait) | 261 KB | project "October Western Sector" | 265×200 | 237 KB savings |
| `وادي_النطرون.jpg` | JPEG | 720×1280 (portrait) | 67 KB | project "Wadi El Natrun" | 265×200 | portrait cropped into landscape card |
| `slider1.jpg`, `slider2.jpg`, `slider3.jpg` | JPEG | 1280×720 | 98–127 KB | **unused** | — | `slider1` duplicates `مستقبل_مصر`; `slider2`/`slider3` are good real photos worth reusing |
| `videos/Final.mp4` | MP4 (H.264 2.9 Mb/s + AAC 163 kb/s) | 1920×864 (20:9), 3:12 | **70.5 MiB** | home | 1000×720 | far too heavy for the web; not muted; has an audio track; no poster; footage itself is strong (graders, loaders, surveyor, aerial road shots, logo intro/outro); >25 MiB per-file limit on Cloudflare Pages; GitHub warns >50 MB |
| `videos/reel 1.mp4` | MP4 (H.264 + AAC) | 1080×1080 stored, SAR 9:16 → displays as vertical 9:16, 22.7 s | 10.4 MiB | **unused** | — | space in filename; anamorphic pixels |
| Icons | Font Awesome webfont (CDN) | — | ~100 KB+ CSS + font | 2 social icons | — | a whole icon font for 2 icons |
| Web fonts | none | — | — | — | — | no Arabic typeface |
| OG image | **missing** | — | — | — | — | — |

Arabic filenames work on every host, but they are URL-encoded and awkward to maintain. I recommend ASCII slugs, which is a rename only.

### 7.2 Images Needed
| # | Image | Purpose | Where used | Suggested ratio & min size | Must come from client? | Free stock acceptable? |
|---|---|---|---|---|---|---|
| 1 | Hero photo (best real site photo, landscape, strong subject, calm area for text) | First impression / LCP | Home hero | 16:9, min **1920×1080** (ideal 2560×1440), plus a separate 4:5 crop ≥1080×1350 for mobile if the subject is off-centre | **Yes** | No — must be the company's own work. Interim: `slider2.jpg` or `page1.jpg` (real, but low-res) |
| 2 | One photo per service ×10 (road construction, material supply, infrastructure, brick factories, road marking/pedestrian crossings, signage installation, building construction, curbs & interlock, concrete slopes & New Jersey barriers, bridge/barrier painting) | Show each service truthfully | Home services section, services page | 4:3, min **1200×900** | **Yes (preferred)** | Only with written client approval, never captioned as their own project. Otherwise an icon-only card, no photo |
| 3 | Project photos ×23 missing: Asyut Western Rd – Asyut Gate October; – Fayoum Silos & Checkpoint; – Samalut Axis; – Minya Gate; Talbiya Axis; Zomor Axis; Kamal Amer Axis; Ring Road – Qalyoub; – Mansouria/Haram; – Bahtim; Cairo University roads – Sheikh Zayed; El-Mothallath Rd – Suez; Suez–Sokhna Rd; October Southern Districts; October West Sumed; October Northern Sector; Mokattam; Zahraa El Maadi; Maadi Nerco; Brick factory – New Capital R1/R2; – Obour; – Suez; – 15th of May | Portfolio proof | Projects page cards (+ featured projects on home) | 4:3, min **1200×900**; 1–3 per project | **Yes** | **No, never** |
| 4 | Clean version of Amr Ibn Al-As Axis photo (no timestamp), or permission to crop | Portfolio | Projects page | 4:3, min 1200×900 | **Yes** | No |
| 5 | Logo as **SVG** (or transparent PNG ≥ 2000 px wide), plus a horizontal lockup if one exists | Crisp header/footer, dark footer version | Header, footer, OG image | vector | **Yes** | No |
| 6 | Icon-only mark (the "الباشا" drop + roof) as SVG | Favicon set, app icon | `favicon.svg`, `favicon.ico` 32, `apple-touch-icon` 180×180, manifest 192/512 | 1:1 | Can be **derived from existing `fav_icon.png` (368 px)** if no vector exists | n/a |
| 7 | Social share image | Link previews on WhatsApp/Facebook/LinkedIn | `og:image` on all pages | **1200×630** | Composed from #1 + #5 (needs client approval) | No |
| 8 | Company video: short highlight (30–60 s) or approval to trim `Final.mp4`, plus a poster frame | "From our work" section | Home | 16:9, 1280×720 at ~2–4 Mbps target ≤ 8 MB (or YouTube embed) | **Yes** (content/permission) | No |
| 9 | About photo: team on site / equipment fleet / office | Humanise the company | About page | 3:2, min **1600×1067** | **Yes** | No |
| 10 | (Optional) Equipment/fleet photos | Capability proof | About / services | 4:3, min 1200×900 | **Yes** | No |
| 11 | (Optional) Certificates, contractor-classification or registration scans | Trust | About | as scanned, ≥ 1500 px long side | **Yes** | No |
| 12 | (Optional) Client/owner logos | Trust | Home trust strip | SVG/PNG, transparent | **Yes, with the owner's permission to display** | No |

---

### 7.3 Projects Inventory (all 27 projects)
Mirror of **`docs/projects-inventory.xlsx`**, generated from `HTML/services.html`. Row order matches the order on the projects page:
- rows 1–5: Road & Infrastructure
- rows 6–9: Bridge & Axis
- rows 10–23: Development & Maintenance
- rows 24–27: Brick Factories

"Image exists?" is an exact, case-sensitive filename check on disk. Translation notes marked "confirm" are questions for the client, not corrections I will apply on my own. The **"Corrected English name"** column holds the corrections approved on 2026-09-14 (implementation plan §2.1) and the 7 English names confirmed by the client on 2026-09-15 (projects 1, 2, 5, 6, 18, 24, 27).

| # | Arabic name (as in source) | English name (as in source) | Corrected English name (approved 2026-09-14, for client review) | Translation issue? | Image path referenced in HTML | Image exists? | Image quality note | Needed from client |
|---|---|---|---|---|---|---|---|---|
| 1 | طريق أسيوط الغربي بوابة أسيوط أكتوبر | Asyut Western Road - Asyut Gate October | **Asyut Western Road – October Gate, Asyut (confirmed by client 2026-09-15)** | Yes — "بوابة أسيوط أكتوبر" rendered as "Asyut Gate October"; meaning/word order unclear. Confirm intended English. → RESOLVED: English name confirmed by client 2026-09-15. | `../imgs/slider.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. Also confirm whether unused imgs/slider1–3.jpg belong to this project (HTML references "slider.jpg"). |
| 2 | طريق أسيوط الغربي الصوامع ومرور الفيوم | Asyut Western Road - Fayoum Silos & Checkpoint | **Asyut Western Road – Fayoum Silos & Traffic Checkpoint (confirmed by client 2026-09-15)** | Yes — "مرور الفيوم" (Fayoum traffic point) rendered as "Checkpoint"; Arabic word order (Silos, then Fayoum traffic) differs. Confirm wording. → RESOLVED: English name confirmed by client 2026-09-15. | `../imgs/project2.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 3 | طريق أسيوط الغربي محور سمالوط | Asyut Western Road - Samalut Axis | (unchanged) | No | `../imgs/project3.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 4 | طريق أسيوط الغربي بوابة المنيا | Asyut Western Road - Minya Gate | (unchanged) | No | `../imgs/project8.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 5 | مشروع مستقبل مصر | Future of Egypt Project | **Future of Egypt Project (confirmed by client 2026-09-15)** | No — optional: confirm whether the client prefers a transliterated official name. → RESOLVED: English name confirmed by client 2026-09-15. | `../imgs/مستقبل_مصر.jpg` | ✅ Yes | 1280×720 JPEG, 127 KB. Good: grader working a graded desert road, clear sky, sharp. Byte-identical duplicate of unused imgs/slider1.jpg. 4:3 crop loses little. | Confirm this photo belongs to this project (same file as unused slider1.jpg). Optional: additional/higher-resolution photos. |
| 6 | محور الطالبية | Talbia Axis | **Talbia Axis (confirmed by client 2026-09-15)** | No — transliteration variant ("Talbia" / "Talbiya"); confirm preferred spelling. → RESOLVED: English name confirmed by client 2026-09-15. | `../imgs/project4.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 7 | محور الزمر | Zomor Axis | (unchanged) | No | `../imgs/project5.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 8 | محور كمال عامر | Kamal Amer Axis | (unchanged) | No | `../imgs/project9.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 9 | محور عمرو بن العاص | Amr Ibn Al-As Axis | (unchanged) | No | `../imgs/محور_عمرو_بنالعاص.jpg` | ✅ Yes | 1280×597 (≈2.14:1 panoramic) JPEG, 180 KB. Good detail: geogrid reinforcement and block retaining wall under a flyover. Camera timestamp overlay bottom-left: "Ahmed A.B · 20 February 2024 3:10 pm". Bystanders and café seating visible on the right. 4:3 crop loses ~38% of width. | Copy without the timestamp overlay, or approval to crop/blur it. Permission to publish (people visible). |
| 10 | تطوير وتوسعة طريق الدائري نزلة قليوب | Ring Road Development - Qalyoub Exit | **Ring Road Development & Widening - Qalyoub Exit** | No (minor) — "وتوسعة" (widening) not reflected in English. | `../imgs/project6.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 11 | تطوير وتوسعة طريق الدائري نزلة المنصورية هرم | Ring Road Development - Mansouria Exit | **Ring Road Development & Widening - Mansouria (Haram) Exit** | Yes — "هرم" (Haram) omitted from English; "widening" also not reflected. | `../imgs/project7.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. Confirm English name. |
| 12 | تطوير وتوسعة الدائري بهتيم | Ring Road Development - Bahtim | **Ring Road Development & Widening - Bahtim** | No (minor) — "وتوسعة" (widening) not reflected in English. | `../imgs/project11.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 13 | تطوير وتوسعة طرق جامعة القاهرة فرع الشيخ زايد | Cairo University Roads - Sheikh Zayed Branch | **Cairo University Roads Development & Widening - Sheikh Zayed Branch** | No (minor) — "تطوير وتوسعة" (development & widening) not reflected in English. | `../imgs/project12.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 14 | تطوير وتوسعة طريق المثلث - السويس | El-Masallat Road - Suez | **El-Mothallath (Triangle) Road Development & Widening - Suez** | Yes — "المثلث" means "the Triangle" (El-Mothallath); "El-Masallat" does not match the Arabic. | `../imgs/project13.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. Confirm English name. |
| 15 | تطوير وتوسعة طريق السويس - السخنة | Suez - Sokhna Road | **Suez - Sokhna Road Development & Widening** | No (minor) — "تطوير وتوسعة" (development & widening) not reflected in English. | `../imgs/project14.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 16 | تطوير وصيانة القطاع الغربي أكتوبر | October Western Sector Maintenance | **October Western Sector Development & Maintenance** | No (minor) — "تطوير" (development) not reflected in English. | `../imgs/الطريق_الغربي_اكتوبر.jpg` | ✅ Yes | 1200×1600 portrait JPEG, 261 KB. Sharp: curbstone and red/grey interlock sidewalk beside a gabion wall; workers visible in background. Portrait source — a 4:3 landscape card keeps only ~56% of the height. | Permission to publish (workers visible). Preferred: a landscape photo, 4:3, min 1200×900. |
| 17 | تطوير وصيانة جنوب الأحياء أكتوبر | October Southern Districts Maintenance | **October Southern Districts Development & Maintenance** | No (minor) — "تطوير" (development) not reflected in English. | `../imgs/project16.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 18 | تطوير وصيانة غرب سوميد أكتوبر | October West Sumed Maintenance | **October West Sumed Development & Maintenance (confirmed by client 2026-09-15)** | Yes — "سوميد" transliterated as "Sumed"; confirm the spelling the client/owner uses. → RESOLVED: English name confirmed by client 2026-09-15. | `../imgs/project17.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 19 | تطوير وصيانة القطاع الشمالي أكتوبر | October Northern Sector Maintenance | **October Northern Sector Development & Maintenance** | No (minor) — "تطوير" (development) not reflected in English. | `../imgs/project18.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 20 | تطوير وصيانة المقطم | Mokattam Maintenance | **Mokattam Development & Maintenance** | No (minor) — "تطوير" (development) not reflected in English. | `../imgs/project19.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 21 | تطوير وصيانة زهراء المعادي | Zahraa Maadi Maintenance | **Zahraa Maadi Development & Maintenance** | No (minor) — "Zahraa Maadi" vs "Zahraa El Maadi"; "تطوير" not reflected. | `../imgs/project20.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 22 | تطوير وصيانة المعادي نيركو | Maadi Nerco Maintenance | **Maadi Nerco Development & Maintenance** | No (minor) — "تطوير" (development) not reflected in English. | `../imgs/project21.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 23 | تطوير وصيانة وادي النطرون  | Natrn Valley Maintenance | **Wadi El Natrun Development & Maintenance** | Yes — "Natrn" is a typo (Natrun / Wadi El Natrun). Arabic source also has a trailing space. | `../imgs/وادي_النطرون.jpg` | ✅ Yes | 720×1280 portrait JPEG, 67 KB. Below minimum resolution (720 px wide). Finished road surface in empty desert — low visual interest. A 4:3 crop yields only 720×540 (soft on high-DPI screens). | Higher-resolution landscape photo (4:3, min 1200×900). Confirm English name. |
| 24 | مصنع الطوب في العاصمة R1 وR2 | Brick Factory - New Capital (R1 & R2) | **Brick Factory – New Capital (R1 & R2) (confirmed by client 2026-09-15)** | Yes — English adds "New"; Arabic says only "العاصمة" (the Capital). Confirm it is the New Administrative Capital. → RESOLVED: English name confirmed by client 2026-09-15. | `../imgs/factory1.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 25 | مصنع الطوب في مدينة العبور | Brick Factory - Obour City | (unchanged) | No | `../imgs/factory2.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 26 | مصنع الطوب في مدينة السويس | Brick Factory - Suez City | (unchanged) | No | `../imgs/factory3.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| 27 | مصنع الطوب في مدينة 15 مايو | Brick Factory - 15 May City | **Brick Factory – 15th of May City (confirmed by client 2026-09-15)** | No (minor) — commonly written "15th of May City". → RESOLVED: English name confirmed by client 2026-09-15. | `../imgs/factory4.jpg` | ❌ No – 404 | — | Project photo(s): 1–3 per project, 4:3, min 1200×900, with permission to publish. |
| **Σ** | **Total projects: 27** | | **Corrected: 20** | **Translation issues (Yes): 7** | | **Found: 4 · Missing: 23** | | |

---

## 8. SEO Problems

**Lighthouse SEO score:** 91 on all pages. The only automated failure is the missing meta description. Lighthouse does not catch the larger problems below.

| ID | Problem | Priority |
|---|---|---|
| S-01 | **Arabic content is invisible to search engines.** It only exists in `data-ar` attributes; the indexed text is English with `lang="en"`. For an Egyptian contractor, Arabic search ("مقاولات طرق", "إنترلوك وبردورة") is probably the main discovery channel. | **P0** |
| S-02 | **Every page has the same `<title>`** ("ElBasha Construction"), and none has a meta description. | P1 |
| S-03 | **No canonical, Open Graph or Twitter tags.** Links shared on WhatsApp/Facebook (probably the main sharing channel) show no image or description. | P1 |
| S-04 | **No `robots.txt`, `sitemap.xml` or `hreflang`.** | P1 |
| S-05 | **Heading structure:** `services.html` and `contact.html` have **no `<h1>`**. The home page has 10 `<h3>` services with no descriptions. | P1 |
| S-06 | **Poor URLs:** `/HTML/services.html`, with an uppercase folder and a mixed-case `About.html` (B-03). The page named "services" holds projects. | P1 |
| S-07 | **Generic alt text** ("Service 1"…"Service 10", "Project"). | P1 |
| S-08 | **Incomplete favicon set:** a 368 px PNG is declared as 16 and 32; no apple-touch icon or manifest. | P2 |
| S-09 | **No structured data.** A `GeneralContractor` / `Organization` block is possible, but the name, address and area must be confirmed first (§15). I will scaffold it disabled until then. | P2 |
| S-10 | **Facebook link is a share-redirect URL** (`/share/1b3x72sW7X/`) that resolves to profile id `61580547896224`. The canonical profile URL is better for `sameAs`, but confirm with the client. | P2 |

---

## 9. Performance Problems

### 9.1 Measured baseline (Lighthouse 13.4.1)
Environment: local `python -m http.server` (no gzip/brotli, no cache headers); CDN files over the real network; default simulated throttling. Desktop runs of About and contact were affected by CDN cold-start latency and are noisy. Mobile numbers are the reference.

| Page | Mode | Perf | A11y | Best Pr. | SEO | FCP | LCP | TBT | CLS | Weight |
|---|---|---|---|---|---|---|---|---|---|---|
| index | mobile | **68** | 83 | 100 | 91 | 4.7 s | **4.8 s** | 0 ms | 0 | 548 KiB* |
| index | desktop | 95 | 83 | 100 | 91 | 1.1 s | 1.2 s | 0 ms | 0 | 548 KiB* |
| About | mobile | **56** | 83 | 100 | 91 | 8.0 s | **8.0 s** | 0 ms | 0 | 722 KiB |
| About | desktop | 59 | 83 | 100 | 91 | 4.4 s | 4.4 s | 0 ms | 0 | 722 KiB |
| services | mobile | **59** | 86 | 96 | 91 | 6.4 s | **6.4 s** | 0 ms | 0 | 1,035 KiB |
| services | desktop | 97 | 86 | 96 | 91 | 0.9 s | 1.1 s | 0 ms | 0 | 1,035 KiB |
| contact | mobile | 82 | 88 | 100 | 91 | 3.0 s | 3.0 s | 60 ms | 0 | 384 KiB |
| contact | desktop | 56 | 88 | 100 | 91 | 6.1 s | 6.1 s | 0 ms | 0 | 384 KiB |

\* The index weight excludes the video, because autoplay was blocked. If a visitor presses play, or autoplay is fixed without other changes, the page streams a **70.5 MiB** 1920×864 file.

### 9.2 Problems
| ID | Problem | Measured impact | Priority |
|---|---|---|---|
| P-01 | **70.5 MiB home-page video** at 1080p for a 1000 px box, no poster, `preload` not set | 70.5 MiB on play; prohibitive on Egyptian mobile data | **P0** |
| P-02 | **Render-blocking third-party CSS/JS in `<head>`:** animate.css + WOW.js (both unused, B-10) + Font Awesome all.min.css (for 2 icons) | Lighthouse est. savings **3.8 s** (index) and **5.55 s** (services) on mobile | **P0** |
| P-03 | **No image optimisation:** no WebP/AVIF, no `srcset`, no `width`/`height` (Lighthouse `unsized-images` fails), no `loading="lazy"` — the projects page loads all 27 images up front | Image savings: **285 KiB** (index), **655 KiB** (services); logo 118 KB of 119 KB wasted | P1 |
| P-04 | **Font Awesome webfont** blocks text rendering | `font-display` savings **2.09 s** (services, mobile) | P1 |
| P-05 | **Hero background set via CSS `background:`**, so it is discovered late and cannot be preloaded or given `fetchpriority` | LCP 4.8 s mobile | P1 |
| P-06 | **Favicon is 111 KB** | loaded on every page | P2 |
| P-07 | **Unused CSS rules** (B-12) | 18 KiB unused | P2 |
| P-08 | **No cache headers** (host-dependent; fixed by host config) | Lighthouse cache savings 422–762 KiB on repeat visits | P2 |

JS execution cost is negligible (TBT 0–60 ms), and CLS is 0 today. CLS could get worse after the fix for B-02 if images still have no dimensions.

---

## 10. Accessibility Problems

**Lighthouse accessibility score:** 83–88. Contrast ratios below were computed with the WCAG formula.

| ID | Problem | Evidence | Priority |
|---|---|---|---|
| X-01 | **Contrast failure on every primary button.** White text on `#f4a100` is **2.11:1** (hover `#d48806` is 2.87:1); AA needs 4.5:1. Affected: the AR/EN button, the hero "Contact Us" and the form "Send". | Lighthouse `color-contrast` | **P0** |
| X-02 | **Social links have no accessible name**: icon-only `<a>` with no text or `aria-label` (and invisible on index). | Lighthouse `link-name`, all pages | P1 |
| X-03 | **Wrong language metadata.** `lang="en"` while Arabic is shown; `dir` on `<body>` instead of `<html>`. Screen readers read Arabic with English pronunciation. | B-08 | P1 |
| X-04 | **Landmarks and headings:** no `<main>` on index/About (Lighthouse `landmark-one-main`); no `<h1>` on services/contact; section titles sit outside their `<section>`. | — | P1 |
| X-05 | **Form fields have no `<label>`**, only mixed-language placeholders that disappear while typing. No `autocomplete` attributes. Errors are reported through `alert()`. | `contact.html:72-75` | P1 |
| X-06 | **Tap targets too small on mobile:** nav links 44–66 × **17 px**, language button 43×27, social icons 26–36 × 17. | puppeteer @390 px | P1 |
| X-07 | **Generic or wrong alt text:** "Service 1…10" (and 8 of them are the same photo); "Project"; `About.jpg` alt "ElBasha Logo". | — | P1 |
| X-08 | **The language toggle button** has no `aria-label` or `lang` for the "AR"/"EN" label. The `onclick` attribute works but isn't ideal. | — | P2 |
| X-09 | **No `prefers-reduced-motion` handling** for the entrance animation, hover rotate/scale or video `loop`/`autoplay`. The video has no captions (content unknown). | — | P1 |
| X-10 | **Weak form focus indicator.** It uses `outline: none` and a 0.4-alpha amber glow on inputs. Default rings elsewhere are acceptable but inconsistent. | `style.css:509-514` | P2 |
| X-11 | **External links** (`target="_blank"`) give no "opens in new tab" cue. | — | P2 |
| X-12 | **"✔️" emoji used as list bullets** are read aloud by screen readers. | `About.html:63-79` | P2 |

Keyboard: the tab order is logical (logo → nav → language → CTA → video) and focus rings are visible. There are no keyboard traps.

---

## 11. Deployment Problems

| ID | Problem | Priority |
|---|---|---|
| D-01 | **No root `index.html`.** Pages live in `/HTML/` (B-04). | **P0** |
| D-02 | **Case-sensitivity breaks the About link** on every Linux-based host (B-03). | **P0** |
| D-03 | **`Final.mp4` (70.5 MiB) blocks some hosts:** it exceeds **Cloudflare Pages' 25 MiB per-file limit**, it is above GitHub's 50 MB warning, it bloats the repo, and it burns free bandwidth quotas. It must be compressed, trimmed or hosted externally (e.g. YouTube/Facebook embed). This is a client decision (§15). | **P0** |
| D-04 | **Formspree endpoint `mjkeplye` has unknown ownership.** We don't know whose account receives the messages, which email it forwards to, or whether that email is verified. The free tier has a monthly submission cap (check current Formspree limits). | P1 (client) |
| D-05 | **No `.gitignore`.** No secrets exist today, but nothing prevents committing `.env`, OS junk or `node_modules` later. | P2 |
| D-06 | **`مصانع الطوب.txt` and `videos/reel 1.mp4` would be published** if the repo root is deployed. | P2 |
| D-07 | **No README or deploy docs.** | P2 |
| D-08 | **No build is required**, so the site is compatible with GitHub Pages, Netlify, Cloudflare Pages and Vercel once D-01 to D-03 are fixed. There are no server-side dependencies. | — (good) |

---

## 12. Client Information Needed

### 12.1 Content Requirements List
1. **Official company name** in Arabic and English (legal name vs. brand name, see C-07) and an optional one-line tagline.
2. **Company description** (2–4 sentences, Arabic + English): what the company does, for whom and where. *Optional:* founding year, number of employees, equipment fleet, contractor classification/grade, commercial registration — **only if they want them published and can provide them**.
3. **Confirmed services list** (currently 10 items, with overlaps) and 1–2 sentences per service. Also confirm "bridge construction" vs "bridge painting" (C-06) and what "Material Supply" covers.
4. **Project list confirmation:** correct Arabic and English names (C-04), which projects to feature on the home page, and permission to name public owners and projects. *Optional per project:* location, owner/client, year, scope, status.
5. **Photos** per the Images Needed table (§7.2), with confirmation that the company owns the rights or has permission.
6. **Video:** which video to show and permission to trim/compress, or a YouTube/Facebook link to embed. Purpose of `reel 1.mp4`.
7. **Arabic copy proofreading approval** for the corrected spellings in C-05.
8. **Trust content**, only if real: client/owner names or logos (with permission), certificates, memberships. No testimonials or statistics will be written without a source.

### 12.2 Client Information Needed
| Item | Current state | Needed |
|---|---|---|
| Primary phone for "Call" CTA | 3 numbers: +20 111 611 1015, +20 101 416 5151, +20 100 699 2768 | ✅ **Resolved:** primary = **+20 111 611 1015** → `tel:+201116111015`. The other two are secondary (contact section + footer only). Still open: label per number (optional) |
| WhatsApp | none | ✅ **Resolved:** same number → `https://wa.me/201116111015` |
| Email | elbasha.constructions@gmail.com | Confirm official; custom-domain email planned? |
| Contact form recipient | Formspree `mjkeplye` | ✅ **Resolved:** the account belongs to the client; messages go to **elbasha.constructions@gmail.com**. Fix the form, add success/error states, document the free-tier monthly limit |
| Address / HQ | none | Address (AR/EN) and Google Maps link, or "no public address" |
| Service area | none | Governorates/regions served |
| Working hours | none | Days and hours |
| Social media | Facebook (share link), LinkedIn | Confirm canonical URLs; any Instagram/YouTube/TikTok? |
| Domain | none | Owned domain? Registrar? DNS access? Or use the free host subdomain for now |
| Default language | English with Arabic toggle | ✅ **Resolved:** Arabic default at `/` (`lang="ar" dir="rtl"`), English at `/en/`, `hreflang` between them |
| Brand colours / guidelines | logo only | Confirm orange `#F07820` + navy `#184098` from the logo, or supply a brand guide |
| Analytics | none | Wanted? (free options in Phase 3) |
| Photo publishing permission | — | Especially photos with visible people and the timestamp watermark photo |

---

## 13. Recommended Improvements

This is a direction only. Phase 3 turns it into an ordered plan with files, risks and verification.

1. **Keep static HTML/CSS/vanilla JS.** Don't introduce a framework. Restructure for hosting:
   - pages at the root with lowercase names (`index.html`, `about.html`, `projects.html`, `contact.html`);
   - `assets/css`, `assets/js`, `assets/img`.
   
   The page currently named `services.html` becomes `projects.html`, and services get a proper section and/or page.
2. **Arabic-first, crawlable bilingual site** (pending the §15 decision). Real Arabic HTML (`lang="ar" dir="rtl"`) plus a real English version (e.g. `/en/`) with `hreflang`, replacing the JS text swap. Phase 3 will compare this with a fixed JS toggle and decide how to avoid duplicating the header and footer across pages.
3. **Fix all P0 bugs first:** B-01 to B-05, X-01, S-01, P-01 to P-02, D-01 to D-03.
4. **A design system aligned to the logo:** navy + orange with accessible text/background pairs, one neutral scale, one spacing scale, one container width, and a consistent button/card/section pattern. Use a free Arabic-capable typeface (e.g. an open-licensed family covering Arabic + Latin, self-hosted, subset, `font-display: swap`).
5. **Conversion:**
   - `tel:` links, and a WhatsApp deep link once the number is confirmed;
   - a sticky mobile Call/WhatsApp bar;
   - a CTA at the end of every page;
   - a working backend-less contact channel (Phase 3 decision).
6. **Projects as the core:** featured projects on home, a projects page grouped by category with a clean "photo pending" state instead of broken images, all as real HTML.
7. **Performance:**
   - drop WOW/animate.css;
   - replace Font Awesome with 2–4 inline SVG icons;
   - responsive WebP/AVIF with JPEG fallback, explicit dimensions, lazy loading below the fold, a preloaded hero;
   - a compressed video with poster and `preload="none"` (or an external embed);
   - target mobile Lighthouse Performance ≥ 90 on all pages.
8. **Accessibility:**
   - fix X-01 to X-12;
   - skip link;
   - visible `:focus-visible` style;
   - labelled form;
   - 44 px tap targets;
   - reduced-motion support.
9. **SEO:** unique titles/descriptions, canonical, OG/Twitter tags with a 1200×630 image, favicon set, `robots.txt`, `sitemap.xml`, `hreflang`, meaningful alt text, and `GeneralContractor` JSON-LD scaffolded **disabled** until the data is confirmed.
10. **Hygiene:** remove dead CSS/JS/assets (or move them out of the deploy path), `.gitignore`, README, `docs/`.

---

## 14. Priority Levels (all findings)

**P0 — Critical (blocks launch or loses leads)**
- B-01 contact form loses messages
- B-02 23 broken project images
- B-03 `About.html` case mismatch → 404 in production
- B-04 / D-01 no root entry point
- B-05 / M-01 / U-09 mobile horizontal overflow, no mobile nav
- U-05 projects (core proof) broken and mislabeled
- C-01 truncated hero/about copy
- X-01 CTA/button contrast 2.11:1
- S-01 Arabic content not indexable
- P-01 70.5 MiB video
- P-02 render-blocking unused libraries (−3.8 to −5.6 s)
- D-03 video exceeds host per-file limits
- M-03 no working contact channel
- M-04 missing project photos (client)

**P1 — Important**
- **Broken:** B-06, B-07, B-08, B-09, B-10, B-11
- **UI/UX:** U-01, U-02, U-03, U-04, U-06, U-07, U-08, U-10, U-12
- **Content:** C-02, C-03, C-04, C-05, C-06, C-07, C-09, C-10
- **SEO:** S-02, S-03, S-04, S-05, S-06, S-07
- **Performance:** P-03, P-04, P-05
- **Accessibility:** X-02, X-03, X-04, X-05, X-06, X-07, X-09
- **Deployment:** D-04
- **Missing:** M-05, M-06, M-07, M-08, M-09, M-10, M-11, M-14

**P2 — Nice to have**
- **Broken:** B-12, B-13, B-14, B-15
- **UI/UX:** U-11, U-13
- **Content:** C-08, C-11
- **SEO:** S-08, S-09, S-10
- **Performance:** P-06, P-07, P-08
- **Accessibility:** X-08, X-10, X-11, X-12
- **Deployment:** D-05, D-06, D-07
- **Missing:** M-12, M-13, M-15, M-16

---

## 15. BLOCKED / NEEDS CLIENT INPUT

I will not guess on any of these. Until answered, the implementation will use visible `[[NEEDS_CLIENT: …]]` markers or keep the existing real data unchanged.

| # | Decision / data | Why it blocks | Interim handling |
|---|---|---|---|
| 1 | ~~Default language~~ | — | ✅ **RESOLVED (2026-09-14):** Arabic at `/` (`lang="ar" dir="rtl"`), English at `/en/`, `hreflang` both ways |
| 2 | **Official company name** (AR/EN) | Titles, logo alt, footer, structured data, OG | Use the logo wording; mark `[[NEEDS_CLIENT: confirm legal name]]` |
| 3 | ~~WhatsApp number and primary call number~~ | — | ✅ **RESOLVED:** +201116111015 for both Call (`tel:+201116111015`) and WhatsApp (`https://wa.me/201116111015`); +20 101 416 5151 and +20 100 699 2768 are secondary info only |
| 4 | ~~Contact form channel and recipient~~ | — | ✅ **RESOLVED:** Formspree `mjkeplye` is the client's account → elbasha.constructions@gmail.com. Fix submission, add success/error states, document the free-tier limit |
| 5 | ~~Video~~ | — | ✅ **RESOLVED:** trim and compress `Final.mp4` to ~5–8 MB, WebM + MP4 fallback, muted/autoplay/loop/playsinline, poster image, respect `prefers-reduced-motion`; the original stays outside the deployed folder |
| 6 | **Project photos** (23 missing) and permission to publish all photos, including the timestamp-watermarked one | Portfolio accuracy | Clean "photo pending" card state + `[[NEEDS_CLIENT: photo – <project>]]`. Permission for the two photos already on project cards (Amr Ibn Al-As Axis, October Western Sector) granted 2026-09-18 (client batch 5); the photos are still pending. |
| 7 | **Scope wording:** bridge *construction* vs *painting*; what "Material Supply" covers | Hero headline accuracy (C-06) | ✅ **RESOLVED 2026-09-15 (client batch 1):** hero keeps the company name as headline in both languages; material types still pending (asked together with the service descriptions). |
| 8 | **Correct spellings** of project names (AR/EN) and the Arabic orthography corrections (C-04, C-05) | Published names of public projects | ✅ **RESOLVED 2026-09-15 (client batch 1):** English names of projects 1, 2, 5, 6, 18, 24, 27 confirmed; applied in projects.json and projects-inventory.xlsx. |
| 9 | **Company description, address, service area, hours** | About page, footer, structured data | Partly resolved 2026-09-15: service area "جميع محافظات الجمهورية / All governorates of Egypt" and Google Maps link applied (map link shown in contact section and footer). Working hours (batch 3) and profile (batch 4) followed. ✅ **RESOLVED 2026-09-18 (client batch 5):** written address in Arabic and English, shown on the Contact card and in the footer, and emitted as a JSON-LD `PostalAddress`. |
| 10 | **Trust signals** (clients, certifications, classification, years) | None exist in the project | Section omitted, or a marked slot if the client wants one |
| 11 | **Domain** ownership and DNS access | Canonical URLs, sitemap, custom domain | ✅ **RESOLVED 2026-09-15 (client batch 1):** no domain for now; deploy on the free *.pages.dev URL with SITE_URL = that URL. Custom-domain steps kept in DEPLOYMENT_GUIDE §10. |
| 12 | **Brand colours** confirmation | Design system | Derive from the logo (`#F07820`, `#184098`) unless told otherwise |
| 13 | **Canonical social URLs** (Facebook share link vs profile URL; other networks) | Footer, `sameAs` | Keep the existing links as-is |
| 14 | **Analytics** wanted? | Privacy/consent, script weight | None added unless requested |
| 15 | **Fate of unused files:** `reel 1.mp4`, `slider1–3.jpg`, `مصانع الطوب.txt` | Deletion is irreversible for the client | ✅ **RESOLVED 2026-09-15 (client batch 1):** moved to git-ignored /archive at the repository root (outside dist/); still in git history at tag original-upload. |
| 16 | **English wording for service "تخطيط الطرق وعبور المشاة"** — "Road Planning" (as in source) vs "Road Marking" *(found during implementation)* | Published service name | ✅ **RESOLVED 2026-09-15 (client batch 1):** "Road Marking & Pedestrian Crossings". |
| 17 | **Service descriptions** (10 × 1–2 sentences, Arabic and English) *(found during implementation; see M-09)* | Service cards | Draft descriptions for all 10 services (Arabic and English) added 2026-09-15 with "draft": true in services.json; now visible on the site. ✅ **RESOLVED 2026-09-18 (client batch 5):** all 10 approved as written; the `draft` flags are removed. The material-types question was part of the same request (CLIENT_REQUESTS item 1) and was closed with it, without a list. |
| 18 | **Account ownership:** the GitHub repo is on a personal account (`Salmaazoz22`); who should own the GitHub, Cloudflare and Formspree accounts long term *(found during deployment planning)* | Business continuity, access to deploys and form messages | Documented in DEPLOYMENT_GUIDE §3 #15; no change made |
| 19 | **High-resolution hero photo** (landscape ≥ 1920×1080 plus portrait for phones) | Hero is currently a still from the company video (1920×864, slightly soft) | Video stills used as interim hero |
| 20 | **Which project each client photo shows** *(media batch 1)* | Photos may not go on project cards without it; 23 cards are still photo-less | Photos are published only by subject — in the gallery, service cards and backgrounds. `gallery.json` has an empty `project` field per item, ready for the answers in `docs/photo-triage.pdf` |
| 21 | **Permission for the people shown** *(media batch 1)* | Publishing an identifiable face needs consent | Items with identifiable faces are excluded (009, 034, 043, 083, 095, video-031, plus 003, 014, 124, 196 found later); the 2.4–5.96 s segment of the phone reel, where a worker walks past the camera, is cut out |
| 22 | **Is the tipper truck in photo 120 the company's own?** *(media batch 1)* | The truck carries a "FULLOPTION" decal and an "M I S" marking — third-party text on a vehicle of unknown ownership | Published as the "Material Supply" service card; the markings are illegible at that size. Replaceable in one line if the client objects |
| 23 | **Are the machines in the photos owned or rented?** *(media batch 1)* | An "our equipment" strip would be a business claim | Equipment strip not built (MEDIA_PROPOSAL idea 6) |

---

**Status (2026-09-16):** Phases 4–6 are complete; see `docs/QA_REPORT.md` and `docs/DEPLOYMENT_GUIDE.md`. §15 items 1, 3, 4, 5, 7, 8, 9, 11, 15, 16 and 17 are resolved (9 and 17 in client batch 5, 2026-09-18). Still **NEEDS CLIENT INPUT**: 2, 6 (photos only; publishing permission granted in batch 5), 10 (deferred by the client), 12, 13, 14, 18, 19, and the media items 20–23 added after the photo build. Client batch 6 (2026-09-18) added projects 29–32; project 30 came with photos (MEDIA_PROPOSAL §7). The client-ready list is docs/CLIENT_REQUESTS.md (29 items after batch 6); the photo questions are in docs/photo-triage.pdf and docs/MEDIA_PROPOSAL.md §5.

**Media build (2026-09-16):** hero video and stills, photo service cards, section backgrounds, the site gallery and the About photo are live — commits `33afc73`, `8c76cca`, `edd79cd`, `a7e615c`. Item 19 is now only partly open: the hero is still a video still, but at a higher bitrate from the 1080p master.
