import { Icon } from '../ui/Icon';

interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export function ListEditor({ items, onChange }: ListEditorProps) {
  const update = (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item)));
  return (
    <div class="xr-list-editor">
      {items.map((item, index) => (
        <div key={index} class="xr-list-editor__row">
          <span class="xr-list-editor__index">{index}</span>
          <input class="xr-input" aria-label={`Item ${index}`} value={item} onInput={(e) => update(index, (e.currentTarget as HTMLInputElement).value)} />
          <button type="button" class="xr-icon-button is-small" aria-label={`Remove item ${index}`} onClick={() => onChange(items.filter((_, i) => i !== index))}>
            <Icon name="minus" />
          </button>
        </div>
      ))}
      <button type="button" class="xr-button is-ghost is-small" onClick={() => onChange([...items, ''])}>
        <Icon name="plus" size={12} />
        Add item
      </button>
    </div>
  );
}
