import { act, cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import Demo from './Demo';

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  // Report a phone-sized demo, as the browser would on a 390px wide screen.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe() {
        this.callback([{ contentRect: { width: 342 } } as ResizeObserverEntry], this as unknown as ResizeObserver);
      }
      disconnect() {}
    },
  );
});

afterAll(() => vi.unstubAllGlobals());
afterEach(cleanup);

describe('Demo on phones', () => {
  it('switches connections with one picker instead of tabs', () => {
    render(<Demo />);
    const picker = screen.getByRole('combobox', { name: 'Connection' }) as HTMLSelectElement;
    expect(screen.queryByRole('tablist', { name: 'Connections' })).toBeNull();
    act(() => {
      fireEvent.change(picker, { target: { value: 'iphone' } });
    });
    expect(picker.value).toBe('iphone');
  });

  it('shows two-line call rows, then only the detail with a way back', () => {
    render(<Demo />);
    expect(screen.queryByRole('table', { name: 'Network calls' })).toBeNull();
    fireEvent.click(screen.getAllByRole('option').find((o) => o.textContent?.includes('/api/v1/sessions/current'))!);
    expect(screen.queryByRole('listbox', { name: 'Calls' })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Request' }));
    expect(screen.getByRole('tab', { name: 'Request' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Calls' }));
    expect(screen.getByRole('listbox', { name: 'Calls' })).toBeTruthy();
  });
});

describe('Demo before it has measured itself', () => {
  it('renders the phone and the desktop version, for CSS to pick from', () => {
    // As in the HTML rendered at build time: no size is known yet.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    const { container } = render(<Demo />);

    expect(container.querySelector('.xr-demo')?.classList.contains('is-compact')).toBe(false);
    expect(container.querySelector('.xr-topbar.is-compact.xr-compact-only')).toBeTruthy();
    expect(container.querySelector('.xr-topbar.xr-wide-only:not(.is-compact)')).toBeTruthy();
    expect(container.querySelector('.xr-compact-only [role="listbox"][aria-label="Calls"]')).toBeTruthy();
    expect(container.querySelector('.xr-wide-only [role="table"][aria-label="Network calls"]')).toBeTruthy();
  });
});
