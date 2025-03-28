import { Card } from "@/components/ui/card";
import { 
  ClipboardCheck, 
  Clock,
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10">
          <div className="space-y-8">
            <Feature 
              icon={<ClipboardCheck className="h-5 w-5 text-primary" />}
              title="Custom Contracts"
              description="Our platform helps you create tailored agreements that protect your interests and ensure smooth transactions with clarity and confidence."
              index={0}
            />
            
            <Feature 
              icon={<Clock className="h-5 w-5 text-primary" />}
              title="On Your Time"
              description="Our flexible platform lets you manage your note investments at your own pace, without pressure or time constraints."
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
        
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
