import { Sidebar, Card } from "flowbite-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  HomeIcon,
  UsersIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  // Shembull të dhënash, lidhi me API më vonë!
  const stats = {
    employees: 30,
    departments: 5,
    projects: 8,
    workHours: 540,
    users: 12,
  };

  const barData = {
    labels: ["Employees", "Departments", "Projects", "Work Hours", "Users"],
    datasets: [
      {
        label: "Total",
        data: [
          stats.employees,
          stats.departments,
          stats.projects,
          stats.workHours,
          stats.users,
        ],
        backgroundColor: [
          "#2563eb",
          "#14b8a6",
          "#fbbf24",
          "#7c3aed",
          "#ef4444",
        ],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Company Overview" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar className="w-56 shadow-xl">
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item href="#" icon={HomeIcon}>
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={UsersIcon}>
              Employees
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={BuildingOffice2Icon}>
              Departments
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={BriefcaseIcon}>
              Projects
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={ClockIcon}>
              Work Hours
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={UserCircleIcon}>
              Users
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <span className="font-medium text-gray-600">Welcome, Admin!</span>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <div className="text-2xl font-bold text-blue-700">{stats.employees}</div>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <div className="text-2xl font-bold text-teal-600">{stats.departments}</div>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-sm text-gray-500">Projects</p>
              <div className="text-2xl font-bold text-yellow-600">{stats.projects}</div>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
