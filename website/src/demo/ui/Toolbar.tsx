import type { ComponentChildren } from 'preact';
import { Icon, type IconName } from './Icon';

export function Toolbar({ children }: { children: ComponentChildren }) {
  return <div class="xr-toolbar" role="toolbar">{children}</div>;
}

interface SearchFieldProps {
  value: string;
  placeholder: string;
  label: string;
  onInput: (value: string) => void;
  trailing?: ComponentChildren;
}

export function SearchField({ value, placeholder, label, onInput, trailing }: SearchFieldProps) {
  return (
    <label class="xr-search">
      <Icon name="magnifying-glass" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onInput={(event) => onInput((event.currentTarget as HTMLInputElement).value)}
      />
      {trailing}
    </label>
  );
}

interface ToolbarButtonProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  active?: boolean;
  tour?: string;
}

export function ToolbarButton({ icon, label, onClick, active, tour }: ToolbarButtonProps) {
  return (
    <button type="button" class={`xr-toolbar-button ${active ? 'is-active' : ''}`} onClick={onClick} data-tour={tour}>
      <Icon name={icon} />
      {label}
    </button>
  );
}

export const ToolbarSeparator = () => <span class="xr-toolbar-sep" aria-hidden="true" />;
