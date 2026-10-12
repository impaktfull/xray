import { useDemo } from '../context';
import { activeConnection } from '../state/access';
import { selectConnection } from '../state/shellActions';
import { Icon } from '../ui/Icon';

/** Phone layout: one switcher instead of a tab per connection. A native select keeps it accessible. */
export function ConnectionSwitcher() {
  const { state, dispatch } = useDemo();
  const active = activeConnection(state);
  return (
    <label class="xr-conn-switcher">
      <span class={`xr-status-dot is-${active?.status ?? 'disconnected'}`} />
      <span class="xr-conn-tab__app xr-truncate">{active?.appName ?? 'No device'}</span>
      <span class="xr-conn-tab__device">{active?.deviceName}</span>
      <Icon name="caret-down" size={12} />
      <select
        aria-label="Connection"
        value={state.activeConnectionId}
        onChange={(e) => dispatch(selectConnection, (e.currentTarget as HTMLSelectElement).value)}
      >
        {state.connections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.appName} · {c.deviceName}
          </option>
        ))}
      </select>
    </label>
  );
}
