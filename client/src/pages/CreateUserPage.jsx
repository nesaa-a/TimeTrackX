import { useState } from "react";
import Sidebar from "../components/Sidebar";

function CreateUserPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employer",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:5051/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to create user");
        setSuccess(false);
      } else {
        setMessage("User created successfully");
        setSuccess(true);
        setFormData({ name: "", email: "", password: "", role: "employer" });
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 p-10">
        <div className="max-w-xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800">
          <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400">Create New User</h2>

          {message && (
            <div
              className={`mb-6 text-sm text-center px-4 py-2 rounded ${
                success ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 text-sm text-gray-400">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-400">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-400">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-400">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="employer">Employer</option>
                <option value="hr">HR</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition duration-200 font-semibold"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateUserPage;