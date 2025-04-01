import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InquiryList } from "@/components/inquiries";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Clock, CheckCircle, XCircle, ArrowLeftRight } from "lucide-react";
import { type Inquiry } from "@shared/models/inquiry.model";

export default function MyInquiriesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all inquiries for the buyer
  const { data: inquiriesData } = useQuery<{ success: boolean; data: Inquiry[] }>({
    queryKey: [`/api/inquiries/buyer/${user?.id}`],
    enabled: !!user?.id,
  });

  const inquiries = inquiriesData?.data || [];
  
  // Updated statistics to include countered offers
  const stats = {
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter(i => i.status === "pending").length,
    acceptedInquiries: inquiries.filter(i => i.status === "accepted").length,
    rejectedInquiries: inquiries.filter(i => i.status === "rejected").length,
    counteredInquiries: inquiries.filter(i => i.status === "countered").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Inquiries</h1>

      {/* Updated Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="Total Inquiries"
          value={stats.totalInquiries}
          icon={MessageCircle}
        />
        <StatsCard
          title="Awaiting Response"
          value={stats.pendingInquiries}
          icon={Clock}
        />
        <StatsCard
          title="Countered"
          value={stats.counteredInquiries}
          icon={ArrowLeftRight}
        />
        <StatsCard
          title="Accepted"
          value={stats.acceptedInquiries}
          icon={CheckCircle}
        />
        <StatsCard
          title="Declined"
          value={stats.rejectedInquiries}
          icon={XCircle}
        />
      </div>

      {/* Updated Tabs */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>My Inquiries & Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="countered">Countered</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <InquiryList
                sellerId={user?.id}
                isSeller={false}
                maxHeight="600px"
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <InquiryList
                sellerId={user?.id}
                isSeller={false}
                maxHeight="600px"
                onlyShowActive={true}
              />
            </TabsContent>

            <TabsContent value="countered" className="mt-4">
              <InquiryList
                sellerId={user?.id}
                isSeller={false}
                maxHeight="600px"
                showCountered={true}
              />
            </TabsContent>

            <TabsContent value="accepted" className="mt-4">
              <InquiryList
                sellerId={user?.id}
                isSeller={false}
                maxHeight="600px"
                showAccepted={true}
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              <InquiryList
                sellerId={user?.id}
                isSeller={false}
                maxHeight="600px"
                showRejected={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Stats card component (reused from seller's page)
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