import { useEffect, useState } from 'preact/hooks';
import { useCompact } from '../compact';
import { useDemo } from '../context';
import type { NetworkCall } from '../model/types';
import { activeTab } from '../state/access';
import { closeCall, setRequestTab, setResponseTab } from '../state/networkActions';
import { showToast } from '../state/shellActions';
import { Icon } from '../ui/Icon';
import { BodyViewer } from './BodyViewer';
import { callDisplay } from './callDisplay';
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
  const compact = useCompact();
  const [side, setSide] = useState<'request' | 'response'>('response');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !state.modal) dispatch(closeCall);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.modal, dispatch]);

  if (!compact) {
    return (
      <section class="xr-detail" aria-label="Call detail" data-tour="call-detail">
        <SummaryBar call={call} />
        <div class="xr-detail__panels">
          <RequestPanel call={call} />
          <ResponsePanel call={call} />
        </div>
      </section>
    );
  }

  const d = callDisplay(call);
  return (
    <section class="xr-detail is-compact" aria-label="Call detail" data-tour="call-detail">
      <div class="xr-detail-bar">
        <button type="button" class="xr-detail-bar__back" onClick={() => dispatch(closeCall)}>
          <Icon name="arrow-left" size={16} />
          Calls
        </button>
        <span class="xr-spacer" />
        <button type="button" class="xr-icon-button is-small" aria-label="Copy URL" onClick={() => dispatch(showToast, 'URL copied')}>
          <Icon name="copy" />
        </button>
      </div>
      <div class="xr-detail__scroll">
        <div class="xr-summary-card">
          <div class="xr-summary-card__badges">
            <span class={`xr-badge method-${d.methodTone}`}>{d.method}</span>
            <span class={`xr-badge tone-${d.statusTone}`}>{d.statusDetail}</span>
            <span class={`xr-mono tone-${d.durationTone}`}>{d.duration}</span>
            <span class="xr-spacer" />
            <span class="xr-mono is-muted">{d.time}</span>
          </div>
          <p class="xr-summary-card__url">{call.url}</p>
        </div>
        <div class="xr-side-switch" role="tablist" aria-label="Request or response">
          {(['request', 'response'] as const).map((s) => (
            <button key={s} type="button" role="tab" aria-selected={side === s} class={`is-${s} ${side === s ? 'is-active' : ''}`} onClick={() => setSide(s)}>
              <Icon name={s === 'request' ? 'arrow-up-right' : 'arrow-down-left'} />
              {s === 'request' ? 'Request' : 'Response'}
            </button>
          ))}
        </div>
        {side === 'request' ? <RequestPanel call={call} /> : <ResponsePanel call={call} />}
      </div>
    </section>
  );
}

function RequestPanel({ call }: { call: NetworkCall }) {
  const { state, dispatch } = useDemo();
  const network = activeTab(state)!.network;
  return (
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
  );
}

function ResponsePanel({ call }: { call: NetworkCall }) {
  const { state, dispatch } = useDemo();
  const network = activeTab(state)!.network;
  return (
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
  );
}
