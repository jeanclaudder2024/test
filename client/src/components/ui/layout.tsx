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
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShipBoatAssistant } from "@/components/ShipBoatAssistant";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  const handleRefreshData = () => {
    // Refresh data logic
    console.log("Refreshing data...");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content - Full width */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Simplified Header */}
        <header className="h-14 border-b border-border bg-background/90 backdrop-blur-sm flex items-center px-4 z-10 fixed w-full">
          <div className="flex items-center w-full">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <Ship className="h-6 w-6 text-primary" />
              <span className="font-medium">OilVesselTracker</span>
            </Link>
            
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleRefreshData}>
                <RefreshCw className="h-4.5 w-4.5" />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? (
                  <Sun className="h-4.5 w-4.5" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )}
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content Area - Full screen for map */}
        <main className="flex-1 pt-14">
          {children}
        </main>
      </div>
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