import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", role: "employer" });

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5051/api/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else setMessage(data.message || "Failed to fetch users");
    } catch (err) {
      console.error(err);
      setMessage("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditForm({ name: user.name, role: user.role });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ name: "", role: "employer" });
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`http://localhost:5051/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ User updated successfully");
        fetchUsers();
        cancelEdit();
      } else {
        setMessage(data.message || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error during update");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:5051/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("❌ User deleted successfully");
        fetchUsers();
      } else {
        setMessage(data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error deleting user");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Admin Dashboard – Manage Users</h2>

        {message && (
          <div className="text-sm mb-4 px-4 py-2 rounded bg-yellow-100 text-yellow-800 border border-yellow-400">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-400 text-sm">No users found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-800 shadow-md">
            <table className="min-w-full bg-gray-900 text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-800">
                    <td className="px-4 py-2">{user.id}</td>
                    <td className="px-4 py-2">
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-full"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-300">{user.email}</td>
                    <td className="px-4 py-2 capitalize">
                      {editingUserId === user.id ? (
                        <select
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1"
                          value={editForm.role}
                          onChange={(e) =>
                            setEditForm({ ...editForm, role: e.target.value })
                          }
                        >
                          <option value="employer">Employer</option>
                          <option value="hr">HR</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2 text-center">
                      {editingUserId === user.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(user.id)}
                            className="text-green-400 hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-400 hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(user)}
                            className="text-blue-400 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
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

export default AdminDashboardPage;