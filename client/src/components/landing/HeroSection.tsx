import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Shield, ArrowRight, Key } from "lucide-react";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import KeyEntryDialog from "@/components/auth/KeyEntryDialog";

const HeroSection = () => {
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden parallax-bg"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/60"></div>
      <div className="container mx-auto px-6 lg:px-8 relative z-10 py-16">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          <div className="flex-1 max-w-2xl">
            <div className="border-l-4 border-primary pl-6 mb-8">
              <h2 className="text-white text-lg font-medium uppercase tracking-wider">
                Professional, Local, Secure
              </h2>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              The Secure Platform for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
                Mortgage Note Trading
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-xl">
              Connect with qualified buyers and sellers in the mortgage note
              industry.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Card className="p-5 bg-white/5 backdrop-blur-sm border-gray-800 w-full max-w-md">
                <h3 className="text-lg font-medium mb-3 text-white">
                  Join our exclusive waitlist
                </h3>
                <WaitlistForm variant="footer" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Bank-level security and compliance</span>
                  </div>
                  <Button
                    variant="link"
                    className="text-primary hover:text-primary/90 p-0 h-auto"
                    onClick={() => setIsKeyDialogOpen(true)}
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Have a key?
                  </Button>
                </div>
              </Card>
            </div>
            <div className="mt-12">
              <Button
                variant="outline"
                className="text-white border-gray-700 hover:bg-gray-800"
                onClick={() => {
                  const element = document.getElementById("features");
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 80,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <KeyEntryDialog
              open={isKeyDialogOpen}
              onOpenChange={setIsKeyDialogOpen}
            />
          </div>
          <div className="flex-1 w-full max-w-lg mt-8 lg:mt-0">
            <Card className="overflow-hidden border border-gray-800 bg-white/5 backdrop-blur-sm text-white">
              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="font-medium text-gray-300 ml-2">
                    Featured Note Listing
                  </h3>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-bold">
                        Residential 1st Position
                      </h4>
                      <Badge className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border-green-500/30">
                        Performing
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">Central Florida, FL</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">UPB</p>
                      <p className="font-medium text-white">
                        {formatCurrency(127500)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Note Rate</p>
                      <p className="font-medium text-white">6.25%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Remaining Term</p>
                      <p className="font-medium text-white">288 months</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Payment History</p>
                      <p className="font-medium text-green-300">
                        12+ months current
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Asking Price</p>
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(115000)}
                        </p>
                      </div>
                      <Button
                        variant="default"
                        className="bg-primary hover:bg-primary/90"
                      >
                        Request Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
