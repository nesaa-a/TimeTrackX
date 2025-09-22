import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStatuses, setUserStatuses] = useState([]);
  const [isHR, setIsHR] = useState(false);

  // Decode JWT role
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "hr") setIsHR(true);
    } catch (err) {
      console.error("Failed to decode token", err);
    }
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5051/api/dashboard/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    if (isHR) fetchStats();
  }, [isHR]);

  // Fetch user attendance statuses
  useEffect(() => {
    if (!isHR) return;

    const fetchStatuses = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:5051/api/attendance/statuses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUserStatuses(data);
      } catch (err) {
        console.error("Failed to fetch user statuses:", err);
      }
    };

    fetchStatuses();
  }, [isHR]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-10 text-white">Dashboard</h1>

        {isHR ? (
          <>
            {loading ? (
              <div className="text-gray-300 text-lg">Loading dashboard data...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <StatCard title="Total Users" value={stats.totalUsers} />
                <StatCard title="Today's Check-ins" value={stats.checkInsToday} />
                <StatCard title="Total Tasks" value={stats.totalTasks ?? 0} />
                <StatCard title="Completed Tasks" value={stats.completedTasks ?? 0} />
                <StatCard title="Active Sessions" value={stats.activeSessions ?? 0} />
               
              </div>
            )}

            <div>
              <h2 className="text-2xl font-semibold mb-4">User Attendance Status</h2>
              <div className="overflow-x-auto bg-gray-900 border border-gray-700 rounded-xl shadow-md">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-800 text-gray-300 uppercase">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStatuses.map((user) => (
                      <tr key={user.id} className="border-t border-gray-700">
                        <td className="px-6 py-3">{user.name}</td>
                        <td className="px-6 py-3 capitalize text-gray-400">{user.role}</td>
                        <td className="px-6 py-3 font-medium">
                          {user.status === "Checked In" && (
                            <span className="text-green-400">Checked In</span>
                          )}
                          {user.status === "Checked Out" && (
                            <span className="text-yellow-400">Checked Out</span>
                          )}
                          {user.status === "Not Checked In" && (
                            <span className="text-red-400">Not Checked In</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-xl text-gray-300">
            Welcome! You are logged in. No administrative access.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-md transition-all hover:scale-[1.02]">
      <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-indigo-400">{value}</p>
    </div>
  );
}

export default DashboardPage;