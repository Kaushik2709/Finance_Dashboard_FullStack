import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { PrivateRoute } from './components/guards/PrivateRoute.jsx';
import { RoleGuard } from './components/guards/RoleGuard.jsx';
import { ROLES } from './utils/constants.js';

import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Records } from './pages/Records.jsx';
import { Users } from './pages/Users.jsx';
import { Categories } from './pages/Categories.jsx';
import { NotFound } from './pages/NotFound.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={<Navigate to="/dashboard" />}
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/records"
            element={
              <PrivateRoute>
                <Records />
              </PrivateRoute>
            }
          />

          <Route
            path="/users"
            element={
              <PrivateRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <Users />
                </RoleGuard>
              </PrivateRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <Categories />
                </RoleGuard>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
