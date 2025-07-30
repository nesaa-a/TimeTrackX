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

// src/components/Employee/EmployeeForm.jsx
import React, { useState, useEffect } from 'react';

export default function EmployeeForm({ initialData, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    department: '',
    status: 'active',
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        department: initialData.department || '',
        status: initialData.status || 'active',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: '', department: '', status: 'active' });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white p-4 rounded shadow-md">
      <h2 className="text-xl mb-4">{initialData ? 'Ndrysho Punonjësin' : 'Punëso Punonjës'}</h2>
      <div className="flex flex-col space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Emri"
          className="border p-2 rounded"
          required
        />
        <input
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Departamenti"
          className="border p-2 rounded"
          required
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="active">Aktiv</option>
          <option value="inactive">Jo‑Aktiv</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {initialData ? 'Ruaj Ndryshimet' : 'Shto Punonjës'}
        </button>
      </div>
    </form>
  );
}
