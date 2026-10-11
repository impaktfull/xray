import type { ComponentChildren } from 'preact';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  action?: ComponentChildren;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div class="xr-empty">
      <span class="xr-empty__icon">
        <Icon name={icon} size={22} />
      </span>
      <p class="xr-empty__title">{title}</p>
      {message && <p class="xr-empty__message">{message}</p>}
      {action}
    </div>
  );
}
