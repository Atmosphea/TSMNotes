import React, { useState } from 'react';
import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';

export function Footer2() {
  const [isPartnersHovered, setIsPartnersHovered] = useState(false);
  
  return (
    <div className="footer2">
      {/* Fixed gradient background */}
      <div className="absolute inset-0 w-full h-full bg-black/95">
        {/* Purple-pink gradient glow in the upper left */}
        <div 
          className="absolute inset-0 w-full h-full opacity-60"
          style={{
            background: "radial-gradient(circle at calc(25%) 25%, hsl(var(--primary)) 0%, transparent 70%)",
          }}
        />
        
        {/* Secondary subtle gradient in bottom right */}
        <div 
          className="absolute inset-0 w-full h-full opacity-40"
          style={{
            background: "radial-gradient(circle at calc(80%) 85%, hsl(var(--primary)/0.5) 0%, transparent 70%)",
          }}
        />
      </div>
      
      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 w-full p-6 z-10 pointer-events-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end">
            {/* Left side */}
            <div className="space-y-4 mb-12 md:mb-0">
              <h2 className="text-4xl font-serif font-bold text-white">Get in Touch</h2>
              <p className="text-gray-300 max-w-xs">
                Reach out to us about note trading opportunities, partnerships and investment strategies.
              </p>
              <address className="not-italic text-gray-300">
                8480 E Orchard Rd<br />
                Suite 3000<br />
                Greenwood Village, CO 80111
              </address>
            </div>
            
            {/* Right side */}
            <div className="flex flex-wrap gap-8 text-gray-300 justify-start md:justify-end">
              <Link href="/marketplace" className="transition-all duration-300 hover:text-white">
                <span className="relative group">
                  Marketplace
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
              <Link href="/selling" className="transition-all duration-300 hover:text-white">
                <span className="relative group">
                  Create a Listing
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
              <Link href="/profile" className="transition-all duration-300 hover:text-white">
                <span className="relative group">
                  Profile
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
              <Link href="/my-listings" className="transition-all duration-300 hover:text-white">
                <span className="relative group">
                  My Listings
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
              <Link href="/faq" className="transition-all duration-300 hover:text-white">
                <span className="relative group">
                  FAQ
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
              <div 
                className="relative transition-all duration-300 hover:text-white cursor-pointer"
                onMouseEnter={() => setIsPartnersHovered(true)}
                onMouseLeave={() => setIsPartnersHovered(false)}
              >
                <span className="relative group">
                  Partners
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </span>
                {isPartnersHovered && (
                  <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm p-3 rounded-md shadow-xl min-w-[200px] z-20">
                    <a 
                      href="https://tristatemortgage.net/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <span>TriStateMortgage.net</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-4 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-400">© 2025 NoteTrade. All rights reserved.</p>
            <div className="mt-2 md:mt-0 flex items-center gap-1">
              <p className="text-xs text-gray-500">Powered by</p>
              <p className="text-xs text-gray-400">TET Events.</p>
            </div>
            <p className="text-xs text-gray-400 mt-2 md:mt-0">2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer2;