import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Ship, 
  Building2, 
  FileText, 
  Users, 
  LayoutDashboard, 
  User, 
  Brain,
  ChevronRight,
  ChevronLeft,
  Settings,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    {
      title: "Overview",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
      section: "DASHBOARD"
    },
    {
      title: "OIL BOATS",
      path: "/vessels",
      icon: <Ship className="h-5 w-5 mr-3" />,
    },
    {
      title: "REFINERY",
      path: "/refineries",
      icon: <Building2 className="h-5 w-5 mr-3" />,
    },
    {
      title: "TRADING",
      path: "/trading",
      icon: <BarChart className="h-5 w-5 mr-3" />,
    },
    {
      title: "DOCUMENTERY", // Keeping the original spelling from the design
      path: "/documents",
      icon: <FileText className="h-5 w-5 mr-3" />,
    },
    {
      title: "BROKERS",
      path: "/brokers",
      icon: <Users className="h-5 w-5 mr-3" />,
    }
  ];

  const userItems = [
    {
      title: "Profile",
      path: "/profile",
      icon: <User className="h-5 w-5 mr-3" />,
    },
    {
      title: "AI Assistant",
      path: "/ai-assistant",
      icon: <Brain className="h-5 w-5 mr-3" />,
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5 mr-3" />,
    }
  ];

  const isPathActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className={cn(
      "backdrop-blur-sm bg-white/80 border-r border-gray-100 flex-shrink-0 flex flex-col h-full transition-all duration-300 overflow-y-auto",
      mobile ? "fixed inset-y-0 left-0 z-50 w-64 h-screen" : "hidden md:flex",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Area */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 backdrop-blur-sm bg-white/90 z-10">
        {!collapsed && (
          <h1 className="font-bold text-2xl tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-primary">
            SHIPBOAT<br />TRACKING
          </h1>
        )}
        {collapsed && (
          <span className="font-bold text-xl mx-auto bg-gradient-to-r from-blue-600 to-primary rounded-full p-2 text-white">🚢</span>
        )}
        
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
          {!collapsed && <h2 className="font-heading uppercase text-primary/60 font-bold pb-2 text-xs tracking-wider">NAVIGATION</h2>}
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
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-gray-700 hover:bg-gray-100/80",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center",
                      isPathActive(item.path) ? "text-primary" : "text-gray-500",
                      collapsed ? "mr-0" : "mr-3"
                    )}>{item.icon}</span>
                    {!collapsed && <span>{item.title}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-8">
          <div className="border-t border-primary/10 my-5 mx-6"></div>
          <div className="px-6 mb-2">
            {!collapsed && <h2 className="font-heading uppercase text-primary/60 font-bold pb-2 text-xs tracking-wider">PROFILE</h2>}
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
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-gray-700 hover:bg-gray-100/80",
                  collapsed && "justify-center px-2"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center",
                  isPathActive(item.path) ? "text-primary" : "text-gray-500",
                  collapsed ? "mr-0" : "mr-3"
                )}>{item.icon}</span>
                {!collapsed && <span>{item.title}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
