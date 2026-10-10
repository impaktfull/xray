import { useDemo } from '../context';
import type { KvStoreId } from '../model/types';
import { activeConnection, activeTab } from '../state/access';
import { selectStore, setKeyValueSearch } from '../state/keyValueActions';
import { visibleEntries } from '../state/selectors';
import { openModal, showToast } from '../state/shellActions';
import { EmptyState } from '../ui/EmptyState';
import { Icon } from '../ui/Icon';
import { SearchField, Toolbar, ToolbarButton, ToolbarSeparator } from '../ui/Toolbar';
import { displayValue, typeTone } from './values';

export function KeyValueScreen() {
  const { state, dispatch } = useDemo();
  const tab = activeTab(state)!.keyValue;
  const stores = activeConnection(state)?.session.stores ?? [];
  const { store, entries } = visibleEntries(state);

  return (
    <>
      <Toolbar>
        <select
          class="xr-select"
          aria-label="Store"
          value={tab.storeId}
          onChange={(e) => dispatch(selectStore, (e.currentTarget as HTMLSelectElement).value as KvStoreId)}
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <ToolbarSeparator />
        <SearchField value={tab.search} placeholder="Filter keys…" label="Filter keys" onInput={(value) => dispatch(setKeyValueSearch, value)} />
        <span class="xr-match-count">{entries.length} keys</span>
        <ToolbarSeparator />
        <ToolbarButton icon="arrow-clockwise" label="Refresh" onClick={() => dispatch(showToast, `${store?.label} refreshed`)} />
        <button type="button" class="xr-button is-primary is-small" data-tour="add-key" onClick={() => dispatch(openModal, { kind: 'addKey', storeId: tab.storeId })}>
          <Icon name="plus" size={12} />
          Add Key
        </button>
      </Toolbar>
      {entries.length ? (
        <div class="xr-table" role="table" aria-label={store?.label}>
          <div class="xr-table__head xr-kv-cols" role="row">
            <span role="columnheader">Key</span>
            <span role="columnheader">Value</span>
            <span role="columnheader">Type</span>
            <span />
          </div>
          <div class="xr-table__body" data-tour="kv-list">
            {entries.map((entry) => (
              <button
                key={entry.key}
                type="button"
                role="row"
                class="xr-table__row xr-kv-cols"
                aria-label={`Edit ${entry.key}`}
                onClick={() => dispatch(openModal, { kind: 'editValue', storeId: tab.storeId, key: entry.key })}
              >
                <span role="cell" class="xr-mono xr-truncate">{entry.key}</span>
                <span role="cell" class="xr-mono xr-truncate is-secondary">{displayValue(entry.value)}</span>
                <span role="cell" class={`xr-mono ${typeTone[entry.type]}`}>{entry.type}</span>
                <span class="xr-row-action">
                  <Icon name="pencil-simple" />
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState icon="database" title={tab.search ? 'No keys match' : `${store?.label} is empty`} />
      )}
    </>
  );
}
