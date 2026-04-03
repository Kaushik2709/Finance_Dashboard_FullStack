import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { AlertCircle } from 'lucide-react';

export const RoleGuard = ({ roles, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    if (fallback) return fallback;

    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto mb-4 text-warning" size={32} />
        <p className="text-text-primary font-medium">Access Denied</p>
        <p className="text-text-secondary text-sm mt-2">
          You don't have permission to view this content
        </p>
      </div>
    );
  }

  return children;
};
