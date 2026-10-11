import { useState } from 'preact/hooks';
import { JsonTree } from '../ui/JsonTree';

interface JsonValueEditorProps {
  value: string;
  onChange: (value: string, valid: boolean) => void;
}

/** Tree view to read the structure, Raw to edit it, like the app's Edit Value dialog. */
export function JsonValueEditor({ value, onChange }: JsonValueEditorProps) {
  const [mode, setMode] = useState<'tree' | 'raw'>('tree');
  const [raw, setRaw] = useState(() => JSON.stringify(JSON.parse(value), null, 2));
  const [error, setError] = useState<string>();

  const parsed = (() => {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  })();

  return (
    <div class="xr-json-editor">
      <div class="xr-segmented" role="tablist" aria-label="Value view">
        {(['tree', 'raw'] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} class={mode === m ? 'is-active' : ''} onClick={() => setMode(m)} disabled={m === 'tree' && parsed === undefined}>
            {m === 'tree' ? 'Tree' : 'Raw'}
          </button>
        ))}
      </div>
      {mode === 'tree' && parsed !== undefined ? (
        <div class="xr-json-editor__tree">
          <JsonTree value={parsed} rootLabel="value" openDepth={2} />
        </div>
      ) : (
        <textarea
          class="xr-textarea"
          aria-label="Value"
          aria-invalid={Boolean(error)}
          rows={10}
          value={raw}
          onInput={(e) => {
            const next = (e.currentTarget as HTMLTextAreaElement).value;
            setRaw(next);
            try {
              const compact = JSON.stringify(JSON.parse(next));
              setError(undefined);
              onChange(compact, true);
            } catch {
              setError('Not valid JSON');
              onChange(next, false);
            }
          }}
        />
      )}
      {error && <p class="xr-field-error">{error}</p>}
    </div>
  );
}
