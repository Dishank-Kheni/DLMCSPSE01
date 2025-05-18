// src/components/common/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = () => {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) {
    // Redirect to the sign-in page if not authenticated
    return <Navigate to="/signin" replace />;
  }

  // Render the protected route component
  return <Outlet />;
};

export default PrivateRoute;