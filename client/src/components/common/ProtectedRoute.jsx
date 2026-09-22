import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Unauthenticated check -> Redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role-based authorization check
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
  }

  // 3. User is authorized
  return children ? children : <Outlet />;
}

