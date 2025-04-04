import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow, format } from "date-fns";
import { 
  ChevronLeft, 
  FileText, 
  Loader2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  XCircle,
  Download,
  Upload,
  Plus,
  ClipboardList
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Get useTransaction hook outside the component
// to avoid React hooks rule violations
const useTransaction = (queryClient) => {
  return {
    useTransactionDetails: (id) => ({
      data: null,
      isLoading: true,
      error: null,
      refetch: () => {}
    }),
    useTransactionTasks: (id) => ({
      data: [],
      isLoading: true,
      error: null,
      refetch: () => {}
    }),
    useTransactionFiles: (id) => ({
      data: [],
      isLoading: true,
      error: null,
      refetch: () => {}
    }),
    useTransactionTimeline: (id) => ({
      data: [],
      isLoading: true,
      error: null,
      refetch: () => {}
    }),
    completeTaskMutation: {
      mutate: () => {},
      isPending: false
    },
    uploadFileMutation: {
      mutate: () => {},
      isPending: false
    },
    createTimelineEventMutation: {
      mutate: () => {},
      isPending: false
    }
  }
};

export default function TransactionDetailPage() {
  const { transactionId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Import from useTransaction hook
  const { 
    useTransactionDetails, 
    useTransactionTasks, 
    useTransactionFiles,
    useTransactionTimeline,
    completeTaskMutation,
    uploadFileMutation,
    createTimelineEventMutation
  } = useTransaction(queryClient);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Get transaction data
  const { 
    data: transaction, 
    isLoading: isLoadingTransaction,
    error: transactionError,
    refetch: refetchTransaction
  } = useTransactionDetails(transactionId);
  
  // Get transaction tasks
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    refetch: refetchTasks
  } = useTransactionTasks(transactionId);
  
  // Get transaction files
  const {
    data: files,
    isLoading: isLoadingFiles,
    refetch: refetchFiles
  } = useTransactionFiles(transactionId);
  
  // Get transaction timeline
  const {
    data: timeline,
    isLoading: isLoadingTimeline,
    refetch: refetchTimeline
  } = useTransactionTimeline(transactionId);
  
  // Check if the current user is the buyer or seller
  const isBuyer = transaction?.buyerId === user?.id;
  const isSeller = transaction?.sellerId === user?.id;
  
  // Complete task handler
  const handleCompleteTask = (taskId: number) => {
    completeTaskMutation.mutate({ taskId }, {
      onSuccess: () => {
        refetchTasks();
        refetchTransaction();
        refetchTimeline();
      }
    });
  };
  
  // File upload handler
  const handleFileUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    uploadFileMutation.mutate(
      { 
        transactionId: Number(transactionId), 
        taskId: selectedTaskId, 
        formData 
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setSelectedTaskId(null);
          setIsUploading(false);
          refetchFiles();
          refetchTimeline();
        },
        onError: () => {
          setIsUploading(false);
        }
      }
    );
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'active':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Loading state
  if (isLoadingTransaction || isLoadingTasks || isLoadingFiles || isLoadingTimeline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading transaction data...</p>
      </div>
    );
  }
  
  // Error state
  if (transactionError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Transaction</h2>
            <p className="text-muted-foreground mb-6">
              We encountered a problem loading this transaction. It may not exist or you may not have permission to view it.
            </p>
            <Button onClick={() => setLocation("/transactions")}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Access denied
  if (!isBuyer && !isSeller) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You do not have permission to view this transaction.
            </p>
            <Button onClick={() => setLocation("/transactions")}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Group tasks by phase
  const tasksByPhase = tasks?.reduce((acc, task) => {
    if (!acc[task.phase]) {
      acc[task.phase] = [];
    }
    acc[task.phase].push(task);
    return acc;
  }, {});
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => setLocation("/transactions")}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Transactions
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold">Transaction #{transaction?.id}</h1>
              {getStatusBadge(transaction?.status)}
              <Badge variant="secondary" className="text-sm py-1">
                Phase: {transaction?.currentPhase?.charAt(0).toUpperCase() + transaction?.currentPhase?.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {isBuyer ? 'Buying from Seller' : 'Selling to Buyer'} • 
              ${transaction?.finalAmount?.toLocaleString()} • 
              Created {formatDistanceToNow(new Date(transaction?.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Information about this note transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground mb-1 block">Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(transaction?.status)}
                    <span className="font-medium">{transaction?.status?.charAt(0).toUpperCase() + transaction?.status?.slice(1)}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground mb-1 block">Current Phase</Label>
                  <span className="font-medium">{transaction?.currentPhase?.charAt(0).toUpperCase() + transaction?.currentPhase?.slice(1)}</span>
                </div>
                
                <div>
                  <Label className="text-muted-foreground mb-1 block">Original Amount</Label>
                  <span className="font-medium">${transaction?.initialAmount?.toLocaleString()}</span>
                </div>
                
                <div>
                  <Label className="text-muted-foreground mb-1 block">Final Amount</Label>
                  <span className="font-medium">${transaction?.finalAmount?.toLocaleString()}</span>
                </div>
                
                <div>
                  <Label className="text-muted-foreground mb-1 block">Created</Label>
                  <span className="font-medium">{format(new Date(transaction?.createdAt), 'MMM d, yyyy')}</span>
                </div>
                
                <div>
                  <Label className="text-muted-foreground mb-1 block">Last Updated</Label>
                  <span className="font-medium">{format(new Date(transaction?.updatedAt), 'MMM d, yyyy')}</span>
                </div>
                
                <div>
                  <Label className="text-muted-foreground mb-1 block">{isBuyer ? 'Seller' : 'Buyer'}</Label>
                  <span className="font-medium">{isBuyer ? 'Seller #' + transaction?.sellerId : 'Buyer #' + transaction?.buyerId}</span>
                </div>
                
                <div>
                  <Label className="text-muted-foreground mb-1 block">Note</Label>
                  <span className="font-medium">Note #{transaction?.noteListingId}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>
                Tasks that need to be completed in the current phase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasks && tasks.filter(task => 
                task.phase === transaction?.currentPhase && task.status !== 'completed'
              ).length > 0 ? (
                <div className="space-y-4">
                  {tasks.filter(task => 
                    task.phase === transaction?.currentPhase && task.status !== 'completed'
                  ).map(task => (
                    <div key={task.id} className="flex items-start p-4 border rounded-lg">
                      <div className="mr-4 mt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h3 className="font-medium">{task.title}</h3>
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          {(task.assignedToId === user?.id || !task.assignedToId) && task.status !== 'completed' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleCompleteTask(task.id)}
                              disabled={completeTaskMutation.isPending}
                            >
                              {completeTaskMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">All Caught Up!</h3>
                  <p className="text-center text-muted-foreground max-w-md">
                    There are no active tasks for the current phase. Check the Tasks tab to see all tasks.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates on this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline && timeline.length > 0 ? (
                <div className="space-y-4">
                  {timeline.slice(0, 3).map(event => (
                    <div key={event.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                      <div className="mr-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity to display
                </div>
              )}
              {timeline && timeline.length > 3 && (
                <div className="mt-4 text-center">
                  <Button variant="link" onClick={() => document.querySelector('[data-value="timeline"]')?.click()}>
                    View All Activity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Tasks</CardTitle>
              <CardDescription>
                All tasks required to complete this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasks && tasks.length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(tasksByPhase || {}).map(([phase, phaseTasks]) => (
                    <div key={phase}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>{phase.charAt(0).toUpperCase() + phase.slice(1)} Phase</span>
                        {transaction?.currentPhase === phase && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Current</Badge>
                        )}
                      </h3>
                      <div className="space-y-3">
                        {Array.isArray(phaseTasks) && phaseTasks.map(task => (
                          <div key={task.id} className="flex items-start p-4 border rounded-lg">
                            <div className="mr-4 mt-1">
                              {task.status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <ClipboardList className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <h4 className="font-medium">{task.title}</h4>
                                {getStatusBadge(task.status)}
                                {task.assignedToId === user?.id && (
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Assigned to you</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                              
                              {task.status === 'completed' ? (
                                <div className="text-xs text-muted-foreground">
                                  Completed {task.completedAt ? formatDistanceToNow(new Date(task.completedAt), { addSuffix: true }) : ''}
                                </div>
                              ) : (
                                <div className="flex gap-2 flex-wrap">
                                  {(task.assignedToId === user?.id || !task.assignedToId) && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleCompleteTask(task.id)}
                                      disabled={completeTaskMutation.isPending}
                                    >
                                      {completeTaskMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                      )}
                                      Mark Complete
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Tasks Found</h3>
                  <p className="text-muted-foreground">There are no tasks for this transaction yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Documents</CardTitle>
              <CardDescription>
                Documents and files related to this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <Label htmlFor="file-upload">Select file to upload</Label>
                    <div className="mt-2">
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedFile ? selectedFile.name : 'Choose File'}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Button 
                      onClick={handleFileUpload}
                      disabled={!selectedFile || isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Document
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                {files && files.length > 0 ? (
                  <div className="space-y-4">
                    {files.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <h4 className="font-medium">{file.fileName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Uploaded {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                              {file.fileSize && ` • ${(file.fileSize / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Documents Found</h3>
                    <p className="text-muted-foreground">
                      There are no documents for this transaction yet. Upload a document to get started.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Timeline</CardTitle>
              <CardDescription>
                Chronological history of events for this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline && timeline.length > 0 ? (
                <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-4 before:w-[1px] before:bg-border">
                  {timeline.map(event => (
                    <div key={event.id} className="relative">
                      <div className="absolute left-[-30px] top-1 h-6 w-6 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{event.eventType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.createdAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Timeline Events</h3>
                  <p className="text-muted-foreground">
                    There are no timeline events for this transaction yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}