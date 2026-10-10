import { useCompact } from '../compact';
import { useDemo } from '../context';
import { activeTab } from '../state/access';
import { selectedTimelineEvent, timelineEvents, type TimelineEvent } from '../state/selectors';
import { selectTimelineEvent } from '../state/timelineActions';
import { Icon } from '../ui/Icon';
import { clockLabel, eventTone, eventTitle, lanes } from './eventDisplay';

const aroundMs = 2_000;

/** The overview: one track per lane over the selected range, ending now (or around the selection). */
export function Swimlanes() {
  const { state, dispatch } = useDemo();
  const compact = useCompact();
  const timeline = activeTab(state)!.timeline;
  const selected = selectedTimelineEvent(state);
  const range = timeline.rangeMs;
  const end = selected && !timeline.live ? Math.min(state.now, selected.at + range / 2) : state.now;
  const start = end - range;
  const x = (at: number) => ((at - start) / range) * 100;
  const events = timelineEvents(state).filter((e) => e.at >= start - 5_000 && e.at <= end);
  const tickCount = compact ? 4 : 6;
  const ticks = Array.from({ length: tickCount }, (_, i) => start + (range / (tickCount - 1)) * i);

  const mark = (event: TimelineEvent) => {
    const tone = eventTone(event);
    const left = `${Math.max(0, x(event.at))}%`;
    const common = {
      key: event.id,
      type: 'button' as const,
      'aria-label': `${clockLabel(event.at)} ${eventTitle(event)}`,
      onClick: () => dispatch(selectTimelineEvent, event.id),
    };
    if (event.lane === 'network') {
      const width = Math.max(0.4, ((event.call.durationMs ?? (event.call.state === 'pending' ? state.now - event.at : 300)) / range) * 100);
      return <button {...common} class={`xr-mark-bar tone-bg-${tone}`} style={{ left, width: `${width}%` }} />;
    }
    if (event.lane === 'logs') return <button {...common} class={`xr-mark-tick tone-bg-${tone}`} style={{ left }} />;
    return <button {...common} class={`xr-mark-dot tone-bg-${tone}`} style={{ left }} />;
  };

  return (
    <div class="xr-overview" data-tour="timeline-overview">
      <div class="xr-overview__axis" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t} style={{ left: `${x(t)}%` }}>
            {clockLabel(t)}
          </span>
        ))}
      </div>
      {lanes
        .filter((lane) => timeline.lanes.includes(lane.id))
        .map((lane) => (
          <div key={lane.id} class="xr-lane">
            <span class="xr-lane__label">
              <Icon name={lane.icon} size={13} class={lane.tone} />
              {lane.label}
            </span>
            <div class="xr-lane__track">{events.filter((e) => e.lane === lane.id).map(mark)}</div>
          </div>
        ))}
      {selected && selected.at >= start && (
        <div class="xr-overview__selection" aria-hidden="true">
          <span class="xr-brush" style={{ left: `${x(selected.at - aroundMs)}%`, width: `${((aroundMs * 2) / range) * 100}%` }} />
          <span class="xr-cursor" style={{ left: `${x(selected.at)}%` }} />
        </div>
      )}
    </div>
  );
}
