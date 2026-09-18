# Al-Basha (الباشا) Website — Implementation Plan

**Phase:** 3 (Plan) · **Date:** 2026-09-14 · **Status:** ✅ approved 2026-09-14, including points (a), (b) and (c) of §10. Implementation is on branch `improve/production-ready`.
**Inputs:** `docs/AUDIT_REPORT.md` (approved) · `docs/projects-inventory.xlsx` · client answers of 2026-09-14.

Finding IDs (B-, U-, C-, S-, P-, X-, D-, M-) refer to the audit report. Task IDs are `T-xx`.

---

## 0. Client decisions this plan is built on

| # | Decision | Source |
|---|---|---|
| 1 | Arabic is the default at `/` (`lang="ar" dir="rtl"`); English at `/en/`; `hreflang` both ways, `x-default` → `/` | Client, 2026-09-14 |
| 2 | Main number **+201116111015**: Call CTA `tel:+201116111015`, WhatsApp CTA `https://wa.me/201116111015`. +20 101 416 5151 and +20 100 699 2768 are secondary info only (contact section and footer) | Client |
| 3 | Formspree `mjkeplye` belongs to the client and delivers to elbasha.constructions@gmail.com. Fix submission, add success/error states, document the free-tier limit | Client |
| 4 | Trim and compress `Final.mp4` to ~5–8 MB; WebM + MP4 fallback; muted, autoplay, loop, playsinline; poster; respect `prefers-reduced-motion`; original kept outside the deployed folder | Client |
| — | Every other §15 item stays **NEEDS CLIENT INPUT**. No guessing | Client |

---

## 1. Architecture decision

### 1.1 Chosen approach: static HTML/CSS/vanilla JS plus a tiny zero-dependency Node build script
```
/
├── package.json             scripts only — "dependencies": none
├── .node-version            24
├── .gitignore  .env.example
├── src/
│   ├── data/
│   │   ├── site.json        name, phones, email, social, Formspree ID, domain — the ONE place to edit contact info
│   │   ├── services.json    10 services (ar/en)
│   │   └── projects.json    27 projects (ar/en, category, image or null) — generated once from HTML/services.html
│   ├── i18n/ar.json en.json UI strings (nav, buttons, form messages, SEO titles/descriptions)
│   ├── templates/           layout + partials (header, footer, mobile CTA bar, cards) + pages (home, projects, about, contact, 404)
│   ├── css/main.css         design tokens + components (logical properties, one file for RTL and LTR)
│   ├── js/main.js           mobile nav, video controller, reveal-on-scroll, footer year
│   ├── js/contact.js        Formspree submit with states
│   ├── fonts/               self-hosted Cairo (OFL) woff2 subsets + OFL.txt
│   └── static/              _headers, _redirects, robots.txt (templated), favicons, optimised img/, video/
├── scripts/
│   ├── build.mjs            src → dist/ (renders pages ×2 languages, sitemap, content-hashed assets)
│   ├── serve.mjs            local preview server for dist/ (zero-dep)
│   ├── check.mjs            post-build checks: internal links/assets, one <h1>, lang/dir, unique titles, img alt/size, NEEDS_CLIENT/lorem report
│   └── media.mjs            one-off image pipeline (runs sharp via on-demand install; not a host build dependency)
├── source-assets/           ORIGINALS — never deployed (Final.mp4, reel 1.mp4, original photos, logo, مصانع الطوب.txt)
├── docs/
└── dist/                    build output (gitignored) — the ONLY folder the host publishes
```

**Output URLs:**

| Arabic (default) | English |
|---|---|
| `/` | `/en/` |
| `/projects/` | `/en/projects/` |
| `/about/` | `/en/about/` |
| `/contact/` | `/en/contact/` |

Services live on the home page as `/#services` (and `/en/#services`). There is one `404.html`, which is bilingual and `noindex`.

### 1.2 Why a build script instead of hand-written HTML
- **The page count doubles.** The approved Arabic `/` + English `/en/` split turns 4 pages into 9 HTML files, each with the same header, footer, contact details, nav and CTA bar. The current site already shows drift between hand-copied pages: the About page's nav differs from the others (B-09). With 9 copies, one phone-number change means 9+ edits.
- **One data file.** `src/data/site.json` becomes the single place to change contact details. That's what the deployment guide will tell the client.
- **Zero dependencies.** The script uses only Node built-ins (`node:fs`, `node:path`, `node:crypto`), so there is no framework, no `node_modules` on the host, and no supply-chain exposure. The build takes about a second.
- **The deploy folder becomes explicit (`dist/`).** That solves D-06 (notes file and raw video must not be published) and the "original video outside the deployed folder" requirement.
- **What stays the same.** It is still hand-authored semantic HTML and CSS: templates are plain JS template literals producing static files. Content, photos, Formspree, and the good CSS decisions from the audit (§2 there) carry over.

**Rejected alternatives:**
- **Hand-maintained 9 HTML files:** zero tooling, but it causes the drift above.
- **Eleventy/Astro:** good tools, but they add dependencies and a learning curve the site doesn't need.
- **Keeping the JS language toggle:** it fails S-01 and contradicts decision 1.

### 1.3 Handling `[[NEEDS_CLIENT]]` markers
- Markers live in **data files** (`site.json`, `services.json`, `projects.json`, i18n). They are greppable in one place.
- `npm run build:drafts` renders every marker **visibly** as a dashed, labelled slot, e.g. *"[[NEEDS_CLIENT: address]]"*, so the client can review exactly what's missing.
- `npm run build` (production) **omits** any block whose data is still a marker. Nothing fake or placeholder-looking ships; a section is simply absent until its data is real. The build prints a list of omitted blocks.
- `scripts/check.mjs` fails the production build if a `[[NEEDS_CLIENT` string leaks into `dist/`.

> If you'd rather have markers visible on the live site too, that's a one-flag change. Say so at approval.

---

## 2. Ordered task list

Risk: **L** low / **M** medium / **H** high. Each task is one or more small commits.

### P0 — Critical

| Task | What | Why (audit) | Files affected | Risk | Verification |
|---|---|---|---|---|---|
| **T-00** | Create branch `improve/production-ready`. Commit `docs/` (audit report, inventory, this plan). No push unless you ask | Process | `docs/*` | L | `git log` |
| **T-01** | **Restructure for hosting.** Add `package.json` (no deps), `.node-version`, `.gitignore` (`dist/`, `node_modules/`, `.env*` except `.env.example`, OS files), `.env.example` (`SITE_URL`). `git mv` originals into `source-assets/` (history preserved, nothing deleted). Delete old `HTML/`, `CSS/`, `JS/` only once their content lives in `src/` (still in git history at `9123227`) | B-03, B-04, D-01, D-02, D-05, D-06 | new tree per §1.1 | M | `npm run build` produces `dist/index.html`; `dist/` contains no `.txt`, no `source-assets`, no file >25 MiB (check script asserts) |
| **T-02** | **Build script and templates.** `scripts/build.mjs` renders each page for `ar` and `en`: `<html lang dir>`, shared layout, content-hashed asset URLs, `sitemap.xml`, `robots.txt`. `scripts/serve.mjs` previews `dist/` locally with **case-sensitive** path resolution, so the About-style bug can't recur on Windows | B-03, B-08, S-01, S-06 | `scripts/build.mjs`, `scripts/serve.mjs`, `src/templates/**` | M | Build output for 9 pages; `curl` each URL on the preview server → 200; `/About/` → 404 (case-sensitivity proven) |
| **T-03** | **Content migration to data files.** Generate `projects.json` (27) and `services.json` (10) from the current HTML (the same extraction used for the inventory). Apply only the text corrections listed in §2.1; every other name stays exactly as in source | C-01, C-03, C-04, C-05 | `src/data/*.json`, `src/i18n/*.json` | L | Script diff: 27 projects, 10 services, AR/EN both non-empty; every changed string listed in §2.1 and nothing else |
| **T-04** | **Real Arabic-first bilingual pages.** Arabic HTML at `/`, English at `/en/`. The language switcher is a normal link to the counterpart page (`hreflang`, `lang` on the label). No JS text swapping, no auto-redirect by browser language (crawlers and shared links must stay stable) | S-01, B-08, X-03, U-02 | templates, i18n | M | View source of `/` shows Arabic text with `lang="ar" dir="rtl"` on `<html>`; `/en/` is English/LTR; switcher on every page lands on the same page in the other language |
| **T-05** | **Responsive layout and mobile navigation.** Mobile-first CSS. Header: logo, nav, language link, Call button (desktop). Below 900 px: menu button (`aria-expanded`, `aria-controls`, Esc closes, focus returns). Without JS, the nav renders as a wrapped list. **No horizontal overflow at any width ≥ 320 px** | B-05, M-01, U-09, X-06 | `main.css`, `main.js`, header partial | M | puppeteer at 320/360/390/768/1280/1920 × 9 pages: `scrollWidth === clientWidth`; all interactive targets ≥ 44×44 px on mobile; keyboard open/close test |
| **T-06** | **Working contact form (Formspree).** Real `<form action="https://formspree.io/f/mjkeplye" method="POST">`, so it works without JS (Formspree's own confirmation page). With JS: `fetch` + `Accept: application/json`. Fields and states in §4 | B-01, B-11, M-03, M-11, X-05, U-08 | contact template, `src/js/contact.js`, i18n | M | Mock-server tests of success / 4xx with field errors / network failure / double-click, AR and EN. **One real submission** to Formspree after deploy, confirmed arriving at elbasha.constructions@gmail.com (by you or the client) |
| **T-07** | **Call and WhatsApp CTAs everywhere.** Hero: primary WhatsApp button + secondary Call button. Every page ends with a CTA band. **Mobile sticky bottom bar** (WhatsApp · Call) with safe-area padding; hidden while the menu is open; the page gets bottom padding so it never covers content. All phone numbers become `tel:` links; in Arabic pages numbers are wrapped in `<bdi dir="ltr">` so they don't reverse | M-03, M-10, U-03, U-08 | partials, `site.json` | L | Links resolve exactly to `tel:+201116111015` and `https://wa.me/201116111015`; the bar doesn't overlap the footer content at 360 px; digits render in the correct order in RTL |
| **T-08** | **Projects page rebuilt around the 27 real projects.** Intro, 4 category groups with in-page category links, cards with photo **only where one exists** (4). The other 23 get a neutral branded tile (logo-pattern background + category icon, no text claim), plus a visible marker in drafts. Page renamed `services.html` → `/projects/` (nav "مشاريعنا / Projects"). Featured projects strip on home: the 4 with photos | B-02, U-05, M-04, S-05 | projects/home templates, `projects.json`, CSS | M | 0 image 404s; 27 cards per language; category counts 5/4/14/4; `check.mjs` finds no broken `src` |
| **T-09** | **Remove dead, render-blocking libraries.** Drop animate.css, WOW.js and Font Awesome; replace the icons with inline SVG (§5.4) | B-06, B-10, P-02, P-04, X-02 | layout, partials | L | No third-party requests in the network log except Formspree (on submit only); Lighthouse `render-blocking` shows only the local CSS |
| **T-10** | **Video: trim, compress, and a lazy accessible player** (details in §3) | P-01, D-03, B-07, U-06, X-09 | `source-assets/video/Final.mp4` (moved), `src/static/video/*`, home template, `main.js` | M | WebM and MP4 each 5–8 MB, no audio track (ffprobe); nothing downloads before the section nears the viewport; autoplays muted when visible; pause button works by keyboard; with reduced motion there is no autoplay and the poster shows with a play control |
| **T-11** | **Accessible colour system.** Tokens per §5.1; every text/background pair used on the site is at least 4.5:1 (large text ≥ 3:1) and the focus ring is at least 3:1 | X-01, U-01, X-10 | `main.css` | L | Contrast script over the token pairs + Lighthouse `color-contrast` passes on 9 pages |

### P1 — Important

| Task | What | Why (audit) | Files affected | Risk | Verification |
|---|---|---|---|---|---|
| **T-12** | **Design system and page redesign** (§5): typography, spacing, container, buttons, cards, section patterns, header/hero/services/projects/video/CTA/footer. Home order: Hero → Services → Featured projects → Video "من أعمالنا" → CTA band → Footer | U-03, U-04, U-06, U-07, U-10, U-11, U-12 | templates, `main.css` | M | Screenshot review at 4 breakpoints × 9 pages (attached to the QA report); visual consistency checklist |
| **T-13** | **Arabic typography.** Self-hosted **Cairo** variable font (SIL OFL; the original author already referenced it in `CSS/services.css`), woff2 split into Arabic and Latin subsets via `unicode-range`, `font-display: swap`, Arabic subset preloaded on Arabic pages and Latin on English pages. Arabic body 1.0625–1.125 rem, line-height 1.8, no letter-spacing or uppercase transforms on Arabic | U-02, P-04 | `src/fonts/*`, `main.css`, layout | L | Font requests ≤ 2 per page, total ≤ ~120 KB; no FOIT (Lighthouse `font-display` passes) |
| **T-14** | **Image pipeline** (`scripts/media.mjs`, run locally, outputs committed): WebP + JPEG fallback in `<picture>`, widths 480/800/1200 (hero also 1600/1920), explicit `width`/`height`, `loading="lazy"` + `decoding="async"` below the fold; hero `fetchpriority="high"` + preload. Details in §5.3 | P-03, P-05, P-06, B-14, B-15 | `src/static/img/**`, templates | M | Lighthouse `image-delivery` and `unsized-images` pass; hero image ≤ 150 KB at mobile width; CLS < 0.05 |
| **T-15** | **Accessibility pass:** skip link; `<header>/<nav>/<main>/<footer>` on every page; exactly one `<h1>` per page; section headings inside their sections; `aria-current="page"`; meaningful alt text describing what's visible (no "Service 1"); external links get a visually hidden "(opens in new tab)"; list bullets via CSS instead of emoji; visible `:focus-visible` everywhere | X-02, X-04, X-07, X-08, X-11, X-12, M-05 | templates, CSS | L | Lighthouse a11y = 100 on 9 pages; keyboard-only walkthrough; heading outline dump per page |
| **T-16** | **Reduced motion and subtle animation:** CSS reveal on scroll (opacity + 12 px translate, ≤ 500 ms) via IntersectionObserver; content is visible without JS; `prefers-reduced-motion: reduce` disables reveal, hover transforms, smooth scroll and video autoplay | M-14, X-09, U-13 | `main.css`, `main.js` | L | Emulate reduced motion in puppeteer: no transitions, video paused with poster |
| **T-17** | **SEO per page and language:** unique `<title>` and meta description (drafted **only from existing content**, listed in the QA report for approval); canonical; `hreflang` ar / en / x-default; Open Graph (`og:locale` `ar_EG` / `en_US` + alternate) and `twitter:card=summary_large_image`; 1200×630 OG image; `robots.txt`; `sitemap.xml` with `xhtml:link` alternates. Absolute URLs come from `SITE_URL` (build env var). If `SITE_URL` is unset, canonical/og:url/sitemap are omitted and the build warns (the domain is NEEDS_CLIENT) | S-02, S-03, S-04, S-05, S-06, S-07, M-06, M-07 | layout, `build.mjs`, `site.json`, i18n | L | `check.mjs`: titles and descriptions unique; built HTML contains the tags; sitemap lists 8 indexable URLs with alternates; OG card preview verified with a local OG parser |
| **T-18** | **Favicon set and manifest:** `favicon.ico` (16/32/48, PNG-in-ICO), `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` 180 on a white background, `site.webmanifest` — all derived from `fav_icon.png` (368 px; no vector exists) | S-08, P-06 | `src/static/*` | L | Files present, correct sizes; favicon ≤ 15 KB; manifest valid JSON |
| **T-19** | **Security and caching headers** (`_headers`): CSP (`default-src 'self'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self' https://formspree.io; form-action https://formspree.io; frame-ancestors 'none'; base-uri 'self'`), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. Content-hashed `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`; HTML → `no-cache`. No inline scripts (JSON-LD is a non-executable data block) | P-08, D-05 | `src/static/_headers` | M | After deploy: `curl -I` shows headers; 0 CSP violations in the console on all pages including a form submit |
| **T-20** | **Legacy URL redirects** (`_redirects`, 301): `/HTML/index.html` → `/`, `/HTML/About.html` and `/HTML/about.html` → `/about/`, `/HTML/services.html` → `/projects/`, `/HTML/contact.html` → `/contact/` — in case the old paths were ever shared | S-06 | `src/static/_redirects` | L | `curl -I` → 301 with correct `Location` after deploy |
| **T-21** | **About page** from existing real content: full existing company paragraph (AR/EN, untruncated) + expertise list (the same 10 services) + CTA. Description, history, address, hours, team and trust are **data slots** (drafts only) | C-01, C-02, U-10 | about template, i18n | L | No truncated text; no new claims (diff against the source strings) |
| **T-22** | **Hero copy without the unverified claim (C-06):** H1 = company name as on the logo (*الباشا للتوريدات العمومية والمقاولات* / *El Basha for General Supplies & Contracting*), subtitle = the existing company sentence. The old headline "تشييد الطرق والكبارى / Roads and bridges construction" is kept in i18n as `hero.headlinePendingConfirmation` and swapped in once the client confirms the scope | C-06, C-07 | i18n, home template | L | Hero strings are traceable to source text; the QA report lists them for client sign-off |

### P2 — Nice to have

| Task | What | Why (audit) | Files affected | Risk | Verification |
|---|---|---|---|---|---|
| **T-23** | Styled bilingual `404.html` (`noindex`) with links home/projects/contact | M-13 | template | L | Host serves it for an unknown URL (post-deploy `curl`) |
| **T-24** | Structured data scaffold: `GeneralContractor` JSON-LD built from `site.json` but **disabled** (`structuredData.enabled: false`). The build refuses to enable it while any required field (legal name, address, area, URL) is a marker | S-09, M-16 | `build.mjs`, `site.json` | L | Not present in `dist/`; unit check that it stays disabled while markers exist |
| **T-25** | `README.md`: overview, `npm run build / build:drafts / preview / check / media`, where to edit content, links to docs | M-15, D-07 | `README.md` | L | Commands in the README run as written on a clean clone |
| **T-26** | Footer year set at build time and refreshed by `main.js` if the calendar year changed | B-13 | footer, `main.js` | L | Shows 2026 |

### 2.1 Exact text corrections included (everything else stays as in source)
Only corrections where the Arabic source is unambiguous, or that are pure spelling/orthography, are included. Everything marked "confirm" in the inventory is **not** changed.

| Where | Before | After | Basis |
|---|---|---|---|
| Project 23 EN | Natrn Valley Maintenance | Wadi El Natrun Development & Maintenance | Typo; Arabic "تطوير وصيانة وادي النطرون" |
| Project 23 AR | "تطوير وصيانة وادي النطرون " | "تطوير وصيانة وادي النطرون" | Trailing space |
| Project 14 EN | El-Masallat Road - Suez | El-Mothallath (Triangle) Road Development & Widening - Suez | Arabic "المثلث" is unambiguous |
| Project 11 EN | Ring Road Development - Mansouria Exit | Ring Road Development & Widening - Mansouria (Haram) Exit | Arabic includes "هرم" |
| Services / about AR | اعمال · الارشادية · انتير لوك · النيو جيرس · الكبارى · توريد الموارد | أعمال · الإرشادية · إنترلوك · النيوجيرسي · الكباري · توريد المواد | Standard orthography; the home page already says "توريد المواد" |
| Hero / about | "…" truncations | full existing sentence | C-01; the full text already exists in `data-*` attributes |
| Project 10 EN | Ring Road Development - Qalyoub Exit | Ring Road Development & Widening - Qalyoub Exit | Arabic "تطوير وتوسعة" |
| Project 12 EN | Ring Road Development - Bahtim | Ring Road Development & Widening - Bahtim | Arabic "تطوير وتوسعة" |
| Project 13 EN | Cairo University Roads - Sheikh Zayed Branch | Cairo University Roads Development & Widening - Sheikh Zayed Branch | Arabic "تطوير وتوسعة" |
| Project 15 EN | Suez - Sokhna Road | Suez - Sokhna Road Development & Widening | Arabic "تطوير وتوسعة" |
| Project 16 EN | October Western Sector Maintenance | October Western Sector Development & Maintenance | Arabic "تطوير وصيانة" |
| Project 17 EN | October Southern Districts Maintenance | October Southern Districts Development & Maintenance | Arabic "تطوير وصيانة" |
| Project 18 EN | October West Sumed Maintenance | October West Sumed Development & Maintenance ("Sumed" still to confirm) | Arabic "تطوير وصيانة" |
| Project 19 EN | October Northern Sector Maintenance | October Northern Sector Development & Maintenance | Arabic "تطوير وصيانة" |
| Project 20 EN | Mokattam Maintenance | Mokattam Development & Maintenance | Arabic "تطوير وصيانة" |
| Project 21 EN | Zahraa Maadi Maintenance | Zahraa Maadi Development & Maintenance | Arabic "تطوير وصيانة" |
| Project 22 EN | Maadi Nerco Maintenance | Maadi Nerco Development & Maintenance | Arabic "تطوير وصيانة" |

**Not changed (client must confirm):** projects 1, 2, 5, 6, 18, 24, 27 English names, the hero headline (T-22), and the company legal name. All are listed in the QA report.

> ✅ Approved 2026-09-14. The same list is in `docs/projects-inventory.xlsx`, column "Corrected English name". Separators keep the source's ASCII " - " style.

---

## 3. Video plan (T-10)

**Source facts:**
- `Final.mp4`: 1920×864 (20:9), 29.97 fps, H.264 2.9 Mb/s + AAC stereo, 3:12, 70.5 MiB.
- Frame review at 6 s intervals:
  - 0–6 s: logo intro over a loader
  - ~6–60 s: loaders and graders
  - ~60 s: surveyor
  - ~64 s: white flash transition
  - ~72 s: motion blur
  - ~78–138 s: graders under blue sky
  - ~144–156 s: split-screen blur transitions
  - ~156–186 s: aerial shots of the finished road
  - ~186–192 s: logo outro

**Edit.** A ~45–55 s highlight built from 2–3 clean ranges, avoiding the flash, blur and split-screen transitions:
- ~24 s of grader action (inside 78–138 s)
- ~20 s of aerial road (inside 156–186 s)
- optionally the ~5 s logo outro

Exact in/out points get picked at 1 fps in Phase 4, and a frame sheet of the result goes into the QA report. Hard cuts only; no re-editing, titles or music.

**Encode** (portable ffmpeg 7.1 with libx264 and libvpx-vp9; the original is untouched):
| Output | Settings | Target |
|---|---|---|
| `highlight.webm` | VP9, 1280×576, 2-pass, ~0.9–1.1 Mb/s, `-row-mt 1`, **no audio** (`-an`) | 5–8 MB |
| `highlight.mp4` | H.264 High, 1280×576, 2-pass, ~1.0–1.2 Mb/s, `+faststart`, `-an` | 5–8 MB |
| `highlight-poster.webp` / `.jpg` | one sharp frame (grader under blue sky), 1280×576 | ≤ 100 KB |

If a 50 s cut can't hit good quality within 8 MB, I'll shorten the cut rather than exceed the budget.

**Markup and behaviour:**
```html
<video muted loop playsinline preload="none" poster="…poster.jpg" width="1280" height="576">
  <source src="…highlight.webm" type="video/webm">
  <source src="…highlight.mp4"  type="video/mp4">
</video>
<button class="video-toggle" aria-pressed="false">إيقاف / Pause</button>
```
- `autoplay` is started by JS only when the section is ≥ 25% visible, and the video pauses when it leaves the viewport. This saves the 5–8 MB for visitors who never scroll that far (the client's "autoplay" intent, done lazily).
- **Reduced motion:** no autoplay; the poster shows with a Play button.
- **Visible Pause/Play button:** WCAG 2.2.2 requires one for auto-moving content longer than 5 s.
- **No JS:** poster plus native `controls`.
- `Final.mp4` moves to `source-assets/video/` and is never copied to `dist/`.

---

## 4. Contact form decision (T-06)

**Decision (client-confirmed): Formspree `mjkeplye` → elbasha.constructions@gmail.com**, with **WhatsApp/Call as the equally prominent primary channels** beside it. This is a backend-less approach.

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Formspree (free tier)** | Already set up and owned by the client; no backend; spam filtering; email delivery | Monthly submission cap on the free plan (check the current number at formspree.io/plans; historically **50/month**); Formspree branding on the no-JS confirmation page; third-party processor of visitor data | **Chosen** |
| `mailto:` | No service | Depends on a configured mail client (fails on many phones); no confirmation; poor UX | Rejected as primary; the email stays as a link |
| WhatsApp/phone deep links only | Best fit for Egyptian B2B; instant | No written record for users who prefer forms or email | Kept as primary CTAs **alongside** the form |

**Form specification:**
- **Fields:** Name (required), Phone (required, `type="tel"`, `inputmode="tel"`, `autocomplete="tel"`), Email (optional, `type="email"`, `autocomplete="email"`), Message (required, 10+ characters).
  > **This changes the current requirements** (today email is required and phone optional), because phone/WhatsApp is the company's main channel. If you want to keep the original requirements, say so at approval.
- **Hidden fields:** `_subject` = "رسالة جديدة من موقع الباشا (AR)" or "(EN)"; `_gotcha` honeypot (visually hidden, `tabindex="-1"`, `autocomplete="off"`); `page` = submitting URL; `_language`.
- **Labels** are real `<label>`s (not placeholders). Inline errors are linked with `aria-describedby`, and fields get `aria-invalid`. The submit button reads "إرسال / Send".
- **States:**
  - **Idle.**
  - **Validating:** client-side native constraints with localised messages.
  - **Submitting:** button disabled with text "جارٍ الإرسال… / Sending…", `aria-busy`, double-submit prevented.
  - **Success:** form hidden, success panel in an `aria-live="polite"` region, focus moved to it, "send another message" link.
  - **Error:** HTTP 4xx field errors mapped to fields; 5xx or network errors show "لم يتم الإرسال… / Message not sent" plus a **WhatsApp fallback link** and the email; entered data kept.
- **Privacy note** under the button (AR/EN): the message is sent by email via Formspree. This is factual only; there is no legal text to invent.
- **Deployment guide items:** verify the target email in the Formspree dashboard, check the monthly cap and where to see usage, and what happens when the cap is hit (submissions are rejected until the next cycle, so the WhatsApp fallback matters).

---

## 5. Design direction

### 5.1 Colour tokens (derived from the logo; contrast computed with the WCAG formula)
| Token | Value | Use | Verified pairs |
|---|---|---|---|
| `--navy-600` (brand) | `#184098` | Primary buttons, links, headings accent | white text **9.44:1**; on white **9.44:1**; on sand **8.67:1** |
| `--navy-700` | `#123070` | Button hover/active | white text 12.48:1 |
| `--navy-950` | `#0B1B3F` | Footer, dark CTA band, hero overlay | white 16.9:1; `#CBD5E1` 11.38:1; `#94A3B8` 6.59:1 |
| `--orange-500` (brand) | `#F07820` | Accent: primary CTA background **with ink text**, rules, icons, focus ring on dark | ink `#111827` on it **6.26:1**; on navy-950 **5.96:1** · ⚠ white on it is only 2.83:1 → never used |
| `--orange-700` | `#C2410C` | Orange **text** on light backgrounds | on white 5.18:1 |
| `--sand-50` | `#F7F5F2` | Page background (warm neutral, echoes the site photos) | `#1F2937` 13.49:1; `#4B5563` 6.94:1 |
| `--ink-900` / `--gray-600` | `#111827` / `#4B5563` | Body text / secondary text | see above |
| `--wa-green` | `#25D366` | WhatsApp button with `--navy-950` text | 8.52:1 (white on it 1.98:1 → never used) |
| `--error` / `--success` | `#B91C1C` / `#15803D` | Form states | 6.47:1 / 5.02:1 on white |
| Focus ring | 3 px `--navy-600` on light, `--orange-500` on dark, 2 px offset | All interactive elements | 8.67:1 / 5.96:1 (≥ 3:1 required) |

### 5.2 Type, spacing and layout
- **Font:** Cairo variable (weights 400/600/700/800 from one file per subset).
- **Type scale:** fluid `clamp()`, H1 ≈ 2.25→3.5 rem, H2 ≈ 1.75→2.5 rem.
- **Spacing:** 4 px base scale (4, 8, 12, 16, 24, 32, 48, 64, 96).
- **Section padding:** `clamp(56px, 8vw, 112px)`.
- **Container:** max-width 1200 px, inline padding `clamp(16px, 4vw, 32px)`.
- **RTL/LTR:** CSS logical properties throughout (`margin-inline-start`, `inset-inline-end`, `text-align: start`), so one stylesheet serves both directions. Directional icons (arrows) mirror in RTL.
- **Components:** button (primary orange/ink, secondary navy, outline, WhatsApp), card (project, service), section header (eyebrow + H2 + lead), CTA band, tag/pill (category).
- **Hero:** full-bleed real photo as an `<img>` (not a CSS background), navy-950 gradient overlay on the text side, H1 + subtitle + WhatsApp (primary) + Call (secondary). Height `min(88svh, 760px)` on desktop; content-height on mobile so the CTAs are visible without scrolling.
- **Services:** 10 icon cards (inline SVG icon + title). No stock or duplicate photos (U-04); photos are added only when the client supplies them.
- **Header:** white, sticky, gains a shadow after scroll; active page marked.
- **Footer:** navy-950. Logo on a white tile (the logo's black strokes need a light ground). Nav, contact (primary number highlighted, the 2 secondary numbers, email), social icons with labels, ©.

### 5.3 Images (T-14)
| Asset | Treatment |
|---|---|
| Hero (interim until the client supplies #1 from the Images Needed table) | Compare `page1.jpg` (1280×720, upscaled) against a sharp still from the 1920 px video. Use whichever is sharper at 1920 px; mobile crop via `object-position` |
| Services | Icons only (see above) |
| Project 5 `مستقبل_مصر.jpg` | 4:3 crop, WebP/JPEG 480/800/1200 |
| Project 9 `محور_عمرو_بنالعاص.jpg` | 4:3 crop starting right of x≈260 px so the **timestamp overlay is cropped out** (the original is kept); publishing permission is still flagged |
| Project 16 `الطريق_الغربي_اكتوبر.jpg` | Portrait → 4:3 crop centred on the interlock/curb |
| Project 23 `وادي_النطرون.jpg` | 4:3 crop at native 720 px only (no upscaling); flagged low-res |
| Logo | Trim the dark right-edge line (B-15); make the outer white background transparent via flood-fill from the edges (interior whites preserved); export 2× display size PNG + WebP (target ≤ 15 KB) |
| OG image 1200×630 | Composite of a real site photo + the full logo tile (`About.jpg`, which already contains the Arabic/English name as artwork, so no text rendering is needed) |
| Unused `slider1–3.jpg`, `reel 1.mp4`, `About.jpg`, `مصانع الطوب.txt` | Moved to `source-assets/`; not deleted (§15 #15). `slider2`/`slider3` may be used as generic company-work imagery (hero/OG), never captioned as a specific project |

Tools: `sharp` (Apache-2.0) installed on demand by `npm run media`; portable ffmpeg for video. Neither is needed by the host build, because the outputs are committed (~2–3 MB of images plus ~12–16 MB of video).

### 5.4 Icons
Inline SVG only, about 15 icons:
- **UI and services:** from **Lucide** (ISC licence) — menu, close, phone, mail, arrow, play/pause, check, and one per service.
- **Brand glyphs:** from **Simple Icons** (CC0) — WhatsApp, Facebook, LinkedIn.

Licences are recorded in `src/static/licenses.txt`.

### 5.5 Performance budget (per page, mobile, excluding the lazily-loaded video)
| Metric | Target |
|---|---|
| HTML + CSS + JS | ≤ 60 KB compressed |
| Fonts | ≤ 120 KB |
| Images above the fold | ≤ 150 KB |
| Lighthouse mobile | Performance ≥ 90 · Accessibility 100 · Best Practices 100 · SEO 100 on all 9 pages |
| LCP (simulated mobile) | < 2.5 s |
| CLS | < 0.05 |
| TBT | < 100 ms |

---

## 6. What I will explicitly NOT change

| Item | Why |
|---|---|
| The static, no-framework nature of the site | Audit §2 #1: right tool for the job |
| Formspree provider and form ID `mjkeplye` | Client decision 3 |
| The 27 project names beyond §2.1, and the 10 services list | Real client data; the other corrections need confirmation |
| Phone numbers, email, Facebook and LinkedIn URLs | Real data. The Facebook share URL stays as-is (S-10 / §15 #13) |
| Company name wording (logo version used; no "legal name" invented) | §15 #2 |
| No new claims: years, stats, clients, certifications, testimonials, addresses, hours | Hard rule 2 |
| No analytics, cookies or tracking | §15 #14 |
| No deletion of original assets or notes | §15 #15; everything moves to `source-assets/`, git history intact |
| No AVIF, no image CDN, no service worker/PWA offline mode | Marginal gain for this site; more moving parts |
| No push to GitHub and no deployment without your go-ahead | Outward-facing actions |

---

## 7. Deployment target decision

**Needs:**
- Static files from a Node build (`npm run build` → `dist/`)
- ~20 MB of media, including two 5–8 MB video files
- Custom domain + free SSL (domain TBD)
- `_headers`/`_redirects`
- Git-push deploys with previews
- **Commercial use** permitted
- Good latency in Egypt
- $0

| | **Cloudflare Pages** | Netlify (Free) | Vercel (Hobby) | GitHub Pages |
|---|---|---|---|---|
| Commercial company site allowed on free plan | ✅ | ✅ | ❌ Hobby is for personal, non-commercial use → Pro required | ⚠ Allowed for sites, but not intended for commercial business use per its usage limits |
| Bandwidth / requests | Unlimited static requests and bandwidth | Credit-based free plan (monthly credits consumed by bandwidth and builds; site paused when exhausted) | n/a | Soft 100 GB/month |
| Build step | Built-in (Node, `NODE_VERSION`) | Built-in | Built-in | Needs a GitHub Actions workflow |
| Custom headers (CSP, caching) | ✅ `_headers` | ✅ | ✅ | ❌ (meta CSP only; no cache control) |
| Redirects | ✅ `_redirects` | ✅ | ✅ | ❌ |
| Per-file limit | 25 MiB (our largest file ~8 MB after T-10) | fine | fine | 100 MB |
| Preview deploys per branch/PR | ✅ | ✅ | ✅ | ❌ |
| Edge presence for Egypt | Cloudflare data centre in Cairo | Global CDN | Global CDN | Fastly CDN |
| Custom domain + auto SSL | ✅ | ✅ | ✅ | ✅ |

**Decision: Cloudflare Pages.** It is the only option that satisfies commercial use, unlimited bandwidth for the video, custom headers and redirects, and Git-based previews at $0, with no extra CI configuration. The build is `npm run build`, output `dist`, env `SITE_URL` and `NODE_VERSION=24`.

- Cloudflare now also offers "Workers with static assets" as the newer path for static sites. The same `dist/`, `_headers` and `_redirects` work there, so if the dashboard steers towards Workers at deploy time, the guide will cover that path too; no code changes needed.
- Free-plan limits (e.g. builds/month) will be re-checked against the live pricing pages when writing the deployment guide, because they change over time.

**Runner-up:** Netlify, if the client already uses it. Its credit-based free plan is the risk to monitor.

---

## 8. Commit plan (one concern per commit, on branch `improve/production-ready`)
1. `docs: add audit report, projects inventory and implementation plan`
2. `chore: add package.json, .gitignore, .env.example, .node-version`
3. `chore: move original assets and notes to source-assets/ (not deployed)`
4. `build: add zero-dependency static build, preview server and checks`
5. `content: extract projects and services to data files; apply approved text fixes`
6. `feat(i18n): Arabic-first pages at / with English at /en/ and hreflang`
7. `feat(ui): design tokens, typography (Cairo), layout and components`
8. `feat(nav): responsive header with accessible mobile menu`
9. `feat(home): hero, services, featured projects, CTA band`
10. `feat(projects): categorised projects page with photo-pending tiles`
11. `feat(contact): working Formspree form with validation and states`
12. `feat(cta): tel/WhatsApp links and mobile sticky contact bar`
13. `perf(media): optimised responsive images, logo and favicon set`
14. `perf(video): trimmed/compressed WebM+MP4 highlight with lazy accessible player`
15. `chore: remove animate.css, WOW.js and Font Awesome; inline SVG icons`
16. `a11y: landmarks, skip link, focus styles, reduced motion`
17. `seo: meta, Open Graph, sitemap, robots, disabled JSON-LD scaffold`
18. `chore(host): security/cache headers and legacy redirects`
19. `feat: 404 page`
20. `docs: QA report, deployment guide, README`

Each commit builds successfully and passes `npm run check`.

---

## 9. Phase 5 (QA) preview
For every page in both languages, the QA report will record:
- build and `check.mjs` output;
- JS syntax check (`node --check`) and HTML validation (`npx html-validate`, run ad hoc, not added as a dependency);
- console errors;
- internal/external link check;
- puppeteer overflow and tap-target sweep at 320/360/390/768/1280/1920 px;
- keyboard walkthrough and heading outline;
- contrast matrix;
- Lighthouse mobile and desktop before (audit §9) vs after;
- meta/OG/sitemap/robots verification in `dist/`;
- `grep` for `[[NEEDS_CLIENT` and `lorem`;
- `git grep` secret scan;
- a frame sheet of the video cut;
- the list of strings awaiting client sign-off.

---

## 10. Open items this plan leaves as NEEDS CLIENT INPUT
These stay unchanged from audit §15: #2 legal name, #6 project photos and publishing permission, #7 scope wording (hero headline), #8 transliterations marked "confirm", #9 description/address/area/hours, #10 trust signals, #11 domain, #12 brand colours (logo-derived used meanwhile), #13 canonical social URLs, #14 analytics, #15 fate of unused files.

**Three points in this plan need your explicit OK at approval:**
- **(a)** production hides `[[NEEDS_CLIENT]]` blocks, and the drafts build shows them (§1.3);
- **(b)** form requirements change to phone required and email optional (§4);
- **(c)** English names for projects 10–22 are aligned to the Arabic (§2.1).

---

---

## 11. Implementation notes (Phase 4 — what changed from the plan, and why)

| Plan item | What was built | Why |
|---|---|---|
| §1.1 `src/static/` | Split into `src/assets/` (content-hashed) and `src/public/` (copied as-is: `_headers`, `_redirects`, favicons, OG image) | Hashed names allow year-long caching; root files must keep fixed names |
| §1.3 drafts build | Output goes to `dist-drafts/` (git-ignored), with `noindex` and `Disallow: /` | So the drafts can never be deployed by mistake |
| T-02 build | Also `scripts/video.mjs` (reproducible video cut) | The cut can be redone without guesswork |
| T-05 mobile nav | Collapsed by CSS from the first paint; `nojs.css` in `<noscript>` shows the full menu without JavaScript | The JS-only collapse caused a layout shift (Lighthouse CLS 0.153) |
| T-10 video | Cut = 76.5–112 s + 155.5–172 s (52 s); WebM 5.91 MiB, MP4 6.50 MiB, no audio; plays when ≥ 25% visible | Clean ranges from a 1 fps frame review |
| T-13 fonts | Cairo variable woff2: Arabic 30.9 KB, Latin 33.8 KB. Plus metric-matched fallback faces using **installed fonts only** | Removes font-swap layout shift. Variants that looked up missing fonts were measurably slower and were dropped. |
| T-14 hero | Stills from the company video (1920×864) with art-directed 4:5 phone crops: Arabic subject on the left, English on the right. No `<link rel=preload>`; the `<img>` uses `fetchpriority="high"` | Native resolution beats upscaling the 1280 px photo; LCP is already ≤ 2.6 s on mobile |
| T-14 logo | Palette PNG only, 168×112 (8 KB) + 632×421 for About | PNG came out smaller than WebP for this flat artwork |
| T-16 animation | CSS scroll-driven `animation-timeline: view()` instead of an IntersectionObserver script | No JavaScript; content always visible where unsupported; no invisible content in screenshots or renderers |
| Accessibility (found in QA) | `scroll-padding-bottom` for the mobile bar; global smooth scrolling removed; 44 px minimum on nav and footer links; badge colour `#9A3412` | axe-core, tap-target and focus-obscured sweeps (QA_REPORT §6–8) |
| T-24 JSON-LD | Scaffold in `build.mjs`, disabled; the build **fails** if it is enabled while data is still a marker | Prevents publishing invented structured data |
| Media tooling | `sharp` pinned to 0.35.4 | 0.34.x has a high-severity libvips advisory (GHSA-f88m-g3jw-g9cj) |

Commit history on `improve/production-ready` shows each step. The original upload is at tag `original-upload`.
