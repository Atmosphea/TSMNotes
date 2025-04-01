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
  ChevronDown,
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const isLandingPage = location === "/";
  const { user, isAuthenticated, logout } = useAuth();

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
          {isAuthenticated ? (
            // User is logged in - show profile dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.username} />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0) || user?.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-sm">
                      {user?.firstName} {user?.lastName || user?.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate w-40">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // User is not logged in - show login/waitlist buttons
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-primary">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
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
            
            {isAuthenticated ? (
              // Auth section for logged in users
              <div className="space-y-6">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Account</h3>
                <div className="space-y-4 pl-2">
                  <Link 
                    href="/profile" 
                    onClick={() => {
                      setIsMenuOpen(false);
                      document.body.style.overflow = "";
                    }}
                    className="flex w-full items-center text-xl font-medium hover:text-primary transition-colors"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                    <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      document.body.style.overflow = "";
                      logout();
                    }}
                    className="flex w-full items-center text-xl font-medium hover:text-primary transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Log Out
                    <ChevronRight className="ml-auto h-5 w-5 opacity-60" />
                  </button>
                </div>
              </div>
            ) : (
              // Auth section for non-logged in users
              <div className="pt-6 space-y-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full h-12 text-lg">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
