import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

// Define feature flag type
interface FeatureFlag {
  id: number;
  featureName: string;
  description: string | null;
  isEnabled: boolean;
  requiredSubscription: string | null;
}

interface FeatureFlagContextType {
  hasAccess: (featureName: string) => boolean;
  isLoading: boolean;
  error: Error | null;
  featureFlags: FeatureFlag[];
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Fetch feature flags
  const { data: featureFlags = [], isLoading, error } = useQuery({
    queryKey: ['/api/feature-flags'],
    queryFn: async () => {
      const res = await apiRequest({ url: '/api/feature-flags' });
      return await res.json() as FeatureFlag[];
    },
    // Don't refetch too often
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check if a user has access to a feature
  const hasAccess = (featureName: string): boolean => {
    // If not authenticated, no access
    if (!user) return false;
    
    // Find the feature flag
    const flag = featureFlags.find(f => f.featureName === featureName);
    
    // If flag doesn't exist or is disabled, no access
    if (!flag || !flag.isEnabled) return false;
    
    // If no specific subscription required, all users have access
    if (!flag.requiredSubscription) return true;
    
    // If user isn't subscribed, no access to subscription features
    if (!user.isSubscribed) return false;
    
    // Check if user's subscription tier matches the required tier
    // Free tier can only access free features
    if (user.subscriptionTier === 'free' && flag.requiredSubscription !== 'free') {
      return false;
    }
    
    // Basic tier can access free and basic features
    if (user.subscriptionTier === 'basic' && 
        !['free', 'basic'].includes(flag.requiredSubscription)) {
      return false;
    }
    
    // Premium/Elite tier can access everything
    if (['premium', 'elite'].includes(user.subscriptionTier || '')) {
      return true;
    }
    
    // If subscriptionTier exactly matches requiredSubscription
    return user.subscriptionTier === flag.requiredSubscription;
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        hasAccess,
        isLoading,
        error,
        featureFlags,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureAccess() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureAccess must be used within a FeatureFlagProvider');
  }
  return context;
}

// Usage example:
// const { hasAccess } = useFeatureAccess();
// if (hasAccess('premium-reports')) { ... }