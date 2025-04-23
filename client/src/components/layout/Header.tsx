import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, LogOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "./Sidebar";

export default function Header() {
  const [location, navigate] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { logoutMutation } = useAuth();
  const { toast } = useToast();

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
    if (location === "/") return "Dashboard";
    if (location.startsWith("/vessels")) return "Vessels";
    if (location.startsWith("/refineries")) return "Refineries";
    if (location.startsWith("/documents")) return "Documents";
    if (location.startsWith("/brokers")) return "Brokers";
    if (location.startsWith("/profile")) return "Profile";
    if (location.startsWith("/ai-assistant")) return "AI Assistant";
    return "Dashboard";
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
      <header className="backdrop-blur-sm bg-white/80 border-b border-gray-100 py-3 px-6 flex justify-between items-center">
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
            className="hidden sm:flex border border-primary/20 hover:bg-primary/10 text-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-primary/80 font-medium hidden sm:inline">Log Out</span>
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
