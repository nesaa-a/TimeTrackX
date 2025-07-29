// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.username || user.Username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}