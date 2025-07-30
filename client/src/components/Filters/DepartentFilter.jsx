// src/components/Filters/DepartentFilter.jsx
import React from 'react';

export default function DepartmentFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="">Gjithë Departamentet</option>
      <option value="IT">IT</option>
      <option value="HR">HR</option>
      <option value="Finance">Finance</option>
      <option value="Marketing">Marketing</option>
      <option value="Sales">Sales</option>
    </select>
  );
}