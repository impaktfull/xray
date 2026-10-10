import { createInitialSession } from '../data/session';
import type { Connection, KvStoreId, LogLevel, Platform } from '../model/types';
import { emptyNetworkFilter, type NetworkFilter } from './networkFilter';

export type InspectorTab = 'timeline' | 'network' | 'logs' | 'keyValue' | 'files';
export type Lane = 'network' | 'logs' | 'keyValue';
export type PanelTab = 'headers' | 'body';
export type BodyView = 'json' | 'raw' | 'preview';

export interface TabState {
  inspector: InspectorTab;
  network: {
    search: string;
    filter: NetworkFilter;
    selectedId?: string;
    requestTab: PanelTab;
    responseTab: PanelTab;
    bodyView: BodyView;
    /** Line highlighted in a GraphQL operation after "Show in operation →". */
    highlightedLine?: number;
  };
  logs: { search: string; levels: LogLevel[]; expandedIds: string[] };
  keyValue: { storeId: KvStoreId; search: string };
  timeline: { lanes: Lane[]; rangeMs: number; live: boolean; selectedId?: string; search: string };
  files: { path: string[] };
}

export type Modal =
  | { kind: 'networkFilter' }
  | { kind: 'logsFilter' }
  | { kind: 'editValue'; storeId: KvStoreId; key: string }
  | { kind: 'addKey'; storeId: KvStoreId }
  | { kind: 'confirmDelete'; storeId: KvStoreId; key: string }
  | { kind: 'addConnection' }
  | { kind: 'export' }
  | { kind: 'filePreview'; path: string[] };

export interface DiscoveredApp {
  connectionId: string;
  appName: string;
  deviceName: string;
  platform: Platform;
  seed: number;
}

export interface DemoState {
  /** The demo's own clock (epoch ms, UTC). */
  now: number;
  connections: Connection[];
  activeConnectionId?: string;
  tabs: Record<string, TabState>;
  modal?: Modal;
  toast?: { id: number; message: string };
  tour?: { step: number };
}

/** 14:03:07 UTC: the moment the demo session "opens". */
export const demoStart = Date.UTC(2026, 9, 10, 14, 3, 7);

export const appName = 'impaktfull dashboard';

/** Apps the Add Connection modal finds on the "network". */
export const discoverableApps: DiscoveredApp[] = [
  { connectionId: 'pixel', appName, deviceName: 'Pixel 8', platform: 'android', seed: 42 },
  { connectionId: 'iphone', appName, deviceName: 'iPhone 15', platform: 'ios', seed: 7 },
  { connectionId: 'macbook', appName, deviceName: 'MacBook Pro', platform: 'macos', seed: 19 },
];

export const initialTabState = (): TabState => ({
  inspector: 'network',
  network: {
    search: '',
    filter: emptyNetworkFilter,
    requestTab: 'body',
    responseTab: 'body',
    bodyView: 'json',
  },
  logs: { search: '', levels: [], expandedIds: [] },
  keyValue: { storeId: 'shared_preferences', search: '' },
  timeline: { lanes: ['network', 'logs', 'keyValue'], rangeMs: 30_000, live: true, search: '' },
  files: { path: [] },
});

export function connectionFor(app: DiscoveredApp, now: number): Connection {
  return {
    id: app.connectionId,
    appName: app.appName,
    deviceName: app.deviceName,
    platform: app.platform,
    status: 'connected',
    session: createInitialSession(app.seed, now, app.connectionId),
  };
}

export function initialState(now = demoStart): DemoState {
  const connections = discoverableApps.slice(0, 2).map((app) => connectionFor(app, now));
  return {
    now,
    connections,
    activeConnectionId: connections[0].id,
    tabs: Object.fromEntries(connections.map((c) => [c.id, initialTabState()])),
  };
}
