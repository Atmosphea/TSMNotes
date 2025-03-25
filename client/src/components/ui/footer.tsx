import React, { useState } from 'react';
import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const [isPartnersHovered, setIsPartnersHovered] = useState(false);
  
  return (
    <footer className="relative w-full bg-black text-gray-200 parallax-footer">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(circle at 50% 0%, #ff758c 0%, transparent 70%)",
          }}
        />
      </div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gradient">Get in Touch</h2>
            <p className="opacity-80 max-w-xs">
              Reach out to us about note trading opportunities, partnerships and investment strategies.
            </p>
            <address className="not-italic opacity-80">
              8480 E Orchard Rd<br />
              Suite 3000<br />
              Greenwood Village, CO 80111
            </address>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold">Pages</h2>
            <nav className="flex flex-col space-y-3">
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
            </nav>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold">Resources</h2>
            <nav className="flex flex-col space-y-3">
              <div 
                className="relative"
                onMouseEnter={() => setIsPartnersHovered(true)}
                onMouseLeave={() => setIsPartnersHovered(false)}
              >
                <span className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                  Partners
                </span>
                
                {isPartnersHovered && (
                  <div className="absolute top-0 left-full ml-4 bg-gray-900/90 backdrop-blur-sm p-3 rounded-md shadow-xl min-w-[200px] z-20">
                    <a 
                      href="https://tristatemortgage.net/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
                    >
                      <span>TriStateMortgage.net</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </nav>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold">Legal</h2>
            <nav className="flex flex-col space-y-3">
              <Link href="/terms" className="opacity-80 hover:opacity-100 transition-opacity">
                Terms of Service
              </Link>
              <Link href="/privacy" className="opacity-80 hover:opacity-100 transition-opacity">
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-60">© 2025 NoteTrade. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <p className="text-sm opacity-60">Secure mortgage note trading platform</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;