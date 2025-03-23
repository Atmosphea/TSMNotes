import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Check, Clock, CircleX, MessagesSquare, Inbox, MessageCircle, ArrowRightLeft, Ban, AlertCircle } from "lucide-react";
import InquiryResponseDialog from "./InquiryResponseDialog";

interface Inquiry {
  id: number;
  buyerId: number;
  noteListingId: number;
  message: string;
  offerAmount: number | null;
  status: string;
  responseMessage: string | null;
  respondedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BuyerInfo {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  profileImageUrl?: string;
}

interface InquiryListProps {
  listingId?: number;
  sellerId?: number;
  isSeller?: boolean;
  className?: string;
  maxHeight?: string;
  onlyShowActive?: boolean;
}

export default function InquiryList({
  listingId, 
  sellerId,
  isSeller = false, 
  className = "", 
  maxHeight = "400px",
  onlyShowActive = false
}: InquiryListProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // API endpoint determination based on props
  let endpoint = "";
  if (listingId) {
    endpoint = `/api/inquiries/listing/${listingId}`;
  } else if (sellerId && isSeller) {
    endpoint = `/api/inquiries/seller/${sellerId}`;
  } else if (sellerId && !isSeller) {
    endpoint = `/api/inquiries/buyer/${sellerId}`;
  }

  // Fetch inquiries
  const { data: inquiriesData, isLoading } = useQuery<{ success: boolean; data: Inquiry[] }>({
    queryKey: [endpoint],
    enabled: !!endpoint,
  });

  const inquiries = inquiriesData?.data || [];
  
  // Status badge styling and icons
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      pending: { 
        color: "bg-amber-100 text-amber-700 hover:bg-amber-100", 
        icon: <Clock className="h-3 w-3 mr-1" />,
        label: "Pending"
      },
      accepted: { 
        color: "bg-green-100 text-green-700 hover:bg-green-100", 
        icon: <Check className="h-3 w-3 mr-1" />,
        label: "Accepted"
      },
      rejected: { 
        color: "bg-red-100 text-red-700 hover:bg-red-100", 
        icon: <CircleX className="h-3 w-3 mr-1" />,
        label: "Rejected"
      },
      countered: { 
        color: "bg-blue-100 text-blue-700 hover:bg-blue-100", 
        icon: <ArrowRightLeft className="h-3 w-3 mr-1" />,
        label: "Countered"
      },
      withdrawn: { 
        color: "bg-gray-100 text-gray-700 hover:bg-gray-100", 
        icon: <Ban className="h-3 w-3 mr-1" />,
        label: "Withdrawn"
      },
      expired: { 
        color: "bg-purple-100 text-purple-700 hover:bg-purple-100", 
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        label: "Expired"
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge className={config.color} variant="outline">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // Filter inquiries by status for tabs
  const getFilteredInquiries = (tab: string) => {
    if (tab === "all") return inquiries;
    if (tab === "active") return inquiries.filter(inq => ["pending", "countered"].includes(inq.status));
    if (tab === "resolved") return inquiries.filter(inq => ["accepted", "rejected"].includes(inq.status));
    if (tab === "other") return inquiries.filter(inq => ["withdrawn", "expired"].includes(inq.status));
    return inquiries;
  };

  const displayInquiries = onlyShowActive ? 
    inquiries.filter(inq => ["pending", "countered"].includes(inq.status)) : 
    getFilteredInquiries(activeTab);

  // Handle opening response dialog
  const handleRespondClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsResponseDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-6 ${className}`}>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!inquiries.length) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Inbox className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-center">
            {isSeller 
              ? "No inquiries received yet." 
              : "You haven't made any inquiries yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {!onlyShowActive && (
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <ScrollArea className={`w-full rounded-md border${maxHeight ? ` max-h-[${maxHeight}]` : ''}`}>
        <div className="space-y-4 p-4">
          {displayInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-base flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                    Inquiry #{inquiry.id}
                  </CardTitle>
                  <CardDescription>
                    {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
                  </CardDescription>
                </div>
                {getStatusBadge(inquiry.status)}
              </CardHeader>
              
              <CardContent className="py-2 px-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">Message:</p>
                  <p className="text-muted-foreground">{inquiry.message}</p>
                  
                  {inquiry.offerAmount && (
                    <div className="mt-3">
                      <p className="font-medium">Offer Amount:</p>
                      <p className="text-lg font-semibold text-primary">
                        {formatCurrency(inquiry.offerAmount)}
                      </p>
                    </div>
                  )}
                  
                  {inquiry.responseMessage && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="font-medium">Response:</p>
                      <p className="text-muted-foreground">{inquiry.responseMessage}</p>
                      {inquiry.respondedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Responded {formatDistanceToNow(new Date(inquiry.respondedAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              
              {isSeller && inquiry.status === "pending" && (
                <CardFooter className="py-3 px-4 bg-gray-50 flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRespondClick(inquiry)}
                  >
                    <MessagesSquare className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>

      {selectedInquiry && (
        <InquiryResponseDialog
          inquiry={selectedInquiry}
          isOpen={isResponseDialogOpen}
          onClose={() => setIsResponseDialogOpen(false)}
        />
      )}
    </div>
  );
}