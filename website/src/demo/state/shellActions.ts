import { connectionFor, discoverableApps, initialTabState, type DemoState, type InspectorTab, type Modal } from './demoState';
import { updateTab } from './access';

export const selectConnection = (state: DemoState, connectionId: string): DemoState =>
  state.connections.some((c) => c.id === connectionId) ? { ...state, activeConnectionId: connectionId } : state;

export function closeConnection(state: DemoState, connectionId: string): DemoState {
  const index = state.connections.findIndex((c) => c.id === connectionId);
  if (index === -1) return state;
  const connections = state.connections.filter((c) => c.id !== connectionId);
  const tabs = { ...state.tabs };
  delete tabs[connectionId];
  const activeConnectionId =
    state.activeConnectionId === connectionId ? connections[Math.min(index, connections.length - 1)]?.id : state.activeConnectionId;
  return { ...state, connections, tabs, activeConnectionId };
}

export function addConnection(state: DemoState, connectionId: string): DemoState {
  if (state.connections.some((c) => c.id === connectionId)) return selectConnection(closeModal(state), connectionId);
  const app = discoverableApps.find((a) => a.connectionId === connectionId);
  if (!app) return state;
  return {
    ...state,
    modal: undefined,
    connections: [...state.connections, connectionFor(app, state.now)],
    tabs: { ...state.tabs, [connectionId]: initialTabState() },
    activeConnectionId: connectionId,
  };
}

export const selectInspector = (state: DemoState, inspector: InspectorTab): DemoState =>
  updateTab(state, (tab) => ({ ...tab, inspector }));

export const openModal = (state: DemoState, modal: Modal): DemoState => ({ ...state, modal });

export const closeModal = (state: DemoState): DemoState => ({ ...state, modal: undefined });

export const showToast = (state: DemoState, message: string): DemoState => ({
  ...state,
  toast: { id: (state.toast?.id ?? 0) + 1, message },
});

export const dismissToast = (state: DemoState): DemoState => ({ ...state, toast: undefined });

export const tick = (state: DemoState, now: number): DemoState => ({ ...state, now });
