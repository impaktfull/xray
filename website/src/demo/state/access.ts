import type { Connection, Session } from '../model/types';
import type { DemoState, TabState } from './demoState';

export function activeConnection(state: DemoState): Connection | undefined {
  return state.connections.find((c) => c.id === state.activeConnectionId);
}

export function activeTab(state: DemoState): TabState | undefined {
  return state.activeConnectionId === undefined ? undefined : state.tabs[state.activeConnectionId];
}

export function updateTab(state: DemoState, update: (tab: TabState) => TabState): DemoState {
  const id = state.activeConnectionId;
  if (id === undefined) return state;
  return { ...state, tabs: { ...state.tabs, [id]: update(state.tabs[id]) } };
}

export function updateSession(state: DemoState, update: (session: Session) => Session, connectionId = state.activeConnectionId): DemoState {
  return {
    ...state,
    connections: state.connections.map((c) => (c.id === connectionId ? { ...c, session: update(c.session) } : c)),
  };
}
