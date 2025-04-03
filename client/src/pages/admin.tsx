import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Header from "@/components/landing/Header";
import Footer2 from "@/components/ui/footer2";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const [location, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Fetch the current user's data to check if they have admin rights
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/users/current'],
    // Since we don't have a real auth system yet, we'll simulate an admin check
    queryFn: async () => {
      // This would normally make a real API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return { success: true, data: { role: "admin" } }; // For demo purpose, hardcode admin role
    },
  });

  useEffect(() => {
    if (!isLoading) {
      const userRole = userData?.data?.role;
      if (userRole === "admin") {
        setIsAuthorized(true);
      }
      setIsCheckingAuth(false);
    }
  }, [isLoading, userData]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-6xl py-20 px-4 mx-auto flex flex-col items-center justify-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" />
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-center">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            You don't have permission to access the admin dashboard. 
            This area is restricted to administrators only.
          </p>
          <Button 
            onClick={() => setLocation("/")}
            className="mt-2"
          >
            Return to Home
          </Button>
        </main>
        <Footer2 />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="py-2 px-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm">
        <div className="container max-w-6xl mx-auto flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          <span>Admin Mode - You have elevated privileges</span>
        </div>
      </div>
      <main className="flex-1 container max-w-7xl mx-auto">
        <AdminDashboard />
      </main>
      <Footer2 />
    </div>
  );
}