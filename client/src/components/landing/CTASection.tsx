import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { Clock, Users, TrendingUp } from "lucide-react";

const CTASection = () => {
  const [preregisteredCount, setPreregisteredCount] = useState(500);
  const [portfolioValue, setPortfolioValue] = useState("1.2B");
  const [launchDate, setLaunchDate] = useState("Q3 2023");

  const { data: waitlistCountData } = useQuery({
    queryKey: ["/api/waitlist/count"],
    enabled: false, // In a real app, we'd enable this
  });

  useEffect(() => {
    // If this was a real app with real data, we'd use the actual count
    // For now, we'll use the mocked values
    if (waitlistCountData && typeof waitlistCountData === 'object' && 'count' in waitlistCountData) {
      setPreregisteredCount((waitlistCountData as {count: number}).count + 500);
    }
  }, [waitlistCountData]);

  return (
    <section id="cta" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Abstract design elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -right-5 -top-5 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-primary/50 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="border-l-4 border-primary pl-6 mb-6">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Note Trading Experience?
              </h2>
              <p className="text-gray-300">
                Join the waitlist today and be among the first to access our professional mortgage note marketplace when we launch.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 text-primary mb-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Community</span>
                </div>
                <div className="text-2xl font-bold">{preregisteredCount}+</div>
                <div className="text-sm text-gray-400">Pre-registered Users</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 text-primary mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Value</span>
                </div>
                <div className="text-2xl font-bold">${portfolioValue}+</div>
                <div className="text-sm text-gray-400">Portfolio Value</div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 text-primary mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Timeline</span>
                </div>
                <div className="text-2xl font-bold">{launchDate}</div>
                <div className="text-sm text-gray-400">Launch Date</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-medium mb-4">Join our exclusive waitlist</h3>
            <WaitlistForm variant="footer" />
            <p className="mt-4 text-xs text-gray-400">By joining our waitlist, you'll be among the first to access our platform when we launch. We'll also keep you updated on our progress and any special early-access opportunities.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
