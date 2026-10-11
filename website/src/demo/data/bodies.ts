import type { Body } from '../model/types';

const utf8Length = (text: string) => new TextEncoder().encode(text).length;

/** Pretty-printed for the Raw view, but sized as the compact JSON that went over the wire. */
export const json = (value: unknown): Body => ({
  kind: 'json',
  text: JSON.stringify(value, null, 2),
  bytes: utf8Length(JSON.stringify(value)),
});

export const text = (value: string): Body => ({ kind: 'text', text: value, bytes: utf8Length(value) });

export const image = (bytes: number): Body => ({ kind: 'image', bytes });

export const none: Body = { kind: 'none', bytes: 0 };
