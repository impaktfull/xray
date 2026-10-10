import type { DemoState } from './demoState';
import { updateTab } from './access';

export const openFolder = (state: DemoState, name: string): DemoState =>
  updateTab(state, (tab) => ({ ...tab, files: { path: [...tab.files.path, name] } }));

export const goUp = (state: DemoState): DemoState =>
  updateTab(state, (tab) => ({ ...tab, files: { path: tab.files.path.slice(0, -1) } }));

export const goToPath = (state: DemoState, depth: number): DemoState =>
  updateTab(state, (tab) => ({ ...tab, files: { path: tab.files.path.slice(0, depth) } }));
