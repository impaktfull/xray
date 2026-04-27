// xRay marketing site — cookiethough.dev ↔ Google Consent Mode v2 bridge.
// Loaded with defer.
//
// We only ever flip `analytics_storage`. Ad-related signals stay denied
// permanently — we don't run ads and don't ask consent for them.

(function () {
  'use strict';

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function applyConsent(analyticsGranted) {
    gtag('consent', 'update', {
      analytics_storage: analyticsGranted ? 'granted' : 'denied',
    });
    if (analyticsGranted) {
      gtag('event', 'page_view', {
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    }
  }

  function init() {
    if (
      typeof window.CookieThough === 'undefined' ||
      typeof window.CookieThough.init !== 'function'
    ) {
      window.setTimeout(init, 50);
      return;
    }

    window.CookieThough.init({
      policies: [
        {
          id: 'analytics',
          label: 'Analytics',
          description:
            'Anonymous traffic and usage measurement via Google Analytics 4.',
          category: 'statistics',
        },
      ],
      essentialLabel: 'Always on',
      permissionLabels: {
        accept: 'Accept',
        acceptAll: 'Accept all',
        decline: 'Decline',
      },
      header: {
        title: 'Cookie preferences',
        subTitle: 'Choose what we may track.',
        description:
          'xRay uses anonymous analytics to understand traffic. You can opt in or out at any time. Strictly necessary cookies are always on.',
      },
      customizeLabel: 'Customize',
    });

    if (typeof window.CookieThough.onPreferencesChanged === 'function') {
      window.CookieThough.onPreferencesChanged(function (preferences) {
        var granted = !!(preferences && preferences.analytics);
        applyConsent(granted);
      });
    }

    if (typeof window.CookieThough.getPreferences === 'function') {
      try {
        var current = window.CookieThough.getPreferences();
        if (current && typeof current.analytics === 'boolean') {
          applyConsent(current.analytics);
        }
      } catch (_) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
