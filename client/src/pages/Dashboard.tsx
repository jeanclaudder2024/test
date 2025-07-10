import EnhancedUserDashboard from "@/components/dashboard/EnhancedUserDashboard";
import { TrialBanner } from "@/components/TrialBanner";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const subscription = useSubscription();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Please log in to access your dashboard</h1>
          <p className="text-muted-foreground">You need to be authenticated to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Trial Banner for non-admin users */}
      {user?.role !== 'admin' && subscription.hasTrialAccess && (
        <div className="mb-6">
          <TrialBanner />
        </div>
      )}
      
      {/* Enhanced User Dashboard */}
      <EnhancedUserDashboard />
    </div>
  );
}