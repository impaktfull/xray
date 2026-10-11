import { createContext } from 'preact';
import type { RefObject } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

/** Below this width the demo switches to the stacked phone layout (designed in Pencil). */
export const compactBreakpoint = 900;

/**
 * Whether the demo uses the phone layout, or `undefined` before the demo has measured itself: in the
 * HTML rendered at build time and in the first render after hydration. Components that render
 * different elements on phones render both versions then (see `.xr-wide-only` / `.xr-compact-only`),
 * so the page shows the right layout before the demo hydrates and nothing moves when it does.
 */
export type Compact = boolean | undefined;

export const CompactContext = createContext<Compact>(undefined);

export const useCompact = () => useContext(CompactContext);

/** Tracks whether the demo itself (not the viewport) is narrower than the breakpoint. */
export function useMeasureCompact(root: RefObject<HTMLElement>): Compact {
  const [compact, setCompact] = useState<Compact>(undefined);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (typeof ResizeObserver === 'undefined') {
      setCompact(false);
      return;
    }
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < compactBreakpoint));
    observer.observe(element);
    return () => observer.disconnect();
  }, [root]);
  return compact;
}
