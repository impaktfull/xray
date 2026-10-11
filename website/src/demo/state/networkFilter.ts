import type { HttpMethod, NetworkCall } from '../model/types';

export type StatusClass = '2xx' | '3xx' | '4xx' | '5xx' | 'failed' | 'pending';

export interface NetworkFilter {
  methods: HttpMethod[];
  statusClasses: StatusClass[];
  slowerThanMs?: number;
  apiOnly: boolean;
  imagesOnly: boolean;
}

export const emptyNetworkFilter: NetworkFilter = { methods: [], statusClasses: [], apiOnly: false, imagesOnly: false };

export const networkPresets = {
  errorsOnly: { label: 'Errors only', filter: { ...emptyNetworkFilter, statusClasses: ['4xx', '5xx', 'failed'] } },
  slow: { label: 'Slow > 1s', filter: { ...emptyNetworkFilter, slowerThanMs: 1_000 } },
  apiOnly: { label: 'API only', filter: { ...emptyNetworkFilter, apiOnly: true } },
  images: { label: 'Images', filter: { ...emptyNetworkFilter, imagesOnly: true } },
} satisfies Record<string, { label: string; filter: NetworkFilter }>;

export function statusClassOf(call: NetworkCall): StatusClass {
  if (call.state === 'failed') return 'failed';
  if (call.state === 'pending' || call.status === undefined) return 'pending';
  return `${Math.floor(call.status / 100)}xx` as StatusClass;
}

/** How many separate conditions are active; shown as "Filter · N" in the toolbar. */
export function activeFilterCount(filter: NetworkFilter): number {
  return (
    filter.methods.length +
    filter.statusClasses.length +
    (filter.slowerThanMs === undefined ? 0 : 1) +
    (filter.apiOnly ? 1 : 0) +
    (filter.imagesOnly ? 1 : 0)
  );
}

export function matchesFilter(call: NetworkCall, filter: NetworkFilter): boolean {
  if (filter.methods.length && !filter.methods.includes(call.method)) return false;
  if (filter.statusClasses.length && !filter.statusClasses.includes(statusClassOf(call))) return false;
  if (filter.slowerThanMs !== undefined && (call.durationMs ?? 0) <= filter.slowerThanMs) return false;
  if (filter.apiOnly && !/\/api\/|\/graphql/.test(call.url)) return false;
  if (filter.imagesOnly && call.responseBody.kind !== 'image' && !call.url.match(/\.(png|jpe?g|gif|webp)$/)) return false;
  return true;
}

export function matchesSearch(call: NetworkCall, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return [call.url, call.method, String(call.status ?? ''), call.graphql?.operationName ?? '']
    .some((field) => field.toLowerCase().includes(query));
}
