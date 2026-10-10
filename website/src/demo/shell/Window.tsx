import { useDemo } from '../context';
import { openModal } from '../state/shellActions';
import { EmptyState } from '../ui/EmptyState';
import { Toast } from '../ui/Toast';
import { InspectorTabs } from './InspectorTabs';
import { InspectorView } from './InspectorView';
import { ModalHost } from './ModalHost';
import { TourOverlay, TourPill } from '../tour/TourOverlay';
import { TopBar } from './TopBar';

export function Window() {
  const { state, dispatch } = useDemo();
  return (
    <div class="xr-window">
      <TopBar />
      {state.activeConnectionId ? (
        <>
          <InspectorTabs />
          <main class="xr-content" role="tabpanel">
            <InspectorView />
          </main>
        </>
      ) : (
        <main class="xr-content">
          <EmptyState
            icon="device-mobile"
            title="No device connected"
            message="Connect to an app running the xRay SDK on your network."
            action={
              <button type="button" class="xr-button is-primary" onClick={() => dispatch(openModal, { kind: 'addConnection' })}>
                Connect Device
              </button>
            }
          />
        </main>
      )}
      <ModalHost />
      <TourPill />
      <TourOverlay />
      <Toast />
    </div>
  );
}
