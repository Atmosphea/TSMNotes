import { Briefcase, Map, ShieldCheck, Clock } from "lucide-react";

const ProcessSection = () => {
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

  return (
    <section id="process" className="py-20 gradient-bg-darker">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processes.map((process, index) => (
            <div
              key={process.id}
              className="process-card group hover-glow"
              style={{ "--card-index": index } as React.CSSProperties}
            >
              <div className="feature-icon-container p-3 mb-6 group-hover:bg-primary/20 transition-all">
                {process.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3 category-title">
                {process.title}
              </h3>
              <p className="text-gray-300 text-sm">{process.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-6 glass-card">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-4">
            <div className="flex items-start px-4">
              <div className="text-primary mr-3 text-2xl">✔</div>
              <p className="text-gray-200">
                Handcrafted Network of known players
              </p>
            </div>
            <div className="flex items-start px-4">
              <div className="text-primary mr-3 text-2xl">✔</div>
              <p className="text-gray-200">Simple interface</p>
            </div>
            <div className="flex items-start px-4">
              <div className="text-primary mr-3 text-2xl">✔</div>
              <p className="text-gray-200">Open Bounty System</p>
            </div>
            <div className="flex items-start px-4">
              <div className="text-primary mr-3 text-2xl">✔</div>
              <p className="text-gray-200">Custom Contract Creation</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
