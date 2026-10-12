import type { ComponentChildren } from 'preact';
import { Icon } from './Icon';

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, label, onChange }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} class={`xr-toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)}>
      <span class="xr-toggle__knob" />
    </button>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ComponentChildren;
  trailing?: ComponentChildren;
}

export function Checkbox({ checked, onChange, children, trailing }: CheckboxProps) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} class="xr-checkbox-row" onClick={() => onChange(!checked)}>
      <span class={`xr-checkbox ${checked ? 'is-checked' : ''}`}>{checked && <Icon name="check" size={10} />}</span>
      <span class="xr-checkbox-row__label">{children}</span>
      {trailing && <span class="xr-checkbox-row__trailing">{trailing}</span>}
    </button>
  );
}

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: ComponentChildren;
  count?: number;
  tone?: string;
}

export function Chip({ selected, onClick, children, count, tone }: ChipProps) {
  return (
    <button type="button" aria-pressed={selected} class={`xr-chip ${selected ? 'is-selected' : ''} ${tone ?? ''}`} onClick={onClick}>
      {children}
      {count !== undefined && <span class="xr-chip__count">{count}</span>}
    </button>
  );
}

export function SectionLabel({ children, hint }: { children: ComponentChildren; hint?: string }) {
  return (
    <p class="xr-section-title">
      {children}
      {hint && <span>{hint}</span>}
    </p>
  );
}
