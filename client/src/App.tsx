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
import Documents from "@/pages/Documents";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import Companies from "@/pages/Companies";
import FixedFullPageMap from "@/pages/FixedFullPageMap";
import AdminPanel from "@/pages/AdminPanel";
// Maritime tracking and vessel lookup pages removed as requested
import { useEffect } from "react";
import { apiRequest, queryClient } from "./lib/queryClient";
import { Layout } from "@/components/ui/layout";
import { AuthProvider, useProfessionalAuth } from "@/hooks/use-professional-auth";
import { LanguageProvider } from "@/hooks/use-language";
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

  // If user is logged in, redirect to vessels page
  if (user) {
    return <Redirect to="/vessels" />;
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

  // For landing page and auth page, don't use Layout (no sidebar/header)
  if (location === "/" || location === "/auth") {
    return (
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/">
            <LandingPageRedirect />
          </Route>
          <Route path="/auth">
            <AuthWrapper />
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
            <Route path="/vessels" component={Vessels} />
            <Route path="/vessels/:id/documents" component={VesselDocuments} />
            <Route path="/vessels/:id" component={VesselDetail} />
            <Route path="/refineries" component={Refineries} />
            <Route path="/refineries/:id" component={RefineryDetail} />
            <Route path="/ports" component={Ports} />
            <Route path="/ports/:id" component={PortDetail} />
            <Route path="/brokers" component={Brokers} />
            <Route path="/companies" component={Companies} />
            <Route path="/documents" component={Documents} />
            <Route path="/admin" component={AdminPanel} />
            <Route path="/map" component={FixedFullPageMap} />
            <Route path="/settings" component={Settings} />
            <Route path="/pricing" component={Pricing} />
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
