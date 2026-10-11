import { useDemo } from '../context';
import { bodySizeLabel } from '../model/format';
import { fileAt } from '../state/selectors';
import { closeModal, showToast } from '../state/shellActions';
import { Icon } from '../ui/Icon';
import { JsonTree } from '../ui/JsonTree';
import { Modal } from '../ui/Modal';

export function FilePreviewModal({ path }: { path: string[] }) {
  const { state, dispatch } = useDemo();
  const file = fileAt(state, path);
  if (!file) return null;
  const preview = file.preview;
  const save = () => {
    dispatch(closeModal);
    dispatch(showToast, `Saved ${file.name} to Downloads`);
  };

  return (
    <Modal
      title={file.name}
      width={560}
      onClose={() => dispatch(closeModal)}
      footer={
        <>
          <span class="xr-mono is-muted">{bodySizeLabel(file.bytes ?? 0)}</span>
          <span class="xr-spacer" />
          <button type="button" class="xr-button is-outline" onClick={save}>
            Save to Downloads
          </button>
        </>
      }
    >
      {!preview ? (
        <div class="xr-no-preview">
          <Icon name="file" size={28} />
          <p>No preview for this file type.</p>
        </div>
      ) : preview.kind === 'json' ? (
        <JsonTree value={JSON.parse(preview.text ?? 'null')} rootLabel={file.name} />
      ) : preview.kind === 'image' ? (
        <figure class="xr-image-preview">
          <div class="xr-image-preview__avatar" aria-hidden="true">LM</div>
          <figcaption>PNG · 128 × 128</figcaption>
        </figure>
      ) : (
        <pre class="xr-raw">{preview.text}</pre>
      )}
    </Modal>
  );
}
