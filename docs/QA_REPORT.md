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

## 15f. Re-run after client answers batch 3 (2026-09-17)

**What changed**

- **Founded 2010:** added to the About intro in both languages (`about.intro`) and to `site.brand.foundingDate`,
  which the Organization JSON-LD emits as `foundingDate`. There is no "years of experience" counter, as the client asked.
- **Working hours:** «الأحد – الخميس، 10 صباحًا – 5 مساءً» / "Sunday – Thursday, 10:00 AM – 5:00 PM" in
  `site.contact.hours`. They now show on the Contact page card and, new in this batch, in the footer contact list on every page.
  `hours.schema` = `Su-Th 10:00-17:00` feeds `openingHours`. Structured data as a whole is still **disabled**
  (`structuredData.enabled: false`) until the legal name and address arrive, so neither field is in the live HTML yet.
- **Project 28**, «مصنع الطوب في القطامية بالأسمرات» / "Brick Factory – Katameya (Al-Asmarat)", under Brick Factories:
  a name-only card with a photo marker. `projects-inventory.xlsx` row 29 was added and its totals updated (28 projects, 24 without a photo).
  The photo-triage PDF reads its project list from `projects.json`, so it lists #28 too.
- **Documents:** `CLIENT_REQUESTS.md` 36 → 35 items. The two working-hours items were removed, a photo request for
  project 28 was added as item 25, and founding year was dropped from the profile item's examples. All items were renumbered.
  Both PDFs were regenerated. No older PDF copies were left in `docs/`.

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass (SITE_URL unset in this run); 9 pages, 314 files, 35.5 MiB; 32 unique markers hidden (−2 hours, +1 project-28 photo) |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass; 73 markers rendered |
| Horizontal overflow, Contact/About/Projects × AR/EN × 375/1280 px | 0 / 10 pages overflow |
| Footer hours line | One line, clock icon aligned, in the screenshots checked (AR at 375 px, EN at 1280 px) |
| Projects page | 28 cards; #28 renders like the other name-only cards |
| Console errors | none |

## 15g. Re-run after client answers batch 4 (2026-09-17)

**What changed**

- **Legal name** = the name already on the site. `brand.legalName` is now `{ar, en}`. It is used in the footer copyright
  line and in the JSON-LD `legalName`; `og:site_name` already shows the same string.
- **Structured data is on.** A `GeneralContractor` block on both home pages carries name, legalName, alternateName,
  a URL for each language, logo, image, phone, email, areaServed, foundingDate, openingHours and sameAs. It has no address until the client sends one.
  It is emitted only when `SITE_URL` is set. **Latent bug fixed:** the layout HTML-escaped the JSON (`&quot;`), so the block would never have
  parsed; it is now emitted with `raw()` (`<` is already escaped to `<`). `check.mjs` now fails on any JSON-LD that does not parse.
  The new check was tested against a deliberately escaped copy, and it failed as expected.
- **About intro** replaced with the client's text in both languages. The separate `about.profile` slot, its marker and
  its CSS are gone. There was no draft flag on the intro to remove (the `draft: true` flags belong to the service descriptions,
  which are still awaiting review).
- **Trust signals** deferred by the client: the drafts slot and `about.trustMarker` were removed. `CLIENT_REQUESTS.md` lists
  them under «بنود مؤجلة», outside the numbered items.
- **Photos 9, 34, 43** (October New police district, authority clearance confirmed by the client) were added to the gallery
  as the first three curb and interlock items. All three crops are 4:3. A zoom showed that the armoured vans in the background of all
  three read **"EGYPTIAN POLICE"**; the first crops had kept them in frame, so they were redone:
  - 9: 840×630 from (440, 250). The station signs, emblems, flags and the van's marking are out; an unmarked panel of the van and the
    officer standing among the workers remain, since removing him would cut the workers.
  - 34: 1036×777 from (150, 180). The van, the green vehicle and the door emblem are out.
  - 43: 936×702 from (100, 255). The officer, the van and the workers are out, leaving the finished walkway.
  Gallery: 25 items (curb 12).
- **Logo:** `logo.pdf` is **not vector**. It is a Photoshop-exported PDF whose page is one 1299×945 CMYK JPEG plus a 102×21
  "CamScanner" stamp image. It has no path operators and no Illustrator private data. The current logo was kept, and the request stays open
  (asking for the designer's SVG/AI/EPS).
- **Documents:** `CLIENT_REQUESTS.md` 35 → 31 items (profile, legal name and police photos answered; trust signals deferred;
  logo item reworded). `photo-triage.pdf` lost its police-question page (18 pages), and `photo-triage.xlsx` records the clearance.

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass (SITE_URL = https://elbasha.pages.dev); 9 pages, 339 files, 36.7 MiB; 30 unique markers hidden |
| JSON-LD | Parses on `/` and `/en/`; `url` is `/` and `/en/` respectively; absent on inner pages and without SITE_URL |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass; 69 markers rendered |
| Horizontal overflow, 8 pages × 320/375/768/1280/1920 px | **0 / 40** |
| Gallery lightbox, curb filter, AR + EN | Items 1–3 are photos 43, 9 and 34, with correct captions ("1 of 12" … "3 of 12"); no police markings visible |
| About intro | Reads cleanly at 375 px (AR) and 1280 px (EN); no layout change beyond the longer paragraph |
| Console errors / failed requests | none |
| `npm run media` | Deterministic: only the 24 new gallery files changed |

**Lighthouse — not re-run.** The change adds 3 lazy gallery images below the fold and one JSON-LD block of about 0.6 KB on the home pages.

## 15h. Re-run after client answers batch 5 (2026-09-18)

**What changed**

- **Written address**, Arabic and English, in `site.json` → `contact.address`. It is shown on the Contact card above the map
  link and in the footer on every page. In the footer the map link now sits directly under the address, with an external-link
  icon instead of a second pin. The footer contact rows are top-aligned, so the pin stays on the first line when the address wraps
  (three lines in Arabic at 1280 px).
- **JSON-LD address** is a `PostalAddress` in the page language: `streetAddress` = floor, building, landmark, district
  (everything before the city), `addressLocality` = القاهرة / Cairo, `addressCountry` = `EG`. The source is `contact.address.postal`.
- **Service descriptions:** all 10 approved as written. The `draft: true` flags are removed, and the build no longer lists them.
- **Photo permission** for the Amr Ibn Al-As Axis and October Western Sector project photos is granted, so both `photoNote` markers were removed.
  Neither photo was in client batch 1, so `photo-triage.xlsx` is unchanged.
- **`scripts/docs-pdf.mjs` fix:** the page was loaded with `setContent()` (`about:blank`), which cannot load the `file://` Cairo
  fonts, so every `CLIENT_REQUESTS.pdf` since batch 2 was set in Segoe UI. It now renders from a temporary HTML file, and the PDF embeds Cairo.
- **Documents:** `CLIENT_REQUESTS.md` 31 → 26 items (items 1, 26–27 and 29–30 answered; renumbered 1–26; the logo item is marked optional).
  It now also points to `photo-triage.pdf` for the project numbers of photos already sent. Both client PDFs were regenerated
  (CLIENT_REQUESTS 4 pages, photo-triage 18 pages).

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass (SITE_URL = https://elbasha.pages.dev); 9 pages, 339 files, 36.7 MiB; 26 unique markers hidden (was 30) |
| `npm run build` without SITE_URL | ✅ pass; no JSON-LD emitted |
| JSON-LD | Parses on `/` and `/en/`; `address` is a PostalAddress in Arabic and in English respectively |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass; 50 markers rendered (was 69) |
| Horizontal overflow, 8 pages × 320/375/768/1280/1920 px | **0 / 40** |
| Contact card + footer address, AR/EN × 375/1280 px | Wraps cleanly; icon on the first line; map link directly below; tap targets on the links still 44 px |
| Console errors / failed requests | none |

**Lighthouse — not re-run.** The change adds one short text line per page and a few hundred bytes of JSON-LD on the home pages.

## 15i. Re-run after client answers batch 6 and media batch 2 (2026-09-18)

**What changed**

- **Four projects** (29 Brick Factories; 30, 31 and 32 Development & Maintenance) in `projects.json` and
  `projects-inventory.xlsx` (rows 30–33, totals 32 / 5 with images / 27 without). 29, 31 and 32 are name-only cards.
- **Project 30 photos:** six photos triaged as 197–202 (see `MEDIA_PROPOSAL.md` §7): 3 on the card, 2 in the
  gallery, 1 rejected. New: a project card can carry a photo set, which opens in the gallery's lightbox. `gallery.js` now
  steps through either the filtered grid or one card's set.
- **Home page:** featured cards are now "the first four projects with photos", which keeps the same four as before.
- **Sitemap:** unchanged, and nothing was needed. Projects have no pages of their own: they are cards on `/projects/` and
  `/en/projects/`, and both are in `sitemap.xml`.
- **Triage pipeline:** the police-site clearance from batch 4 had been patched into `triage.json` by hand. It is now
  `POLICE_CLEARED` in `triage_notes.py`, so a rebuild reproduces it. The regenerated `photo-triage.xlsx` was diffed
  against the committed one: the only changes are the 6 new rows, the Project # column, the Summary sheet and the
  project list.
- **Documents:** `CLIENT_REQUESTS.md` 26 → 29 items (photo requests for projects 29, 31, 32). Both client PDFs were regenerated.
  `photo-triage.pdf` still asks about the same 92 items; its cover thanks the client for the project 30 photos, and the
  32-project list was tightened to fit on one page (18 pages).

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass (SITE_URL = https://elbasha.pages.dev); 9 pages, 371 files, 38.5 MiB; 29 unique markers hidden (was 26) |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass; 56 markers rendered (was 50) |
| `npm run media` | Deterministic: only the 32 new image files and their `images.json` entries |
| Horizontal overflow, 8 pages × 320/375/768/1280/1920 px | **0 / 40** |
| Projects page, AR + EN | 32 cards (5 / 4 / 17 / 6 per category); 5 with photos; gallery 27 items |
| Project 30 card | Badge "3 صور" / "3 photos"; the viewer steps 1 → 2 → 3 → 1 with the right captions; Esc returns focus to the card |
| Gallery, roads filter | 9 items; tanker (198) opens as "8 of 9" with its caption |
| Home | Same four featured projects as before |
| Without JavaScript | The card links to the full-size lead JPEG; the 2 other links stay hidden |
| Console errors / failed requests | none |

**Lighthouse — not re-run.** The projects page gains 5 lazy images below the fold. The home page is unchanged.

## 15j. Re-run after client answers batch 7 (2026-09-18)

**What changed**

- **«عملاؤنا وشركاؤنا» / "Our Clients & Partners"** on the home page (after the projects, before the video) and on the About
  page (after «معداتنا», before the CTA band, on a white background so the sections keep alternating). One component
  (`clientsSection`), with data in `src/data/clients.json`: 28 companies in the client's order (well-known groups first,
  then the rest as listed). The client confirmed that every company agreed to be named.
- **Text only.** Names are shown in the page language in equal tiles. No logo was drawn, fetched or approximated. The lead
  is the neutral "نفخر بالعمل مع:" / "Proud to have worked with:", with nothing about the nature or size of the work.
- **Layout:** centred flex rows of 2 / 4 / 7 columns (below 576 px / from 576 px / from 1200 px). All three divide 28, so every
  row is full; with another count the last row stays centred.
- **Documents:** `CLIENT_REQUESTS.md` 29 → 30 items. The new item 30 is optional: confirm the English spellings (especially 7 and 11–23), and send
  logo files if the companies want logos shown. It carries the full 28-name table. The deferred trust-signals section was removed.
  `CLIENT_REQUESTS.pdf` was regenerated (5 pages). `photo-triage.pdf` does not mention clients and was not regenerated.

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass (SITE_URL = https://elbasha.pages.dev); 29 unique markers hidden (unchanged) |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass |
| Horizontal overflow, 8 pages × 320/375/768/1280/1920 px | **0 / 40** |
| Clients section, home + About × AR/EN × 375/600/768/1024/1280/1920 px | 28 tiles each time; 2 / 4 / 4 / 4 / 7 / 7 columns; no name clipped; first "أوراسكوم" / "Orascom", last "الفهد" / "El Fahd" |
| Section order | Home: projects (white) → clients (sand) → video (navy). About: equipment (sand) → clients (white) → CTA |
| Console errors | none. The QA script logged aborted requests for the home video: the clients section sits just above it, so scrolling there starts the autoplay download, and navigating away cancels it. Loaded on its own, the video reaches `readyState` 4 with no error. |

**Lighthouse — not re-run.** The change is about 2 KB of HTML on the four pages that show the section, plus 1.2 KB of shared CSS; no images or scripts.

## 15k. Re-run after client requests batch 8: company film with sound, larger logo (2026-09-18)

**Video**

- **Budget decision (client).** FINAL.mp4 runs 3:12.5, so ~10 MB per format leaves ~415 kb/s for picture and sound combined. The dustiest
  20 s were test-encoded and compared frame by frame: 960 px at ~400 kb/s smeared the grille and blurred the "CG060" marking on the
  grader, while 1280 px at VP9 650k + Opus 64k / H.264 800k + AAC 96k looked like the previous highlight clip. The client chose the
  latter: **`final.webm` 16.6 MiB, `final.mp4` 20.8 MiB**, 1280×576, 25 fps, full length, stereo sound, under Cloudflare's 25 MiB/file.
  The master's letterbox bars are cropped (20:9). The edit already opens and closes on the company logo (last frame ≈ 189.5 s, no
  trailing black), and that frame is the section poster.
- **Hero** (≥ 48em): the still still paints first (LCP unchanged). `main.js` attaches the film after `load`, or at the latest 3 s after the
  script runs, and autoplays it muted; it fades in once playing. The button «شغّل الصوت» / "Turn sound on" unmutes it and restarts it from 0.
  It then plays once and stops on the logo frame; the button becomes «كتم الصوت» / "Mute". A pause button meets WCAG 2.2.2. The muted
  loop pauses off screen and in background tabs. There is no autoplay with reduced motion or Save-Data, but the button still works.
- **Phones** (< 48em): the hero stays the still and downloads no video. The same button plays the film with sound in the video section,
  which is now a plain player (native controls, `preload="none"`, logo poster) with sound on ▶. The highlight and reel clips and the
  reel master are retired.
- **Apple WebKit gets the MP4 first** (`navigator.vendor`, which covers Safari and every iOS browser). Playwright's WebKit stalled on the
  WebM, while every Apple device decodes H.264 in hardware. Elsewhere the smaller WebM stays first. Source types carry exact codecs.

**Logo**

- New source `source-assets/images/logo-hires.png`: the 1299×945 raster inside the client's `logo.pdf`, the same artwork as the old
  logo.png but cleaner. Mark 1004×674 px (was 812×447); the full logo with the name is 1023×850. **Largest clean size** at 2 image px per
  CSS px: mark ≈ 500×335, full logo ≈ 510×425 CSS px.
- Header 52 → **64 px** from 62em (header 72 → 80 px), 44 → **52 px** below; footer 56 → **96 px**. All come from one 286×192 PNG (13.5 KB).
  About: the full logo with the name, 176–260 px wide, above the intro (`logo-full.png`, 520×432, 40 KB).

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` | ✅ pass (SITE_URL set); 9 pages, 369 files, 56.0 MiB |
| `npm run build:drafts` + `check.mjs --drafts` | ✅ pass |
| Horizontal overflow, 8 pages × 320/375/768/1280/1920 px | **0 / 40** |
| Chrome, autoplay policy "user gesture required": desktop AR/EN 1280, tablet 768 | Hero autoplays muted (WebM); the sound button → unmuted and restarted (3.8 s → 0), label «كتم الصوت»/"Mute"; second click mutes; pause works |
| Chrome, phones AR/EN 375 | No hero video requested (only the 30 KB section poster); the sound button → the section film plays unmuted from 0 |
| Chrome, reduced motion | No autoplay, no video requested; the sound button still plays the hero with sound |
| WebKit (Playwright 26.6): iPhone 13, iPad, desktop | iPhone: the button plays the section film (MP4) with sound. iPad/desktop: the hero autostarts through the 3 s fallback and restarts with sound on tap. The page load event completes (it stalled before the MP4-first change) |
| Header / footer logo sizes | 77×52 (≤ 61.99em), 95×64 (desktop); footer 143×96; no overflow at 320 px |
| Console errors | none |

**Not verifiable here:** a real iPhone and a real Android phone. Playwright's WebKit is Apple's engine but not iOS Safari's media stack.
DEPLOYMENT_GUIDE §11 D now includes the hero-film and Low Power Mode checks, to run on real devices.

**Live follow-up (2026-09-18 → 19).**
- **Byte ranges:** Cloudflare Pages answers `Range` requests with `200` and the whole file, never `206`. This held for
  `final.mp4`, `final.webm`, the old highlight clip of the first deploy and a small image. The local preview server does honour
  ranges, which is why local tests could not show it. Apple lists byte-range support as a requirement for iOS media, so an HLS
  version for Apple devices was proposed as a fallback.
- **Real iPhone: ✅ plays with sound** on the live site (tested by the team, 2026-09-19). The iPhone/HLS item is **closed; no HLS is
  needed**. Seeking and the iPad hero were not part of that report; they stay covered by the DEPLOYMENT_GUIDE §11 D checks.
**Lighthouse — not re-run.** The hero still stays the LCP element, and the film only starts after load, from tablet width up.

## 15l. Map link: dropped pin, address as the link text (2026-09-19)

**What changed**

- The bare coordinate link (`maps?q=29.9739548,31.315296`) opened the neighbouring business «شركة البارون». `contact.mapUrl` is now
  the dropped-pin link `https://www.google.com/maps/search/?api=1&query=29.9739548,31.315296` (client, 2026-09-19).
- **Contact card and footer:** the address itself is the link. The separate «عرض على الخريطة» / "View on map" link and its strings are
  gone. On the card the address flows as text with the new-tab icon after its last word; in the footer the pin stays on the first line.
- **JSON-LD:** `hasMap` carries the same URL (home pages, AR and EN).
- **Update (client, 2026-09-19):** the address went back to plain text, and the separate «عرض على الخريطة» / "View on map" link under
  it is restored on the contact card and in the footer, exactly as before, now pointing to the dropped-pin URL. `hasMap` stays.
  Re-checked: builds pass, the new URL is on 11 links + 2 JSON-LD blocks and `?q=` appears nowhere, the link name is «عرض على الخريطة» /
  "View on map" + the new-tab hint (44 px tall), overflow is 0/40, and there are no console errors.

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` (SITE_URL = https://elbasha-contracting.pages.dev), `build:drafts` | ✅ pass |
| Map URL in `dist/` | New URL on 11 links (9 footers + 2 contact cards) and in 2 JSON-LD blocks; the old `?q=` link appears nowhere |
| Link names, AR/EN × 375/1280 px | The full address + «(يفتح في نافذة جديدة)» / "(opens in a new tab)"; `target=_blank rel=noopener`; 51–122 px tall |
| Horizontal overflow, 8 pages × 320/375/768/1280/1920 px | **0 / 40** |
| Console errors | none |

## 15m. "We supply" strip below the hero (client requests batch 9, 2026-09-19)

**What changed**

- **«نورّد جميع أنواع» / "We supply"** on both home pages, directly after the hero (not inside it): a heading, one line of
  lead text, the 7 materials from the manager as icon tiles, and a **«اطلب عرض سعر على واتساب» / "Get a quote on WhatsApp"**
  button. The button opens `wa.me/201116111015` with a prefilled message («مرحبًا، أريد عرض سعر لتوريد مواد.» /
  "Hello, I would like a quote for material supply.").
- **Data:** `src/data/materials.json` (names from the manager; "all sizes / all grades" as a second line). The strip is a plain
  `<ul>` of text with decorative icons. It is not revealed on scroll, so it never starts hidden.
- **Icons:** `brick-wall` from lucide. Six new ones drawn on lucide's 24 px grid, because lucide has no icons for these materials:
  cement block, interlock (I-shaped paver), curbstone profile, keystone (arch with a solid keystone), crushed stone, sand heap.
- **Layout:** phones: 2 tiles per row (icon beside the name), button full width below the list. From 36em: 4 per row, icon above
  the name. From 62em: all 7 in one row, with the button beside the heading.
- **Material Supply service description** (AR/EN) now names the seven materials.

**Checks**

| Check | Result |
|---|---|
| `npm run build` + `check.mjs` (SITE_URL = https://elbasha-contracting.com), `build:drafts` | ✅ pass; 9 pages, 369 files |
| Strip markup | 7 items on `/` and `/en/`; the WhatsApp link is URL-encoded, `target=_blank rel=noopener`, with the new-tab hint |
| Horizontal overflow, home AR/EN × 320/390/768/1366/1920 px | **0 / 10** |
| Where the strip starts (top edge, px from the top of the page) | 1920×1080: 841, so the heading and most tiles show before any scrolling · 1366×768: 757, at the bottom edge · 390×844: 816, below the fold on phones |
| Lighthouse accessibility / best practices / SEO, home AR/EN, mobile and desktop | **100 / 100 / 100** |

**Lighthouse performance, mobile** — 5 runs each, alternating between this build and the previous commit (`6203a2a`) on the same
machine, against `node scripts/serve.mjs`:

| Page | Before (median) | After (median) | TBT median before → after | LCP median before → after |
|---|---|---|---|---|
| `/` | 91 | **91** | 332 → 340 ms | 2.22 → 2.22 s |
| `/en/` | 87 | **92** | 466 → 317 ms | 2.07 → 2.13 s |

Desktop: 100 on both pages. Single runs vary from about 79 to 98 on this machine for both builds, because of blocking time in
`main.js`, which this change does not touch. The only layout shift (0.06, the first cold run only) is in the hero, is present before
the change too, and is not caused by the strip.

## 16. Result

The frontend is ready for production: it builds, validates, and passes the accessibility, responsive, functional and SEO checks above.

Since 2026-09-16 it also carries the client's own photos and video: see §15d, §15e and `docs/MEDIA_PROPOSAL.md` §5–§6 for what is published and what is still waiting on the client.

**Before launch:**
- Set `SITE_URL` to the real domain.
- Run the post-deploy checks in DEPLOYMENT_GUIDE §11, including one real form submission.
- Get client answers for the items in §13 above and AUDIT_REPORT §15.
