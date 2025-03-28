import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Check if the route requires a specific role
  if (requiredRole && user) {
    const userRole = user.role;
    
    // Check if the user has the required role
    if (typeof requiredRole === 'string') {
      if (userRole !== requiredRole) {
        return <Redirect to="/marketplace" />;
      }
    } else if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole)) {
        return <Redirect to="/marketplace" />;
      }
    }
  }

  return <>{children}</>;
}