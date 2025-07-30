// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // configure axios base URL
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/users/me')
        .then(res => setUser(res.data))
        .catch(() => {
          setToken(null);
          localStorage.removeItem('token');
        });
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const { data } = await axios.post('/login', { username, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      const userRes = await axios.get('/users/me');
      setUser(userRes.data);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    delete axios.defaults.headers.common['Authorization'];
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
