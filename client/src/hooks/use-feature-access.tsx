import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

type FeatureFlag = {
  id: number;
  featureName: string;
  description: string | null;
  isEnabled: boolean;
  requiredSubscription: string | null;
};

type FeatureFlagContextType = {
  isLoading: boolean;
  hasAccess: (featureName: string) => boolean;
  getFeatureFlag: (featureName: string) => FeatureFlag | undefined;
  allFlags: FeatureFlag[];
};

export const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  
  const { data: flags, isLoading } = useQuery({
    queryKey: ["/api/subscription/feature-flags"],
    enabled: true, // We want to load feature flags for all users
  });
  
  useEffect(() => {
    if (flags && Array.isArray(flags)) {
      setFeatureFlags(flags as FeatureFlag[]);
    }
  }, [flags]);
  
  // Determine if a user has access to a specific feature
  const hasAccess = (featureName: string): boolean => {
    // If flags are still loading, default to no access
    if (isLoading || !featureFlags.length) return false;
    
    // Find the flag for this feature
    const flag = featureFlags.find(f => f.featureName === featureName);
    
    // If flag doesn't exist or is disabled, no access
    if (!flag || !flag.isEnabled) return false;
    
    // If feature doesn't require subscription, everyone has access
    if (!flag.requiredSubscription) return true;
    
    // If no user is logged in, no access to subscription-restricted features
    if (!user) return false;
    
    // If user's subscription tier meets the requirement, grant access
    const userTier = user.subscriptionTier || 'free';
    
    // Simple tier hierarchy: Premium > Standard > Free
    if (userTier === 'Premium') return true;
    if (userTier === 'Standard' && flag.requiredSubscription !== 'Premium') return true;
    if (userTier === 'Free' && !flag.requiredSubscription) return true;
    
    return false;
  };
  
  const getFeatureFlag = (featureName: string): FeatureFlag | undefined => {
    return featureFlags.find(f => f.featureName === featureName);
  };
  
  return (
    <FeatureFlagContext.Provider
      value={{
        isLoading,
        hasAccess,
        getFeatureFlag,
        allFlags: featureFlags
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureAccess() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error("useFeatureAccess must be used within a FeatureFlagProvider");
  }
  return context;
}