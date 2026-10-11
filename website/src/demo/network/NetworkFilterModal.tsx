import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import type { HttpMethod } from '../model/types';
import { activeConnection, activeTab } from '../state/access';
import { applyNetworkFilter } from '../state/networkActions';
import { activeFilterCount, emptyNetworkFilter, matchesFilter, networkPresets, type NetworkFilter, type StatusClass } from '../state/networkFilter';
import { closeModal } from '../state/shellActions';
import { Chip, SectionLabel } from '../ui/Controls';
import { Modal } from '../ui/Modal';

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const statusClasses: { id: StatusClass; label: string; tone: string }[] = [
  { id: '2xx', label: '2xx', tone: 'tone-success' },
  { id: '3xx', label: '3xx', tone: 'tone-info' },
  { id: '4xx', label: '4xx', tone: 'tone-warning' },
  { id: '5xx', label: '5xx', tone: 'tone-error' },
  { id: 'failed', label: 'Failed', tone: 'tone-error' },
  { id: 'pending', label: 'Pending', tone: 'tone-warning' },
];
const thresholds = [undefined, 300, 1_000, 3_000];

const toggle = <T,>(items: T[], item: T) => (items.includes(item) ? items.filter((i) => i !== item) : [...items, item]);

export function NetworkFilterModal() {
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState<NetworkFilter>(activeTab(state)!.network.filter);
  const calls = activeConnection(state)?.session.calls ?? [];
  const shown = calls.filter((call) => matchesFilter(call, filter)).length;
  const count = activeFilterCount(filter);
  const close = () => dispatch(closeModal);

  return (
    <Modal
      title="Filter Network Calls"
      width={640}
      onClose={close}
      footer={
        <>
          {count > 0 && <span class="xr-pill-count">{count} active</span>}
          <button type="button" class="xr-button is-ghost" onClick={() => setFilter(emptyNetworkFilter)}>
            Reset
          </button>
          <span class="xr-spacer" />
          <button
            type="button"
            class="xr-button is-primary"
            onClick={() => {
              dispatch(applyNetworkFilter, filter);
              close();
            }}
          >
            Show {shown} of {calls.length} Calls
          </button>
        </>
      }
    >
      <div class="xr-filter">
        <section>
          <SectionLabel>Presets</SectionLabel>
          <div class="xr-chips">
            {Object.entries(networkPresets).map(([id, preset]) => (
              <Chip key={id} selected={JSON.stringify(preset.filter) === JSON.stringify(filter)} onClick={() => setFilter(preset.filter)}>
                {preset.label}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <SectionLabel>Method</SectionLabel>
          <div class="xr-chips">
            {methods.map((method) => (
              <Chip
                key={method}
                tone={`method-${method.toLowerCase()}`}
                selected={filter.methods.includes(method)}
                count={calls.filter((c) => c.method === method).length}
                onClick={() => setFilter({ ...filter, methods: toggle(filter.methods, method) })}
              >
                {method}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <SectionLabel>Status</SectionLabel>
          <div class="xr-chips">
            {statusClasses.map((status) => (
              <Chip
                key={status.id}
                tone={status.tone}
                selected={filter.statusClasses.includes(status.id)}
                onClick={() => setFilter({ ...filter, statusClasses: toggle(filter.statusClasses, status.id) })}
              >
                {status.label}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <SectionLabel hint="duration">Slower than</SectionLabel>
          <div class="xr-chips">
            {thresholds.map((ms) => (
              <Chip key={String(ms)} selected={filter.slowerThanMs === ms} onClick={() => setFilter({ ...filter, slowerThanMs: ms })}>
                {ms === undefined ? 'Any' : ms < 1_000 ? `${ms} ms` : `${ms / 1_000} s`}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <SectionLabel>Type</SectionLabel>
          <div class="xr-chips">
            <Chip selected={filter.apiOnly} onClick={() => setFilter({ ...filter, apiOnly: !filter.apiOnly })}>
              API calls
            </Chip>
            <Chip selected={filter.imagesOnly} onClick={() => setFilter({ ...filter, imagesOnly: !filter.imagesOnly })}>
              Images
            </Chip>
          </div>
        </section>
      </div>
    </Modal>
  );
}
