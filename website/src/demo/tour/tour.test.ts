import { describe, expect, it } from 'vitest';
import { activeConnection, activeTab } from '../state/access';
import { initialState, type DemoState } from '../state/demoState';
import { clearCalls, setNetworkSearch } from '../state/networkActions';
import { addConnection, closeConnection, openModal, selectConnection } from '../state/shellActions';
import { selectedCall } from '../state/selectors';
import { tourSteps } from './steps';
import { endTour, nextTourStep, previousTourStep, startTour } from './tourActions';

const startingPoints: [string, DemoState][] = [
  ['the initial state', initialState()],
  ['a filtered network list on another device', setNetworkSearch(selectConnection(initialState(), 'iphone'), 'nothing-matches')],
  ['an open modal on a third connection', openModal(addConnection(initialState(), 'macbook'), { kind: 'export' })],
];

describe.each(startingPoints)('tour steps from %s', (_, start) => {
  it.each(tourSteps.map((s) => [s.id, s] as const))('%s puts the demo in the right state', (id, step) => {
    const state = step.prepare(start);
    const tab = activeTab(state)!;
    expect(state.activeConnectionId).toBe('pixel');
    switch (id) {
      case 'live-network':
      case 'multi-device':
        expect(tab.inspector).toBe('network');
        expect(tab.network.search).toBe('');
        expect(state.modal).toBeUndefined();
        break;
      case 'call-detail':
        expect(selectedCall(state)?.status).toBe(500);
        break;
      case 'graphql-error':
        expect(selectedCall(state)?.graphql?.errors?.length).toBeGreaterThan(0);
        break;
      case 'log-stack-trace':
        expect(tab.inspector).toBe('logs');
        expect(tab.logs.expandedIds).toHaveLength(1);
        break;
      case 'edit-value':
        expect(state.modal).toEqual({ kind: 'editValue', storeId: 'shared_preferences', key: 'dashboard_layout' });
        break;
      case 'files':
        expect(tab.inspector).toBe('files');
        expect(tab.files.path).toEqual(['Documents']);
        break;
      case 'export-session':
        expect(state.modal).toEqual({ kind: 'export' });
        break;
      case 'command-menu':
        expect(state.modal).toEqual({ kind: 'commandMenu' });
        break;
      case 'device-actions':
        expect(state.drawer).toEqual({ tab: 'quick' });
        expect(state.modal).toBeUndefined();
        break;
      case 'timeline':
        expect(tab.inspector).toBe('timeline');
        expect(tab.timeline.selectedId).toBeDefined();
        break;
    }
  });
});

describe('tour navigation', () => {
  it('walks forward and back, and ends after the last step', () => {
    let state = startTour(initialState());
    expect(state.tour).toEqual({ step: 0 });
    state = nextTourStep(state);
    expect(state.tour).toEqual({ step: 1 });
    state = previousTourStep(state);
    expect(state.tour).toEqual({ step: 0 });
    for (let i = 0; i < tourSteps.length; i++) state = nextTourStep(state);
    expect(state.tour).toBeUndefined();
  });

  it('can start at a named step and closes what it opened when it ends', () => {
    const state = startTour(initialState(), 'edit-value');
    expect(state.tour).toEqual({ step: 4 });
    expect(endTour(state).modal).toBeUndefined();
  });

  it('restores the sample data when the visitor cleared it', () => {
    const state = startTour(clearCalls(initialState()), 'call-detail');
    expect(activeConnection(state)?.session.calls.length).toBeGreaterThan(0);
    expect(selectedCall(state)?.status).toBe(500);
  });

  it('reopens the Pixel 8 when the visitor closed it', () => {
    const state = startTour(closeConnection(initialState(), 'pixel'), 'call-detail');
    expect(state.activeConnectionId).toBe('pixel');
    expect(selectedCall(state)?.status).toBe(500);
  });
});
