import { describe, expect, it } from 'vitest';
import { activeConnection } from './access';
import { initialState } from './demoState';
import {
  closeDrawer,
  openDeepLink,
  openDrawer,
  overrideCount,
  resetAllOverrides,
  resetFlag,
  sendPush,
  setDeviceSetting,
  setFlag,
  toggleDarkMode,
} from './deviceActions';

const device = (s: ReturnType<typeof initialState>) => activeConnection(s)!.device;
const logs = (s: ReturnType<typeof initialState>) => activeConnection(s)!.session.logs;

describe('device actions', () => {
  it('opens and closes the drawer on a tab', () => {
    const s = openDrawer(initialState(), 'push');
    expect(s.drawer).toEqual({ tab: 'push' });
    expect(closeDrawer(s).drawer).toBeUndefined();
  });

  it('overrides a setting, counts it and logs what the app saw', () => {
    const s = setDeviceSetting(initialState(), 'locale', 'nl_BE');
    expect(device(s).settings.locale).toBe('nl_BE');
    expect(overrideCount(device(s))).toBe(1);
    expect(logs(s)[0]).toMatchObject({ message: 'Locale changed to nl_BE', logger: 'DeviceActions' });
  });

  it('toggles dark mode from the system default', () => {
    const s = toggleDarkMode(initialState());
    expect(device(s).settings.appearance).toBe('dark');
    expect(device(toggleDarkMode(s)).settings.appearance).toBe('light');
  });

  it('opening a project link logs the route and fetches the project', () => {
    const s0 = initialState();
    const s = openDeepLink(s0, 'myapp://projects/42');
    expect(logs(s).slice(0, 2).map((l) => l.message)).toEqual(['Navigated to /projects/42', 'Opened deep link myapp://projects/42']);
    expect(activeConnection(s)!.session.calls[0].url).toMatch(/\/api\/v1\/projects\/42$/);
    expect(device(s).recentLinks[0]).toBe('myapp://projects/42');
  });

  it('sending a push logs how it was delivered', () => {
    const s = sendPush(initialState(), 'Invoice paid', 'tap');
    expect(logs(s)[0].message).toBe('Push received and opened by a tap: "Invoice paid"');
    expect(s.toast?.message).toBe('Push sent to the device');
  });

  it('overrides a flag, resets it, and resets everything', () => {
    let s = setFlag(initialState(), 'new_project_board', true);
    expect(overrideCount(device(s))).toBe(1);
    s = resetFlag(s, 'new_project_board');
    expect(overrideCount(device(s))).toBe(0);
    s = resetAllOverrides(setDeviceSetting(setFlag(s, 'max_upload_mb', 50), 'textScale', 1.6));
    expect(overrideCount(device(s))).toBe(0);
  });
});
