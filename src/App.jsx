import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

// Placeholder components for sub-routes
const Placeholder = ({ title }) => <div className="p-4 bg-white border">Placeholder: {title}</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Super Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/super-admin" element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="users" element={<Placeholder title="Super Admin Users" />} />
              <Route path="system" element={<Placeholder title="System Settings" />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="team" element={<Placeholder title="Team Management" />} />
              <Route path="assignments" element={<Placeholder title="Assignments" />} />
            </Route>
          </Route>

          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/user" element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="tasks" element={<Placeholder title="My Tasks List" />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
