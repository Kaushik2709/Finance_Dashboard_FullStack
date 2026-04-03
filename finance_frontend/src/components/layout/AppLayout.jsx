import React from 'react';
import { Sidebar } from './Sidebar.jsx';

export const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
