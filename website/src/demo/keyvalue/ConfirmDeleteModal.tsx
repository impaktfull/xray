import { useDemo } from '../context';
import type { KvStoreId } from '../model/types';
import { deleteKey } from '../state/keyValueActions';
import { openModal } from '../state/shellActions';
import { Modal } from '../ui/Modal';

export function ConfirmDeleteModal({ storeId, entryKey }: { storeId: KvStoreId; entryKey: string }) {
  const { dispatch } = useDemo();
  const back = () => dispatch(openModal, { kind: 'editValue', storeId, key: entryKey });
  return (
    <Modal
      title="Delete Key"
      width={420}
      onClose={back}
      footer={
        <>
          <span class="xr-spacer" />
          <button type="button" class="xr-button is-outline" onClick={back}>
            Cancel
          </button>
          <button type="button" class="xr-button is-danger" data-autofocus onClick={() => dispatch(deleteKey, storeId, entryKey)}>
            Delete
          </button>
        </>
      }
    >
      <p class="xr-modal__text">
        Delete <span class="xr-mono">{entryKey}</span> from the app? This can't be undone.
      </p>
    </Modal>
  );
}
