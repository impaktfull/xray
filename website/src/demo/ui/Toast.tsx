import { useEffect } from 'preact/hooks';
import { useDemo } from '../context';
import { dismissToast } from '../state/shellActions';
import { Icon } from './Icon';

export function Toast() {
  const { state, dispatch } = useDemo();
  const toast = state.toast;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(dismissToast), 2_400);
    return () => clearTimeout(timer);
  }, [toast?.id, dispatch]);

  return (
    <div class="xr-toast-region" role="status" aria-live="polite">
      {toast && (
        <div class="xr-toast" key={toast.id}>
          <Icon name="check" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
