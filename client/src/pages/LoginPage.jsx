import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { loginUser } from "../services/authService";

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    const result = await loginUser(email, password);
    if (result.success) {
      onLoginSuccess(); // ✅ trigger app state
      navigate("/dashboard");
      return true;
    } else {
      return false; // ❌ will trigger error in LoginForm
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="bg-gray-800 p-6 rounded w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}

export default LoginPage;