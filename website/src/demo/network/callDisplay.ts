import { durationLabel, isErrorOutcome, isSlow, methodTone, pathLabel, sizeLabel, statusLabel, statusTone, timeLabel } from '../model/format';
import type { NetworkCall } from '../model/types';

/** Everything the table, the call list and the summary bar show for one call. */
export function callDisplay(call: NetworkCall) {
  const graphql = call.graphql;
  return {
    path: graphql ? `${graphql.operationName}` : pathLabel(call.url),
    graphqlKind: graphql ? ({ query: 'QUERY', mutation: 'MUT', subscription: 'SUB' } as const)[graphql.type] : undefined,
    method: call.method,
    methodTone: methodTone(call.method),
    status: statusLabel(call),
    /** "200 · 1 error" for GraphQL responses that carry errors, as in the call list and summary bar. */
    statusDetail: graphql?.errors?.length
      ? `${statusLabel(call)} · ${graphql.errors.length} error${graphql.errors.length > 1 ? 's' : ''}`
      : statusLabel(call),
    statusTone: graphql?.errors?.length ? 'error' : statusTone(call),
    duration: durationLabel(call.durationMs) ?? '—',
    durationTone: isErrorOutcome(call) || isSlow(call) ? 'error' : 'muted',
    size: call.state === 'complete' && call.responseBody.bytes > 0 ? sizeLabel(call.responseBody.bytes) : '—',
    time: timeLabel(call.at),
  };
}
