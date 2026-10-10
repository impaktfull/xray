import { useDemo } from '../context';
import { selectedCall } from '../state/selectors';
import { CallDetail } from './CallDetail';
import { CallList } from './CallList';
import { NetworkTable } from './NetworkTable';
import { NetworkToolbar } from './NetworkToolbar';

/** No selection: the full table. A selected call: the call list beside its detail (split view). */
export function NetworkScreen() {
  const { state } = useDemo();
  const call = selectedCall(state);
  if (!call) {
    return (
      <>
        <NetworkToolbar />
        <NetworkTable />
      </>
    );
  }
  return (
    <div class="xr-split">
      <CallList />
      <CallDetail call={call} />
    </div>
  );
}
