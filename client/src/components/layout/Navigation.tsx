import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Ship, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Building, 
  MapPin, 
  BarChart3, 
  Users, 
  Shield,
  CreditCard,
  FileText,
  Anchor
} from 'lucide-react';

const Navigation = () => {
  const [location] = useLocation();
  const { user, profile, signOut, isAdmin, isBroker, canAccessFeature } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      requiresAuth: true,
    },
    {
      name: 'Companies',
      href: '/companies',
      icon: Building,
      requiresAuth: false,
    },
    {
      name: 'Vessels',
      href: '/vessels',
      icon: Ship,
      requiresAuth: false,
    },
    {
      name: 'Ports',
      href: '/ports',
      icon: Anchor,
      requiresAuth: false,
    },
    {
      name: 'Refineries',
      href: '/refineries',
      icon: MapPin,
      requiresAuth: false,
    },
    {
      name: 'Brokers',
      href: '/brokers',
      icon: Users,
      requiresAuth: true,
      feature: 'basic',
    },
    {
      name: 'Deal Management',
      href: '/trading',
      icon: FileText,
      requiresAuth: true,
      feature: 'deal_management',
      brokerOnly: true,
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      requiresAuth: true,
      adminOnly: true,
    },
  ];

  const userMenuItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      name: 'Subscription',
      href: '/subscription',
      icon: CreditCard,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const shouldShowItem = (item: any) => {
    // Admin-only items
    if (item.adminOnly && !isAdmin) return false;
    
    // Broker-only items
    if (item.brokerOnly && !isBroker) return false;
    
    // Items requiring authentication
    if (item.requiresAuth && !user) return false;
    
    // Feature-based access control
    if (item.feature && !canAccessFeature(item.feature)) return false;
    
    return true;
  };

  const NavItems = ({ mobile = false, onItemClick = () => {} }) => (
    <>
      {navigationItems
        .filter(shouldShowItem)
        .map((item) => (
          <Link key={item.name} href={item.href}>
            <a
              onClick={onItemClick}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } ${mobile ? 'w-full justify-start' : ''}`}
            >
              <item.icon className={`h-4 w-4 ${mobile ? 'mr-3' : 'mr-2'}`} />
              {item.name}
              {item.brokerOnly && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Pro
                </Badge>
              )}
              {item.adminOnly && (
                <Badge variant="default" className="ml-2 text-xs">
                  Admin
                </Badge>
              )}
            </a>
          </Link>
        ))}
    </>
  );

  const UserMenu = ({ mobile = false }) => {
    if (!user) {
      return (
        <div className={`flex ${mobile ? 'flex-col space-y-2' : 'items-center space-x-4'}`}>
          <Link href="/login">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" onClick={() => setMobileMenuOpen(false)}>
              Get Started
            </Button>
          </Link>
        </div>
      );
    }

    if (mobile) {
      return (
        <div className="space-y-2">
          <div className="flex items-center px-3 py-2 border-b">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {getInitials(profile?.full_name || user.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{profile?.full_name || user.email}</p>
              <p className="text-xs text-gray-500">{profile?.company_name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {profile?.subscription_plan || 'free'}
                </Badge>
                {isAdmin && (
                  <Badge variant="default" className="text-xs">
                    Admin
                  </Badge>
                )}
                {isBroker && (
                  <Badge variant="secondary" className="text-xs">
                    Broker
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {userMenuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <a
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </a>
            </Link>
          ))}
          
          <button
            onClick={handleSignOut}
            className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md w-full"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {getInitials(profile?.full_name || user.email || 'U')}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.full_name || user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile?.company_name}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {profile?.subscription_plan || 'free'}
                </Badge>
                {isAdmin && (
                  <Badge variant="default" className="text-xs">
                    Admin
                  </Badge>
                )}
                {isBroker && (
                  <Badge variant="secondary" className="text-xs">
                    Broker
                  </Badge>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userMenuItems.map((item) => (
            <DropdownMenuItem key={item.name} asChild>
              <Link href={item.href}>
                <a className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                </a>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center space-x-2">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Ship className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    PetroDealHub
                  </span>
                </a>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <NavItems />
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex md:items-center">
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  <NavItems mobile onItemClick={() => setMobileMenuOpen(false)} />
                  <div className="pt-4 border-t">
                    <UserMenu mobile />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;