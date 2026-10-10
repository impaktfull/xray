import { useState } from 'preact/hooks';
import { useDemo } from '../context';
import type { Body, GraphqlInfo } from '../model/types';
import { showInOperation } from '../state/networkActions';
import { JsonTree } from '../ui/JsonTree';

/** Light syntax colouring: keywords, variables and type names, enough to read like the app. */
function highlight(line: string) {
  const parts: (string | preact.JSX.Element)[] = [];
  const pattern = /(\b(?:query|mutation|subscription|fragment|on)\b)|(\$\w+)|(\b[A-Z]\w*!?)/g;
  let last = 0;
  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(line.slice(last, index));
    const cls = match[1] ? 'is-keyword' : match[2] ? 'is-variable' : 'is-type';
    parts.push(<span class={`xr-gql__${cls}`}>{match[0]}</span>);
    last = index + match[0].length;
  }
  parts.push(line.slice(last));
  return parts;
}

export function GraphqlRequest({ graphql, highlightedLine }: { graphql: GraphqlInfo; highlightedLine?: number }) {
  return (
    <div class="xr-gql">
      <ol class="xr-gql__doc" aria-label={`${graphql.type} ${graphql.operationName}`}>
        {graphql.document.split('\n').map((line, i) => (
          <li key={i} class={highlightedLine === i + 1 ? 'is-highlighted' : ''}>
            <span class="xr-gql__ln">{i + 1}</span>
            <code>{highlight(line)}</code>
          </li>
        ))}
      </ol>
      {graphql.variables !== undefined && (
        <>
          <p class="xr-section-label">Variables</p>
          <JsonTree value={graphql.variables} rootLabel="variables" />
        </>
      )}
    </div>
  );
}

type ResponseView = 'data' | 'errors' | 'raw';

export function GraphqlResponse({ graphql, body }: { graphql: GraphqlInfo; body: Body }) {
  const { dispatch } = useDemo();
  const errorCount = graphql.errors?.length ?? 0;
  const [view, setView] = useState<ResponseView>(errorCount ? 'errors' : 'data');
  const views: { id: ResponseView; label: string }[] = [
    { id: 'data', label: 'Data' },
    ...(errorCount ? [{ id: 'errors' as const, label: `Errors ${errorCount}` }] : []),
    { id: 'raw', label: 'Raw' },
  ];

  return (
    <div class="xr-body">
      <div class="xr-body__bar">
        <div class="xr-segmented" role="tablist" aria-label="GraphQL response">
          {views.map((v) => (
            <button key={v.id} type="button" role="tab" aria-selected={v.id === view} class={`${v.id === view ? 'is-active' : ''} ${v.id === 'errors' ? 'is-error' : ''}`} onClick={() => setView(v.id)}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      {view === 'data' && <JsonTree value={graphql.data ?? null} rootLabel="data" />}
      {view === 'raw' && <pre class="xr-raw">{body.text}</pre>}
      {view === 'errors' && (
        <ul class="xr-gql-errors" data-tour="graphql-error">
          {graphql.errors?.map((error, i) => (
            <li key={i} class="xr-gql-error">
              <p class="xr-gql-error__message">{error.message}</p>
              <p class="xr-gql-error__meta">
                {error.path && <span>path: {error.path.join('.')}</span>}
                {error.line !== undefined && <span>line {error.line}</span>}
              </p>
              {error.line !== undefined && (
                <button type="button" class="xr-link" onClick={() => dispatch(showInOperation, error.line!)}>
                  Show in operation →
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
