import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Star, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export function TrialBanner() {
  const { hasTrialAccess, trialDaysRemaining, isTrialExpired } = useSubscription();

  if (!hasTrialAccess && !isTrialExpired) {
    return null;
  }

  if (isTrialExpired) {
    return (
      <Alert className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 mb-6">
        <Clock className="h-4 w-4 text-orange-500" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-white">
            Your 5-day trial has expired. Upgrade now to continue accessing all features.
          </span>
          <Link href="/pricing">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              Upgrade Now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-gradient-to-r from-blue-500/20 to-green-500/20 border-blue-500/30 mb-6">
      <Star className="h-4 w-4 text-blue-400" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-white">
          🎉 You're on a 5-day free trial! {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining.
        </span>
        <Link href="/pricing">
          <Button size="sm" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
            View Plans
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}