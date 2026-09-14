// Page bodies. Each returns { title, description, body, indexable, scripts? }.
import { email, html, icon, ltr, needs, raw, slot } from './lib.mjs';
import {
  picture, sectionHead, whatsappButton, callButton, serviceCard, projectCard, projectsCount, ctaBand,
} from './components.mjs';
import { socialLinks } from './layout.mjs';

export function home(ctx) {
  const { t, lang } = ctx;
  const featured = ctx.projects.filter((p) => p.image);
  const video = (f) => ctx.asset(`video/${f}`);
  const body = html`
<section class="hero" aria-labelledby="hero-title">
  ${picture(ctx, `hero-${lang}`, {
    alt: t.hero.imageAlt, sizes: '100vw', className: 'hero__media', eager: true, mobile: `hero-${lang}-mobile`,
  })}
  <div class="hero__shade" aria-hidden="true"></div>
  <div class="container hero__content">
    <p class="eyebrow eyebrow--light">${t.hero.eyebrow}</p>
    <h1 class="hero__title" id="hero-title">${t.hero.title}</h1>
    <p class="hero__lead">${t.hero.lead}</p>
    <div class="hero__actions">
      ${whatsappButton(ctx, { className: 'btn btn--primary btn--lg' })}
      ${callButton(ctx, { className: 'btn btn--outline-light btn--lg', showNumber: true })}
    </div>
    ${slot(ctx, t.hero.headlineMarker)}
  </div>
</section>

<section class="section" id="services" aria-labelledby="services-title">
  <div class="container">
    ${sectionHead(ctx, { eyebrow: t.home.servicesEyebrow, title: t.home.servicesTitle, id: 'services-title' })}
    <ul class="services-grid" role="list">
      ${ctx.services.map((s) => serviceCard(ctx, s))}
    </ul>
  </div>
</section>

<section class="section section--tint" aria-labelledby="featured-title">
  <div class="container">
    <div class="section-head-row">
      ${sectionHead(ctx, { eyebrow: t.home.projectsEyebrow, title: t.home.projectsTitle, lead: t.home.projectsLead, id: 'featured-title' })}
      <a class="link-arrow" href="${ctx.url('projects', lang)}">${t.common.viewAllProjects}${icon('arrow-right', { size: 20, className: 'icon--flip-rtl' })}</a>
    </div>
    <div class="projects-grid projects-grid--featured">
      ${featured.map((p) => projectCard(ctx, p))}
    </div>
  </div>
</section>

<section class="section section--dark" aria-labelledby="video-title">
  <div class="container">
    ${sectionHead(ctx, { eyebrow: t.home.videoEyebrow, title: t.home.videoTitle, id: 'video-title' })}
    <figure class="video-frame" data-reveal>
      <video class="video-frame__video" controls muted loop playsinline preload="none"
        poster="${video('highlight-poster.webp')}" width="1280" height="576"
        aria-label="${t.home.videoLabel}" data-autoplay-video>
        <source src="${video('highlight.webm')}" type="video/webm">
        <source src="${video('highlight.mp4')}" type="video/mp4">
      </video>
      <button class="video-frame__toggle" type="button" hidden data-video-toggle
        data-label-pause="${t.home.videoPause}" data-label-play="${t.home.videoPlay}">
        <span class="video-frame__toggle-icon video-frame__toggle-icon--pause">${icon('pause', { size: 20 })}</span>
        <span class="video-frame__toggle-icon video-frame__toggle-icon--play">${icon('play', { size: 20 })}</span>
        <span data-video-toggle-label>${t.home.videoPlay}</span>
      </button>
    </figure>
  </div>
</section>

${ctaBand(ctx)}`;
  return { title: t.meta.home.title, description: t.meta.home.description, body, indexable: true };
}

function pageHero(ctx, { title, lead, extra = '' }) {
  return html`<section class="page-hero" aria-labelledby="page-title">
  <div class="container">
    <h1 class="page-hero__title" id="page-title">${title}</h1>
    ${lead ? html`<p class="page-hero__lead">${lead}</p>` : ''}
    ${extra}
  </div>
</section>`;
}

export function projects(ctx) {
  const { t, lang } = ctx;
  const groups = ctx.categories.map((c) => ({ ...c, items: ctx.projects.filter((p) => p.category === c.id) }));
  const jump = html`<nav class="chip-nav" aria-label="${t.projects.jumpLabel}">
    <ul class="chip-nav__list" role="list">
      ${groups.map((g) => html`<li><a class="chip" href="#${g.id}">${icon(g.icon, { size: 18 })}<span>${g.name[lang]}</span>
        <span class="chip__count">${ltr(String(g.items.length))}</span></a></li>`)}
    </ul>
  </nav>`;
  const body = html`
${pageHero(ctx, { title: t.projects.title, lead: t.projects.lead, extra: jump })}
${groups.map((g, i) => html`
<section class="section${i % 2 ? ' section--tint' : ''} project-group" id="${g.id}" aria-labelledby="${g.id}-title">
  <div class="container">
    <header class="project-group__head" data-reveal>
      <span class="project-group__icon">${icon(g.icon, { size: 28 })}</span>
      <h2 class="section-title" id="${g.id}-title">${g.name[lang]}</h2>
      <p class="project-group__count">${projectsCount(ctx, g.items.length)}</p>
    </header>
    <div class="projects-grid">
      ${g.items.map((p) => projectCard(ctx, p))}
    </div>
  </div>
</section>`)}
${ctaBand(ctx)}`;
  return { title: t.meta.projects.title, description: t.meta.projects.description, body, indexable: true };
}

export function about(ctx) {
  const { t, lang } = ctx;
  const body = html`
${pageHero(ctx, { title: t.about.title })}
<section class="section" aria-labelledby="about-intro-title">
  <div class="container about-intro">
    <div class="about-intro__text" data-reveal>
      <h2 class="visually-hidden" id="about-intro-title">${ctx.site.brand.name[lang]}</h2>
      <p class="about-intro__lead">${t.about.intro}</p>
      ${slot(ctx, t.about.profileMarker)}
      <div class="about-intro__actions">
        ${whatsappButton(ctx, { className: 'btn btn--primary' })}
        <a class="btn btn--outline" href="${ctx.url('projects', lang)}">${t.common.viewAllProjects}</a>
      </div>
    </div>
    <div class="about-intro__aside" data-reveal>
      ${slot(ctx, t.about.photoMarker)}
      <img class="about-intro__logo" src="${ctx.asset(ctx.images.logo.png)}" width="${ctx.images.logo.width}" height="${ctx.images.logo.height}" alt="" loading="lazy">
    </div>
  </div>
</section>
<section class="section section--tint" aria-labelledby="expertise-title">
  <div class="container">
    ${sectionHead(ctx, { title: t.about.expertiseTitle, id: 'expertise-title' })}
    <ul class="expertise-list" role="list">
      ${ctx.services.map((s) => html`<li class="expertise-list__item" data-reveal>
        <span class="expertise-list__icon">${icon(s.icon, { size: 22 })}</span><span>${s.name[lang]}</span></li>`)}
    </ul>
    ${slot(ctx, t.about.trustMarker)}
  </div>
</section>
${ctaBand(ctx)}`;
  return { title: t.meta.about.title, description: t.meta.about.description, body, indexable: true };
}

export function contact(ctx) {
  const { t, lang, site } = ctx;
  const c = site.contact;
  const f = t.form;
  const formMessages = JSON.stringify({
    sending: f.sending, submit: f.submit, errName: f.errName, errPhone: f.errPhone, errEmail: f.errEmail,
    errMessage: f.errMessage, errorSummary: f.errorSummary,
  });
  const field = ({ id, label, required, type = 'text', autocomplete, inputmode, textarea = false, dir }) => html`
    <div class="field" data-field>
      <label class="field__label" for="${id}">${label}
        <span class="field__hint">(${required ? f.required : f.optional})</span></label>
      ${textarea
        ? html`<textarea class="field__input" id="${id}" name="${id}" rows="5" minlength="10" required
            aria-describedby="${id}-error"></textarea>`
        : html`<input class="field__input" id="${id}" name="${id}" type="${type}"
            ${autocomplete ? html`autocomplete="${autocomplete}"` : ''} ${inputmode ? html`inputmode="${inputmode}"` : ''}
            ${dir ? html`dir="${dir}"` : ''} ${required ? html`required` : ''} aria-describedby="${id}-error">`}
      <p class="field__error" id="${id}-error" data-error hidden></p>
    </div>`;
  const body = html`
${pageHero(ctx, { title: t.contact.title, lead: t.contact.lead })}
<section class="section" aria-label="${t.contact.methodsTitle}">
  <div class="container contact-layout">
    <div class="contact-methods">
      <h2 class="section-title section-title--sm">${t.contact.methodsTitle}</h2>
      <div class="contact-card contact-card--whatsapp" data-reveal>
        <span class="contact-card__icon">${icon('whatsapp', { size: 26 })}</span>
        <div>
          <h3 class="contact-card__title">${t.contact.whatsappTitle}</h3>
          <p class="contact-card__value">${ltr(c.primaryPhone.display)}</p>
          ${whatsappButton(ctx, { className: 'btn btn--whatsapp btn--sm' })}
        </div>
      </div>
      <div class="contact-card" data-reveal>
        <span class="contact-card__icon">${icon('phone', { size: 26 })}</span>
        <div>
          <h3 class="contact-card__title">${t.contact.callTitle}</h3>
          <p class="contact-card__value"><a href="tel:${c.primaryPhone.tel}">${ltr(c.primaryPhone.display)}</a></p>
          <p class="contact-card__sub">${t.contact.otherPhones}:</p>
          <ul class="contact-card__list" role="list">
            ${c.secondaryPhones.map((p) => html`<li><a href="tel:${p.tel}">${ltr(p.display)}</a></li>`)}
          </ul>
        </div>
      </div>
      <div class="contact-card" data-reveal>
        <span class="contact-card__icon">${icon('mail', { size: 26 })}</span>
        <div>
          <h3 class="contact-card__title">${t.contact.emailTitle}</h3>
          <p class="contact-card__value contact-card__value--email"><a href="mailto:${c.email}">${email(c.email)}</a></p>
        </div>
      </div>
      ${needs(ctx, [c.address[lang], c.mapUrl], () => html`<div class="contact-card" data-reveal>
        <span class="contact-card__icon">${icon('map-pin', { size: 26 })}</span>
        <div><h3 class="contact-card__title">${t.contact.addressTitle}</h3><p>${c.address[lang]}</p>
        <a href="${c.mapUrl}" target="_blank" rel="noopener">${t.contact.mapLink}<span class="visually-hidden">${t.common.newTab}</span></a></div>
      </div>`)}
      ${needs(ctx, c.hours[lang], () => html`<div class="contact-card" data-reveal>
        <span class="contact-card__icon">${icon('clock', { size: 26 })}</span>
        <div><h3 class="contact-card__title">${t.contact.hoursTitle}</h3><p>${c.hours[lang]}</p></div>
      </div>`)}
      ${needs(ctx, c.serviceArea[lang], () => html`<div class="contact-card" data-reveal>
        <span class="contact-card__icon">${icon('route', { size: 26 })}</span>
        <div><h3 class="contact-card__title">${t.contact.areaTitle}</h3><p>${c.serviceArea[lang]}</p></div>
      </div>`)}
      <div class="contact-social" data-reveal>
        <h3 class="contact-card__title">${t.contact.socialTitle}</h3>
        <ul class="social-list" role="list">${socialLinks(ctx)}</ul>
      </div>
    </div>

    <div class="form-card" data-reveal>
      <h2 class="section-title section-title--sm" id="form-title">${f.title}</h2>
      <form class="contact-form" action="${site.form.endpoint}" method="POST" novalidate
        aria-labelledby="form-title" data-contact-form>
        <div class="form-alert form-alert--error" role="alert" data-form-error hidden>
          ${icon('circle-alert', { size: 22 })}
          <div>
            <p class="form-alert__title">${f.errorTitle}</p>
            <p>${f.errorText}</p>
            ${whatsappButton(ctx, { className: 'btn btn--whatsapp btn--sm' })}
          </div>
        </div>
        ${field({ id: 'name', label: f.name, required: true, autocomplete: 'name' })}
        ${field({ id: 'phone', label: f.phone, required: true, type: 'tel', autocomplete: 'tel', inputmode: 'tel', dir: 'ltr' })}
        ${field({ id: 'email', label: f.email, required: false, type: 'email', autocomplete: 'email', dir: 'ltr' })}
        ${field({ id: 'message', label: f.message, required: true, textarea: true })}
        <div class="visually-hidden" aria-hidden="true">
          <label for="company-website">Leave this field empty</label>
          <input id="company-website" type="text" name="_gotcha" tabindex="-1" autocomplete="off">
        </div>
        <input type="hidden" name="_subject" value="${f.subject}">
        <input type="hidden" name="_language" value="${lang}">
        <input type="hidden" name="page" value="${ctx.url('contact', lang)}">
        <button class="btn btn--primary btn--lg contact-form__submit" type="submit" data-submit>
          ${icon('send', { size: 20, className: 'icon--flip-rtl' })}<span data-submit-label>${f.submit}</span>
        </button>
        <p class="contact-form__privacy">${f.privacy}</p>
      </form>
      <div class="form-success" role="status" tabindex="-1" data-form-success hidden>
        ${icon('circle-check', { size: 40 })}
        <p class="form-success__title">${f.successTitle}</p>
        <p>${f.successText}</p>
        <button class="btn btn--outline" type="button" data-form-reset>${f.sendAnother}</button>
      </div>
      <script type="application/json" id="form-messages">${raw(formMessages.replace(/</g, '\\u003c'))}</script>
    </div>
  </div>
</section>`;
  return {
    title: t.meta.contact.title, description: t.meta.contact.description, body, indexable: true,
    scripts: ['js/contact.js'],
  };
}

/** Bilingual 404 (rendered once, Arabic document with an English section). */
export function notFound(ctx, en) {
  const { t } = ctx;
  const body = html`<section class="section not-found" aria-labelledby="page-title">
  <div class="container not-found__inner">
    <p class="not-found__code" aria-hidden="true">404</p>
    <h1 class="section-title" id="page-title">${t.notFound.title}</h1>
    <p>${t.notFound.text}</p>
    <p><a class="btn btn--primary" href="/">${t.notFound.home}</a></p>
    <div lang="en" dir="ltr" class="not-found__en">
      <h2 class="section-title section-title--sm">${en.notFound.title}</h2>
      <p>${en.notFound.text}</p>
      <p><a class="btn btn--outline" href="/en/">${en.notFound.home}</a></p>
    </div>
  </div>
</section>`;
  return { title: `${t.meta.notFound.title} · ${en.notFound.title}`, body, indexable: false };
}
