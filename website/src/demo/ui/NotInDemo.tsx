import type { ComponentChildren } from 'preact';

interface NotInDemoProps {
  label: string;
  class?: string;
  children: ComponentChildren;
}

/** A control that exists in the app but not in this demo. It says so instead of doing nothing. */
export function NotInDemo({ label, class: className, children }: NotInDemoProps) {
  return (
    <button
      type="button"
      class={`xr-not-in-demo ${className ?? ''}`}
      aria-disabled="true"
      aria-label={`${label} (not available in the demo)`}
      data-tooltip="Not available in the demo"
    >
      {children}
    </button>
  );
}
