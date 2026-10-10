import { AddConnectionModal } from '../connection/AddConnectionModal';
import { useDemo } from '../context';
import { ExportModal } from '../export/ExportModal';
import { FilePreviewModal } from '../files/FilePreviewModal';
import { AddKeyModal } from '../keyvalue/AddKeyModal';
import { ConfirmDeleteModal } from '../keyvalue/ConfirmDeleteModal';
import { EditValueModal } from '../keyvalue/EditValueModal';
import { LogsFilterModal } from '../logs/LogsFilterModal';
import { NetworkFilterModal } from '../network/NetworkFilterModal';

export function ModalHost() {
  const { state } = useDemo();
  const modal = state.modal;
  switch (modal?.kind) {
    case 'networkFilter':
      return <NetworkFilterModal />;
    case 'logsFilter':
      return <LogsFilterModal />;
    case 'editValue':
      return <EditValueModal key={modal.key} storeId={modal.storeId} entryKey={modal.key} />;
    case 'addKey':
      return <AddKeyModal storeId={modal.storeId} />;
    case 'confirmDelete':
      return <ConfirmDeleteModal storeId={modal.storeId} entryKey={modal.key} />;
    case 'addConnection':
      return <AddConnectionModal />;
    case 'export':
      return <ExportModal />;
    case 'filePreview':
      return <FilePreviewModal path={modal.path} />;
    default:
      return null;
  }
}
