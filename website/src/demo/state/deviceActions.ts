import { completedCall } from '../data/events';
import { createRng } from '../data/seed';
import type { DeviceSettings, DeviceState, FeatureFlag, LogEntry, LogLevel } from '../model/types';
import { activeConnection } from './access';
import type { DemoState, DeviceTab } from './demoState';

let eventCounter = 0;
const nextId = (kind: string) => `device-${kind}-${eventCounter++}`;

function updateDevice(state: DemoState, update: (device: DeviceState) => DeviceState): DemoState {
  return {
    ...state,
    connections: state.connections.map((c) => (c.id === state.activeConnectionId ? { ...c, device: update(c.device) } : c)),
  };
}

/** What the app logs when Device Actions changes something, so the change shows up in Logs and on the timeline. */
function appLog(state: DemoState, message: string, logger: string, level: LogLevel = 'info'): DemoState {
  const log: LogEntry = { id: nextId('log'), at: state.now, level, logger, message };
  return {
    ...state,
    connections: state.connections.map((c) =>
      c.id === state.activeConnectionId ? { ...c, session: { ...c.session, logs: [log, ...c.session.logs] } } : c,
    ),
  };
}

export const openDrawer = (state: DemoState, tab: DeviceTab = 'quick'): DemoState =>
  state.activeConnectionId ? { ...state, drawer: { tab }, modal: undefined } : state;

export const closeDrawer = (state: DemoState): DemoState => ({ ...state, drawer: undefined });

const settingMessages: { [K in keyof DeviceSettings]: (value: DeviceSettings[K]) => string } = {
  appearance: (v) => `Theme changed to ${v}`,
  locale: (v) => `Locale changed to ${v}`,
  textScale: (v) => `Text scale changed to ${v}×`,
  animations: (v) => (v === 'off' ? 'Animations disabled' : `Animation speed set to ${v}×`),
  boldText: (v) => `Bold text ${v ? 'on' : 'off'}`,
  highContrast: (v) => `High contrast ${v ? 'on' : 'off'}`,
  layoutBounds: (v) => `Layout bounds ${v ? 'shown' : 'hidden'}`,
  performanceOverlay: (v) => `Performance overlay ${v ? 'shown' : 'hidden'}`,
};

export function setDeviceSetting<K extends keyof DeviceSettings>(state: DemoState, key: K, value: DeviceSettings[K]): DemoState {
  const next = updateDevice(state, (device) => ({ ...device, settings: { ...device.settings, [key]: value } }));
  return appLog(next, settingMessages[key](value), 'DeviceActions');
}

export const isOverridden = (device: DeviceState, key: keyof DeviceSettings) => device.settings[key] !== device.defaults[key];

export const overrideCount = (device: DeviceState) =>
  (Object.keys(device.settings) as (keyof DeviceSettings)[]).filter((k) => isOverridden(device, k)).length +
  device.flags.filter((f) => f.value !== f.remote).length;

/** Light and dark only; "system" counts as light, like the device it runs on. */
export const toggleDarkMode = (state: DemoState): DemoState => {
  const device = activeConnection(state)?.device;
  return device ? setDeviceSetting(state, 'appearance', device.settings.appearance === 'dark' ? 'light' : 'dark') : state;
};

export const toggleAnimations = (state: DemoState): DemoState => {
  const device = activeConnection(state)?.device;
  return device ? setDeviceSetting(state, 'animations', device.settings.animations === 'off' ? '1' : 'off') : state;
};

/** Opening a link: the app logs the route, and a project link fetches that project. */
export function openDeepLink(state: DemoState, url: string): DemoState {
  // https links carry a host; for the app's own scheme everything after :// is the route.
  const route = (/^https?:\/\//i.test(url) ? url.replace(/^https?:\/\/[^/]*/i, '') : `/${url.replace(/^[a-z]+:\/\//i, '')}`) || '/';
  let next = updateDevice(state, (device) => ({ ...device, recentLinks: [url, ...device.recentLinks.filter((l) => l !== url)].slice(0, 5) }));
  next = appLog(next, `Opened deep link ${url}`, 'DeepLinks');
  next = appLog(next, `Navigated to ${route}`, 'Router', 'debug');
  if (/^\/projects\/\d+/.test(route)) {
    const call = completedCall('project', nextId('call'), state.now, createRng(eventCounter));
    next = {
      ...next,
      connections: next.connections.map((c) =>
        c.id === state.activeConnectionId ? { ...c, session: { ...c.session, calls: [call, ...c.session.calls] } } : c,
      ),
    };
  }
  return { ...next, toast: { id: (state.toast?.id ?? 0) + 1, message: `Opened ${url}` } };
}

export function sendPush(state: DemoState, title: string, deliver: 'foreground' | 'background' | 'tap'): DemoState {
  const how = { foreground: 'in the foreground', background: 'in the background', tap: 'and opened by a tap' }[deliver];
  const next = appLog(state, `Push received ${how}: "${title}"`, 'Notifications');
  return { ...next, toast: { id: (state.toast?.id ?? 0) + 1, message: 'Push sent to the device' } };
}

export function setFlag(state: DemoState, key: string, value: FeatureFlag['value']): DemoState {
  const next = updateDevice(state, (device) => ({ ...device, flags: device.flags.map((f) => (f.key === key ? { ...f, value } : f)) }));
  return appLog(next, `Feature flag ${key} set to ${String(value)}`, 'FeatureFlags');
}

export function resetFlag(state: DemoState, key: string): DemoState {
  const flag = activeConnection(state)?.device.flags.find((f) => f.key === key);
  return flag ? setFlag(state, key, flag.remote) : state;
}

export function resetAllOverrides(state: DemoState): DemoState {
  const next = updateDevice(state, (device) => ({ ...device, settings: device.defaults, flags: device.flags.map((f) => ({ ...f, value: f.remote })) }));
  return appLog(next, 'All Device Actions overrides reset', 'DeviceActions');
}

export const selectDrawerTab = (state: DemoState, tab: DeviceTab): DemoState => ({ ...state, drawer: { tab } });
