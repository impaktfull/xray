import type { LogLevel } from '../model/types';
import type { DemoState } from './demoState';
import { updateSession, updateTab } from './access';

const updateLogs = (state: DemoState, update: (logs: DemoState['tabs'][string]['logs']) => Partial<DemoState['tabs'][string]['logs']>) =>
  updateTab(state, (tab) => ({ ...tab, logs: { ...tab.logs, ...update(tab.logs) } }));

export const toggleLog = (state: DemoState, logId: string): DemoState =>
  updateLogs(state, ({ expandedIds }) => ({
    expandedIds: expandedIds.includes(logId) ? expandedIds.filter((id) => id !== logId) : [...expandedIds, logId],
  }));

export const setLogSearch = (state: DemoState, search: string): DemoState => updateLogs(state, () => ({ search }));

export const setLogLevels = (state: DemoState, levels: LogLevel[]): DemoState => updateLogs(state, () => ({ levels }));

export const clearLogs = (state: DemoState): DemoState =>
  updateLogs(updateSession(state, (session) => ({ ...session, logs: [] })), () => ({ expandedIds: [] }));
