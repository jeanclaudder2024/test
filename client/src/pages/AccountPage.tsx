import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  CreditCard, 
  Settings, 
  Calendar, 
  Crown, 
  AlertTriangle, 
  CheckCircle,
  Download,
  BarChart3,
  Ship,
  ArrowUp
} from 'lucide-react';
import { getSubscriptionStatus, getUserSubscription, cancelSubscription, getDaysRemainingInTrial } from '@/lib/subscriptionService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import UpgradeModal from '@/components/UpgradeModal';

export default function AccountPage() {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/subscription-status'],
    queryFn: () => getSubscriptionStatus(),
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/user-subscription'],
    queryFn: () => getUserSubscription(),
  });

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;
    
    switch (subscription.status) {
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Free Trial</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (statusLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const isTrialStatus = subscription?.status === 'trial';
  const daysRemaining = isTrialStatus ? getDaysRemainingInTrial(subscription) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your subscription and account preferences</p>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Usage</span>
            </TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Plan */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Crown className="h-6 w-6 text-purple-600" />
                        <CardTitle>Current Plan</CardTitle>
                      </div>
                      {getStatusBadge()}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {subscription?.plan.name || 'No Active Plan'}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {subscription?.plan.description || 'Please select a subscription plan'}
                      </p>
                    </div>

                    {subscription && (
                      <>
                        <Separator />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Plan Price</label>
                            <p className="text-lg font-semibold text-gray-900">
                              ${subscription.plan.price}/month
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Billing Cycle</label>
                            <p className="text-lg font-semibold text-gray-900 capitalize">
                              {subscription.plan.interval}
                            </p>
                          </div>
                        </div>

                        {isTrialStatus && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-blue-800">Trial Period</h4>
                            </div>
                            <p className="text-blue-700 mt-2">
                              Your trial expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. 
                              Upgrade to continue using all features.
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsUpgradeModalOpen(true)}
                            className="flex items-center gap-2"
                          >
                            <ArrowUp className="h-4 w-4" />
                            Upgrade Plan
                          </Button>
                          {subscription.status === 'active' && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={handleCancelSubscription}
                            >
                              Cancel Subscription
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Status */}
              <div>
                <SubscriptionStatus />
              </div>
            </div>

            {/* Features Overview */}
            {subscription && (
              <Card>
                <CardHeader>
                  <CardTitle>Plan Features</CardTitle>
                  <CardDescription>
                    What's included with your current plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subscription.plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Type</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex space-x-3">
                  <Button size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vessels Tracked</CardTitle>
                  <Ship className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">---</div>
                  <p className="text-xs text-muted-foreground">
                    Limit: {status?.maxVessels === -1 ? 'Unlimited' : status?.maxVessels}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Exports</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">---</div>
                  <p className="text-xs text-muted-foreground">
                    {status?.canExportData ? 'Available' : 'Not included'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analytics Access</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {status?.canAccessAnalytics ? 'Yes' : 'No'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Advanced reporting features
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usage History</CardTitle>
                <CardDescription>
                  Track your platform usage over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Usage analytics will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}