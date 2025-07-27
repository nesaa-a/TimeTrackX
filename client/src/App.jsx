import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';

// Login Page Component
const LoginPage = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = React.useState({ username: '', password: '' });
  const [error, setError] = React.useState('');

  const API = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (response.ok) {
        const { token } = await response.json();
        login(token);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        {error && <p>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.username}!</p>
      <p>Role: {user?.roleName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Users CRUD Component
const UsersPage = () => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h1>Users Management</h1>
      <div>
        {users.map(user => (
          <div key={user.id}>
            <h3>{user.username}</h3>
            <p>Role: {user.roleName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Projects CRUD Component
const ProjectsPage = () => {
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <h1>Projects Management</h1>
      <div>
        {projects.map(project => (
          <div key={project.id}>
            <h3>{project.name}</h3>
            <p>Description: {project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Work Hours CRUD Component
const WorkHoursPage = () => {
  const [workHours, setWorkHours] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchWorkHours = async () => {
      try {
        const response = await fetch('/api/workhours');
        const data = await response.json();
        setWorkHours(data);
      } catch (error) {
        console.error('Error fetching work hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkHours();
  }, []);

  if (loading) return <div>Loading work hours...</div>;

  return (
    <div>
      <h1>Work Hours Management</h1>
      <div>
        {workHours.map(workHour => (
          <div key={workHour.id}>
            <h3>Date: {workHour.date}</h3>
            <p>Hours: {workHour.hours}</p>
            <p>Project: {workHour.projectName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Admin Panel Component
const AdminPanel = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome, {user?.username} (Admin)</p>
      <p>This page is only accessible to administrators.</p>
    </div>
  );
};

// Unauthorized Page
const Unauthorized = () => (
  <div>
    <h1>Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
  </div>
);

// Main App Component
const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected routes wrapped with PrivateRoute */}
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      
      <Route path="/users" element={
        <PrivateRoute>
          <UsersPage />
        </PrivateRoute>
      } />
      
      <Route path="/projects" element={
        <PrivateRoute>
          <ProjectsPage />
        </PrivateRoute>
      } />
      
      <Route path="/workhours" element={
        <PrivateRoute>
          <WorkHoursPage />
        </PrivateRoute>
      } />
      
      <Route path="/admin" element={
        <PrivateRoute>
          <AdminPanel />
        </PrivateRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App; 