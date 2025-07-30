// src/components/Filters/StatusFilter.jsx
import React from 'react';

export default function StatusFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="">Gjithë</option>
      <option value="active">Aktiv</option>
      <option value="inactive">Jo‑Aktiv</option>
    </select>
  );
}
