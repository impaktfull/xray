import { describe, expect, it } from 'vitest';
import {
  bodySizeLabel,
  durationLabel,
  isErrorOutcome,
  isSlow,
  methodTone,
  pathLabel,
  sizeLabel,
  statusLabel,
  statusTone,
  timeLabel,
} from './format';

describe('durationLabel', () => {
  it('uses ms below a second and s with one decimal above', () => {
    expect(durationLabel(124)).toBe('124 ms');
    expect(durationLabel(1_240)).toBe('1.2 s');
    expect(durationLabel(undefined)).toBeUndefined();
  });
});

describe('sizeLabel', () => {
  it('shows bytes below 100 B and kB above, like the network table', () => {
    expect(sizeLabel(42)).toBe('42 B');
    expect(sizeLabel(1_230)).toBe('1.2 kB');
    expect(sizeLabel(4_800_000)).toBe('4687.5 kB');
  });
});

describe('bodySizeLabel', () => {
  it('formats B, KB and MB like the body tabs', () => {
    expect(bodySizeLabel(812)).toBe('812 B');
    expect(bodySizeLabel(1_536)).toBe('1.5 KB');
    expect(bodySizeLabel(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('timeLabel', () => {
  it('formats a timestamp as HH:MM:SS in local time', () => {
    expect(timeLabel(new Date(2026, 9, 10, 14, 3, 7, 450).getTime())).toBe('14:03:07');
  });
});

describe('statusTone', () => {
  it('maps outcomes to tones', () => {
    expect(statusTone({ state: 'complete', status: 204 })).toBe('success');
    expect(statusTone({ state: 'complete', status: 304 })).toBe('info');
    expect(statusTone({ state: 'complete', status: 404 })).toBe('warning');
    expect(statusTone({ state: 'pending' })).toBe('warning');
    expect(statusTone({ state: 'complete', status: 500 })).toBe('error');
    expect(statusTone({ state: 'failed' })).toBe('error');
  });
});

describe('statusLabel', () => {
  it('shows the code, an ellipsis while pending and ERR when failed', () => {
    expect(statusLabel({ state: 'complete', status: 201 })).toBe('201');
    expect(statusLabel({ state: 'pending' })).toBe('…');
    expect(statusLabel({ state: 'failed' })).toBe('ERR');
  });
});

describe('methodTone', () => {
  it('matches the desktop app colours', () => {
    expect(methodTone('GET')).toBe('get');
    expect(methodTone('DELETE')).toBe('delete');
  });
});

describe('isSlow and isErrorOutcome', () => {
  it('flags calls over a second and failed or 5xx calls', () => {
    expect(isSlow({ durationMs: 1_001 })).toBe(true);
    expect(isSlow({ durationMs: 1_000 })).toBe(false);
    expect(isErrorOutcome({ state: 'complete', status: 503 })).toBe(true);
    expect(isErrorOutcome({ state: 'failed' })).toBe(true);
    expect(isErrorOutcome({ state: 'complete', status: 404 })).toBe(false);
  });
});

describe('pathLabel', () => {
  it('keeps path and query, drops the host', () => {
    expect(pathLabel('https://api.impaktfull.dev/api/v1/projects?page=1')).toBe('/api/v1/projects?page=1');
    expect(pathLabel('not a url')).toBe('not a url');
  });
});
