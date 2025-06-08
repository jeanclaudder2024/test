import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();

  // Only allow admin users to access admin routes
  if (!user || user.role !== 'admin') {
    return <NotFound />;
  }

  return <>{children}</>;
}