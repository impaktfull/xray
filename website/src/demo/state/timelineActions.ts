import type { DemoState, Lane } from './demoState';
import { updateTab } from './access';

const updateTimeline = (state: DemoState, update: (timeline: DemoState['tabs'][string]['timeline']) => Partial<DemoState['tabs'][string]['timeline']>) =>
  updateTab(state, (tab) => ({ ...tab, timeline: { ...tab.timeline, ...update(tab.timeline) } }));

/** Selecting an event pauses Live, so the selection doesn't scroll away. */
export const selectTimelineEvent = (state: DemoState, eventId: string): DemoState =>
  updateTimeline(state, () => ({ selectedId: eventId, live: false }));

export const closeTimelineEvent = (state: DemoState): DemoState => updateTimeline(state, () => ({ selectedId: undefined }));

export const toggleLane = (state: DemoState, lane: Lane): DemoState =>
  updateTimeline(state, ({ lanes }) => ({ lanes: lanes.includes(lane) ? lanes.filter((l) => l !== lane) : [...lanes, lane] }));

export const setTimelineRange = (state: DemoState, rangeMs: number): DemoState => updateTimeline(state, () => ({ rangeMs }));

export const setTimelineSearch = (state: DemoState, search: string): DemoState => updateTimeline(state, () => ({ search }));

/** Going live again drops the selection, so the newest events are in view. */
export const toggleLive = (state: DemoState): DemoState =>
  updateTimeline(state, ({ live, selectedId }) => ({ live: !live, selectedId: live ? selectedId : undefined }));
