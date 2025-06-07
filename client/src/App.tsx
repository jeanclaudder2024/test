import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
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
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SubscriptionUpgrade from "@/pages/SubscriptionUpgrade";
import TradingDashboard from "@/pages/TradingDashboard";
import Companies from "@/pages/Companies";
import ApiTest from "@/pages/ApiTest";
import TranslationPage from "@/pages/TranslationPage";
import TrafficInsights from "@/pages/TrafficInsights";
import FixedFullPageMap from "@/pages/FixedFullPageMap";
import OilVesselMap from "@/pages/OilVesselMap";
import AdminPanel from "@/pages/AdminPanel";
import SubscriptionAdmin from "@/pages/SubscriptionAdmin";

import { useEffect } from "react";
import { apiRequest, queryClient } from "./lib/queryClient";
import { Layout } from "@/components/ui/layout";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { TranslationProvider } from "@/hooks/useTranslation.tsx";
import { ThemeProvider } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { QueryClientProvider } from "@tanstack/react-query";

// Component to handle authentication states and redirects
function AuthenticatedApp() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, show login/register pages or landing
  if (!isAuthenticated) {
    if (location === "/login") return <Login />;
    if (location === "/register") return <Register />;
    if (location === "/") return <LandingPage />;
    // For protected routes, redirect to login
    return <Login />;
  }

  return <AppRoutes />;
}

// App routes component
function AppRoutes() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/" component={BrokerDashboard} />
          <Route path="/broker-dashboard" component={BrokerDashboard} />
          <Route path="/vessels" component={Vessels} />
          <Route path="/vessels/:id/documents" component={VesselDocuments} />
          <Route path="/vessels/:id" component={VesselDetail} />
          <Route path="/refineries" component={Refineries} />
          <Route path="/refineries/:id" component={RefineryDetail} />
          <Route path="/ports" component={Ports} />
          <Route path="/ports/:id" component={PortDetail} />
          <Route path="/map" component={FixedFullPageMap} />
          <Route path="/oil-vessel-map" component={OilVesselMap} />
          <Route path="/brokers" component={Brokers} />
          <Route path="/companies" component={Companies} />
          <Route path="/documents" component={Documents} />
          <Route path="/ai-assistant" component={AIAssistantPage} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/subscriptions" component={SubscriptionAdmin} />
          <Route path="/trading" component={TradingDashboard} />
          <Route path="/translation" component={TranslationPage} />
          <Route path="/traffic-insights" component={TrafficInsights} />
          <Route path="/settings" component={Settings} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/upgrade" component={SubscriptionUpgrade} />
          <Route path="/account/subscription" component={AccountSubscription} />
          <Route path="/subscription/success" component={SubscriptionSuccess} />
          <Route path="/api-test" component={ApiTest} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </Layout>
  );
}

function Router() {
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

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system">
          <TranslationProvider>
            <Router />
            <Toaster />
          </TranslationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
