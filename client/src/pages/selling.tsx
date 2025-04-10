import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertNoteListingSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, PlusCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import Header from "@/components/landing/Header";

import { Helmet } from "react-helmet";
import { StatusIndicator } from "@/components/marketplace/StatusIndicator";

// Extend the insert schema with validation
const createNoteSchema = insertNoteListingSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  propertyAddress: z.string().min(5, "Address must be at least 5 characters"),
  originalLoanAmount: z.number().min(1, "Original loan amount is required"),
  currentLoanAmount: z.number().min(1, "Current loan amount is required"),
  interestRate: z.number().min(0.1, "Interest rate must be positive"),
  monthlyPaymentAmount: z.number().min(1, "Monthly payment is required"),
  remainingLoanTerm: z.number().min(1, "Remaining term is required"),
  askingPrice: z.number().min(1, "Asking price is required"),
  propertyValue: z.number().min(1, "Property value is required"),
});

export default function SellingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch user's listings
  const { data: userListings = [], isLoading: isLoadingListings } = useQuery({
    queryKey: ['/api/note-listings/seller', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/note-listings/seller/${user.id}`);
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!user?.id,
  });

  // Form setup
  const form = useForm<z.infer<typeof createNoteSchema>>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      sellerId: user?.id,
      title: "",
      noteType: "Residential Mortgage",
      performanceStatus: "performing",
      originalLoanAmount: 0,
      currentLoanAmount: 0,
      interestRate: 0,
      originalLoanTerm: 360,
      remainingLoanTerm: 0,
      monthlyPaymentAmount: 0,
      propertyAddress: "",
      propertyState: "",
      propertyType: "Single Family",
      propertyValue: 0,
      loanToValueRatio: 75,
      isSecured: true,
      askingPrice: 0,
      paymentFrequency: "monthly",
      status: "pending",
      description: "",
      isPublic: true,
    },
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createNoteSchema>) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      try {
        // Make sure original loan term is included
        // Calculate it if not provided (e.g., 30 year mortgage = 360 months)
        const originalLoanTerm = values.originalLoanTerm || 360;
        
        // Log the full payload for debugging
        console.log("Submitting with values:", {
          ...values,
          sellerId: user.id,
          status: "pending",
          originalLoanTerm,
          isPublic: true
        });
        
        // Clear any existing flags first to ensure we don't have stale data
        sessionStorage.removeItem('newListingAdded');
        sessionStorage.removeItem('newNoteId');
        
        // Prepare the complete submission payload with all required fields
        const submissionPayload = {
          ...values,
          sellerId: user.id,
          status: "pending", 
          originalLoanTerm,
          isPublic: true
        };
        
        // Submit to the API
        const response = await apiRequest("POST", "/api/note-listings", submissionPayload);
        
        if (!response.ok) {
          const error = await response.json();
          console.error("Create listing error:", error);
          throw new Error(error.message || "Failed to create listing");
        }
        
        // Parse the response
        const result = await response.json();
        console.log("Listing created successfully:", result);
        return result;
      } catch (error) {
        console.error("Error in createNoteMutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Note Listed",
        description: "Your note has been successfully submitted for review.",
      });
      form.reset();
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/note-listings/seller', user?.id] });
      
      // Store the newly created note ID in sessionStorage for animation purposes
      if (data.data?.id) {
        sessionStorage.setItem('newNoteId', data.data.id.toString());
      }
      
      // Set a flag to indicate a new listing was added
      sessionStorage.setItem('newListingAdded', 'true');
      
      // Redirect to marketplace with a slight delay to allow toast to be visible
      console.log("Preparing to redirect to marketplace...");
      toast({
        title: "Redirecting to marketplace...",
        description: "Your listing has been submitted successfully.",
      });
      
      // Redirect to marketplace after a short delay
      setTimeout(() => {
        console.log("Redirecting to marketplace now!");
        setLocation('/marketplace');
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof createNoteSchema>) => {
    try {
      console.log("Form submitted with values:", values);
      
      // Make sure originalLoanTerm is provided
      if (!values.originalLoanTerm) {
        values.originalLoanTerm = 360;
      }
      
      // Make sure user ID is set
      if (!values.sellerId && user?.id) {
        values.sellerId = user.id;
      }
      
      console.log("Submitting note with values:", values);
      toast({
        title: "Processing submission...",
        description: "Please wait while we process your listing.",
      });
      
      // Call the mutation and await its completion
      await createNoteMutation.mutateAsync(values);
      
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Early return if the user isn't logged in (for safety - should be handled by protected route)
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1a2332]">
      <Helmet>
        <title>Sell Notes | NoteTrade</title>
      </Helmet>
      
      <Header />
      
      <main className="flex-1 container max-w-7xl py-12">
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          {/* Left column - selling form */}
          <div className="md:w-1/2">
            <div className="bg-gradient-to-br from-[#131823] to-[#111827] rounded-xl border border-white/10 shadow-lg p-6">
              <h1 className="text-3xl font-bold mb-6 text-white">List Your Note</h1>
              <p className="text-white/70 mb-8">
                Complete the form below to list your note for sale. All listings are reviewed 
                before being published to the marketplace.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Note Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Performing First Lien in Miami, FL" 
                            {...field}
                            className="bg-black/30 border-white/10 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="noteType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Note Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black/30 border-white/10 text-white">
                                <SelectValue placeholder="Select Note Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#131823] border-white/10 text-white">
                              <SelectItem value="Residential Mortgage">Residential Mortgage</SelectItem>
                              <SelectItem value="Commercial Mortgage">Commercial Mortgage</SelectItem>
                              <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                              <SelectItem value="Business Loan">Business Loan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="performanceStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Performance Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black/30 border-white/10 text-white">
                                <SelectValue placeholder="Select Performance Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#131823] border-white/10 text-white">
                              <SelectItem value="performing">Performing</SelectItem>
                              <SelectItem value="non-performing">Non-Performing</SelectItem>
                              <SelectItem value="sub-performing">Sub-Performing</SelectItem>
                              <SelectItem value="re-performing">Re-Performing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="originalLoanAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Original Loan Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Original loan amount" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="bg-black/30 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currentLoanAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Current Loan Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Current loan amount" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="bg-black/30 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="interestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Interest Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="Interest rate" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="bg-black/30 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monthlyPaymentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Monthly Payment</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Monthly payment" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="bg-black/30 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="originalLoanTerm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Original Loan Term (months)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Original loan term" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="bg-black/30 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-white/50 text-xs">
                            Typical mortgage is 30 years (360 months)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="remainingLoanTerm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Remaining Term (months)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Remaining term" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="bg-black/30 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="propertyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Property Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Full property address" 
                            {...field}
                            className="bg-black/30 border-white/10 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Property State</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="State (e.g., FL)" 
                              {...field}
                              className="bg-black/30 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black/30 border-white/10 text-white">
                                <SelectValue placeholder="Select Property Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#131823] border-white/10 text-white">
                              <SelectItem value="Single Family">Single Family</SelectItem>
                              <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                              <SelectItem value="Condo">Condo</SelectItem>
                              <SelectItem value="Commercial">Commercial</SelectItem>
                              <SelectItem value="Land">Land</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Property Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Property value" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="bg-black/30 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="askingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Asking Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Asking price" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="bg-black/30 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => {
                      // Transform field to ensure the value is always a string
                      const fieldProps = {
                        ...field,
                        value: typeof field.value === 'string' ? field.value : ''
                      };
                      
                      return (
                        <FormItem>
                          <FormLabel className="text-white">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide details about the note and property" 
                              className="min-h-[120px] bg-black/30 border-white/10 text-white"
                              {...fieldProps}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  
                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="bg-[#c49c6c] hover:bg-[#b38b5b] text-white w-full"
                      disabled={createNoteMutation.isPending}
                    >
                      {createNoteMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Listing"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
          
          {/* Right column - My listings */}
          <div className="md:w-1/2">
            <div className="bg-gradient-to-br from-[#131823] to-[#111827] rounded-xl border border-white/10 shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">My Listings</h2>
              
              {isLoadingListings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 text-[#c49c6c] animate-spin" />
                </div>
              ) : userListings.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/20 rounded-lg bg-black/20">
                  <p className="text-white/70 mb-4">You don't have any listings yet</p>
                  <Button 
                    onClick={() => document.getElementById('create-listing-form')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="outline"
                    className="gap-2 text-[#c49c6c] border-[#c49c6c]/20 hover:bg-[#c49c6c]/10"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userListings.map((listing: any) => (
                    <Card key={listing.id} className="bg-black/30 backdrop-blur-sm border border-white/10 relative overflow-hidden hover:border-white/20 transition-all">
                      <div className="absolute inset-0 rounded-lg border border-white/5 pointer-events-none"></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white">{listing.title}</CardTitle>
                            <CardDescription className="text-white/70">{listing.propertyAddress}</CardDescription>
                          </div>
                          <StatusIndicator status={listing.status} className="mt-1" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-white/70">Asking Price:</div>
                          <div className="text-white font-medium text-right">${listing.askingPrice.toLocaleString()}</div>
                          
                          <div className="text-white/70">Note Type:</div>
                          <div className="text-white font-medium text-right">{listing.noteType}</div>
                          
                          <div className="text-white/70">Status:</div>
                          <div className="text-white font-medium text-right capitalize">
                            {listing.status === 'active' ? 'Published' : listing.status}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-white/10 pt-3">
                        <Button variant="link" className="text-[#c49c6c] p-0">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      
    </div>
  );
}