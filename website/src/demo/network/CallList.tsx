import { useDemo } from '../context';
import { activeTab } from '../state/access';
import { openModal } from '../state/shellActions';
import { clearCalls, setNetworkSearch } from '../state/networkActions';
import { Icon } from '../ui/Icon';
import { CallItems } from './CallItems';

export function CallList() {
  const { state, dispatch } = useDemo();
  const network = activeTab(state)!.network;

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
      <CallItems />
    </aside>
  );
}
