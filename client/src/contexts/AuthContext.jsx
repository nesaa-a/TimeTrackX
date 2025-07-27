import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create the AuthContext
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On mount, if token exists, fetch user data
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const apiUrl = process.env.REACT_APP_API_URL || '';
          const response = await axios.get(`${apiUrl}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          // If fetch fails with 401/403, clear token and localStorage
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Login function
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    navigate('/');
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Context value
  const value = {
    token,
    user,
    login,
    logout,
    isLoading
  };

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 