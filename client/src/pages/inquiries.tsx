import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InquiryList } from "@/components/inquiries";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, MessageCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { type Inquiry } from "@shared/models/inquiry.model";

// Stats card component
const StatsCard = ({ title, value, icon: Icon, description }: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
}) => (
  <Card>
    <CardContent className="flex items-center p-6">
      <div className="bg-primary/10 p-3 rounded-full mr-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function InquiriesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all inquiries for the seller
  const { data: inquiriesData } = useQuery<{ success: boolean; data: Inquiry[] }>({
    queryKey: [`/api/inquiries/seller/${user?.id}`],
    enabled: !!user?.id,
  });

  const inquiries = inquiriesData?.data || [];
  
  // Calculate statistics
  const stats = {
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter(i => i.status === "pending").length,
    totalOffers: inquiries.filter(i => i.offerAmount).length,
    averageOffer: inquiries
      .filter(i => i.offerAmount)
      .reduce((acc, curr) => acc + curr.offerAmount!, 0) / 
      (inquiries.filter(i => i.offerAmount).length || 1),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Inquiries Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Inquiries"
          value={stats.totalInquiries}
          icon={MessageCircle}
        />
        <StatsCard
          title="Pending Responses"
          value={stats.pendingInquiries}
          icon={Clock}
        />
        <StatsCard
          title="Total Offers"
          value={stats.totalOffers}
          icon={CheckCircle}
        />
        <StatsCard
          title="Average Offer"
          value={formatCurrency(stats.averageOffer)}
          icon={DollarSign}
        />
      </div>

      {/* Inquiries List with Tabs */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="with_offers">With Offers</TabsTrigger>
              <TabsTrigger value="responded">Responded</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <InquiryList
                sellerId={user?.id}
                isSeller={true}
                maxHeight="600px"
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <InquiryList
                sellerId={user?.id}
                isSeller={true}
                maxHeight="600px"
                onlyShowActive={true}
              />
            </TabsContent>

            <TabsContent value="with_offers" className="mt-4">
              <InquiryList
                sellerId={user?.id}
                isSeller={true}
                maxHeight="600px"
                filterOffers={true}
              />
            </TabsContent>

            <TabsContent value="responded" className="mt-4">
              <InquiryList
                sellerId={user?.id}
                isSeller={true}
                maxHeight="600px"
                showResponded={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 