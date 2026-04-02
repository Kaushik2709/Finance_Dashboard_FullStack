import React from 'react';

export const StatCard = ({ title, value, accent = 'primary', icon: Icon }) => {
  const accentColors = {
    primary: 'bg-primary-light border-primary/30',
    success: 'bg-success-light border-success/30',
    danger: 'bg-danger-light border-danger/30',
    warning: 'bg-warning-light border-warning/30',
  };

  const accentIconColors = {
    primary: 'text-primary',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
  };

  return (
    <div className={`bg-white border border-border rounded-lg shadow-sm p-6 ${accentColors[accent]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-2">{value}</p>
        </div>
        {Icon && (
          <Icon size={24} className={accentIconColors[accent] || accentIconColors.primary} />
        )}
      </div>
    </div>
  );
};
