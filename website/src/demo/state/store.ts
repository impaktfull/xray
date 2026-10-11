import { signal, type Signal } from '@preact/signals';
import { initialState, type DemoState } from './demoState';

export type Action<Args extends unknown[] = []> = (state: DemoState, ...args: Args) => DemoState;

export interface DemoStore {
  state: Signal<DemoState>;
  dispatch<Args extends unknown[]>(action: Action<Args>, ...args: Args): void;
}

/** One store per mounted demo; actions are the pure functions in this folder. */
export function createDemoStore(state = initialState()): DemoStore {
  const current = signal(state);
  return {
    state: current,
    dispatch(action, ...args) {
      current.value = action(current.value, ...args);
    },
  };
}
