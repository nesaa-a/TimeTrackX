// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';           // Tailwind/Flowbite importet tuaja
import App from './App';        // Supozojmë që keni App.jsx në src/
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
