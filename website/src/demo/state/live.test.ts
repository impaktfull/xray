import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activeConnection } from './access';
import { openModal } from './shellActions';
import { createDemoStore } from './store';
import { startLive } from './live';

const eventCount = (store: ReturnType<typeof createDemoStore>) => {
  const { calls, logs, kvChanges } = activeConnection(store.state.value)!.session;
  return calls.length + logs.length + kvChanges.length;
};

describe('startLive', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('streams new events while the demo can stream', () => {
    const store = createDemoStore();
    const before = eventCount(store);
    const stop = startLive(store, { canStream: () => true });
    vi.advanceTimersByTime(30_000);
    expect(eventCount(store)).toBeGreaterThan(before);
    stop();
  });

  it('streams nothing while off-screen or with a modal open', () => {
    const hidden = createDemoStore();
    const before = eventCount(hidden);
    const stopHidden = startLive(hidden, { canStream: () => false });
    vi.advanceTimersByTime(30_000);
    expect(eventCount(hidden)).toBe(before);
    stopHidden();

    const withModal = createDemoStore();
    withModal.dispatch(openModal, { kind: 'export' });
    const stopModal = startLive(withModal, { canStream: () => true });
    vi.advanceTimersByTime(30_000);
    expect(eventCount(withModal)).toBe(before);
    stopModal();
  });

  it('completes streamed calls after their duration', () => {
    const store = createDemoStore();
    const stop = startLive(store, { canStream: () => true });
    vi.advanceTimersByTime(30_000);
    const streamed = activeConnection(store.state.value)!.session.calls.filter((c) => c.id.startsWith('live-'));
    stop();
    expect(streamed.length).toBeGreaterThan(0);
    expect(streamed.some((c) => c.state === 'complete')).toBe(true);
  });

  it('advances the demo clock', () => {
    const store = createDemoStore();
    const start = store.state.value.now;
    const stop = startLive(store, { canStream: () => false });
    vi.advanceTimersByTime(5_000);
    expect(store.state.value.now).toBeGreaterThanOrEqual(start + 4_000);
    stop();
  });

  it('stop() clears every timer', () => {
    const store = createDemoStore();
    const stop = startLive(store, { canStream: () => true });
    vi.advanceTimersByTime(3_000);
    stop();
    const after = eventCount(store);
    vi.advanceTimersByTime(60_000);
    expect(eventCount(store)).toBe(after);
    expect(vi.getTimerCount()).toBe(0);
  });
});
