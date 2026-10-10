import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/preact';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import Demo from './Demo';

beforeAll(() => {
  // jsdom has no IntersectionObserver; the demo only uses it to pause streaming off-screen.
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(cleanup);

const tab = (name: string) => screen.getByRole('tab', { name: new RegExp(name) });

describe('Demo', () => {
  it('opens on the network table of the impaktfull dashboard on a Pixel 8', () => {
    render(<Demo />);
    expect(screen.getByRole('tab', { name: /impaktfull dashboard on Pixel 8/ }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('table', { name: 'Network calls' })).toBeTruthy();
  });

  it('opens a call in the split view and closes it with Esc', () => {
    render(<Demo />);
    fireEvent.click(screen.getAllByRole('row').find((row) => row.textContent?.includes('/api/v1/sessions/current'))!);
    expect(screen.getByRole('region', { name: 'Call detail' }).textContent).toContain('500');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'Call detail' })).toBeNull();
  });

  it('jumps from a GraphQL error to the line in the operation', () => {
    render(<Demo />);
    fireEvent.click(screen.getAllByRole('row').find((row) => row.textContent?.includes('ArchiveProject'))!);
    fireEvent.click(screen.getByRole('button', { name: 'Show in operation →' }));
    expect(document.querySelector('.xr-gql__doc li.is-highlighted')?.textContent).toContain('4');
  });

  it('saves an edited value and shows the change on the timeline', () => {
    render(<Demo />);
    fireEvent.click(tab('Key-Value'));
    fireEvent.click(screen.getByRole('row', { name: 'Edit theme_mode' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit Value' });
    fireEvent.input(within(dialog).getByLabelText('Value'), { target: { value: 'light' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(tab('Timeline'));
    expect(screen.getAllByRole('option')[0].textContent).toContain('theme_mode dark → light');
  });

  it('closes a modal with Esc', () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    const dialog = screen.getByRole('dialog', { name: 'Filter Network Calls' });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('connects to a discovered app in a new tab', () => {
    vi.useFakeTimers();
    render(<Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Add connection' }));
    act(() => {
      vi.advanceTimersByTime(1_500);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Connect to impaktfull dashboard on MacBook Pro' }));
    expect(screen.getByRole('tab', { name: /MacBook Pro/ }).getAttribute('aria-selected')).toBe('true');
    vi.useRealTimers();
  });

  it('says which controls are not part of the demo', () => {
    render(<Demo />);
    expect(screen.getByRole('button', { name: 'Search or run a command (not available in the demo)' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Device actions (not available in the demo)' })).toBeTruthy();
  });
});

describe('Demo tour', () => {
  it('walks through the steps and ends with Esc', () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Take the tour' }));
    expect(screen.getByRole('dialog', { name: 'Every network call, as it happens' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Headers, bodies and errors' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Call detail' }).textContent).toContain('500');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Take the tour' })).toBeTruthy();
  });

  it('starts at the step a #demo/<step> link points at', () => {
    render(<Demo />);
    act(() => {
      location.hash = '#demo/timeline';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(screen.getByRole('dialog', { name: 'One timeline for everything' })).toBeTruthy();
    location.hash = '';
  });
});
