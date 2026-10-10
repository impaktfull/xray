import type { KvChange, KvStoreId, KvValue, LogEntry, NetworkCall } from '../model/types';
import { endpoints, type EndpointName } from './endpoints';
import { logs, type LogName } from './logs';
import { between, type Rng } from './seed';

/** Hands out ids that stay unique within one demo session. */
export function createIds(prefix: string) {
  let next = 0;
  return (kind: 'call' | 'log' | 'kv') => `${prefix}-${kind}-${next++}`;
}

export type IdFactory = ReturnType<typeof createIds>;

/** A call as it finished, with its duration varied a little so repeated calls don't look copied. */
export function completedCall(name: EndpointName, id: string, at: number, rng: Rng): NetworkCall {
  const template = endpoints[name];
  const jitter = 0.85 + rng() * 0.3;
  return {
    ...template,
    id,
    at,
    durationMs: template.durationMs === undefined ? undefined : Math.round(template.durationMs * jitter),
  };
}

/** The same call while it is still in flight. */
export function pendingCall(complete: NetworkCall): NetworkCall {
  return {
    ...complete,
    state: 'pending',
    status: undefined,
    durationMs: undefined,
    responseHeaders: {},
    responseBody: { kind: 'none', bytes: 0 },
    error: undefined,
  };
}

export const logEntry = (name: LogName, id: string, at: number): LogEntry => ({ ...logs[name], id, at });

export const kvChange = (
  id: string,
  at: number,
  store: KvStoreId,
  key: string,
  before: KvValue | undefined,
  after: KvValue | undefined,
): KvChange => ({ id, at, store, key, before, after });

export const jittered = (rng: Rng, at: number) => at + between(rng, -250, 250);
