import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import type { DeviceState, FeatureFlag } from '../model/types';
import { resetFlag, setFlag } from '../state/deviceActions';
import { Chip, Toggle } from '../ui/Controls';
import { Icon } from '../ui/Icon';

type Source = 'all' | FeatureFlag['source'];

export function FlagsTab({ device }: { device: DeviceState }) {
  const { dispatch } = useDemo();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<Source>('all');
  const flags = device.flags.filter((f) => (source === 'all' || f.source === source) && f.key.includes(search.trim().toLowerCase()));

  return (
    <div class="xr-device-sections">
      <label class="xr-search is-boxed">
        <Icon name="magnifying-glass" />
        <input type="search" placeholder="Filter flags…" aria-label="Filter flags" value={search} onInput={(e) => setSearch((e.currentTarget as HTMLInputElement).value)} />
      </label>
      <div class="xr-chips">
        {(['all', 'remote', 'local'] as const).map((s) => (
          <Chip key={s} selected={source === s} count={s === 'all' ? device.flags.length : device.flags.filter((f) => f.source === s).length} onClick={() => setSource(s)}>
            {s === 'all' ? 'All' : s === 'remote' ? 'Remote Config' : 'Local'}
          </Chip>
        ))}
      </div>
      <ul class="xr-flag-list">
        {flags.map((flag) => {
          const overridden = flag.value !== flag.remote;
          return (
            <li key={flag.key} class={overridden ? 'is-overridden' : ''}>
              <span class="xr-flag-list__name">
                <span class="xr-mono">{flag.key}</span>
                <span>
                  {flag.source === 'remote' ? 'Remote' : 'Default'}: {String(flag.remote)}
                </span>
              </span>
              {flag.type === 'bool' ? (
                <Toggle checked={flag.value === true} label={flag.key} onChange={(on) => dispatch(setFlag, flag.key, on)} />
              ) : (
                <input
                  class="xr-input is-flag"
                  aria-label={flag.key}
                  inputMode={flag.type === 'int' ? 'numeric' : 'text'}
                  value={String(flag.value)}
                  onChange={(e) => {
                    const raw = (e.currentTarget as HTMLInputElement).value;
                    const value = flag.type === 'int' ? Number.parseInt(raw, 10) : raw;
                    if (flag.type !== 'int' || !Number.isNaN(value)) dispatch(setFlag, flag.key, value);
                  }}
                />
              )}
              <button type="button" class="xr-icon-button is-small" aria-label={`Reset ${flag.key}`} disabled={!overridden} onClick={() => dispatch(resetFlag, flag.key)}>
                <Icon name="arrow-clockwise" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
