import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
// Dashboard page removed as requested
import Vessels from "@/pages/Vessels";
import VesselDetail from "@/pages/VesselDetail";
import VesselDocuments from "@/pages/VesselDocuments";
import Refineries from "@/pages/Refineries";
import RefineryDetail from "@/pages/RefineryDetail";
import Ports from "@/pages/Ports";
import PortDetail from "@/pages/PortDetail";
import Brokers from "@/pages/Brokers";
import BrokerDashboard from "@/pages/BrokerDashboard";
import Documents from "@/pages/Documents";
import AIAssistantPage from "@/pages/AIAssistant";
import Settings from "@/pages/Settings";
import Subscribe from "@/pages/Subscribe";
import Pricing from "@/pages/Pricing";
import AccountSubscription from "@/pages/AccountSubscription";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import TradingDashboard from "@/pages/TradingDashboard";
import Companies from "@/pages/Companies";

import ApiTest from "@/pages/ApiTest";
import TranslationPage from "@/pages/TranslationPage";
import TrafficInsights from "@/pages/TrafficInsights";
import FixedFullPageMap from "@/pages/FixedFullPageMap";
import OilVesselMap from "@/pages/OilVesselMap";
import AdminPanel from "@/pages/AdminPanel";
import SubscriptionAdmin from "@/pages/SubscriptionAdmin";

// Maritime tracking and vessel lookup pages removed as requested
import { useEffect } from "react";
import { apiRequest, queryClient } from "./lib/queryClient";
import { Layout } from "@/components/ui/layout";
import { AuthProvider, useProfessionalAuth } from "@/hooks/use-professional-auth";
import { TranslationProvider } from "@/hooks/useTranslation.tsx";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { QueryClientProvider } from "@tanstack/react-query";

// Auth Wrapper Component
function AuthWrapper() {
  return <AuthPage />;
}

// Component to check auth status and redirect if logged in
function LandingPageRedirect() {
  const { user, isLoading } = useProfessionalAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, redirect to broker dashboard
  if (user) {
    return <Redirect to="/broker-dashboard" />;
  }

  // Otherwise show landing page
  return <LandingPage />;
}

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

  // For landing page and auth pages, don't use Layout (no sidebar/header)
  if (location === "/" || location === "/auth" || location === "/login" || location === "/register") {
    return (
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/">
            <LandingPageRedirect />
          </Route>
          <Route path="/auth">
            <AuthWrapper />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
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
            {/* Dashboard page removed as requested */}
            <Route path="/vessels" component={Vessels} />
            <Route path="/vessels/:id/documents" component={VesselDocuments} />
            <Route path="/vessels/:id" component={VesselDetail} />
            {/* Vessel dashboard page removed as requested */}
            {/* Maritime tracking and vessel lookup pages removed as requested */}
            <Route path="/refineries" component={Refineries} />
            <Route path="/refineries/:id" component={RefineryDetail} />
            <Route path="/ports" component={Ports} />
            <Route path="/ports/:id" component={PortDetail} />
            <Route path="/brokers" component={Brokers} />
            <Route path="/broker-dashboard" component={BrokerDashboard} />
            <Route path="/companies" component={Companies} />

            <Route path="/documents" component={Documents} />
            <Route path="/ai-assistant" component={AIAssistantPage} />
            <Route path="/admin" component={AdminPanel} />
            <Route path="/admin/subscriptions" component={SubscriptionAdmin} />

            <Route path="/trading" component={TradingDashboard} />
            <Route path="/translation" component={TranslationPage} />
            <Route path="/traffic-insights" component={TrafficInsights} />
            <Route path="/map" component={FixedFullPageMap} />
            <Route path="/oil-vessel-map" component={OilVesselMap} />
            {/* Maritime tracking and vessel lookup pages removed as requested */}
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <TranslationProvider>
            <Router />
            <Toaster />
          </TranslationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
