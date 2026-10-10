import type { CallState, HttpMethod } from './types';

// Formatting mirrors the desktop app (network_call_display.dart, xray_body_size.dart,
// date_format_util.dart) so the demo reads exactly like the product.

const slowThresholdMs = 1_000;

interface Outcome {
  state: CallState;
  status?: number;
}

export type Tone = 'success' | 'info' | 'warning' | 'error';

export function durationLabel(ms: number | undefined): string | undefined {
  if (ms === undefined) return undefined;
  if (ms < 1_000) return `${ms} ms`;
  return `${(ms / 1_000).toFixed(1)} s`;
}

/** Bytes below 100 B, where one decimal of kB would read "0.0 kB". */
export function sizeLabel(bytes: number): string {
  if (bytes < 100) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} kB`;
}

export function bodySizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const two = (value: number) => String(value).padStart(2, '0');

// The demo runs on its own clock in UTC, so the page rendered at build time and the visitor's
// browser show the same times whatever their timezone.
export function timeLabel(epochMs: number): string {
  const d = new Date(epochMs);
  return `${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())}`;
}

export function timeTenthsLabel(epochMs: number): string {
  return `${timeLabel(epochMs)}.${Math.floor(new Date(epochMs).getUTCMilliseconds() / 100)}`;
}

export function statusTone({ state, status }: Outcome): Tone {
  if (state === 'failed') return 'error';
  if (state === 'pending' || status === undefined) return 'warning';
  if (status >= 500) return 'error';
  if (status >= 400) return 'warning';
  if (status >= 200 && status < 300) return 'success';
  return 'info';
}

export function statusLabel({ state, status }: Outcome): string {
  if (state === 'failed') return 'ERR';
  if (state === 'pending' || status === undefined) return '…';
  return String(status);
}

export function methodTone(method: HttpMethod): Lowercase<HttpMethod> {
  return method.toLowerCase() as Lowercase<HttpMethod>;
}

export function isSlow({ durationMs }: { durationMs?: number }): boolean {
  return (durationMs ?? 0) > slowThresholdMs;
}

export function isErrorOutcome({ state, status }: Outcome): boolean {
  return state === 'failed' || (status ?? 0) >= 500;
}

/** Path and query, which is what tells calls to the same API apart. */
export function pathLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}
