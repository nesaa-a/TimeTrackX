import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DepartmentFilter, StatusFilter } from '../components/Filters';
import { EmployeeForm, EmployeeTable } from '../components/Employee';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter]     = useState({ department: '', status: '' });
  const [editing, setEditing]   = useState(null);

  useEffect(() => {
    axios.get('/api/employees', { params: filter })
         .then(res => setEmployees(res.data))
         .catch(console.error);
  }, [filter]);

  const refresh = () => {
    axios.get('/api/employees', { params: filter })
         .then(res => setEmployees(res.data))
         .catch(console.error);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Menaxho Punonjësit</h1>
      <div className="flex space-x-4 mb-6">
        <DepartmentFilter value={filter.department}
                          onChange={dept => setFilter(f => ({ ...f, department: dept }))} />
        <StatusFilter     value={filter.status}
                          onChange={st   => setFilter(f => ({ ...f, status: st }))} />
      </div>
      <EmployeeTable
        data={employees}
        onEdit={emp => setEditing(emp)}
        onDelete={id => {
          axios.delete(`/api/employees/${id}`)
               .then(refresh)
               .catch(console.error);
        }}
      />
      <EmployeeForm
        key={editing?.id || 'new'}
        initialData={editing}
        onSubmit={data => {
          const req = editing
            ? axios.put(`/api/employees/${editing.id}`, data)
            : axios.post('/api/employees', data);
          req.then(() => {
                setEditing(null);
                refresh();
              })
             .catch(console.error);
        }}
      />
    </div>
  );
}
