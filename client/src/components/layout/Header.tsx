import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, LogOut, Download, Home, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "./Sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location, navigate] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Helper function to get page title based on the current location
  const getPageTitle = () => {
    if (location === "/") return t("nav.dashboard");
    if (location.startsWith("/vessels")) return t("nav.vessels");
    if (location.startsWith("/refineries")) return t("nav.refineries");
    if (location.startsWith("/documents")) return t("nav.documents");
    if (location.startsWith("/brokers")) return t("nav.brokers");
    if (location.startsWith("/profile")) return t("nav.profile");
    if (location.startsWith("/ai-assistant")) return t("nav.ai_assistant");
    if (location.startsWith("/trading")) return t("nav.trading");
    if (location.startsWith("/translation")) return "Translation";
    if (location.startsWith("/settings")) return t("nav.settings");
    return t("nav.dashboard");
  };

  return (
    <>
      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileSidebar}
          ></div>
          <Sidebar mobile onClose={closeMobileSidebar} />
        </>
      )}

      {/* App Header */}
      <header className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-gray-100 dark:border-orange-500/20 py-4 px-6 flex justify-between items-center h-40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2 hover:bg-orange-500/10"
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-5 w-5 text-orange-500" />
          </Button>
          
          <div className="hidden md:flex items-center mr-4">
            <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-36 w-auto" />
          </div>
          
          <h2 className="font-heading text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-400">{getPageTitle()}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex border border-orange-500/20 hover:bg-orange-500/10 text-orange-500 mr-2"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("action.view_home")}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex border border-orange-500/20 hover:bg-orange-500/10 text-orange-500"
          >
            <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("action.export")}
          </Button>
          
          {/* Translation Dropdown */}
          <div className="hidden sm:block relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex border border-orange-500/20 hover:bg-orange-500/10 text-orange-500 relative"
                >
                  <Globe className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  Translate
                  <ChevronDown className="h-3 w-3 ml-1" />
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[0.6rem] bg-orange-500 text-white rounded-full font-bold animate-pulse">
                    NEW
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/translation')}>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Translation Tool</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/translation?preset=english-to-arabic')}>
                  <span className="mr-2">🇬🇧→🇸🇦</span>
                  <span>English to Arabic</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/translation?preset=arabic-to-english')}>
                  <span className="mr-2">🇸🇦→🇬🇧</span>
                  <span>Arabic to English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/translation?preset=english-to-spanish')}>
                  <span className="mr-2">🇬🇧→🇪🇸</span>
                  <span>English to Spanish</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/translation?preset=english-to-french')}>
                  <span className="mr-2">🇬🇧→🇫🇷</span>
                  <span>English to French</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/translation?preset=english-to-chinese')}>
                  <span className="mr-2">🇬🇧→🇨🇳</span>
                  <span>English to Chinese</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/translation?preset=english-to-russian')}>
                  <span className="mr-2">🇬🇧→🇷🇺</span>
                  <span>English to Russian</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher variant="icon" />
          </div>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-orange-500/80 font-medium hidden sm:inline">{t("action.logout")}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              ) : (
                <LogOut className="h-4 w-4 text-orange-500" />
              )}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
