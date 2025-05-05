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
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();

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
    {
      title: t("nav.live_tracking"),
      path: "/tracking",
      icon: <Radio className="h-5 w-5 mr-3" />,
      badge: "LIVE",
    },
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

  const getUserItems = (): NavItem[] => [
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
      title: t("nav.settings"),
      path: "/settings",
      icon: <Settings className="h-5 w-5 mr-3" />,
    }
  ];
  
  const navItems = getNavItems();
  const userItems = getUserItems();

  const isPathActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className={cn(
      "backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 flex flex-col h-full transition-all duration-300 overflow-y-auto",
      mobile ? "fixed inset-y-0 left-0 z-50 w-64 h-screen" : "hidden md:flex",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Area */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 z-10">
        <Link href="/" className="cursor-pointer">
          {!collapsed && (
            <h1 className="font-bold text-2xl tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-primary">
              SHIPBOAT<br />TRACKING
            </h1>
          )}
          {collapsed && (
            <span className="font-bold text-xl mx-auto bg-gradient-to-r from-blue-600 to-primary rounded-full p-2 text-white">🚢</span>
          )}
        </Link>
        
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-primary/10"
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight className="h-4 w-4 text-primary" /> : <ChevronLeft className="h-4 w-4 text-primary" />}
          </Button>
        )}
        
        {mobile && (
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10" onClick={onClose}>
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>
        )}
      </div>
      
      {/* Main Navigation */}
      <div className="flex-grow overflow-y-auto">
        <div className="mt-6 mb-2 px-6">
          {!collapsed && <h2 className="font-heading uppercase text-primary/60 dark:text-primary/70 font-bold pb-2 text-xs tracking-wider">{t("nav.navigation")}</h2>}
        </div>
        
        <nav>
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.path}
                  onClick={mobile ? onClose : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center py-3 px-4 rounded-lg my-1 mx-2 transition-all duration-200",
                      isPathActive(item.path) 
                        ? "bg-primary/10 text-primary font-medium dark:bg-primary/20" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center",
                      isPathActive(item.path) ? "text-primary" : "text-gray-500 dark:text-gray-400",
                      collapsed ? "mr-0" : "mr-3"
                    )}>{item.icon}</span>
                    {!collapsed && (
                      <div className="flex items-center">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-2 px-1.5 py-0.5 text-[0.6rem] bg-red-500 text-white rounded-full font-bold animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-8">
          <div className="border-t border-primary/10 dark:border-primary/20 my-5 mx-6"></div>
          <div className="px-6 mb-2">
            {!collapsed && <h2 className="font-heading uppercase text-primary/60 dark:text-primary/70 font-bold pb-2 text-xs tracking-wider">{t("nav.profile")}</h2>}
          </div>
          
          {userItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              onClick={mobile ? onClose : undefined}
            >
              <div
                className={cn(
                  "flex items-center py-3 px-4 rounded-lg my-1 mx-2 transition-all duration-200", 
                  isPathActive(item.path) 
                    ? "bg-primary/10 text-primary font-medium dark:bg-primary/20" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60",
                  collapsed && "justify-center px-2"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center",
                  isPathActive(item.path) ? "text-primary" : "text-gray-500 dark:text-gray-400",
                  collapsed ? "mr-0" : "mr-3"
                )}>{item.icon}</span>
                {!collapsed && (
                  <div className="flex items-center">
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-[0.6rem] bg-red-500 text-white rounded-full font-bold animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
          
          {/* Language Switcher Section */}
          <div className="mt-6">
            <div className="border-t border-primary/10 dark:border-primary/20 my-5 mx-6"></div>
            <div className="px-6 mb-2">
              {!collapsed && (
                <h2 className="font-heading uppercase text-primary/60 dark:text-primary/70 font-bold pb-2 text-xs tracking-wider">
                  {t("nav.language")}
                </h2>
              )}
            </div>
            
            <div className={cn(
              "mx-4 p-2",
              collapsed ? "flex justify-center" : ""
            )}>
              <LanguageSwitcher 
                position="sidebar" 
                showLabel={!collapsed} 
                variant={collapsed ? "icon" : "default"} 
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
