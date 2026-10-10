import { durationLabel, isErrorOutcome, isSlow, statusTone, timeLabel } from '../model/format';
import type { LogLevel } from '../model/types';
import type { Lane } from '../state/demoState';
import { timelineSummary, type TimelineEvent } from '../state/selectors';
import type { IconName } from '../ui/Icon';

export const lanes: { id: Lane; label: string; icon: IconName; tone: string }[] = [
  { id: 'network', label: 'Network', icon: 'wifi-high', tone: 'tone-info' },
  { id: 'logs', label: 'Logs', icon: 'file-text', tone: 'tone-warning' },
  { id: 'keyValue', label: 'Key-Value', icon: 'database', tone: 'is-accent' },
];

const levelTone: Record<LogLevel, string> = {
  fatal: 'error',
  error: 'error',
  warn: 'warning',
  info: 'info',
  success: 'success',
  debug: 'muted',
};

/** Colour of an event's mark and meta: outcome for calls, level for logs, removal for key-value. */
export function eventTone(event: TimelineEvent): string {
  switch (event.lane) {
    case 'network':
      if (event.call.state === 'pending') return 'muted';
      if (event.call.graphql?.errors?.length) return 'error';
      return isSlow(event.call) && !isErrorOutcome(event.call) ? 'warning' : statusTone(event.call);
    case 'logs':
      return levelTone[event.log.level];
    case 'keyValue':
      return event.change.after === undefined ? 'error' : 'accent';
  }
}

export function eventMeta(event: TimelineEvent): string {
  switch (event.lane) {
    case 'network': {
      const { call } = event;
      if (call.state === 'pending') return 'pending';
      if (call.state === 'failed') return 'failed';
      return `${call.status} · ${durationLabel(call.durationMs)}`;
    }
    case 'logs':
      return event.log.logger ?? '';
    case 'keyValue':
      return event.change.after === undefined ? 'removed' : event.change.store === 'secure_storage' ? 'secure' : 'prefs';
  }
}

export const eventTitle = (event: TimelineEvent) => timelineSummary(event);

export const isErrorEvent = (event: TimelineEvent) => eventTone(event) === 'error';

export const clockLabel = timeLabel;
