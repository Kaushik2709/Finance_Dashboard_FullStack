import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-success-light text-success',
    danger: 'bg-danger-light text-danger',
    warning: 'bg-warning-light text-warning',
    admin: 'bg-primary-light text-primary',
    analyst: 'bg-warning-light text-warning',
    viewer: 'bg-gray-100 text-gray-700',
    active: 'bg-success-light text-success',
    inactive: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
