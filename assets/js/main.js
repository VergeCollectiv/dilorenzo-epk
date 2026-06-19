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
// Only observes elements outside accordion bodies (hero, etc.)
// Accordion reveals fire immediately on open via expandCard()
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
  // Only observe reveals that are NOT inside an accordion body
  document.querySelectorAll('.reveal').forEach(el => {
    if (!el.closest('.acc-body')) obs.observe(el);
  });
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
// Exposed so accordion expandCard() can call it directly
function runCountUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target + suffix; return;
  }
  const dur = 1000;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const out = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(out * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
(function () {
  // Only observe stats that are NOT inside an accordion body
  // (accordion stats are triggered by expandCard instead)
  const els = document.querySelectorAll('.vstat-n[data-target]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { runCountUp(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  els.forEach(el => {
    if (!el.closest('.acc-body')) obs.observe(el);
  });
})();

// ---- SOUNDCLOUD WIDGET ---- //
(function () {
  const iframe      = document.getElementById('sc-player');
  const soundbar    = document.getElementById('soundbar');
  const playBtn     = document.getElementById('sbPlayBtn');
  const trackLbl    = document.getElementById('sbTrack');
  const progressFil = document.getElementById('sbProgress');
  const scFallback  = document.getElementById('sbScFallback');
  if (!iframe || !soundbar) return;

  let playing = false;
  let widget  = null;
  let widgetReady = false;

  function attachWidget() {
    if (typeof SC === 'undefined' || widget) return;
    try {
      widget = SC.Widget(iframe);
      widget.bind(SC.Widget.Events.READY, () => {
        widgetReady = true;
        widget.getCurrentSound(s => {
          if (s && trackLbl) trackLbl.textContent = s.title || 'DILORENZO on SoundCloud';
        });
        widget.bind(SC.Widget.Events.PLAY, () => {
          playing = true;
          soundbar.classList.add('playing');
          // Hide fallback SC link once audio is confirmed playing
          if (scFallback) scFallback.style.display = 'none';
          widget.getCurrentSound(s => {
            if (s && trackLbl) trackLbl.textContent = s.title || 'DILORENZO on SoundCloud';
          });
        });
        widget.bind(SC.Widget.Events.PAUSE,  () => { playing = false; soundbar.classList.remove('playing'); });
        widget.bind(SC.Widget.Events.FINISH, () => { playing = false; soundbar.classList.remove('playing'); });
        widget.bind(SC.Widget.Events.PLAY_PROGRESS, e => {
          if (progressFil && e.relativePosition != null) {
            progressFil.style.width = (e.relativePosition * 100) + '%';
          }
        });
      });

      if (playBtn) {
        playBtn.addEventListener('click', () => {
          if (!widgetReady) return;
          playing ? widget.pause() : widget.play();
          // On mobile, if audio doesn't start within 800ms (iOS block), show SC link
          if (!playing) {
            setTimeout(() => {
              if (!playing && scFallback) scFallback.style.display = 'flex';
            }, 800);
          }
        });
      }
    } catch (err) {
      if (scFallback) scFallback.style.display = 'flex';
    }
  }

  if (typeof SC !== 'undefined') { attachWidget(); }
  else { window.addEventListener('load', attachWidget); }
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

// ---- ACCORDION ---- //
(function () {
  const MOBILE_MQ = window.matchMedia('(max-width: 768px)');
  const cards     = Array.from(document.querySelectorAll('.section-card'));
  const tabs      = Array.from(document.querySelectorAll('.acc-tab'));

  function expandCard(card) {
    const body = card.querySelector('.acc-body');
    if (!body || card.classList.contains('open')) return;
    card.classList.add('open');
    const tab = card.querySelector('.acc-tab');
    if (tab) tab.setAttribute('aria-expanded', 'true');
    // Fire all reveals inside immediately — avoids IntersectionObserver
    // triggering mid-scroll which causes image scatter on mobile
    card.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    card.querySelectorAll('.vstat-n[data-target]').forEach(runCountUp);
    body.style.height = body.scrollHeight + 'px';
    body.addEventListener('transitionend', function onEnd() {
      if (card.classList.contains('open')) body.style.height = 'auto';
      body.removeEventListener('transitionend', onEnd);
    });
  }

  function collapseCard(card) {
    const body = card.querySelector('.acc-body');
    if (!body || !card.classList.contains('open')) return;
    body.style.height = body.getBoundingClientRect().height + 'px';
    requestAnimationFrame(() => requestAnimationFrame(() => { body.style.height = '0'; }));
    card.classList.remove('open');
    const tab = card.querySelector('.acc-tab');
    if (tab) tab.setAttribute('aria-expanded', 'false');
    card.querySelectorAll('.vstat-n[data-target]').forEach(el => delete el.dataset.counted);
  }

  function openExclusive(card) {
    cards.forEach(c => { if (c !== card) collapseCard(c); });
    expandCard(card);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const card = tab.closest('.section-card');
      if (!card) return;
      if (card.classList.contains('open')) {
        collapseCard(card);
      } else {
        openExclusive(card);
      }
    });
  });

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
})();

// ---- IMAGE FALLBACK ---- //
document.querySelectorAll('img[src]').forEach(img => {
  img.addEventListener('error', function () { this.style.display = 'none'; });
});
