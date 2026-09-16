# Al-Basha (الباشا) Website — QA Report

**Phase:** 5 (QA) · **Date:** 2026-09-15 · **Branch:** `improve/production-ready` · **Build tested:** production, `SITE_URL=https://elbasha-website.pages.dev`. That domain is a placeholder for testing; the real domain is still NEEDS CLIENT INPUT.

## Summary

**Result: the frontend is ready for production.** Every automated check passes. The open items are listed in §15 and §16: client content, one real Formspree submission after deploy, and browsers other than Chromium.

**Build and code checks**
- The build (`npm run build`) passes with 0 errors, including its own post-build checks (§2).
- The HTML validator shows no real errors. 9 findings are accepted, with reasons in §3.
- The JavaScript syntax check passes for all 12 JS/MJS files.

**Browser checks**
- **Console:** 0 errors or warnings across 54 page loads (9 pages × 6 widths).
- **Links:** 0 broken internal links or anchors.
- **Responsive:** 0 horizontal overflow at 320 / 360 / 390 / 768 / 1280 / 1920 px.
- **Tap targets:** 0 smaller than 44×44 px on phone and tablet widths.

**Accessibility**
- **axe-core** (WCAG 2.2 AA + best practice): **0 violations** on all 9 pages at 390 and 1280 px.
- **Lighthouse Accessibility:** **100** on every page, mobile and desktop.

**Lighthouse scores**

| Category | Mobile (median of 3 runs) | Before |
|---|---|---|
| Performance | **90–100** | 56–82 |
| SEO | **100** on all 8 indexable pages | 91 |
| Best Practices | **100** | 96–100 |
| Layout shift (CLS) | ≤ 0.095 everywhere | — |

Desktop Performance is **100** on every page.

**Form, video and content**
- **Contact form:** all 7 scenarios pass in Arabic and English, and the form still submits with JavaScript disabled.
- **Video:** downloads nothing until its section is visible, plays muted in view, can be paused, and doesn't autoplay with reduced motion.
- **Secrets:** none found.
- **Leftovers:** 0 `[[NEEDS_CLIENT` markers and 0 "lorem" in the production output.

---

## 1. Environment and tools

| Item | Version / setting |
|---|---|
| OS / Node | Windows 11 Pro · Node.js 24.19.0. Cloudflare builds use `.node-version` = 24. |
| Browser | Google Chrome 152.0.7977.83 (headless) via puppeteer-core 25.11.0 |
| Lighthouse | 13.4.1: default mobile (simulated slow 4G, 4× CPU) and `--preset=desktop` |
| Accessibility engine | axe-core 4.13.0, tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice` |
| HTML validation | html-validate 9.7.1 with `html-validate:recommended`; trailing-whitespace and redundant-role rules turned off |
| Server | `node scripts/serve.mjs`, which behaves like the host: case-sensitive paths, `_headers`, `_redirects`, the 404 page, gzip/brotli and Range requests |

All QA tools ran from a scratch directory. Nothing was added to the project, which still has **zero dependencies**.

---

## 2. Build and project checks

```
$ SITE_URL=https://elbasha-website.pages.dev npm run build
Built production site → dist (74 files, 15.2 MiB)
Hidden blocks awaiting client input (64 unique [[NEEDS_CLIENT]] markers): …
Checked dist: 9 HTML pages, 74 files, 15.2 MiB
✔ All checks passed
```

`scripts/check.mjs` runs on every build and fails it if any of these break:

**Links and assets**
- Every internal `href` / `src` / `srcset` / `poster` and CSS `url()` points to a real file.
- Every `#anchor` target exists.
- Every sitemap URL (8 expected) maps to a real page.

**Page structure**
- Exactly one `<h1>`, a `<main id="main">` and a skip link on each page.
- `lang` and `dir` are set and agree with each other.
- Titles and meta descriptions are unique.
- Every `<img>` has `alt`, `width` and `height`.
- Every `target=_blank` link has `rel=noopener`.

**Deploy output**
- No file larger than 25 MiB (Cloudflare's limit).
- No source assets, `.txt` notes or non-ASCII file names.
- No `[[NEEDS_CLIENT` markers in production, and no "lorem ipsum".

| Check | Result |
|---|---|
| `npm run build` (production) | ✅ pass |
| `npm run build:drafts` | ✅ pass; 114 markers shown visibly in `dist-drafts/` |
| JS syntax (`node --check`) on 2 browser scripts, 4 build scripts and 6 templates | ✅ pass |
| Lint / type-check | Not applicable. There is no ESLint or TypeScript, because the project keeps zero dependencies (plan §1.2). The syntax check, HTML validation and the build checks above cover that role. |
| Unit tests | The project has none. The behaviour tests in §6–§9 ran with puppeteer from the scratch directory. |
| Dependency audit | The project has no runtime or dev dependencies. The image tool that `npm run media` installs on demand is pinned to `sharp@0.35.4`, and `npm audit` reports **0 vulnerabilities**. The earlier 0.34.x version had a high-severity libvips advisory, GHSA-f88m-g3jw-g9cj. |

---

## 3. HTML validation

All 9 pages were validated. There are 9 findings, all accepted:

| Rule | Count | Why it's accepted |
|---|---|---|
| `tel-non-breaking` | 8 | The flagged space is between the words of the button label "اتصل بنا" / "Call us". The phone numbers themselves use non-breaking spaces (fixed in `f6a58bb`). |
| `long-title` | 1 | The `/en/` title is 68 characters on screen. The validator counts the `&amp;` entity in the source, which makes 72. |

---

## 4. Console errors and network failures

There were **0 errors and 0 warnings** in 54 page loads (9 pages × 6 widths). That includes CSP violations, because the preview server applies the production `_headers` security policy. There were also **0 failed requests**.

---

## 5. Links

**Internal:** all internal links, assets and anchors resolve (checked by `check.mjs` on every build). The language switcher on each page points to the same page in the other language (8/8).

**External** (checked with `curl` on 2026-09-15):

| URL | Result |
|---|---|
| `https://wa.me/201116111015` | ✅ 200, redirects to `api.whatsapp.com/send/?phone=201116111015` |
| `https://www.linkedin.com/company/elbashaconstructions/` | ✅ 200 |
| `https://www.facebook.com/share/1b3x72sW7X/` | ⚠ 200 with a simple user agent (redirects to the company page) but 400 with a full browser user agent. Facebook blocks automated clients, so **check this link by hand** after deploy. |
| `https://formspree.io/f/mjkeplye` | ✅ 405 on GET, which is expected: the endpoint only accepts POST |

**Old URLs** (checked on the preview server, which applies `_redirects`):
- `/HTML/About.html` → **301** to `/about/`
- `/HTML/services.html` → **301** to `/projects/`
- `/about` → **308** to `/about/`

**Case sensitivity:** `/About/` returns **404**. That proves the preview treats paths case-sensitively like the real host, so the original broken About link (audit item B-03) can't come back unnoticed.

---

## 6. Responsive behaviour

**Horizontal overflow**
- Checked on 9 pages at 320 / 360 / 390 / 768 / 1280 / 1920 px (`scrollWidth > clientWidth`).
- Result: **0 of 54** combinations overflow.

**Tap targets**
- All links, buttons and inputs at widths up to 768 px must be at least 44×44 px.
- Links inside running text are exempt, per WCAG 2.5.8.
- Result: **0** too small.

**Visual review**
- Screenshots of both languages were reviewed at 390 and 1440 px.
- Problems found and fixed during QA:
  - On phones, the 23 project cards without photos were full-width tiles. They are now compact, and the projects page went from 13,454 px tall to 7,073 px.
  - Services show 2 columns on phones and 5 on wide screens.
  - The email address wrapped in the middle of a word; it now breaks after the @.
  - The form's error and success panels were visible before anything was submitted, because a CSS `display` rule overrode `[hidden]`.

**Mobile header without JavaScript**
- ✅ `nojs.css` shows the full link list, hides the menu toggle, and nothing overflows.

---

## 7. Keyboard and focus

**Skip link:** ✅ the first Tab shows it, and Enter moves focus to `<main>`.

**Desktop tab order on the home page:** ✅ skip link → brand → 5 nav links → language switch → call button → hero WhatsApp → hero call → "view all projects" → …

**Focus indicator:** ✅ a 3 px solid outline on every focusable element. It is navy `#184098` on light backgrounds (8.67:1) and orange `#F07820` on dark ones (5.96:1).

**Mobile menu:** ✅
- Enter opens it: `aria-expanded` becomes true, the label changes to "إغلاق القائمة", focus moves to the first link, and the sticky contact bar hides.
- Escape closes it and returns focus to the toggle.

**Focus hidden by the sticky contact bar** (6 pages at 390 px, 469 focus stops)
- ✅ **0** focused elements are fully hidden (WCAG 2.4.11, level AA).
- 6 are partly covered: the tall message textarea. That only matters for the stricter AAA criterion 2.4.12.

**Heading outline:** one `<h1>` per page and no skipped levels.
- **Home:** H1 company name → H2 services (10 × H3) → H2 selected projects (4 × H3) → H2 video → H2 call-to-action → footer H2s.
- **Projects:** H1 → 4 × H2 categories (27 × H3 projects).

---

## 8. Colour contrast

**Automated:** axe-core found 0 contrast violations across the 18 page/width runs. It can't calculate text over photos and gradients and marks those "incomplete", so I checked them by hand. Hero and page-hero text sits on a navy `#0B1B3F` overlay at 72–92% opacity on the text side.

**Colour pairs used on the site** (WCAG formula; normal text needs 4.5:1):

| Text / UI | Background | Ratio | Result |
|---|---|---|---|
| Ink `#111827` (primary button text) | Orange `#F07820` | 6.26:1 | ✅ |
| White (buttons, headings) | Navy `#184098` | 9.44:1 | ✅ |
| Navy `#0B1B3F` (WhatsApp button text) | Green `#25D366` | 8.52:1 | ✅ |
| Body `#1F2937` | Sand `#F7F5F2` | 13.49:1 | ✅ |
| Secondary `#4B5563` | Sand / white | 6.94 / 7.56:1 | ✅ |
| Orange text `#C2410C` (eyebrows, categories) | White / sand | 5.18 / 4.76:1 | ✅ |
| Badge text `#9A3412` | Badge tint `#F6E4D5` | 5.91:1 | ✅ (was 4.18:1, fixed during QA) |
| Footer `#CBD5E1` | Navy `#0B1B3F` | 11.38:1 | ✅ |
| Error `#B91C1C` / success `#15803D` | White | 6.47 / 5.02:1 | ✅ |

The original site's white on `#f4a100` (2.11:1) is gone.

---

## 9. Functional tests

### 9.1 Contact form

Formspree was **mocked** (the request was intercepted in the browser), so no real email was sent. Every scenario passed on both `/contact/` and `/en/contact/`.

**Submit with all fields empty:** ✅
- No request is sent.
- Localised errors appear on name, phone and message, with `aria-invalid` set.
- Focus moves to the name field.

**Invalid phone ("abc") and invalid email:** ✅ no request is sent and both fields are flagged.

**Valid submit (server reply delayed 700 ms), clicked twice:** ✅
- Exactly one POST is sent, with `Accept: application/json`.
- The body contains name, phone, message, `_subject`, `_gotcha`, `_language` and `page`.
- While sending, the button reads "جارٍ الإرسال… / Sending…" and is `aria-disabled`.
- The success panel then appears and receives focus.

**"Send another message":** ✅ the form comes back and focus moves to the name field.

**Formspree returns a 422 field error:** ✅ the field is flagged with **our own localised** message, not Formspree's English text (fixed during QA).

**Server error (500) or network failure:** ✅
- An error alert appears with a WhatsApp fallback link.
- The typed data is kept.
- Focus stays on the submit button.

**JavaScript disabled:** ✅ the form does a native POST to `https://formspree.io/f/mjkeplye`.

**Bug found and fixed during QA:** on a 390 px phone, scrolling could leave the submit button underneath the fixed contact bar. Combined with smooth scrolling, taps sometimes landed on the bar instead of the button. Fixed with `scroll-padding-bottom` and by removing global smooth scrolling (commit `f823ef5`). The form then passed 12 of 12 repeated runs.

⚠ **Not done yet:** a real submission to Formspree. It must happen after deployment (see DEPLOYMENT_GUIDE §11).

### 9.2 Work video

**Files:**
- `highlight.webm` (VP9, 5.91 MiB) and `highlight.mp4` (H.264, 6.50 MiB)
- 1280×576, 52.0 s, **no audio track**
- 60 KB poster image

**Behaviour:**
- ✅ **Cut quality:** reviewed at one frame every 2 s. Grader footage, then the aerial road shot, with no flash, blur or split-screen transitions.
- ✅ **Before scrolling:** 0 video requests; `preload="none"`, muted and paused.
- ✅ **Scrolled into view:** plays muted (Chrome picks the WebM), with the toggle at `aria-pressed=true` and labelled "إيقاف الفيديو".
- ✅ **Pause button:** pauses the video and sets `aria-pressed=false`.
- ✅ **Scrolled away:** pauses automatically.
- ✅ **Reduced motion** (`prefers-reduced-motion: reduce`): no autoplay, the toggle reads "تشغيل الفيديو", and reveal animations are off.
- ✅ **JavaScript disabled:** native controls and the poster are shown.
- **Captions:** not needed, because there's no audio. axe lists `video-caption` only as "incomplete".

---

## 10. Lighthouse: before vs after

**How to read these numbers**
- **Before** is the original site from audit §9: served by `python -m http.server` with no compression, one run per page.
- **After** uses the preview server with compression like the real host. Mobile is the **median of 3 runs** with the range in brackets; desktop is 1 run.
- Identical local runs varied by up to ±10 Performance points, which is why medians are reported.

### Mobile
| Page | Before (mobile) P / A / BP / SEO | Before LCP | After AR `/` pages (mobile, median of 3) P / A / BP / SEO | After LCP · TBT · CLS | After EN `/en/` (mobile, median of 3) P / A / BP / SEO | EN LCP · TBT · CLS |
|---|---|---|---|---|---|---|
| Home | 68 / 83 / 100 / 91 | 4.8 s | **90** (89–90) / **100** / **100** / **100** | 2.3 s · 351 ms · 0.000 | **92** (92–93) / **100** / **100** / **100** | 2.2 s · 287 ms · 0.000 |
| Projects (was "services") | 59 / 86 / 96 / 91 | 6.4 s | **92** (92–95) / **100** / **100** / **100** | 1.7 s · 337 ms · 0.001 | **95** (92–95) / **100** / **100** / **100** | 1.6 s · 250 ms · 0.000 |
| About | 56 / 83 / 100 / 91 | 8.0 s | **96** (92–96) / **100** / **100** / **100** | 1.7 s · 156 ms · 0.095 | **95** (93–100) / **100** / **100** / **100** | 1.5 s · 266 ms · 0.000 |
| Contact | 82 / 88 / 100 / 91 | 3.0 s | **99** (98–100) / **100** / **100** / **100** | 1.7 s · 89 ms · 0.000 | **96** (93–100) / **100** / **100** / **100** | 1.6 s · 232 ms · 0.000 |
| 404 (new) | — | — | 100 / 100 / 100 / 58 ¹ | 1.6 s · 36 ms · 0.000 | (bilingual, same page) | |

¹ The 404 page scores SEO 58 on purpose: it's marked `noindex` and has no meta description.

### Desktop
| Page | Before (desktop) P / A / BP / SEO | Before LCP | After AR (desktop) P / A / BP / SEO | After LCP | After EN (desktop) P / A / BP / SEO | EN LCP |
|---|---|---|---|---|---|---|
| Home | 95 / 83 / 100 / 91 | 1.2 s | **100** / **100** / **100** / **100** | 0.6 s | **100** / **100** / **100** / **100** | 0.6 s |
| Projects (was "services") | 97 / 86 / 96 / 91 | 1.1 s | **100** / **100** / **100** / **100** | 0.5 s | **100** / **100** / **100** / **100** | 0.5 s |
| About | 59 / 83 / 100 / 91 | 4.4 s | **100** / **100** / **100** / **100** | 0.4 s | **100** / **100** / **100** / **100** | 0.5 s |
| Contact | 56 / 88 / 100 / 91 | 6.1 s | **100** / **100** / **100** / **100** | 0.5 s | **100** / **100** / **100** / **100** | 0.5 s |

### Page weight, and "after" measured without compression like "before"
| Page (Arabic) | Before weight | After weight (compressed) | After, **no compression** (same conditions as "before") P / LCP / TBT / CLS |
|---|---|---|---|
| Home | 548 KiB + 70.5 MiB video on play | 235 KiB (video 5.9 MiB loads only when scrolled into view) | 88 / 2.5 s / 373 ms / 0.000 |
| Projects (was "services") | 1035 KiB | 142 KiB | 90 / 2.2 s / 355 ms / 0.000 |
| About | 722 KiB | 91 KiB | 95 / 1.8 s / 167 ms / 0.095 |
| Contact | 384 KiB | 94 KiB | 97 / 2.0 s / 155 ms / 0.000 |

The "before" weight for the projects page leaves out the 23 photos that returned 404.

**Performance decisions made while measuring** (each checked with repeated runs):
- **Header no longer shifts on load.** Before the fix, the full mobile menu rendered until JavaScript collapsed it, pushing the page (CLS 0.153 → 0). The menu is now collapsed by CSS, with a `<noscript>` stylesheet for visitors without JavaScript.
- **Metric-matched fallback fonts kept.** Fallback font faces sized to match Cairo, using fonts already installed on the device, stopped the page jumping when Cairo loads (About CLS 0.17 → 0).
  - The trade-off is a higher lab TBT on some Arabic pages while the font swaps in.
  - I accepted it because layout shift (CLS) is a Core Web Vital and TBT is only a lab estimate.
  - Variants that also named fonts most devices don't have (Helvetica, Roboto, Geeza Pro…) were slower still and were rejected.
- **Reveal-on-scroll uses CSS scroll-driven animations.** No JavaScript is involved, and browsers that don't support them simply show the content.

---

## 11. SEO output (production build)

All items below were verified in `dist/`.

- ✅ **Language attributes:** `<html lang="ar" dir="rtl">` on the Arabic pages and `lang="en" dir="ltr"` on the English ones.
- ✅ **Titles and descriptions:** unique for every page and language (checked by `check.mjs`).
- ✅ **Canonical and hreflang:** `canonical` plus `hreflang` ar / en / x-default (x-default points to Arabic), using absolute URLs built from `SITE_URL`.
- ✅ **Social previews:** Open Graph tags (`og:type`, `site_name`, `title`, `description`, `locale`, `locale:alternate`, `url`, a 1200×630 image with alt text) and `twitter:card=summary_large_image`.
- ✅ **`robots.txt`:** `Allow: /` plus a `Sitemap:` line. The drafts build uses `Disallow: /`.
- ✅ **`sitemap.xml`:** 8 URLs, each with `xhtml:link` alternates for the other language.
- ✅ **Favicon set:** `favicon.ico` (16/32/48 px, 6 KB), `favicon-32.png`, a 180 px `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `site.webmanifest`.
- ✅ **Structured data:** scaffolded but **disabled** (`structuredData.enabled=false` in `site.json`). The build refuses to enable it while the legal name, address or service area are still markers.
- ✅ **Indexable text:** Arabic and English are both real HTML text, not swapped in by JavaScript.

---

## 12. HTTP headers (preview server applying `_headers`)

**Content-Security-Policy:**
```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self' https://formspree.io; form-action 'self' https://formspree.io; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; manifest-src 'self'
```

**Other headers on every page:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy: same-origin`

**Caching:** ✅ files under `/assets/*` have content-hashed names and get `Cache-Control: public, max-age=31536000, immutable`.

Confirm these again on Cloudflare with `curl -I` after deployment (DEPLOYMENT_GUIDE §11).

---

## 13. `[[NEEDS_CLIENT` and "lorem" search

| Search | Result |
|---|---|
| `[[NEEDS_CLIENT` in the production output `dist/` | **0** |
| `[[NEEDS_CLIENT` in the drafts output `dist-drafts/` | 114 shown, as intended for client review |
| `[[NEEDS_CLIENT` in tracked source | 71 occurrences (68 unique markers) in the 5 data files below. The string also appears 7 more times in `scripts/build.mjs`, `scripts/check.mjs` and `src/templates/lib.mjs`, which is the code that *detects* markers. |
| `lorem` (any case) in tracked source | 1, in `scripts/check.mjs:122`: the check that *fails* the build if "lorem ipsum" appears |
| `lorem` in `dist/` | **0** |

### Every remaining marker, by file

A marker used on both the Arabic and English side of the same file is listed once.

**`src/data/site.json`** (10 unique)

- `[[NEEDS_CLIENT: ...]]`
- `[[NEEDS_CLIENT: official legal company name in Arabic and English]]`
- `[[NEEDS_CLIENT: company address in Arabic]]`
- `[[NEEDS_CLIENT: company address in English]]`
- `[[NEEDS_CLIENT: Google Maps link to the office]]`
- `[[NEEDS_CLIENT: governorates / regions served (Arabic)]]`
- `[[NEEDS_CLIENT: governorates / regions served (English)]]`
- `[[NEEDS_CLIENT: working days and hours (Arabic)]]`
- `[[NEEDS_CLIENT: working days and hours (English)]]`
- `[[NEEDS_CLIENT: production domain name]]`

**`src/data/services.json`** (21 unique)

- `[[NEEDS_CLIENT: short description – بناء الطرق]]`
- `[[NEEDS_CLIENT: short description – Road Construction]]`
- `[[NEEDS_CLIENT: short description and which materials – توريد المواد]]`
- `[[NEEDS_CLIENT: short description and which materials – Material Supply]]`
- `[[NEEDS_CLIENT: short description – البنية التحتية]]`
- `[[NEEDS_CLIENT: short description – Infrastructure]]`
- `[[NEEDS_CLIENT: short description – مصانع الطوب]]`
- `[[NEEDS_CLIENT: short description – Brick Factories]]`
- `[[NEEDS_CLIENT: confirm English wording \"Road Planning\" vs \"Road Marking\" for تخطيط الطرق]]`
- `[[NEEDS_CLIENT: short description – أعمال تخطيط الطرق وعبور المشاة]]`
- `[[NEEDS_CLIENT: short description – Road Planning & Pedestrian Crossings]]`
- `[[NEEDS_CLIENT: short description – أعمال تركيب اللافتات الإرشادية والتحذيرية]]`
- `[[NEEDS_CLIENT: short description – Guiding & Warning Signs Installation]]`
- `[[NEEDS_CLIENT: short description – أعمال الإنشاءات للمباني]]`
- `[[NEEDS_CLIENT: short description – Building Construction]]`
- `[[NEEDS_CLIENT: short description – تركيب بردورة وإنترلوك]]`
- `[[NEEDS_CLIENT: short description – Curbstone & Interlock Installation]]`
- `[[NEEDS_CLIENT: short description – أعمال الميول الخرسانية والنيوجيرسي]]`
- `[[NEEDS_CLIENT: short description – Concrete Slopes & New Jersey Barriers]]`
- `[[NEEDS_CLIENT: short description – أعمال دهانات الكباري والنيوجيرسي]]`
- `[[NEEDS_CLIENT: short description – Bridge & Barrier Painting]]`

**`src/data/projects.json`** (32 unique)

- `[[NEEDS_CLIENT: confirm English name of project 1 (\"Asyut Gate October\")]]`
- `[[NEEDS_CLIENT: photo – Asyut Western Road - Asyut Gate October]]`
- `[[NEEDS_CLIENT: confirm English name of project 2 (\"Checkpoint\" for \"مرور الفيوم\")]]`
- `[[NEEDS_CLIENT: photo – Asyut Western Road - Fayoum Silos & Checkpoint]]`
- `[[NEEDS_CLIENT: photo – Asyut Western Road - Samalut Axis]]`
- `[[NEEDS_CLIENT: photo – Asyut Western Road - Minya Gate]]`
- `[[NEEDS_CLIENT: confirm English name of project 5 (\"Future of Egypt Project\")]]`
- `[[NEEDS_CLIENT: confirm spelling \"Talbia\" (project 6)]]`
- `[[NEEDS_CLIENT: photo – Talbia Axis]]`
- `[[NEEDS_CLIENT: photo – Zomor Axis]]`
- `[[NEEDS_CLIENT: photo – Kamal Amer Axis]]`
- `[[NEEDS_CLIENT: permission to publish this photo (timestamp overlay cropped out; people visible)]]`
- `[[NEEDS_CLIENT: photo – Ring Road Development & Widening - Qalyoub Exit]]`
- `[[NEEDS_CLIENT: photo – Ring Road Development & Widening - Mansouria (Haram) Exit]]`
- `[[NEEDS_CLIENT: photo – Ring Road Development & Widening - Bahtim]]`
- `[[NEEDS_CLIENT: photo – Cairo University Roads Development & Widening - Sheikh Zayed Branch]]`
- `[[NEEDS_CLIENT: photo – El-Mothallath (Triangle) Road Development & Widening - Suez]]`
- `[[NEEDS_CLIENT: photo – Suez - Sokhna Road Development & Widening]]`
- `[[NEEDS_CLIENT: permission to publish this photo (workers visible)]]`
- `[[NEEDS_CLIENT: photo – October Southern Districts Development & Maintenance]]`
- `[[NEEDS_CLIENT: confirm spelling \"Sumed\" (project 18)]]`
- `[[NEEDS_CLIENT: photo – October West Sumed Development & Maintenance]]`
- `[[NEEDS_CLIENT: photo – October Northern Sector Development & Maintenance]]`
- `[[NEEDS_CLIENT: photo – Mokattam Development & Maintenance]]`
- `[[NEEDS_CLIENT: photo – Zahraa Maadi Development & Maintenance]]`
- `[[NEEDS_CLIENT: photo – Maadi Nerco Development & Maintenance]]`
- `[[NEEDS_CLIENT: confirm \"New Capital\" for \"العاصمة\" (project 24)]]`
- `[[NEEDS_CLIENT: photo – Brick Factory - New Capital (R1 & R2)]]`
- `[[NEEDS_CLIENT: photo – Brick Factory - Obour City]]`
- `[[NEEDS_CLIENT: photo – Brick Factory - Suez City]]`
- `[[NEEDS_CLIENT: confirm \"15 May City\" spelling (project 27)]]`
- `[[NEEDS_CLIENT: photo – Brick Factory - 15 May City]]`

**`src/i18n/ar.json`** (4 unique)

- `[[NEEDS_CLIENT: confirm hero headline \"تشييد الطرق والكباري\" — does the company construct bridges, or paint them?]]`
- `[[NEEDS_CLIENT: company profile – 2-4 sentences (history, scope, equipment, classification) only if the company wants them published]]`
- `[[NEEDS_CLIENT: about photo – team on site, equipment fleet or office, 3:2, min 1600×1067]]`
- `[[NEEDS_CLIENT: trust signals – clients/owners (with permission), certificates, contractor classification. Leave empty if none.]]`

**`src/i18n/en.json`** (4 unique)

- `[[NEEDS_CLIENT: company profile – 2-4 sentences (history, scope, equipment, classification) only if the company wants them published]]`
- `[[NEEDS_CLIENT: about photo – team on site, equipment fleet or office, 3:2, min 1600×1067]]`
- `[[NEEDS_CLIENT: trust signals – clients/owners (with permission), certificates, contractor classification. Leave empty if none.]]`
- `[[NEEDS_CLIENT: confirm hero headline \"Roads and bridges construction\" — does the company construct bridges, or paint them?]]`


---

## 14. Secrets

I searched the tracked files with `git grep` for `api_key|secret|token|password|bearer|private_key|aws_|sk_live|ghp_|AIza`. The only matches are the comment in `.env.example` ("No secrets are needed by this site") and the CSS comment "Tokens".

- No `.env`, `.pem` or key files are tracked, and `.gitignore` excludes `.env*` except `.env.example`.
- The Formspree form ID is public by design; it's part of the form's `action` URL.

---

## 15. Known limitations and things not tested

1. **Browsers.** Only Chromium (Chrome 152) was tested. Safari (iOS/macOS) and Firefox were not tested on real devices; check them by hand after deploy (checklist in DEPLOYMENT_GUIDE §11).
   - In Firefox the reveal animations simply don't run and the content is visible, by design.
   - Logical CSS properties, `:has()`, `aspect-ratio`, WebM/MP4 and WebP work in all current browser engines.
2. **Real Formspree delivery** was deliberately not tested: it would email the client and use part of the 50-submission monthly quota. Do one real test after deploy.
3. **Lighthouse numbers are lab results** from a local server. Cloudflare (brotli, HTTP/3, a Cairo edge location) should do as well or better, but real phones on Egyptian mobile networks will vary.
4. **The Facebook link** couldn't be verified automatically because Facebook blocks bots; check it by hand.
5. **Hero images** are stills from the company video: native 1920 px but slightly soft. A high-resolution hero photo is still a client request (audit §7.2 #1).
6. **The mobile hero** uses a crop of that still, at most 691 px wide. It's acceptable behind the dark gradient, but a portrait photo from the client would be sharper.

---

**Change after QA:** commit `1e6a134` lets the About profile and the address card render once real text is added.
- I rebuilt the pre-change commit and diffed the result.
- The production HTML of all pages is **identical** apart from asset hashes.
- The only other change is one CSS rule for the not-yet-used `.about-intro__profile` class.
- So the results above still apply.

## 15b. Re-run after client answers batch 1 (2026-09-15)

**What changed**

Content and templates (commits `8749f2f`, `06ec0b2`, `5b0d5e1`):
- Hero headline kept as the company name in both languages; the alternative-headline marker is removed.
- The service is now named "Road Marking & Pedestrian Crossings".
- 7 client-confirmed English project names.
- Service area added.
- Google Maps "عرض على الخريطة / View on map" link in the contact section and footer.
- `site.json` domain set to `null` (deploy on `*.pages.dev`).
- Support for `draft: true` on service descriptions.
- Unused originals moved to the git-ignored `/archive` folder.

The 10 service description drafts were **not** in the client batch, so descriptions remain `[[NEEDS_CLIENT]]` markers, hidden on the live site.

**Checks re-run on the new build** (`SITE_URL=https://elbasha.pages.dev`):

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass (74 files); 52 unique markers hidden in production (was 64) |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass; 93 markers rendered (was 114) |
| JS syntax (`node --check`, 12 files) | ✅ pass |
| HTML validation (9 pages) | Same 9 accepted findings as §3 (`tel-non-breaking` 8, `long-title` 1) |
| Horizontal overflow, 9 pages × 6 widths | **0 / 54** |
| Console / network errors | **0** |
| Tap targets < 44 px (27 page/width combinations) | **0** |
| axe-core WCAG 2.2 AA + best practice (18 runs) | **0 violations** |
| Focus not obscured by the mobile bar (470 focus stops) | 0 fully hidden; 3 partly covered (AAA only) |
| Contact form: all 7 scenarios, Arabic and English (Formspree mocked) | ✅ all pass |
| Video: no early download, plays in view, pause, reduced motion | ✅ |
| Keyboard: skip link, mobile menu open/Escape | ✅ |
| Redirects / 404 / case-sensitivity / cache headers | ✅ unchanged (301, 308, 404, immutable) |
| New map link | Present in the contact card and the footer on all 9 pages; external, `target=_blank rel=noopener` with a visually hidden "opens in a new tab" note; screenshots reviewed at 390 px in both languages |

Lighthouse was not re-run for this content-only batch. The markup change is one link and one card, with no new images, scripts or fonts.

## 15c. Re-run after adding the draft service descriptions (2026-09-15)

**What changed**
- The 10 service descriptions supplied by the developer (Arabic and English) were added to `src/data/services.json` with `"draft": true`, for client review.
- They now show under each service card on `/` and `/en/`; the flag has no visible effect.
- The build lists all 10 as "Draft service descriptions awaiting client review".

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass; 32 unique markers hidden in production (was 52) |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass; 73 markers rendered (was 93) |
| JS syntax (12 files) | ✅ pass |
| HTML validation (9 pages) | Same 9 accepted findings as §3 |
| Horizontal overflow, 9 pages × 6 widths | **0 / 54** |
| Console / network errors | **0** |
| Tap targets < 44 px (27 page/width combinations) | **0** |
| axe-core WCAG 2.2 AA + best practice (18 runs) | **0 violations** (includes contrast of the new description text, `#4B5563` on white, 7.56:1) |
| Focus not obscured (470 focus stops) | 0 fully hidden; 3 partly covered (AAA only) |
| Contact form (7 scenarios × 2 languages), video, keyboard, redirects/headers | ✅ all pass |
| Visual review of the services section | 390 px and 1440 px, both languages: 5-column desktop grid aligned; 2-column phone cards taller but readable; no clipping or overflow |

Lighthouse was not re-run: the change is 20 short text paragraphs, with no new assets or scripts.

## 15d. Re-run after the media build (2026-09-16)

**What changed** — commits `33afc73`, `a86e607`, `8c76cca`, `edd79cd`, `a7e615c`; full detail in `docs/MEDIA_PROPOSAL.md` §5.

- Work video re-cut from the client's 1080p master, plus a 9:16 phone reel with its own poster.
- Four photo service cards, three backdrop photos under the navy overlay (CTA band, projects hero, about hero).
- New "من مواقعنا / From our sites" gallery on the projects page: 22 photos, subject filters, `<dialog>` lightbox, 2.6 KB of JavaScript loaded only on that page.
- About page: site photo instead of the logo card.

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass (SITE_URL = https://elbasha.pages.dev) |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass |
| HTML validation (9 pages) | Same 9 accepted findings as §3 (`tel-non-breaking` 8, `long-title` 1). A tenth finding (`src=""` on the lightbox image) was fixed by creating that image in JavaScript instead of the markup |
| Horizontal overflow, 9 pages × 6 widths | **0 / 54** |
| Console / network errors | **0** |
| Tap targets < 44 px (27 page/width combinations) | **0** |
| axe-core WCAG 2.2 AA + best practice (18 runs) | **0 violations**. Contrast over the new background photos is an "incomplete" for axe (it cannot read text over an image); it was computed by hand for the worst case, a pure white area of the photo: CTA band 5.1:1, page hero 5.8:1, both above 4.5:1 |
| Focus not obscured (478 focus stops) | 0 fully hidden; 3 partly covered (AAA only) |
| Contact form (7 scenarios × 2 languages), keyboard, redirects/headers | ✅ all pass |
| Video source selection | Phones in portrait get `reel.webm` with the portrait poster; ≥ 48em or landscape get `highlight.webm`; switching orientation reloads the right file; reduced motion keeps it paused; without JavaScript the markup alone still picks the reel on phones |
| Gallery (both languages) | Filters set `aria-pressed` and the counts match; the lightbox opens by mouse and by keyboard, Escape and the arrow keys work, the counter follows the filtered set, focus returns to the thumbnail, and without JavaScript all 22 photos show and each links to the full-size image |
| Photo review | Every published photo re-checked at full size: no identifiable faces, no camera stamps, no police or military sites, no readable plates. 003, 014 (uncropped), 124 and 196 were dropped at this stage |

**Lighthouse** — median of 3 mobile runs per page, 1 desktop run, against `node scripts/serve.mjs`:

| Page | Mobile before | Mobile after | Desktop after | LCP | CLS |
|---|---|---|---|---|---|
| `/` | 90 | **92** | 100 | 2.40 s | 0 |
| `/projects/` | 92 | **94** | 100 | 1.96 s | 0.001 |
| `/about/` | 96 | **93** | 99 | 2.13 s | 0 |
| `/contact/` | 99 | **99** | 100 | 1.74 s | 0 |
| `/en/` | 92 | **93** | 100 | 2.36 s | 0 |
| `/en/projects/` | 95 | **96** | 100 | 1.75 s | 0 |
| `/en/about/` | 95 | **96** | 100 | 1.94 s | 0 |
| `/en/contact/` | 96 | **97** | 100 | 1.57 s | 0 |
| `/404.html` | 100 | **100** | 100 | 1.73 s | 0 |

Accessibility, best practices and SEO stay at 100 everywhere (the 404 page scores 58 on SEO because it is deliberately `noindex`).
Two regressions found during the build and fixed before committing:

- **/about/ CLS 0.095.** The two buttons under the company paragraph fit on one row with the fallback font but wrap once Cairo loads. They now stack below 30em, and CLS is 0 again. (The same shift appeared in one pre-media run, so it was an existing flake this change made reliable.)
- **Home mobile 84–90.** The phone poster (86 KB) loads next to the hero image; re-encoded at quality 60 (58 KB), which brought LCP back from 2.73 s to 2.40 s.

## 15e. Re-run after client answers batch 2 (2026-09-16)

**What changed** — the equipment strip (idea 6), two gallery swaps, and the client-facing documents.
Full detail in `docs/MEDIA_PROPOSAL.md` §6.

- **«معداتنا» / "Our Equipment"** on the About page, below "Our Expertise": four photo cards (172, 180, 83, 36) in a
  scroll-snap row. 8 images, 320 and 640 px wide, WebP + JPEG, all lazy — 6.8–34 KB each.
- **Gallery:** 172 and 180 moved out into the strip; **95** (face now cleared) and **162** (cropped) took their
  place, so it holds at 22 items and no photo appears twice on the site.
- **Photo 162 cropped:** the top 155 px come off to remove the photographer's mark. 165 was not published — its mark
  cannot be cropped without losing the bridge railing.
- **Not published: photos 9, 34 and 43.** Face permission was granted, but all three are the October New police
  district, which the standing police/military exclusion still covers. They became item 36 of `CLIENT_REQUESTS.md`.
- **Documents:** `CLIENT_REQUESTS.md` 37 → 36 items (social links and the hero image answered; the police question
  added), `photo-triage.xlsx` gained a "Client clearance (batch 2)" column, and `photo-triage.pdf` stopped asking the
  settled questions — its last page is now the one open question.

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass (SITE_URL = https://elbasha-website.pages.dev); 9 pages, 315 files, 35.5 MiB; 33 unique markers hidden |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass; 73 markers rendered |
| Horizontal overflow, 8 pages × 320/360/390/768/1280/1920 px | **0 / 48** — `scrollWidth === clientWidth` everywhere |
| Equipment row at 390 px | Scrolls inside itself: 4 cards, 251 px each, label visible, nothing clipped. It does not push the page |
| RTL / LTR | The row uses logical scrolling, so it runs right-to-left in Arabic with no extra rules; verified in both languages |
| Section rhythm | The strip sits on the sand background between the white "Our Expertise" section and the CTA band, so the alternation is preserved; cards are white to read as cards |
| Photo review | 95, 162 (cropped), 83 and 36 re-checked at full size. 83 shows both workers from behind; 95 shows one face, cleared by the client; 36's operator is small and turned away. No stamps, no plates, no police sites, no third-party branding |

**Lighthouse — not re-run.** The strip adds 8 lazy images below the fold on one page, none of them the LCP element,
and no new script, font or stylesheet. The gallery swap is two images in, two out, at the same sizes and quality. The
§15d numbers stand. Re-measure if the strip ever moves above the fold.

**Tooling note.** `scripts/docs-pdf.mjs` is new: it renders a docs Markdown file to the client-facing A4 PDF with the
site's own Cairo fonts (`npm run docs:pdf`, which installs `puppeteer-core` on demand the way `npm run media`
installs sharp). The PDFs stay git-ignored. `media-work/analysis/build_pdf.mjs` also stopped depending on a scratch
font download, and its masthead now points at `source-assets/images/logo.png` — the `logo-large.png` it used was
removed in `a7e615c`, so the cover had been rendering without a logo.

## 16. Result

The frontend is ready for production: it builds, validates, and passes the accessibility, responsive, functional and SEO checks above.

Since 2026-09-16 it also carries the client's own photos and video: see §15d, §15e and `docs/MEDIA_PROPOSAL.md` §5–§6 for what is published and what is still waiting on the client.

**Before launch:**
- Set `SITE_URL` to the real domain.
- Run the post-deploy checks in DEPLOYMENT_GUIDE §11, including one real form submission.
- Get client answers for the items in §13 above and AUDIT_REPORT §15.
