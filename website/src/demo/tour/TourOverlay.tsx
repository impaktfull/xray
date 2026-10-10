import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { useCompact } from '../compact';
import { useDemo } from '../context';
import { Icon } from '../ui/Icon';
import { tourSteps } from './steps';
import { endTour, nextTourStep, previousTourStep, startTour } from './tourActions';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const calloutWidth = 300;
const gap = 12;

const minCalloutWidth = 260;

/**
 * Beside the highlighted area when there is room (narrowing down to 260px, so centred dialogs keep a
 * callout next to them), otherwise below it, otherwise inside its bottom edge, so the callout never
 * covers the top of what it is describing.
 */
function calloutPosition(rect: Rect | undefined, callout: HTMLElement | null): { top: number; left: number; width: number } {
  const bounds = callout?.closest('.xr-window')?.getBoundingClientRect();
  const width = bounds?.width ?? 1100;
  const height = bounds?.height ?? 720;
  const calloutHeight = callout?.offsetHeight ?? 180;
  if (!rect) return { top: height / 2 - calloutHeight / 2, left: width / 2 - calloutWidth / 2, width: calloutWidth };

  const top = Math.min(Math.max(gap, rect.top), height - calloutHeight - gap);
  const roomRight = width - (rect.left + rect.width) - gap * 2;
  const roomLeft = rect.left - gap * 2;
  if (Math.max(roomRight, roomLeft) >= minCalloutWidth) {
    const onRight = roomRight >= roomLeft;
    const fitted = Math.min(calloutWidth, onRight ? roomRight : roomLeft);
    return { top, left: onRight ? rect.left + rect.width + gap : rect.left - fitted - gap, width: fitted };
  }
  if (height - (rect.top + rect.height) >= calloutHeight + gap * 2) {
    return { top: rect.top + rect.height + gap, left: Math.min(rect.left + gap, width - calloutWidth - gap), width: calloutWidth };
  }
  return {
    top: Math.max(gap, Math.min(rect.top + rect.height, height) - calloutHeight - gap * 2),
    left: Math.min(Math.max(gap, rect.left + rect.width - calloutWidth - gap * 2), width - calloutWidth - gap),
    width: calloutWidth,
  };
}

/** Spotlight on the step's area plus a callout; Esc ends, arrow keys move between steps. */
export function TourOverlay() {
  const { state, dispatch } = useDemo();
  const compact = useCompact();
  const step = state.tour ? tourSteps[state.tour.step] : undefined;
  const [rect, setRect] = useState<Rect>();
  const callout = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!step) return;
    const measure = () => {
      const root = callout.current?.closest('.xr-window');
      const target = root?.querySelector(step.target);
      if (!root || !target) return setRect(undefined);
      const r = root.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      setRect({ top: t.top - r.top, left: t.left - r.left, width: t.width, height: t.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [step, state]);

  useEffect(() => {
    if (!step) return;
    callout.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      const action = { Escape: endTour, ArrowRight: nextTourStep, ArrowLeft: previousTourStep }[event.key];
      if (!action) return;
      // Captured before modals and the call detail see the key, so Esc ends the tour first.
      event.stopImmediatePropagation();
      event.preventDefault();
      dispatch(action);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [step, dispatch]);

  if (!step || !state.tour) return null;
  const index = state.tour.step;
  // On phones the callout is a sheet (Pencil: "Phone / Tour"): at the bottom, or at the top when
  // the highlighted area is a bottom sheet itself.
  const position = compact ? undefined : calloutPosition(rect, callout.current);
  const windowHeight = callout.current?.closest('.xr-window')?.getBoundingClientRect().height ?? 720;
  const sheetAtTop = compact && rect !== undefined && rect.top > windowHeight * 0.35;

  return (
    <div class="xr-tour" role="presentation">
      {rect && <div class="xr-tour__spotlight" style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }} />}
      <div
        ref={callout}
        class={`xr-tour__callout ${compact ? 'is-sheet' : ''} ${sheetAtTop ? 'is-top' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="xr-tour-title"
        aria-describedby="xr-tour-body"
        tabIndex={-1}
        style={position}
      >
        <p class="xr-tour__count">
          {index + 1} of {tourSteps.length}
        </p>
        <h3 id="xr-tour-title">{step.title}</h3>
        <p id="xr-tour-body">{step.body}</p>
        <div class="xr-tour__actions">
          <button type="button" class="xr-button is-ghost is-small" onClick={() => dispatch(endTour)}>
            Skip
          </button>
          <span class="xr-spacer" />
          {index > 0 && (
            <button type="button" class="xr-button is-outline is-small" onClick={() => dispatch(previousTourStep)}>
              Back
            </button>
          )}
          <button type="button" class="xr-button is-primary is-small" onClick={() => dispatch(nextTourStep)}>
            {index === tourSteps.length - 1 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TourPill() {
  const { state, dispatch } = useDemo();
  const compact = useCompact();
  // On phones a sheet (modal or timeline event) takes the bottom of the window; the pill would cover it.
  const sheetOpen = compact && (state.modal || (state.activeConnectionId && state.tabs[state.activeConnectionId]?.timeline.selectedId));
  // The drawer's footer sits where the pill does.
  if (state.tour || sheetOpen || state.drawer) return null;
  return (
    <button type="button" class="xr-tour-pill" onClick={() => dispatch(startTour)}>
      <Icon name="sparkle" />
      Take the tour
    </button>
  );
}
