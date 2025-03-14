import { Card } from "@/components/ui/card";
import { 
  ClipboardCheck, 
  Lock, 
  CreditCard, 
  Users, 
  FileText, 
  Calendar,
  ChevronRight
} from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const Feature = ({ icon, title, description, index }: FeatureProps) => {
  return (
    <div className={`flex items-start ml-${index * 6} max-w-lg`}>
      <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-base font-bold text-foreground flex items-center">
          <ChevronRight className="h-4 w-4 mr-1 text-primary" />
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <div className="accent-border">
            <h2 className="section-title">
              Professional Features for Note Industry Experts
            </h2>
            <p className="section-description">
              Our platform is designed specifically for the unique needs of mortgage note buyers and sellers
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10">
          <div className="space-y-8">
            <Feature 
              icon={<ClipboardCheck className="h-5 w-5 text-primary" />}
              title="Comprehensive Listings"
              description="Create detailed note listings with all essential metrics and documentation for proper due diligence."
              index={0}
            />
            
            <Feature 
              icon={<Lock className="h-5 w-5 text-primary" />}
              title="Secure Communication"
              description="End-to-end encrypted messaging system for safe communication between buyers and sellers."
              index={1}
            />
            
            <Feature 
              icon={<CreditCard className="h-5 w-5 text-primary" />}
              title="Advanced Filtering"
              description="Find exactly what you're looking for with filters for note type, performance status, geography, and more."
              index={2}
            />
          </div>
          
          <div className="space-y-8">
            <Feature 
              icon={<Users className="h-5 w-5 text-primary" />}
              title="Verified Users"
              description="All platform participants are verified to ensure you're dealing with legitimate industry professionals."
              index={0}
            />
            
            <Feature 
              icon={<FileText className="h-5 w-5 text-primary" />}
              title="Due Diligence Tools"
              description="Built-in calculators and analysis tools to help evaluate potential investments with confidence."
              index={1}
            />
            
            <Feature 
              icon={<Calendar className="h-5 w-5 text-primary" />}
              title="Market Activity Tracking"
              description="Stay informed with real-time updates on market activity, pricing trends, and new listings."
              index={2}
            />
          </div>
        </div>
        
        <div className="mt-16 border-t border-gray-200 pt-8">
          <Card className="p-6 bg-white border-l-4 border-primary max-w-3xl mx-auto">
            <p className="text-base italic text-gray-600">
              "Our platform provides the essential tools needed to confidently trade mortgage notes in today's market. With comprehensive listings, secure communications, and robust verification systems, we've created a professional environment where serious buyers and sellers can connect and transact with confidence."
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
