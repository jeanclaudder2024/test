import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu as MenuIcon, X as XIcon } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'about' | 'careers' | 'blog' | 'api' | 'contact' | 'cookie-policy' | 'documentation' | 'become-broker' | 'ports-access' | 'refineries-access' | 'refineries' | 'vessels';
}

export default function Header({ currentPage }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getPageDisplayName = (page: string) => {
    switch (page) {
      case 'home': return 'Home';
      case 'about': return 'About';
      case 'careers': return 'Careers';
      case 'blog': return 'Blog';
      case 'api': return 'API Integration';
      case 'contact': return 'Contact Us';
      case 'cookie-policy': return 'Cookie Policy';
      case 'documentation': return 'Documentation Center';
      case 'become-broker': return 'Become a Broker';
      case 'ports-access': return 'Ports Access';
      case 'refineries-access': return 'Refineries Access';
      case 'refineries': return 'Refineries';
      case 'vessels': return 'Vessels';
      default: return page;
    }
  };

  const navigationItems = [
    { key: 'home', href: '/', label: 'Home' },
    { key: 'about', href: '/about', label: 'About' },
    { key: 'careers', href: '/careers', label: 'Careers' },
    { key: 'blog', href: '/blog', label: 'Blog' },
    { key: 'api', href: '/api-integration', label: 'API Integration' },
    { key: 'contact', href: '/contact', label: 'Contact Us' },
    { key: 'cookie-policy', href: '/cookie-policy', label: 'Cookie Policy' },
    { key: 'documentation', href: '/documentation', label: 'Documentation Center' },
    { key: 'become-broker', href: '/become-broker', label: 'Become a Broker' },
    { key: 'ports-access', href: '/ports-access', label: 'Ports Access' },
    { key: 'refineries-access', href: '/refineries-access', label: 'Refineries Access' },
  ];

  const platformItems = [
    { key: 'refineries', href: '/refineries', label: 'Refineries' },
    { key: 'vessels', href: '/vessels', label: 'Vessels' },
  ];

  return (
    <>
      {/* Header Navigation */}
      <header 
        className={`px-4 lg:px-6 h-40 flex items-center justify-between fixed w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-slate-900/90 border-b border-orange-500/20 backdrop-blur-lg shadow-md" 
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-2xl">
          <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-36 w-auto" />
          <span className="text-white sr-only">PetroDealHub</span>
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden lg:flex gap-8 items-center">
          {navigationItems.map((item) => (
            item.key === currentPage ? (
              <span key={item.key} className="text-sm font-medium text-orange-500">
                {item.label}
              </span>
            ) : (
              <Link 
                key={item.key}
                href={item.href} 
                className="text-sm font-medium text-white/80 hover:text-orange-500 transition-colors"
              >
                {item.label}
              </Link>
            )
          ))}
          <div className="h-6 w-px bg-slate-700"></div>
          {platformItems.map((item) => (
            item.key === currentPage ? (
              <span key={item.key} className="text-sm font-medium text-orange-500">
                {item.label}
              </span>
            ) : (
              <Link 
                key={item.key}
                href={item.href} 
                className="text-sm font-medium text-white/80 hover:text-orange-500 transition-colors"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>
        
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
              Dashboard
            </Button>
          </Link>
          <Link href="/vessels">
            <Button size="default" className="bg-orange-500 hover:bg-orange-600 text-white">
              View Vessels
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <XIcon className="h-6 w-6 text-white" />
          ) : (
            <MenuIcon className="h-6 w-6 text-white" />
          )}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/98 backdrop-blur-lg pt-40 px-4 py-6 flex flex-col">
          <nav className="flex flex-col gap-4">
            {navigationItems.map((item) => (
              item.key === currentPage ? (
                <span key={item.key} className="text-lg font-medium py-2 border-b border-slate-800/80 text-orange-500">
                  {item.label}
                </span>
              ) : (
                <Link 
                  key={item.key}
                  href={item.href} 
                  className="text-lg font-medium py-2 border-b border-slate-800/80 text-white" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            ))}
            {platformItems.map((item) => (
              item.key === currentPage ? (
                <span key={item.key} className="text-lg font-medium py-2 border-b border-slate-800/80 text-orange-500">
                  {item.label}
                </span>
              ) : (
                <Link 
                  key={item.key}
                  href={item.href} 
                  className="text-lg font-medium py-2 border-b border-slate-800/80 text-white" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 pt-6">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-slate-700 text-white">Dashboard</Button>
            </Link>
            <Link href="/vessels" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">View Vessels</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}