import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Bell,
  ChevronDown,
  Compass,
  CreditCard,
  Database,
  FileText,
  Globe,
  HelpCircle,
  Home,
  Layers,
  LifeBuoy,
  Map,
  Menu,
  MessageSquare,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Ship,
  ShoppingBag,
  Star,
  Sun,
  User,
  UserPlus,
  X,
  Anchor,
  Briefcase,
  LogOut,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShipBoatAssistant } from "@/components/ShipBoatAssistant";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const navigation = [
    // Dashboard removed as requested
    { name: "Vessels", href: "/vessels", icon: Ship },
    // Vessel Dashboard removed as requested
    // Vessel Lookup removed as requested
    // Maritime Map removed as requested
    { name: "Oil Vessel Map", href: "/oil-vessel-map", icon: Ship },
    // Maritime Tracking removed as requested
    { name: "Refineries", href: "/refineries", icon: Database },
    { name: "Ports", href: "/ports", icon: Anchor },

    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Companies", href: "/companies", icon: Briefcase },
    { name: "Brokers", href: "/brokers", icon: UserPlus },
    { name: "AI Assistant", href: "/ai-assistant", icon: MessageSquare },
    { name: "Admin Panel", href: "/admin", icon: AlertCircle },
    { name: "Pricing", href: "/pricing", icon: ShoppingBag },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleProfile = () => {
    window.location.href = "/settings/profile";
  };

  const handleSettings = () => {
    window.location.href = "/settings";
  };

  const handleLogout = () => {
    // In a real app, you'd call your logout API here
    console.log("User logged out");
    window.location.href = "/auth";
  };

  const handleRefreshData = () => {
    // Refresh data logic
    console.log("Refreshing data...");
    window.location.reload();
  };

  const handleHelpSupport = () => {
    window.open("https://support.myshiptracking.com", "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center h-30 px-6 border-b border-sidebar-border">
          <img
            src="/assets/petrodealhub-logo.png"
            alt="Logo"
            className="h-30 w-auto object-contain"
          />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                location === item.href || location.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-sidebar-muted",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  UT
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-sidebar-muted">user@example.com</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleProfile}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  Toggle Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRefreshData}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/subscription">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscription
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHelpSupport}>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Help & Support
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

      {/* Mobile Sidebar */}
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-[80%] max-w-sm p-0 bg-sidebar">
          <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
            <img
              src="/assets/petrodealhub-logo.png"
              alt="Logo"
              style={{ width: "56%", height: "168%" }}
              className="object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsMobileNavOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive =
                  location === item.href ||
                  location.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-primary" : "text-sidebar-muted",
                      )}
                    />
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
                  UT
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-sidebar-muted">user@example.com</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSettings}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRefreshData}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Data
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/subscription">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscription
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleHelpSupport}>
                      <LifeBuoy className="mr-2 h-4 w-4" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background flex items-center px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center w-full gap-4 md:gap-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search vessels, ports, documents..."
                className="pl-8 bg-muted/50 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Translation Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline-block text-sm">
                      English
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="cursor-pointer">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    French
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Spanish
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Arabic
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Chinese
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 font-normal h-8 px-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/avatar.png" alt="User" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          UT
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">User</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSettings}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/subscription">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscription
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/30">
          <div className="mx-auto animate-fade-in">{children}</div>
        </main>
      </div>

      {/* ShipBoat AI Assistant */}
      <ShipBoatAssistant />
    </div>
  );
}

// Missing icons - using CustomIcons prefix to avoid conflicts with lucide imports
const CustomAnchor = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="22" x2="12" y2="8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
);

const CustomBriefcase = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const CustomLogOut = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
