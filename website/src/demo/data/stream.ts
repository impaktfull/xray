import type { KvChange, LogEntry, NetworkCall, Session } from '../model/types';
import type { EndpointName } from './endpoints';
import { completedCall, kvChange, logEntry, pendingCall, type IdFactory } from './events';
import type { LogName } from './logs';
import { pick, type Rng } from './seed';

export interface StreamEvent {
  /** Calls start pending; `complete` is what each one becomes once its duration has passed. */
  calls: { pending: NetworkCall; complete: NetworkCall }[];
  logs: LogEntry[];
  kvChanges: KvChange[];
}

type Beat = { calls?: EndpointName[]; logs?: LogName[]; hoursGoal?: boolean };

// What a running app does on its own: polling, refreshing, background sync. Repeated entries are
// weights, so polling happens far more often than a key-value change.
const beats: Beat[] = [
  { calls: ['notifications'], logs: ['notificationsPolled'] },
  { calls: ['notifications'], logs: ['notificationsPolled'] },
  { calls: ['analytics'] },
  { calls: ['analytics'] },
  { calls: ['projects'], logs: ['projectsLoaded'] },
  { calls: ['projectOverview'], logs: ['analyticsEvent'] },
  { calls: ['team'], logs: ['cacheHit'] },
  { logs: ['syncStarted', 'syncDone'], calls: ['projects'] },
  { logs: ['frameJank'] },
  { calls: ['project'], logs: ['navigateProject'] },
  { hoursGoal: true },
];

/** The next thing the impaktfull dashboard does while the demo is watched. */
export function nextEvent(rng: Rng, id: IdFactory, at: number, session: Session): StreamEvent {
  const beat = pick(rng, beats);
  const calls = (beat.calls ?? []).map((name, i) => {
    const complete = completedCall(name, id('call'), at + i * 120, rng);
    return { pending: pendingCall(complete), complete };
  });
  const logs = (beat.logs ?? []).map((name, i) => logEntry(name, id('log'), at + 80 + i * 400));
  const kvChanges: KvChange[] = [];
  if (beat.hoursGoal) {
    const entry = session.stores[0].entries.find((e) => e.key === 'hours_goal');
    const before = typeof entry?.value === 'number' ? entry.value : 32.5;
    kvChanges.push(kvChange(id('kv'), at, 'shared_preferences', 'hours_goal', before, before === 32.5 ? 36 : 32.5));
  }
  return { calls, logs, kvChanges };
}
