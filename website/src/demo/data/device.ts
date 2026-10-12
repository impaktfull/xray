import type { DeviceSettings, DeviceState, Platform } from '../model/types';

const defaults: DeviceSettings = {
  appearance: 'system',
  locale: 'en_BE',
  textScale: 1,
  animations: '1',
  boldText: false,
  highContrast: false,
  layoutBounds: false,
  performanceOverlay: false,
};

const os: Record<Platform, string> = { android: 'Android 15', ios: 'iOS 18.0', macos: 'macOS 15.1' };

/** The impaktfull dashboard's device-side state that Device Actions reads and overrides. */
export function createDeviceState(platform: Platform): DeviceState {
  return {
    os: os[platform],
    appVersion: '3.4.0 (412)',
    buildMode: 'debug',
    settings: defaults,
    defaults,
    flags: [
      { key: 'new_project_board', type: 'bool', source: 'remote', remote: false, value: false },
      { key: 'invoice_export_v2', type: 'bool', source: 'remote', remote: true, value: true },
      { key: 'max_upload_mb', type: 'int', source: 'remote', remote: 25, value: 25 },
      { key: 'onboarding_variant', type: 'String', source: 'local', remote: 'b', value: 'b' },
    ],
    routes: ['/', '/projects', '/projects/:id', '/projects/:id/tasks', '/invoices/:id', '/settings'],
    recentLinks: ['myapp://invoices/2026-118', 'https://dashboard.impaktfull.example/projects/37'],
  };
}

export const locales: { id: string; label: string }[] = [
  { id: 'en_BE', label: 'English (Belgium)' },
  { id: 'nl_BE', label: 'Dutch (Belgium)' },
  { id: 'fr_BE', label: 'French (Belgium)' },
  { id: 'de_DE', label: 'German (Germany)' },
  { id: 'ar_EG', label: 'Arabic (Egypt) · RTL' },
];
