import { useEffect } from 'preact/hooks';
import { useDemo } from '../context';
import type { NetworkCall } from '../model/types';
import { activeTab } from '../state/access';
import { closeCall, setRequestTab, setResponseTab } from '../state/networkActions';
import { BodyViewer } from './BodyViewer';
import { GraphqlRequest, GraphqlResponse } from './GraphqlPanels';
import { HeadersView } from './HeadersView';
import { PanelTabs } from './PanelTabs';
import { SummaryBar } from './SummaryBar';

const panelTabs = [
  { id: 'headers' as const, label: 'Headers' },
  { id: 'body' as const, label: 'Body' },
];

export function CallDetail({ call }: { call: NetworkCall }) {
  const { state, dispatch } = useDemo();
  const network = activeTab(state)!.network;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !state.modal) dispatch(closeCall);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.modal, dispatch]);

  return (
    <section class="xr-detail" aria-label="Call detail" data-tour="call-detail">
      <SummaryBar call={call} />
      <div class="xr-detail__panels">
        <div class="xr-panel">
          <PanelTabs
            side="request"
            tabs={call.graphql ? [{ id: 'body', label: 'Operation' }, panelTabs[0]] : panelTabs}
            current={network.requestTab}
            onSelect={(tab) => dispatch(setRequestTab, tab)}
          />
          <div class="xr-panel__content">
            {network.requestTab === 'headers' ? (
              <HeadersView headers={call.requestHeaders} />
            ) : call.graphql ? (
              <GraphqlRequest graphql={call.graphql} highlightedLine={network.highlightedLine} />
            ) : (
              <BodyViewer body={call.requestBody} view={network.bodyView} rootLabel="Request" />
            )}
          </div>
        </div>
        <div class="xr-panel">
          <PanelTabs side="response" tabs={panelTabs} current={network.responseTab} onSelect={(tab) => dispatch(setResponseTab, tab)} />
          <div class="xr-panel__content">
            {call.state === 'pending' ? (
              <p class="xr-panel-empty is-waiting">Waiting for response…</p>
            ) : call.state === 'failed' ? (
              <div class="xr-failed">
                <p class="xr-panel-empty">No response received</p>
                <pre class="xr-error-box">{call.error}</pre>
              </div>
            ) : network.responseTab === 'headers' ? (
              <HeadersView headers={call.responseHeaders} />
            ) : call.graphql ? (
              <GraphqlResponse graphql={call.graphql} body={call.responseBody} />
            ) : (
              <BodyViewer body={call.responseBody} view={network.bodyView} rootLabel="Response" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
