// src/components/Layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r">
      <ul className="p-4 space-y-2">
        <li><Link to="/admin" className="block p-2 hover:bg-gray-200 rounded">Dashboard</Link></li>
        <li><Link to="/employees" className="block p-2 hover:bg-gray-200 rounded">Punonjësit</Link></li>
        <li><Link to="/departments" className="block p-2 hover:bg-gray-200 rounded">Departamentet</Link></li>
      </ul>
    </aside>
  );
}