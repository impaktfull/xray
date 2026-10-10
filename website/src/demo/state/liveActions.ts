import type { StreamEvent } from '../data/stream';
import type { NetworkCall } from '../model/types';
import type { DemoState } from './demoState';
import { updateSession } from './access';

// Newest first, capped like the desktop app's buffer so a long visit doesn't grow without bound.
const maxItems = 500;
const prepend = <T>(items: T[], list: T[]) => [...items.slice().reverse(), ...list].slice(0, maxItems);

export function appendEvent(state: DemoState, connectionId: string, event: StreamEvent): DemoState {
  return updateSession(
    state,
    (session) => {
      const lastChange = event.kvChanges.at(-1);
      const stores = lastChange
        ? session.stores.map((store) =>
            store.id !== lastChange.store
              ? store
              : { ...store, entries: store.entries.map((e) => (e.key === lastChange.key && lastChange.after !== undefined ? { ...e, value: lastChange.after } : e)) },
          )
        : session.stores;
      return {
        ...session,
        calls: prepend(event.calls.map((c) => c.pending), session.calls),
        logs: prepend(event.logs, session.logs),
        kvChanges: prepend(event.kvChanges, session.kvChanges),
        stores,
      };
    },
    connectionId,
  );
}

/** A pending call finishing: it updates in place, like in the app. */
export function completeCall(state: DemoState, connectionId: string, call: NetworkCall): DemoState {
  return updateSession(
    state,
    (session) => ({ ...session, calls: session.calls.map((c) => (c.id === call.id ? call : c)) }),
    connectionId,
  );
}
