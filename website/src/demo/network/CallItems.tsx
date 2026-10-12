import { useDemo } from '../context';
import { activeTab } from '../state/access';
import { selectCall } from '../state/networkActions';
import { visibleCalls } from '../state/selectors';
import { callDisplay } from './callDisplay';

/** Two-line call rows: the split view's list, and the whole list on phones. */
export function CallItems({ tour }: { tour?: string }) {
  const { state, dispatch } = useDemo();
  const selectedId = activeTab(state)!.network.selectedId;
  return (
    <div class="xr-call-list__items" role="listbox" aria-label="Calls" data-tour={tour}>
        {visibleCalls(state).map((call) => {
          const d = callDisplay(call);
          const selected = call.id === selectedId;
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
  );
}
