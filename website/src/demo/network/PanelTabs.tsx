import type { PanelTab } from '../state/demoState';
import { Icon } from '../ui/Icon';

interface PanelTabsProps {
  side: 'request' | 'response';
  tabs: { id: PanelTab; label: string }[];
  current: PanelTab;
  onSelect: (tab: PanelTab) => void;
}

export function PanelTabs({ side, tabs, current, onSelect }: PanelTabsProps) {
  return (
    <div class={`xr-panel-tabs is-${side}`}>
      <div role="tablist" aria-label={side === 'request' ? 'Request' : 'Response'}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === current}
            class={`xr-panel-tab ${tab.id === current ? 'is-active' : ''}`}
            onClick={() => onSelect(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <span class="xr-panel-tabs__label">
        <Icon name={side === 'request' ? 'arrow-up-right' : 'arrow-down-left'} />
        {side === 'request' ? 'Request' : 'Response'}
      </span>
    </div>
  );
}
