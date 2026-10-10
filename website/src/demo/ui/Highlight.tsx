/** Marks every case-insensitive match of `query` in `text`, like the app's search highlight. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const parts: preact.JSX.Element[] = [];
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  let from = 0;
  let index = lower.indexOf(needle);
  while (index !== -1) {
    if (index > from) parts.push(<>{text.slice(from, index)}</>);
    parts.push(<mark class="xr-mark">{text.slice(index, index + q.length)}</mark>);
    from = index + q.length;
    index = lower.indexOf(needle, from);
  }
  parts.push(<>{text.slice(from)}</>);
  return <>{parts}</>;
}
