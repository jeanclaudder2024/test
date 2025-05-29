import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

// Import authentication pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Import main app pages
import NotFound from "@/pages/not-found";
import Vessels from "@/pages/VesselsNew";
import VesselDetail from "@/pages/VesselDetailNew";
import VesselDocuments from "@/pages/VesselDocuments";
import Refineries from "@/pages/Refineries";
import RefineryDetail from "@/pages/RefineryDetail";
import Brokers from "@/pages/Brokers";
import SimpleBrokerDashboard from "@/pages/SimpleBrokerDashboard";
import Documents from "@/pages/Documents";
import AIAssistantPage from "@/pages/AIAssistant";
import Settings from "@/pages/Settings";
import Subscribe from "@/pages/Subscribe";
import Pricing from "@/pages/Pricing";
import AccountSubscription from "@/pages/AccountSubscription";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import TradingDashboard from "@/pages/TradingDashboard";
import Companies from "@/pages/Companies";
import ApiTest from "@/pages/ApiTest";
import TranslationPage from "@/pages/TranslationPage";
import TrafficInsights from "@/pages/TrafficInsights";
import WorkingMap from "@/pages/WorkingMap";
import OilVesselMap from "@/pages/OilVesselMap";
import AdminPanel from "@/pages/AdminPanel";
import PortsPage from "@/pages/PortsPage";
import SubscriptionAdmin from "@/pages/SubscriptionAdmin";
import { Layout } from "@/components/ui/layout";

// Clean Auth Wrapper Component - No Email Verification
function CleanAuthWrapper() {
  return <CleanAuthPage />;
}

// Component to check auth status and redirect if logged in
function AuthenticatedRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not logged in, show login page
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={Login} />
        <Route component={() => <Redirect to="/login" />} />
      </Switch>
    );
  }

  // If user is logged in, show the main app
  return <MainAppRouter />;
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

  // For landing page and auth page, don't use Layout (no sidebar/header)
  if (location === "/" || location === "/auth") {
    return (
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/">
            <LandingPageRedirect />
          </Route>
          <Route path="/auth">
            <CleanAuthWrapper />
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
            <Route path="/ports" component={PortsPage} />

            <Route path="/brokers" component={Brokers} />
            <Route path="/broker-dashboard" component={SimpleBrokerDashboard} />
            <Route path="/companies" component={Companies} />
            <Route path="/documents" component={Documents} />
            <Route path="/ai-assistant" component={AIAssistantPage} />
            <Route path="/admin" component={AdminPanel} />
            <Route path="/admin/subscriptions" component={SubscriptionAdmin} />
            <Route path="/trading" component={TradingDashboard} />
            <Route path="/translation" component={TranslationPage} />
            <Route path="/traffic-insights" component={TrafficInsights} />
            <Route path="/map" component={WorkingMap} />
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
          <LanguageProvider>
            <Router />
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
