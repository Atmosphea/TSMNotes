import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Redirect } from "wouter";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const token = localStorage.getItem('authToken');

  // Show loading when auth is loading or we have a token but no user yet
  if (isLoading || (token && !user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user at all, redirect to login
  if (!user) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  // Check if user has admin role, redirect to home if not
  if (user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  // User is admin, show the protected admin content
  return <>{children}</>;
}