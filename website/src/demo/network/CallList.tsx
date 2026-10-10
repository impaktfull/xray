import { useDemo } from '../context';
import { activeTab } from '../state/access';
import { openModal } from '../state/shellActions';
import { clearCalls, selectCall, setNetworkSearch } from '../state/networkActions';
import { visibleCalls } from '../state/selectors';
import { Icon } from '../ui/Icon';
import { callDisplay } from './callDisplay';

export function CallList() {
  const { state, dispatch } = useDemo();
  const network = activeTab(state)!.network;
  const calls = visibleCalls(state);

  return (
    <aside class="xr-call-list" aria-label="Network calls">
      <div class="xr-call-list__search">
        <label class="xr-search is-compact">
          <Icon name="magnifying-glass" />
          <input
            type="search"
            placeholder="Filter calls…"
            aria-label="Filter calls"
            value={network.search}
            onInput={(e) => dispatch(setNetworkSearch, (e.currentTarget as HTMLInputElement).value)}
          />
        </label>
        <button type="button" class="xr-icon-button is-small" aria-label="Filter" onClick={() => dispatch(openModal, { kind: 'networkFilter' })}>
          <Icon name="sliders-horizontal" />
        </button>
        <button type="button" class="xr-icon-button is-small" aria-label="Clear all calls" onClick={() => dispatch(clearCalls)}>
          <Icon name="x-circle" />
        </button>
      </div>
      <div class="xr-call-list__items" role="listbox" aria-label="Calls">
        {calls.map((call) => {
          const d = callDisplay(call);
          const selected = call.id === network.selectedId;
          return (
            <button
              key={call.id}
              type="button"
              role="option"
              aria-selected={selected}
              class={`xr-call-item ${selected ? 'is-selected' : ''}`}
              onClick={() => dispatch(selectCall, call.id)}
            >
              <span class="xr-call-item__top">
                <span class={`xr-call-item__method ${d.graphqlKind ? 'is-gql' : `method-${d.methodTone}`}`}>{d.graphqlKind ?? d.method}</span>
                <span class="xr-truncate xr-mono">{d.path}</span>
              </span>
              <span class="xr-call-item__meta">
                <span class={`tone-${d.statusTone} is-strong`}>{d.statusDetail}</span>
                <span class={`tone-${d.durationTone}`}>{d.duration}</span>
                <span class="xr-spacer" />
                <span>{d.time}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
