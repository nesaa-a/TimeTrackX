import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ProtectedRoute component for route guarding
export const ProtectedRoute = ({ 
  requireAuth = true, 
  requiredRole = null, 
  redirectTo = '/login',
  children 
}) => {
  const { user, token } = useAuth();

  // If authentication is required but user is not authenticated
  if (requireAuth && !token) {
    return <Navigate to={redirectTo} replace />;
  }

  // If a specific role is required but user doesn't have it
  if (requiredRole && user && user.roleName !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If children are provided, render them, otherwise render Outlet
  return children ? children : <Outlet />;
};

// Higher-order component for role-based protection
export const withRole = (Component, requiredRole) => {
  return (props) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Higher-order component for authentication protection
export const withAuth = (Component) => {
  return (props) => (
    <ProtectedRoute>
      <Component {...props} />
    </ProtectedRoute>
  );
}; 