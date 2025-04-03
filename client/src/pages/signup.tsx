import React from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { register, login } = useKindeAuth();

  // Handler for Kinde registration
  const handleSignUp = () => {
    register(); // Standard Kinde registration
  };
  
  // Handler for Google signup
  const handleGoogleSignup = () => {
    login({ 
      connectionId: "google",
      prompt: "signup"
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center p-5">
        <div className="absolute inset-5 border border-white/20"></div>

        <div className="w-full max-w-md bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4">
              <svg viewBox="0 0 100 100" className="text-white">
                <path d="M50 0 L100 100 L0 100 Z" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-white">
              CREATE ACCOUNT
            </h1>
          </div>

          <div className="space-y-6">
            {/* Primary Sign Up Button */}
            <Button
              type="button"
              onClick={handleSignUp}
              className="w-full h-12 bg-[#c49c6c] hover:bg-[#b38b5b] text-white font-semibold text-lg"
            >
              SIGN UP
            </Button>
            
            {/* Divider with text */}
            <div className="relative flex items-center">
              <Separator className="flex-grow bg-white/20" />
              <span className="mx-4 flex-shrink text-white/60 text-sm">OR</span>
              <Separator className="flex-grow bg-white/20" />
            </div>
            
            {/* Google Signup Button */}
            <Button
              type="button"
              onClick={handleGoogleSignup}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 border-white/30 text-white hover:bg-white/10"
            >
              <FcGoogle className="w-5 h-5" />
              <span>CONTINUE WITH GOOGLE</span>
            </Button>

            <div className="mt-6 text-center text-sm text-gray-300">
              Already have an account?{" "}
              <a href="/login" className="text-[#c49c6c] hover:underline">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
