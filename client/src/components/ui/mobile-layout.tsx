import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Ship,
  Database,
  Anchor,
  FileText,
  Briefcase,
  UserPlus,
  MessageSquare,
  ShoppingBag,
  Settings,
  User,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Globe,
  RefreshCw,
  CreditCard,
  LifeBuoy,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const navigation = React.useMemo(() => {
    const baseNavigation = [
      { name: "Vessels", href: "/vessels", icon: Ship },
      { name: "Map", href: "/oil-vessel-map", icon: Home },
      { name: "Refineries", href: "/refineries", icon: Database },
      { name: "Ports", href: "/ports", icon: Anchor },
    ];

    const secondaryNavigation = [
      { name: "Companies", href: "/companies", icon: Briefcase },
      { name: "Oil Prices", href: "/oil-prices", icon: RefreshCw },
      { name: "PDF Test", href: "/pdf-test", icon: FileText },
      { 
        name: "Broker", 
        href: (user?.hasBrokerMembership || localStorage.getItem('brokerMembershipCompleted') === 'true') ? "/broker-dashboard" : "/broker-payment", 
        icon: (user?.hasBrokerMembership || localStorage.getItem('brokerMembershipCompleted') === 'true') ? Briefcase : Lock 
      },
      { name: "Profile", href: "/profile", icon: User },
      { name: "AI Assistant", href: "/ai-assistant", icon: MessageSquare },
      { name: "Pricing", href: "/pricing", icon: ShoppingBag },
    ];

    const adminNavigation = user?.role === 'admin' ? [
      { name: "Admin Panel", href: "/admin", icon: AlertCircle },
      { name: "Settings", href: "/settings", icon: Settings },
    ] : [];

    return { primary: baseNavigation, secondary: secondaryNavigation, admin: adminNavigation };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      window.location.replace('/');
    }
  };

  const isActiveRoute = (href: string) => {
    return location === href || location.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 flex justify-center">
            <img
              src="/assets/petrodealhub-logo.png"
              alt="PetroDealHub"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex h-14 items-center px-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex-1 px-4">
              <Input
                type="search"
                placeholder="Search vessels, ports, documents..."
                className="h-10 border-none bg-muted/50 focus-visible:ring-0"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Side Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[85%] p-0 bg-background">
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <img
                src="/assets/petrodealhub-logo.png"
                alt="PetroDealHub"
                className="h-10 w-auto object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Profile Section */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-base">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  {user?.role === 'admin' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              {/* Primary Navigation */}
              <div className="px-4 mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Main
                </h3>
                <div className="space-y-1">
                  {navigation.primary.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "text-foreground hover:bg-muted active:bg-muted/80"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Navigation */}
              <div className="px-4 mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Tools
                </h3>
                <div className="space-y-1">
                  {navigation.secondary.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "text-foreground hover:bg-muted active:bg-muted/80"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Admin Navigation */}
              {navigation.admin.length > 0 && (
                <div className="px-4 mb-6">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Admin
                  </h3>
                  <div className="space-y-1">
                    {navigation.admin.map((item) => {
                      const isActive = isActiveRoute(item.href);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : "text-foreground hover:bg-muted active:bg-muted/80"
                          )}
                        >
                          <Icon className="h-6 w-6" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </nav>

            {/* Menu Footer */}
            <div className="border-t p-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col h-12 gap-1"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="text-xs">Theme</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col h-12 gap-1"
                  onClick={() => window.location.href = "/settings"}
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Settings</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col h-12 gap-1"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-xs">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
          <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
            <img
              src="/assets/petrodealhub-logo.png"
              alt="PetroDealHub"
              className="h-10 w-auto object-contain"
            />
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {[...navigation.primary, ...navigation.secondary, ...navigation.admin].map((item) => {
                const isActive = isActiveRoute(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-sidebar-muted")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
                </p>
                <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.location.href = "/settings/profile"}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    Toggle Theme
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.reload()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/account/subscription"}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscription
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open("https://support.myshiptracking.com", "_blank")}>
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Desktop Header */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-background flex items-center px-6">
            <div className="flex items-center w-full gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search vessels, ports, documents..."
                  className="pl-9 bg-muted/50 border-none focus-visible:ring-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">🇺🇸 English</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>🇺🇸 English</DropdownMenuItem>
                    <DropdownMenuItem>🇸🇦 العربية</DropdownMenuItem>
                    <DropdownMenuItem>🇫🇷 Français</DropdownMenuItem>
                    <DropdownMenuItem>🇪🇸 Español</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Desktop Main Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>

      {/* Mobile Main Content */}
      <main className="lg:hidden pb-20">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border">
        <div className="flex h-16">
          {navigation.primary.slice(0, 5).map((item) => {
            const isActive = isActiveRoute(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-xs font-medium truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}