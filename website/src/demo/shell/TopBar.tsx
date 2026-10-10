import { useDemo } from '../context';
import { closeConnection, openModal, selectConnection } from '../state/shellActions';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { NotInDemo } from '../ui/NotInDemo';
import { ConnectionTab } from './ConnectionTab';

export function TopBar() {
  const { state, dispatch } = useDemo();
  return (
    <header class="xr-topbar">
      <div class="xr-traffic-lights" aria-hidden="true">
        <span class="is-close" />
        <span class="is-minimize" />
        <span class="is-zoom" />
      </div>
      <div class="xr-brand">
        <Logo size={20} />
        <span>xRay</span>
      </div>
      <div class="xr-conn-tabs" role="tablist" aria-label="Connections">
        {state.connections.map((connection) => (
          <ConnectionTab
            key={connection.id}
            connection={connection}
            selected={connection.id === state.activeConnectionId}
            onSelect={() => dispatch(selectConnection, connection.id)}
            onClose={() => dispatch(closeConnection, connection.id)}
          />
        ))}
        <button
          type="button"
          class="xr-icon-button xr-add-conn"
          aria-label="Add connection"
          data-tour="add-connection"
          onClick={() => dispatch(openModal, { kind: 'addConnection' })}
        >
          <Icon name="plus" />
        </button>
      </div>
      <div class="xr-topbar__actions">
        <NotInDemo label="Search or run a command" class="xr-cmd-pill">
          <Icon name="magnifying-glass" size={13} />
          <span class="xr-cmd-pill__text">Search or run a command…</span>
          <kbd>⌘K</kbd>
        </NotInDemo>
        <NotInDemo label="Device actions" class="xr-icon-button">
          <Icon name="device-mobile" size={15} />
        </NotInDemo>
        <button
          type="button"
          class="xr-icon-button"
          aria-label="Export session"
          data-tooltip="Export session"
          disabled={!state.activeConnectionId}
          onClick={() => dispatch(openModal, { kind: 'export' })}
        >
          <Icon name="export" size={15} />
        </button>
        <NotInDemo label="Settings" class="xr-icon-button">
          <Icon name="gear" size={15} />
        </NotInDemo>
      </div>
    </header>
  );
}
