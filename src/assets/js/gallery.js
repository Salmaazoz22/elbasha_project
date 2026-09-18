// Site gallery on the projects page: subject filters and a <dialog> lightbox. The same viewer opens the photo set of
// a project card ([data-lightbox-set]). Without this file every thumbnail is still a link to the full-size photo and
// all photos are shown.
(() => {
  'use strict';
  const grid = document.querySelector('[data-gallery-grid]');
  const dialog = document.querySelector('[data-lightbox]');
  if (!grid || !dialog || typeof dialog.showModal !== 'function') return;

  const items = [...grid.querySelectorAll('.gallery__item')];
  const links = items.map((li) => li.querySelector('[data-gallery-link]'));
  const filters = document.querySelector('[data-gallery-filters]');
  const empty = document.querySelector('[data-gallery-empty]');
  // The image is created here, not in the markup: the dialog can only be opened with JavaScript.
  const img = document.createElement('img');
  img.className = 'lightbox__img';
  img.sizes = '(min-width: 62em) 70vw, 94vw';
  img.alt = '';
  img.dataset.lightboxImg = '';
  dialog.querySelector('[data-lightbox-media]').append(img);
  const caption = dialog.querySelector('[data-lightbox-caption]');
  const counter = dialog.querySelector('[data-lightbox-count]');
  let strings = { counter: '{n} / {total}' };
  try {
    strings = { ...strings, ...JSON.parse(dialog.querySelector('[data-lightbox-strings]').textContent) };
  } catch (e) { /* keep the default */ }

  // ---------- filters ----------
  // `visible` is the grid as filtered; `current` is what the viewer steps through (the grid or one card's set).
  let visible = [...links];
  let current = visible;
  if (filters) {
    const chips = [...filters.querySelectorAll('[data-gallery-filter]')];
    filters.hidden = false;
    filters.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-gallery-filter]');
      if (!chip) return;
      const subject = chip.dataset.galleryFilter;
      for (const c of chips) c.setAttribute('aria-pressed', String(c === chip));
      items.forEach((li, i) => { li.hidden = subject !== 'all' && li.dataset.subject !== subject; });
      visible = links.filter((_, i) => !items[i].hidden);
      if (empty) empty.hidden = visible.length > 0;
    });
  }

  // ---------- lightbox ----------
  let index = 0;
  let opener = null;

  function show(i) {
    index = (i + current.length) % current.length;
    const link = current[index];
    const thumb = link.querySelector('img');
    img.src = link.href;
    img.srcset = link.dataset.srcset || '';
    img.alt = link.dataset.alt || (thumb ? thumb.alt : '');
    caption.textContent = img.alt;
    counter.textContent = strings.counter.replace('{n}', index + 1).replace('{total}', current.length);
  }

  function open(e, set) {
    const link = e.target.closest('[data-gallery-link]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    opener = link;
    current = set();
    show(current.indexOf(link));
    dialog.showModal();
  }

  grid.addEventListener('click', (e) => open(e, () => visible));
  for (const set of document.querySelectorAll('[data-lightbox-set]')) {
    const setLinks = [...set.querySelectorAll('[data-gallery-link]')];
    set.addEventListener('click', (e) => open(e, () => setLinks));
  }

  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
  });

  // Click on the backdrop (outside the figure) closes the viewer.
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  // Swipe on touch screens.
  let startX = null;
  dialog.addEventListener('pointerdown', (e) => { startX = e.pointerType === 'mouse' ? null : e.clientX; });
  dialog.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
  });

  dialog.addEventListener('close', () => {
    img.removeAttribute('src');
    img.removeAttribute('srcset');
    if (opener) opener.focus();
  });
})();
