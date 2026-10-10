import type { NetworkCall } from '../model/types';
import { createInitialSession } from '../data/session';
import { discoverableApps, initialTabState, type DemoState } from '../state/demoState';
import { selectCall, closeCall } from '../state/networkActions';
import { toggleLog } from '../state/logActions';
import { selectStore } from '../state/keyValueActions';
import { addConnection, closeModal, openModal, selectConnection, selectInspector } from '../state/shellActions';
import { selectTimelineEvent } from '../state/timelineActions';
import { activeConnection, updateSession, updateTab } from '../state/access';

export interface TourStep {
  id: string;
  /** CSS selector of the area the callout points at. */
  target: string;
  title: string;
  body: string;
  /** Drives the demo into the state this step talks about, from wherever the visitor left it. */
  prepare: (state: DemoState) => DemoState;
}

const tourConnectionId = 'pixel';

/**
 * Back to a known starting point: the Pixel 8 connection (reopened if the visitor closed it), its
 * sample data restored if they cleared it, no modal and no filters.
 */
function reset(state: DemoState): DemoState {
  let next = closeModal(state);
  if (!next.connections.some((c) => c.id === tourConnectionId)) next = addConnection(next, tourConnectionId);
  next = selectConnection(next, tourConnectionId);
  const session = activeConnection(next)?.session;
  if (session && (!session.calls.length || !session.logs.length)) {
    const app = discoverableApps.find((a) => a.connectionId === tourConnectionId)!;
    next = updateSession(next, () => createInitialSession(app.seed, next.now, `${tourConnectionId}-tour`));
  }
  return updateTab(next, (tab) => ({ ...initialTabState(), inspector: tab.inspector }));
}

const findCall = (state: DemoState, match: (call: NetworkCall) => boolean) => activeConnection(state)?.session.calls.find(match);

function withCall(state: DemoState, match: (call: NetworkCall) => boolean): DemoState {
  const call = findCall(state, match);
  return call ? selectCall(state, call.id) : state;
}

export const tourSteps: TourStep[] = [
  {
    id: 'live-network',
    target: '[data-tour="network-list"]',
    title: 'Every network call, as it happens',
    body: 'Calls from Dio, http and anything on HttpClient stream in live with status, size and timing. Slow and failing calls stand out.',
    prepare: (state) => closeCall(selectInspector(reset(state), 'network')),
  },
  {
    id: 'call-detail',
    target: '[data-tour="call-detail"]',
    title: 'Headers, bodies and errors',
    body: 'Open a call to see the request and response side by side, with JSON as a tree you can fold.',
    prepare: (state) => withCall(selectInspector(reset(state), 'network'), (c) => c.status === 500),
  },
  {
    id: 'graphql-error',
    target: '[data-tour="call-detail"]',
    title: 'GraphQL, readable',
    body: 'Operations get their name, errors get their own tab, and one click shows the line in the query that failed.',
    prepare: (state) => {
      const next = withCall(selectInspector(reset(state), 'network'), (c) => Boolean(c.graphql?.errors?.length));
      return updateTab(next, (tab) => ({ ...tab, network: { ...tab.network, requestTab: 'body', responseTab: 'body' } }));
    },
  },
  {
    id: 'log-stack-trace',
    target: '[data-tour="logs-list"]',
    title: 'Logs with their stack traces',
    body: 'Search, filter by level and expand any entry for its logger, error and stack trace.',
    prepare: (state) => {
      const next = selectInspector(reset(state), 'logs');
      const log = activeConnection(next)?.session.logs.find((l) => l.level === 'error' && l.stackTrace);
      return log ? toggleLog(next, log.id) : next;
    },
  },
  {
    id: 'edit-value',
    target: '[role="dialog"]',
    title: 'Change stored values on the fly',
    body: 'Shared preferences and secure storage are editable: flip a flag or fix a JSON blob without rebuilding the app.',
    prepare: (state) => {
      const next = selectStore(selectInspector(reset(state), 'keyValue'), 'shared_preferences');
      return openModal(next, { kind: 'editValue', storeId: 'shared_preferences', key: 'dashboard_layout' });
    },
  },
  {
    id: 'timeline',
    target: '[data-tour="timeline-overview"]',
    title: 'One timeline for everything',
    body: 'Calls, logs and storage changes on one axis. Pick an event to see what else happened within two seconds.',
    prepare: (state) => {
      const next = selectInspector(reset(state), 'timeline');
      const call = findCall(next, (c) => c.status === 500);
      return call ? selectTimelineEvent(next, call.id) : next;
    },
  },
  {
    id: 'multi-device',
    target: '.xr-conn-tabs',
    title: 'Several apps and devices at once',
    body: 'Every app running the xRay SDK on your network shows up. Open as many as you like, each in its own tab.',
    prepare: (state) => selectInspector(reset(state), 'network'),
  },
];
