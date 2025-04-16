import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, LogOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";

export default function Header() {
  const [location] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
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
      <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-heading text-xl text-gray-800">{getPageTitle()}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="secondary" 
            size="sm" 
            className="hidden sm:flex bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-700 hidden sm:inline">Log Out</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-200">
              <LogOut className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
