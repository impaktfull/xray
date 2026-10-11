import { useDemo } from '../context';
import { FilesScreen } from '../files/FilesScreen';
import { KeyValueScreen } from '../keyvalue/KeyValueScreen';
import { LogsScreen } from '../logs/LogsScreen';
import { NetworkScreen } from '../network/NetworkScreen';
import { activeTab } from '../state/access';
import { TimelineScreen } from '../timeline/TimelineScreen';

export function InspectorView() {
  const { state } = useDemo();
  switch (activeTab(state)?.inspector) {
    case 'timeline':
      return <TimelineScreen />;
    case 'logs':
      return <LogsScreen />;
    case 'keyValue':
      return <KeyValueScreen />;
    case 'files':
      return <FilesScreen />;
    default:
      return <NetworkScreen />;
  }
}
