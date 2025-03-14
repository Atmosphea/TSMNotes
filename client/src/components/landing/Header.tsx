import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DollarSign, Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-gray-200 ${scrolled ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'} transition-all duration-200`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-md bg-primary p-1">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="hidden font-serif text-xl font-bold sm:inline-block">NoteTrade</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={() => scrollToSection("features")} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection("pricing")} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Pricing
          </button>
          <button onClick={() => scrollToSection("testimonials")} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Testimonials
          </button>
          <button onClick={() => scrollToSection("faq")} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            FAQ
          </button>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="hidden sm:flex">
            Learn More
          </Button>
          <Button onClick={() => scrollToSection("cta")}>
            Join Waitlist
          </Button>
          <button 
            className="md:hidden" 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 border-t">
          <button 
            onClick={() => scrollToSection("features")} 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection("how-it-works")} 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection("pricing")} 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Pricing
          </button>
          <button 
            onClick={() => scrollToSection("testimonials")} 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Testimonials
          </button>
          <button 
            onClick={() => scrollToSection("faq")} 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            FAQ
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
