import { useDemo } from '../context';
import { bodySizeLabel } from '../model/format';
import type { Body } from '../model/types';
import type { BodyView } from '../state/demoState';
import { setBodyView } from '../state/networkActions';
import { showToast } from '../state/shellActions';
import { Icon } from '../ui/Icon';
import { JsonTree } from '../ui/JsonTree';

interface BodyViewerProps {
  body: Body;
  view: BodyView;
  rootLabel: string;
  emptyText?: string;
}

export function BodyViewer({ body, view, rootLabel, emptyText = 'No body' }: BodyViewerProps) {
  const { dispatch } = useDemo();
  if (body.kind === 'none') return <p class="xr-panel-empty">{emptyText}</p>;

  const views: { id: BodyView; label: string }[] =
    body.kind === 'image' ? [{ id: 'preview', label: 'Preview' }] : body.kind === 'json' ? [{ id: 'json', label: 'JSON' }, { id: 'raw', label: 'Raw' }] : [{ id: 'raw', label: 'Raw' }];
  const current = views.some((v) => v.id === view) ? view : views[0].id;

  return (
    <div class="xr-body">
      <div class="xr-body__bar">
        <div class="xr-segmented" role="tablist" aria-label="Body format">
          {views.map((v) => (
            <button key={v.id} type="button" role="tab" aria-selected={v.id === current} class={v.id === current ? 'is-active' : ''} onClick={() => dispatch(setBodyView, v.id)}>
              {v.label}
            </button>
          ))}
        </div>
        <span class="xr-body__size">{bodySizeLabel(body.bytes)}</span>
        {body.kind !== 'image' && (
          <button type="button" class="xr-copy-button" onClick={() => dispatch(showToast, 'Copied to clipboard')}>
            <Icon name="copy" size={12} />
            Copy
          </button>
        )}
      </div>
      {current === 'json' && <JsonTree value={JSON.parse(body.text ?? 'null')} rootLabel={rootLabel} />}
      {current === 'raw' && <pre class="xr-raw">{body.text}</pre>}
      {current === 'preview' && <ImagePreview bytes={body.bytes} />}
    </div>
  );
}

function ImagePreview({ bytes }: { bytes: number }) {
  return (
    <figure class="xr-image-preview">
      <div class="xr-image-preview__avatar" aria-hidden="true">LM</div>
      <figcaption>
        PNG · 128 × 128 · {bodySizeLabel(bytes)}
      </figcaption>
    </figure>
  );
}
