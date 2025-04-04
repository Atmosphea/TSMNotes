import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Define types
interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  email: string;
  firstName?: string;
  lastName?: string;
  inviteKey?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Create AuthContext
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Check if token exists on initialization
  useEffect(() => {
    // This will trigger auth-related fetches to include the token if it exists
    const token = localStorage.getItem('authToken');
    console.log('Auth token exists:', !!token);
  }, []);
  
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/auth/current-user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/current-user');
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      if (data.data && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
      }
      
      refetch();
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      setLocation('/marketplace');
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterCredentials) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      if (data.data && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
      }
      
      refetch();
      toast({
        title: 'Registration successful',
        description: 'Your account has been created.',
      });
      setLocation('/marketplace');
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout');
      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      // Remove the token from localStorage
      localStorage.removeItem('authToken');
      
      // Clear the user data from cache
      queryClient.setQueryData(['/api/auth/current-user'], null);
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
      setLocation('/login');
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Login function
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };
  
  // Register function
  const register = async (userData: RegisterCredentials) => {
    await registerMutation.mutateAsync(userData);
  };
  
  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  return (
    <AuthContext.Provider
      value={{
        user: user as User | null,
        isLoading,
        error: error as Error | null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}