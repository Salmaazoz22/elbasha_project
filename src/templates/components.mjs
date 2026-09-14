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
  return html`<li class="service-card" data-reveal>
    <span class="service-card__icon">${icon(s.icon, { size: 28 })}</span>
    <h3 class="service-card__title">${s.name[lang]}</h3>
    ${needs(ctx, s.description[lang], () => html`<p class="service-card__text">${s.description[lang]}</p>`)}
    ${lang === 'en' && s.nameToConfirm ? slot(ctx, s.nameToConfirm) : ''}
  </li>`;
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

export function projectsCount(ctx, n) {
  return plural(ctx.t.common.projectsCount, n, ctx.lang);
}

export function ctaBand(ctx) {
  const t = ctx.t.cta;
  return html`<section class="cta-band" aria-labelledby="cta-title">
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
