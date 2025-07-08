import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Ship, 
  Building2, 
  Building,
  FileText, 
  Users, 
  LayoutDashboard, 
  User, 
  Brain,
  ChevronRight,
  ChevronLeft,
  Settings,
  BarChart,
  Map,
  Radio,
  Database,
  Anchor,
  Globe,
  Briefcase,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Define type for navigation items
  type NavItem = {
    title: string;
    path: string;
    icon: React.ReactNode;
    badge?: string;
    section?: string;
  };

  const getNavItems = (): NavItem[] => [
    {
      title: t("nav.dashboard"),
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
      section: "DASHBOARD"
    },
    {
      title: t("nav.vessels"),
      path: "/vessels",
      icon: <Ship className="h-5 w-5 mr-3" />,
    },
    // Maritime Tracking and Vessel Lookup items removed as requested
    {
      title: t("nav.refineries"),
      path: "/refineries",
      icon: <Building2 className="h-5 w-5 mr-3" />,
    },
    {
      title: t("nav.ports"),
      path: "/ports",
      icon: <Anchor className="h-5 w-5 mr-3" />,
    },
    {
      title: t("nav.trading"),
      path: "/trading",
      icon: <BarChart className="h-5 w-5 mr-3" />,
    },
    {
      title: t("nav.documents"),
      path: "/documents",
      icon: <FileText className="h-5 w-5 mr-3" />,
    },
    {
      title: t("nav.brokers"),
      path: "/brokers",
      icon: <Users className="h-5 w-5 mr-3" />,
    },
    {
      title: "Broker Dashboard",
      path: "/broker-dashboard",
      icon: <Briefcase className="h-5 w-5 mr-3" />,
      badge: "NEW",
    },
    {
      title: "Shipping Companies",
      path: "/companies",
      icon: <Building className="h-5 w-5 mr-3" />,
    },
    {
      title: t("nav.api_test"),
      path: "/api-test",
      icon: <Database className="h-5 w-5 mr-3" />,
      badge: "DEV",
    }
  ];

  const getUserItems = (): NavItem[] => {
    const baseItems = [
      {
        title: t("nav.profile"),
        path: "/profile",
        icon: <User className="h-5 w-5 mr-3" />,
      },
      {
        title: t("nav.ai_assistant"),
        path: "/ai-assistant",
        icon: <Brain className="h-5 w-5 mr-3" />,
      },
      {
        title: "Translation",
        path: "/translation",
        icon: <Globe className="h-5 w-5 mr-3" />,
        badge: "NEW",
      },
      {
        title: "Traffic Insights",
        path: "/traffic-insights",
        icon: <Map className="h-5 w-5 mr-3" />,
        badge: "NEW",
      }
    ];

    // Only add admin-only items for admin users
    const adminItems = user?.role === 'admin' ? [
      {
        title: "Admin Panel",
        path: "/admin",
        icon: <Shield className="h-5 w-5 mr-3" />,
        badge: "ADMIN",
      },
      {
        title: t("nav.settings"),
        path: "/settings",
        icon: <Settings className="h-5 w-5 mr-3" />,
      }
    ] : [
      // Regular users don't see admin panel or settings
    ];

    return [...baseItems, ...adminItems];
  };
  
  const navItems = getNavItems();
  const userItems = getUserItems();

  const isPathActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className={cn(
      "relative backdrop-blur-xl bg-gradient-to-b from-slate-50/95 via-white/95 to-slate-100/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 border-r border-gradient-to-b from-blue-200/50 via-orange-200/30 to-blue-200/50 dark:from-orange-500/20 dark:via-blue-500/10 dark:to-orange-500/20 flex-shrink-0 flex flex-col h-full transition-all duration-500 ease-in-out overflow-hidden shadow-xl",
      mobile ? "fixed inset-y-0 left-0 z-50 w-64 h-screen" : "hidden md:flex",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-orange-500/5 dark:from-blue-500/10 dark:to-orange-500/10 animate-gradient-xy"></div>
      
      {/* Logo Area */}
      <div className={cn(
        "relative p-6 border-b border-gradient-to-r from-blue-200/30 via-orange-200/50 to-blue-200/30 dark:from-orange-500/20 dark:via-blue-500/30 dark:to-orange-500/20 flex items-center justify-between sticky top-0 backdrop-blur-md bg-white/60 dark:bg-slate-900/60 z-10 transition-all duration-500",
        collapsed ? "h-24" : "h-32"
      )}>
        <Link href="/" className="cursor-pointer group">
          {!collapsed && (
            <div className="flex items-center group-hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <img 
                  src="/assets/petrodealhub-logo.png" 
                  alt="PetroDealHub Logo" 
                  className="h-20 w-auto drop-shadow-lg filter brightness-110" 
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-orange-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-blue-600 to-orange-500 flex items-center justify-center text-white font-bold rounded-xl shadow-2xl ring-2 ring-white/20">
                  <span className="text-lg font-extrabold">P</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
              </div>
            </div>
          )}
        </Link>
        
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-orange-500/20 hover:shadow-lg transition-all duration-300 group/toggle"
            onClick={toggleSidebar}
          >
            <div className="relative">
              {collapsed ? 
                <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover/toggle:text-orange-500 transition-colors duration-300" /> : 
                <ChevronLeft className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover/toggle:text-orange-500 transition-colors duration-300" />
              }
            </div>
          </Button>
        )}
        
        {mobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-orange-500/20 transition-all duration-300" 
            onClick={onClose}
          >
            <ChevronLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </Button>
        )}
      </div>
      
      {/* Main Navigation */}
      <div className="relative flex-grow overflow-y-auto custom-scrollbar">
        <div className={cn("mt-8 mb-4 px-6 transition-all duration-500", collapsed && "px-2")}>
          {!collapsed && (
            <div className="relative">
              <h2 className="font-bold uppercase bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent font-heading pb-3 text-xs tracking-widest">
                {t("nav.navigation")}
              </h2>
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"></div>
            </div>
          )}
        </div>
        
        <nav className="px-3">
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.path}
                  onClick={mobile ? onClose : undefined}
                  className="block"
                >
                  <div
                    className={cn(
                      "group relative flex items-center rounded-xl transition-all duration-300 hover:scale-[1.02] transform-gpu",
                      collapsed ? "py-3 px-3 justify-center" : "py-3.5 px-4",
                      isPathActive(item.path) 
                        ? "bg-gradient-to-r from-blue-500/15 via-blue-400/10 to-orange-500/15 text-blue-700 dark:text-blue-300 font-semibold shadow-lg ring-1 ring-blue-500/20 dark:ring-blue-400/30" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-white/50 hover:to-orange-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 hover:shadow-md hover:ring-1 hover:ring-blue-200/30 dark:hover:ring-slate-600/30"
                    )}
                  >
                    {/* Icon with enhanced styling */}
                    <div className={cn(
                      "flex items-center justify-center transition-all duration-300",
                      collapsed ? "mr-0" : "mr-4",
                      isPathActive(item.path) 
                        ? "text-blue-600 dark:text-blue-400 scale-110" 
                        : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110"
                    )}>
                      <div className="relative">
                        {item.icon}
                        {isPathActive(item.path) && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-orange-500/20 rounded-lg blur-sm"></div>
                        )}
                      </div>
                    </div>
                    
                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="font-medium text-sm leading-tight truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="ml-3 px-2 py-0.5 text-[0.65rem] bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold shadow-sm animate-pulse ring-1 ring-red-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Active indicator */}
                    {isPathActive(item.path) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-orange-500 rounded-r-full shadow-lg"></div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-white"></div>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Profile Section */}
        <div className="mt-8 px-3">
          {/* Elegant divider */}
          <div className="relative my-6 mx-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-blue-300/40 to-transparent dark:via-orange-500/30"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"></div>
            </div>
          </div>
          
          <div className={cn("px-3 mb-4 transition-all duration-500", collapsed && "px-0")}>
            {!collapsed && (
              <div className="relative">
                <h2 className="font-bold uppercase bg-gradient-to-r from-orange-600 to-blue-500 bg-clip-text text-transparent font-heading pb-3 text-xs tracking-widest">
                  {t("nav.profile")}
                </h2>
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full"></div>
              </div>
            )}
          </div>
          
          <ul className="space-y-1">
            {userItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.path}
                  onClick={mobile ? onClose : undefined}
                  className="block"
                >
                  <div
                    className={cn(
                      "group relative flex items-center rounded-xl transition-all duration-300 hover:scale-[1.02] transform-gpu",
                      collapsed ? "py-3 px-3 justify-center" : "py-3.5 px-4",
                      isPathActive(item.path) 
                        ? "bg-gradient-to-r from-orange-500/15 via-orange-400/10 to-blue-500/15 text-orange-700 dark:text-orange-300 font-semibold shadow-lg ring-1 ring-orange-500/20 dark:ring-orange-400/30" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-orange-50/80 hover:via-white/50 hover:to-blue-50/80 dark:hover:from-slate-800/60 dark:hover:via-slate-700/40 dark:hover:to-slate-800/60 hover:shadow-md hover:ring-1 hover:ring-orange-200/30 dark:hover:ring-slate-600/30"
                    )}
                  >
                    {/* Icon with enhanced styling */}
                    <div className={cn(
                      "flex items-center justify-center transition-all duration-300",
                      collapsed ? "mr-0" : "mr-4",
                      isPathActive(item.path) 
                        ? "text-orange-600 dark:text-orange-400 scale-110" 
                        : "text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:scale-110"
                    )}>
                      <div className="relative">
                        {item.icon}
                        {isPathActive(item.path) && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-lg blur-sm"></div>
                        )}
                      </div>
                    </div>
                    
                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="font-medium text-sm leading-tight truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="ml-3 px-2 py-0.5 text-[0.65rem] bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold shadow-sm animate-pulse ring-1 ring-red-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Active indicator */}
                    {isPathActive(item.path) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-500 to-blue-500 rounded-r-full shadow-lg"></div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-white"></div>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
