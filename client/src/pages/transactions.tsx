import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useTransaction } from "@/hooks/use-transaction";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TransactionsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { useUserTransactions } = useTransaction(queryClient);
  const [roleFilter, setRoleFilter] = useState<'buyer' | 'seller' | undefined>(undefined);
  
  const { data: transactions, isLoading, error } = useUserTransactions(roleFilter);
  
  // Navigate to transaction detail
  const goToTransaction = (id: number) => {
    setLocation(`/transactions/${id}`);
  };
  
  // Status badge helper
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
  
  // Status icon helper
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
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your transactions...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Transactions</h2>
            <p className="text-muted-foreground mb-6 text-center">
              We encountered a problem loading your transactions. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your note transactions
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setLocation("/marketplace")}>
            <Plus className="mr-2 h-4 w-4" /> Create Transaction
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="all" 
        className="w-full"
        onValueChange={(value) => {
          if (value === "buying") setRoleFilter("buyer");
          else if (value === "selling") setRoleFilter("seller");
          else setRoleFilter(undefined);
        }}
      >
        <div className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="buying">Buying</TabsTrigger>
            <TabsTrigger value="selling">Selling</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <TransactionsList 
            transactions={transactions} 
            onSelectTransaction={goToTransaction}
            getStatusBadge={getStatusBadge}
            getStatusIcon={getStatusIcon}
            userId={user?.id}
          />
        </TabsContent>
        
        <TabsContent value="buying" className="mt-0">
          <TransactionsList 
            transactions={transactions} 
            onSelectTransaction={goToTransaction}
            getStatusBadge={getStatusBadge}
            getStatusIcon={getStatusIcon}
            userId={user?.id}
          />
        </TabsContent>
        
        <TabsContent value="selling" className="mt-0">
          <TransactionsList 
            transactions={transactions} 
            onSelectTransaction={goToTransaction}
            getStatusBadge={getStatusBadge}
            getStatusIcon={getStatusIcon} 
            userId={user?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for the transactions list
function TransactionsList({ 
  transactions, 
  onSelectTransaction, 
  getStatusBadge, 
  getStatusIcon,
  userId
}: { 
  transactions: any[] | undefined;
  onSelectTransaction: (id: number) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getStatusIcon: (status: string) => JSX.Element;
  userId: number | undefined;
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Transactions Found</h2>
          <p className="text-muted-foreground mb-6 text-center">
            You don't have any transactions yet. Browse the marketplace to find notes to purchase.
          </p>
          <Button onClick={() => window.location.pathname = "/marketplace"}>
            Browse Marketplace
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {transactions.map(transaction => (
        <Card 
          key={transaction.id} 
          className="hover:border-primary transition-colors cursor-pointer"
          onClick={() => onSelectTransaction(transaction.id)}
        >
          <CardContent className="flex items-center p-6">
            <div className="mr-4">
              {getStatusIcon(transaction.status)}
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h3 className="font-medium">Transaction #{transaction.id}</h3>
                {getStatusBadge(transaction.status)}
                <Badge variant="outline">
                  Phase: {transaction.currentPhase.charAt(0).toUpperCase() + transaction.currentPhase.slice(1)}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {transaction.buyerId === userId ? 'Buying from' : 'Selling to'} {transaction.buyerId === userId ? 'Seller' : 'Buyer'} • 
                ${transaction.finalAmount.toLocaleString()} • 
                Created {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            <div className="ml-4">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}