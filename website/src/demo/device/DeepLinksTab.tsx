import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import type { DeviceState } from '../model/types';
import { openDeepLink } from '../state/deviceActions';
import { Icon } from '../ui/Icon';

export function DeepLinksTab({ device }: { device: DeviceState }) {
  const { dispatch } = useDemo();
  const [url, setUrl] = useState('myapp://projects/42');
  const valid = /^([a-z][a-z0-9+.-]*):\/\/\S+$/i.test(url.trim());
  const open = (link: string) => {
    setUrl(link);
    dispatch(openDeepLink, link);
  };

  return (
    <div class="xr-device-sections">
      <section>
        <p class="xr-device-label">
          <span>Open a link</span>
        </p>
        <form
          class="xr-manual__fields"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) open(url.trim());
          }}
        >
          <input class="xr-input" aria-label="Deep link" placeholder="myapp://path or https://…" value={url} onInput={(e) => setUrl((e.currentTarget as HTMLInputElement).value)} />
          <button type="submit" class="xr-button is-primary" disabled={!valid}>
            Open
          </button>
        </form>
      </section>
      <section>
        <p class="xr-device-label">
          <span>Routes reported by the app</span>
        </p>
        <ul class="xr-route-list">
          {device.routes.map((route) => (
            <li key={route}>
              <span class="xr-mono">{route}</span>
              <button type="button" class="xr-link" onClick={() => setUrl(`myapp:/${route.replace(':id', '42')}`)}>
                Use
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <p class="xr-device-label">
          <span>Recent</span>
        </p>
        <ul class="xr-route-list">
          {device.recentLinks.map((link) => (
            <li key={link}>
              <Icon name="link" size={12} />
              <span class="xr-mono xr-truncate">{link}</span>
              <button type="button" class="xr-link" onClick={() => open(link)}>
                Open again
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
