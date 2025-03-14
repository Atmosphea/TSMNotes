import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Shield } from "lucide-react";
import WaitlistForm from "@/components/waitlist/WaitlistForm";

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 opacity-70"></div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 max-w-2xl">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
              The Secure Marketplace for Mortgage Note Trading
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              Connect with qualified buyers and sellers in the mortgage note industry. 
              Our professional platform streamlines the note trading process while maintaining 
              security and compliance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              {/* Waitlist signup form */}
              <Card className="p-6 bg-white w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">Join our exclusive waitlist</h3>
                <WaitlistForm />
              </Card>
            </div>
            <div className="mt-6 flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Bank-level security and compliance</span>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <Card className="overflow-hidden border-2 border-gray-100 bg-white">
              <div className="p-5 bg-blue-50 border-b border-gray-200">
                <h3 className="font-medium text-blue-700">Featured Note Listing Preview</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif text-xl font-bold">Residential 1st Position</h4>
                      <Badge variant="success" className="px-2 py-1 text-xs font-medium rounded-full">
                        Performing
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Central Florida, FL</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">UPB</p>
                      <p className="font-medium">{formatCurrency(127500)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Note Rate</p>
                      <p className="font-medium">6.25%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Remaining Term</p>
                      <p className="font-medium">288 months</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Payment History</p>
                      <p className="font-medium text-green-600">12+ months current</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Asking Price</p>
                        <p className="text-xl font-bold text-blue-700">{formatCurrency(115000)}</p>
                      </div>
                      <Button>
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
