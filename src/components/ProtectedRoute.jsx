import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from './layout/MainLayout';

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Determine the dashboard based on role
    const getRoleDashboard = (role) => {
      switch (role) {
        case 'MANAGER': return '/manager/dashboard';
        case 'STAFF': return '/staff/dashboard';
        case 'INVENTORY_CLERK': return '/inventory/dashboard';
        case 'ADMIN': return '/admin/dashboard';
        default: return '/login';
      }
    };
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
