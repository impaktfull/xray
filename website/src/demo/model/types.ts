export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type CallState = 'pending' | 'complete' | 'failed';

export interface Body {
  kind: 'json' | 'text' | 'html' | 'image' | 'none';
  text?: string;
  bytes: number;
}

export interface GraphqlError {
  message: string;
  line?: number;
  path?: string[];
}

export interface GraphqlInfo {
  type: 'query' | 'mutation' | 'subscription';
  operationName: string;
  document: string;
  variables?: unknown;
  data?: unknown;
  errors?: GraphqlError[];
  extensions?: unknown;
}

export interface NetworkCall {
  id: string;
  /** Epoch milliseconds the request started. */
  at: number;
  method: HttpMethod;
  url: string;
  state: CallState;
  status?: number;
  durationMs?: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody: Body;
  responseBody: Body;
  graphql?: GraphqlInfo;
  error?: string;
}

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'success' | 'debug';

export interface LogEntry {
  id: string;
  at: number;
  level: LogLevel;
  message: string;
  logger?: string;
  error?: string;
  stackTrace?: string;
}

export type KvType = 'String' | 'int' | 'double' | 'bool' | 'List<String>';
export type KvValue = string | number | boolean | string[];

export interface KvEntry {
  key: string;
  type: KvType;
  value: KvValue;
}

export type KvStoreId = 'shared_preferences' | 'secure_storage';

export interface KvStore {
  id: KvStoreId;
  label: string;
  entries: KvEntry[];
}

export interface KvChange {
  id: string;
  at: number;
  store: KvStoreId;
  key: string;
  before?: KvValue;
  after?: KvValue;
}

export interface FileNode {
  name: string;
  kind: 'folder' | 'file';
  bytes?: number;
  modifiedAt: number;
  preview?: Body;
  children?: FileNode[];
}

export interface Session {
  /** Newest first, like the desktop app. */
  calls: NetworkCall[];
  /** Newest first. */
  logs: LogEntry[];
  stores: KvStore[];
  /** Newest first. */
  kvChanges: KvChange[];
  files: FileNode;
}

export type Platform = 'android' | 'ios' | 'macos';
export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export type Appearance = 'system' | 'light' | 'dark';
export type AnimationSpeed = 'off' | '0.2' | '1' | '5';

export interface FeatureFlag {
  key: string;
  type: 'bool' | 'int' | 'String';
  source: 'remote' | 'local';
  remote: boolean | number | string;
  value: boolean | number | string;
}

/** What Device Actions can change on the running app; `defaults` is how the app started. */
export interface DeviceSettings {
  appearance: Appearance;
  locale: string;
  textScale: number;
  animations: AnimationSpeed;
  boldText: boolean;
  highContrast: boolean;
  layoutBounds: boolean;
  performanceOverlay: boolean;
}

export interface DeviceState {
  os: string;
  appVersion: string;
  buildMode: 'debug' | 'profile';
  settings: DeviceSettings;
  defaults: DeviceSettings;
  flags: FeatureFlag[];
  routes: string[];
  recentLinks: string[];
}

export interface Connection {
  id: string;
  appName: string;
  deviceName: string;
  platform: Platform;
  status: ConnectionStatus;
  session: Session;
  device: DeviceState;
}
