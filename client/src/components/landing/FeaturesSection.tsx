import { Card } from "@/components/ui/card";
import { 
  ClipboardCheck, 
  Lock, 
  CreditCard, 
  Users, 
  FileText, 
  Calendar 
} from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => {
  return (
    <Card className="p-6 transition-shadow duration-200 hover:shadow-lg">
      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-gray-600">
        {description}
      </p>
    </Card>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Professional Features for Note Industry Experts
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our platform is designed specifically for the unique needs of mortgage note buyers and sellers
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Feature 
            icon={<ClipboardCheck className="h-6 w-6 text-blue-600" />}
            title="Comprehensive Listings"
            description="Create detailed note listings with all essential metrics and documentation for proper due diligence."
          />
          
          <Feature 
            icon={<Lock className="h-6 w-6 text-blue-600" />}
            title="Secure Communication"
            description="End-to-end encrypted messaging system for safe communication between buyers and sellers."
          />
          
          <Feature 
            icon={<CreditCard className="h-6 w-6 text-blue-600" />}
            title="Advanced Filtering"
            description="Find exactly what you're looking for with filters for note type, performance status, geography, and more."
          />
          
          <Feature 
            icon={<Users className="h-6 w-6 text-blue-600" />}
            title="Verified Users"
            description="All platform participants are verified to ensure you're dealing with legitimate industry professionals."
          />
          
          <Feature 
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            title="Due Diligence Tools"
            description="Built-in calculators and analysis tools to help evaluate potential investments with confidence."
          />
          
          <Feature 
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            title="Market Activity Tracking"
            description="Stay informed with real-time updates on market activity, pricing trends, and new listings."
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
