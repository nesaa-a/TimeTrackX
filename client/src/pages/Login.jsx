import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const { token, user } = await res.json();
        login(token, user);
        navigate("/"); // ose dashboard
      } else {
        setError("Login failed! Kontrollo username ose password.");
      }
    } catch (err) {
      setError("Login failed! Server error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Login to TimeTrackX</h2>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="mb-4 w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="mb-4 w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </form>
    </div>
  );
}
