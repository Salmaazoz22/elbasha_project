// Reusable page components.
import { html, icon, isMarker, ltr, needs, phone, plural, raw, slot } from './lib.mjs';

const srcset = (ctx, list) => list.map(({ w, file }) => `${ctx.asset(file)} ${w}w`).join(', ');

/**
 * Responsive <picture> from an images.json entry (WebP + JPEG fallback).
 * `mobile` is an optional art-directed entry used below 48em.
 */
export function picture(ctx, key, { alt, sizes, className = '', eager = false, mobile }) {
  const img = ctx.images[key];
  if (!img) throw new Error(`Unknown image: ${key}`);
  const m = mobile && ctx.images[mobile];
  const fallback = img.jpg[Math.min(1, img.jpg.length - 1)];
  return html`<picture class="${className}">
    ${m ? html`<source media="(max-width: 47.99em)" type="image/webp" srcset="${srcset(ctx, m.webp)}" sizes="100vw">
    <source media="(max-width: 47.99em)" type="image/jpeg" srcset="${srcset(ctx, m.jpg)}" sizes="100vw">` : ''}
    <source type="image/webp" srcset="${srcset(ctx, img.webp)}" sizes="${sizes}">
    <img src="${ctx.asset(fallback.file)}" srcset="${srcset(ctx, img.jpg)}" sizes="${sizes}"
      width="${img.width}" height="${img.height}" alt="${alt}"
      ${eager ? html`fetchpriority="high"` : html`loading="lazy"`} decoding="async">
  </picture>`;
}

export function sectionHead(ctx, { eyebrow, title, lead, id, level = 2, align = 'start' }) {
  const h = level === 1
    ? html`<h1 class="section-title" id="${id}">${title}</h1>`
    : html`<h2 class="section-title" id="${id}">${title}</h2>`;
  return html`<header class="section-head section-head--${align}" data-reveal>
    ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ''}
    ${h}
    ${lead ? html`<p class="section-lead">${lead}</p>` : ''}
  </header>`;
}

export function whatsappButton(ctx, { className = 'btn btn--whatsapp', label = ctx.t.cta.whatsapp } = {}) {
  return html`<a class="${className}" href="${ctx.site.contact.whatsappUrl}" target="_blank" rel="noopener">
    ${icon('whatsapp', { size: 20 })}<span>${label}</span><span class="visually-hidden">${ctx.t.common.newTab}</span></a>`;
}

export function callButton(ctx, { className = 'btn btn--outline-light', label = ctx.t.cta.call, showNumber = false } = {}) {
  const p = ctx.site.contact.primaryPhone;
  return html`<a class="${className}" href="tel:${p.tel}">
    ${icon('phone', { size: 20 })}<span>${label}${showNumber ? html`${raw('&nbsp;')}${phone(p.display)}` : ''}</span></a>`;
}

export function serviceCard(ctx, s) {
  const lang = ctx.lang;
  const content = html`<h3 class="service-card__title">${s.name[lang]}</h3>
    ${needs(ctx, s.description[lang], () => html`<p class="service-card__text">${s.description[lang]}</p>`)}
    ${lang === 'en' && s.nameToConfirm ? slot(ctx, s.nameToConfirm) : ''}`;
  if (s.image) {
    return html`<li class="service-card service-card--photo" data-reveal>
    ${picture(ctx, s.image, { alt: s.imageAlt[lang], sizes: '(min-width: 75em) 284px, (min-width: 62em) 23vw, 50vw', className: 'service-card__media' })}
    <div class="service-card__body">${content}</div>
  </li>`;
  }
  return html`<li class="service-card" data-reveal>
    <span class="service-card__icon">${icon(s.icon, { size: 28 })}</span>
    ${content}
  </li>`;
}

/** Full-bleed decorative photo behind a section; the section's own overlay keeps text contrast. */
export function backdrop(ctx, key, { eager = false } = {}) {
  return picture(ctx, key, { alt: '', sizes: '100vw', className: 'backdrop', eager });
}

export function projectCard(ctx, p, { headingLevel = 3, sizes = '(min-width: 75em) 280px, (min-width: 48em) 45vw, 100vw' } = {}) {
  const lang = ctx.lang;
  const category = ctx.categories.find((c) => c.id === p.category);
  const title = headingLevel === 3
    ? html`<h3 class="project-card__title">${p.name[lang]}</h3>`
    : html`<h4 class="project-card__title">${p.name[lang]}</h4>`;
  const media = p.image
    ? picture(ctx, p.image, { alt: p.alt[lang], sizes, className: 'project-card__media' })
    : html`<div class="project-card__media project-card__placeholder">
        ${icon(category.icon, { size: 40 })}
        <span class="visually-hidden">${ctx.t.projects.photoPending}</span>
      </div>`;
  return html`<article class="project-card${p.image ? '' : ' project-card--no-photo'}" data-reveal>
    ${media}
    <div class="project-card__body">
      <p class="project-card__category">${category.name[lang]}</p>
      ${title}
      ${p.photoNeeded ? slot(ctx, p.photoNeeded) : ''}
      ${p.photoNote ? slot(ctx, p.photoNote) : ''}
      ${p.nameToConfirm ? slot(ctx, p.nameToConfirm) : ''}
    </div>
  </article>`;
}

/**
 * Site photo gallery: filter chips (revealed by gallery.js), a lazy 4:3 grid and, with JavaScript,
 * a <dialog> lightbox. Without JavaScript every thumbnail is a link to the full-size photo.
 */
export function gallery(ctx) {
  const { t, lang } = ctx;
  const { subjects, items } = ctx.gallery;
  const count = (id) => items.filter((it) => it.subject === id).length;
  const chip = (id, label, n, pressed) => html`<button class="chip chip--filter" type="button"
    aria-pressed="${pressed ? 'true' : 'false'}" data-gallery-filter="${id}">
    <span>${label}</span><span class="chip__count">${ltr(String(n))}</span></button>`;
  return html`
<section class="section section--tint gallery" id="gallery" aria-labelledby="gallery-title">
  <div class="container">
    ${sectionHead(ctx, { eyebrow: t.gallery.eyebrow, title: t.gallery.title, lead: t.gallery.lead, id: 'gallery-title' })}
    <div class="gallery__filters" role="group" aria-label="${t.gallery.filterLabel}" data-gallery-filters hidden>
      ${chip('all', t.gallery.all, items.length, true)}
      ${subjects.map((s) => chip(s.id, s.name[lang], count(s.id), false))}
    </div>
    <ul class="gallery__grid" role="list" data-gallery-grid>
      ${items.map((it) => {
    const full = ctx.images[`gallery-${it.n}-full`];
    return html`<li class="gallery__item" data-subject="${it.subject}">
        <a class="gallery__link" href="${ctx.asset(full.jpg[full.jpg.length - 1].file)}" data-gallery-link
          data-srcset="${full.webp.map((w) => `${ctx.asset(w.file)} ${w.w}w`).join(', ')}">
          ${picture(ctx, `gallery-${it.n}`, { alt: it.alt[lang], sizes: '(min-width: 62em) 22vw, (min-width: 36em) 30vw, 45vw', className: 'gallery__media' })}
          <span class="visually-hidden">${t.gallery.open}</span>
        </a>
      </li>`;
  })}
    </ul>
    <p class="gallery__empty" data-gallery-empty hidden>${t.gallery.empty}</p>
  </div>
</section>
<dialog class="lightbox" aria-label="${t.gallery.lightboxLabel}" data-lightbox>
  <figure class="lightbox__figure">
    <div class="lightbox__media" data-lightbox-media></div>
    <figcaption class="lightbox__caption">
      <span data-lightbox-caption></span>
      <span class="lightbox__count" data-lightbox-count></span>
    </figcaption>
  </figure>
  <button class="lightbox__btn lightbox__btn--close" type="button" data-lightbox-close aria-label="${t.gallery.close}">${icon('x', { size: 24 })}</button>
  <button class="lightbox__btn lightbox__btn--prev" type="button" data-lightbox-prev aria-label="${t.gallery.prev}">${icon('arrow-right', { size: 24, className: 'icon--flip-rtl' })}</button>
  <button class="lightbox__btn lightbox__btn--next" type="button" data-lightbox-next aria-label="${t.gallery.next}">${icon('arrow-right', { size: 24, className: 'icon--flip-rtl' })}</button>
  <script type="application/json" data-lightbox-strings>${raw(JSON.stringify({ counter: t.gallery.counter }).replace(/</g, '\\u003c'))}</script>
</dialog>`;
}

/**
 * Equipment strip: a lazy 4:3 scroll-snap row of machines working on the company's own sites.
 * Labels name only what is in the frame — no counts, no fleet size and no makers' names.
 */
export function equipmentStrip(ctx) {
  const { t, lang } = ctx;
  const { items } = ctx.equipment;
  return html`
<section class="section equipment" aria-labelledby="equipment-title">
  <div class="container">
    ${sectionHead(ctx, { title: t.about.equipmentTitle, lead: t.about.equipmentLead, id: 'equipment-title' })}
    <ul class="equipment__row" role="list">
      ${items.map((it) => html`<li class="equipment__item" data-reveal>
        ${picture(ctx, `equipment-${it.n}`, { alt: it.alt[lang], sizes: '(min-width: 62em) 22vw, (min-width: 36em) 40vw, 70vw', className: 'equipment__media' })}
        <p class="equipment__label">${it.label[lang]}</p>
      </li>`)}
    </ul>
  </div>
</section>`;
}

export function projectsCount(ctx, n) {
  return plural(ctx.t.common.projectsCount, n, ctx.lang);
}

export function ctaBand(ctx) {
  const t = ctx.t.cta;
  return html`<section class="cta-band" aria-labelledby="cta-title">
    ${backdrop(ctx, 'bg-cta')}
    <div class="container cta-band__inner" data-reveal>
      <div class="cta-band__text">
        <h2 id="cta-title" class="cta-band__title">${t.bandTitle}</h2>
        <p>${t.bandText}</p>
      </div>
      <div class="cta-band__actions">
        ${whatsappButton(ctx)}
        ${callButton(ctx, { showNumber: true })}
      </div>
    </div>
  </section>`;
}

export const hasReal = (value) => value && !isMarker(value);
