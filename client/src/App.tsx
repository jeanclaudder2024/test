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
import Brokers from "@/pages/Brokers";
import Documents from "@/pages/Documents";
import AIAssistantPage from "@/pages/AIAssistant";
import Settings from "@/pages/Settings";
import Subscribe from "@/pages/Subscribe";
import SubscriptionPlans from "@/pages/SubscriptionPlans";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboard from "@/pages/AdminDashboard";
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/use-auth";
import { FeatureFlagProvider } from "@/hooks/use-feature-access";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FeatureProtectedRoute } from "@/components/auth/FeatureProtectedRoute";

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

  // For landing page, auth page, and admin login, don't use MainLayout (no sidebar/header)
  if (location === "/" || location === "/auth" || location === "/admin") {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/admin" component={AdminLoginPage} />
      </Switch>
    );
  }

  // For app routes, use MainLayout with sidebar/header
  return (
    <MainLayout>
      <Switch>
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/vessels" component={Vessels} />
        <ProtectedRoute path="/vessels/:id" component={VesselDetail} />
        <ProtectedRoute path="/refineries" component={Refineries} />
        <ProtectedRoute path="/refineries/:id" component={RefineryDetail} />
        <ProtectedRoute path="/brokers" component={Brokers} />
        <FeatureProtectedRoute 
          path="/documents" 
          component={Documents} 
          featureName="document_generation"
        />
        <FeatureProtectedRoute 
          path="/ai-assistant" 
          component={AIAssistantPage} 
          featureName="ai_assistant"
        />
        <ProtectedRoute path="/settings" component={Settings} />
        <ProtectedRoute path="/subscribe" component={Subscribe} />
        <ProtectedRoute path="/subscription-plans" component={SubscriptionPlans} />
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly={true} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FeatureFlagProvider>
          <Router />
          <Toaster />
        </FeatureFlagProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
