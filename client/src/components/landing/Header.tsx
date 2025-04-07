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
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // When opening the menu, prevent scrolling
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };
  
  // We'll remove the click outside handler to fix the immediate issue with the menu

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
          <Link href="/marketplace" className="flex items-center text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2">
            <ShoppingBag className="h-4 w-4 mr-1" />
            Buying
          </Link>
          
          <Link href="/selling" className="flex items-center text-sm font-medium hover:text-primary transition-colors nav-glow px-3 py-2">
            <FileText className="h-4 w-4 mr-1" />
            Selling
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {/* User controls on desktop */}
          {isAuthenticated ? (
            // User is logged in - show profile dropdown
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-primary/30">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-black/30 text-white">
                        {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || user?.username?.charAt(0) || ''}
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
            </div>
          ) : (
            // User is not logged in - show login/signup buttons on desktop
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-primary">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
              </Link>
            </div>
          )}
          
          {/* Mobile menu button (appears on all viewport sizes) */}
          <button 
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-black/20 transition-colors" 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isAuthenticated && (
              <Avatar className="h-8 w-8 md:hidden mr-1 border border-primary/30">
                <AvatarFallback className="bg-black/30 text-white text-xs">
                  {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || user?.username?.charAt(0) || ''}
                </AvatarFallback>
              </Avatar>
            )}
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Animated Mobile Menu - Always renders but transforms offscreen when closed */}
      <div 
        className={`fixed inset-0 z-50 backdrop-blur-xl transition-all duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ 
          background: 'radial-gradient(circle at center, rgba(19, 24, 35, 0.95) 0%, rgba(10, 15, 25, 0.98) 100%)'
        }}
      >
        {/* Close button (visible on all viewport sizes) */}
        <button 
          className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/30 hover:bg-primary/20 transition-colors"
          onClick={toggleMenu}
          aria-label="Close Menu"
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* User profile on top right */}
        {isAuthenticated && (
          <div className="absolute top-6 right-16 z-20">
            <Avatar className="h-10 w-10 ring-2 ring-primary/50">
              <AvatarFallback className="bg-black/30 text-white">
                {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || user?.username?.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Content area with staggered animations */}
        <div className="h-full flex flex-col items-center justify-center px-8 overflow-auto">
          {/* Logo animated entrance */}
          <div className={`mb-10 transform transition-all duration-700 delay-100 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center justify-center space-x-3">
              <div className="rounded-md bg-primary p-2">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <span className="font-serif text-3xl font-bold">NoteTrade</span>
            </div>
          </div>
          
          {/* Main navigation links */}
          <nav className="flex flex-col items-center space-y-6 mb-10 w-full max-w-sm">
            <Link 
              href="/marketplace" 
              onClick={() => {
                setIsMenuOpen(false);
                document.body.style.overflow = "";
              }}
              className={`group w-full flex items-center justify-between px-6 py-4 rounded-xl bg-black/30 border border-white/10 text-xl font-medium hover:bg-primary/20 transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-200`}
            >
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-3" />
                <span>Buying</span>
              </div>
              <div className="bg-primary/20 rounded-full p-1 transform transition-transform duration-300 group-hover:translate-x-1">
                <ChevronRight className="h-5 w-5" />
              </div>
            </Link>
            
            <Link 
              href="/selling" 
              onClick={() => {
                setIsMenuOpen(false);
                document.body.style.overflow = "";
              }}
              className={`group w-full flex items-center justify-between px-6 py-4 rounded-xl bg-black/30 border border-white/10 text-xl font-medium hover:bg-primary/20 transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-300`}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-3" />
                <span>Selling</span>
              </div>
              <div className="bg-primary/20 rounded-full p-1 transform transition-transform duration-300 group-hover:translate-x-1">
                <ChevronRight className="h-5 w-5" />
              </div>
            </Link>
          </nav>
          
          {/* Account section */}
          {isAuthenticated ? (
            <div className={`flex flex-col items-center space-y-4 w-full max-w-sm transform transition-all duration-500 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-400`}>
              <div className="w-full px-6 py-2 border-b border-white/10 mb-2">
                <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Account</h3>
              </div>
              
              <Link 
                href="/profile" 
                onClick={() => {
                  setIsMenuOpen(false);
                  document.body.style.overflow = "";
                }}
                className="group w-full flex items-center justify-between px-6 py-3 rounded-xl hover:bg-black/30 transition-colors"
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-primary" />
                  <span>Profile</span>
                </div>
                <div className="transform transition-transform duration-300 group-hover:translate-x-1">
                  <ChevronRight className="h-5 w-5 opacity-60" />
                </div>
              </Link>
              
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  document.body.style.overflow = "";
                  logout();
                }}
                className="group w-full flex items-center justify-between px-6 py-3 rounded-xl hover:bg-black/30 transition-colors"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-3 text-primary" />
                  <span>Log Out</span>
                </div>
                <div className="transform transition-transform duration-300 group-hover:translate-x-1">
                  <ChevronRight className="h-5 w-5 opacity-60" />
                </div>
              </button>
            </div>
          ) : (
            <div className={`flex flex-col items-center space-y-4 w-full max-w-sm transform transition-all duration-500 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-400`}>
              <Link href="/login" onClick={() => {
                setIsMenuOpen(false);
                document.body.style.overflow = "";
              }}>
                <Button variant="outline" className="w-64 h-12 text-lg">
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={() => {
                setIsMenuOpen(false);
                document.body.style.overflow = "";
              }}>
                <Button className="w-64 h-12 text-lg bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
