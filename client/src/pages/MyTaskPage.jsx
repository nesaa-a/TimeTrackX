import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5051/api/tasks/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && Array.isArray(res.data)) {
          const sorted = res.data.sort(
            (a, b) => new Date(a.deadline) - new Date(b.deadline)
          );
          setTasks(sorted);
        } else {
          setMessage("No tasks found.");
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
        setMessage("Error loading tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token]);

  return (
    <div className="flex min-h-screen bg-[#111827]">
      <Sidebar />
      <div className="flex-1 p-6 text-white overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">My Assigned Tasks</h1>

        {loading ? (
          <div className="text-gray-300 animate-pulse">Loading tasks...</div>
        ) : message ? (
          <p className="text-red-400">{message}</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-400">You currently have no assigned tasks.</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-700 transition"
              >
                <h2 className="text-xl font-semibold mb-1">{task.title}</h2>
                <p className="text-sm text-gray-300 mb-2">{task.description}</p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>
                    <span className="font-medium text-white">Priority:</span>{" "}
                    {task.priority}
                  </p>
                  <p>
                    <span className="font-medium text-white">Deadline:</span>{" "}
                    {new Date(task.deadline).toLocaleDateString()}{" "}
                    {new Date(task.deadline).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    <span className="font-medium text-white">Status:</span>{" "}
                    {task.status || "pending"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyTasksPage;