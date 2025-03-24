import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { type NoteDocument, type NoteListing, type User } from "@shared/schema";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { InquiryForm, InquiryList } from "@/components/inquiries";
import { 
  BarChart3,
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  GalleryHorizontalEnd, 
  History, 
  Home,
  LayoutDashboard, 
  Lock, 
  MapPin, 
  MessageCircle,
  Percent,
  PiggyBank,
  User as UserIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function NoteDetailPage() {
  const [, params] = useRoute("/note/:id");
  const noteId = params?.id ? parseInt(params.id) : null;
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Helper function to calculate monthly mortgage payment
  const calculateMonthlyPayment = (principal: number, monthlyRate: number, termMonths: number): number => {
    // Handle edge cases
    if (monthlyRate === 0) return principal / termMonths;
    if (termMonths === 0) return principal;
    
    // Standard mortgage payment formula: P * (r(1+r)^n) / ((1+r)^n - 1)
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
    const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
    return principal * (numerator / denominator);
  };
  
  // Fetch note listing details
  const { data: listingData, isLoading: isListingLoading, error: listingError } = useQuery<{ success: boolean; data: NoteListing }>({
    queryKey: [`/api/note-listings/${noteId}`],
    enabled: !!noteId
  });
  
  // Fetch note documents
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery<{ success: boolean; data: NoteDocument[] }>({
    queryKey: [`/api/note-documents/listing/${noteId}`],
    enabled: !!noteId
  });
  
  // Fetch seller information
  const { data: sellerData, isLoading: isSellerLoading } = useQuery<{ success: boolean; data: User }>({
    queryKey: [`/api/users/${listingData?.data.sellerId}`],
    enabled: !!listingData?.data.sellerId
  });
  
  const listing = listingData?.data;
  const documents = documentsData?.data || [];
  const seller = sellerData?.data;
  
  // Calculate ROI and other metrics
  const calculateROI = (listing: NoteListing) => {
    if (!listing) return null;
    // Annual yield calculation (simplified)
    const annualYield = listing.interestRate.toFixed(2);
    // Calculate monthly payment amount based on current loan amount, interest rate, and remaining term
    // This is an approximation of a mortgage payment calculation
    const monthlyInterestRate = listing.interestRate / 100 / 12;
    const remainingMonths = listing.remainingLoanTerm;
    const monthlyPayment = listing.monthlyPaymentAmount || calculateMonthlyPayment(listing.currentLoanAmount, monthlyInterestRate, remainingMonths);
    
    const annualIncome = monthlyPayment * 12;
    const cashOnCash = ((annualIncome / listing.askingPrice) * 100).toFixed(2);
    
    return {
      annualYield,
      cashOnCash
    };
  };
  
  const metrics = listing ? calculateROI(listing) : null;
  
  const handleContactSeller = () => {
    // In a real app, this would send a message to the seller
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the seller. They will contact you shortly.",
    });
    setIsContactDialogOpen(false);
  };
  
  const isLoading = isListingLoading || isDocumentsLoading || isSellerLoading;
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container px-4 py-12 mx-auto max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (listingError || !listing) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container px-4 py-12 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-bold mb-2">Note Not Found</h2>
            <p className="text-muted-foreground mb-6">The note you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/marketplace">Return to Marketplace</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 py-12 mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/marketplace">Marketplace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Note {listing.id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Main content */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left column - Note details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Note header */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {formatCurrency(listing.askingPrice)}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground">{listing.propertyAddress}</p>
                <div className="flex items-center mt-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-foreground text-primary">
                    {listing.propertyType}
                  </span>
                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    {listing.status === 'active' ? 'Available' : listing.status}
                  </span>
                </div>
              </div>
              
              {/* Property visual */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-32 h-32 text-white opacity-50" />
              </div>
              
              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Percent className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Interest Rate</p>
                    <p className="text-lg font-semibold">{listing.interestRate}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <DollarSign className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Unpaid Principal</p>
                    <p className="text-lg font-semibold">{formatCurrency(listing.currentLoanAmount)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <PiggyBank className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Monthly Payment</p>
                    <p className="text-lg font-semibold">{formatCurrency(listing.monthlyPaymentAmount)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <BarChart3 className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">LTV Ratio</p>
                    <p className="text-lg font-semibold">{listing.loanToValueRatio || '75'}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Home className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Property Value</p>
                    <p className="text-lg font-semibold">{formatCurrency(listing.propertyValue || listing.currentLoanAmount * (100 / (listing.loanToValueRatio || 75)))}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Calendar className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-lg font-semibold">{listing.remainingLoanTerm} months</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tabs for details */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="documents">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents ({documents.length})
                  </TabsTrigger>
                  <TabsTrigger value="location">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="inquiries">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Inquiries
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="p-5 border rounded-lg mt-4">
                  {/* Main details grid layout based on screenshot with improved formatting */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-14 mb-8">
                    {/* Left column - first row */}
                    <div>
                      <div className="text-gray-600 text-sm font-medium mb-1.5">Unpaid Principal Balance</div>
                      <div className="text-3xl font-bold">{formatCurrency(listing.currentLoanAmount)}</div>
                    </div>
                    
                    {/* Right column - first row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                      <div>
                        <div className="text-gray-600 text-sm font-medium mb-1.5">Monthly Payment</div>
                        <div className="text-xl font-bold">${listing.monthlyPaymentAmount.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-sm font-medium mb-1.5">Principle & Interest</div>
                        <div className="text-xl font-bold">${listing.monthlyPaymentAmount.toFixed(0)}</div>
                      </div>
                    </div>
                    
                    {/* Left column - second row */}
                    <div>
                      <div className="text-gray-600 text-sm font-medium mb-1.5">Original Balance</div>
                      <div className="text-3xl font-bold">{formatCurrency(listing.originalLoanAmount)}</div>
                    </div>
                    
                    {/* Right column - second row */}
                    <div>
                      <div className="text-gray-600 text-sm font-medium mb-1.5">Total Payoff</div>
                      <div className="text-3xl font-bold">{formatCurrency(listing.monthlyPaymentAmount * listing.remainingLoanTerm)}</div>
                    </div>
                    
                    {/* Stats row with 3 columns */}
                    <div className="md:col-span-2 grid grid-cols-3 gap-4 my-6">
                      <div className="text-center bg-gray-50 rounded-lg py-4 shadow-sm">
                        <div className="text-3xl font-bold">1st</div>
                        <div className="text-gray-600 text-sm mt-1">Lien Position</div>
                      </div>
                      
                      <div className="text-center bg-gray-50 rounded-lg py-4 shadow-sm">
                        <div className="text-3xl font-bold">{listing.interestRate}%</div>
                        <div className="text-gray-600 text-sm mt-1">Interest Rate</div>
                      </div>
                      
                      <div className="text-center bg-gray-50 rounded-lg py-4 shadow-sm">
                        <div className="text-3xl font-bold">{listing.loanToValueRatio || '75'}%</div>
                        <div className="text-gray-600 text-sm mt-1">LTV</div>
                      </div>
                    </div>
                    
                    {/* Bottom grid for dates and additional info */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6 mt-4">
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-gray-600 font-medium">Origination</div>
                        <div className="font-semibold">Oct 18, 2022</div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-gray-600 font-medium">Accrued Late Charges</div>
                        <div className="font-semibold">$53,291.26</div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-gray-600 font-medium">Maturity</div>
                        <div className="font-semibold">Oct 17, 2023</div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-gray-600 font-medium">Last Payment Received</div>
                        <div className="font-semibold text-gray-500">No data</div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-gray-600 font-medium">Escrow</div>
                        <div className="font-semibold">$0</div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-gray-600 font-medium">Property Value</div>
                        <div className="font-semibold">{formatCurrency(listing.propertyValue || (listing.currentLoanAmount * (100 / (listing.loanToValueRatio || 75))))}</div>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <div className="text-gray-600 font-medium">Next Payment Date</div>
                        <div className="font-semibold text-gray-500">No data</div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-muted-foreground">
                    {listing.description || "No description provided for this note."}
                  </p>
                </TabsContent>
                
                <TabsContent value="documents" className="p-4 border rounded-lg mt-4">
                  <h3 className="text-lg font-semibold mb-4">Available Documents</h3>
                  
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-muted-foreground">
                        Documents are available to serious buyers only.
                        Contact the seller to request access.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-accent">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 mr-3 text-primary" />
                            <div>
                              <p className="font-medium">{doc.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentType} • {(doc.fileSize / 1024).toFixed(0)} KB
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Request
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="location" className="p-4 border rounded-lg mt-4">
                  <h3 className="text-lg font-semibold mb-4">Property Location</h3>
                  
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground opacity-50" />
                    <p className="ml-2 text-muted-foreground">
                      Map view available upon request
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Address</h4>
                    <p className="text-muted-foreground">{listing.propertyAddress}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="inquiries" className="p-4 border rounded-lg mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Inquiries and Offers</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setIsContactDialogOpen(true)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Send Inquiry
                    </Button>
                  </div>
                  
                  {/* Using the InquiryList component */}
                  <InquiryList 
                    listingId={listing.id}
                    isSeller={seller?.id === 1} // In a real app, compare to the logged-in user ID
                    maxHeight="500px"
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right column - Contact and investment info */}
            <div className="space-y-6">
              {/* Investment metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Metrics</CardTitle>
                  <CardDescription>Potential returns on this note</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asking Price</span>
                    <span className="font-semibold">{formatCurrency(listing.askingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Yield</span>
                    <span className="font-semibold">{metrics?.annualYield}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash on Cash Return</span>
                    <span className="font-semibold">{metrics?.cashOnCash}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Income</span>
                    <span className="font-semibold">{formatCurrency(listing.paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining Term</span>
                    <span className="font-semibold">{listing.remainingPayments} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LTV Ratio</span>
                    <span className="font-semibold">{listing.loanToValueRatio || '75'}%</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-gradient-to-r from-primary to-purple-600 text-white" onClick={() => setIsContactDialogOpen(true)}>
                    Inquire About This Note
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Seller info */}
              <Card>
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                  <CardDescription>About the note holder</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center mr-4">
                      <UserIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{seller?.username || "Private Seller"}</h4>
                      {seller?.company && (
                        <p className="text-sm text-muted-foreground">{seller.company}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Member since: </span>
                      {new Date(seller?.createdAt || "").toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Note listed on: </span>
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="w-full" onClick={() => setIsContactDialogOpen(true)}>
                    Contact Seller
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Safety tips */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Investment Safety Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      Always perform due diligence on the note and property
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      Review all documents with a legal professional
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      Verify payment history and borrower information
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      Use secure payment methods for transactions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Related listings section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Similar Notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="opacity-50 hover:opacity-100 transition-opacity">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground py-8">
                    Login or sign up to view similar notes
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/marketplace">
                      View Marketplace
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Inquiry Form Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {listing && (
            <InquiryForm
              isOpen={isContactDialogOpen}
              onClose={() => setIsContactDialogOpen(false)}
              noteListingId={listing.id}
              buyerId={1} // In a real app, this would be the logged-in user's ID
              noteName={listing.title || `Note ${listing.id}`}
              askingPrice={listing.askingPrice}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}