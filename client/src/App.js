import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/DashboardPage";
import CreateUserPage from "./pages/CreateUserPage";
import CheckInPage from "./pages/CheckInPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import TaskManagerPage from "./pages/TaskManagerPage"; // ✅ For HR
import MyTasksPage from "./pages/MyTaskPage"; // ✅ For all users

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));

  useEffect(() => {
    const checkStorage = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    };
    window.addEventListener("storage", checkStorage);
    return () => window.removeEventListener("storage", checkStorage);
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard onLogout={() => setIsLoggedIn(false)} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/create-user"
          element={
            isLoggedIn && user.role === "hr" ? (
              <CreateUserPage />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/checkin"
          element={isLoggedIn ? <CheckInPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={
            isLoggedIn && user.role === "hr" ? (
              <AdminDashboardPage />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/tasks"
          element={
            isLoggedIn && user.role === "hr" ? (
              <TaskManagerPage />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/my-tasks"
          element={isLoggedIn ? <MyTasksPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;