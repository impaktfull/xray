import { useDemo } from '../context';
import type { NetworkCall } from '../model/types';
import { closeCall } from '../state/networkActions';
import { showToast } from '../state/shellActions';
import { Icon } from '../ui/Icon';
import { callDisplay } from './callDisplay';

export function SummaryBar({ call }: { call: NetworkCall }) {
  const { dispatch } = useDemo();
  const d = callDisplay(call);
  return (
    <div class="xr-summary">
      <span class={`xr-badge method-${d.methodTone}`}>{d.method}</span>
      <span class="xr-summary__url xr-truncate">{call.url}</span>
      <button type="button" class="xr-icon-button is-small" aria-label="Copy URL" onClick={() => dispatch(showToast, 'URL copied')}>
        <Icon name="copy" />
      </button>
      <span class="xr-summary__divider" aria-hidden="true" />
      <span class={`xr-badge tone-${d.statusTone}`}>{d.statusDetail}</span>
      <span class={`xr-mono tone-${d.durationTone}`}>{d.duration}</span>
      <span class="xr-mono is-muted">{d.time}</span>
      <button type="button" class="xr-icon-button is-small" aria-label="Close call detail" onClick={() => dispatch(closeCall)}>
        <Icon name="x" />
      </button>
    </div>
  );
}
