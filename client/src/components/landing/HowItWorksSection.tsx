import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            How NoteTrade Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our streamlined process makes buying and selling mortgage notes simple, secure and efficient
          </p>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-100"></div>
          
          {/* Steps */}
          <div className="space-y-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0 md:text-right">
                <h3 className="text-xl font-bold mb-2">1. Register & Create Your Profile</h3>
                <p className="text-gray-600">Complete verification to establish your trusted presence on the platform.</p>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold z-10">
                1
              </div>
              <div className="md:w-1/2 md:pl-8 mt-8 md:mt-0">
                <Card className="p-4 bg-white">
                  <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0 md:text-right order-1 md:order-1">
                <Card className="p-4 bg-white">
                  <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                </Card>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold z-10 order-2">
                2
              </div>
              <div className="md:w-1/2 md:pl-8 mt-8 md:mt-0 order-3">
                <h3 className="text-xl font-bold mb-2">2. List Notes or Browse Inventory</h3>
                <p className="text-gray-600">Create detailed listings with comprehensive due diligence materials, or search for notes matching your investment criteria.</p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0 md:text-right">
                <h3 className="text-xl font-bold mb-2">3. Communicate Securely</h3>
                <p className="text-gray-600">Use our encrypted messaging system to discuss details, negotiate terms, and coordinate next steps.</p>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold z-10">
                3
              </div>
              <div className="md:w-1/2 md:pl-8 mt-8 md:mt-0">
                <Card className="p-4 bg-white">
                  <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      ></path>
                    </svg>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0 md:text-right order-1 md:order-1">
                <Card className="p-4 bg-white">
                  <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      ></path>
                    </svg>
                  </div>
                </Card>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold z-10 order-2">
                4
              </div>
              <div className="md:w-1/2 md:pl-8 mt-8 md:mt-0 order-3">
                <h3 className="text-xl font-bold mb-2">4. Complete Transaction Offline</h3>
                <p className="text-gray-600">Finalize paperwork and payment through traditional means with the confidence of working with a verified counterparty.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Button size="lg" className="h-12 py-3 px-6" onClick={() => {
            const element = document.getElementById("cta");
            if (element) {
              window.scrollTo({
                top: element.offsetTop - 80,
                behavior: "smooth",
              });
            }
          }}>
            Join the Waitlist Now
          </Button>
          <p className="mt-4 text-sm text-gray-500">Limited spots available for our initial launch</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
