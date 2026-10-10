import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import type { KvStoreId } from '../model/types';
import { activeConnection } from '../state/access';
import { saveValue } from '../state/keyValueActions';
import { closeModal, openModal } from '../state/shellActions';
import { Toggle } from '../ui/Controls';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { JsonValueEditor } from './JsonValueEditor';
import { ListEditor } from './ListEditor';
import { parseJsonObject, parseValue, typeTone } from './values';

export function EditValueModal({ storeId, entryKey }: { storeId: KvStoreId; entryKey: string }) {
  const { state, dispatch } = useDemo();
  const store = activeConnection(state)?.session.stores.find((s) => s.id === storeId);
  const entry = store?.entries.find((e) => e.key === entryKey);
  const [draft, setDraft] = useState<string | boolean | string[]>(() =>
    entry ? (typeof entry.value === 'boolean' || Array.isArray(entry.value) ? entry.value : String(entry.value)) : '',
  );
  const [jsonValid, setJsonValid] = useState(true);
  if (!entry) return null;

  const isJson = parseJsonObject(entry.value) !== undefined;
  const parsed = parseValue(entry.type, draft);
  const canSave = !parsed.error && jsonValid;
  const close = () => dispatch(closeModal);

  return (
    <Modal
      title="Edit Value"
      width={isJson ? 560 : 480}
      onClose={close}
      footer={
        <>
          <button type="button" class="xr-button is-destructive" onClick={() => dispatch(openModal, { kind: 'confirmDelete', storeId, key: entry.key })}>
            <Icon name="trash" />
            Delete
          </button>
          <span class="xr-spacer" />
          <button type="button" class="xr-button is-outline" onClick={close}>
            Cancel
          </button>
          <button type="button" class="xr-button is-primary" disabled={!canSave} onClick={() => dispatch(saveValue, storeId, entry.key, parsed.value!)}>
            Save
          </button>
        </>
      }
    >
      <div class="xr-form">
        <div class="xr-field">
          <span class="xr-field__label">Key</span>
          <div class="xr-field__readonly">
            <span class="xr-mono">{entry.key}</span>
            <span class={`xr-mono ${typeTone[entry.type]}`}>{entry.type}</span>
          </div>
        </div>
        <div class="xr-field">
          <span class="xr-field__label">Value</span>
          {entry.type === 'bool' ? (
            <div class="xr-field__toggle">
              <Toggle checked={draft === true} label="Value" onChange={setDraft} />
              <span class="xr-mono">{String(draft)}</span>
            </div>
          ) : entry.type === 'List<String>' ? (
            <ListEditor items={draft as string[]} onChange={setDraft} />
          ) : isJson ? (
            <JsonValueEditor
              value={String(entry.value)}
              onChange={(value, valid) => {
                setDraft(value);
                setJsonValid(valid);
              }}
            />
          ) : (
            <>
              <input
                class="xr-input"
                data-autofocus
                aria-label="Value"
                aria-invalid={Boolean(parsed.error)}
                inputMode={entry.type === 'String' ? 'text' : 'decimal'}
                value={draft as string}
                onInput={(e) => setDraft((e.currentTarget as HTMLInputElement).value)}
                onKeyDown={(e) => e.key === 'Enter' && canSave && dispatch(saveValue, storeId, entry.key, parsed.value!)}
              />
              {parsed.error && <p class="xr-field-error">{parsed.error}</p>}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
