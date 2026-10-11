import { useDemo } from '../context';
import { activeTab } from '../state/access';
import { laneCounts } from '../state/selectors';
import { setTimelineRange, setTimelineSearch, toggleLane, toggleLive } from '../state/timelineActions';
import { Chip } from '../ui/Controls';
import { Icon } from '../ui/Icon';
import { SearchField, ToolbarSeparator } from '../ui/Toolbar';
import { lanes } from './eventDisplay';

export const ranges = [10_000, 30_000, 60_000, 300_000];
const rangeLabel = (ms: number) => (ms < 60_000 ? `${ms / 1_000}s` : `${ms / 60_000}m`);

export function TimelineToolbar() {
  const { state, dispatch } = useDemo();
  const timeline = activeTab(state)!.timeline;
  const counts = laneCounts(state);
  const rangeIndex = ranges.indexOf(timeline.rangeMs);

  return (
    <div class="xr-toolbar xr-timeline-toolbar" role="toolbar">
      <div class="xr-chips is-inline" aria-label="Lanes">
        {lanes.map((lane) => (
          <Chip key={lane.id} selected={timeline.lanes.includes(lane.id)} count={counts[lane.id]} onClick={() => dispatch(toggleLane, lane.id)}>
            {lane.label}
          </Chip>
        ))}
      </div>
      <ToolbarSeparator />
      <SearchField value={timeline.search} placeholder="Filter events…" label="Filter events" onInput={(value) => dispatch(setTimelineSearch, value)} />
      <button
        type="button"
        class="xr-toolbar-button"
        aria-label={`Range ${rangeLabel(timeline.rangeMs)}, change range`}
        onClick={() => dispatch(setTimelineRange, ranges[(rangeIndex + 1) % ranges.length])}
      >
        <Icon name="chart-bar-horizontal" />
        Last {rangeLabel(timeline.rangeMs)}
      </button>
      <button type="button" class="xr-icon-button is-small" aria-label="Zoom out" disabled={rangeIndex === ranges.length - 1} onClick={() => dispatch(setTimelineRange, ranges[rangeIndex + 1])}>
        <Icon name="minus" />
      </button>
      <button type="button" class="xr-icon-button is-small" aria-label="Zoom in" disabled={rangeIndex === 0} onClick={() => dispatch(setTimelineRange, ranges[rangeIndex - 1])}>
        <Icon name="plus" />
      </button>
      <ToolbarSeparator />
      <button type="button" class={`xr-live ${timeline.live ? 'is-live' : ''}`} aria-pressed={timeline.live} onClick={() => dispatch(toggleLive)}>
        <span class="xr-live__dot" />
        {timeline.live ? 'Live' : 'Paused'}
      </button>
    </div>
  );
}
