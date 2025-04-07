import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, ChevronRight, Key } from "lucide-react";
import { useLocation } from "wouter";

const HeroSection = () => {
  const [inviteKey, setInviteKey] = useState("");
  const [isAnimated, setIsAnimated] = useState(false);
  const [, navigate] = useLocation();

  // Animation effect that triggers after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteKey.trim()) {
      navigate(`/signup?key=${encodeURIComponent(inviteKey)}`);
    }
  };

  return (
    <section className="h-screen w-full relative flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full"
          style={{ filter: "brightness(0.4)" }}
        >
          <source 
            src="https://res.cloudinary.com/dk99kxfob/video/upload/v1744000608/mortgage-vid-bg_mlkn0g.mp4" 
            type="video/mp4" 
          />
          {/* Fallback background in case video doesn't load */}
          <div className="absolute inset-0 bg-black"></div>
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70"></div>
      </div>

      {/* Full screen border frame */}
      <div 
        className={`absolute inset-0 border border-white/10 m-6 md:m-10 lg:m-16 transition-all duration-1000 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}
        style={{ backdropFilter: "blur(2px)" }}
      ></div>

      {/* Content centered on page */}
      <div className="relative z-10 text-center px-6 max-w-4xl transition-all duration-1000 transform">
        {/* Logo */}
        <div className={`mb-8 transform transition-all duration-1000 ${isAnimated ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <div className="inline-flex items-center justify-center">
            <div className="rounded-md bg-primary p-3 md:p-4">
              <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Main heading with animation */}
        <h1 
          className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 transform transition-all duration-1000 delay-200 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
            NoteTrade
          </span>
        </h1>
        
        {/* Tagline */}
        <p 
          className={`text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-12 transform transition-all duration-1000 delay-300 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          Exclusive platform for mortgage note professionals
        </p>

        {/* Invite key input */}
        <form 
          onSubmit={handleKeySubmit}
          className={`max-w-md mx-auto transform transition-all duration-1000 delay-400 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-black/30 backdrop-blur-md p-5 border border-white/10 rounded-lg">
            <div className="flex flex-col space-y-4">
              <label className="text-white text-sm font-medium flex items-center justify-center mb-1">
                <Key className="h-4 w-4 mr-2 text-primary" />
                Enter your invite key
              </label>
              <div className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="Invite key"
                  value={inviteKey}
                  onChange={(e) => setInviteKey(e.target.value)}
                  className="bg-black/40 border-white/10 text-white placeholder:text-gray-500"
                />
                <Button 
                  type="submit"
                  className="nav-button-primary relative overflow-hidden"
                  disabled={!inviteKey.trim()}
                >
                  <span className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 transition-opacity"></span>
                  <span className="flex items-center relative z-10">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
