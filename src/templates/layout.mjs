// Document shell: <head> metadata, header, footer and mobile contact bar.
import { email, html, icon, ltr, needs, phone } from './lib.mjs';
import { whatsappButton } from './components.mjs';

const NAV = [
  { key: 'home', page: 'home' },
  { key: 'services', page: 'home', hash: '#services' },
  { key: 'projects', page: 'projects' },
  { key: 'about', page: 'about' },
  { key: 'contact', page: 'contact' },
];

function head(ctx, page) {
  const { t, lang } = ctx;
  const abs = ctx.abs;
  const alternates = page.indexable && abs
    ? html`
  <link rel="canonical" href="${abs(ctx.url(page.key, lang))}">
  <link rel="alternate" hreflang="ar" href="${abs(ctx.url(page.key, 'ar'))}">
  <link rel="alternate" hreflang="en" href="${abs(ctx.url(page.key, 'en'))}">
  <link rel="alternate" hreflang="x-default" href="${abs(ctx.url(page.key, 'ar'))}">`
    : '';
  const og = ctx.images.og;
  const social = abs
    ? html`
  <meta property="og:url" content="${abs(ctx.url(page.key, lang))}">
  <meta property="og:image" content="${abs('/' + og.file)}">
  <meta property="og:image:width" content="${og.width}">
  <meta property="og:image:height" content="${og.height}">
  <meta property="og:image:alt" content="${t.meta.ogImageAlt}">
  <meta name="twitter:image" content="${abs('/' + og.file)}">`
    : '';
  const font = lang === 'ar' ? 'fonts/cairo-arabic.woff2' : 'fonts/cairo-latin.woff2';
  return html`<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  ${page.description ? html`<meta name="description" content="${page.description}">` : ''}
  ${page.indexable && !ctx.drafts ? '' : html`<meta name="robots" content="noindex">`}${alternates}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${ctx.site.brand.name[lang]}">
  <meta property="og:title" content="${page.title}">
  ${page.description ? html`<meta property="og:description" content="${page.description}">` : ''}
  <meta property="og:locale" content="${t.locale}">
  <meta property="og:locale:alternate" content="${ctx.other.locale}">
  <meta name="twitter:card" content="summary_large_image">${social}
  <meta name="theme-color" content="#184098">
  <meta name="format-detection" content="telephone=no">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="${ctx.asset(font)}" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${ctx.asset('css/main.css')}">
  <noscript><link rel="stylesheet" href="${ctx.asset('css/nojs.css')}"></noscript>
  <script src="${ctx.asset('js/main.js')}" defer></script>
  ${page.scripts?.map((s) => html`<script src="${ctx.asset(s)}" defer></script>`)}
  ${page.structuredData ? html`<script type="application/ld+json">${page.structuredData}</script>` : ''}
</head>`;
}

function header(ctx, page) {
  const { t, lang } = ctx;
  const brand = ctx.site.brand;
  const logo = ctx.images.logo;
  const links = NAV.map((item) => {
    const href = ctx.url(item.page, lang) + (item.hash || '');
    const current = !item.hash && item.page === page.key;
    return html`<li><a class="site-nav__link" href="${href}"${current ? html` aria-current="page"` : ''}>${t.nav[item.key]}</a></li>`;
  });
  const otherLang = lang === 'ar' ? 'en' : 'ar';
  return html`<a class="skip-link" href="#main">${t.skip}</a>
${ctx.drafts ? html`<div class="draft-banner" role="note">${t.draftBanner}</div>` : ''}
<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="brand" href="${ctx.url('home', lang)}">
      <img class="brand__logo" src="${ctx.asset(logo.png)}" width="${logo.width / 2}" height="${logo.height / 2}" alt="">
      <span class="brand__text">
        <span class="brand__name">${brand.shortName[lang]}</span>
        <span class="brand__tagline">${brand.tagline[lang]}</span>
      </span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"
      data-nav-toggle data-label-open="${t.nav.open}" data-label-close="${t.nav.close}">
      <span class="nav-toggle__icon nav-toggle__icon--open">${icon('menu')}</span>
      <span class="nav-toggle__icon nav-toggle__icon--close">${icon('x')}</span>
      <span class="visually-hidden" data-nav-toggle-label>${t.nav.open}</span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="${t.nav.label}" data-nav>
      <ul class="site-nav__list">${links}</ul>
      <a class="lang-switch" href="${ctx.url(page.key, otherLang)}" hreflang="${otherLang}" lang="${otherLang}">
        <span aria-hidden="true">${t.nav.switchTo}</span><span class="visually-hidden">${t.nav.switchToLabel}</span>
      </a>
      <a class="btn btn--primary btn--sm site-nav__call" href="tel:${ctx.site.contact.primaryPhone.tel}">
        ${icon('phone', { size: 18 })}<span>${phone(ctx.site.contact.primaryPhone.display)}</span>
      </a>
    </nav>
  </div>
</header>`;
}

function footer(ctx) {
  const { t, lang, site } = ctx;
  const c = site.contact;
  const logo = ctx.images.logo;
  return html`<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <a class="site-footer__logo" href="${ctx.url('home', lang)}">
        <img src="${ctx.asset(logo.png)}" width="${logo.width / 2}" height="${logo.height / 2}" alt="${site.brand.name[lang]}" loading="lazy">
      </a>
      <p class="site-footer__name">${site.brand.name[lang]}</p>
      <p class="site-footer__about">${t.footer.about}</p>
    </div>
    <nav class="site-footer__col" aria-labelledby="footer-links">
      <h2 class="site-footer__heading" id="footer-links">${t.footer.links}</h2>
      <ul class="site-footer__list">
        ${NAV.map((item) => html`<li><a href="${ctx.url(item.page, lang) + (item.hash || '')}">${t.nav[item.key]}</a></li>`)}
      </ul>
    </nav>
    <div class="site-footer__col">
      <h2 class="site-footer__heading">${t.footer.contact}</h2>
      <ul class="site-footer__list site-footer__contact">
        <li><a href="tel:${c.primaryPhone.tel}">${icon('phone', { size: 18 })}${phone(c.primaryPhone.display)}</a></li>
        ${c.secondaryPhones.map((p) => html`<li><a href="tel:${p.tel}">${icon('phone', { size: 18 })}${phone(p.display)}</a></li>`)}
        <li><a href="mailto:${c.email}">${icon('mail', { size: 18 })}${email(c.email)}</a></li>
        ${needs(ctx, c.address[lang], () => html`<li>${icon('map-pin', { size: 18 })}<span>${c.address[lang]}</span></li>`)}
      </ul>
    </div>
    <div class="site-footer__col">
      <h2 class="site-footer__heading">${t.footer.follow}</h2>
      <ul class="site-footer__list">
        ${socialLinks(ctx)}
      </ul>
      <div class="site-footer__cta">${whatsappButton(ctx, { className: 'btn btn--whatsapp btn--sm' })}</div>
    </div>
  </div>
  <div class="site-footer__bottom">
    <div class="container">
      <p>© <span data-year>${ctx.year}</span> ${site.brand.name[lang]}. ${t.footer.rights}</p>
    </div>
  </div>
</footer>`;
}

export function socialLinks(ctx) {
  const iconFor = { facebook: 'facebook', linkedin: 'briefcase-business' };
  return ctx.site.social.map((s) => html`<li><a href="${s.url}" target="_blank" rel="noopener">
    ${icon(iconFor[s.id] || 'external-link', { size: 18 })}<span lang="en">${s.label}</span><span class="visually-hidden">${ctx.t.common.newTab}</span></a></li>`);
}

function mobileBar(ctx) {
  const { t, site } = ctx;
  return html`<aside class="mobile-cta" aria-label="${t.cta.quickContact}" data-mobile-cta>
  <a class="mobile-cta__btn mobile-cta__btn--whatsapp" href="${site.contact.whatsappUrl}" target="_blank" rel="noopener">
    ${icon('whatsapp', { size: 22 })}<span>${t.cta.whatsappShort}</span><span class="visually-hidden">${t.common.newTab}</span></a>
  <a class="mobile-cta__btn mobile-cta__btn--call" href="tel:${site.contact.primaryPhone.tel}">
    ${icon('phone', { size: 22 })}<span>${t.cta.callShort}</span></a>
</aside>`;
}

export function layout(ctx, page) {
  return `<!DOCTYPE html>
<html lang="${ctx.lang}" dir="${ctx.dir}" class="${page.key === 'notFound' ? 'page-404' : `page-${page.key}`}">
${head(ctx, page)}
<body>
${header(ctx, page)}
<main id="main" tabindex="-1">
${page.body}
</main>
${footer(ctx)}
${mobileBar(ctx)}
</body>
</html>
`;
}
