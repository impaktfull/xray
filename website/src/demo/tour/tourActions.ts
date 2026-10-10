import type { DemoState } from '../state/demoState';
import { tourSteps } from './steps';

const goTo = (state: DemoState, step: number): DemoState => ({ ...tourSteps[step].prepare(state), tour: { step } });

export const startTour = (state: DemoState, stepId?: string): DemoState =>
  goTo(state, Math.max(0, tourSteps.findIndex((s) => s.id === stepId)));

export const nextTourStep = (state: DemoState): DemoState =>
  state.tour && state.tour.step < tourSteps.length - 1 ? goTo(state, state.tour.step + 1) : endTour(state);

export const previousTourStep = (state: DemoState): DemoState => (state.tour && state.tour.step > 0 ? goTo(state, state.tour.step - 1) : state);

/** Ends the tour and closes anything the tour opened. */
export const endTour = (state: DemoState): DemoState => ({ ...state, tour: undefined, modal: undefined });
