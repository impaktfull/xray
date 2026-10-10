// xRay marketing site — GA4 event wiring.
// Loaded with defer; runs after DOMContentLoaded-equivalent.
//
// All events flow through Google Consent Mode v2:
//   - consent denied/undecided → cookieless ping
//   - consent granted          → identified GA4 event
//
// No PII is ever included as a parameter.

(function () {
  'use strict';

  function track(eventName, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params || {});
  }

  document.addEventListener('click', function (event) {
    var anchor = event.target.closest('a');
    if (!anchor) return;

    var href = anchor.getAttribute('href') || '';
    var text = (anchor.textContent || '').trim().slice(0, 80);

    if (anchor.matches('.hero-buttons a')) {
      track('cta_click', {
        cta_id: href.replace(/^#/, '') || 'unknown',
        cta_location: 'hero',
        link_text: text,
      });
    }

    if (anchor.closest('.nav-center, .navbar .btn-primary, .nav-left')) {
      track('nav_click', { link_text: text, link_url: href });
    }

    if (anchor.closest('footer')) {
      track('footer_click', { link_text: text, link_url: href });
    }

    var downloadCard = anchor.closest('.download-card');
    if (downloadCard) {
      var heading = downloadCard.querySelector('h3');
      var platform = heading ? heading.textContent.trim() : 'unknown';
      track('download_click', {
        platform: platform,
        state: 'available',
        link_url: href,
      });
    }

    if (/^https?:\/\//i.test(href)) {
      try {
        var url = new URL(href, window.location.href);
        if (url.host !== window.location.host) {
          track('outbound_click', {
            link_url: href,
            link_domain: url.host,
            link_text: text,
          });
        }
      } catch (_) {}
    }
  }, true);

  Array.prototype.forEach.call(
    document.querySelectorAll('.download-card'),
    function (card) {
      if (card.querySelector('a')) return;
      card.addEventListener('click', function () {
        var heading = card.querySelector('h3');
        var platform = heading ? heading.textContent.trim() : 'unknown';
        track('download_click', { platform: platform, state: 'coming_soon' });
      });
    }
  );

  var alphaForm = document.getElementById('alpha-form');
  if (alphaForm) {
    var alphaInput = alphaForm.querySelector('#alpha-email');
    var alphaStatus = document.getElementById('alpha-form-status');
    var focusedOnce = false;

    if (alphaInput) {
      alphaInput.addEventListener('focus', function () {
        if (focusedOnce) return;
        focusedOnce = true;
        track('alpha_form_focus');
      });
    }

    if (alphaStatus) {
      var observer = new MutationObserver(function () {
        var kind = alphaStatus.dataset.kind;
        if (!kind || kind === 'loading') return;
        var outcome = kind;
        if (kind === 'error') {
          var message = (alphaStatus.textContent || '').toLowerCase();
          if (message.indexOf('valid email') !== -1) outcome = 'validation_error';
          else if (message.indexOf('network') !== -1) outcome = 'network_error';
          else outcome = 'server_error';
        }
        track('alpha_form_submit', { outcome: outcome });
      });
      observer.observe(alphaStatus, {
        childList: true,
        attributes: true,
        attributeFilter: ['data-kind'],
      });
    }
  }

  var scrollMarks = [25, 50, 75, 100];
  var scrollFired = {};
  function onScroll() {
    var doc = document.documentElement;
    var scrolled = window.scrollY + window.innerHeight;
    var height = doc.scrollHeight;
    if (height <= window.innerHeight) return;
    var pct = Math.min(100, Math.round((scrolled / height) * 100));
    for (var i = 0; i < scrollMarks.length; i++) {
      var mark = scrollMarks[i];
      if (pct >= mark && !scrollFired[mark]) {
        scrollFired[mark] = true;
        track('scroll_depth', { percent: mark });
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window) {
    var seenSections = {};
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          if (!id || seenSections[id]) return;
          seenSections[id] = true;
          track('section_view', { section_id: id });
        });
      },
      { threshold: 0.4 }
    );
    Array.prototype.forEach.call(
      document.querySelectorAll('section[id]'),
      function (section) {
        sectionObserver.observe(section);
      }
    );
  }
})();
