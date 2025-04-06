import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Lock, MapPin, MessageCircle, User as UserIcon, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import InquiryList from "../inquiries/InquiryList";
import InquiryForm from "../inquiries/InquiryForm";
import { useAuth } from "@/contexts/AuthContext";

interface NoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
}

export default function NoteDetailModal({ isOpen, onClose, noteId }: NoteDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({ annualYield: 9.2, cashOnCash: 12.5 });
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  // Fetch note listing data
  const { data: listing, isLoading: isListingLoading } = useQuery({
    queryKey: ['/api/note-listings', noteId],
    queryFn: async () => {
      const res = await fetch(`/api/note-listings/${noteId}`);
      const data = await res.json();
      return data.data;
    },
    enabled: isOpen && !!noteId,
  });

  // Fetch seller data
  const { data: seller, isLoading: isSellerLoading } = useQuery({
    queryKey: ['/api/users', listing?.sellerId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${listing.sellerId}`);
      const data = await res.json();
      return data;
    },
    enabled: isOpen && !!listing?.sellerId,
  });

  // Fetch documents
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: ['/api/note-documents', noteId],
    queryFn: async () => {
      const res = await fetch(`/api/note-documents/listing/${noteId}`);
      const data = await res.json();
      return data.data;
    },
    enabled: isOpen && !!noteId,
  });

  const documents = documentsData || [];
  const isLoading = isListingLoading || isSellerLoading || isDocumentsLoading;

  if (!isOpen) return null;

  if (isLoading || !listing) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center sm:items-center">
        <div className="bg-[#131823] p-6 rounded-t-xl sm:rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 border border-white/10">
          <div className="h-16 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-r-transparent border-[#c49c6c] animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center sm:items-center">
      {/* Transparent gradient header for closing */}
      <div 
        className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#c49c6c]/40 to-transparent z-10 cursor-pointer flex items-center justify-center"
        onClick={onClose}
      >
        <div className="bg-black/30 rounded-full p-2 backdrop-blur-sm border border-white/20">
          <X className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="bg-[#131823] rounded-t-xl sm:rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 border border-white/10">
        <div className="sticky top-0 z-20 bg-[#131823] pt-4 px-6 pb-2 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{listing.title}</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-black/30 border border-white/10">
                  <TabsTrigger value="overview" className="text-white data-[state=active]:text-[#c49c6c]">Overview</TabsTrigger>
                  <TabsTrigger value="documents" className="text-white data-[state=active]:text-[#c49c6c]">Documents</TabsTrigger>
                  <TabsTrigger value="location" className="text-white data-[state=active]:text-[#c49c6c]">Location</TabsTrigger>
                  <TabsTrigger value="inquiries" className="text-white data-[state=active]:text-[#c49c6c]">Inquiries</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-4 border border-white/10 rounded-lg mt-4 bg-black/30 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column - first row with property image */}
                    <div>
                      <div className="text-white/70 text-sm font-medium mb-1.5">Unpaid Principal Balance</div>
                      <div className="text-3xl font-bold text-white">{formatCurrency(listing.currentLoanAmount)}</div>
                      
                      {/* Property image/map moved here */}
                      <div className="mt-4 aspect-video bg-black/40 rounded-lg flex items-center justify-center border border-white/10">
                        <MapPin className="w-12 h-12 text-white/50 opacity-50" />
                        <p className="ml-2 text-white/70">
                          Property view available
                        </p>
                      </div>
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
                      {documents.map((doc: any) => (
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
                    isSeller={seller?.id === user?.id} 
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
        </div>
      </div>

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