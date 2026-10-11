export function HeadersView({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers);
  if (!entries.length) return <p class="xr-panel-empty">No headers</p>;
  return (
    <dl class="xr-headers">
      {entries.map(([key, value]) => (
        <div key={key} class="xr-headers__row">
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
