import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DollarSign, Menu, X, ChevronRight } from "lucide-react";

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
    <header className={`sticky top-0 z-50 w-full ${scrolled ? 'bg-black/50 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'} transition-all duration-200`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-md bg-primary p-1.5">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold sm:inline-block">NoteTrade</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection("features")} 
            className="text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2"
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              el.style.setProperty("--x", `${x}px`);
              el.style.setProperty("--y", `${y}px`);
            }}
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection("how-it-works")} 
            className="text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2"
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              el.style.setProperty("--x", `${x}px`);
              el.style.setProperty("--y", `${y}px`);
            }}
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection("testimonials")} 
            className="text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2"
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              el.style.setProperty("--x", `${x}px`);
              el.style.setProperty("--y", `${y}px`);
            }}
          >
            Testimonials
          </button>
          <button 
            onClick={() => scrollToSection("faq")} 
            className="text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2"
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              el.style.setProperty("--x", `${x}px`);
              el.style.setProperty("--y", `${y}px`);
            }}
          >
            FAQ
          </button>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            className="hidden sm:flex" 
            asChild
          >
            <Link href="/marketplace">
              Marketplace
            </Link>
          </Button>
          <Button 
            onClick={() => scrollToSection("cta")}
            className="bg-primary hover:bg-primary/90"
          >
            Join Waitlist <ChevronRight className="ml-1 h-4 w-4" />
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
        <div className="px-4 pt-2 pb-3 space-y-1 bg-black/70 backdrop-blur-md border-t border-gray-800">
          <button 
            onClick={() => scrollToSection("features")} 
            className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection("how-it-works")} 
            className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection("testimonials")} 
            className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
          >
            Testimonials
          </button>
          <button 
            onClick={() => scrollToSection("faq")} 
            className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
          >
            FAQ
          </button>
          <Link href="/marketplace" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary">
            Marketplace
          </Link>
          <Button
            onClick={() => scrollToSection("cta")}
            className="w-full mt-2 bg-primary hover:bg-primary/90"
          >
            Join Waitlist <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
