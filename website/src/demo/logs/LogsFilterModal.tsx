import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import type { LogLevel } from '../model/types';
import { activeConnection, activeTab } from '../state/access';
import { setLogLevels } from '../state/logActions';
import { logLevelCounts } from '../state/selectors';
import { closeModal } from '../state/shellActions';
import { Checkbox, SectionLabel } from '../ui/Controls';
import { Modal } from '../ui/Modal';
import { levels } from './levels';

export function LogsFilterModal() {
  const { state, dispatch } = useDemo();
  const [selected, setSelected] = useState<LogLevel[]>(activeTab(state)!.logs.levels);
  const counts = logLevelCounts(state);
  const all = activeConnection(state)?.session.logs ?? [];
  const shown = selected.length ? all.filter((l) => selected.includes(l.level)).length : all.length;
  const close = () => dispatch(closeModal);

  return (
    <Modal
      title="Filter Log Entries"
      onClose={close}
      footer={
        <>
          <button type="button" class="xr-button is-ghost" onClick={() => setSelected([])}>
            Reset
          </button>
          <span class="xr-spacer" />
          <button
            type="button"
            class="xr-button is-primary"
            onClick={() => {
              dispatch(setLogLevels, selected);
              close();
            }}
          >
            Show {shown} of {all.length} Entries
          </button>
        </>
      }
    >
      <SectionLabel>Levels</SectionLabel>
      <div class="xr-checkbox-list">
        {levels.map((level) => (
          <Checkbox
            key={level.id}
            checked={selected.includes(level.id)}
            trailing={counts[level.id]}
            onChange={(checked) => setSelected(checked ? [...selected, level.id] : selected.filter((l) => l !== level.id))}
          >
            <span class={`xr-level is-${level.id}`}>{level.label}</span>
          </Checkbox>
        ))}
      </div>
    </Modal>
  );
}
