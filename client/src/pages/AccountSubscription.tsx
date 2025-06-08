import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Clock, CreditCard, Calendar, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Subscription = {
  id: number;
  userId: number;
  planId: number;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  interval: 'month' | 'year';
  billingInterval?: 'month' | 'year';
  stripeCustomerId?: string;
  plan?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    monthlyPrice: string;
    yearlyPrice: string;
    currency: string;
    features: string;
    isPopular: boolean;
    trialDays: number;
  };
};

type PaymentMethod = {
  id: number;
  userId: number;
  stripePaymentMethodId: string;
  type: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  brand: string;
  isDefault: boolean;
};

type Invoice = {
  id: number;
  userId: number;
  stripeInvoiceId: string;
  stripeSubscriptionId: string;
  amount: string;
  currency: string;
  status: string;
  paidAt: string | null;
  invoiceUrl: string | null;
  invoicePdf: string | null;
};

export default function AccountSubscription() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth?redirect=/account/subscription');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch subscription data
  const { 
    data: subscriptionData, 
    isLoading: subscriptionLoading, 
    error: subscriptionError 
  } = useQuery({
    queryKey: ['/api/subscriptions/current'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/subscriptions/current');
      } catch (error) {
        throw new Error('Failed to fetch subscription');
      }
    },
    enabled: isAuthenticated,
  });

  // Fetch payment methods
  const { 
    data: paymentMethods, 
    isLoading: paymentMethodsLoading,
  } = useQuery({
    queryKey: ['/api/subscriptions/payment-methods'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/subscriptions/payment-methods');
      } catch (error) {
        throw new Error('Failed to fetch payment methods');
      }
    },
    enabled: isAuthenticated && subscriptionData?.active,
  });

  // Fetch invoices
  const { 
    data: invoices, 
    isLoading: invoicesLoading,
  } = useQuery({
    queryKey: ['/api/subscriptions/invoices'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/subscriptions/invoices');
      } catch (error) {
        throw new Error('Failed to fetch invoices');
      }
    },
    enabled: isAuthenticated && subscriptionData?.active,
  });

  // Mutation for cancelling subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscriptions/cancel-subscription');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will be active until the end of the current billing period.",
        variant: "default",
      });
      setCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/current'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  });

  // Mutation for creating portal session
  const createPortalSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscriptions/create-portal-session');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create portal session');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to access billing portal",
        variant: "destructive",
      });
    }
  });

  // Handle subscription cancellation
  const handleCancelSubscription = () => {
    cancelSubscriptionMutation.mutate();
  };

  // Handle portal session creation
  const handleManageBilling = () => {
    createPortalSessionMutation.mutate();
  };

  // Format date display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Format currency display
  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      return `$${amount}`;
    }

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return formatter.format(numAmount);
  };

  // Get subscription status badge
  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          Cancelling
        </Badge>
      );
    }

    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'past_due':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Past Due
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
            Cancelled
          </Badge>
        );
      case 'trialing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Trial
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  if (authLoading) {
    return (
      <div className="container max-w-4xl py-12 mx-auto">
        <Skeleton className="w-[180px] h-[32px] mb-6" />
        <div className="space-y-6">
          <Skeleton className="w-full h-[200px]" />
          <Skeleton className="w-full h-[300px]" />
        </div>
      </div>
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="container max-w-4xl py-12 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
        <div className="space-y-6">
          <Skeleton className="w-full h-[200px]" />
          <Skeleton className="w-full h-[300px]" />
        </div>
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className="container max-w-4xl py-12 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {subscriptionError instanceof Error ? subscriptionError.message : "An error occurred while loading your subscription."}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // If no active subscription
  if (!subscriptionData?.active) {
    return (
      <div className="container max-w-4xl py-12 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription. Subscribe to access premium features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our subscription plans offer a range of features including advanced vessel tracking, real-time updates, and premium data access.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/pricing')}>View Pricing Plans</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const subscription = subscriptionData.subscription as Subscription;
  const billingInterval = subscription?.interval || 'month';
  const plan = subscription?.plan;
  const price = billingInterval === 'month' ? plan?.monthlyPrice : plan?.yearlyPrice;
  const defaultPaymentMethod = paymentMethods?.find(pm => pm.isDefault);
  const sortedInvoices = invoices?.sort((a, b) => {
    return new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime();
  });

  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
      
      <div className="space-y-6">
        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{plan?.name} Plan</CardTitle>
                <CardDescription className="mt-1">
                  {plan?.description}
                </CardDescription>
              </div>
              {getStatusBadge(subscription.status, subscription.cancelAtPeriodEnd)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">
                    {formatCurrency(price || '0', plan?.currency || 'USD')}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    /{subscription.interval}
                  </span>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-amber-600 text-sm mt-1">
                    Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Current period: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}</span>
                </div>
                
                {defaultPaymentMethod && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span>
                      {defaultPaymentMethod.brand.charAt(0).toUpperCase() + defaultPaymentMethod.brand.slice(1)} 
                      ending in {defaultPaymentMethod.last4} (expires {defaultPaymentMethod.expiryMonth}/{defaultPaymentMethod.expiryYear})
                    </span>
                  </div>
                )}
              </div>
              
              {/* Features */}
              {plan?.features && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Included Features:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {JSON.parse(plan.features).map((feature: string, i: number) => (
                      <div key={i} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleManageBilling}
              disabled={createPortalSessionMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createPortalSessionMutation.isPending ? "Loading..." : "Manage Billing"}
            </Button>
            {!subscription.cancelAtPeriodEnd && (
              <Button 
                variant="outline" 
                onClick={() => setCancelDialogOpen(true)}
                className="w-full sm:w-auto"
                disabled={cancelSubscriptionMutation.isPending}
              >
                {cancelSubscriptionMutation.isPending ? "Processing..." : "Cancel Subscription"}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              Your recent invoices and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-full h-[40px]" />
                ))}
              </div>
            ) : sortedInvoices?.length ? (
              <div className="space-y-2">
                {sortedInvoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.paidAt ? formatDate(invoice.paidAt) : 'Unpaid'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={invoice.status === 'paid' ? 'outline' : 'secondary'}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                      {invoice.invoiceUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View Invoice</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No invoices found</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Your subscription will remain active until the end of the current billing period on {formatDate(subscription.currentPeriodEnd)}.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelSubscriptionMutation.isPending}
            >
              Keep Subscription
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
            >
              {cancelSubscriptionMutation.isPending ? "Processing..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}