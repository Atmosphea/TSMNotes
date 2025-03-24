import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';

type User = {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status?: string;
  bio?: string;
  phone?: string;
  company?: string;
  companyName?: string; // Alternative name for company
  website?: string;
  location?: string;
  profileImageUrl?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
  isAccreditedInvestor?: boolean;
  accreditationProofUrl?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string, inviteKey: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in
  const { 
    data: userData,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Auth check error:', error);
        throw error;
      }
    },
    retry: false
  });
  
  // Update user state when data changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    } else if (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [userData, error]);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      return data.data;
    },
    onSuccess: (data) => {
      setUser(data);
      setIsAuthenticated(true);
    }
  });

  const signupMutation = useMutation({
    mutationFn: async ({ username, email, password, inviteKey }: { 
      username: string; 
      email: string; 
      password: string; 
      inviteKey: string 
    }) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password, inviteKey }),
      });
      
      if (!response.ok) {
        throw new Error('Signup failed');
      }
      
      const data = await response.json();
      return data.data;
    },
    onSuccess: (data) => {
      setUser(data);
      setIsAuthenticated(true);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setUser(null);
      setIsAuthenticated(false);
    }
  });

  const login = async (username: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ username, password });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string, inviteKey: string) => {
    try {
      await signupMutation.mutateAsync({ username, email, password, inviteKey });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};