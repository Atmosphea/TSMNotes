import { Button } from "@/components/ui/button";
import { 
  UserCircle2, 
  FileText, 
  MessageCircle, 
  HandshakeIcon,
  ArrowRight 
} from "lucide-react";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step = ({ number, title, description, icon }: StepProps) => {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 flex flex-col items-center mr-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-2">
          {number}
        </div>
        {number < 4 && <div className="w-0.5 h-full bg-gray-200 flex-grow my-1"></div>}
      </div>
      <div className="pb-8">
        <div className="flex items-center mb-1">
          <div className="mr-2 text-gray-700">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-landing">{title}</h3>
        </div>
        <p className="text-sm text-landing">{description}</p>
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-12 bg-gray-100">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-7 gap-8 items-center">
          <div className="md:col-span-3">
            <div className="accent-border">
              <h2 className="section-title text-landing">
                How NoteTrade Works
              </h2>
              <p className="section-description text-landing">
                Our streamlined process makes buying and selling mortgage notes simple, secure and efficient
              </p>
            </div>

            <div className="mt-8">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5" onClick={() => {
                const element = document.getElementById("cta");
                if (element) {
                  window.scrollTo({
                    top: element.offsetTop - 80,
                    behavior: "smooth",
                  });
                }
              }}>
                Join the Waitlist <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="bg-white px-6 py-8 rounded-xl border border-gray-200 shadow-sm">
              <div className="pl-2">
                <Step 
                  number={1}
                  title="Register & Create Your Profile"
                  description="Complete verification to establish your trusted presence on the platform."
                  icon={<UserCircle2 className="h-5 w-5 text-primary" />}
                />

                <Step 
                  number={2}
                  title="List Notes or Browse Inventory"
                  description="Create detailed listings with due diligence materials, or search for notes matching your criteria."
                  icon={<FileText className="h-5 w-5 text-primary" />}
                />

                <Step 
                  number={3}
                  title="Communicate Securely"
                  description="Use our encrypted messaging system to discuss details and negotiate terms."
                  icon={<MessageCircle className="h-5 w-5 text-primary" />}
                />

                <Step 
                  number={4}
                  title="Complete Transaction Offline"
                  description="Finalize paperwork and payment through traditional means with verified counterparties."
                  icon={<HandshakeIcon className="h-5 w-5 text-primary" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;