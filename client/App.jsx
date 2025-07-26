import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

// --- Auth Context ------------------------------------------------
const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // load user info if token exists
  useEffect(() => {
    if (token) {
      axios.get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data))
        .catch(() => { setToken(null); localStorage.removeItem('token'); });
    }
  }, [token]);

  const login = async (username, password) => {
    const { data } = await axios.post('/login', { username, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    const userRes = await axios.get('/users/me', { headers: { Authorization: `Bearer ${data.token}` } });
    setUser(userRes.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Protected Route ---------------------------------------------
function ProtectedRoute({ role, redirectTo = '/login' }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={redirectTo} />;
  if (role && user.roleName !== role) return <Navigate to="/unauthorized" />;
  return <Outlet />;
}

// --- Login Page ---------------------------------------------------
export function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
    } catch {
      setError('Credentials invalid');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow rounded">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Username</label>
        <input className="border p-2 w-full mb-4" value={form.username}
               onChange={e => setForm({ ...form, username: e.target.value })} />
        <label className="block mb-2">Password</label>
        <input type="password" className="border p-2 w-full mb-4" value={form.password}
               onChange={e => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Login</button>
      </form>
    </div>
  );
}

// --- Dashboard Pages ---------------------------------------------
export function AdminDashboard() {
  const { logout, user } = useAuth();
  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Admin Dashboard</h1>
      <p>Welcome, {user.username} (Role: Admin)</p>
      <button onClick={logout} className="mt-4 bg-red-500 text-white p-2 rounded">Logout</button>
    </div>
  );
}

export function UserDashboard() {
  const { logout, user } = useAuth();
  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">User Dashboard</h1>
      <p>Welcome, {user.username} (Role: {user.roleName})</p>
      <button onClick={logout} className="mt-4 bg-red-500 text-white p-2 rounded">Logout</button>
    </div>
  );
}

// --- Unauthorized Page -------------------------------------------
export function Unauthorized() {
  return <h2 className="text-center mt-20 text-red-600">Unauthorized Access</h2>;
}

// --- App Component with Routing ----------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>  {/* any authenticated user */}
            <Route path="/user" element={<UserDashboard />} />
          </Route>
          <Route element={<ProtectedRoute role="Admin" />}> {/* only Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
