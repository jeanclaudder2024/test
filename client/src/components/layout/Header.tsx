import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, LogOut, Download, Home } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "./Sidebar";

export default function Header() {
  const [location, navigate] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/');
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
      <header className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 py-3 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2 hover:bg-primary/10"
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-heading text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">{getPageTitle()}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex border border-primary/20 hover:bg-primary/10 text-primary mr-2"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("action.view_home")}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex border border-primary/20 hover:bg-primary/10 text-primary"
          >
            <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("action.export")}
          </Button>
          
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher variant="icon" />
          </div>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-primary/80 font-medium hidden sm:inline">{t("action.logout")}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <LogOut className="h-4 w-4 text-primary" />
              )}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
