// src/pages/UserStatusPage.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function UserStatusPage() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch("http://localhost:5051/api/attendance/status", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await res.json();
        if (res.ok) setStatuses(data);
      } catch (err) {
        console.error("Status fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">User Attendance Status</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3 text-sm text-gray-500">{user.email}</td>
                    <td className="p-3 font-medium">
                      {user.status === "checked_in"
                        ? "Checked In"
                        : user.status === "checked_out"
                        ? "Checked Out"
                        : "Not Checked In"}
                    </td>
                    <td className="p-3 text-sm">{user.checkInTime || "-"}</td>
                    <td className="p-3 text-sm">{user.checkoutTime || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserStatusPage;