import { describe, expect, it } from 'vitest';
import { activeConnection, activeTab } from './access';
import { initialState, type DemoState } from './demoState';
import { addKey, deleteKey, saveValue } from './keyValueActions';
import { clearLogs, setLogLevels, setLogSearch, toggleLog } from './logActions';
import { applyNetworkFilter, clearCalls, closeCall, selectCall, setNetworkSearch, showInOperation } from './networkActions';
import { networkPresets } from './networkFilter';
import { visibleCalls, visibleLogs, eventsAround, timelineEvents, currentFolder } from './selectors';
import { addConnection, closeConnection, openModal, selectConnection, selectInspector } from './shellActions';
import { selectTimelineEvent, toggleLane, toggleLive } from './timelineActions';
import { goUp, openFolder } from './fileActions';
import { appendEvent, completeCall } from './liveActions';
import { createRng } from '../data/seed';
import { createIds } from '../data/events';
import { nextEvent } from '../data/stream';

const tab = (s: DemoState) => activeTab(s)!;
const session = (s: DemoState) => activeConnection(s)!.session;

describe('shell', () => {
  it('opens on the network inspector of the first of two connections', () => {
    const s = initialState();
    expect(s.connections.map((c) => c.deviceName)).toEqual(['Pixel 8', 'iPhone 15']);
    expect(tab(s).inspector).toBe('network');
  });

  it('keeps inspector state per connection', () => {
    let s = selectInspector(initialState(), 'logs');
    s = selectConnection(s, 'iphone');
    expect(tab(s).inspector).toBe('network');
    s = selectConnection(s, 'pixel');
    expect(tab(s).inspector).toBe('logs');
  });

  it('adding a discovered app opens it in a new tab and closes the modal', () => {
    const s = addConnection(openModal(initialState(), { kind: 'addConnection' }), 'macbook');
    expect(s.connections).toHaveLength(3);
    expect(s.activeConnectionId).toBe('macbook');
    expect(s.modal).toBeUndefined();
  });

  it('closing the active connection selects its neighbour', () => {
    const s = closeConnection(initialState(), 'pixel');
    expect(s.activeConnectionId).toBe('iphone');
    expect(s.tabs.pixel).toBeUndefined();
  });
});

describe('network', () => {
  it('the Errors only preset keeps 4xx, 5xx and failed calls', () => {
    const s = applyNetworkFilter(initialState(), networkPresets.errorsOnly.filter);
    const calls = visibleCalls(s);
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((c) => c.state === 'failed' || (c.status ?? 0) >= 400)).toBe(true);
  });

  it('search matches URL, method, status and GraphQL operation', () => {
    expect(visibleCalls(setNetworkSearch(initialState(), 'ArchiveProject'))).toHaveLength(1);
    expect(visibleCalls(setNetworkSearch(initialState(), '500')).every((c) => c.status === 500)).toBe(true);
  });

  it('selecting and closing a call', () => {
    const s0 = initialState();
    const id = session(s0).calls[3].id;
    const s1 = selectCall(s0, id);
    expect(tab(s1).network.selectedId).toBe(id);
    expect(tab(closeCall(s1)).network.selectedId).toBeUndefined();
  });

  it('"Show in operation" switches to the request body and marks the line', () => {
    const s = showInOperation(initialState(), 4);
    expect(tab(s).network.requestTab).toBe('body');
    expect(tab(s).network.highlightedLine).toBe(4);
  });

  it('clear all empties the list and the selection', () => {
    const s0 = initialState();
    const s = clearCalls(selectCall(s0, session(s0).calls[0].id));
    expect(session(s).calls).toEqual([]);
    expect(tab(s).network.selectedId).toBeUndefined();
  });
});

describe('logs', () => {
  it('filters by level and search, and expands rows', () => {
    let s = setLogLevels(initialState(), ['error']);
    expect(visibleLogs(s).every((l) => l.level === 'error')).toBe(true);
    s = setLogSearch(setLogLevels(s, []), 'session');
    expect(visibleLogs(s).every((l) => /session/i.test(l.message + l.logger))).toBe(true);
    const id = visibleLogs(s)[0].id;
    expect(tab(toggleLog(s, id)).logs.expandedIds).toEqual([id]);
    expect(tab(toggleLog(toggleLog(s, id), id)).logs.expandedIds).toEqual([]);
    expect(session(clearLogs(s)).logs).toEqual([]);
  });
});

describe('key-value', () => {
  it('saving a value updates the store and records a change for the timeline', () => {
    const s0 = { ...initialState(), modal: { kind: 'editValue' as const, storeId: 'shared_preferences' as const, key: 'theme_mode' } };
    const s = saveValue(s0, 'shared_preferences', 'theme_mode', 'light');
    expect(session(s).stores[0].entries.find((e) => e.key === 'theme_mode')?.value).toBe('light');
    expect(session(s).kvChanges[0]).toMatchObject({ key: 'theme_mode', before: 'dark', after: 'light', at: s0.now });
    expect(s.modal).toBeUndefined();
  });

  it('adding an existing key overwrites it; "add another" keeps the modal open', () => {
    const s = addKey(initialState(), 'shared_preferences', { key: 'locale', type: 'String', value: 'nl_BE' }, true);
    const locales = session(s).stores[0].entries.filter((e) => e.key === 'locale');
    expect(locales).toEqual([{ key: 'locale', type: 'String', value: 'nl_BE' }]);
    expect(s.modal).toEqual({ kind: 'addKey', storeId: 'shared_preferences' });
  });

  it('deleting a key removes it and records the change', () => {
    const s = deleteKey(initialState(), 'secure_storage', 'refresh_token');
    expect(session(s).stores[1].entries.some((e) => e.key === 'refresh_token')).toBe(false);
    expect(session(s).kvChanges[0]).toMatchObject({ key: 'refresh_token', after: undefined });
  });
});

describe('timeline', () => {
  it('selecting an event pauses Live; going live again drops the selection', () => {
    const s0 = initialState();
    const s1 = selectTimelineEvent(s0, timelineEvents(s0)[2].id);
    expect(tab(s1).timeline.live).toBe(false);
    const s2 = toggleLive(s1);
    expect(tab(s2).timeline).toMatchObject({ live: true, selectedId: undefined });
  });

  it('hides lanes that are switched off', () => {
    const s = toggleLane(initialState(), 'logs');
    expect(timelineEvents(s).some((e) => e.lane === 'logs')).toBe(false);
  });

  it('finds what happened within ±2 s of an event', () => {
    const s = initialState();
    const failedDelete = session(s).calls.find((c) => c.status === 500)!;
    const around = eventsAround(s, failedDelete.id);
    expect(around.some((e) => e.lane === 'logs' && e.log.level === 'error')).toBe(true);
  });
});

describe('files', () => {
  it('navigates into folders and back up', () => {
    const s = openFolder(openFolder(initialState(), 'Documents'), 'exports');
    expect(currentFolder(s)?.name).toBe('exports');
    expect(currentFolder(goUp(s))?.name).toBe('Documents');
  });
});

describe('live', () => {
  it('appends new events newest first and completes pending calls in place', () => {
    const s0 = initialState();
    const rng = createRng(1);
    const ids = createIds('t');
    let event = nextEvent(rng, ids, s0.now + 5_000, session(s0));
    while (!event.calls.length) event = nextEvent(rng, ids, s0.now + 5_000, session(s0));
    const s1 = appendEvent(s0, 'pixel', event);
    const [firstNew] = event.calls;
    expect(session(s1).calls[0].state).toBe('pending');
    const s2 = completeCall(s1, 'pixel', firstNew.complete);
    expect(session(s2).calls.find((c) => c.id === firstNew.pending.id)?.state).not.toBe('pending');
    expect(session(s1).logs.length).toBe(session(s0).logs.length + event.logs.length);
  });
});
