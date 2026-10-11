import { pathLabel } from '../model/format';
import type { FileNode, KvChange, LogEntry, LogLevel, NetworkCall } from '../model/types';
import { activeConnection, activeTab } from './access';
import type { DemoState, Lane } from './demoState';
import { matchesFilter, matchesSearch } from './networkFilter';

export function visibleCalls(state: DemoState): NetworkCall[] {
  const connection = activeConnection(state);
  const tab = activeTab(state);
  if (!connection || !tab) return [];
  const { search, filter } = tab.network;
  return connection.session.calls.filter((call) => matchesSearch(call, search) && matchesFilter(call, filter));
}

export function selectedCall(state: DemoState): NetworkCall | undefined {
  const id = activeTab(state)?.network.selectedId;
  return activeConnection(state)?.session.calls.find((call) => call.id === id);
}

export function logMatches(log: LogEntry, search: string): boolean {
  const query = search.trim().toLowerCase();
  return !query || log.message.toLowerCase().includes(query) || (log.logger ?? '').toLowerCase().includes(query);
}

export function visibleLogs(state: DemoState): LogEntry[] {
  const connection = activeConnection(state);
  const tab = activeTab(state);
  if (!connection || !tab) return [];
  const { search, levels } = tab.logs;
  return connection.session.logs.filter((log) => (!levels.length || levels.includes(log.level)) && logMatches(log, search));
}

export function logLevelCounts(state: DemoState): Record<LogLevel, number> {
  const counts: Record<LogLevel, number> = { fatal: 0, error: 0, warn: 0, info: 0, success: 0, debug: 0 };
  for (const log of activeConnection(state)?.session.logs ?? []) counts[log.level]++;
  return counts;
}

export function visibleEntries(state: DemoState) {
  const connection = activeConnection(state);
  const tab = activeTab(state);
  const store = connection?.session.stores.find((s) => s.id === tab?.keyValue.storeId);
  const query = tab?.keyValue.search.trim().toLowerCase() ?? '';
  return { store, entries: (store?.entries ?? []).filter((e) => !query || e.key.toLowerCase().includes(query)) };
}

export type TimelineEvent =
  | { lane: 'network'; id: string; at: number; call: NetworkCall }
  | { lane: 'logs'; id: string; at: number; log: LogEntry }
  | { lane: 'keyValue'; id: string; at: number; change: KvChange };

export function allTimelineEvents(state: DemoState): TimelineEvent[] {
  const session = activeConnection(state)?.session;
  if (!session) return [];
  const events: TimelineEvent[] = [
    ...session.calls.map((call) => ({ lane: 'network' as const, id: call.id, at: call.at, call })),
    ...session.logs.map((log) => ({ lane: 'logs' as const, id: log.id, at: log.at, log })),
    ...session.kvChanges.map((change) => ({ lane: 'keyValue' as const, id: change.id, at: change.at, change })),
  ];
  return events.sort((a, b) => b.at - a.at);
}

export function timelineSummary(event: TimelineEvent): string {
  switch (event.lane) {
    case 'network':
      return event.call.graphql
        ? `${event.call.method} ${pathLabel(event.call.url)}  ${event.call.graphql.type} ${event.call.graphql.operationName}`
        : `${event.call.method} ${pathLabel(event.call.url)}`;
    case 'logs':
      return event.log.message;
    case 'keyValue':
      return `${event.change.key} ${String(event.change.before ?? '∅')} → ${String(event.change.after ?? '∅')}`;
  }
}

export function timelineEvents(state: DemoState): TimelineEvent[] {
  const tab = activeTab(state);
  if (!tab) return [];
  const { lanes, search } = tab.timeline;
  const query = search.trim().toLowerCase();
  return allTimelineEvents(state).filter(
    (event) => lanes.includes(event.lane) && (!query || timelineSummary(event).toLowerCase().includes(query)),
  );
}

export function laneCounts(state: DemoState): Record<Lane, number> {
  const counts: Record<Lane, number> = { network: 0, logs: 0, keyValue: 0 };
  for (const event of allTimelineEvents(state)) counts[event.lane]++;
  return counts;
}

/** "Around this event · ±2 s": what else happened close to the selected event. */
export function eventsAround(state: DemoState, eventId: string, windowMs = 2_000): TimelineEvent[] {
  const events = allTimelineEvents(state);
  const event = events.find((e) => e.id === eventId);
  if (!event) return [];
  return events.filter((e) => e.id !== eventId && Math.abs(e.at - event.at) <= windowMs);
}

export function selectedTimelineEvent(state: DemoState): TimelineEvent | undefined {
  const id = activeTab(state)?.timeline.selectedId;
  return allTimelineEvents(state).find((e) => e.id === id);
}

export function currentFolder(state: DemoState): FileNode | undefined {
  const root = activeConnection(state)?.session.files;
  const path = activeTab(state)?.files.path ?? [];
  return path.reduce<FileNode | undefined>((folder, name) => folder?.children?.find((c) => c.name === name), root);
}

export function fileAt(state: DemoState, path: string[]): FileNode | undefined {
  const root = activeConnection(state)?.session.files;
  return path.reduce<FileNode | undefined>((node, name) => node?.children?.find((c) => c.name === name), root);
}
