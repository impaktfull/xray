import type { KvStore } from '../model/types';

export const createStores = (): KvStore[] => [
  {
    id: 'shared_preferences',
    label: 'SharedPreferences',
    entries: [
      { key: 'onboarding_completed', type: 'bool', value: true },
      { key: 'theme_mode', type: 'String', value: 'system' },
      { key: 'last_project_id', type: 'int', value: 42 },
      { key: 'hours_goal', type: 'double', value: 32.5 },
      { key: 'recent_searches', type: 'List<String>', value: ['atlas', 'invoice 118', 'design system'] },
      {
        key: 'dashboard_layout',
        type: 'String',
        value: JSON.stringify({
          columns: 3,
          widgets: [
            { type: 'projects', size: 'large' },
            { type: 'hours', size: 'small' },
            { type: 'invoices', size: 'small' },
          ],
          compact: false,
        }),
      },
      { key: 'notifications_enabled', type: 'bool', value: true },
      { key: 'locale', type: 'String', value: 'en_BE' },
    ],
  },
  {
    id: 'secure_storage',
    label: 'Secure storage',
    entries: [
      { key: 'access_token', type: 'String', value: 'eyJhbGciOiJIUzI1NiJ9.demo.signature' },
      { key: 'refresh_token', type: 'String', value: 'rt_demo_4f8c2a9e1b7d' },
      { key: 'user_id', type: 'String', value: '7' },
    ],
  },
];
