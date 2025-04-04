import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// This hook provides access to the authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}