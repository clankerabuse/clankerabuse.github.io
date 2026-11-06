/* Kayne — portfolio
   Theme switch, project filter, scroll reveal. No dependencies. */

(function () {
  'use strict';

  var root = document.documentElement;

  try {
    /* ---------- theme ---------- */

    var toggle = document.getElementById('theme-toggle');
    var themeMeta = document.querySelector('meta[name="theme-color"]');

    function currentTheme() {
      if (root.dataset.theme) return root.dataset.theme;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function paintTheme() {
      var dark = currentTheme() === 'dark';
      if (toggle) {
        toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        toggle.setAttribute('title', dark ? 'Light mode' : 'Dark mode');
      }
      if (themeMeta) themeMeta.setAttribute('content', dark ? '#0b0b0c' : '#f7f6f2');
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
        paintTheme();
      });
    }
    paintTheme();

    /* ---------- year ---------- */

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    /* ---------- filter ---------- */

    var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
    var items = Array.prototype.slice.call(document.querySelectorAll('.feature, #grid .card'));
    var status = document.getElementById('filter-status');

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.filter;
        filters.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });

        var shown = 0;
        items.forEach(function (el) {
          var cats = (el.dataset.cat || '').split(' ');
          var show = key === 'all' || cats.indexOf(key) !== -1;
          el.classList.toggle('is-hidden', !show);
          if (show) {
            shown += 1;
            el.classList.add('in');
          }
        });

        if (status) {
          status.textContent = shown === items.length
            ? 'Showing all ' + items.length + ' projects.'
            : 'Showing ' + shown + ' of ' + items.length + ' projects.';
        }
      });
    });

    /* ---------- reveal ---------- */

    var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    reveals.forEach(function (el) {
      var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
      var index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--d', Math.min(index * 55, 275) + 'ms');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { observer.observe(el); });

    /* Anything still hidden after a few seconds (observer glitch, printing,
       odd embed) is shown regardless. */
    window.setTimeout(function () {
      reveals.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      });
    }, 2600);
  } catch (err) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
})();
