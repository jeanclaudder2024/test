import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AdminRoute from "@/components/AdminRoute";
import Vessels from "@/pages/Vessels";
import VesselDetail from "@/pages/VesselDetail";
import VesselDocuments from "@/pages/VesselDocuments";
import Refineries from "@/pages/Refineries";
import RefineryDetail from "@/pages/RefineryDetail";
import Ports from "@/pages/Ports";
import PortDetail from "@/pages/PortDetail";
import Brokers from "@/pages/Brokers";
import BrokerDashboard from "@/pages/BrokerDashboard";


import AIAssistantPage from "@/pages/AIAssistant";
import Settings from "@/pages/Settings";
import Subscribe from "@/pages/Subscribe";
import Pricing from "@/pages/Pricing";
import AccountSubscription from "@/pages/AccountSubscription";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionPlansPage from "@/pages/SubscriptionPlansPage";
import AccountPage from "@/pages/AccountPage";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import TrialExpired from "@/pages/TrialExpired";
import SubscriptionUpgrade from "@/pages/SubscriptionUpgrade";
import TradingDashboard from "@/pages/TradingDashboard";
import Companies from "@/pages/Companies";
import Deals from "@/pages/Deals";
import ApiTest from "@/pages/ApiTest";
import TranslationPage from "@/pages/TranslationPage";
import TrafficInsights from "@/pages/TrafficInsights";
import FixedFullPageMap from "@/pages/FixedFullPageMap";
import AdvancedMaritimeMap from "@/pages/AdvancedMaritimeMap";
import OilVesselMap from "@/pages/OilVesselMap";
import AdminPanel from "@/pages/AdminPanel";
import SubscriptionAdmin from "@/pages/SubscriptionAdmin";
import AdminDocumentsSimple from "@/pages/AdminDocumentsSimple";

import LandingPageManager from "@/pages/LandingPageManager";

import { useEffect } from "react";
import { apiRequest, queryClient } from "./lib/queryClient";
import { MobileLayout } from "@/components/ui/mobile-layout";

import { useAuth } from "@/hooks/useAuth";
import { TranslationProvider } from "@/hooks/useTranslation.tsx";
import { ThemeProvider } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";

// Protected routes that require authentication
function ProtectedRoutes() {
  return (
    <MobileLayout>
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/" component={Companies} />
          <Route path="/dashboard" component={Companies} />
          <Route path="/broker-dashboard" component={BrokerDashboard} />
          <Route path="/vessels" component={Vessels} />
          <Route path="/vessels/:id/documents" component={VesselDocuments} />
          <Route path="/vessels/:id" component={VesselDetail} />
          <Route path="/refineries" component={Refineries} />
          <Route path="/refineries/:id" component={RefineryDetail} />
          <Route path="/ports" component={Ports} />
          <Route path="/ports/:id" component={PortDetail} />
          <Route path="/map" component={AdvancedMaritimeMap} />
          <Route path="/oil-vessel-map" component={OilVesselMap} />
          <Route path="/brokers" component={Brokers} />
          <Route path="/companies" component={Companies} />
          <Route path="/deals" component={Deals} />

          <Route path="/ai-assistant" component={AIAssistantPage} />
          <Route path="/admin">
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          </Route>
          <Route path="/admin/subscriptions">
            <AdminRoute>
              <SubscriptionAdmin />
            </AdminRoute>
          </Route>

          <Route path="/admin/landing-page">
            <AdminRoute>
              <LandingPageManager />
            </AdminRoute>
          </Route>
          <Route path="/trading" component={TradingDashboard} />
          <Route path="/translation" component={TranslationPage} />
          <Route path="/traffic-insights" component={TrafficInsights} />
          <Route path="/settings" component={Settings} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/plans" component={SubscriptionPlansPage} />
          <Route path="/account" component={AccountPage} />
          <Route path="/upgrade" component={SubscriptionUpgrade} />
          <Route path="/account/subscription" component={AccountSubscription} />
          <Route path="/subscription/success" component={SubscriptionSuccess} />
          <Route path="/api-test" component={ApiTest} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </MobileLayout>
  );
}

function AuthenticatedApp() {
  const { user, isLoading, trialExpired } = useAuth();
  const [location] = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading PetroDealHub...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show public pages or auth pages
  if (!user) {
    if (location === "/login") return <Login />;
    if (location === "/register") return <Register />;
    if (location === "/") return <LandingPage />;
    // Redirect to login for protected routes
    return <Login />;
  }

  // If trial is expired, show trial expired page
  if (trialExpired) {
    return <TrialExpired />;
  }

  // User is authenticated and trial is valid, show protected routes
  return <ProtectedRoutes />;
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
      <ThemeProvider defaultTheme="system">
        <TranslationProvider>
          <Router />
          <Toaster />
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
