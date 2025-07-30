// src/pages/EmployeesPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepartmentFilter from '../components/Filters/DepartmentFilter';
import StatusFilter from '../components/Filters/StatusFilter';
import EmployeeForm from '../components/Employee/EmployeeForm';
import EmployeeTable from '../components/Employee/EmployeeTable';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({ department: '', status: '' });
  const [editing, setEditing] = useState(null);

  const fetchEmployees = () => {
    axios.get('/api/employees', { params: filter })
      .then(res => setEmployees(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchEmployees();
  }, [filter]);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Menaxho Punonjësit</h1>
      <div className="flex space-x-4 mb-6">
        <DepartmentFilter
          value={filter.department}
          onChange={dept => setFilter(f => ({ ...f, department: dept }))}
        />
        <StatusFilter
          value={filter.status}
          onChange={st => setFilter(f => ({ ...f, status: st }))}
        />
      </div>
      <EmployeeTable
        data={employees}
        onEdit={emp => setEditing(emp)}
        onDelete={id => {
          axios.delete(`/api/employees/${id}`)
            .then(fetchEmployees)
            .catch(console.error);
        }}
      />
      <EmployeeForm
        key={editing?.id || 'new'}
        initialData={editing}
        onSubmit={data => {
          const request = editing
            ? axios.put(`/api/employees/${editing.id}`, data)
            : axios.post('/api/employees', data);
          request
            .then(() => {
              setEditing(null);
              fetchEmployees();
            })
            .catch(console.error);
        }}
      />
    </div>
  );
}