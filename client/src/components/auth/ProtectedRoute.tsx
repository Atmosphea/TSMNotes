import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Redirect } from "wouter";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const token = localStorage.getItem('authToken');
  
  // Show loading when:
  // 1. Auth context is still loading
  // 2. OR there's a token but user data hasn't been loaded yet
  if (isLoading || (token && !user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user and no loading state, redirect to login
  if (!user) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}