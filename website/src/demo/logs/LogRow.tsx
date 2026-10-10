import type { LogEntry } from '../model/types';
import { timeLabel } from '../model/format';
import { Highlight } from '../ui/Highlight';
import { levelLabel } from './levels';

interface LogRowProps {
  log: LogEntry;
  expanded: boolean;
  search: string;
  onToggle: () => void;
}

export function LogRow({ log, expanded, search, onToggle }: LogRowProps) {
  const hasDetail = Boolean(log.logger || log.error || log.stackTrace);
  return (
    <div class={`xr-log ${expanded ? 'is-expanded' : ''}`} role="row">
      <button type="button" class="xr-log__summary" aria-expanded={hasDetail ? expanded : undefined} onClick={onToggle}>
        <span class={`xr-level is-${log.level}`}>{levelLabel(log.level)}</span>
        <span class="xr-log__message xr-truncate">
          <Highlight text={log.message} query={search} />
        </span>
        <span class="xr-log__time">{timeLabel(log.at)}</span>
      </button>
      {expanded && (
        <div class="xr-log__detail">
          {log.logger && (
            <p class="xr-log__logger">
              Logger · <span>{log.logger}</span>
            </p>
          )}
          {log.error && <pre class="xr-log__error">{log.error}</pre>}
          {log.stackTrace && <pre class="xr-log__stack">{log.stackTrace}</pre>}
        </div>
      )}
    </div>
  );
}
