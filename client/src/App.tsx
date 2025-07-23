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
import BrokerUpgrade from "@/pages/BrokerUpgrade";
import BrokerPayment from "@/pages/BrokerPayment";
import BrokerPaymentSuccess from "@/pages/BrokerPaymentSuccess";
import BrokerLocked from "@/pages/BrokerLocked";
import BrokerMembershipInfo from "@/pages/BrokerMembershipInfo";
import BrokerCardApplication from "@/pages/BrokerCardApplication";
import BrokerRoute from "@/components/BrokerRoute";
import OilPrices from "@/pages/OilPrices";


import AIAssistantPage from "@/pages/AIAssistant";
import Settings from "@/pages/Settings";
import Subscribe from "@/pages/Subscribe";
import Pricing from "@/pages/Pricing";
import AccountSubscription from "@/pages/AccountSubscription";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionPlansPage from "@/pages/SubscriptionPlansPage";
import AccountPage from "@/pages/AccountPage";
import Account from "@/pages/Account";
import UserProfile from "@/pages/UserProfile";
import LandingPage from "@/pages/LandingPage";
import About from "@/pages/About";
import Careers from "@/pages/Careers";
import Blog from "@/pages/Blog";
import ApiIntegration from "@/pages/ApiIntegration";
import ContactUs from "@/pages/ContactUs";
import SupportCenter from "@/pages/SupportCenter";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import DocumentationCenter from "@/pages/DocumentationCenter";
import BecomeABroker from "@/pages/BecomeABroker";
import PortsAccess from "@/pages/PortsAccess";
import RefineriesAccess from "@/pages/RefineriesAccess";
import FutureTradingPage from "@/pages/FutureTradingPage";
import VesselsTracking from "@/pages/VesselsTracking";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthCallback from "@/pages/AuthCallback";
import VerifyEmail from "@/pages/VerifyEmail";
import TrialExpired from "@/pages/TrialExpired";
import SubscriptionUpgrade from "@/pages/SubscriptionUpgrade";
import TradingDashboard from "@/pages/TradingDashboard";
import Companies from "@/pages/Companies";
import ApiTest from "@/pages/ApiTest";
import TranslationPage from "@/pages/TranslationPage";
import TrafficInsights from "@/pages/TrafficInsights";
import FixedFullPageMap from "@/pages/FixedFullPageMap";
import AdvancedMaritimeMap from "@/pages/AdvancedMaritimeMap";
import OilVesselMap from "@/pages/OilVesselMap";
import AdminPanel from "@/pages/AdminPanel";
import SubscriptionAdmin from "@/pages/SubscriptionAdmin";
import AdminDocumentsSimple from "@/pages/AdminDocumentsSimple";
import PDFTestPage from "@/pages/PDFTestPage";

import LandingPageManager from "@/pages/LandingPageManager";

import { useEffect } from "react";
import EnhancedMembershipCardRequest from "@/pages/EnhancedMembershipCardRequest";
import { apiRequest, queryClient } from "./lib/queryClient";
import { MobileLayout } from "@/components/ui/mobile-layout";

import { useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/use-language";
import { ThemeProvider } from "@/hooks/use-theme";
// Removed AnimatePresence to fix React suspension errors
import { QueryClientProvider } from "@tanstack/react-query";

// Protected routes that require authentication
function ProtectedRoutes() {
  return (
    <MobileLayout>
      <Switch>
          <Route path="/" component={Companies} />
          <Route path="/dashboard" component={Companies} />
          <Route path="/broker-dashboard">
            <BrokerRoute>
              <BrokerDashboard />
            </BrokerRoute>
          </Route>
          <Route path="/broker-locked" component={BrokerLocked} />
          <Route path="/broker-payment" component={BrokerPayment} />
          <Route path="/broker-membership-info" component={BrokerMembershipInfo} />
          <Route path="/membership-card-request" component={EnhancedMembershipCardRequest} />
          <Route path="/broker-card-application" component={BrokerCardApplication} />
          <Route path="/broker-upgrade" component={BrokerUpgrade} />
          <Route path="/broker-payment-success" component={BrokerPaymentSuccess} />
          <Route path="/oil-prices" component={OilPrices} />
          <Route path="/vessels" component={Vessels} />
          <Route path="/vessels/:id/documents" component={VesselDocuments} />
          <Route path="/vessels/:id" component={VesselDetail} />
          <Route path="/refineries" component={Refineries} />
          <Route path="/refineries/:id" component={RefineryDetail} />
          <Route path="/ports" component={Ports} />
          <Route path="/ports/:id" component={PortDetail} />
          <Route path="/map" component={AdvancedMaritimeMap} />
          <Route path="/oil-vessel-map" component={OilVesselMap} />
          <Route path="/pdf-test" component={PDFTestPage} />

          <Route path="/companies" component={Companies} />

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
          <Route path="/account" component={Account} />
          <Route path="/profile" component={UserProfile} />
          <Route path="/upgrade" component={SubscriptionUpgrade} />
          <Route path="/account/subscription" component={AccountSubscription} />
          <Route path="/subscription/success" component={SubscriptionSuccess} />
          <Route path="/api-test" component={ApiTest} />
          <Route component={NotFound} />
        </Switch>
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
    if (location === "/auth/callback") return <AuthCallback />;
    if (location === "/verify-email") return <VerifyEmail />;
    if (location === "/subscription/success") return <SubscriptionSuccess />;
    if (location === "/about") return <About />;
    if (location === "/careers") return <Careers />;
    if (location === "/blog") return <Blog />;
    if (location === "/api-integration") return <ApiIntegration />;
    if (location === "/contact") return <ContactUs />;
    if (location === "/support-center") return <SupportCenter />;
    if (location === "/terms-of-service") return <TermsOfService />;
    if (location === "/privacy-policy") return <PrivacyPolicy />;
    if (location === "/cookie-policy") return <CookiePolicy />;
    if (location === "/documentation") return <DocumentationCenter />;
    if (location === "/become-broker") return <BecomeABroker />;
    if (location === "/ports-access") return <PortsAccess />;
    if (location === "/refineries-access") return <RefineriesAccess />;
    if (location === "/future-trading") return <FutureTradingPage />;
    if (location === "/vessels-tracking") return <VesselsTracking />;
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
          await apiRequest("POST", "/api/seed");
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
        <LanguageProvider>
          <Router />
          <Toaster />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
