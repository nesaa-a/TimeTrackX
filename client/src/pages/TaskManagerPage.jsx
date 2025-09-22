import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

function TaskManagerPage() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5051/api/users/employers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
      } else {
        console.error("Employer fetch failed:", data);
        setMessage(data.message || "Failed to fetch employers");
      }
    } catch (err) {
      console.error("Employer fetch error:", err);
      setMessage("Error fetching employers");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    setMessage("");

    if (!selectedUserId || !title || !description || !deadline || !priority) {
      setMessage("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5051/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          title,
          description,
          deadline,
          priority,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Task assigned successfully.");
        setSelectedUserId("");
        setTitle("");
        setDescription("");
        setDeadline("");
        setPriority("medium");
      } else {
        console.error("Assign task error:", data);
        setMessage(data.message || "❌ Failed to assign task.");
      }
    } catch (err) {
      console.error("Assign task fetch error:", err);
      setMessage("❌ Error assigning task.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#111827] text-white">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center">Assign Task</h1>

          {message && (
            <div className="mb-6 px-4 py-2 rounded bg-gray-800 text-yellow-300 border border-yellow-500 text-center">
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block mb-1 text-sm text-gray-300">Employee</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              >
                <option value="">-- Select --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">Task Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              onClick={handleAssignTask}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
            >
              Assign Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskManagerPage;