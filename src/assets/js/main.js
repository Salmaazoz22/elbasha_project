// Site behaviour: mobile navigation, header state, work video, footer year.
// (Reveal-on-scroll is pure CSS: see main.css.)
// Progressive enhancement only — every page is fully usable without JavaScript.
(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- Mobile navigation ----------
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (header && toggle && nav) {
    const label = toggle.querySelector('[data-nav-toggle-label]');
    const desktop = window.matchMedia('(min-width: 62em)');

    const setOpen = (open, { focus = false } = {}) => {
      toggle.setAttribute('aria-expanded', String(open));
      header.classList.toggle('nav-open', open);
      root.classList.toggle('nav-is-open', open);
      label.textContent = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
      if (open && focus) nav.querySelector('a')?.focus();
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true', { focus: true });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (header.classList.contains('nav-open') && !header.contains(e.target)) setOpen(false);
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    desktop.addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });

    // Header shadow once the page scrolls.
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Work video: plays muted only while visible; never autoplays with reduced motion ----------
  const video = document.querySelector('[data-autoplay-video]');
  const videoToggle = document.querySelector('[data-video-toggle]');
  if (video && videoToggle) {
    const toggleLabel = videoToggle.querySelector('[data-video-toggle-label]');
    let userPaused = reducedMotion.matches;
    let inView = false;

    video.removeAttribute('controls');
    video.muted = true;
    videoToggle.hidden = false;

    const render = () => {
      const playing = !video.paused;
      videoToggle.setAttribute('aria-pressed', String(playing));
      toggleLabel.textContent = playing ? videoToggle.dataset.labelPause : videoToggle.dataset.labelPlay;
    };
    const play = () => video.play().catch(() => render());

    video.addEventListener('play', render);
    video.addEventListener('pause', render);
    render();

    videoToggle.addEventListener('click', () => {
      if (video.paused) {
        userPaused = false;
        video.preload = 'auto';
        play();
      } else {
        userPaused = true;
        video.pause();
      }
    });

    reducedMotion.addEventListener('change', (e) => {
      if (e.matches) {
        userPaused = true;
        video.pause();
      }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !userPaused) {
          video.preload = 'auto';
          play();
        } else if (!inView && !video.paused) {
          video.pause();
        }
      }, { threshold: 0.25 }).observe(video);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else if (inView && !userPaused) play();
    });
  }

  // ---------- Footer year (keeps the static build year current) ----------
  const year = String(new Date().getFullYear());
  for (const el of document.querySelectorAll('[data-year]')) {
    if (el.textContent !== year) el.textContent = year;
  }
})();
