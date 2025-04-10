import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import InvestmentStepsSection from "@/components/landing/InvestmentStepsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";

import ProcessSection from "@/components/landing/ProcessSection";
import TerminologySection from "@/components/landing/TerminologySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-foreground">
      <Header />
      
      <main>
        <HeroSection />
        <InvestmentStepsSection />
        <FeaturesSection />
        <ProcessSection />
        
        <TerminologySection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
    </div>
  );
}
