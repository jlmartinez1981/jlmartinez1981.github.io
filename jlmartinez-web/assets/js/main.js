/* =========================================================
   main.js — theme, i18n, navigation, reveal, counters, form
   No dependencies. Runs on GitHub Pages as static files.
   ========================================================= */
(function () {
  'use strict';

  var STORE_THEME = 'jlm-theme';
  var STORE_LANG  = 'jlm-lang';
  var html = document.documentElement;

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }

  /* ---------------------- Theme ---------------------- */
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f9fc' : '#0a0e1a');
  }

  // El diseño es "dark first": se usa el tema oscuro salvo que el visitante
  // haya elegido explícitamente el claro con el conmutador.
  applyTheme(safeGet(STORE_THEME) === 'light' ? 'light' : 'dark');

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      safeSet(STORE_THEME, next);
    });
  }

  /* ---------------------- i18n ---------------------- */
  var DICT = window.I18N || {};

  function t(key, lang) {
    var pack = DICT[lang] || {};
    return Object.prototype.hasOwnProperty.call(pack, key) ? pack[key] : null;
  }

  function applyLang(lang) {
    if (!DICT[lang]) lang = 'es';

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n'), lang);
      if (value === null) return;
      if (el.tagName === 'META') el.setAttribute('content', value);
      else el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n-aria-label'), lang);
      if (value !== null) el.setAttribute('aria-label', value);
    });

    var title = t('meta.title', lang);
    if (title) document.title = title;

    html.setAttribute('lang', lang);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var on = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    safeSet(STORE_LANG, lang);
    window.CURRENT_LANG = lang;
  }

  function initialLang() {
    var stored = safeGet(STORE_LANG);
    if (stored && DICT[stored]) return stored;
    var nav = (navigator.language || 'es').toLowerCase();
    return nav.indexOf('es') === 0 ? 'es' : 'en';
  }

  applyLang(initialLang());

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { applyLang(btn.getAttribute('data-lang')); });
  });

  /* ---------------------- Mobile nav ---------------------- */
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeNav(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* ---------------------- Header state, progress, to-top ---------------------- */
  var header = document.getElementById('site-header');
  var progress = document.getElementById('scroll-progress');
  var toTop = document.getElementById('to-top');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------------------- Active nav link ---------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------------- Reveal on scroll ---------------------- */
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
        el.classList.add('is-in');
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------- Animated counters ---------------------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('.metric-value[data-count]'));

  function renderCounter(el, value) {
    el.textContent = value + (el.getAttribute('data-suffix') || '');
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    if (reduced) { renderCounter(el, target); return; }
    var duration = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      renderCounter(el, Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) { renderCounter(el, parseFloat(el.getAttribute('data-count')) || 0); });
  }

  /* ---------------------- Historial de experiencia colapsable ---------------------- */
  var timeline = document.getElementById('timeline');
  var moreBtn = document.getElementById('tl-more-btn');
  var moreLabel = document.getElementById('tl-more-label');

  if (timeline && moreBtn && moreLabel) {
    moreBtn.addEventListener('click', function () {
      var expanded = timeline.classList.toggle('is-expanded');
      moreBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      moreLabel.setAttribute('data-i18n', expanded ? 'experience.showLess' : 'experience.showMore');
      applyLang(window.CURRENT_LANG || 'es');

      // Los puestos ocultos nunca llegan al IntersectionObserver, así que
      // se marcan como visibles al desplegarlos.
      if (expanded) {
        timeline.querySelectorAll('.tl-extra').forEach(function (el) {
          el.style.transitionDelay = '0ms';
          el.classList.add('is-in');
        });
      } else {
        moreBtn.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      }
    });
  }

  /* ---------------------- Contact form (Formspree) ---------------------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  function setStatus(key, kind) {
    if (!status) return;
    status.textContent = t(key, window.CURRENT_LANG || 'es') || '';
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        setStatus('form.invalid', 'error');
        form.reportValidity();
        return;
      }

      var action = form.getAttribute('action') || '';
      if (action.indexOf('TU_ENDPOINT') !== -1) {
        setStatus('form.notConfigured', 'error');
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = t('form.sending', window.CURRENT_LANG || 'es') || 'Sending…';
      }
      setStatus('', '');

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          setStatus('form.ok', 'ok');
        })
        .catch(function () {
          setStatus('form.error', 'error');
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel || t('form.send', window.CURRENT_LANG || 'es');
          }
        });
    });
  }

  /* ---------------------- Footer year ---------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
