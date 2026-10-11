import { describe, expect, it } from 'vitest';
import { createIds } from './events';
import { createRng } from './seed';
import { createInitialSession } from './session';
import { nextEvent } from './stream';

const now = Date.UTC(2026, 9, 10, 14, 3, 7);

describe('createInitialSession', () => {
  const session = createInitialSession(42, now);

  it('is deterministic for a seed, so the build-time frame matches the browser', () => {
    expect(createInitialSession(42, now)).toEqual(session);
  });

  it('tells the whole story', () => {
    expect(session.calls.some((c) => c.status === 500)).toBe(true);
    expect(session.calls.some((c) => c.state === 'failed')).toBe(true);
    expect(session.calls.some((c) => c.state === 'pending')).toBe(true);
    expect(session.calls.some((c) => (c.durationMs ?? 0) > 1_000)).toBe(true);
    expect(session.calls.some((c) => c.graphql?.errors?.length)).toBe(true);
    expect(session.calls.some((c) => c.responseBody.kind === 'image')).toBe(true);
    expect(session.logs.some((l) => l.stackTrace)).toBe(true);
    expect(new Set(session.logs.map((l) => l.level)).size).toBeGreaterThanOrEqual(5);
    expect(session.stores.map((s) => s.id)).toEqual(['shared_preferences', 'secure_storage']);
    expect(session.kvChanges.length).toBeGreaterThan(0);
  });

  it('keeps every list newest first', () => {
    const sorted = (xs: { at: number }[]) => xs.every((x, i) => i === 0 || xs[i - 1].at >= x.at);
    expect(sorted(session.calls)).toBe(true);
    expect(sorted(session.logs)).toBe(true);
    expect(sorted(session.kvChanges)).toBe(true);
  });

  it('applies recorded key-value changes to the stores', () => {
    const prefs = session.stores[0].entries;
    expect(prefs.find((e) => e.key === 'theme_mode')?.value).toBe('dark');
    expect(prefs.find((e) => e.key === 'last_project_id')?.value).toBe(42);
  });

  it('gives every item a unique id', () => {
    const ids = [...session.calls, ...session.logs, ...session.kvChanges].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only contains made-up data', () => {
    const text = JSON.stringify(session);
    expect(text).not.toMatch(/@impaktfull\.com|xray_closed_source|vanlooveren/i);
  });
});

describe('nextEvent', () => {
  it('produces calls that start pending and complete with a status', () => {
    const rng = createRng(7);
    const ids = createIds('live');
    const session = createInitialSession(42, now);
    const events = Array.from({ length: 40 }, (_, i) => nextEvent(rng, ids, now + i * 3_000, session));
    const calls = events.flatMap((e) => e.calls);
    expect(calls.length).toBeGreaterThan(10);
    for (const { pending, complete } of calls) {
      expect(pending.state).toBe('pending');
      expect(complete.state).not.toBe('pending');
      expect(complete.id).toBe(pending.id);
    }
    expect(events.some((e) => e.logs.length > 0)).toBe(true);
  });
});
