import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon,
  title = 'No data',
  description = 'There is nothing to show here',
  action = null,
}) => {
  const Icon = icon || Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <Icon size={48} className="text-text-muted mb-4" />
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary mb-6">{description}</p>
      {action && action}
    </div>
  );
};
