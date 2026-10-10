import type { LogEntry } from '../model/types';

export type LogTemplate = Omit<LogEntry, 'id' | 'at'>;

const dioStack = `#0      DioMixin.fetch (package:dio/src/dio_mixin.dart:509:7)
#1      ProjectRepository.loadTasks (package:impaktfull_dashboard/repository/project_repository.dart:58:22)
#2      ProjectViewModel._refresh (package:impaktfull_dashboard/viewmodel/project_viewmodel.dart:91:18)
#3      ProjectViewModel.init (package:impaktfull_dashboard/viewmodel/project_viewmodel.dart:44:5)`;

const sessionStack = `#0      AuthRepository.signOut (package:impaktfull_dashboard/repository/auth_repository.dart:73:9)
#1      SettingsViewModel.onSignOutTapped (package:impaktfull_dashboard/viewmodel/settings_viewmodel.dart:112:7)`;

export const logs = {
  appStarted: { level: 'info', logger: 'App', message: 'impaktfull dashboard 3.4.0 (412) started in debug mode' },
  restoredSession: { level: 'debug', logger: 'Auth', message: 'Restored session for user 7 from secure storage' },
  signedIn: { level: 'success', logger: 'Auth', message: 'Signed in as Lena Maes' },
  navigateProjects: { level: 'debug', logger: 'Router', message: 'Navigated to /projects' },
  navigateProject: { level: 'debug', logger: 'Router', message: 'Navigated to /projects/42' },
  projectsLoaded: { level: 'info', logger: 'Projects', message: 'Loaded 5 projects (page 1)' },
  syncStarted: { level: 'debug', logger: 'Sync', message: 'Background sync started' },
  syncDone: { level: 'success', logger: 'Sync', message: 'Background sync finished: 3 projects updated' },
  cacheHit: { level: 'debug', logger: 'Cache', message: 'Served /api/v1/team from cache (age 42 s)' },
  analyticsEvent: { level: 'debug', logger: 'Analytics', message: "Tracked event 'project_opened' {id: 42}" },
  slowExport: { level: 'warn', logger: 'Invoices', message: 'Invoice export took 1.8 s (budget 1 s)' },
  tasksFailed: {
    level: 'warn',
    logger: 'Projects',
    message: 'Could not load tasks for project 42, showing cached tasks',
    error: 'DioException [connection error]: Connection reset by peer',
    stackTrace: dioStack,
  },
  signOutFailed: {
    level: 'error',
    logger: 'Auth',
    message: 'Failed to end session: 500 Session store unavailable',
    error: 'ApiException(500): internal_error',
    stackTrace: sessionStack,
  },
  archiveFailed: {
    level: 'error',
    logger: 'GraphQL',
    message: 'ArchiveProject failed: Project 29 has unpaid invoices and cannot be archived.',
  },
  themeChanged: { level: 'info', logger: 'Settings', message: 'Theme changed to dark' },
  notificationsPolled: { level: 'debug', logger: 'Notifications', message: '1 unread notification' },
  imageDecoded: { level: 'debug', logger: 'Images', message: 'Decoded avatar lena.png (128×128) in 6 ms' },
  frameJank: { level: 'warn', logger: 'Performance', message: 'Frame took 34 ms to build (ProjectBoard)' },
} satisfies Record<string, LogTemplate>;

export type LogName = keyof typeof logs;
