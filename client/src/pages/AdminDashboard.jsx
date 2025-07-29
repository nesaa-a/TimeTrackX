// src/pages/AdminDashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome, {user.username || user.Username} (Admin)</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
