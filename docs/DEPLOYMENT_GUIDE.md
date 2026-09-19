# Al-Basha (الباشا) Website — Deployment Guide

**Phase:** 6 · **Date:** 2026-09-15 · **Hosting:** Cloudflare Pages (free plan) · **Form:** Formspree (free plan)

**Live site:** <https://elbasha-contracting.com> (custom domain since 2026-09-19). The Pages project address `https://elbasha-contracting.pages.dev` still serves the same build.

**Code and docs:**
- Code is on branch `improve/production-ready` (not pushed yet).
- Quality results: [`QA_REPORT.md`](QA_REPORT.md).
- Open client questions: [`AUDIT_REPORT.md` §15](AUDIT_REPORT.md) and the [`projects-inventory.xlsx`](projects-inventory.xlsx) sheet.

---

## Deployment Ready Checklist

### Ready now
- [x] The production build passes (`npm run build`), including the automatic link, accessibility-structure and 25 MiB file-size checks.
- [x] Arabic site at `/`, English at `/en/`, with `hreflang`, a canonical URL and Open Graph tags on every page.
- [x] Mobile, tablet and desktop layouts: no horizontal scrolling at 320–1920 px.
- [x] Accessibility: axe-core shows 0 violations; Lighthouse Accessibility is 100 on all pages.
- [x] Lighthouse mobile Performance 90–100; desktop 100.
- [x] Call button (`tel:+201116111015`) and WhatsApp button (`https://wa.me/201116111015`) on every page, plus a sticky contact bar on phones.
- [x] Contact form sends through Formspree (`mjkeplye`), with loading, success and error states; it also works without JavaScript.
- [x] Company film (client batch 8, 2026-09-18): the full 3:12 edit with sound, WebM 16.6 MiB / MP4 20.8 MiB. It plays muted in the home hero from tablet width up, with a sound button and a pause button, and with sound on request in the video section. It respects reduced motion and data-saver settings.
- [x] Security headers (CSP etc.), long-term caching for hashed assets, and 301 redirects from the old `/HTML/*.html` addresses.
- [x] `robots.txt`, `sitemap.xml` (generated once `SITE_URL` is set), favicon set and web manifest.
- [x] No secrets in the repository; the site needs no secret keys.
- [x] The original files are kept in `source-assets/` (not published) and at git tag `original-upload`.

### Do before or at launch
- [ ] Push the branch and merge it into `main` (§8, step 1).
- [x] Create the Cloudflare Pages project and set `SITE_URL` (§8). Live on `elbasha-contracting.pages.dev` since 2026-09-18.
- [ ] Verify the recipient email in the Formspree dashboard, then send **one real test message** (§11).
- [ ] Run the post-deploy checks in §11 on a real iPhone and a real Android phone.
- [x] **Custom domain `elbasha-contracting.com`** connected on 2026-09-19 and `SITE_URL` switched to it (§10, "Current setup"). The client launched on `*.pages.dev` first, as decided on 2026-09-15.
- [ ] (Optional) Redirect `elbasha-contracting.pages.dev` → `https://elbasha-contracting.com` with a Bulk Redirect, and add `www` (§10, "After the domain is active", step 5).

### Waiting on the company
The site works without these items; any missing ones are simply hidden. Details are in §3–§6:
- [ ] Photos for the 27 projects that have none (project 30 got its photos in client batch 6, 2026-09-18)
- [x] ~~Review of the 10 draft service descriptions~~ approved as written (client batch 5, 2026-09-18)
- [x] ~~Written address and working hours~~ (hours: batch 3; address: batch 5, 2026-09-18)
- [ ] About page photo (profile: batch 4; clients & partners: batch 7, 2026-09-18)
- [ ] (Optional) English spellings of the client names and any logo files the companies send
- [ ] Legal company name, social links confirmation, SVG logo, high-resolution hero photo
- [x] ~~Permission to publish two photos that show people~~ granted (client batch 5, 2026-09-18)

**Answered in client batch 1 (2026-09-15) and applied:** hero headline (company name), "Road Marking & Pedestrian Crossings", 7 English project names, service area, Google Maps link, no custom domain for now, unused originals archived.

---

## 1. What is ready

| Area | Status |
|---|---|
| Pages | Home, Projects (all 32), About, Contact, and a 404 page. Each exists in Arabic (`/`, `/projects/`, `/about/`, `/contact/`) and English (`/en/...`). |
| Content | All real company content from the original site, with the approved Arabic spelling fixes and English name corrections. No invented information. |
| Contact channels | Primary number +20 111 611 1015 for calls and WhatsApp. Secondary numbers +20 101 416 5151 and +20 100 699 2768. Email elbasha.constructions@gmail.com. Facebook and LinkedIn. Formspree form. |
| Media | Client photos (project cards, gallery, equipment strip, service cards), hero images and the full company film with sound, the logo from the client's `logo.pdf` raster, favicons, social share image. |
| Technical | Zero-dependency static build, host-like preview server, automatic checks, security headers, redirects, drafts build for client review. |

## 2. What is missing

Nothing technical blocks launch. What's still missing is client content, which the live site hides:
- no fake text or placeholder images are shown;
- the 27 projects without photos show a neutral branded tile instead of a photo;
- sections like address or working hours simply don't appear until filled in.

The full list of 68 unique markers is in `QA_REPORT.md` §13. To see every missing item on the pages themselves, run `npm run build:drafts` and then `npm run preview -- --drafts`.

## 3. What I need from the company

> **Status after client batch 1 (2026-09-15):** rows 4, 6, 7, 8 and 14 are resolved and row 2 is partly resolved (map link done). Row 5 has draft descriptions on the site awaiting client review. The Arabic client list `CLIENT_REQUESTS.md` has 37 remaining items.

> A client-ready **Arabic** version of these requests is in [`CLIENT_REQUESTS.md`](CLIENT_REQUESTS.md). It lists all 64 items, numbered, grouped by page, with image sizes and `projects-inventory.xlsx` row numbers.

| # | Item | Why | Where to put it |
|---|---|---|---|
| 1 | ~~Official legal company name~~ | — | ✅ Resolved 2026-09-17: the name already on the site (`site.json` → `brand.legalName`) |
| 2 | ~~Address + Google Maps link~~ | — | ✅ Resolved 2026-09-18: `site.json` → `contact.address` (`ar`, `en`, and `postal` for the JSON-LD `PostalAddress`); map link since batch 1 |
| 3 | ~~Working days and hours~~ ✅ Resolved 2026-09-17 | Contact page and footer | `site.json` → `contact.hours` |
| 4 | **Service area** (governorates / regions) | Contact page; structured data | `site.json` → `contact.serviceArea` |
| 5 | ~~1–2 sentence description per service~~ | — | ✅ Resolved 2026-09-18: the 10 drafts approved as written; `draft` flags removed from `services.json` |
| 6 | **Hero headline:** confirm "تشييد الطرق والكباري / Roads and bridges construction". Does the company build bridges, or paint them? | Home headline (the company name is shown until confirmed) | If confirmed: put the headline in `hero.title` in `src/i18n/ar.json` and `en.json`, and delete the `headlineMarker` line |
| 7 | **English names to confirm:** projects 1, 2, 5, 6, 18, 24, 27, plus the service "Road Planning" vs "Road Marking" | Published names of public projects | `projects-inventory.xlsx`; then edit `name.en` in `projects.json` / `services.json` and delete that item's `nameToConfirm` line |
| 8 | **Review of the 14 corrected English names** (already applied) | Client sign-off | `projects-inventory.xlsx`, column "Corrected English name" |
| 9 | ~~Permission to publish the Amr Ibn Al-As Axis and October Western Sector photos~~ | — | ✅ Resolved 2026-09-18: granted; the `photoNote` markers were removed from `projects.json` |
| 10 | ~~Company profile~~ | — | ✅ Resolved 2026-09-17: the client's text replaced `about.intro`; the separate profile slot was removed |
| 11 | ~~Trust information~~ | — | ✅ Clients & partners resolved 2026-09-18: 28 names, with permission, in `src/data/clients.json`; shown as text on the home and About pages. Logos only from a company's own file (add a `logo` to that entry and ask the developer). Certificates and classification are no longer requested. |
| 12 | **Canonical social links:** is `facebook.com/share/1b3x72sW7X/` the link to keep? Any Instagram / YouTube / TikTok? | Footer and contact page | `site.json` → `social` |
| 13 | **Analytics:** wanted or not? Cloudflare Web Analytics is free and cookie-free. | Visitor statistics | Cloudflare dashboard (no code needed) |
| 14 | ~~Unused originals~~ | — | ✅ Resolved 2026-09-15: moved to the git-ignored `/archive` folder at the repository root (local only; also in git history at tag `original-upload`) |
| 15 | **Account ownership:** the GitHub repository is on a personal account (`Salmaazoz22`). Decide who owns the repository, the Cloudflare account and the Formspree account long term. A company email is recommended for all three. | Business continuity | Accounts |

## 4. What images I need

This is the Images Needed table from `AUDIT_REPORT.md` §7.2, with the current status added.

| # | Image | Purpose | Where used | Suggested ratio & min size | Must come from client? | Free stock acceptable? | Status now |
|---|---|---|---|---|---|---|---|
| 1 | Hero photo (best real site photo, landscape, strong subject, calm area for text) | First impression | Home hero | 16:9, min **1920×1080** (ideal 2560×1440) + portrait 4:5 ≥ 1080×1350 for phones | **Yes** | No | Interim: stills from the company video (1920×864, slightly soft) |
| 2 | One photo per service ×10 | Show each service truthfully | Service cards | 4:3, min **1200×900** | **Yes** (preferred) | Only with written client approval, never captioned as their own work | Icon cards used instead (no photos) |
| 3 | Project photos ×23 (list in `projects-inventory.xlsx`) | Portfolio proof | Projects page | 4:3, min **1200×900**, 1–3 per project | **Yes** | **No, never** | Missing; branded placeholder tile shown |
| 4 | Amr Ibn Al-As Axis photo without the timestamp, or permission to use the crop | Portfolio | Projects page | 4:3, min 1200×900 | **Yes** | No | Cropped version in use; permission pending |
| 5 | Logo as **SVG** (or transparent PNG ≥ 2000 px wide) | Crisp header/footer | Header, footer, About, social image | vector | **Yes** | No | Cleaned PNG in use (168×112 and 632×421) |
| 6 | Icon-only mark as SVG | Favicons | Favicon set | 1:1 | Derived from existing icon | n/a | Generated from the 368 px icon |
| 7 | Social share image | Link previews | `og:image` | **1200×630** | Composed from #1 + #5 | No | Generated (video still + logo), needs client approval |
| 8 | Company video | "From our work" section | Home | 16:9 | **Yes** | No | ✅ Done (trimmed from `Final.mp4`) |
| 9 | About photo: team / equipment / office | Humanise the company | About page | 3:2, min **1600×1067** | **Yes** | No | Missing (hidden) |
| 10 | (Optional) Equipment / fleet photos | Capability proof | About / services | 4:3, min 1200×900 | **Yes** | No | — |
| 11 | (Optional) Certificates / classification scans | Trust | About | ≥ 1500 px long side | **Yes** | No | — |
| 12 | (Optional) Client / owner logos | Trust | Home and About | SVG / PNG | **Yes, from the company itself** | No | Names shown as text; no logo files received |

## 5. What content I need

- **Service descriptions:** 10 × 1–2 sentences, Arabic and English.
- **Company profile** for About: 2–4 sentences, only facts the company wants published.
- **Address, working hours, service area:** Arabic and English.
- **Hero headline:** confirm scope, construction vs painting of bridges.
- **English names:**
  - confirm projects 1, 2, 5, 6, 18, 24, 27 and the "Road Planning" service;
  - review the 14 corrected names.
- **Optional, only if real:** per-project details such as location, owner, year and scope; clients, certificates and classification.

## 6. What domain information I need

> **Decision 2026-09-15:** no custom domain for now. The site launches on the free `*.pages.dev` address.
>
> **Update 2026-09-19:** the client bought `elbasha-contracting.com`. Its DNS is on Cloudflare, and the site is served from the root domain (§10, "Current setup"). The questions below are answered.

- The **domain name**, if one is already owned, e.g. `elbasha-eg.com`. Or approval to launch on the free `*.pages.dev` address first.
- **Where the domain is registered**, and who can log in to change DNS or nameservers.
- **Root domain or subdomain:** should the site live at `example.com`, `www.example.com`, or both (one redirecting to the other)?
  - A **root domain** requires moving the domain's DNS (nameservers) to Cloudflare. This is free, and the registration stays where it is.
  - A **subdomain** only needs one CNAME record.
- **Existing email on the domain**, if any. MX records must be copied exactly when DNS moves to Cloudflare, or email will stop working.

---

## 7. Best free hosting option: Cloudflare Pages

Full comparison in `IMPLEMENTATION_PLAN.md` §7. Cloudflare Pages suits this site because:
- **It's free for commercial use** with unlimited static bandwidth. The two 6 MB video files don't eat into a monthly quota.
- **Headers and redirects are supported** (`_headers`, `_redirects`): security headers, caching, and old-URL redirects work with no extra code.
- **Every push is built automatically.** Other branches get their own preview URLs, and Cloudflare marks those previews `X-Robots-Tag: noindex` automatically.
- **Free SSL and custom domains**, with a Cloudflare data centre in Cairo.

**Limits checked against Cloudflare's docs on 2026-09-15:**
- 500 builds/month, 1 at a time, 20-minute timeout
- 20,000 files per site; this site has 369
- **25 MiB per file**; the largest here is 20.8 MiB (`final.mp4`)
- 100 custom domains per project; 100 header rules; 2,000 static redirects

**Why not the others:**
- **Vercel Hobby** is limited to non-commercial use.
- **GitHub Pages** can't set headers or redirects.
- **Netlify's** credit-based free plan pauses sites that run out of credits.

---

## 8. Step-by-step deployment (repository → live URL)

### Step 1 — Put the code on GitHub `main`
The work is on the local branch `improve/production-ready`. From the project folder:

```bash
git push -u origin improve/production-ready
```

Then on GitHub, open a pull request from `improve/production-ready` into `main`, review it and **merge** it. Cloudflare will deploy `main` as production.

> If you prefer, you can skip the pull request and set the branch as the production branch in step 4. Merging into `main` is cleaner.

### Step 2 — Create or sign in to a Cloudflare account
- Go to <https://dash.cloudflare.com/sign-up>.
- Use a **company-controlled email** (see §3 item 15).
- The Free plan is enough.

### Step 3 — Create the Pages project
1. In the dashboard, open **Workers & Pages**.
2. Select **Create application** → **Pages** → **Connect to Git**.
3. Sign in to GitHub and **Install & Authorize** the Cloudflare app for the account that owns `elbasha_project`. You can limit it to that one repository.
4. Choose the repository `elbasha_project`, then **Begin setup**.

> A project created through the Git integration can't later be switched to Direct Upload (Cloudflare docs). That's fine for this site.

### Step 4 — Build settings

| Field | Value |
|---|---|
| Project name | `elbasha-contracting`, which went live at **`https://elbasha-contracting.pages.dev`** (2026-09-18) and has the custom domain **`https://elbasha-contracting.com`** (2026-09-19). `elbasha` / `elbasha.pages.dev` belongs to an unrelated business on another account, so never point anything at it. |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory (advanced) | *(leave empty)* |

### Step 5 — Environment variables

Open **Environment variables (advanced)** and add, for **Production**:

| Name | Value | Purpose |
|---|---|---|
| `SITE_URL` | `https://elbasha-contracting.com` (**no trailing slash**). It was `https://elbasha-contracting.pages.dev` until the custom domain was added on 2026-09-19. | Absolute URLs for canonical, hreflang, Open Graph, `sitemap.xml` and `robots.txt` |

- **Node version:** nothing to set. The repository's `.node-version` file (`24`) selects Node 24 automatically; Cloudflare's default would be 22.16, which also works.
- **Preview deployments:** leave `SITE_URL` unset. The build then skips canonical and sitemap tags, and Cloudflare adds `noindex` to previews anyway.

### Step 6 — Save and Deploy
- Select **Save and Deploy**.
- The first build takes about a minute. The build log should end with:
  ```
  Built production site → dist (369 files, 56.0 MiB)
  ...
  ✔ All checks passed
  ```
- **If a check fails, the deployment fails.** The live site stays on the previous version, and the log lists exactly what to fix.
- When it finishes, open `https://<project>.pages.dev`.

### Step 7 — Formspree settings
The form already posts to `https://formspree.io/f/mjkeplye`. In the Formspree account that owns this form:
1. Confirm the form's target email is **elbasha.constructions@gmail.com** and that it is **verified**. Formspree sends a verification email the first time.
2. Keep spam filtering on. The site also has a hidden spam-trap field (`_gotcha`).
3. **Free-plan limits** (checked on formspree.io/plans, 2026-09-15):
   - **50 submissions per month**
   - unlimited forms
   - submissions archived for **30 days**
   - up to 2 linked email addresses
   - no file uploads

   When the monthly limit is reached, extra submissions aren't delivered until the next cycle or an upgrade; check the exact behaviour in the Formspree dashboard. On the site, a failed send shows an error with a **WhatsApp fallback button**, so the visitor can still reach the company. If the company regularly gets more than ~40 form messages a month, consider a paid Formspree plan.
4. Formspree's paid plans can restrict the form to your domain. Not required.

---

## 9. Environment variables

| Name | Where | Required | Purpose |
|---|---|---|---|
| `SITE_URL` | Cloudflare Pages → Settings → Variables and Secrets (Production), or a local `.env` | Recommended for production | Public site origin, e.g. `https://example.com`; must start with `https://` and have no trailing slash. Without it, canonical, hreflang, `og:url`/`og:image` and `sitemap.xml` are left out and the build prints a warning. |
| `FFMPEG` | Local only (`.env` or shell) | Only for `npm run video` | Path to an ffmpeg binary if `ffmpeg` isn't on your PATH |

There are **no secret values**. `.env` files are git-ignored, and `.env.example` documents the variables.

---

## 10. Connecting a custom domain (DNS and SSL)

### Current setup (2026-09-19)

| Item | Value |
|---|---|
| Domain | `elbasha-contracting.com`, root domain (Option A). DNS on Cloudflare (nameservers `brenda` / `rene.ns.cloudflare.com`). |
| DNS record | CNAME `elbasha-contracting.com` → `elbasha-contracting.pages.dev`, created by Pages → **Custom domains** |
| SSL | Issued automatically by Cloudflare |
| `SITE_URL` (Production) | `https://elbasha-contracting.com` |
| `www.elbasha-contracting.com` | Not set up yet (optional, see step 5 below) |
| `elbasha-contracting.pages.dev` | Still serves the site; its canonical tags point to the `.com` |

The steps below are the general procedure. They are kept for a second domain or a move.

> **Order matters.** Always add the domain in the **Pages dashboard first**, then create DNS records. A CNAME that points at Pages before the domain is attached there fails with **error 522** (Cloudflare docs).

### Option A — Root domain (`example.com`), recommended
Cloudflare requires the root domain's DNS to be managed by Cloudflare.
1. **Add the domain to Cloudflare:** dashboard → **Add a domain** → enter `example.com` → Free plan.
2. Cloudflare imports the existing DNS records. **Check that every email (MX, TXT/SPF) record came across** before continuing.
3. At the registrar, **replace the nameservers** with the two Cloudflare shows. Wait for the domain to show **Active**; this usually takes minutes to hours.
4. Go to **Workers & Pages** → your project → **Custom domains** → **Set up a domain**. Enter `example.com` → **Continue**, then confirm. Cloudflare creates the DNS record itself.
5. Repeat for `www.example.com`.
6. **SSL is automatic.** Cloudflare issues the certificate, usually within minutes.
   - If the domain has **CAA** records, they must allow Let's Encrypt, Google Trust Services (`pki.goog`) or SSL.com.
7. **Pick one main address** and redirect the other, e.g. `www` → root: domain → **Rules** → **Redirect Rules** → a 301 to `https://example.com${path}`.

### Option B — Subdomain only (e.g. `www.example.com`) with DNS kept elsewhere
1. In Pages → **Custom domains** → **Set up a domain**, enter `www.example.com` → **Continue**.
2. At your DNS provider, create:

   | Type | Name | Target |
   |---|---|---|
   | CNAME | `www` | `<project>.pages.dev` |

3. Wait for the Pages dashboard to show **Active**. SSL is issued automatically.

### After the domain is active
1. **Update `SITE_URL`:** Pages → **Settings** → **Variables and Secrets** → set it to `https://example.com`.
2. **Rebuild:** **Deployments** → latest production deployment → **⋯** → **Retry deployment**. A variable change only takes effect after a new build.
   - If the dashboard shows no **Retry deployment** option, push any commit to `main`. That starts a fresh production build, which reads the new value. This is how the switch to `.com` was deployed on 2026-09-19.
3. **Check** that `https://example.com/robots.txt` and `/sitemap.xml` now show the new domain.
4. **Tell Google:** add the domain in [Google Search Console](https://search.google.com/search-console) (verification via DNS TXT is easy on Cloudflare) and **submit `https://example.com/sitemap.xml`**.
5. **The `*.pages.dev` address keeps working.** Every page's canonical tag points to the domain, so search engines index the domain. Optionally, redirect `pages.dev` to the domain with a Cloudflare **Bulk Redirect**. `_redirects` can't do this, because it only matches paths, not hostnames.
   1. **Account Home** → **Bulk Redirects** → **Create Bulk Redirect List**. Name it (e.g. `pagesdev-to-com`) → **Next** → **Manually add URL redirects**.
   2. Source URL `elbasha-contracting.pages.dev`, target URL `https://elbasha-contracting.com`, status **301**.
   3. **Edit parameters:** tick **Preserve query string**, **Subpath matching** and **Preserve path suffix**. Leave **Include subdomains** unticked, so preview deployments (`<hash>.elbasha-contracting.pages.dev`) keep working.
   4. **Next** → **Save and Deploy**. Then create the **Bulk Redirect Rule** for that list → **Save and Deploy**.
   5. For `www`, add `www.elbasha-contracting.com` in Pages → **Custom domains**. Then add a second entry to the same list: `www.elbasha-contracting.com` → `https://elbasha-contracting.com`, with the same parameters.
   6. Check: `curl -sI https://elbasha-contracting.pages.dev/about/ | grep -iE "^HTTP|^location"` should show `301` and `location: https://elbasha-contracting.com/about/`.
6. Optionally, record the domain in `src/data/site.json` → `domain`. It's informational only. It is set to `elbasha-contracting.com`.

---

## 11. How to verify the deployed website

Replace `https://SITE` with your live address: `https://elbasha-contracting.com`.

### A. Pages and redirects (2 minutes)

```bash
for p in / /projects/ /about/ /contact/ /en/ /en/projects/ /en/about/ /en/contact/; do
  curl -s -o /dev/null -w "%{http_code}  $p\n" "https://SITE$p"; done          # expect 200 for all
curl -s -o /dev/null -w "%{http_code}\n" https://SITE/this-page-does-not-exist   # expect 404 (styled 404 page)
curl -sI https://SITE/HTML/About.html | grep -iE "^HTTP|^location"             # expect 301 → /about/
```

### B. Headers

```bash
curl -sI https://SITE/ | grep -iE "content-security-policy|x-content-type-options|referrer-policy|x-frame-options"
curl -sI "https://SITE$(curl -s https://SITE/ | grep -o '/assets/css/main\.[0-9a-f]*\.css')" | grep -i cache-control
# expect: public, max-age=31536000, immutable
```

### C. SEO and social previews
- Open `https://SITE/robots.txt` and `https://SITE/sitemap.xml`. Both should use the live domain; the sitemap should list 8 URLs.
- On the home page, **View source** and check that `<html lang="ar" dir="rtl">`, `canonical` and the three `hreflang` links show the live domain.
- **Link preview:** paste the URL into a WhatsApp chat to yourself, the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/). You should see the logo-on-photo image, the title and the description.
- Run [PageSpeed Insights](https://pagespeed.web.dev/) on `/` and `/en/`.

### D. On a real iPhone (Safari) and Android phone (Chrome)
- [ ] The home page loads with the Arabic hero; switching to **English** opens the same page in English, and back.
- [ ] **☰ menu** opens and closes, and links work. The bottom **WhatsApp / Call** bar hides while the menu is open.
- [ ] **Call** opens the dialer with **+20 111 611 1015**. **WhatsApp** opens a chat with **+20 111 611 1015**.
- [ ] **Hero film.** On an iPad, or a phone turned sideways, the hero film plays silently. Tap **🔊 شغّل الصوت / Turn sound on**: it restarts from the beginning with sound, the button changes to **كتم الصوت / Mute**, and ⏸ pauses it.
- [ ] On a phone held upright the hero stays a photo. **شغّل الصوت / Turn sound on** scrolls to the video section and plays the film with sound. The section's own ▶ also plays it with sound.
- [ ] With iPhone Low Power Mode on, the hero stays a photo, and the button still plays the film with sound.
- [ ] **Projects:** 5 cards show photos (project 30 opens its 3 photos in the viewer), 27 projects show the navy tile, and the category buttons jump to their sections.
- [ ] **Footer links:** secondary numbers, email (opens a mail app), Facebook and LinkedIn open correctly. Check Facebook by hand; it blocks automated checks.
- [ ] No sideways scrolling on any page; text is readable without zooming.

### E. Contact form: one real test each in Arabic and English
1. Open `https://SITE/contact/`. Enter:
   - name `اختبار الموقع`
   - a real phone number
   - message `رسالة تجريبية بعد النشر — يرجى التجاهل`
2. Press **إرسال**. Expect "جارٍ الإرسال…", then the green **"تم إرسال رسالتك"** panel.
3. Check **elbasha.constructions@gmail.com**, including the Spam folder, for the Formspree email with subject "رسالة جديدة من موقع الباشا (عربي)".
4. Check the submission appears in the **Formspree dashboard**. If Formspree asks to confirm or verify the form or email, do that first, then submit again.
5. Repeat on `https://SITE/en/contact/`. The subject should end in "(English)".
6. **Error handling:** submit with empty fields. Red messages should appear under the name, phone and message fields.

> These tests use 2 of the 50 free submissions for the month.

---

## 12. How to update the website later

### The workflow
1. **Edit** the files below, in any editor or directly on GitHub.
2. **Preview locally** (optional, needs Node 20+):
   ```bash
   npm run build          # production build + checks
   npm run preview        # open http://127.0.0.1:4173
   npm run build:drafts   # build showing every [[NEEDS_CLIENT]] marker
   npm run preview -- --drafts --port 4174
   ```
3. **Commit and push to `main`.** Cloudflare builds and publishes automatically in about a minute. For bigger changes, push a separate branch first: Cloudflare gives it its own preview URL, then merge.
4. **If a build fails,** the live site stays unchanged; open the build log in Cloudflare → **Deployments**.

### Where to change what

| To change… | Edit | Notes |
|---|---|---|
| Phone numbers, WhatsApp link, email, social links, form endpoint | `src/data/site.json` | One file updates every page, both languages |
| Address, hours, service area, map link | `src/data/site.json` | Replace the `[[NEEDS_CLIENT: …]]` text with the real value; the section appears automatically. The map link is optional. |
| Service names and descriptions | `src/data/services.json` | Replace the description markers to show descriptions under each service. Descriptions written as drafts for client review get `"draft": true` inside the description object (`{"ar": "…", "en": "…", "draft": true}`); the flag has no visible effect, and the build lists flagged descriptions. Remove the flag when the client approves. |
| Supplied materials (the "We supply" strip below the home hero) | `src/data/materials.json` | Order = display order; `note` is the optional second line ("All sizes"). `icon` must exist in `src/templates/icons.mjs`. Keep the Material Supply description in `services.json` in step. |
| Project names and categories | `src/data/projects.json` | Keep `name.ar` and `name.en`; `category` is `roads`, `bridges`, `maintenance` or `brick-factories` |
| Page text, titles, meta descriptions, buttons, form messages | `src/i18n/ar.json`, `src/i18n/en.json` | Keep both languages in step |
| Colours, spacing, layout | `src/assets/css/main.css` | Colour tokens at the top; keep the contrast rules noted there |
| Page structure | `src/templates/pages.mjs`, `layout.mjs`, `components.mjs` | Developer task |
| Security headers / redirects | `src/public/_headers`, `src/public/_redirects` | If you add a third-party service (analytics, maps embed), its domain must be added to the CSP |

### Adding a project photo
1. Put the original photo in `source-assets/images/`, e.g. `talbia-axis.jpg`.
2. Add a line to `scripts/media.mjs` next to the other project photos:
   ```js
   await responsive('project-talbia-axis', 'talbia-axis.jpg', { crop: { left: 0, top: 0, width: 1600, height: 1200 }, widths: [480, 800, 1200] });
   ```
   Use a 4:3 crop box that fits your photo, or leave out `crop` if it's already 4:3.
3. Run `npm run media`. It installs the image tool temporarily and writes WebP/JPEG sizes plus `src/data/images.json`.
4. In `src/data/projects.json`, for that project:
   - set `"image": "project-talbia-axis"`;
   - add `"alt": {"ar": "…", "en": "…"}`, describing what the photo shows;
   - delete its `photoNeeded` line.
5. Run `npm run build`, check it, then commit the new files in `src/assets/img/`, `images.json` and `projects.json`.

### Replacing or re-cutting the video
1. The masters are too large for GitHub and are **not in git**: `FINAL.mp4` (1920×1080, 286 MB) for the desktop highlight and hero stills, and `reel 1.mp4` (1080×1920) for the phone reel. By default the script reads them from `incoming-photos&videos/`; point `VIDEO_MASTER` / `REEL_MASTER` at them if they live elsewhere.
2. Edit the `segments` (start/end seconds) of `HIGHLIGHT` or `REEL` in `scripts/video.mjs`.
3. Run `npm run video` (both), or `npm run video -- highlight` / `npm run video -- reel` for one. Then run `npm run media` so the hero images pick up new stills. This needs ffmpeg with libvpx-vp9, libx264 and libwebp; set `FFMPEG` to its path if it isn't on your PATH.
4. Keep each output **under 25 MiB** (Cloudflare's limit) and ideally **5–8 MB**. The build check fails if a file is over 25 MiB.

### Structured data
- On since 2026-09-17 (`"structuredData": { "enabled": true }`): a `GeneralContractor` JSON-LD block on both home pages.
- It is emitted only when `SITE_URL` is set, so preview builds carry none.
- `contact.address` is added automatically once it is a real value; until then the block has no address.
- The build refuses to run while `brand.legalName` or `contact.serviceArea` is a marker, and `check.mjs` fails if a JSON-LD block does not parse.
- Validate after each deploy with Google's [Rich Results Test](https://search.google.com/test/rich-results).
