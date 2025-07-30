// src/components/Layout/Navbar.jsx
import React from 'react';

export default function Navbar() {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="text-lg font-semibold">TimeTrackX</div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Dil
      </button>
    </header>
  );
}