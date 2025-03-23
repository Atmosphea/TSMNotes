import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Phone,
  Mail,
  Building,
  Save,
  AlertTriangle,
  Bell,
  Lock,
  FileText,
  CreditCard,
  BookmarkMinus,
  Star,
  LogOut,
  UserX,
  Search,
  List,
  LayoutDashboard,
} from "lucide-react";

// Profile Form Schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().optional(),
  companyName: z.string().optional(),
  bio: z.string().max(500, {
    message: "Bio must not exceed 500 characters.",
  }).optional(),
  location: z.string().optional(),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
});

// Notification Settings Schema
const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  marketingEmails: z.boolean().default(true),
  newListingAlerts: z.boolean().default(true),
  priceChangeAlerts: z.boolean().default(true),
  newsAndUpdates: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function ProfilePage() {
  const { toast } = useToast();

  // Query to fetch the current user's profile data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users/current'],
    queryFn: async () => {
      // Mock user data for now
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return {
        success: true,
        data: {
          id: 1,
          fullName: "Jane Investor",
          email: "jane.investor@example.com",
          phoneNumber: "(555) 123-4567",
          companyName: "Acme Investments",
          bio: "Experienced real estate investor with 10+ years specializing in mortgage note investments. Looking for performing and non-performing notes with good ROI potential.",
          location: "Denver, CO",
          website: "https://example.com",
          profileImage: "",
          role: "investor",
          savedSearches: [
            { id: 1, name: "Performing Notes in FL" },
            { id: 2, name: "Commercial Properties 8%+" }
          ]
        }
      };
    },
  });

  // Profile form setup
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      companyName: "",
      bio: "",
      location: "",
      website: "",
    },
  });

  // Update form with user data once it's loaded
  React.useEffect(() => {
    if (userData?.data) {
      profileForm.reset({
        fullName: userData.data.fullName || "",
        email: userData.data.email || "",
        phoneNumber: userData.data.phoneNumber || "",
        companyName: userData.data.companyName || "",
        bio: userData.data.bio || "",
        location: userData.data.location || "",
        website: userData.data.website || "",
      });
    }
  }, [userData, profileForm]);

  // Notification form setup
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      newListingAlerts: true,
      priceChangeAlerts: true,
      newsAndUpdates: true,
    },
  });

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      return await apiRequest({
        url: `/api/users/profile`,
        method: "PATCH",
        data: values,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/current'] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    },
  });

  function onProfileSubmit(values: ProfileFormValues) {
    profileMutation.mutate(values);
  }

  // Notification settings mutation
  const notificationMutation = useMutation({
    mutationFn: async (values: NotificationFormValues) => {
      return await apiRequest({
        url: `/api/users/notifications`,
        method: "PATCH",
        data: values,
      });
    },
    onSuccess: () => {
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem updating your notification settings.",
        variant: "destructive",
      });
    },
  });

  function onNotificationSubmit(values: NotificationFormValues) {
    notificationMutation.mutate(values);
  }

  function onDeleteAccount() {
    // This would be implemented with a real API call in a production environment
    toast({
      title: "Account Deletion Requested",
      description: "Your account deletion request has been submitted. Our team will contact you to complete the process.",
    });
  }

  function onDeactivateAccount() {
    // This would be implemented with a real API call in a production environment
    toast({
      title: "Account Deactivated",
      description: "Your account has been deactivated. You can reactivate it by logging in again.",
    });
  }

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const user = userData?.data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl py-10 px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-3 pb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.profileImage} alt={user?.fullName} />
                <AvatarFallback className="text-xl bg-primary/10">
                  {user?.fullName?.split(' ').map(name => name[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{user?.fullName}</h2>
                <p className="text-sm text-muted-foreground">{user?.role}</p>
              </div>
            </div>

            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/marketplace">
                  <Search className="mr-2 h-4 w-4" />
                  My Searches
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/marketplace">
                  <Star className="mr-2 h-4 w-4" />
                  Saved Notes
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/selling">
                  <FileText className="mr-2 h-4 w-4" />
                  My Listings
                </a>
              </Button>
              {user?.role === "admin" && (
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </a>
                </Button>
              )}
              <Button variant="ghost" className="w-full justify-start text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </nav>

            <Separator />

            <div className="text-sm mt-6">
              <h3 className="font-medium mb-2">Saved Searches</h3>
              <ul className="space-y-1">
                {user?.savedSearches?.map((search: any) => (
                  <li key={search.id} className="flex items-center justify-between group">
                    <a 
                      href={`/marketplace?search=${search.id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-1 truncate"
                    >
                      {search.name}
                    </a>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <BookmarkMinus className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Account Settings
            </h1>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and public profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="john.doe@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="phoneNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="(555) 123-4567" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Acme Inc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Denver, CO" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us a little about yourself and your investment interests..." 
                                    className="resize-none min-h-[120px]" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  This will be displayed on your public profile.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <Button 
                            type="submit" 
                            disabled={profileMutation.isPending}
                            className="flex items-center"
                          >
                            {profileMutation.isPending ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>
                      Update your profile picture or logo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user?.profileImage} alt={user?.fullName} />
                        <AvatarFallback className="text-2xl bg-primary/10">
                          {user?.fullName?.split(' ').map(name => name[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="profile-picture">Upload a new picture</Label>
                          <Input id="profile-picture" type="file" className="mt-1" />
                          <p className="text-sm text-muted-foreground mt-1">
                            JPG, GIF or PNG. 2MB max.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">Upload</Button>
                          <Button variant="outline" className="text-destructive">Remove</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between space-x-2">
                              <div className="space-y-0.5">
                                <Label htmlFor="email-notif">Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                              </div>
                              <FormField
                                control={notificationForm.control}
                                name="emailNotifications"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch 
                                        id="email-notif"
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between space-x-2">
                              <div className="space-y-0.5">
                                <Label htmlFor="sms-notif">SMS Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                              </div>
                              <FormField
                                control={notificationForm.control}
                                name="smsNotifications"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch 
                                        id="sms-notif"
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between space-x-2">
                              <div className="space-y-0.5">
                                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                                <p className="text-sm text-muted-foreground">Receive emails about new features and offers</p>
                              </div>
                              <FormField
                                control={notificationForm.control}
                                name="marketingEmails"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch 
                                        id="marketing-emails"
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between space-x-2">
                              <div className="space-y-0.5">
                                <Label htmlFor="new-listing-alerts">New Listing Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified when new notes matching your criteria are listed</p>
                              </div>
                              <FormField
                                control={notificationForm.control}
                                name="newListingAlerts"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch 
                                        id="new-listing-alerts"
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between space-x-2">
                              <div className="space-y-0.5">
                                <Label htmlFor="price-change-alerts">Price Change Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified when prices change on notes you're watching</p>
                              </div>
                              <FormField
                                control={notificationForm.control}
                                name="priceChangeAlerts"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch 
                                        id="price-change-alerts"
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between space-x-2">
                              <div className="space-y-0.5">
                                <Label htmlFor="news-updates">News & Updates</Label>
                                <p className="text-sm text-muted-foreground">Receive platform news and industry updates</p>
                              </div>
                              <FormField
                                control={notificationForm.control}
                                name="newsAndUpdates"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch 
                                        id="news-updates"
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={notificationMutation.isPending}
                          className="flex items-center"
                        >
                          {notificationMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Preferences
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    <Button className="mt-2">
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>
                      Manage your account status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Deactivate Account</h3>
                        <p className="text-sm text-muted-foreground">
                          Temporarily disable your account
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">Deactivate</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to deactivate your account? You can reactivate it at any time by logging in again.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDeactivateAccount}>
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-destructive">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <UserX className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              <p className="mb-2">
                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                              </p>
                              <div className="flex items-start space-x-2 bg-amber-50 text-amber-900 p-3 rounded-md mt-2">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                  <p className="font-medium">Important Note:</p>
                                  <p>
                                    Any active listings or transactions will need to be resolved before account deletion can be completed.
                                  </p>
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={onDeleteAccount}>
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="mt-6 text-sm text-muted-foreground">
                      <h4 className="font-medium mb-1">Data Retention Policy:</h4>
                      <p>
                        When you delete your account, we retain certain information for compliance and legal purposes. 
                        Personal identifying information is removed, but anonymized transaction data may be kept for 
                        analytics purposes. For more details, please review our privacy policy.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing & Subscription</CardTitle>
                    <CardDescription>
                      Manage your subscription and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-lg">Pro Plan</h3>
                          <p className="text-muted-foreground">$49.99 per month</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <p className="text-sm text-muted-foreground">Next billing date: April 15, 2025</p>
                        <Button variant="outline" size="sm">Change Plan</Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Payment Methods</h3>
                      <div className="space-y-3">
                        <div className="border rounded-lg p-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <CreditCard className="w-5 h-5 mr-3" />
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-sm text-muted-foreground">Expires 05/2027</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-auto mr-2">Default</Badge>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Billing History</h3>
                      <div className="border rounded-lg divide-y">
                        <div className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">March 15, 2025</p>
                            <p className="text-sm text-muted-foreground">Pro Plan - Monthly</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">$49.99</p>
                            <Button variant="link" size="sm" className="px-0 h-auto">
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">February 15, 2025</p>
                            <p className="text-sm text-muted-foreground">Pro Plan - Monthly</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">$49.99</p>
                            <Button variant="link" size="sm" className="px-0 h-auto">
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">January 15, 2025</p>
                            <p className="text-sm text-muted-foreground">Pro Plan - Monthly</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">$49.99</p>
                            <Button variant="link" size="sm" className="px-0 h-auto">
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}