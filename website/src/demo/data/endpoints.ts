import type { NetworkCall } from '../model/types';
import { image, json, none } from './bodies';

// The fictional API the impaktfull dashboard app talks to. Every name, id and value is made up.

export const apiHost = 'https://api.impaktfull.dev';

export type CallTemplate = Omit<NetworkCall, 'id' | 'at'>;

const requestHeaders = (extra: Record<string, string> = {}) => ({
  accept: 'application/json',
  authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.demo.signature',
  'user-agent': 'impaktfull-dashboard/3.4.0 (Flutter; Dart 3.9)',
  'x-request-id': 'rq_7f3a91c2',
  ...extra,
});

const responseHeaders = (extra: Record<string, string> = {}) => ({
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  date: 'Sat, 10 Oct 2026 14:03:07 GMT',
  server: 'impaktfull-api',
  ...extra,
});

const projects = [
  { id: 42, name: 'Atlas mobile app', client: 'Northwind', status: 'in_progress', progress: 0.68 },
  { id: 37, name: 'Customer portal', client: 'Brightline', status: 'in_review', progress: 0.91 },
  { id: 51, name: 'Design system v2', client: 'Internal', status: 'in_progress', progress: 0.34 },
  { id: 29, name: 'Loyalty program', client: 'Fresh & Co', status: 'done', progress: 1 },
  { id: 58, name: 'Analytics revamp', client: 'Northwind', status: 'planned', progress: 0 },
];

const team = [
  { id: 7, name: 'Lena Maes', role: 'Flutter developer', avatar: '/assets/avatars/lena.png' },
  { id: 12, name: 'Arne De Smet', role: 'Backend developer', avatar: '/assets/avatars/arne.png' },
  { id: 19, name: 'Sara Peeters', role: 'Product designer', avatar: '/assets/avatars/sara.png' },
];

const call = (
  method: CallTemplate['method'],
  path: string,
  status: number,
  durationMs: number,
  response: unknown,
  request?: unknown,
): CallTemplate => ({
  method,
  url: `${apiHost}${path}`,
  state: 'complete',
  status,
  durationMs,
  requestHeaders: requestHeaders(request === undefined ? {} : { 'content-type': 'application/json' }),
  responseHeaders: responseHeaders(),
  requestBody: request === undefined ? none : json(request),
  responseBody: json(response),
});

export const endpoints = {
  login: call(
    'POST',
    '/api/v1/auth/login',
    200,
    342,
    { accessToken: 'eyJhbGciOiJIUzI1NiJ9.demo.signature', expiresIn: 3600, user: { id: 7, name: 'Lena Maes' } },
    { email: 'lena@impaktfull.example', password: '••••••••' },
  ),
  me: call('GET', '/api/v1/me', 200, 88, { id: 7, name: 'Lena Maes', email: 'lena@impaktfull.example', role: 'admin' }),
  projects: call('GET', '/api/v1/projects?page=1&limit=20', 200, 124, {
    page: 1,
    total: projects.length,
    items: projects,
  }),
  project: call('GET', '/api/v1/projects/42', 200, 96, {
    ...projects[0],
    budget: { currency: 'EUR', planned: 48000, spent: 31250 },
    members: team.map((member) => member.id),
    milestones: [
      { name: 'Beta', due: '2026-10-24', done: false },
      { name: 'Launch', due: '2026-11-28', done: false },
    ],
  }),
  updateProject: call('PATCH', '/api/v1/projects/42', 200, 156, { ...projects[0], status: 'in_review' }, { status: 'in_review' }),
  team: call('GET', '/api/v1/team', 200, 71, { items: team }),
  notifications: call('GET', '/api/v1/notifications?unread=true', 200, 64, {
    items: [{ id: 'n_301', title: 'Customer portal is ready for review', projectId: 37 }],
  }),
  updateSettings: call('PUT', '/api/v1/settings/notifications', 200, 89, { email: false, push: true }, { email: false, push: true }),
  exportInvoice: call('POST', '/api/v1/invoices/2026-118/export', 202, 1840, {
    jobId: 'exp_2026_118',
    format: 'pdf',
    status: 'queued',
  }),
  deleteSession: {
    ...call('DELETE', '/api/v1/sessions/current', 500, 1210, {
      error: 'internal_error',
      message: 'Session store unavailable',
      traceId: 'tr_19ac44',
    }),
  },
  avatar: {
    ...call('GET', '/assets/avatars/lena.png', 200, 47, null),
    requestHeaders: requestHeaders({ accept: 'image/*' }),
    responseHeaders: responseHeaders({ 'content-type': 'image/png', 'cache-control': 'max-age=86400' }),
    responseBody: image(18_840),
  },
  analytics: call('GET', '/api/v1/analytics/dashboard?range=7d', 200, 212, {
    range: '7d',
    activeProjects: 3,
    hoursLogged: 186.5,
    invoicesOpen: 4,
  }),
  tasks: {
    method: 'GET',
    url: `${apiHost}/api/v1/projects/42/tasks`,
    state: 'failed',
    durationMs: 3012,
    requestHeaders: requestHeaders(),
    responseHeaders: {},
    requestBody: none,
    responseBody: none,
    error: 'SocketException: Connection reset by peer (OS Error: Connection reset by peer, errno = 54)',
  },
  projectOverview: {
    ...call('POST', '/graphql', 200, 138, {
      data: {
        project: {
          id: '42',
          name: 'Atlas mobile app',
          progress: 0.68,
          openTasks: 14,
          lead: { name: 'Lena Maes' },
        },
      },
    }),
    requestBody: json({
      operationName: 'ProjectOverview',
      query: 'query ProjectOverview($id: ID!) {\n  project(id: $id) {\n    id\n    name\n    progress\n    openTasks\n    lead { name }\n  }\n}',
      variables: { id: '42' },
    }),
    graphql: {
      type: 'query',
      operationName: 'ProjectOverview',
      document:
        'query ProjectOverview($id: ID!) {\n  project(id: $id) {\n    id\n    name\n    progress\n    openTasks\n    lead {\n      name\n    }\n  }\n}',
      variables: { id: '42' },
      data: {
        project: { id: '42', name: 'Atlas mobile app', progress: 0.68, openTasks: 14, lead: { name: 'Lena Maes' } },
      },
    },
  },
  archiveProject: {
    ...call('POST', '/graphql', 200, 181, {
      data: { archiveProject: null },
      errors: [
        {
          message: 'Project 29 has unpaid invoices and cannot be archived.',
          locations: [{ line: 4, column: 5 }],
          path: ['archiveProject'],
          extensions: { code: 'FAILED_PRECONDITION' },
        },
      ],
    }),
    requestBody: json({
      operationName: 'ArchiveProject',
      query: 'mutation ArchiveProject($id: ID!) {\n  archiveProject(id: $id) {\n    id\n    archivedAt\n  }\n}',
      variables: { id: '29' },
    }),
    graphql: {
      type: 'mutation',
      operationName: 'ArchiveProject',
      document: 'mutation ArchiveProject(\n  $id: ID!\n) {\n  archiveProject(id: $id) {\n    id\n    archivedAt\n  }\n}',
      variables: { id: '29' },
      data: { archiveProject: null },
      errors: [{ message: 'Project 29 has unpaid invoices and cannot be archived.', line: 4, path: ['archiveProject'] }],
      extensions: { code: 'FAILED_PRECONDITION' },
    },
  },
} satisfies Record<string, CallTemplate>;

export type EndpointName = keyof typeof endpoints;
