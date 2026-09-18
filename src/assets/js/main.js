// Site behaviour: mobile navigation, header state, company film (hero + video section), footer year.
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

  // ---------- Company film: muted in the hero from tablet width up; sound only on request ----------
  // Browsers only allow autoplay when muted, so the hero plays muted and «شغّل الصوت / Turn sound on» (a user gesture,
  // which every browser accepts for sound) unmutes it and restarts it from the beginning. The sources are attached
  // after page load and only from 48em up: phones never download the hero video, and the still paints first. On phones,
  // and when the hero video is not in use, the button plays the film with sound in the video section instead.
  const hero = document.querySelector('[data-hero-video]');
  const film = document.querySelector('[data-section-video]');
  const controls = document.querySelector('[data-hero-controls]');
  if (hero && film && controls) {
    const soundBtn = controls.querySelector('[data-hero-sound]');
    const soundLabel = soundBtn.querySelector('[data-hero-sound-label]');
    const pauseBtn = controls.querySelector('[data-hero-pause]');
    const pauseLabel = pauseBtn.querySelector('[data-hero-pause-label]');
    const wide = window.matchMedia('(min-width: 48em)');
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    // Apple's WebKit (Safari, and every browser on iOS) decodes H.264 in hardware on every Apple device, while its WebM
    // support depends on the OS version; in testing, WebKit stalled on the WebM. There the MP4 goes first; elsewhere
    // (Android Chrome, desktop Chrome/Firefox/Edge) the smaller WebM stays first.
    const WEBM = 'video/webm; codecs="vp9, opus"';
    const MP4 = 'video/mp4; codecs="avc1.64001f, mp4a.40.2"';
    const preferMp4 = navigator.vendor === 'Apple Computer, Inc.';
    if (preferMp4) {
      const mp4Source = film.querySelector('source[type^="video/mp4"]');
      if (mp4Source && film.firstElementChild !== mp4Source) {
        film.prepend(mp4Source);
        film.load();
      }
    }
    let attached = false;
    let userPaused = false;
    let inView = true;

    const attach = () => {
      if (attached) return;
      attached = true;
      const sources = [[hero.dataset.webm, WEBM], [hero.dataset.mp4, MP4]];
      for (const [src, type] of preferMp4 ? sources.reverse() : sources) {
        const source = document.createElement('source');
        source.src = src;
        source.type = type;
        hero.append(source);
      }
      hero.preload = 'auto';
      hero.load();
    };

    const render = () => {
      const soundOn = attached && !hero.muted;
      soundBtn.setAttribute('aria-pressed', String(soundOn));
      soundLabel.textContent = soundOn ? soundBtn.dataset.labelOff : soundBtn.dataset.labelOn;
      pauseBtn.hidden = !attached || !wide.matches;
      const playing = attached && !hero.paused;
      pauseBtn.dataset.state = playing ? 'playing' : 'paused';
      pauseLabel.textContent = playing ? pauseBtn.dataset.labelPause : pauseBtn.dataset.labelPlay;
    };
    const play = (v) => v.play().catch(() => render());

    // Muted background loop: starts after load, and only when it costs nothing the visitor asked to avoid.
    const autostart = () => {
      if (!wide.matches || reducedMotion.matches || saveData || userPaused) return;
      attach();
      play(hero);
    };

    controls.hidden = false;
    hero.addEventListener('playing', () => { hero.classList.add('is-playing'); render(); });
    hero.addEventListener('pause', render);
    hero.addEventListener('volumechange', render);
    // With sound the film plays once and stops on its last frame (the company logo); then it is quiet again.
    hero.addEventListener('ended', () => {
      hero.muted = true;
      hero.loop = true;
      render();
    });

    soundBtn.addEventListener('click', () => {
      if (wide.matches) {
        if (attached && !hero.muted) {
          hero.muted = true;
          hero.loop = true;
        } else {
          attach();
          film.pause();
          userPaused = false;
          hero.loop = false;
          hero.muted = false;
          hero.currentTime = 0;
          play(hero);
        }
        render();
        return;
      }
      // Phones: the film in the video section, with sound, from the start. play() stays inside the click handler.
      film.muted = false;
      film.currentTime = 0;
      play(film);
      film.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    });

    pauseBtn.addEventListener('click', () => {
      if (hero.paused) {
        userPaused = false;
        play(hero);
      } else {
        userPaused = true;
        hero.pause();
      }
    });

    // Only one soundtrack at a time.
    film.addEventListener('play', () => {
      if (!hero.paused) hero.pause();
    });

    // The quiet loop pauses off screen and in background tabs; the film with sound keeps playing.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (!attached || !hero.muted) return;
        if (!inView) hero.pause();
        else if (!userPaused && film.paused) play(hero);
      }, { threshold: 0.1 }).observe(hero);
    }
    document.addEventListener('visibilitychange', () => {
      if (!attached || !hero.muted) return;
      if (document.hidden) hero.pause();
      else if (inView && !userPaused && film.paused) play(hero);
    });

    wide.addEventListener('change', () => {
      if (wide.matches) autostart();
      else if (attached) hero.pause();
      render();
    });
    reducedMotion.addEventListener('change', (e) => {
      if (e.matches && attached && hero.muted) {
        userPaused = true;
        hero.pause();
      }
    });

    // Start after the page has loaded so the film never competes with the first paint, but at the latest 3 s after
    // the script runs: a media element can hold back the load event (WebKit did, in testing).
    let kicked = false;
    const kick = () => {
      if (kicked) return;
      kicked = true;
      autostart();
    };
    render();
    if (document.readyState === 'complete') kick();
    else {
      window.addEventListener('load', kick, { once: true });
      setTimeout(kick, 3000);
    }
  }

  // ---------- Footer year (keeps the static build year current) ----------
  const year = String(new Date().getFullYear());
  for (const el of document.querySelectorAll('[data-year]')) {
    if (el.textContent !== year) el.textContent = year;
  }
})();
