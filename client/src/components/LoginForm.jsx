import { useState } from "react";

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // reset error before trying login

    try {
      const success = await onLogin(email, password);
      if (!success) {
        setErrorMsg("Invalid email or password.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Password</label>
        <input
          type="password"
          className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition duration-150"
      >
        Login
      </button>
      {errorMsg && (
        <p className="text-sm text-red-400 text-center mt-2">
          {errorMsg}
        </p>
      )}
    </form>
  );
}

export default LoginForm;