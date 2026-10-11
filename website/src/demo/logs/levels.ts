import type { LogLevel } from '../model/types';

export const levels: { id: LogLevel; label: string }[] = [
  { id: 'fatal', label: 'FATAL' },
  { id: 'error', label: 'ERROR' },
  { id: 'warn', label: 'WARN' },
  { id: 'info', label: 'INFO' },
  { id: 'success', label: 'SUCCESS' },
  { id: 'debug', label: 'DEBUG' },
];

export const levelLabel = (level: LogLevel) => levels.find((l) => l.id === level)!.label;
