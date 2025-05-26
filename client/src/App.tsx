import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import BrokerDashboard from "@/pages/BrokerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import LandingPage from "@/pages/LandingPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      },
    },
  },
});

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.username === 'admin' || user?.email?.includes('admin');
  const dashboardRoute = isAdmin ? '/admin-dashboard' : '/broker-dashboard';

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to={dashboardRoute} /> : <Login />}
      </Route>
      
      <Route path="/admin-dashboard">
        {isAuthenticated && isAdmin ? <AdminDashboard /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/broker-dashboard">
        {isAuthenticated ? <BrokerDashboard /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/">
        {isAuthenticated ? <Redirect to={dashboardRoute} /> : <LandingPage />}
      </Route>
      
      <Route path="*">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}