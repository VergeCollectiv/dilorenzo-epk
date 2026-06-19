/* ============================================================
   DILORENZO EPK — main.js
   ============================================================ */

// ---- NAV ---- //
(function () {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links  = document.querySelectorAll('.nm-link');
  if (!nav || !toggle) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.forEach(l => l.addEventListener('click', () => {
    nav.classList.remove('open');
    document.body.style.overflow = '';
  }));
})();

// ---- SCROLL REVEAL ---- //
(function () {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

// ---- SECTION CARD FADE-IN ---- //
(function () {
  const cards = document.querySelectorAll('.section-card');
  if (!('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('card-in'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('card-in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.04 });
  cards.forEach(c => obs.observe(c));
})();

// ---- COUNT-UP ---- //
(function () {
  const els = document.querySelectorAll('.vstat-n[data-target]');
  if (!els.length) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = target + suffix; return; }
      const dur = 1400;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const out = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(out * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
})();

// ---- SOUNDCLOUD WIDGET ---- //
(function () {
  const iframe      = document.getElementById('sc-player');
  const soundbar    = document.getElementById('soundbar');
  const playBtn     = document.getElementById('sbPlayBtn');
  const trackLbl    = document.getElementById('sbTrack');
  const progressFil = document.getElementById('sbProgress');
  if (!iframe || !soundbar) return;

  function initWidget() {
    if (typeof SC === 'undefined') return;
    let playing = false;
    let widget;
    try {
      widget = SC.Widget(iframe);
      widget.bind(SC.Widget.Events.PLAY,   () => { playing = true;  soundbar.classList.add('playing'); });
      widget.bind(SC.Widget.Events.PAUSE,  () => { playing = false; soundbar.classList.remove('playing'); });
      widget.bind(SC.Widget.Events.FINISH, () => { playing = false; soundbar.classList.remove('playing'); });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e) => {
        if (progressFil && e.relativePosition != null) {
          progressFil.style.width = (e.relativePosition * 100) + '%';
        }
        widget.getCurrentSound(s => {
          if (s && trackLbl) trackLbl.textContent = s.title || 'DILORENZO on SoundCloud';
        });
      });
      if (playBtn) {
        playBtn.addEventListener('click', () => { playing ? widget.pause() : widget.play(); });
      }
    } catch (err) { /* Widget failed — soundbar stays idle */ }
  }

  if (typeof SC !== 'undefined') { initWidget(); }
  else { window.addEventListener('load', initWidget); }
})();

// ---- BOOKING FORM ---- //
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', () => {
    const btn = form.querySelector('.form-submit');
    if (!btn) return;
    btn.textContent = 'Opening email...';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = 'Send it'; btn.disabled = false; }, 2200);
  });
})();

// ============================================================
//  ACCORDION — JS-driven height animation
//  Mobile  (≤768px): tap to open/close, one section at a time
//  Desktop (>768px): Rolodex — auto-opens as you scroll down,
//                   closes the previous one (one card visible)
// ============================================================
(function () {
  const MOBILE_MQ = window.matchMedia('(max-width: 768px)');
  const cards     = Array.from(document.querySelectorAll('.section-card'));
  const tabs      = Array.from(document.querySelectorAll('.acc-tab'));

  // ---- Core open / close ---- //
  function expandCard(card) {
    const body = card.querySelector('.acc-body');
    if (!body || card.classList.contains('open')) return;
    card.classList.add('open');
    const tab = card.querySelector('.acc-tab');
    if (tab) tab.setAttribute('aria-expanded', 'true');
    body.style.height = body.scrollHeight + 'px';
    body.addEventListener('transitionend', function onEnd() {
      if (card.classList.contains('open')) body.style.height = 'auto';
      body.removeEventListener('transitionend', onEnd);
    });
  }

  function collapseCard(card) {
    const body = card.querySelector('.acc-body');
    if (!body || !card.classList.contains('open')) return;
    // Pin to current height, then animate to 0
    body.style.height = body.getBoundingClientRect().height + 'px';
    requestAnimationFrame(() => requestAnimationFrame(() => { body.style.height = '0'; }));
    card.classList.remove('open');
    const tab = card.querySelector('.acc-tab');
    if (tab) tab.setAttribute('aria-expanded', 'false');
  }

  function openExclusive(card) {
    cards.forEach(c => { if (c !== card) collapseCard(c); });
    expandCard(card);
  }

  // ---- Tab click — always available as manual override ---- //
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const card = tab.closest('.section-card');
      if (!card) return;
      if (card.classList.contains('open')) {
        collapseCard(card);
      } else {
        if (MOBILE_MQ.matches) {
          openExclusive(card);
          setTimeout(() => tab.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
        } else {
          openExclusive(card);
        }
      }
    });
  });

  // ---- Nav links (mobile): open matching card ---- //
  document.querySelectorAll('.nm-link').forEach(link => {
    link.addEventListener('click', () => {
      if (!MOBILE_MQ.matches) return;
      const id   = link.getAttribute('href').replace('#', '');
      const card = document.getElementById(id);
      if (card && card.classList.contains('section-card')) {
        setTimeout(() => openExclusive(card), 320);
      }
    });
  });

  // Desktop and mobile: all cards closed by default, click to open/close

})();

// ---- SOUNDCLOUD MOBILE FIX ---- //
// iOS Safari blocks Widget API audio control through iframes.
// On mobile, the soundbar play button opens SoundCloud directly instead.
(function () {
  const MOBILE_MQ = window.matchMedia('(max-width: 768px)');
  const playBtn   = document.getElementById('sbPlayBtn');
  if (!playBtn || !MOBILE_MQ.matches) return;

  // Replace play button behaviour with direct SC link on mobile
  playBtn.addEventListener('click', (e) => {
    if (!MOBILE_MQ.matches) return;
    e.stopPropagation();
    window.open('https://soundcloud.com/chrisdilorenzo', '_blank', 'noopener,noreferrer');
  }, true);

  // Update label to hint at this
  const trackLbl = document.getElementById('sbTrack');
  if (trackLbl && MOBILE_MQ.matches) {
    trackLbl.textContent = 'Tap ▶ to open SoundCloud';
  }
})();

// ---- IMAGE FALLBACK ---- //
document.querySelectorAll('img[src]').forEach(img => {
  img.addEventListener('error', function () { this.style.display = 'none'; });
});
