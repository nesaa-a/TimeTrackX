// src/components/Filters/DepartmentFilter.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DepartmentFilter({ value, onChange }) {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    axios.get('/api/departments')
      .then(res => setDepartments(res.data))
      .catch(console.error);
  }, []);

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="">Të gjithë</option>
      {departments.map(dep => (
        <option key={dep.id} value={dep.name}>{dep.name}</option>
      ))}
    </select>
  );
}