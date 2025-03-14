import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingTierProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  callToAction: string;
  onClick: () => void;
}

const PricingTier = ({
  title,
  price,
  description,
  features,
  popular = false,
  callToAction,
  onClick
}: PricingTierProps) => {
  return (
    <Card className={`border ${popular ? 'border-2 border-blue-500 relative' : 'border-gray-200'}`}>
      {popular && (
        <div className="absolute top-0 right-0 left-0 px-4 py-1 bg-blue-500 text-white text-center text-xs font-bold uppercase tracking-wide">
          Most Popular
        </div>
      )}
      <div className={`p-6 ${popular ? 'pt-10' : ''}`}>
        <h3 className="font-serif text-xl font-bold">{title}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold">{price}</span>
          <span className="ml-1 text-gray-600">/month</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        
        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          variant={popular ? "default" : "outline"} 
          className="mt-8 w-full"
          onClick={onClick}
        >
          {callToAction}
        </Button>
      </div>
    </Card>
  );
};

const PricingSection = () => {
  const handlePricingClick = () => {
    const element = document.getElementById("cta");
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Transparent Pricing Plans
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            No hidden fees. Choose the plan that best fits your note trading volume.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier
            title="Starter Plan"
            price="$99"
            description="Perfect for occasional note traders"
            features={[
              "Up to 5 active listings",
              "Basic due diligence tools",
              "Standard user verification",
              "Email support"
            ]}
            callToAction="Select Plan"
            onClick={handlePricingClick}
          />
          
          <PricingTier
            title="Professional Plan"
            price="$249"
            description="Ideal for active note traders and brokers"
            features={[
              "Up to 25 active listings",
              "Advanced due diligence tools",
              "Enhanced user verification",
              "Priority email & phone support",
              "Market analytics dashboard"
            ]}
            popular={true}
            callToAction="Select Plan"
            onClick={handlePricingClick}
          />
          
          <PricingTier
            title="Enterprise Plan"
            price="$599"
            description="For institutional investors and large volume traders"
            features={[
              "Unlimited active listings",
              "Premium due diligence suite",
              "Advanced user verification & badging",
              "Dedicated account manager",
              "Advanced analytics & reporting",
              "API access for integration"
            ]}
            callToAction="Contact Sales"
            onClick={handlePricingClick}
          />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
