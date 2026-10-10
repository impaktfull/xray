import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import { sendPush } from '../state/deviceActions';
import { Icon } from '../ui/Icon';

type Delivery = 'foreground' | 'background' | 'tap';
const deliveries: { id: Delivery; label: string }[] = [
  { id: 'foreground', label: 'Foreground' },
  { id: 'background', label: 'Background' },
  { id: 'tap', label: 'Tap to open' },
];

export function PushTab({ deviceName }: { deviceName: string }) {
  const { dispatch } = useDemo();
  const [title, setTitle] = useState('Invoice 2026-118 was paid');
  const [body, setBody] = useState('Northwind paid €12,400. Tap to see the invoice.');
  const [data, setData] = useState('{\n  "type": "invoice_paid",\n  "invoiceId": "2026-118",\n  "deeplink": "myapp://invoices/2026-118"\n}');
  const [deliver, setDeliver] = useState<Delivery>('tap');
  const dataValid = (() => {
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <div class="xr-device-sections">
      <section>
        <p class="xr-device-label">
          <span>Preview on {deviceName}</span>
        </p>
        <div class="xr-push-preview">
          <span class="xr-push-preview__icon" aria-hidden="true">
            <Icon name="bell-simple" size={14} />
          </span>
          <span>
            <strong>{title || 'Title'}</strong>
            <span>{body || 'Body'}</span>
          </span>
          <span class="xr-push-preview__time">now</span>
        </div>
      </section>
      <label class="xr-field">
        <span class="xr-field__label">Title</span>
        <input class="xr-input" value={title} onInput={(e) => setTitle((e.currentTarget as HTMLInputElement).value)} />
      </label>
      <label class="xr-field">
        <span class="xr-field__label">Body</span>
        <input class="xr-input" value={body} onInput={(e) => setBody((e.currentTarget as HTMLInputElement).value)} />
      </label>
      <label class="xr-field">
        <span class="xr-field__label">Data payload</span>
        <textarea class="xr-textarea" rows={5} aria-invalid={!dataValid} value={data} onInput={(e) => setData((e.currentTarget as HTMLTextAreaElement).value)} />
        {!dataValid && <span class="xr-field-error">Not valid JSON</span>}
      </label>
      <section>
        <p class="xr-device-label">
          <span>Deliver while the app is</span>
        </p>
        <div class="xr-segmented is-boxed" role="radiogroup" aria-label="Deliver while the app is">
          {deliveries.map((d) => (
            <button key={d.id} type="button" role="radio" aria-checked={deliver === d.id} class={deliver === d.id ? 'is-active' : ''} onClick={() => setDeliver(d.id)}>
              {d.label}
            </button>
          ))}
        </div>
      </section>
      <button type="button" class="xr-button is-primary" disabled={!title.trim() || !dataValid} onClick={() => dispatch(sendPush, title.trim(), deliver)}>
        Send to device
      </button>
    </div>
  );
}
