import { Switch, Route } from "wouter";
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
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";
import MainLayout from "@/components/layout/MainLayout";

function Router() {
  // Seed data on development
  useEffect(() => {
    const seedData = async () => {
      if (process.env.NODE_ENV === "development") {
        try {
          await apiRequest("POST", "/api/seed", {});
          console.log("Data seeded successfully");
        } catch (error) {
          console.error("Error seeding data:", error);
        }
      }
    };
    
    seedData();
  }, []);

  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/vessels" component={Vessels} />
        <Route path="/vessels/:id" component={VesselDetail} />
        <Route path="/refineries" component={Refineries} />
        <Route path="/refineries/:id" component={RefineryDetail} />
        <Route path="/brokers" component={Brokers} />
        <Route path="/documents" component={Documents} />
        <Route path="/ai-assistant" component={AIAssistantPage} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
