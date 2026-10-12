import { useDemo } from '../context';
import { activeConnection, activeTab } from '../state/access';
import { clearLogs, setLogLevels, setLogSearch, toggleLog } from '../state/logActions';
import { visibleLogs } from '../state/selectors';
import { openModal } from '../state/shellActions';
import { EmptyState } from '../ui/EmptyState';
import { SearchField, Toolbar, ToolbarButton, ToolbarSeparator } from '../ui/Toolbar';
import { LogRow } from './LogRow';

export function LogsScreen() {
  const { state, dispatch } = useDemo();
  const logsState = activeTab(state)!.logs;
  const all = activeConnection(state)?.session.logs ?? [];
  const logs = visibleLogs(state);
  const filtering = Boolean(logsState.search || logsState.levels.length);

  return (
    <>
      <Toolbar>
        <SearchField
          value={logsState.search}
          placeholder="Search logs…"
          label="Search logs"
          onInput={(value) => dispatch(setLogSearch, value)}
          trailing={filtering && <span class="xr-match-count">{`${logs.length} of ${all.length}`}</span>}
        />
        <ToolbarSeparator />
        <ToolbarButton
          icon="sliders-horizontal"
          label={logsState.levels.length ? `Filter · ${logsState.levels.length}` : 'Filter'}
          active={logsState.levels.length > 0}
          onClick={() => dispatch(openModal, { kind: 'logsFilter' })}
        />
        <ToolbarSeparator />
        <ToolbarButton icon="trash" label="Clear All" onClick={() => dispatch(clearLogs)} />
      </Toolbar>
      {logs.length ? (
        <div class="xr-logs" role="table" aria-label="Log entries" data-tour="logs-list">
          {logs.map((log) => (
            <LogRow
              key={log.id}
              log={log}
              search={logsState.search}
              expanded={logsState.expandedIds.includes(log.id)}
              onToggle={() => dispatch(toggleLog, log.id)}
            />
          ))}
        </div>
      ) : all.length ? (
        <EmptyState
          icon="magnifying-glass"
          title="No logs match"
          action={
            <button
              type="button"
              class="xr-button is-outline"
              onClick={() => {
                dispatch(setLogSearch, '');
                dispatch(setLogLevels, []);
              }}
            >
              Clear Filter
            </button>
          }
        />
      ) : (
        <EmptyState icon="file-text" title="No log entries yet" message="Logs your app writes show up here as they happen." />
      )}
    </>
  );
}
