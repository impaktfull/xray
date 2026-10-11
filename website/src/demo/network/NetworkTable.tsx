import { useDemo } from '../context';
import { selectCall } from '../state/networkActions';
import { visibleCalls } from '../state/selectors';
import { callDisplay } from './callDisplay';
import { NetworkEmpty } from './NetworkEmpty';

export function NetworkTable() {
  const { state, dispatch } = useDemo();
  const calls = visibleCalls(state);
  if (!calls.length) return <NetworkEmpty />;

  return (
    <div class="xr-table" role="table" aria-label="Network calls">
      <div class="xr-table__head xr-net-cols" role="row">
        <span role="columnheader">Name</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Method</span>
        <span role="columnheader">Size</span>
        <span role="columnheader">Time</span>
      </div>
      <div class="xr-table__body" data-tour="network-list">
        {calls.map((call) => {
          const d = callDisplay(call);
          return (
            <button
              key={call.id}
              type="button"
              role="row"
              class={`xr-table__row xr-net-cols ${call.state === 'pending' ? 'is-pending' : ''}`}
              data-call-id={call.id}
              onClick={() => dispatch(selectCall, call.id)}
            >
              <span class="xr-net-name" role="cell">
                <span class={`xr-dot tone-${d.statusTone}`} />
                {d.graphqlKind && <span class="xr-gql-kind">{d.graphqlKind}</span>}
                <span class="xr-truncate">{d.path}</span>
              </span>
              <span role="cell" class={`xr-mono tone-${d.statusTone}`}>{d.status}</span>
              <span role="cell" class={`xr-mono method-${d.methodTone}`}>{d.method}</span>
              <span role="cell" class="xr-mono is-muted">{d.size}</span>
              <span role="cell" class={`xr-mono tone-${d.durationTone}`}>{d.duration}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
