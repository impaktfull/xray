import type { KvEntry, KvStoreId, KvValue, Session } from '../model/types';
import type { DemoState } from './demoState';
import { updateSession, updateTab } from './access';

let changeCounter = 0;

function recordChange(session: Session, storeId: KvStoreId, key: string, at: number, before?: KvValue, after?: KvValue): Session {
  const change = { id: `edit-kv-${changeCounter++}`, at, store: storeId, key, before, after };
  return { ...session, kvChanges: [change, ...session.kvChanges] };
}

function updateEntries(session: Session, storeId: KvStoreId, update: (entries: KvEntry[]) => KvEntry[]): Session {
  return { ...session, stores: session.stores.map((s) => (s.id === storeId ? { ...s, entries: update(s.entries) } : s)) };
}

export const selectStore = (state: DemoState, storeId: KvStoreId): DemoState =>
  updateTab(state, (tab) => ({ ...tab, keyValue: { ...tab.keyValue, storeId } }));

export const setKeyValueSearch = (state: DemoState, search: string): DemoState =>
  updateTab(state, (tab) => ({ ...tab, keyValue: { ...tab.keyValue, search } }));

/** Saves a value, records the change for the timeline and closes the modal, like the app does. */
export function saveValue(state: DemoState, storeId: KvStoreId, key: string, value: KvValue): DemoState {
  const next = updateSession(state, (session) => {
    const before = session.stores.find((s) => s.id === storeId)?.entries.find((e) => e.key === key)?.value;
    const updated = updateEntries(session, storeId, (entries) => entries.map((e) => (e.key === key ? { ...e, value } : e)));
    return recordChange(updated, storeId, key, state.now, before, value);
  });
  return { ...next, modal: undefined };
}

/** Adds a key, or overwrites it when it already exists. */
export function addKey(state: DemoState, storeId: KvStoreId, entry: KvEntry, keepOpen = false): DemoState {
  const next = updateSession(state, (session) => {
    const existing = session.stores.find((s) => s.id === storeId)?.entries.find((e) => e.key === entry.key);
    const updated = updateEntries(session, storeId, (entries) =>
      existing ? entries.map((e) => (e.key === entry.key ? entry : e)) : [...entries, entry],
    );
    return recordChange(updated, storeId, entry.key, state.now, existing?.value, entry.value);
  });
  return { ...next, modal: keepOpen ? { kind: 'addKey', storeId } : undefined };
}

export function deleteKey(state: DemoState, storeId: KvStoreId, key: string): DemoState {
  const next = updateSession(state, (session) => {
    const before = session.stores.find((s) => s.id === storeId)?.entries.find((e) => e.key === key)?.value;
    const updated = updateEntries(session, storeId, (entries) => entries.filter((e) => e.key !== key));
    return recordChange(updated, storeId, key, state.now, before, undefined);
  });
  return { ...next, modal: undefined };
}
