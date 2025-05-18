
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

interface RouteGuardProps {
  redirectTo?: string;
  authRequired: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  redirectTo = '/login',
  authRequired 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (authRequired && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If authentication is not required and user is logged in
  if (!authRequired && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
