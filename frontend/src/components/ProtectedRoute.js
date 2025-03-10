// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');  // Check for a token in localStorage

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/" />;
  }

  return children;  // If token exists, render the protected content
};

export default ProtectedRoute;
