// All copy on the home page that comes from a list, so the sections stay markup only.

export interface Feature {
  icon: string;
  title: string;
  body: string;
  /** Tour step in the hero demo this feature can be tried in. */
  demoStep?: string;
}

export const features: Feature[] = [
  {
    icon: 'wifi-high',
    title: 'Network inspector',
    body: 'Every request from Dio, http and HttpClient, with headers, bodies, sizes and timing. Failing and slow calls stand out.',
    demoStep: 'live-network',
  },
  {
    icon: 'graph',
    title: 'GraphQL, readable',
    body: 'Operations by name, with variables and errors in their own view and a jump to the line that failed.',
    demoStep: 'graphql-error',
  },
  {
    icon: 'file-text',
    title: 'Logs',
    body: 'Every log with its level, logger, error and stack trace. Search, filter, expand.',
    demoStep: 'log-stack-trace',
  },
  {
    icon: 'database',
    title: 'Storage you can edit',
    body: 'Change SharedPreferences and secure storage while the app runs, JSON values included.',
    demoStep: 'edit-value',
  },
  {
    icon: 'chart-bar-horizontal',
    title: 'One timeline',
    body: 'Calls, logs and storage changes on one axis, so you see what happened around a bug.',
    demoStep: 'timeline',
  },
  {
    icon: 'devices',
    title: 'Every device, every app',
    body: 'Apps running xRay on your network show up on their own. Open several side by side.',
    demoStep: 'multi-device',
  },
  {
    icon: 'folder',
    title: 'Files',
    body: "Browse the app's documents and caches and preview what's inside.",
    demoStep: 'files',
  },
  {
    icon: 'export',
    title: 'Share a session',
    body: 'Export a session as a .xray file or HAR, with tokens and secrets redacted.',
    demoStep: 'export-session',
  },
  {
    icon: 'command',
    title: 'Command menu & device actions',
    body: 'Search everything with ⌘K, switch dark mode, open deep links and send test pushes to the device.',
    demoStep: 'command-menu',
  },
];

export const steps = [
  {
    title: 'Add the package',
    body: 'Add xray_inspector to your Flutter app and start the inspector in debug builds.',
  },
  {
    title: 'Run your app',
    body: 'The inspector runs inside your app on your local network. Release builds stay untouched.',
  },
  {
    title: 'Open xRay',
    body: 'The desktop app finds your app and connects. Data goes straight from your device to your computer, never through a server.',
  },
];

export interface Platform {
  id: 'macos' | 'windows' | 'linux';
  name: string;
  icon: string;
  requirement: string;
  format: string;
}

export const platforms: Platform[] = [
  { id: 'macos', name: 'macOS', icon: 'apple-logo', requirement: 'macOS 10.15 or later', format: 'DMG or Homebrew' },
  { id: 'windows', name: 'Windows', icon: 'windows-logo', requirement: 'Windows 10 or later', format: 'Installer' },
  { id: 'linux', name: 'Linux', icon: 'linux-logo', requirement: 'x86_64 with GTK 3', format: 'AppImage' },
];
