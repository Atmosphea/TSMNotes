import { Book, Users, Search, MessageCircle, CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";

const InvestmentStepsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const steps = [
    {
      number: 1,
      title: "Learn",
      description: "Read up on key strategy from our resource library.",
      icon: <Book className="h-5 w-5" />
    },
    {
      number: 2,
      title: "Join Our Marketplace",
      description: "Sign up, complete verification, and connect with a secure network of vetted buyers and sellers.",
      icon: <Users className="h-5 w-5" />
    },
    {
      number: 3,
      title: "Browse & Analyze Notes",
      description: "Filter for notes with detailed loan data and borrower insights.",
      icon: <Search className="h-5 w-5" />
    },
    {
      number: 4,
      title: "Connect & Negotiate",
      description: "Communicate securely with sellers, verify details, and negotiate terms.",
      icon: <MessageCircle className="h-5 w-5" />
    },
    {
      number: 5,
      title: "Complete Your Investment",
      description: "Finalize transactions through partnered escrow services.",
      icon: <CheckCircle className="h-5 w-5" />
    }
  ];

  // Add mouse movement effect for hover glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const hoverElements = document.querySelectorAll('.hover-glow');
      
      hoverElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        (element as HTMLElement).style.setProperty('--x', `${x}%`);
        (element as HTMLElement).style.setProperty('--y', `${y}%`);
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="py-12 gradient-bg-light relative" style={{ height: '20vh', minHeight: '200px' }} ref={sectionRef}>
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="w-full relative z-10">
          <div className="flex flex-wrap justify-between items-center">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="text-center mx-2 opacity-0 hover-glow flex-1"
                style={{
                  animationName: 'fadeIn',
                  animationDuration: '0.5s',
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                    {step.number}
                  </div>
                  <h3 className="category-title mb-1 text-base md:text-lg">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 text-xs md:text-sm">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-primary/30"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sleek outline border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </section>
  );
};

export default InvestmentStepsSection;