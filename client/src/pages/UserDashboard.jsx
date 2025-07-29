// src/pages/UserDashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>User Panel</h1>
      <p>Welcome, {user.username || user.Username} (Role: {user.roleName || user.RoleName})</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}