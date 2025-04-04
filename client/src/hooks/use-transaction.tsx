import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  QueryClient,
  UseMutationResult
} from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Define Transaction types
interface Transaction {
  id: number;
  noteListingId: number;
  buyerId: number;
  sellerId: number;
  status: string;
  initialAmount: number;
  finalAmount: number;
  currentPhase: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionTask {
  id: number;
  transactionId: number;
  title: string;
  description: string;
  phase: string;
  status: string;
  assignedTo: string;
  assignedToId: number | null;
  dueDate: string | null;
  completedAt: string | null;
  completedById: number | null;
  createdAt: string;
  updatedAt: string;
}

interface TransactionFile {
  id: number;
  transactionId: number;
  taskId: number | null;
  fileName: string;
  fileKey: string;
  fileType: string;
  fileSize: number;
  uploadedById: number;
  uploadedAt: string;
}

interface TransactionTimelineEvent {
  id: number;
  transactionId: number;
  title: string;
  description: string;
  eventType: string;
  createdById: number;
  createdAt: string;
}

// Define the return type of useTransaction hook
export interface UseTransactionReturn {
  useTransactionDetails: (transactionId: string | number) => {
    data: any;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useTransactionTasks: (transactionId: string | number) => {
    data: TransactionTask[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useTransactionFiles: (transactionId: string | number) => {
    data: TransactionFile[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useTransactionTimeline: (transactionId: string | number) => {
    data: TransactionTimelineEvent[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useUserTransactions: (role?: 'buyer' | 'seller') => {
    data: Transaction[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  completeTaskMutation: UseMutationResult<any, Error, { taskId: number }>;
  updateTransactionMutation: UseMutationResult<any, Error, { transactionId: number, data: Partial<Transaction> }>;
  createTaskMutation: UseMutationResult<any, Error, { transactionId: number, taskData: Partial<TransactionTask> }>;
  uploadFileMutation: UseMutationResult<any, Error, { transactionId: number, taskId: number | null, formData: FormData }>;
  createTimelineEventMutation: UseMutationResult<any, Error, { transactionId: number, eventData: Partial<TransactionTimelineEvent> }>;
}

// Main hook
export function useTransaction(queryClient: QueryClient): UseTransactionReturn {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get transaction details
  const useTransactionDetails = (transactionId: string | number) => {
    return useQuery({
      queryKey: ['/api/transactions', transactionId],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/transactions/${transactionId}`);
        return response.json();
      },
      enabled: !!transactionId,
    });
  };
  
  // Get transaction tasks
  const useTransactionTasks = (transactionId: string | number) => {
    return useQuery({
      queryKey: ['/api/transactions', transactionId, 'tasks'],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/transactions/${transactionId}/tasks`);
        return response.json();
      },
      enabled: !!transactionId,
    });
  };
  
  // Get transaction files
  const useTransactionFiles = (transactionId: string | number) => {
    return useQuery({
      queryKey: ['/api/transactions', transactionId, 'files'],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/transactions/${transactionId}/files`);
        return response.json();
      },
      enabled: !!transactionId,
    });
  };
  
  // Get transaction timeline
  const useTransactionTimeline = (transactionId: string | number) => {
    return useQuery({
      queryKey: ['/api/transactions', transactionId, 'timeline'],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/transactions/${transactionId}/timeline`);
        return response.json();
      },
      enabled: !!transactionId,
    });
  };
  
  // Get user transactions
  const useUserTransactions = (role?: 'buyer' | 'seller') => {
    return useQuery({
      queryKey: ['/api/transactions', 'user', role],
      queryFn: async () => {
        let url = '/api/transactions/user';
        if (role) {
          url += `?role=${role}`;
        }
        const response = await apiRequest('GET', url);
        return response.json();
      },
      enabled: !!user?.id,
    });
  };
  
  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId }: { taskId: number }) => {
      const response = await apiRequest('POST', `/api/transactions/tasks/${taskId}/complete`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Task completed",
        description: "The task has been marked as complete.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to complete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, data }: { transactionId: number, data: Partial<Transaction> }) => {
      const response = await apiRequest('PATCH', `/api/transactions/${transactionId}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transaction updated",
        description: "The transaction has been updated successfully.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async ({ transactionId, taskData }: { transactionId: number, taskData: Partial<TransactionTask> }) => {
      const response = await apiRequest('POST', `/api/transactions/${transactionId}/tasks`, taskData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Task created",
        description: "A new task has been created.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async ({ transactionId, taskId, formData }: { transactionId: number, taskId: number | null, formData: FormData }) => {
      const response = await apiRequest('POST', `/api/transactions/${transactionId}/files?taskId=${taskId || ''}`, formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to upload file",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create timeline event mutation
  const createTimelineEventMutation = useMutation({
    mutationFn: async ({ transactionId, eventData }: { transactionId: number, eventData: Partial<TransactionTimelineEvent> }) => {
      const response = await apiRequest('POST', `/api/transactions/${transactionId}/timeline`, eventData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Event added",
        description: "A new event has been added to the timeline.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    useTransactionDetails,
    useTransactionTasks,
    useTransactionFiles,
    useTransactionTimeline,
    useUserTransactions,
    completeTaskMutation,
    updateTransactionMutation,
    createTaskMutation,
    uploadFileMutation,
    createTimelineEventMutation,
  };
}