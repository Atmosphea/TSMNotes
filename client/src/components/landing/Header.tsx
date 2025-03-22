import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Menu, 
  X, 
  ChevronRight, 
  ShoppingBag, 
  FileText, 
  HelpCircle, 
  ChevronDown 
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const isLandingPage = location === "/";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // When opening the menu, prevent scrolling
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
      // Reset overflow when component unmounts
      document.body.style.overflow = "";
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
      document.body.style.overflow = "";
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full ${scrolled ? 'bg-black/70 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'} transition-all duration-200`}>
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
          {isLandingPage ? (
            // Landing page navigation
            <>
              <div className="relative group">
                <button 
                  className="flex items-center text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2"
                  onMouseMove={(e) => {
                    const el = e.currentTarget;
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    el.style.setProperty("--x", `${x}px`);
                    el.style.setProperty("--y", `${y}px`);
                  }}
                >
                  Learn <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-black/90 border border-gray-800 hidden group-hover:block backdrop-blur-md">
                  <div className="py-1">
                    <button 
                      onClick={() => scrollToSection("features")} 
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Features
                    </button>
                    <button 
                      onClick={() => scrollToSection("how-it-works")} 
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      How It Works
                    </button>
                    <button 
                      onClick={() => scrollToSection("testimonials")} 
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Testimonials
                    </button>
                    <button 
                      onClick={() => scrollToSection("faq")} 
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      FAQ
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          
          <Link href="/marketplace" className="flex items-center text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2">
            <ShoppingBag className="h-4 w-4 mr-1" />
            Buying
          </Link>
          
          <Link href="/selling" className="flex items-center text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2">
            <FileText className="h-4 w-4 mr-1" />
            Selling
          </Link>
          
          <Link href="/faq" className="flex items-center text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2">
            <HelpCircle className="h-4 w-4 mr-1" />
            FAQ
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => scrollToSection("cta")}
            className="bg-primary hover:bg-primary/90"
          >
            Join Waitlist <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <button 
            className="md:hidden p-2" 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Fly-out Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 md:hidden backdrop-blur-sm overflow-y-auto pt-16">
          <button 
            className="absolute top-4 right-6"
            onClick={toggleMenu}
            aria-label="Close Menu"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="px-6 py-8 flex flex-col space-y-8">
            {isLandingPage && (
              <div className="space-y-6">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Learn</h3>
                <div className="space-y-4 pl-2">
                  <button 
                    onClick={() => scrollToSection("features")} 
                    className="flex w-full items-center text-xl font-medium hover:text-primary transition-colors"
                  >
                    Features
                    <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
                  </button>
                  <button 
                    onClick={() => scrollToSection("how-it-works")} 
                    className="flex w-full items-center text-xl font-medium hover:text-primary transition-colors"
                  >
                    How It Works
                    <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
                  </button>
                  <button 
                    onClick={() => scrollToSection("testimonials")} 
                    className="flex w-full items-center text-xl font-medium hover:text-primary transition-colors"
                  >
                    Testimonials
                    <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
                  </button>
                  <button 
                    onClick={() => scrollToSection("faq")} 
                    className="flex w-full items-center text-xl font-medium hover:text-primary transition-colors"
                  >
                    FAQ
                    <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Platform</h3>
              <div className="space-y-4 pl-2">
                <Link 
                  href="/marketplace" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.body.style.overflow = "";
                  }}
                  className="flex w-full items-center text-xl font-medium text-primary"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Buying
                  <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
                </Link>
                <Link 
                  href="/selling" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.body.style.overflow = "";
                  }}
                  className="flex w-full items-center text-xl font-medium hover:text-primary transition-colors"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Selling
                  <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
                </Link>
                <Link 
                  href="/faq" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.body.style.overflow = "";
                  }}
                  className="flex w-full items-center text-xl font-medium hover:text-primary transition-colors"
                >
                  <HelpCircle className="h-5 w-5 mr-2" />
                  FAQ
                  <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
                </Link>
              </div>
            </div>
            
            <div className="pt-6">
              <Button
                onClick={() => scrollToSection("cta")}
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
              >
                Join the Waitlist <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
