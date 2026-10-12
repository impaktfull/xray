import { useEffect, useState } from 'preact/hooks';
import { useDemo } from '../context';
import { discoverableApps } from '../state/demoState';
import { addConnection, closeModal, showToast } from '../state/shellActions';
import { Icon, type IconName } from '../ui/Icon';
import { Modal } from '../ui/Modal';

const platformIcon: Record<string, IconName> = { android: 'android-logo', ios: 'apple-logo', macos: 'desktop' };

export function AddConnectionModal() {
  const { state, dispatch } = useDemo();
  const [searching, setSearching] = useState(true);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('7780');

  useEffect(() => {
    if (!searching) return;
    const timer = setTimeout(() => setSearching(false), 1_200);
    return () => clearTimeout(timer);
  }, [searching]);

  const validHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(host.trim()) || host.trim() === 'localhost';
  const validPort = /^\d{2,5}$/.test(port) && Number(port) <= 65_535;

  return (
    <Modal title="Add Connection" width={520} onClose={() => dispatch(closeModal)}>
      <section class="xr-discovery" aria-busy={searching}>
        <header class="xr-discovery__head">
          <span>Discovered on your network</span>
          <span class="xr-discovery__count">{searching ? 'Searching…' : `${discoverableApps.length} found`}</span>
          <span class="xr-spacer" />
          <span class="xr-port-chip">UDP port 7781</span>
          <button type="button" class="xr-toolbar-button" disabled={searching} onClick={() => setSearching(true)}>
            <Icon name="arrow-clockwise" />
            Rescan
          </button>
        </header>
        {searching ? (
          <p class="xr-discovery__searching">
            <span class="xr-spinner" aria-hidden="true" />
            Looking for apps on your network…
          </p>
        ) : (
          <ul class="xr-discovery__list">
            {discoverableApps.map((app) => {
              const open = state.connections.some((c) => c.id === app.connectionId);
              return (
                <li key={app.connectionId} class="xr-discovery__app">
                  <span class="xr-discovery__platform">
                    <Icon name={platformIcon[app.platform]} size={16} />
                  </span>
                  <span class="xr-discovery__name">
                    <strong>{app.appName}</strong>
                    <span>{app.deviceName}</span>
                  </span>
                  {open ? (
                    <span class="xr-discovery__open">Already open</span>
                  ) : (
                    <button
                      type="button"
                      class="xr-button is-primary is-small"
                      aria-label={`Connect to ${app.appName} on ${app.deviceName}`}
                      onClick={() => dispatch(addConnection, app.connectionId)}
                    >
                      Connect
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <form
        class="xr-manual"
        onSubmit={(e) => {
          e.preventDefault();
          dispatch(closeModal);
          dispatch(showToast, `No xRay app answered on ${host}:${port}. This is a demo, try a discovered app.`);
        }}
      >
        <p class="xr-section-title">Or connect manually</p>
        <div class="xr-manual__fields">
          <input class="xr-input" aria-label="Host" placeholder="192.168.1.100" value={host} onInput={(e) => setHost((e.currentTarget as HTMLInputElement).value)} />
          <input class="xr-input is-port" aria-label="Port" placeholder="7780" inputMode="numeric" value={port} onInput={(e) => setPort((e.currentTarget as HTMLInputElement).value)} />
          <button type="submit" class="xr-button is-outline" disabled={!validHost || !validPort}>
            Connect
          </button>
        </div>
      </form>
    </Modal>
  );
}
