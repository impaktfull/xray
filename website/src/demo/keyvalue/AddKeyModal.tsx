import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import type { KvStoreId, KvType } from '../model/types';
import { activeConnection } from '../state/access';
import { addKey } from '../state/keyValueActions';
import { closeModal } from '../state/shellActions';
import { Toggle } from '../ui/Controls';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { ListEditor } from './ListEditor';
import { parseValue, types } from './values';

export function AddKeyModal({ storeId }: { storeId: KvStoreId }) {
  const { state, dispatch } = useDemo();
  const store = activeConnection(state)?.session.stores.find((s) => s.id === storeId);
  const [key, setKey] = useState('');
  const [type, setType] = useState<KvType>('String');
  const [draft, setDraft] = useState<string | boolean | string[]>('');
  const exists = store?.entries.some((e) => e.key === key.trim()) ?? false;
  const parsed = parseValue(type, draft);
  const canAdd = key.trim() !== '' && !parsed.error;

  const changeType = (next: KvType) => {
    setType(next);
    setDraft(next === 'bool' ? false : next === 'List<String>' ? [''] : '');
  };

  const submit = (another: boolean) => {
    dispatch(addKey, storeId, { key: key.trim(), type, value: parsed.value! }, another);
    if (another) {
      setKey('');
      changeType(type);
    }
  };

  return (
    <Modal
      title="Add Key"
      onClose={() => dispatch(closeModal)}
      footer={
        <>
          <button type="button" class="xr-button is-ghost" disabled={!canAdd} onClick={() => submit(true)}>
            Add &amp; add another
          </button>
          <span class="xr-spacer" />
          <button type="button" class="xr-button is-primary" disabled={!canAdd} onClick={() => submit(false)}>
            {exists ? 'Overwrite Key' : 'Add Key'}
          </button>
        </>
      }
    >
      <div class="xr-form">
        <p class="xr-form__store">
          <Icon name="database" size={13} /> {store?.label}
        </p>
        <label class="xr-field">
          <span class="xr-field__label">Key</span>
          <input class="xr-input" data-autofocus placeholder="feature_enabled" value={key} onInput={(e) => setKey((e.currentTarget as HTMLInputElement).value)} />
        </label>
        {exists && (
          <p class="xr-warning">
            <Icon name="warning" size={13} />
            "{key.trim()}" already exists. Adding it replaces the current value.
          </p>
        )}
        <div class="xr-field">
          <span class="xr-field__label">Type</span>
          <div class="xr-segmented is-boxed" role="radiogroup" aria-label="Type">
            {types.map((t) => (
              <button key={t} type="button" role="radio" aria-checked={t === type} class={t === type ? 'is-active' : ''} onClick={() => changeType(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div class="xr-field">
          <span class="xr-field__label">Value</span>
          {type === 'bool' ? (
            <div class="xr-field__toggle">
              <Toggle checked={draft === true} label="Value" onChange={setDraft} />
              <span class="xr-mono">{String(draft)}</span>
            </div>
          ) : type === 'List<String>' ? (
            <ListEditor items={draft as string[]} onChange={setDraft} />
          ) : (
            <>
              <input class="xr-input" aria-label="Value" value={draft as string} onInput={(e) => setDraft((e.currentTarget as HTMLInputElement).value)} />
              {parsed.error && key && <p class="xr-field-error">{parsed.error}</p>}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
