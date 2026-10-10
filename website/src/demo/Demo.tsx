import { useEffect, useMemo, useRef } from 'preact/hooks';
import { CompactContext, useMeasureCompact } from './compact';
import { DemoContext } from './context';
import { Window } from './shell/Window';
import { startLive } from './state/live';
import { createDemoStore } from './state/store';
import { closeModal, openModal } from './state/shellActions';
import { tourSteps } from './tour/steps';
import { startTour } from './tour/tourActions';
import './styles/tokens.css';
import './styles/demo.css';
import './styles/inspectors.css';
import './styles/command.css';
import './styles/device.css';
import './styles/compact.css';

/** The interactive xRay desktop app, rebuilt for the website with made-up data. */
export default function Demo() {
  const store = useMemo(() => createDemoStore(), []);
  const root = useRef<HTMLDivElement>(null);
  const compact = useMeasureCompact(root);

  useEffect(() => {
    let onScreen = false;
    const observer = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting), { threshold: 0.2 });
    if (root.current) observer.observe(root.current);
    const stop = startLive(store, { canStream: () => onScreen && document.visibilityState === 'visible' });

    // "Try it in the demo" links elsewhere on the page point at #demo/<step>.
    const fromHash = () => {
      const stepId = location.hash.match(/^#demo\/([\w-]+)$/)?.[1];
      if (stepId && tourSteps.some((s) => s.id === stepId)) store.dispatch(startTour, stepId);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('hashchange', fromHash);
    };
  }, [store]);

  // ⌘K / Ctrl+K toggles the command menu while focus is in the demo; the page keeps the shortcut otherwise.
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return;
    const state = store.state.value;
    if (!state.activeConnectionId || state.tour) return;
    event.preventDefault();
    if (state.modal?.kind === 'commandMenu') store.dispatch(closeModal);
    else store.dispatch(openModal, { kind: 'commandMenu' });
  };

  return (
    <DemoContext.Provider value={store}>
      <CompactContext.Provider value={compact}>
      <div ref={root} class={`xr-demo ${compact ? 'is-compact' : ''}`} role="region" aria-label="Interactive demo of the xRay desktop app" onKeyDown={onKeyDown} aria-describedby="xr-demo-description">
        <p id="xr-demo-description" class="xr-sr-only">
          A working copy of the xRay desktop app connected to a sample app. Click around: open network calls, read logs, edit stored values and scrub the timeline.
        </p>
        <Window />
      </div>
      </CompactContext.Provider>
    </DemoContext.Provider>
  );
}
