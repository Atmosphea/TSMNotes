
import { useEffect, useRef, useState } from "react";
import { Briefcase, Map, ShieldCheck, Clock } from "lucide-react";

const ProcessSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const processes = [
    {
      title: "Professional",
      description:
        "Our platform is designed for serious investors and sellers who value efficiency, security, and professionalism.",
      icon: <Briefcase className="h-6 w-6 text-primary" />,
      id: "professional",
    },
    {
      title: "Local",
      description:
        "We emphasize local relationships and connections, ensuring you work with professionals you can trust.",
      icon: <Map className="h-6 w-6 text-primary" />,
      id: "local",
    },
    {
      title: "Secure",
      description:
        "State-of-the-art security measures protect your sensitive information and transaction details.",
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      id: "secure",
    },
    {
      title: "On Your Terms",
      description:
        "Our flexible platform allows you to negotiate and close deals on your own timeline and preferences.",
      icon: <Clock className="h-6 w-6 text-primary" />,
      id: "terms",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const interval = setInterval(() => {
              setActiveIndex((prev) => (prev + 1) % processes.length);
            }, 3000);
            return () => clearInterval(interval);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="process" 
      className="py-20 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(
            45deg,
            rgba(var(--primary-rgb), 0.1),
            rgba(var(--primary-rgb), 0.2),
            rgba(var(--primary-rgb), 0.1)
          )
        `
      }}
    >
      <div 
        className="absolute inset-0 animate-gradient-x"
        style={{
          background: `
            linear-gradient(
              45deg,
              rgba(var(--primary-rgb), 0.05) 0%,
              rgba(var(--primary-rgb), 0.1) 50%,
              rgba(var(--primary-rgb), 0.05) 100%
            )
          `,
          backgroundSize: "200% 200%",
        }}
      />
      
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
              Core Values
            </span>
          </h2>
          <p className="text-gray-300">
            What makes our platform different from the rest
          </p>
        </div>

        <div className="relative h-[300px] max-w-lg mx-auto">
          {processes.map((process, index) => (
            <div
              key={process.id}
              className={`absolute inset-0 process-card transition-all duration-500 ${
                index === activeIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="glass-card p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="feature-icon-container p-3 mb-6">
                  {process.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3">
                  {process.title}
                </h3>
                <p className="text-gray-300 text-sm">{process.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
