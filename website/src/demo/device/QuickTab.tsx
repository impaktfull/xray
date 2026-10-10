import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import { locales } from '../data/device';
import type { AnimationSpeed, Appearance, DeviceSettings, DeviceState } from '../model/types';
import { isOverridden, setDeviceSetting } from '../state/deviceActions';
import { Chip, Toggle } from '../ui/Controls';

const appearances: { id: Appearance; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];
const speeds: { id: AnimationSpeed; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: '0.2', label: '0.2×' },
  { id: '1', label: '1×' },
  { id: '5', label: '5× slow' },
];
const switches: { key: keyof DeviceSettings & ('boldText' | 'highContrast' | 'layoutBounds' | 'performanceOverlay'); label: string }[] = [
  { key: 'boldText', label: 'Bold text' },
  { key: 'highContrast', label: 'High contrast' },
  { key: 'layoutBounds', label: 'Show layout bounds' },
  { key: 'performanceOverlay', label: 'Performance overlay' },
];
const scaleTicks = [0.85, 1, 1.3, 1.6, 2, 3];

function Label({ device, setting, children, value }: { device: DeviceState; setting: keyof DeviceSettings; children: string; value?: string }) {
  return (
    <p class="xr-device-label">
      <span>{children}</span>
      {isOverridden(device, setting) && <span class="xr-overridden">Overridden</span>}
      {value && <span class="xr-mono">{value}</span>}
    </p>
  );
}

export function QuickTab({ device }: { device: DeviceState }) {
  const { dispatch } = useDemo();
  const { settings } = device;
  // The slider shows its value while dragging and tells the app once, on release.
  const [scale, setScale] = useState(settings.textScale);

  return (
    <div class="xr-device-sections">
      <section>
        <Label device={device} setting="appearance">Appearance</Label>
        <div class="xr-segmented is-boxed" role="radiogroup" aria-label="Appearance">
          {appearances.map((a) => (
            <button key={a.id} type="button" role="radio" aria-checked={settings.appearance === a.id} class={settings.appearance === a.id ? 'is-active' : ''} onClick={() => dispatch(setDeviceSetting, 'appearance', a.id)}>
              {a.label}
            </button>
          ))}
        </div>
      </section>
      <section>
        <Label device={device} setting="locale">Locale</Label>
        <select class="xr-input" aria-label="Locale" value={settings.locale} onChange={(e) => dispatch(setDeviceSetting, 'locale', (e.currentTarget as HTMLSelectElement).value)}>
          {locales.map((l) => (
            <option key={l.id} value={l.id}>
              {l.id} · {l.label}
            </option>
          ))}
        </select>
        <div class="xr-chips">
          {locales.map((l) => (
            <Chip key={l.id} selected={settings.locale === l.id} onClick={() => dispatch(setDeviceSetting, 'locale', l.id)}>
              {l.id.slice(0, 2)}
              {l.id.startsWith('ar') ? ' · RTL' : ''}
            </Chip>
          ))}
        </div>
      </section>
      <section>
        <Label device={device} setting="textScale" value={`${scale}×`}>
          Text size
        </Label>
        <div class="xr-slider">
          <span aria-hidden="true">A</span>
          <input
            type="range"
            min={0.85}
            max={3}
            step={0.05}
            value={scale}
            aria-label="Text size"
            onInput={(e) => setScale(Number((e.currentTarget as HTMLInputElement).value))}
            onChange={(e) => dispatch(setDeviceSetting, 'textScale', Number((e.currentTarget as HTMLInputElement).value))}
          />
          <span aria-hidden="true" class="is-large">
            A
          </span>
        </div>
        <div class="xr-slider__ticks" aria-hidden="true">
          {scaleTicks.map((t) => (
            <span key={t} class={Math.abs(scale - t) < 0.03 ? 'is-current' : ''}>
              {t}
            </span>
          ))}
        </div>
      </section>
      <section>
        <Label device={device} setting="animations">Animations</Label>
        <div class="xr-segmented is-boxed" role="radiogroup" aria-label="Animations">
          {speeds.map((s) => (
            <button key={s.id} type="button" role="radio" aria-checked={settings.animations === s.id} class={settings.animations === s.id ? 'is-active' : ''} onClick={() => dispatch(setDeviceSetting, 'animations', s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </section>
      <ul class="xr-switch-list">
        {switches.map((s) => (
          <li key={s.key}>
            <span>{s.label}</span>
            {isOverridden(device, s.key) && <span class="xr-overridden">Overridden</span>}
            <Toggle checked={settings[s.key]} label={s.label} onChange={(on) => dispatch(setDeviceSetting, s.key, on)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
