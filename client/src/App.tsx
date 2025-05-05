import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Vessels from "@/pages/Vessels";
import VesselDetail from "@/pages/VesselDetail";
import Refineries from "@/pages/Refineries";
import RefineryDetail from "@/pages/RefineryDetail";
import Ports from "@/pages/Ports";
import PortDetail from "@/pages/PortDetail";
import PortImport from "@/pages/PortImport";
import Brokers from "@/pages/Brokers";
import Documents from "@/pages/Documents";
import AIAssistantPage from "@/pages/AIAssistant";
import Settings from "@/pages/Settings";
import Subscribe from "@/pages/Subscribe";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import TradingDashboard from "@/pages/TradingDashboard";
import LiveTracking from "@/pages/LiveTracking";
import Companies from "@/pages/Companies";
import ApiTest from "@/pages/ApiTest";
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function Router() {
  const [location] = useLocation();
  
  // Seed data on development
  useEffect(() => {
    const seedData = async () => {
      if (process.env.NODE_ENV === "development") {
        try {
          await apiRequest("/api/seed", { method: "POST" });
          console.log("Data seeded successfully");
        } catch (error) {
          console.error("Error seeding data:", error);
        }
      }
    };
    
    seedData();
  }, []);

  // For landing page and auth page, don't use MainLayout (no sidebar/header)
  if (location === "/" || location === "/auth") {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
      </Switch>
    );
  }

  // For app routes, use MainLayout with sidebar/header
  return (
    <MainLayout>
      <Switch>
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/vessels" component={Vessels} />
        <ProtectedRoute path="/vessels/:id" component={VesselDetail} />
        <ProtectedRoute path="/tracking" component={LiveTracking} />
        <ProtectedRoute path="/refineries" component={Refineries} />
        <ProtectedRoute path="/refineries/:id" component={RefineryDetail} />
        <ProtectedRoute path="/ports" component={Ports} />
        <ProtectedRoute path="/ports/import" component={PortImport} />
        <ProtectedRoute path="/ports/:id" component={PortDetail} />
        <ProtectedRoute path="/brokers" component={Brokers} />
        <ProtectedRoute path="/documents" component={Documents} />
        <ProtectedRoute path="/ai-assistant" component={AIAssistantPage} />
        <ProtectedRoute path="/trading" component={TradingDashboard} />
        <ProtectedRoute path="/settings" component={Settings} />
        <ProtectedRoute path="/subscribe" component={Subscribe} />
        <Route path="/api-test" component={ApiTest} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router />
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
