import { describe, expect, it } from 'vitest';
import { activeTab } from '../state/access';
import { initialState } from '../state/demoState';
import { selectedCall } from '../state/selectors';
import { commandSections, runCommand } from './commands';

const titles = (query: string) => commandSections(initialState(), query).map((s) => s.title);
const item = (query: string, id: string) => commandSections(initialState(), query).flatMap((s) => s.items).find((i) => i.id === id)!;

describe('commandSections', () => {
  it('shows the command sections when the query is empty', () => {
    expect(titles('')).toEqual(['Suggested', 'Go to', 'Connections', 'General']);
  });

  it('searches calls, logs and keys, at most five per group, with the total count', () => {
    const sections = commandSections(initialState(), 'projects');
    const network = sections.find((s) => s.title === 'Network')!;
    expect(network.items.length).toBeLessThanOrEqual(5);
    expect(network.count).toBeGreaterThan(network.items.length);
    expect(sections.at(-1)!.items.at(-1)!.label).toBe('Filter network calls by "projects"');
  });

  it('limits to commands after ">"', () => {
    expect(titles('> clear')).toEqual(['Suggested']);
  });

  it('marks Settings as not available in the demo', () => {
    expect(item('', 'settings').unavailable).toBe(true);
  });
});

describe('runCommand', () => {
  it('opens a found call in the network inspector and closes the menu', () => {
    const s0 = { ...initialState(), modal: { kind: 'commandMenu' as const } };
    const call = commandSections(s0, 'ArchiveProject').find((s) => s.title === 'Network')!.items[0];
    const s = runCommand(s0, call);
    expect(s.modal).toBeUndefined();
    expect(activeTab(s)!.inspector).toBe('network');
    expect(selectedCall(s)?.graphql?.operationName).toBe('ArchiveProject');
  });

  it('opens the device actions drawer on the right tab', () => {
    expect(runCommand(initialState(), item('', 'deep-link')).drawer).toEqual({ tab: 'deepLinks' });
  });

  it('does nothing for items that are not in the demo', () => {
    const s0 = { ...initialState(), modal: { kind: 'commandMenu' as const } };
    expect(runCommand(s0, item('', 'settings'))).toBe(s0);
  });
});
