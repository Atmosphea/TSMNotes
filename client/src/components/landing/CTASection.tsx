import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import WaitlistForm from "@/components/waitlist/WaitlistForm";

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
    if (waitlistCountData) {
      setPreregisteredCount(waitlistCountData.count + 500);
    }
  }, [waitlistCountData]);

  return (
    <section id="cta" className="py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Note Trading Experience?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the waitlist today and be among the first to access our professional mortgage note marketplace when we launch.
          </p>
          
          <div className="max-w-md mx-auto">
            <WaitlistForm variant="footer" />
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold">{preregisteredCount}+</div>
              <div className="text-blue-200">Pre-registered Users</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold">${portfolioValue}+</div>
              <div className="text-blue-200">Portfolio Value</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold">{launchDate}</div>
              <div className="text-blue-200">Launch Date</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
