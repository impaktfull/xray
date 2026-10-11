import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { Icon } from './Icon';

interface ModalProps {
  title: string;
  onClose: () => void;
  width?: number;
  footer?: ComponentChildren;
  children: ComponentChildren;
}

const focusable = 'button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

/** A dialog over the app window: traps focus, closes on Esc and on the overlay, restores focus. */
export function Modal({ title, onClose, width = 480, footer, children }: ModalProps) {
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = dialog.current?.querySelector<HTMLElement>('[data-autofocus]') ?? dialog.current?.querySelector<HTMLElement>(focusable);
    first?.focus();
    return () => previous?.focus();
  }, []);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !dialog.current) return;
    const items = [...dialog.current.querySelectorAll<HTMLElement>(focusable)];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div class="xr-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialog}
        class="xr-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width: `min(${width}px, calc(100% - 32px))` }}
        onKeyDown={onKeyDown}
      >
        <header class="xr-modal__header">
          <h2>{title}</h2>
          <button type="button" class="xr-icon-button" aria-label="Close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </header>
        <div class="xr-modal__body">{children}</div>
        {footer && <footer class="xr-modal__footer">{footer}</footer>}
      </div>
    </div>
  );
}
