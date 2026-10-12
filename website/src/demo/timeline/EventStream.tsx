import { useDemo } from '../context';
import { timeTenthsLabel } from '../model/format';
import { activeTab } from '../state/access';
import { timelineEvents } from '../state/selectors';
import { selectTimelineEvent } from '../state/timelineActions';
import { Icon } from '../ui/Icon';
import { levelLabel } from '../logs/levels';
import { eventMeta, eventTitle, eventTone, isErrorEvent, lanes } from './eventDisplay';

export function EventStream() {
  const { state, dispatch } = useDemo();
  const selectedId = activeTab(state)!.timeline.selectedId;
  const events = timelineEvents(state).slice(0, 200);

  return (
    <div class="xr-stream" role="listbox" aria-label="Events">
      {events.map((event) => {
        const lane = lanes.find((l) => l.id === event.lane)!;
        const selected = event.id === selectedId;
        return (
          <button
            key={event.id}
            type="button"
            role="option"
            aria-selected={selected}
            class={`xr-stream__row ${selected ? 'is-selected' : ''} ${selected && isErrorEvent(event) ? 'is-error' : ''}`}
            onClick={() => dispatch(selectTimelineEvent, event.id)}
          >
            <span class="xr-stream__time">{timeTenthsLabel(event.at)}</span>
            <Icon name={lane.icon} size={13} class={lane.tone} />
            {event.lane === 'logs' && <span class={`xr-level is-${event.log.level} is-compact`}>{levelLabel(event.log.level)}</span>}
            <span class="xr-stream__summary xr-truncate">{eventTitle(event)}</span>
            <span class={`xr-stream__meta tone-${eventTone(event)}`}>{eventMeta(event)}</span>
          </button>
        );
      })}
    </div>
  );
}
