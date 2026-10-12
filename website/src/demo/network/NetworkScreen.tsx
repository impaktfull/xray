import { useCompact } from '../compact';
import { useDemo } from '../context';
import { selectedCall, visibleCalls } from '../state/selectors';
import { CallDetail } from './CallDetail';
import { CallItems } from './CallItems';
import { CallList } from './CallList';
import { NetworkEmpty } from './NetworkEmpty';
import { NetworkTable } from './NetworkTable';
import { NetworkToolbar } from './NetworkToolbar';

/**
 * No selection: the full table (two-line call rows on phones). A selected call: the call list beside
 * its detail, or only the detail on phones.
 */
export function NetworkScreen() {
  const { state } = useDemo();
  const compact = useCompact();
  const call = selectedCall(state);

  const phoneList = () => (visibleCalls(state).length ? <CallItems tour="network-list" /> : <NetworkEmpty />);

  // Not measured yet (see compact.ts): both lists, CSS shows the one that fits.
  if (compact === undefined && !call) {
    return (
      <>
        <NetworkToolbar />
        <div class="xr-contents xr-compact-only">{phoneList()}</div>
        <div class="xr-contents xr-wide-only">
          <NetworkTable />
        </div>
      </>
    );
  }

  if (compact) {
    if (call) return <CallDetail call={call} />;
    return (
      <>
        <NetworkToolbar />
        {phoneList()}
      </>
    );
  }

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
