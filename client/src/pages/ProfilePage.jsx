import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", newPass: "", confirm: "" });
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState("history");
  const [history, setHistory] = useState([]);
  const [tasks, setTasks] = useState([]);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5051/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.profile);
      setNewName(data.profile.name);
    } catch (err) {
      console.error("Error fetching profile", err);
      setStatus("Failed to load profile.");
    }
  };

  const handleNameSave = async () => {
    try {
      const res = await fetch("http://localhost:5051/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) return setStatus(data.message || "Failed to update name");
      setUser((prev) => ({ ...prev, name: newName }));
      setStatus("Name updated successfully");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating name:", err);
      setStatus("Error saving name");
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      // TODO: send file to backend
    }
  };

  const handlePasswordSave = async () => {
    if (passwordData.newPass !== passwordData.confirm) {
      return setStatus("Passwords do not match");
    }
    try {
      const res = await fetch("http://localhost:5051/api/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setStatus(data.message || "Failed to update password");
      setStatus("Password changed successfully");
      setPasswordData({ current: "", newPass: "", confirm: "" });
      setShowPasswordSection(false);
    } catch (err) {
      console.error("Error changing password:", err);
      setStatus("Error changing password");
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetch("http://localhost:5051/api/attendance/history", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setHistory)
        .catch(() => setHistory([]));
    } else if (activeTab === "tasks") {
      axios
        .get("http://localhost:5051/api/tasks/mine", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setTasks(res.data || []))
        .catch(() => setTasks([]));
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        {/* Avatar + Info */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            <img
              src={avatar || `https://ui-avatars.com/api/?name=${user?.name || "User"}`}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-indigo-600 object-cover"
            />
            <input
              type="file"
              accept="image/*"
              className="absolute bottom-0 right-0 w-6 h-6 opacity-0 cursor-pointer"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <div className="text-xl font-semibold">{user?.name}</div>
            <div className="text-gray-400 text-sm">{user?.email}</div>
            <div className="text-gray-400 text-sm capitalize">Role: {user?.role}</div>
            {user?.totalHoursWorked !== undefined && (
              <div className="text-gray-400 text-sm">
                Hours Worked: {user.totalHoursWorked.toFixed(2)}h
              </div>
            )}
          </div>
        </div>

        {/* Edit + Password */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={!editMode}
            />
          </div>

          {editMode ? (
            <div className="flex space-x-3">
              <button onClick={handleNameSave} className="bg-green-600 px-4 py-2 rounded">
                Save
              </button>
              <button onClick={() => setEditMode(false)} className="bg-gray-600 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
            >
              Edit Name
            </button>
          )}

          <button
            className="block mt-6 text-sm text-indigo-400 hover:underline"
            onClick={() => setShowPasswordSection((prev) => !prev)}
          >
            {showPasswordSection ? "Hide" : "Change Password"}
          </button>

          {showPasswordSection && (
            <div className="mt-4 space-y-3">
              {["Current Password", "New Password", "Confirm New Password"].map((label, i) => (
                <input
                  key={i}
                  type="password"
                  placeholder={label}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                  value={
                    i === 0
                      ? passwordData.current
                      : i === 1
                      ? passwordData.newPass
                      : passwordData.confirm
                  }
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      [i === 0 ? "current" : i === 1 ? "newPass" : "confirm"]: e.target.value,
                    }))
                  }
                />
              ))}
              <button
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
                onClick={handlePasswordSave}
              >
                Save Password
              </button>
            </div>
          )}
        </div>

        {status && <p className="mt-4 text-sm text-center text-red-400">{status}</p>}

        {/* Tabs */}
        <div className="mt-10">
          <div className="flex space-x-4 border-b border-gray-700 mb-4">
            {["history", "tasks"].map((tab) => (
              <button
                key={tab}
                className={`pb-2 ${
                  activeTab === tab
                    ? "border-b-2 border-indigo-500 text-indigo-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "history" ? "Check-In History" : "Task Summary"}
              </button>
            ))}
          </div>

          {/* Table */}
          {activeTab === "history" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-900 border border-gray-700 text-sm rounded-lg">
                <thead>
                  <tr className="bg-gray-800 text-gray-400">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Check-In</th>
                    <th className="px-4 py-2">Check-Out</th>
                    <th className="px-4 py-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-500">
                        No check-in history.
                      </td>
                    </tr>
                  ) : (
                    history.map((entry, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-700 hover:bg-gray-800 transition"
                      >
                        <td className="px-4 py-2">
                          {new Date(entry.checkInTime).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(entry.checkInTime).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-2">
                          {entry.checkOutTime
                            ? new Date(entry.checkOutTime).toLocaleTimeString()
                            : "—"}
                        </td>
                        <td className="px-4 py-2">
                          {entry.hoursWorked != null ? `${entry.hoursWorked}h` : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-900 border border-gray-700 text-sm rounded-lg">
                <thead>
                  <tr className="bg-gray-800 text-gray-400">
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center py-4 text-gray-500">
                        No tasks assigned.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-t border-gray-700 hover:bg-gray-800 transition"
                      >
                        <td className="px-4 py-2">{task.title}</td>
                        <td className="px-4 py-2 capitalize">{task.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;