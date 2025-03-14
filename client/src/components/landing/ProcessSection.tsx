import { Search, ShieldCheck, BarChart3, HeartHandshake } from "lucide-react";

const ProcessSection = () => {
  const processes = [
    {
      title: "Sourcing & Evaluation",
      description: "We acquire unseasoned notes from banks and lenders, ensuring high-potential investments. Every note undergoes rigorous borrower analysis, property assessment, and loan term review to minimize risk.",
      icon: <Search className="h-6 w-6" />,
      id: "sourcing"
    },
    {
      title: "Risk & Structuring",
      description: "We classify notes by risk, determine fair pricing, and implement loss mitigation strategies to protect investors.",
      icon: <ShieldCheck className="h-6 w-6" />,
      id: "risk"
    },
    {
      title: "Marketplace & Transactions",
      description: "We list vetted notes with full transparency, matching investors with opportunities suited to their goals. Transactions are secured through escrow services and expert loan servicers.",
      icon: <BarChart3 className="h-6 w-6" />,
      id: "marketplace"
    },
    {
      title: "Post-Sale Support",
      description: "We offer ongoing monitoring, servicing recommendations, and exit strategy guidance to maximize returns.",
      icon: <HeartHandshake className="h-6 w-6" />,
      id: "support"
    }
  ];

  return (
    <section id="process" className="py-20 gradient-bg-darker">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mb-12">
          <h2 className="section-title text-4xl mb-4">Our <span className="text-gradient">Process</span></h2>
          <p className="section-description text-gray-300">
            Our comprehensive approach ensures that every note on our platform undergoes rigorous evaluation and structuring to provide secure, transparent investment opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processes.map((process, index) => (
            <div 
              key={process.id} 
              className="process-card group hover-glow"
              style={{ '--card-index': index } as React.CSSProperties}
            >
              <div className="feature-icon-container p-3 mb-6 group-hover:bg-primary/20 transition-all">
                {process.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3 category-title">
                {process.title}
              </h3>
              <p className="text-gray-300 text-sm">
                {process.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-6 glass-card">
          <h3 className="font-bold text-2xl mb-6 text-center text-gray-100">Why Choose Us?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-4">
            <div className="flex items-start px-4">
              <div className="text-primary mr-3 text-2xl">✔</div>
              <p className="text-gray-200">Thorough due diligence</p>
            </div>
            <div className="flex items-start px-4">
              <div className="text-primary mr-3 text-2xl">✔</div>
              <p className="text-gray-200">Transparent data</p>
            </div>
            <div className="flex items-start px-4">
              <div className="text-primary mr-3 text-2xl">✔</div>
              <p className="text-gray-200">Diverse investment options</p>
            </div>
            <div className="flex items-start px-4">
              <div className="text-primary mr-3 text-2xl">✔</div>
              <p className="text-gray-200">End-to-end support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;