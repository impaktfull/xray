import type { Connection } from '../model/types';
import { Icon } from '../ui/Icon';

interface ConnectionTabProps {
  connection: Connection;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export function ConnectionTab({ connection, selected, onSelect, onClose }: ConnectionTabProps) {
  return (
    <div class={`xr-conn-tab ${selected ? 'is-selected' : ''}`} role="presentation">
      <button
        type="button"
        role="tab"
        aria-selected={selected}
        class="xr-conn-tab__main"
        onClick={onSelect}
        aria-label={`${connection.appName} on ${connection.deviceName}, ${connection.status}`}
      >
        <span class={`xr-status-dot is-${connection.status}`} />
        <span class="xr-conn-tab__app">{connection.appName}</span>
        <span class="xr-conn-tab__device">{connection.deviceName}</span>
      </button>
      <button type="button" class="xr-conn-tab__close" aria-label={`Close ${connection.deviceName}`} onClick={onClose}>
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
