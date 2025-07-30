// src/components/Employee/EmployeeTable.jsx
import React from 'react';

export default function EmployeeTable({ data, onEdit, onDelete }) {
  return (
    <table className="w-full bg-white rounded shadow-sm">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="p-2 text-left">Emri</th>
          <th className="p-2 text-left">Departamenti</th>
          <th className="p-2 text-left">Statusi</th>
          <th className="p-2 text-left">Veprime</th>
        </tr>
      </thead>
      <tbody>
        {data.map(emp => (
          <tr key={emp.id} className="border-b hover:bg-gray-50">
            <td className="p-2">{emp.name}</td>
            <td className="p-2">{emp.department}</td>
            <td className="p-2 capitalize">{emp.status}</td>
            <td className="p-2 space-x-2">
              <button
                onClick={() => onEdit(emp)}
                className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(emp.id)}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}