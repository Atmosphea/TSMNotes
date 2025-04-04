import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";
import { type FormValues } from "@/components/inquiries/InquiryForm";
import { useAuth } from "@/contexts/AuthContext";

export default function NoteDetailPage() {
  const [, params] = useRoute("/note/:id");
  const noteId = params?.id ? parseInt(params.id) : null;
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

      <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 relative">
        <div className="absolute inset-5 border border-white/20"></div>
        <div className="container px-4 py-12 mx-auto max-w-7xl relative z-10">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-white opacity-80 hover:opacity-100">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white opacity-50" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/marketplace" className="text-white opacity-80 hover:opacity-100">Marketplace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white opacity-50" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Note {listing.id}</BreadcrumbPage>
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
                <Card className="bg-black/30 backdrop-blur-sm border border-white/10 relative">
                  <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Percent className="w-8 h-8 text-[#c49c6c] mb-2" />
                    <p className="text-xs text-white/70">Interest Rate</p>
                    <p className="text-lg font-semibold text-white">{listing.interestRate}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/30 backdrop-blur-sm border border-white/10 relative">
                  <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <DollarSign className="w-8 h-8 text-[#c49c6c] mb-2" />
                    <p className="text-xs text-white/70">Unpaid Principal</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(listing.currentLoanAmount)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/30 backdrop-blur-sm border border-white/10 relative">
                  <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <PiggyBank className="w-8 h-8 text-[#c49c6c] mb-2" />
                    <p className="text-xs text-white/70">Monthly Payment</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(listing.monthlyPaymentAmount)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/30 backdrop-blur-sm border border-white/10 relative">
                  <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <BarChart3 className="w-8 h-8 text-[#c49c6c] mb-2" />
                    <p className="text-xs text-white/70">LTV Ratio</p>
                    <p className="text-lg font-semibold text-white">{listing.loanToValueRatio || '75'}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/30 backdrop-blur-sm border border-white/10 relative">
                  <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Home className="w-8 h-8 text-[#c49c6c] mb-2" />
                    <p className="text-xs text-white/70">Property Value</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(listing.propertyValue || listing.currentLoanAmount * (100 / (listing.loanToValueRatio || 75)))}</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/30 backdrop-blur-sm border border-white/10 relative">
                  <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Calendar className="w-8 h-8 text-[#c49c6c] mb-2" />
                    <p className="text-xs text-white/70">Remaining</p>
                    <p className="text-lg font-semibold text-white">{listing.remainingLoanTerm} months</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for details */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-black/30 backdrop-blur-sm border-white/10">
                  <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[#c49c6c] data-[state=active]:text-white">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-white data-[state=active]:bg-[#c49c6c] data-[state=active]:text-white">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents ({documents.length})
                  </TabsTrigger>
                  <TabsTrigger value="location" className="text-white data-[state=active]:bg-[#c49c6c] data-[state=active]:text-white">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="inquiries" className="text-white data-[state=active]:bg-[#c49c6c] data-[state=active]:text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Inquiries
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-5 border border-white/10 rounded-lg mt-4 bg-black/30 backdrop-blur-sm text-white">
                  {/* Main details grid layout based on screenshot with improved formatting */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-14 mb-8">
                    {/* Left column - first row */}
                    <div>
                      <div className="text-white/70 text-sm font-medium mb-1.5">Unpaid Principal Balance</div>
                      <div className="text-3xl font-bold text-white">{formatCurrency(listing.currentLoanAmount)}</div>
                    </div>

                    {/* Right column - first row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                      <div>
                        <div className="text-white/70 text-sm font-medium mb-1.5">Monthly Payment</div>
                        <div className="text-xl font-bold text-white">${listing.monthlyPaymentAmount.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-white/70 text-sm font-medium mb-1.5">Term</div>
                        <div className="text-xl font-bold text-white">{listing.remainingLoanTerm} months</div>
                      </div>
                    </div>

                    {/* Left column - second row */}
                    <div>
                      <div className="text-white/70 text-sm font-medium mb-1.5">Original Loan Amount</div>
                      <div className="text-3xl font-bold text-white">{formatCurrency(listing.originalLoanAmount)}</div>
                    </div>

                    {/* Right column - second row */}
                    <div>
                      <div className="text-white/70 text-sm font-medium mb-1.5">Remaining Balance</div>
                      <div className="text-3xl font-bold text-white">{formatCurrency(listing.currentLoanAmount)}</div>
                    </div>

                    {/* Stats row with 3 columns */}
                    <div className="md:col-span-2 grid grid-cols-3 gap-4 my-6">
                      <div className="text-center bg-black/50 rounded-lg py-4 shadow-sm border border-white/10">
                        <div className="text-3xl font-bold text-white">1st</div>
                        <div className="text-white/70 text-sm mt-1">Lien Position</div>
                      </div>

                      <div className="text-center bg-black/50 rounded-lg py-4 shadow-sm border border-white/10">
                        <div className="text-3xl font-bold text-white">{listing.interestRate}%</div>
                        <div className="text-white/70 text-sm mt-1">Interest Rate</div>
                      </div>

                      <div className="text-center bg-black/50 rounded-lg py-4 shadow-sm border border-white/10">
                        <div className="text-3xl font-bold text-white">{listing.loanToValueRatio || '75'}%</div>
                        <div className="text-white/70 text-sm mt-1">LTV</div>
                      </div>
                    </div>

                    {/* Bottom grid for dates and additional info */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6 mt-4">
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <div className="text-white/70 font-medium">Origination</div>
                        <div className="font-semibold text-white">Oct 18, 2022</div>
                      </div>

                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <div className="text-white/70 font-medium">Accrued Late Charges</div>
                        <div className="font-semibold text-white">$53,291.26</div>
                      </div>

                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <div className="text-white/70 font-medium">Maturity</div>
                        <div className="font-semibold text-white">Oct 17, 2023</div>
                      </div>

                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <div className="text-white/70 font-medium">Last Payment Received</div>
                        <div className="font-semibold text-white/50">No data</div>
                      </div>

                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <div className="text-white/70 font-medium">Escrow</div>
                        <div className="font-semibold text-white">$0</div>
                      </div>

                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <div className="text-white/70 font-medium">Property Value</div>
                        <div className="font-semibold text-white">{formatCurrency(listing.propertyValue || (listing.currentLoanAmount * (100 / (listing.loanToValueRatio || 75))))}</div>
                      </div>

                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <div className="text-white/70 font-medium">Next Payment Date</div>
                        <div className="font-semibold text-white/50">No data</div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6 bg-white/20" />

                  <h3 className="text-lg font-semibold mb-4 text-white">Description</h3>
                  <p className="text-white/70">
                    {listing.description || "No description provided for this note."}
                  </p>
                </TabsContent>

                <TabsContent value="documents" className="p-4 border border-white/10 rounded-lg mt-4 bg-black/30 backdrop-blur-sm text-white">
                  <h3 className="text-lg font-semibold mb-4 text-white">Available Documents</h3>

                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 mx-auto text-white/50 opacity-50 mb-2" />
                      <p className="text-white/70">
                        Documents are available to serious buyers only.
                        Contact the seller to request access.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border border-white/10 rounded hover:bg-white/5">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 mr-3 text-[#c49c6c]" />
                            <div>
                              <p className="font-medium text-white">{doc.fileName}</p>
                              <p className="text-xs text-white/70">
                                {doc.documentType} • {(doc.fileSize / 1024).toFixed(0)} KB
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                            Request
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="location" className="p-4 border border-white/10 rounded-lg mt-4 bg-black/30 backdrop-blur-sm text-white">
                  <h3 className="text-lg font-semibold mb-4 text-white">Property Location</h3>

                  <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center border border-white/10">
                    <MapPin className="w-12 h-12 text-white/50 opacity-50" />
                    <p className="ml-2 text-white/70">
                      Map view available upon request
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2 text-white">Address</h4>
                    <p className="text-white/70">{listing.propertyAddress}</p>
                  </div>
                </TabsContent>

                <TabsContent value="inquiries" className="p-4 border border-white/10 rounded-lg mt-4 bg-black/30 backdrop-blur-sm text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Inquiries and Offers</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-white border-white/20 hover:bg-white/10 hover:text-white"
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
              <Card className="bg-black/30 backdrop-blur-sm border border-white/10 relative">
                <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                <CardHeader>
                  <CardTitle className="text-white">Investment Metrics</CardTitle>
                  <CardDescription className="text-white/70">Potential returns on this note</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Original Loan Amount</span>
                    <span className="font-semibold text-white">{formatCurrency(listing.originalLoanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Remaining Balance</span>
                    <span className="font-semibold text-white">{formatCurrency(listing.currentLoanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Note Rate</span>
                    <span className="font-semibold text-white">{listing.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Monthly Payment</span>
                    <span className="font-semibold text-white">{formatCurrency(listing.monthlyPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Term</span>
                    <span className="font-semibold text-white">{listing.remainingLoanTerm} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">LTV</span>
                    <span className="font-semibold text-white">{listing.loanToValueRatio || '75'}%</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#c49c6c] hover:bg-[#b38b5b] text-white" onClick={() => setIsContactDialogOpen(true)}>
                    Inquire About This Note
                  </Button>
                </CardFooter>
              </Card>

              {/* Seller info */}
              <Card className="bg-black/30 backdrop-blur-sm border border-white/10 relative">
                <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                <CardHeader>
                  <CardTitle className="text-white">Seller Information</CardTitle>
                  <CardDescription className="text-white/70">About the note holder</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#c49c6c]/20 flex items-center justify-center mr-4 border border-[#c49c6c]/30">
                      <UserIcon className="w-6 h-6 text-[#c49c6c]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{seller?.username || "Private Seller"}</h4>
                      {seller?.company && (
                        <p className="text-sm text-white/70">{seller.company}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-white">
                      <span className="text-white/70">Member since: </span>
                      {new Date(seller?.createdAt || "").toLocaleDateString()}
                    </p>
                    <p className="text-sm text-white">
                      <span className="text-white/70">Note listed on: </span>
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 hover:text-white" onClick={() => setIsContactDialogOpen(true)}>
                    Contact Seller
                  </Button>
                </CardFooter>
              </Card>

              {/* Safety tips */}
              <Card className="bg-black/30 backdrop-blur-sm border border-white/10 relative">
                <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Investment Safety Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2 text-white/70">
                    <li className="flex items-start">
                      <span className="mr-2 text-[#c49c6c]">•</span>
                      Always perform due diligence on the note and property
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-[#c49c6c]">•</span>
                      Review all documents with a legal professional
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-[#c49c6c]">•</span>
                      Verify payment history and borrower information
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-[#c49c6c]">•</span>
                      Use secure payment methods for transactions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related listings section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-white">Similar Notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="opacity-70 hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm border border-white/10 relative">
                <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                <CardContent className="p-6">
                  <p className="text-center text-white/70 py-8">
                    Login or sign up to view similar notes
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 hover:text-white">
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
          {listing && user ? (
            <InquiryForm
              isOpen={isContactDialogOpen}
              onClose={() => setIsContactDialogOpen(false)}
              noteListingId={listing.id}
              buyerId={user.id}
              noteName={listing.title || `Note ${listing.id}`}
              askingPrice={listing.askingPrice}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}