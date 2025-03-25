import React, { useState } from 'react';
import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const [isPartnersHovered, setIsPartnersHovered] = useState(false);
  
  return (
    <footer className="relative w-full bg-black text-amber-100/90 parallax-footer">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(circle at calc(50% - 500px) 0%, #ff758c 0%, transparent 70%)",
          }}
        />
      </div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-16">
          {/* Left column */}
          <div className="space-y-6 md:max-w-sm">
            <h2 className="text-4xl font-serif font-bold text-amber-100/90">Get in Touch</h2>
            <p className="opacity-80 text-base">
              Reach out to us about note trading opportunities, partnerships and investment strategies.
            </p>
            <address className="not-italic opacity-80 mt-4">
              8480 E Orchard Rd<br />
              Suite 3000<br />
              Greenwood Village, CO 80111
            </address>
          </div>
          
          {/* Right column - Navigation links in a row */}
          <div className="flex flex-wrap gap-8 md:gap-12 justify-start md:justify-end text-amber-100/90">
            <Link href="/marketplace" className="opacity-80 hover:opacity-100 transition-opacity">
              Marketplace
            </Link>
            <Link href="/selling" className="opacity-80 hover:opacity-100 transition-opacity">
              Create a Listing
            </Link>
            <Link href="/profile" className="opacity-80 hover:opacity-100 transition-opacity">
              Profile
            </Link>
            <Link href="/my-listings" className="opacity-80 hover:opacity-100 transition-opacity">
              My Listings
            </Link>
            <Link href="/faq" className="opacity-80 hover:opacity-100 transition-opacity">
              FAQ
            </Link>
            <div 
              className="relative opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              onMouseEnter={() => setIsPartnersHovered(true)}
              onMouseLeave={() => setIsPartnersHovered(false)}
            >
              Partners
              {isPartnersHovered && (
                <div className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur-sm p-3 rounded-md shadow-xl min-w-[200px] z-20">
                  <a 
                    href="https://tristatemortgage.net/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-amber-100/90 hover:text-amber-100 transition-colors"
                  >
                    <span>TriStateMortgage.net</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-24 pt-6 border-t border-amber-900/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs opacity-80">© 2025 NoteTrade. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center gap-1">
            <p className="text-xs opacity-60">Powered by</p>
            <p className="text-xs opacity-80">TET Events.</p>
          </div>
          <p className="text-xs opacity-80 mt-2 md:mt-0">2025</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;