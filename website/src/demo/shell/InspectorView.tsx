import { useDemo } from '../context';
import { NetworkScreen } from '../network/NetworkScreen';
import { activeTab } from '../state/access';
import { EmptyState } from '../ui/EmptyState';

export function InspectorView() {
  const { state } = useDemo();
  switch (activeTab(state)?.inspector) {
    case 'network':
      return <NetworkScreen />;
    default:
      return <EmptyState icon="sparkle" title="Coming up" />;
  }
}
