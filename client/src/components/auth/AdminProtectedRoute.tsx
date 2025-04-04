import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Redirect } from "wouter";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  // Check if user has admin role
  if (user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}