import { useDemo } from '../context';
import { sizeLabel } from '../model/format';
import type { FileNode } from '../model/types';
import { activeTab } from '../state/access';
import { goToPath, goUp, openFolder } from '../state/fileActions';
import { currentFolder } from '../state/selectors';
import { openModal, showToast } from '../state/shellActions';
import { EmptyState } from '../ui/EmptyState';
import { Icon, type IconName } from '../ui/Icon';
import { ToolbarButton, ToolbarSeparator } from '../ui/Toolbar';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function modifiedLabel(at: number, now: number) {
  const minutes = Math.round((now - at) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)} h ago`;
  const d = new Date(at);
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function fileIcon(node: FileNode): IconName {
  if (node.kind === 'folder') return 'folder';
  if (node.name.endsWith('.pdf')) return 'file-pdf';
  if (/\.(png|jpe?g)$/.test(node.name)) return 'file-image';
  if (node.name.endsWith('.json') || node.name.endsWith('.txt')) return 'file-text';
  return 'file';
}

export function FilesScreen() {
  const { state, dispatch } = useDemo();
  const path = activeTab(state)!.files.path;
  const folder = currentFolder(state);
  const items = [...(folder?.children ?? [])].sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'folder' ? -1 : 1));
  const root = state.connections.find((c) => c.id === state.activeConnectionId)?.session.files.name ?? '';

  return (
    <>
      <div class="xr-toolbar" role="toolbar">
        <button type="button" class="xr-icon-button is-small" aria-label="Up" disabled={!path.length} onClick={() => dispatch(goUp)}>
          <Icon name="arrow-up" />
        </button>
        <nav class="xr-breadcrumb" aria-label="Folder">
          <button type="button" onClick={() => dispatch(goToPath, 0)}>
            {root}
          </button>
          {path.map((name, i) => (
            <span key={name}>
              <Icon name="caret-right" size={10} />
              <button type="button" aria-current={i === path.length - 1 ? 'page' : undefined} onClick={() => dispatch(goToPath, i + 1)}>
                {name}
              </button>
            </span>
          ))}
        </nav>
        <span class="xr-spacer" />
        <span class="xr-match-count">{items.length} items</span>
        <ToolbarSeparator />
        <ToolbarButton icon="arrow-clockwise" label="Refresh" onClick={() => dispatch(showToast, 'Files refreshed')} />
      </div>
      {items.length ? (
        <div class="xr-table" role="table" aria-label="Files" data-tour="files-list">
          <div class="xr-table__head xr-files-cols" role="row">
            <span />
            <span role="columnheader">Name</span>
            <span role="columnheader">Size</span>
            <span role="columnheader">Modified</span>
          </div>
          <div class="xr-table__body">
            {items.map((node) => (
              <button
                key={node.name}
                type="button"
                role="row"
                class="xr-table__row xr-files-cols"
                onClick={() => (node.kind === 'folder' ? dispatch(openFolder, node.name) : dispatch(openModal, { kind: 'filePreview', path: [...path, node.name] }))}
              >
                <Icon name={fileIcon(node)} size={16} class={node.kind === 'folder' ? 'is-accent' : 'is-muted'} />
                <span role="cell" class="xr-mono xr-truncate">{node.name}</span>
                <span role="cell" class="xr-mono is-muted">{node.kind === 'folder' ? `${node.children?.length ?? 0} items` : sizeLabel(node.bytes ?? 0)}</span>
                <span role="cell" class="xr-mono is-muted">{modifiedLabel(node.modifiedAt, state.now)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState icon="folder-open" title="No files found" message="This folder is empty." />
      )}
    </>
  );
}
