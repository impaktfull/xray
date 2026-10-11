import { createContext } from 'preact';
import type { RefObject } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

/** Below this width the demo switches to the stacked phone layout (designed in Pencil). */
export const compactBreakpoint = 900;

export const CompactContext = createContext(false);

export const useCompact = () => useContext(CompactContext);

/** Tracks whether the demo itself (not the viewport) is narrower than the breakpoint. */
export function useMeasureCompact(root: RefObject<HTMLElement>): boolean {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const element = root.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < compactBreakpoint));
    observer.observe(element);
    return () => observer.disconnect();
  }, [root]);
  return compact;
}
