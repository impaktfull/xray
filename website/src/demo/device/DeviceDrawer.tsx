import { useEffect, useRef } from 'preact/hooks';
import { useDemo } from '../context';
import { activeConnection } from '../state/access';
import type { DeviceTab } from '../state/demoState';
import { closeDrawer, overrideCount, resetAllOverrides, selectDrawerTab } from '../state/deviceActions';
import { Icon, type IconName } from '../ui/Icon';
import { DeepLinksTab } from './DeepLinksTab';
import { FlagsTab } from './FlagsTab';
import { PushTab } from './PushTab';
import { QuickTab } from './QuickTab';

const tabs: { id: DeviceTab; label: string; icon: IconName }[] = [
  { id: 'quick', label: 'Quick', icon: 'sliders-horizontal' },
  { id: 'deepLinks', label: 'Deep Links', icon: 'link' },
  { id: 'push', label: 'Push', icon: 'bell-simple' },
  { id: 'flags', label: 'Flags', icon: 'flag' },
];

/** Device Actions: change the running app from xRay. Every change is logged by the app. */
export function DeviceDrawer() {
  const { state, dispatch } = useDemo();
  const connection = activeConnection(state);
  const drawer = useRef<HTMLElement>(null);
  const tab = state.drawer?.tab;

  useEffect(() => {
    if (!tab) return;
    const previous = document.activeElement as HTMLElement | null;
    drawer.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !state.modal && !state.tour) dispatch(closeDrawer);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [Boolean(tab), state.modal, state.tour]);

  if (!tab || !connection) return null;
  const { device } = connection;
  const overrides = overrideCount(device);

  return (
    <aside ref={drawer} class="xr-drawer" role="dialog" aria-modal="false" aria-label="Device actions" data-tour="device-actions">
      <header class="xr-drawer__head">
        <span class="xr-drawer__device">
          <Icon name="device-mobile-camera" size={18} />
        </span>
        <span class="xr-drawer__title">
          <strong>
            {connection.appName} · {connection.deviceName}
          </strong>
          <span>
            {device.os} · v{device.appVersion} · {device.buildMode}
          </span>
        </span>
        <button type="button" class="xr-icon-button" aria-label="Close device actions" onClick={() => dispatch(closeDrawer)}>
          <Icon name="x" size={16} />
        </button>
      </header>
      <nav class="xr-drawer__tabs" role="tablist" aria-label="Device actions">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={t.id === tab} class={t.id === tab ? 'is-active' : ''} onClick={() => dispatch(selectDrawerTab, t.id)}>
            <Icon name={t.icon} size={13} />
            {t.label}
          </button>
        ))}
      </nav>
      <div class="xr-drawer__body" role="tabpanel">
        {tab === 'quick' && <QuickTab device={device} />}
        {tab === 'deepLinks' && <DeepLinksTab device={device} />}
        {tab === 'push' && <PushTab deviceName={connection.deviceName} />}
        {tab === 'flags' && <FlagsTab device={device} />}
      </div>
      <footer class="xr-drawer__footer">
        <span class={`xr-live__dot ${overrides ? 'tone-bg-warning' : 'tone-bg-success'}`} />
        <span>{overrides ? `${overrides} active override${overrides > 1 ? 's' : ''} on the device` : 'No overrides on the device'}</span>
        <span class="xr-spacer" />
        <button type="button" class="xr-button is-ghost is-small" disabled={!overrides} onClick={() => dispatch(resetAllOverrides)}>
          Reset all
        </button>
      </footer>
    </aside>
  );
}
