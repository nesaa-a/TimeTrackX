// src/App.js
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Unauthorized from './pages/Unauthorized';
import { useAuth } from './contexts/AuthContext';
import EmployeesPage from './pages/EmployeesPage';
// Removed unused imports - these should be imported in the components that use them

function ProtectedRoute({ role }) {
  const auth = useAuth();
  const user = auth?.user;
  
  if (!auth) {
    return <div>Loading...</div>;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.roleName !== role) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>  {/* any authenticated user */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user" element={<UserDashboard />} />
      </Route>
      <Route element={<ProtectedRoute role="Admin" />}> {/* only Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
