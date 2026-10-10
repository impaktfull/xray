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

export interface Connection {
  id: string;
  appName: string;
  deviceName: string;
  platform: Platform;
  status: ConnectionStatus;
  session: Session;
}
