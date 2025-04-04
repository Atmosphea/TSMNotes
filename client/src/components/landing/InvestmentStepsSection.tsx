import { useState, useEffect, useRef, MouseEvent } from "react";
import {
  Book,
  Users,
  ShoppingBag,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

const Step = ({ title, description, icon, index }: StepProps) => {
  return (
    <div
      className="process-step-card hover-glow"
      style={{ "--step-index": index } as React.CSSProperties}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty("--x", `${x}px`);
        el.style.setProperty("--y", `${y}px`);
      }}
    >
      <div className="flex-shrink-0 mr-4 p-2 rounded-full bg-primary/20 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-1">{title}</h3>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
  );
};

const InvestmentStepsSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener(
        "mousemove",
        handleMouseMove as unknown as EventListener,
      );
    }

    return () => {
      if (section) {
        section.removeEventListener(
          "mousemove",
          handleMouseMove as unknown as EventListener,
        );
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-12 overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(var(--primary-rgb), 0.15) 0%, transparent 60%), linear-gradient(135deg, #121212 0%, #1a1a1a 100%)`,
      }}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Step
            title="Learn"
            description="Explore our comprehensive educational resources to understand note investing fundamentals."
            icon={<Book className="h-5 w-5" />}
            index={0}
          />
          <Step
            title="Join"
            description="Create your account and verify your investor profile to gain marketplace access."
            icon={<Users className="h-5 w-5" />}
            index={1}
          />
          <Step
            title="Browse"
            description="Search our curated marketplace for vetted note opportunities that match your criteria."
            icon={<ShoppingBag className="h-5 w-5" />}
            index={2}
          />
          <Step
            title="Connect"
            description="Communicate directly with sellers and perform your due diligence with our support."
            icon={<MessageCircle className="h-5 w-5" />}
            index={3}
          />
          <Step
            title="Complete"
            description="Close the transaction securely through our platform with all documentation handled."
            icon={<CheckCircle className="h-5 w-5" />}
            index={4}
          />
        </div>
      </div>
    </section>
  );
};

export default InvestmentStepsSection;
