import { pathLabel } from '../model/format';
import { activeConnection } from '../state/access';
import type { DemoState, InspectorTab } from '../state/demoState';
import { openDrawer, toggleAnimations, toggleDarkMode } from '../state/deviceActions';
import { clearLogs, setLogSearch, toggleLog } from '../state/logActions';
import { selectStore } from '../state/keyValueActions';
import { clearCalls, selectCall, setNetworkSearch } from '../state/networkActions';
import { closeConnection, closeModal, openModal, selectConnection, selectInspector, showToast } from '../state/shellActions';
import type { IconName } from '../ui/Icon';

export interface CommandItem {
  id: string;
  section: string;
  label: string;
  icon: IconName;
  /** Icon colour: an accent for actions, red for destructive ones, muted for navigation. */
  tone?: 'accent' | 'error' | 'muted';
  meta?: string;
  shortcut?: string[];
  /** Set when the item exists in the app but not in the demo. */
  unavailable?: boolean;
  run: (state: DemoState) => DemoState;
}

export interface CommandSection {
  title: string;
  count?: number;
  items: CommandItem[];
}

const maxPerGroup = 5;

const goTo: { id: InspectorTab; label: string; icon: IconName; key: string }[] = [
  { id: 'timeline', label: 'Timeline', icon: 'chart-bar-horizontal', key: '0' },
  { id: 'network', label: 'Network', icon: 'wifi-high', key: '1' },
  { id: 'logs', label: 'Logs', icon: 'file-text', key: '2' },
  { id: 'keyValue', label: 'Key-Value', icon: 'database', key: '3' },
  { id: 'files', label: 'Files', icon: 'folder', key: '4' },
];

/** Every command, in the sections the empty menu shows them in. */
function commands(state: DemoState): CommandItem[] {
  const connection = activeConnection(state);
  const others = state.connections.filter((c) => c.id !== state.activeConnectionId);
  return [
    { id: 'export', section: 'Suggested', label: 'Export session…', icon: 'export', tone: 'accent', shortcut: ['⌘', '⇧', 'E'], run: (s) => openModal(s, { kind: 'export' }) },
    { id: 'deep-link', section: 'Suggested', label: 'Open deep link on device…', icon: 'link', tone: 'accent', shortcut: ['⌘', '⇧', 'L'], run: (s) => openDrawer(s, 'deepLinks') },
    { id: 'device-actions', section: 'Suggested', label: 'Open device actions', icon: 'device-mobile', tone: 'accent', shortcut: ['⌘', '⇧', 'D'], run: (s) => openDrawer(s, 'quick') },
    { id: 'clear-calls', section: 'Suggested', label: 'Clear network calls', icon: 'trash', tone: 'error', shortcut: ['⌘', '⌫'], run: (s) => clearCalls(selectInspector(s, 'network')) },
    { id: 'clear-logs', section: 'Suggested', label: 'Clear log entries', icon: 'trash', tone: 'error', run: (s) => clearLogs(selectInspector(s, 'logs')) },
    { id: 'filter', section: 'Suggested', label: 'Filter network calls…', icon: 'sliders-horizontal', tone: 'accent', shortcut: ['⌘', 'L'], run: (s) => openModal(selectInspector(s, 'network'), { kind: 'networkFilter' }) },
    {
      id: 'dark-mode',
      section: 'Suggested',
      label: 'Toggle dark mode on device',
      icon: 'moon',
      tone: 'accent',
      meta: connection?.device.settings.appearance === 'dark' ? 'dark' : 'light',
      run: toggleDarkMode,
    },
    { id: 'animations', section: 'Suggested', label: 'Toggle animations on device', icon: 'sparkle', tone: 'accent', run: toggleAnimations },
    ...goTo.map((t) => ({
      id: `go-${t.id}`,
      section: 'Go to',
      label: t.label,
      icon: t.icon,
      tone: 'muted' as const,
      shortcut: ['⌘', t.key],
      run: (s: DemoState) => selectInspector(s, t.id),
    })),
    ...others.map((c, i) => ({
      id: `connection-${c.id}`,
      section: 'Connections',
      label: c.appName,
      meta: c.deviceName,
      icon: 'device-mobile' as const,
      tone: 'muted' as const,
      shortcut: ['⌘', '⇧', String(i + 1)],
      run: (s: DemoState) => selectConnection(s, c.id),
    })),
    { id: 'add-connection', section: 'Connections', label: 'Add connection…', icon: 'plus', tone: 'muted', shortcut: ['⌘', 'T'], run: (s) => openModal(s, { kind: 'addConnection' }) },
    { id: 'reconnect', section: 'Connections', label: 'Reconnect', icon: 'arrow-clockwise', tone: 'muted', shortcut: ['⌘', 'R'], run: (s) => showToast(s, `Reconnected to ${connection?.deviceName}`) },
    {
      id: 'close-connection',
      section: 'Connections',
      label: 'Close connection',
      icon: 'x',
      tone: 'muted',
      shortcut: ['⌘', 'W'],
      run: (s) => (s.activeConnectionId ? closeConnection(s, s.activeConnectionId) : s),
    },
    { id: 'settings', section: 'General', label: 'Settings…', icon: 'gear', tone: 'muted', shortcut: ['⌘', ','], unavailable: true, run: (s) => s },
  ];
}

const matches = (text: string, query: string) => text.toLowerCase().includes(query.toLowerCase());

function searchResults(state: DemoState, query: string): CommandSection[] {
  const session = activeConnection(state)?.session;
  if (!session) return [];
  const calls = session.calls.filter((c) => [c.url, c.method, String(c.status ?? ''), c.graphql?.operationName ?? ''].some((f) => matches(f, query)));
  const logs = session.logs.filter((l) => matches(l.message, query) || matches(l.logger ?? '', query));
  const keys = session.stores.flatMap((store) => store.entries.filter((e) => matches(e.key, query)).map((entry) => ({ store, entry })));

  const sections: CommandSection[] = [
    {
      title: 'Network',
      count: calls.length,
      items: calls.slice(0, maxPerGroup).map((call) => ({
        id: `call-${call.id}`,
        section: 'Network',
        label: call.graphql ? call.graphql.operationName : pathLabel(call.url),
        meta: `${call.method} · ${call.state === 'failed' ? 'failed' : (call.status ?? 'pending')}`,
        icon: 'wifi-high' as const,
        tone: 'muted' as const,
        run: (s: DemoState) => selectCall(selectInspector(s, 'network'), call.id),
      })),
    },
    {
      title: 'Logs',
      count: logs.length,
      items: logs.slice(0, maxPerGroup).map((log) => ({
        id: `log-${log.id}`,
        section: 'Logs',
        label: log.message,
        meta: log.level.toUpperCase(),
        icon: 'file-text' as const,
        tone: 'muted' as const,
        run: (s: DemoState) => toggleLog(setLogSearch(selectInspector(s, 'logs'), ''), log.id),
      })),
    },
    {
      title: 'Key-Value',
      count: keys.length,
      items: keys.slice(0, maxPerGroup).map(({ store, entry }) => ({
        id: `key-${store.id}-${entry.key}`,
        section: 'Key-Value',
        label: entry.key,
        meta: store.label,
        icon: 'database' as const,
        tone: 'muted' as const,
        run: (s: DemoState) => openModal(selectStore(selectInspector(s, 'keyValue'), store.id), { kind: 'editValue', storeId: store.id, key: entry.key }),
      })),
    },
  ];
  const matchingCommands = commands(state).filter((c) => matches(c.label, query));
  const filterBy: CommandItem = {
    id: 'filter-by-query',
    section: 'Commands',
    label: `Filter network calls by "${query}"`,
    icon: 'sliders-horizontal',
    tone: 'accent',
    run: (s) => setNetworkSearch(selectInspector(s, 'network'), query),
  };
  return [...sections.filter((s) => s.items.length), { title: 'Commands', items: [...matchingCommands, filterBy] }];
}

/** What the menu shows for a query: commands when empty or after ">", search results otherwise. */
export function commandSections(state: DemoState, rawQuery: string): CommandSection[] {
  const commandsOnly = rawQuery.trimStart().startsWith('>');
  const query = rawQuery.trim().replace(/^>\s*/, '');
  if (!commandsOnly && query) return searchResults(state, query);
  const items = commands(state).filter((c) => !query || matches(c.label, query));
  const titles = [...new Set(items.map((i) => i.section))];
  return titles.map((title) => ({ title, items: items.filter((i) => i.section === title) }));
}

/** Runs an item and closes the menu first, so the item can open its own modal or drawer. */
export const runCommand = (state: DemoState, item: CommandItem): DemoState => (item.unavailable ? state : item.run(closeModal(state)));
