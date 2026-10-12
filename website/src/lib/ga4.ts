export const GA4_ID = 'G-589QLTH004';

// 13 months, the longest lifetime European regulators accept for analytics cookies.
const COOKIE_LIFETIME_SECONDS = 60 * 60 * 24 * 395;

type Gtag = (...args: unknown[]) => void;
type GaWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag } & Record<string, unknown>;

function gaWindow(): GaWindow {
  return window as unknown as GaWindow;
}

// Called only after the visitor accepted analytics cookies: before that,
// nothing from Google is loaded and no request leaves the browser.
export function loadGa4(id: string = GA4_ID): void {
  const w = gaWindow();
  // Lets gtag send hits again after a withdrawal followed by a new consent.
  w[`ga-disable-${id}`] = false;

  if (document.querySelector(`script[src*="${id}"]`)) {
    w.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    return;
  }

  w.dataLayer = w.dataLayer ?? [];
  // gtag identifies commands by their Arguments object, so this can't use rest parameters.
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  // We don't run ads: the ad signals stay denied for everyone.
  w.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });
  w.gtag('js', new Date());
  w.gtag('config', id, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: COOKIE_LIFETIME_SECONDS,
  });

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script.async = true;
  document.head.appendChild(script);
}

// Called when the visitor withdraws consent. The consent library deletes the
// _ga cookies; this makes sure the already loaded gtag sends nothing more.
export function revokeGa4Analytics(id: string = GA4_ID): void {
  const w = gaWindow();
  w[`ga-disable-${id}`] = true;
  w.gtag?.('consent', 'update', { analytics_storage: 'denied' });
}
