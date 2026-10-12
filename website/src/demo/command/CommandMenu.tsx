import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useDemo } from '../context';
import { activeConnection } from '../state/access';
import { closeModal } from '../state/shellActions';
import { Highlight } from '../ui/Highlight';
import { Icon } from '../ui/Icon';
import { commandSections, runCommand, type CommandItem } from './commands';

export function CommandMenu() {
  const { state, dispatch } = useDemo();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  // A snapshot per query, like the app: results don't move while the live stream keeps going.
  const sections = useMemo(() => commandSections(state, query), [query]);
  const items = sections.flatMap((s) => s.items);
  const connection = activeConnection(state);
  const searching = query.trim() !== '' && !query.trimStart().startsWith('>');
  const highlight = query.trim().replace(/^>\s*/, '');

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    input.current?.focus();
    return () => previous?.focus();
  }, []);

  useEffect(() => setActive(0), [query]);

  // Keep the active item in view by scrolling the list only; scrollIntoView would also move the page.
  useEffect(() => {
    const box = list.current;
    const row = box?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!box || !row) return;
    if (row.offsetTop < box.scrollTop) box.scrollTop = row.offsetTop - 6;
    else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight + 6;
  }, [active]);

  const run = (item: CommandItem) => {
    if (!item.unavailable) dispatch(runCommand, item);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + step + items.length) % items.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (items[active]) run(items[active]);
    } else if (event.key === 'Escape') {
      event.stopPropagation();
      dispatch(closeModal);
    } else if (event.key === 'Tab') {
      event.preventDefault();
    }
  };

  let index = -1;
  const total = sections.reduce((sum, s) => sum + (s.count ?? 0), 0);
  const inspectors = sections.filter((s) => s.count).length;

  return (
    <div class="xr-modal-overlay is-command" onMouseDown={(e) => e.target === e.currentTarget && dispatch(closeModal)}>
      <div class="xr-command" role="dialog" aria-modal="true" aria-label="Command menu" onKeyDown={onKeyDown} data-tour="command-menu">
        <div class="xr-command__query">
          <Icon name="magnifying-glass" size={16} />
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls="xr-command-list"
            aria-activedescendant={items[active] ? `xr-cmd-${items[active].id}` : undefined}
            aria-label="Search or run a command"
            placeholder="Search calls, logs, keys, or type a command…"
            value={query}
            onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
          />
          {connection && (
            <span class="xr-command__scope">
              <span class={`xr-status-dot is-${connection.status}`} />
              {connection.appName} · {connection.deviceName}
            </span>
          )}
        </div>
        <div ref={list} id="xr-command-list" class="xr-command__results" role="listbox" aria-label="Results">
          {items.length === 0 && <p class="xr-command__empty">No results for "{query}"</p>}
          {sections.map((section) => (
            <div key={section.title} role="group" aria-label={section.title}>
              <p class="xr-command__group">
                {section.title}
                {section.count !== undefined && ` · ${section.count}`}
              </p>
              {section.items.map((item) => {
                index++;
                const i = index;
                return (
                  <div
                    key={item.id}
                    id={`xr-cmd-${item.id}`}
                    role="option"
                    aria-selected={i === active}
                    aria-disabled={item.unavailable || undefined}
                    class={`xr-command__item ${i === active ? 'is-active' : ''} ${item.unavailable ? 'is-unavailable' : ''}`}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(item)}
                  >
                    <span class={`xr-command__icon is-${item.tone ?? 'muted'}`}>
                      <Icon name={item.icon} />
                    </span>
                    <span class="xr-command__label">
                      <span class="xr-truncate">{searching ? <Highlight text={item.label} query={highlight} /> : item.label}</span>
                      {item.meta && <span class="xr-command__meta">{item.meta}</span>}
                    </span>
                    {item.unavailable ? (
                      <span class="xr-command__note">Not available in the demo</span>
                    ) : (
                      item.shortcut && (
                        <span class="xr-command__keys" aria-hidden="true">
                          {item.shortcut.map((k) => (
                            <kbd key={k}>{k}</kbd>
                          ))}
                        </span>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <footer class="xr-command__footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> Navigate
          </span>
          <span>
            <kbd>↵</kbd> Open
          </span>
          <span>
            <kbd>esc</kbd> Close
          </span>
          <span class="xr-spacer" />
          <span>{searching ? `${total} matches across ${inspectors} inspectors` : 'Type > for commands only'}</span>
        </footer>
      </div>
    </div>
  );
}
