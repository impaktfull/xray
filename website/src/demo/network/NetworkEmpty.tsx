import { useDemo } from '../context';
import { activeConnection, activeTab } from '../state/access';
import { applyNetworkFilter, setNetworkSearch } from '../state/networkActions';
import { emptyNetworkFilter } from '../state/networkFilter';
import { EmptyState } from '../ui/EmptyState';

export function NetworkEmpty() {
  const { state, dispatch } = useDemo();
  const hasCalls = (activeConnection(state)?.session.calls.length ?? 0) > 0;
  if (!hasCalls) {
    return <EmptyState icon="wifi-high" title="No network calls yet" message="Calls your app makes show up here as they happen." />;
  }
  const network = activeTab(state)!.network;
  return (
    <EmptyState
      icon="magnifying-glass"
      title="No calls match"
      message={network.search ? `Nothing matches "${network.search}" with the current filter.` : 'No calls match the current filter.'}
      action={
        <button
          type="button"
          class="xr-button is-outline"
          onClick={() => {
            dispatch(setNetworkSearch, '');
            dispatch(applyNetworkFilter, emptyNetworkFilter);
          }}
        >
          Clear Filter
        </button>
      }
    />
  );
}
