import React from 'react';
import { Sidebar, Navbar } from '../components/Layout'; 
import { Card, Button } from 'flowbite-react';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />  {/* Komponent i vetëm për sidebar */}
      <div className="flex-1 flex flex-col">
        <Navbar /> {/* Komponent i vetëm për navbar */}
        <main className="p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <h2 className="text-xl font-semibold">Numri i Punonjësve</h2>
              <p className="mt-2 text-3xl">42</p>
            </Card>
            <Card>
              <h2 className="text-xl font-semibold">Orët e Kyçuara Sot</h2>
              <p className="mt-2 text-3xl">128</p>
            </Card>
            {/* …shto edhe Card për projekte, departamente, etj. */}
          </div>
        </main>
      </div>
    </div>
  );
}
