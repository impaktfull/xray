import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { DemoState } from './state/demoState';
import type { Action, DemoStore } from './state/store';

export const DemoContext = createContext<DemoStore | null>(null);

/** Reading `state` subscribes the component to the demo's signal, so it re-renders on change. */
export function useDemo(): { state: DemoState; dispatch: <Args extends unknown[]>(action: Action<Args>, ...args: Args) => void } {
  const store = useContext(DemoContext);
  if (!store) throw new Error('useDemo must be used inside <Demo>');
  return { state: store.state.value, dispatch: store.dispatch };
}
