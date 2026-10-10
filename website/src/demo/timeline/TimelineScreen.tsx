import { useDemo } from '../context';
import { activeTab } from '../state/access';
import { allTimelineEvents } from '../state/selectors';
import { EmptyState } from '../ui/EmptyState';
import { EventDetail } from './EventDetail';
import { EventStream } from './EventStream';
import { Swimlanes } from './Swimlanes';
import { TimelineToolbar } from './TimelineToolbar';

export function TimelineScreen() {
  const { state } = useDemo();
  const hasEvents = allTimelineEvents(state).length > 0;
  const selected = activeTab(state)!.timeline.selectedId;
  return (
    <>
      <TimelineToolbar />
      {hasEvents ? (
        <>
          <Swimlanes />
          <div class="xr-timeline-body">
            <EventStream />
            {selected && <EventDetail />}
          </div>
        </>
      ) : (
        <EmptyState icon="chart-bar-horizontal" title="Nothing captured yet" message="Network calls, logs and key-value changes appear here on one timeline." />
      )}
    </>
  );
}
