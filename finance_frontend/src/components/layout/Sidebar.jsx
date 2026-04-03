import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Tags,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

export const Sidebar = () => {
  const { user, logout, isRole } = useAuth();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      visible: true,
    },
    {
      label: 'Records',
      icon: FileText,
      path: '/records',
      visible: true,
    },
    {
      label: 'Users',
      icon: Users,
      path: '/users',
      visible: isRole(ROLES.ADMIN),
    },
    {
      label: 'Categories',
      icon: Tags,
      path: '/categories',
      visible: isRole(ROLES.ADMIN),
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">Finance</h1>
        <p className="text-xs text-text-secondary mt-1">Dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-primary hover:bg-muted transition-colors mb-2"
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-text-secondary mb-3 px-4">
          <p className="font-medium">{user?.name}</p>
          <p className="capitalize text-text-muted">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-danger hover:bg-danger-light transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};
