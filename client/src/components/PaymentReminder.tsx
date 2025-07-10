import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  Crown, 
  ArrowRight,
  CheckCircle,
  X
} from 'lucide-react';

interface PaymentReminderProps {
  trialDaysRemaining: number;
  isTrialExpired: boolean;
  planName: string;
  planPrice: string;
  onDismiss?: () => void;
}

export default function PaymentReminder({ 
  trialDaysRemaining, 
  isTrialExpired, 
  planName, 
  planPrice, 
  onDismiss 
}: PaymentReminderProps) {
  const [, setLocation] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);

  const handlePayNow = () => {
    setLocation('/pricing');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const trialProgress = Math.max(0, 100 - (trialDaysRemaining * 20)); // Assuming 5-day trial

  return (
    <Card className={`border-2 ${isTrialExpired ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'} mb-6`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isTrialExpired ? 'bg-red-500' : 'bg-orange-500'
            }`}>
              {isTrialExpired ? (
                <AlertTriangle className="w-6 h-6 text-white" />
              ) : (
                <Clock className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <CardTitle className={`text-lg ${isTrialExpired ? 'text-red-700' : 'text-orange-700'}`}>
                {isTrialExpired ? 'Trial Expired - Payment Required' : 'Trial Ending Soon'}
              </CardTitle>
              <p className={`text-sm ${isTrialExpired ? 'text-red-600' : 'text-orange-600'}`}>
                {isTrialExpired 
                  ? 'Your broker features have been suspended. Please upgrade to continue.' 
                  : `Your ${planName} trial expires in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!isTrialExpired && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Trial Progress</span>
              <span className="font-medium">{trialDaysRemaining} days remaining</span>
            </div>
            <Progress value={trialProgress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-semibold text-gray-800">{planName}</div>
              <div className="text-sm text-gray-600">Continue your membership</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{planPrice}</div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Continue broker dashboard access</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Professional document generation</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Deal management and tracking</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Priority customer support</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handlePayNow}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isTrialExpired ? 'Reactivate Membership' : 'Upgrade Now'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {!isTrialExpired && (
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              size="lg"
            >
              Remind Later
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Secure payment processing via Stripe • Cancel anytime • 30-day money-back guarantee
        </p>
      </CardContent>
    </Card>
  );
}