import { createIds } from '../data/events';
import { createRng, between } from '../data/seed';
import { nextEvent } from '../data/stream';
import { activeConnection } from './access';
import { appendEvent, completeCall } from './liveActions';
import { tick } from './shellActions';
import type { DemoStore } from './store';

export interface LiveOptions {
  /** Whether new events may arrive right now (demo on screen, tab visible). */
  canStream: () => boolean;
  intervalMs?: [number, number];
  seed?: number;
}

/**
 * Keeps the demo alive: advances its clock and, every few seconds, lets the active app make a
 * new call, log something or change a value. Pauses while a modal or the tour is open.
 */
export function startLive(store: DemoStore, { canStream, intervalMs = [1_800, 4_500], seed = 2026 }: LiveOptions): () => void {
  const rng = createRng(seed);
  const ids = createIds('live');
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let stopped = false;
  let lastWall = Date.now();

  const later = (ms: number, run: () => void) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!stopped) run();
    }, ms);
    timers.add(timer);
  };

  const clock = setInterval(() => {
    const wall = Date.now();
    store.dispatch(tick, store.state.value.now + (wall - lastWall));
    lastWall = wall;
  }, 1_000);

  const schedule = () => later(between(rng, intervalMs[0], intervalMs[1]), step);

  function step() {
    const state = store.state.value;
    const connection = activeConnection(state);
    if (connection && canStream() && !state.modal && !state.tour) {
      const event = nextEvent(rng, ids, state.now, connection.session);
      store.dispatch(appendEvent, connection.id, event);
      for (const { complete } of event.calls) {
        later(complete.durationMs ?? 300, () => store.dispatch(completeCall, connection.id, { ...complete, at: complete.at }));
      }
    }
    schedule();
  }

  schedule();
  return () => {
    stopped = true;
    clearInterval(clock);
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  };
}
