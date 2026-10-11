import { beforeEach, describe, expect, it } from 'vitest';
import { loadGa4, revokeGa4Analytics } from './ga4';

type TestWindow = Window & { dataLayer?: IArguments[]; gtag?: (...args: unknown[]) => void } & Record<string, unknown>;
const w = window as unknown as TestWindow;

function commands(): unknown[][] {
  return (w.dataLayer ?? []).map((entry) => Array.from(entry));
}

beforeEach(() => {
  document.head.innerHTML = '';
  delete w.dataLayer;
  delete w.gtag;
  delete w['ga-disable-G-TEST'];
});

describe('loadGa4', () => {
  it('adds the gtag script once', () => {
    loadGa4('G-TEST');
    loadGa4('G-TEST');

    const scripts = document.querySelectorAll<HTMLScriptElement>('script[src*="G-TEST"]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST');
    expect(scripts[0].async).toBe(true);
  });

  it('pushes Arguments objects, which is the only form gtag reads', () => {
    loadGa4('G-TEST');

    expect(w.dataLayer!.length).toBeGreaterThan(0);
    for (const entry of w.dataLayer!) expect(Array.isArray(entry)).toBe(false);
  });

  it('keeps the ad signals denied and turns off Google signals', () => {
    loadGa4('G-TEST');

    expect(commands()).toContainEqual([
      'consent',
      'default',
      { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' },
    ]);
    const config = commands().find(([command]) => command === 'config');
    expect(config?.[1]).toBe('G-TEST');
    expect(config?.[2]).toMatchObject({ allow_google_signals: false, allow_ad_personalization_signals: false });
  });

  it('grants analytics again after a withdrawal', () => {
    loadGa4('G-TEST');
    revokeGa4Analytics('G-TEST');
    loadGa4('G-TEST');

    expect(w['ga-disable-G-TEST']).toBe(false);
    expect(commands().at(-1)).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
  });
});

describe('revokeGa4Analytics', () => {
  it('stops gtag from sending and denies analytics storage', () => {
    loadGa4('G-TEST');
    revokeGa4Analytics('G-TEST');

    expect(w['ga-disable-G-TEST']).toBe(true);
    expect(commands().at(-1)).toEqual(['consent', 'update', { analytics_storage: 'denied' }]);
  });

  it('does nothing harmful when analytics was never loaded', () => {
    expect(() => revokeGa4Analytics('G-TEST')).not.toThrow();
    expect(w.gtag).toBeUndefined();
  });
});
