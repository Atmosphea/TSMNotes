import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Header from "@/components/landing/Header";

import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
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

    </div>
  );
}