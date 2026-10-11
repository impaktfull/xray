import { useDemo } from '../context';
import { activeTab } from '../state/access';
import { clearCalls, setNetworkSearch } from '../state/networkActions';
import { activeFilterCount } from '../state/networkFilter';
import { visibleCalls } from '../state/selectors';
import { openModal } from '../state/shellActions';
import { SearchField, Toolbar, ToolbarButton, ToolbarSeparator } from '../ui/Toolbar';

export function NetworkToolbar() {
  const { state, dispatch } = useDemo();
  const network = activeTab(state)!.network;
  const filters = activeFilterCount(network.filter);
  const total = state.connections.find((c) => c.id === state.activeConnectionId)?.session.calls.length ?? 0;
  const shown = visibleCalls(state).length;

  return (
    <Toolbar>
      <SearchField
        value={network.search}
        placeholder="Filter by URL, status, method…"
        label="Filter network calls"
        onInput={(value) => dispatch(setNetworkSearch, value)}
        trailing={(network.search || filters > 0) && <span class="xr-match-count">{`${shown} of ${total}`}</span>}
      />
      <ToolbarSeparator />
      <ToolbarButton
        icon="sliders-horizontal"
        label={filters ? `Filter · ${filters}` : 'Filter'}
        active={filters > 0}
        tour="network-filter"
        onClick={() => dispatch(openModal, { kind: 'networkFilter' })}
      />
      <ToolbarSeparator />
      <ToolbarButton icon="trash" label="Clear All" onClick={() => dispatch(clearCalls)} />
    </Toolbar>
  );
}
