import type { DemoState, PanelTab, BodyView } from './demoState';
import { updateSession, updateTab } from './access';
import type { NetworkFilter } from './networkFilter';

const updateNetwork = (state: DemoState, update: (network: DemoState['tabs'][string]['network']) => Partial<DemoState['tabs'][string]['network']>) =>
  updateTab(state, (tab) => ({ ...tab, network: { ...tab.network, ...update(tab.network) } }));

export const selectCall = (state: DemoState, callId: string): DemoState =>
  updateNetwork(state, () => ({ selectedId: callId, highlightedLine: undefined }));

export const closeCall = (state: DemoState): DemoState =>
  updateNetwork(state, () => ({ selectedId: undefined, highlightedLine: undefined }));

export const setNetworkSearch = (state: DemoState, search: string): DemoState => updateNetwork(state, () => ({ search }));

export const applyNetworkFilter = (state: DemoState, filter: NetworkFilter): DemoState =>
  updateNetwork(state, () => ({ filter }));

export const setRequestTab = (state: DemoState, requestTab: PanelTab): DemoState => updateNetwork(state, () => ({ requestTab }));

export const setResponseTab = (state: DemoState, responseTab: PanelTab): DemoState => updateNetwork(state, () => ({ responseTab }));

export const setBodyView = (state: DemoState, bodyView: BodyView): DemoState => updateNetwork(state, () => ({ bodyView }));

/** "Show in operation →" on a GraphQL error: switch to the request body and mark the line. */
export const showInOperation = (state: DemoState, line: number): DemoState =>
  updateNetwork(state, () => ({ requestTab: 'body', highlightedLine: line }));

export const clearCalls = (state: DemoState): DemoState =>
  updateNetwork(updateSession(state, (session) => ({ ...session, calls: [] })), () => ({ selectedId: undefined }));
