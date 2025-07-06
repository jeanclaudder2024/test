import { AlertTriangle, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  hasAccess: boolean;
  planName?: string;
  requiredPlan?: string;
  showUpgrade?: boolean;
  className?: string;
}

export function FeatureGate({
  children,
  feature,
  hasAccess,
  planName,
  requiredPlan = "Professional",
  showUpgrade = true,
  className = ""
}: FeatureGateProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-orange-300">
        <div className="text-center p-6 max-w-md">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
            <Crown className="w-8 h-8 text-orange-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Premium Feature
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            This feature requires a <Badge variant="secondary" className="mx-1">{requiredPlan}</Badge> 
            plan or higher to access.
          </p>
          
          {planName && (
            <p className="text-xs text-gray-500 mb-4">
              Current plan: <span className="font-medium">{planName}</span>
            </p>
          )}
          
          {showUpgrade && (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              onClick={() => window.location.href = '/plans'}
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface LimitReachedProps {
  title: string;
  description: string;
  current: number;
  limit: number;
  feature: string;
  showUpgrade?: boolean;
}

export function LimitReached({
  title,
  description,
  current,
  limit,
  feature,
  showUpgrade = true
}: LimitReachedProps) {
  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">{title}</AlertTitle>
      <AlertDescription className="text-yellow-700">
        <div className="space-y-2">
          <p>{description}</p>
          <div className="flex items-center gap-2">
            <div className="text-sm">
              <span className="font-medium">{current}</span> of <span className="font-medium">{limit}</span> used
            </div>
            <div className="flex-1 bg-yellow-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${Math.min((current / limit) * 100, 100)}%` }}
              />
            </div>
          </div>
          {showUpgrade && (
            <Button 
              size="sm" 
              variant="outline"
              className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              onClick={() => window.location.href = '/plans'}
            >
              Upgrade to Remove Limits
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface AccessDeniedProps {
  feature: string;
  reason?: string;
  action?: () => void;
  actionLabel?: string;
}

export function AccessDenied({
  feature,
  reason = "You don't have permission to access this feature.",
  action,
  actionLabel = "Contact Support"
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
        <Lock className="w-8 h-8 text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Access Denied
      </h3>
      
      <p className="text-sm text-gray-600 mb-4 max-w-md">
        {reason}
      </p>
      
      {action && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={action}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}