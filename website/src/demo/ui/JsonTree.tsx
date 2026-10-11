import { useState } from 'preact/hooks';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

interface JsonTreeProps {
  value: unknown;
  rootLabel?: string;
  /** Levels expanded on first render. */
  openDepth?: number;
}

/** Collapsible JSON, styled like the app's tree: objects `{}`, lists `[]`, typed leaf colours. */
export function JsonTree({ value, rootLabel = 'Response', openDepth = 3 }: JsonTreeProps) {
  return (
    <div class="xr-json" role="tree">
      <Node name={rootLabel} value={value as Json} depth={0} openDepth={openDepth} />
    </div>
  );
}

interface NodeProps {
  name: string;
  value: Json;
  depth: number;
  openDepth: number;
}

function Node({ name, value, depth, openDepth }: NodeProps) {
  const [open, setOpen] = useState(depth < openDepth);
  const indent = { paddingLeft: `${depth * 16}px` };

  if (value !== null && typeof value === 'object') {
    const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value);
    const count = Array.isArray(value) ? `${entries.length} items` : `${entries.length} keys`;
    return (
      <>
        <button type="button" class="xr-json__row is-branch" style={indent} role="treeitem" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span class="xr-json__arrow">{open ? '▼' : '▶'}</span>
          <span class="xr-json__key is-branch">
            {Array.isArray(value) ? '[]' : '{}'} {name}
          </span>
          <span class="xr-json__count">{count}</span>
        </button>
        {open && entries.map(([key, child]) => <Node key={key} name={key} value={child} depth={depth + 1} openDepth={openDepth} />)}
      </>
    );
  }

  return (
    <div class="xr-json__row" style={{ paddingLeft: `${depth * 16 + 11}px` }} role="treeitem">
      <span class="xr-json__key">{name}</span>
      <span class="xr-json__sep">:</span>
      <span class={`xr-json__value is-${value === null ? 'null' : typeof value}`}>
        {typeof value === 'string' ? `"${value}"` : String(value)}
      </span>
    </div>
  );
}
