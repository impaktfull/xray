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

  if (compact) {
    if (call) return <CallDetail call={call} />;
    return (
      <>
        <NetworkToolbar />
        {visibleCalls(state).length ? <CallItems tour="network-list" /> : <NetworkEmpty />}
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
