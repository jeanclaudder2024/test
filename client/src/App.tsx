import { Switch, Route, useLocation } from "wouter";
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
import Pricing from "@/pages/Pricing";
import AccountSubscription from "@/pages/AccountSubscription";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import TradingDashboard from "@/pages/TradingDashboard";
import LiveTracking from "@/pages/LiveTracking";
import Companies from "@/pages/Companies";
import ApiTest from "@/pages/ApiTest";
import { useEffect } from "react";
import { apiRequest, queryClient } from "./lib/queryClient";
import { Layout } from "@/components/ui/layout";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";

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

  // For landing page and auth page, don't use Layout (no sidebar/header)
  if (location === "/" || location === "/auth") {
    return (
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/auth" component={AuthPage} />
        </Switch>
      </AnimatePresence>
    );
  }

  // For app routes, use Layout with modern styling
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/vessels" component={Vessels} />
            <Route path="/vessels/:id" component={VesselDetail} />
            <Route path="/live-tracking" component={LiveTracking} />
            <Route path="/refineries" component={Refineries} />
            <Route path="/refineries/:id" component={RefineryDetail} />
            <Route path="/ports" component={Ports} />
            <Route path="/ports/import" component={PortImport} />
            <Route path="/ports/:id" component={PortDetail} />
            <Route path="/brokers" component={Brokers} />
            <Route path="/companies" component={Companies} />
            <Route path="/documents" component={Documents} />
            <Route path="/ai-assistant" component={AIAssistantPage} />
            <Route path="/trading" component={TradingDashboard} />
            <Route path="/settings" component={Settings} />
            <Route path="/subscribe" component={Subscribe} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/account/subscription" component={AccountSubscription} />
            <Route path="/subscription/success" component={SubscriptionSuccess} />
            <Route path="/api-test" component={ApiTest} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <Router />
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
