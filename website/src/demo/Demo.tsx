import { useEffect, useMemo, useRef } from 'preact/hooks';
import { DemoContext } from './context';
import { Window } from './shell/Window';
import { startLive } from './state/live';
import { createDemoStore } from './state/store';
import './styles/tokens.css';
import './styles/demo.css';
import './styles/inspectors.css';

/** The interactive xRay desktop app, rebuilt for the website with made-up data. */
export default function Demo() {
  const store = useMemo(() => createDemoStore(), []);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let onScreen = false;
    const observer = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting), { threshold: 0.2 });
    if (root.current) observer.observe(root.current);
    const stop = startLive(store, { canStream: () => onScreen && document.visibilityState === 'visible' });
    return () => {
      stop();
      observer.disconnect();
    };
  }, [store]);

  return (
    <DemoContext.Provider value={store}>
      <div ref={root} class="xr-demo" role="region" aria-label="Interactive demo of the xRay desktop app" aria-describedby="xr-demo-description">
        <p id="xr-demo-description" class="xr-sr-only">
          A working copy of the xRay desktop app connected to a sample app. Click around: open network calls, read logs, edit stored values and scrub the timeline.
        </p>
        <Window />
      </div>
    </DemoContext.Provider>
  );
}
