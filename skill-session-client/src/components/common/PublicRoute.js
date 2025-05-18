// src/components/common/PublicRoute.js
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = () => {
  const { auth } = useAuth();

  if (auth.isAuthenticated) {
    // Redirect to the home page if already authenticated
    return <Navigate to="/home" replace />;
  }

  // Render the public route component
  return <Outlet />;
};

export default PublicRoute;