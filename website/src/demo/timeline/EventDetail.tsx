import { Fragment } from 'preact';
import { useDemo } from '../context';
import { timeTenthsLabel } from '../model/format';
import { selectCall } from '../state/networkActions';
import { toggleLog, setLogSearch } from '../state/logActions';
import { eventsAround, selectedTimelineEvent, type TimelineEvent } from '../state/selectors';
import { openModal, selectInspector } from '../state/shellActions';
import { closeTimelineEvent, selectTimelineEvent } from '../state/timelineActions';
import { selectStore } from '../state/keyValueActions';
import { Icon } from '../ui/Icon';
import { levelLabel } from '../logs/levels';
import { eventMeta, eventTitle, eventTone, lanes } from './eventDisplay';

export function EventDetail() {
  const { state, dispatch } = useDemo();
  const event = selectedTimelineEvent(state);
  if (!event) return null;
  const lane = lanes.find((l) => l.id === event.lane)!;
  const around = eventsAround(state, event.id);

  const openInInspector = () => {
    if (event.lane === 'network') {
      dispatch(selectInspector, 'network');
      dispatch(selectCall, event.id);
    } else if (event.lane === 'logs') {
      dispatch(selectInspector, 'logs');
      dispatch(setLogSearch, '');
      dispatch(toggleLog, event.id);
    } else {
      dispatch(selectInspector, 'keyValue');
      dispatch(selectStore, event.change.store);
      if (event.change.after !== undefined) dispatch(openModal, { kind: 'editValue', storeId: event.change.store, key: event.change.key });
    }
  };

  return (
    <aside class="xr-event-detail" aria-label="Event detail" data-tour="timeline-detail">
      <header class="xr-event-detail__head">
        <p class="xr-event-detail__meta">
          <Icon name={lane.icon} size={13} class={lane.tone} />
          {event.lane === 'logs' ? <span class={`xr-level is-${event.log.level} is-compact`}>{levelLabel(event.log.level)}</span> : <span>{lane.label}</span>}
          <span class="xr-mono">{timeTenthsLabel(event.at)}</span>
          <button type="button" class="xr-icon-button is-small" aria-label="Close event detail" onClick={() => dispatch(closeTimelineEvent)}>
            <Icon name="x" />
          </button>
        </p>
        <h3>{eventTitle(event)}</h3>
      </header>
      <EventBody event={event} />
      <section>
        <p class="xr-section-title">
          Around this event <span>±2 s · {around.length} related</span>
        </p>
        <ul class="xr-around">
          {around.slice(0, 6).map((other) => (
            <li key={other.id}>
              <button type="button" onClick={() => dispatch(selectTimelineEvent, other.id)}>
                <span class={`xr-around__dot tone-bg-${eventTone(other)}`} />
                <span class="xr-truncate">{eventTitle(other)}</span>
                <span class="xr-mono is-muted">{relative(other.at - event.at)}</span>
              </button>
            </li>
          ))}
          {!around.length && <li class="is-muted">Nothing else happened within 2 seconds.</li>}
        </ul>
      </section>
      <button type="button" class="xr-button is-outline" onClick={openInInspector}>
        Open in {lane.label}
      </button>
    </aside>
  );
}

function relative(ms: number) {
  if (ms === 0) return '0';
  const sign = ms < 0 ? '−' : '+';
  const abs = Math.abs(ms);
  return abs < 1_000 ? `${sign}${abs} ms` : `${sign}${(abs / 1_000).toFixed(2)} s`;
}

function EventBody({ event }: { event: TimelineEvent }) {
  if (event.lane === 'network') {
    const { call } = event;
    return (
      <dl class="xr-event-detail__body">
        <dt>URL</dt>
        <dd class="xr-mono">{call.url}</dd>
        <dt>Outcome</dt>
        <dd class={`xr-mono tone-${eventTone(event)}`}>{eventMeta(event)}</dd>
        {call.error && (
          <>
            <dt>Error</dt>
            <dd class="xr-mono tone-error">{call.error}</dd>
          </>
        )}
        {call.graphql?.errors?.map((error, i) => (
          <Fragment key={i}>
            <dt>GraphQL error</dt>
            <dd class="tone-error">{error.message}</dd>
          </Fragment>
        ))}
      </dl>
    );
  }
  if (event.lane === 'logs') {
    const { log } = event;
    return (
      <div class="xr-event-detail__body">
        {log.error && <pre class="xr-log__error">{log.error}</pre>}
        {log.stackTrace && <pre class="xr-log__stack">{log.stackTrace}</pre>}
        {!log.error && !log.stackTrace && <p class="is-muted">{log.logger ? `Logged by ${log.logger}` : 'No details'}</p>}
      </div>
    );
  }
  const { change } = event;
  return (
    <dl class="xr-event-detail__body">
      <dt>Store</dt>
      <dd>{change.store === 'secure_storage' ? 'Secure storage' : 'SharedPreferences'}</dd>
      <dt>Before → After</dt>
      <dd class="xr-mono">
        <span class="tone-error">{String(change.before ?? '∅')}</span> → <span class="tone-success">{String(change.after ?? '∅')}</span>
      </dd>
    </dl>
  );
}
