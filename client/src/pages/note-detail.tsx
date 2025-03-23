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
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  GalleryHorizontalEnd, 
  History, 
  LayoutDashboard, 
  Lock, 
  MapPin, 
  Percent, 
  User as UserIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function NoteDetailPage() {
  const [, params] = useRoute("/note/:id");
  const noteId = params?.id ? parseInt(params.id) : null;
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { toast } = useToast();
  
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
    // Cash on cash return
    const monthlyIncome = listing.paymentAmount;
    const annualIncome = monthlyIncome * 12;
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <p className="text-lg font-semibold">{formatCurrency(listing.paymentAmount)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Calendar className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-lg font-semibold">{listing.remainingPayments} months</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <History className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Time Held</p>
                    <p className="text-lg font-semibold">{listing.timeHeld} months</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tabs for details */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
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
                </TabsList>
                
                <TabsContent value="overview" className="p-4 border rounded-lg mt-4">
                  {/* Main details grid layout based on screenshot */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-10 mb-8">
                    {/* Left column - first row */}
                    <div>
                      <div className="text-gray-600 text-sm">Unpaid Principal Balance</div>
                      <div className="text-3xl font-bold">{formatCurrency(listing.loanAmount - (listing.loanAmount * (listing.timeHeld / listing.loanTerm)))}</div>
                    </div>
                    
                    {/* Right column - first row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                      <div>
                        <div className="text-gray-600 text-sm">Monthly Payment</div>
                        <div className="text-xl font-bold">${listing.paymentAmount.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-sm">Principle & Interest</div>
                        <div className="text-xl font-bold">${listing.paymentAmount.toFixed(0)}</div>
                      </div>
                    </div>
                    
                    {/* Left column - second row */}
                    <div>
                      <div className="text-gray-600 text-sm">Original Balance</div>
                      <div className="text-3xl font-bold">{formatCurrency(listing.loanAmount)}</div>
                    </div>
                    
                    {/* Right column - second row */}
                    <div>
                      <div className="text-gray-600 text-sm">Total Payoff</div>
                      <div className="text-3xl font-bold">{formatCurrency(listing.paymentAmount * listing.remainingPayments)}</div>
                    </div>
                    
                    {/* Stats row with 3 columns */}
                    <div className="md:col-span-2 grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">1st</div>
                        <div className="text-gray-600 text-sm">Lien Position</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold">{listing.interestRate}%</div>
                        <div className="text-gray-600 text-sm">Interest Rate</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold">67%</div>
                        <div className="text-gray-600 text-sm">LTV</div>
                      </div>
                    </div>
                    
                    {/* Bottom grid for dates and additional info */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-4 mt-4">
                      <div className="flex justify-between">
                        <div className="text-gray-600">Origination</div>
                        <div>Oct 18, 2022</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-gray-600">Accrued Late Charges</div>
                        <div>$53,291.26</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-gray-600">Maturity</div>
                        <div>Oct 17, 2023</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-gray-600">Last Payment Received</div>
                        <div>No data</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-gray-600">Escrow</div>
                        <div>$0</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-gray-600">Next Payment Date</div>
                        <div>No data</div>
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
      
      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact the Seller</DialogTitle>
            <DialogDescription>
              Send a message to the seller of this note. They will respond to your inquiry directly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Your message
              </label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="I'm interested in this note. Please provide more information about..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContactSeller}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}