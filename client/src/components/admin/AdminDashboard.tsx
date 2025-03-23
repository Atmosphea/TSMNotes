import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  LineChart, 
  FilePlus, 
  Edit, 
  Trash, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  BarChart3,
  Settings,
  Layers,
  FileText,
  Bell
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Mock data for the admin dashboard
const mockUsers = [
  { 
    id: 1, 
    username: "janeinvestor", 
    email: "jane.investor@example.com", 
    role: "investor", 
    status: "active", 
    createdAt: "2023-05-15T00:00:00Z"
  },
  { 
    id: 2, 
    username: "bobseller", 
    email: "bob.seller@example.com", 
    role: "seller", 
    status: "active", 
    createdAt: "2023-06-22T00:00:00Z"
  },
  { 
    id: 3, 
    username: "alexadmin", 
    email: "alex.admin@notetrade.com", 
    role: "admin", 
    status: "active", 
    createdAt: "2023-01-10T00:00:00Z"
  },
  { 
    id: 4, 
    username: "sarahbuyer", 
    email: "sarah.buyer@example.com", 
    role: "investor", 
    status: "inactive", 
    createdAt: "2023-07-05T00:00:00Z"
  },
];

const mockListings = [
  { 
    id: 1, 
    title: "Commercial Property Note", 
    seller: "Investment Partners LLC", 
    propertyType: "Commercial", 
    askingPrice: 195000, 
    interestRate: 8.1, 
    status: "active" 
  },
  { 
    id: 2, 
    title: "Residential First Lien", 
    seller: "Note Holdings Inc", 
    propertyType: "Single Family", 
    askingPrice: 125000, 
    interestRate: 7.25, 
    status: "pending" 
  },
  { 
    id: 3, 
    title: "Multi-Family Note", 
    seller: "Capital Investments", 
    propertyType: "Multi-Family", 
    askingPrice: 250000, 
    interestRate: 6.75, 
    status: "sold" 
  },
];

const mockStats = {
  totalUsers: 127,
  activeListings: 42,
  pendingReview: 5,
  soldNotes: 86,
  totalValue: 12500000,
  averageYield: 7.2
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch users data
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    // Use mock data for now
    queryFn: async () => ({ success: true, data: mockUsers }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Fetch listings data
  const { data: listingsData, isLoading: isListingsLoading } = useQuery({
    queryKey: ['/api/admin/listings'],
    // Use mock data for now
    queryFn: async () => ({ success: true, data: mockListings }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Fetch stats data
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    // Use mock data for now
    queryFn: async () => ({ success: true, data: mockStats }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest({
        url: `/api/admin/users/${userData.id}`,
        method: "PATCH",
        data: userData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
      setIsEditUserDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem updating the user.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest({
        url: `/api/admin/users/${userId}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem deleting the user.",
        variant: "destructive",
      });
    },
  });

  // Handle edit user
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  // Handle user update
  const handleUpdateUser = (userData: any) => {
    updateUserMutation.mutate({
      ...selectedUser,
      ...userData,
    });
  };

  // Handle delete user
  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    } else if (status === "inactive") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>;
    } else if (status === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    } else if (status === "sold") {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sold</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  if (isUsersLoading || isListingsLoading || isStatsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const users = usersData?.data || [];
  const listings = listingsData?.data || [];
  const stats = statsData?.data || mockStats; // Fallback to mock data if not available

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, listings, and platform settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">
            <LineChart className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="listings">
            <Layers className="w-4 h-4 mr-2" />
            Listings
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeListings}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingReview} pending review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Notes Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.soldNotes}</div>
                <p className="text-xs text-muted-foreground">
                  Total value: {formatCurrency(stats.totalValue)}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Overview of recent platform activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                  <BarChart3 className="w-12 h-12 text-muted-foreground opacity-50" />
                  <span className="ml-2 text-muted-foreground">Analytics Chart Placeholder</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>New Users</CardTitle>
                <CardDescription>
                  Recently registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 3).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("users")}>
                  View All Users
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Listings</CardTitle>
                <CardDescription>
                  Latest note listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.slice(0, 3).map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">{listing.propertyType} • {formatCurrency(listing.askingPrice)}</p>
                      </div>
                      <div>
                        {renderStatusBadge(listing.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("listings")}>
                  View All Listings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage platform users and their permissions
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8 w-[200px] md:w-[300px]"
                  />
                </div>
                <Button>
                  <FilePlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Listings Tab */}
        <TabsContent value="listings" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Listing Management</CardTitle>
                <CardDescription>
                  Manage and moderate note listings
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search listings..."
                    className="pl-8 w-[200px] md:w-[300px]"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Property Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.title}</TableCell>
                      <TableCell>{listing.seller}</TableCell>
                      <TableCell>{listing.propertyType}</TableCell>
                      <TableCell>{formatCurrency(listing.askingPrice)}</TableCell>
                      <TableCell>{listing.interestRate}%</TableCell>
                      <TableCell>
                        {renderStatusBadge(listing.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {listing.status === "pending" && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  defaultValue={selectedUser.username}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  defaultValue={selectedUser.email}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={selectedUser.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdateUser({ /* form values */ })}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}