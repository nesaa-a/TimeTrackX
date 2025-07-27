import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  if (token) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

export default PrivateRoute; 