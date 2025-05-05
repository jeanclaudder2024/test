import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Ship, 
  Navigation, 
  Waves,
  BarChart3, 
  MapPin, 
  Building2, 
  Users,
  Briefcase,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Globe,
  LayoutDashboard
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  isMobile?: boolean;
  isCurrentPath?: boolean;
  onClick?: () => void;
}

export function NavItem({ href, icon, label, badge, isMobile = false, isCurrentPath = false, onClick }: NavItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };
  
  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Link href={href}>
        <a onClick={onClick} className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-accent/50",
          isCurrentPath ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground",
          isMobile && "w-full"
        )}>
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            isCurrentPath ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground"
          )}>
            {icon}
          </div>
          <span>{label}</span>
          {badge && (
            <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs">
              {badge}
            </Badge>
          )}
        </a>
      </Link>
    </motion.div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Track scroll position for effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { href: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { href: "/live-tracking", icon: <Navigation className="h-5 w-5" />, label: "Live Tracking", badge: "Live" },
    { href: "/vessels", icon: <Ship className="h-5 w-5" />, label: "Vessels", badge: "2499" },
    { href: "/refineries", icon: <Building2 className="h-5 w-5" />, label: "Refineries", badge: "70" },
    { href: "/ports", icon: <MapPin className="h-5 w-5" />, label: "Ports", badge: "73" },
    { href: "/companies", icon: <Users className="h-5 w-5" />, label: "Companies" },
    { href: "/brokers", icon: <Briefcase className="h-5 w-5" />, label: "Brokers" },
    { href: "/analytics", icon: <BarChart3 className="h-5 w-5" />, label: "Analytics" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b shadow-sm" : "bg-background"
      )}>
        <div className="container flex h-16 items-center px-4 sm:px-6">
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 mr-6">
              <div className="hidden sm:flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
                <Ship className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-lg tracking-tight text-foreground">
                  MyShip<span className="text-primary">Tracking</span>
                </span>
                <Badge variant="outline" className="hidden lg:inline-flex bg-primary/10 text-primary border-primary/20 text-xs h-5">
                  Enterprise
                </Badge>
              </div>
            </a>
          </Link>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.slice(0, 4).map((item) => (
              <NavItem 
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                isCurrentPath={location === item.href}
              />
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center gap-1 px-3 py-2",
                    location.includes('/refineries') || location.includes('/ports') ? 
                      "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  More <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.slice(4).map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>
                      <a className="flex items-center gap-2 cursor-pointer">
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          {/* Search */}
          <div className="relative ml-auto flex-1 max-w-md hidden lg:flex mx-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vessels, refineries, ports..."
              className="pl-8 bg-muted/40 border-muted focus-visible:bg-background"
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => setIsSearchActive(false)}
            />
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Search" onClick={() => setIsSearchActive(!isSearchActive)}>
              <Search className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-72">
                  <div className="space-y-2 p-2">
                    <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent cursor-pointer">
                      <Ship className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium">Vessel update available</p>
                        <p className="text-xs text-muted-foreground mt-1">New positions available for tracked vessels</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">10 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent cursor-pointer">
                      <MapPin className="h-5 w-5 text-yellow-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Port alert</p>
                        <p className="text-xs text-muted-foreground mt-1">Singapore port reports high congestion levels</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent cursor-pointer">
                      <Users className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Company data updated</p>
                        <p className="text-xs text-muted-foreground mt-1">New shipping company information added</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center" asChild>
                  <Link href="/notifications">
                    <a className="w-full text-center font-medium text-sm text-primary">View all notifications</a>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" alt="User avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">UN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Username</p>
                    <p className="text-xs leading-none text-muted-foreground">admin@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Language</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Mobile nav overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-40 w-3/4 max-w-xs bg-background p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href="/">
                <a className="flex items-center gap-2 mb-8">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
                    <Ship className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-lg tracking-tight">
                    MyShip<span className="text-primary">Tracking</span>
                  </span>
                </a>
              </Link>
              
              <Input
                type="search"
                placeholder="Search..."
                className="mb-6"
              />
              
              <div className="space-y-1">
                {navItems.map((item, index) => (
                  <NavItem 
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    isMobile
                    isCurrentPath={location === item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-1">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <motion.main 
        className="flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
      >
        {children}
      </motion.main>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm">
            <Link href="/">
              <a className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                <span className="font-semibold tracking-tight hidden sm:inline-block">
                  MyShipTracking
                </span>
              </a>
            </Link>
            <p className="text-center md:text-left text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MyShipTracking Enterprise. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms">
              <a className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
            </Link>
            <Link href="/contact">
              <a className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}