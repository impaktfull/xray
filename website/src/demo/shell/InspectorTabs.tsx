import { useDemo } from '../context';
import { activeTab } from '../state/access';
import type { InspectorTab } from '../state/demoState';
import { selectInspector } from '../state/shellActions';
import { Icon, type IconName } from '../ui/Icon';

const tabs: { id: InspectorTab; label: string; icon: IconName }[] = [
  { id: 'timeline', label: 'Timeline', icon: 'chart-bar-horizontal' },
  { id: 'network', label: 'Network', icon: 'wifi-high' },
  { id: 'logs', label: 'Logs', icon: 'file-text' },
  { id: 'keyValue', label: 'Key-Value', icon: 'database' },
  { id: 'files', label: 'Files', icon: 'folder' },
];

export function InspectorTabs() {
  const { state, dispatch } = useDemo();
  const current = activeTab(state)?.inspector;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const index = tabs.findIndex((t) => t.id === current);
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    dispatch(selectInspector, next.id);
    (event.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-inspector="${next.id}"]`)?.focus();
  };

  return (
    <nav class="xr-inspector-tabs" role="tablist" aria-label="Inspectors" onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          data-inspector={tab.id}
          data-tour={`tab-${tab.id}`}
          aria-selected={tab.id === current}
          tabIndex={tab.id === current ? 0 : -1}
          class={`xr-inspector-tab ${tab.id === current ? 'is-active' : ''}`}
          onClick={() => dispatch(selectInspector, tab.id)}
        >
          <Icon name={tab.icon} />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
