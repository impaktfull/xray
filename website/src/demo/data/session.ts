import type { KvChange, LogEntry, NetworkCall, Session } from '../model/types';
import type { EndpointName } from './endpoints';
import { completedCall, createIds, jittered, kvChange, logEntry, pendingCall } from './events';
import { createFiles } from './files';
import type { LogName } from './logs';
import { createRng } from './seed';
import { createStores } from './stores';

type Step =
  | { at: number; call: EndpointName; pending?: boolean }
  | { at: number; log: LogName }
  | { at: number; kv: Omit<KvChange, 'id' | 'at'> };

// Seconds before "now". Reads top to bottom as what happened in the app.
const story: Step[] = [
  { at: -88, log: 'appStarted' },
  { at: -87.5, log: 'restoredSession' },
  { at: -86, call: 'login' },
  { at: -85.5, log: 'signedIn' },
  { at: -85, call: 'me' },
  { at: -84.4, log: 'navigateProjects' },
  { at: -84, call: 'projects' },
  { at: -83.7, log: 'projectsLoaded' },
  { at: -83, call: 'avatar' },
  { at: -82.8, log: 'imageDecoded' },
  { at: -80, call: 'team' },
  { at: -79.8, log: 'cacheHit' },
  { at: -76, call: 'notifications' },
  { at: -75.8, log: 'notificationsPolled' },
  { at: -70.4, log: 'navigateProject' },
  { at: -70, call: 'project' },
  { at: -69.6, call: 'projectOverview' },
  { at: -69.2, log: 'analyticsEvent' },
  { at: -66, call: 'tasks' },
  { at: -63, log: 'tasksFailed' },
  { at: -60, call: 'analytics' },
  { at: -55, kv: { store: 'shared_preferences', key: 'theme_mode', before: 'system', after: 'dark' } },
  { at: -54.9, log: 'themeChanged' },
  { at: -54.5, call: 'updateSettings' },
  { at: -48, call: 'updateProject' },
  { at: -47.6, kv: { store: 'shared_preferences', key: 'last_project_id', before: 37, after: 42 } },
  { at: -40, call: 'exportInvoice' },
  { at: -38.1, log: 'slowExport' },
  { at: -35, log: 'frameJank' },
  { at: -30, call: 'archiveProject' },
  { at: -29.8, log: 'archiveFailed' },
  { at: -24, log: 'syncStarted' },
  { at: -23.8, call: 'projects' },
  { at: -23.4, log: 'syncDone' },
  { at: -18, call: 'notifications' },
  { at: -17.8, log: 'notificationsPolled' },
  { at: -12, call: 'deleteSession' },
  { at: -10.7, log: 'signOutFailed' },
  { at: -6, call: 'analytics' },
  { at: -0.4, call: 'projects', pending: true },
];

const newestFirst = <T extends { at: number }>(items: T[]) => [...items].sort((a, b) => b.at - a.at);

/** The session as it looks when the demo opens: ~90 seconds of the impaktfull dashboard in use. */
export function createInitialSession(seed: number, now: number, idPrefix = 'demo'): Session {
  const rng = createRng(seed);
  const id = createIds(idPrefix);
  const calls: NetworkCall[] = [];
  const logEntries: LogEntry[] = [];
  const kvChanges: KvChange[] = [];
  const stores = createStores();

  for (const step of story) {
    const at = jittered(rng, now + step.at * 1_000);
    if ('call' in step) {
      const call = completedCall(step.call, id('call'), at, rng);
      calls.push(step.pending ? pendingCall(call) : call);
    } else if ('log' in step) {
      logEntries.push(logEntry(step.log, id('log'), at));
    } else {
      kvChanges.push(kvChange(id('kv'), at, step.kv.store, step.kv.key, step.kv.before, step.kv.after));
      const entry = stores.find((s) => s.id === step.kv.store)?.entries.find((e) => e.key === step.kv.key);
      if (entry && step.kv.after !== undefined) entry.value = step.kv.after;
    }
  }

  return {
    calls: newestFirst(calls),
    logs: newestFirst(logEntries),
    stores,
    kvChanges: newestFirst(kvChanges),
    files: createFiles(now),
  };
}
