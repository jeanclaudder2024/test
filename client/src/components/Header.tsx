import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronDown,
  Menu as MenuIcon, 
  X as XIcon,
  Ship,
  MapPin,
  Factory,
  TrendingUp,
  FileText,
  Users,
  Phone,
  Info,
  Shield,
  Settings,
  HeadphonesIcon,
  Building,
  Briefcase,
  BookOpen,
  Code,
  UserPlus,
  Home,
  Eye,
  Cookie
} from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'about' | 'careers' | 'blog' | 'api' | 'contact' | 'support-center' | 'terms-of-service' | 'privacy-policy' | 'cookie-policy' | 'documentation' | 'become-broker' | 'ports-access' | 'refineries-access' | 'future-trading' | 'vessels-tracking' | 'refineries' | 'vessels';
}

export default function Header({ currentPage }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Organized navigation structure
  const navigationStructure = {
    main: [
      { key: 'home', href: '/', label: 'Home', icon: Home }
    ],
    intelligence: {
      label: 'Intelligence',
      icon: Eye,
      items: [
        { key: 'ports-access', href: '/ports-access', label: 'Ports Access', icon: MapPin },
        { key: 'refineries-access', href: '/refineries-access', label: 'Refineries Access', icon: Factory },
        { key: 'future-trading', href: '/future-trading', label: 'Future Trading', icon: TrendingUp },
        { key: 'vessels-tracking', href: '/vessels-tracking', label: 'Vessels Tracking', icon: Ship },
      ]
    },
    platform: {
      label: 'Platform',
      icon: Settings,
      items: [
        { key: 'refineries', href: '/refineries', label: 'Refineries', icon: Factory },
        { key: 'vessels', href: '/vessels', label: 'Vessels', icon: Ship },
      ]
    },
    company: {
      label: 'Company',
      icon: Building,
      items: [
        { key: 'about', href: '/about', label: 'About Us', icon: Info },
        { key: 'careers', href: '/careers', label: 'Careers', icon: Briefcase },
        { key: 'blog', href: '/blog', label: 'Blog', icon: BookOpen },
      ]
    },
    services: {
      label: 'Services',
      icon: UserPlus,
      items: [
        { key: 'become-broker', href: '/become-broker', label: 'Become a Broker', icon: Users },
        { key: 'api', href: '/api-integration', label: 'API Integration', icon: Code },
        { key: 'documentation', href: '/documentation', label: 'Documentation', icon: FileText },
      ]
    },
    support: {
      label: 'Support',
      icon: HeadphonesIcon,
      items: [
        { key: 'support-center', href: '/support-center', label: 'Support Center', icon: HeadphonesIcon },
        { key: 'contact', href: '/contact', label: 'Contact Us', icon: Phone },
      ]
    },
    legal: {
      label: 'Legal',
      icon: Shield,
      items: [
        { key: 'terms-of-service', href: '/terms-of-service', label: 'Terms of Service', icon: FileText },
        { key: 'privacy-policy', href: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
        { key: 'cookie-policy', href: '/cookie-policy', label: 'Cookie Policy', icon: Cookie },
      ]
    }
  };

  const isActiveInDropdown = (items: any[]) => {
    return items.some(item => item.key === currentPage);
  };

  const handleDropdownToggle = (dropdownKey: string) => {
    setActiveDropdown(activeDropdown === dropdownKey ? null : dropdownKey);
  };

  return (
    <>
      {/* Header Navigation */}
      <header 
        className={`px-4 lg:px-6 h-36 flex items-center justify-between fixed w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-slate-900/95 border-b border-orange-500/20 backdrop-blur-lg shadow-xl" 
            : "bg-slate-900/80 backdrop-blur-sm"
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-2xl">
          <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-32 w-48" />
          <span className="text-white sr-only">PetroDealHub</span>
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Home */}
          {navigationStructure.main.map((item) => (
            <Link 
              key={item.key}
              href={item.href} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                item.key === currentPage 
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" 
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}

          {/* Dropdown Menus */}
          {Object.entries(navigationStructure).filter(([key]) => key !== 'main').map(([key, section]) => (
            <div key={key} className="relative">
              <button
                onClick={() => handleDropdownToggle(key)}
                onMouseEnter={() => setActiveDropdown(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActiveInDropdown(section.items) 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" 
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
                <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === key && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div className="p-2">
                      {section.items.map((item, index) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          className={`block px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
                            item.key === currentPage
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              : "text-white/80 hover:text-white hover:bg-white/10"
                          }`}
                          onClick={() => setActiveDropdown(null)}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {/* Get Started Button */}
          <div className="ml-4 pl-4 border-l border-white/20">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white border-0 px-6 py-2 font-medium transition-all duration-200">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="bg-slate-900/95 backdrop-blur-lg h-full w-full pt-40 px-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Home */}
                {navigationStructure.main.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center gap-3 ${
                      item.key === currentPage 
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}

                {/* Mobile Dropdown Sections */}
                {Object.entries(navigationStructure).filter(([key]) => key !== 'main').map(([key, section]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2 text-white/60 text-sm font-semibold uppercase tracking-wider">
                      <section.icon className="h-4 w-4" />
                      {section.label}
                    </div>
                    <div className="pl-4 space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          className={`block px-4 py-3 rounded-lg text-base transition-all duration-200 flex items-center gap-3 ${
                            item.key === currentPage
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              : "text-white/80 hover:text-white hover:bg-white/10"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Mobile Get Started Button */}
                <div className="pt-6 mt-6 border-t border-white/20">
                  <Link href="/login" className="block">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white border-0 px-6 py-3 font-medium transition-all duration-200">
                      Get Started
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="pt-40 pb-4 px-4 lg:px-6 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-orange-400 transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            {currentPage !== 'home' && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-orange-400 font-medium">
                  {Object.values(navigationStructure).flat().find((item: any) => 
                    Array.isArray(item) ? item.some((subItem: any) => subItem.key === currentPage) :
                    item.items?.some((subItem: any) => subItem.key === currentPage)
                  )?.label || currentPage}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}