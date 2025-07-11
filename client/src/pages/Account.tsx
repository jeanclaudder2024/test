import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  CreditCard, 
  FileText, 
  Settings, 
  Calendar, 
  Crown, 
  TrendingUp,
  Download,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface Invoice {
  id: number;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
  invoiceUrl: string;
  invoicePdf: string;
}

interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export default function Account() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/subscriptions/current'],
    retry: false,
  });

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/subscriptions/invoices'],
    retry: false,
  });

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/subscriptions/payment-methods'],
    retry: false,
  });

  // Create portal session mutation
  const createPortalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/subscriptions/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Portal redirect data:', data);
      // Force immediate top-level navigation to prevent iFrame issues
      if (window.parent && window.parent !== window) {
        // We're in an iframe - force parent navigation
        window.parent.location.href = data.url;
      } else if (window.top && window.top !== window) {
        // Alternative iframe detection
        window.top.location.href = data.url;
      } else {
        // Direct navigation for non-iframe context
        window.location.replace(data.url);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSubscriptionStatus = () => {
    if (!subscription?.active) return { text: 'No Active Subscription', color: 'bg-gray-500' };
    
    switch (subscription.subscription.status) {
      case 'active':
        return { text: 'Active', color: 'bg-green-500' };
      case 'trialing':
        return { text: 'Trial', color: 'bg-blue-500' };
      case 'past_due':
        return { text: 'Past Due', color: 'bg-red-500' };
      case 'canceled':
        return { text: 'Cancelled', color: 'bg-gray-500' };
      default:
        return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile, subscription, and billing information</p>
        </div>

        {/* Account Overview Card */}
        <Card className="mb-8 bg-white/90 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{user?.username}</CardTitle>
                <CardDescription className="text-blue-100">{user?.email}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-8 w-8" />
                {subscription?.active && (
                  <Badge className={`${getSubscriptionStatus().color} text-white`}>
                    {getSubscriptionStatus().text}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {subscription?.active ? subscription.subscription.plan?.name : 'No Plan'}
                </div>
                <div className="text-gray-600">Current Plan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {subscription?.active ? formatPrice(subscription.subscription.plan?.price || 0) : '$0'}
                </div>
                <div className="text-gray-600">Monthly Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {subscription?.active ? formatDate(subscription.subscription.currentPeriodEnd) : 'N/A'}
                </div>
                <div className="text-gray-600">Next Billing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Crown className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Invoices
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/90 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={user?.username || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={user?.role || 'user'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-since">Member Since</Label>
                    <Input
                      id="member-since"
                      value={user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="bg-white/90 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Manage your subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription?.active ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-lg">{subscription.subscription.plan?.name}</h3>
                        <p className="text-gray-600">{subscription.subscription.plan?.description}</p>
                        <p className="text-sm text-gray-500">
                          Status: <span className="font-medium">{subscription.subscription.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(subscription.subscription.plan?.price || 0)}
                        </div>
                        <div className="text-sm text-gray-600">per month</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Current Period</Label>
                        <p className="text-sm text-gray-600">
                          {formatDate(subscription.subscription.currentPeriodStart)} - {formatDate(subscription.subscription.currentPeriodEnd)}
                        </p>
                      </div>
                      <div>
                        <Label>Next Billing Date</Label>
                        <p className="text-sm text-gray-600">
                          {formatDate(subscription.subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => createPortalMutation.mutate()}
                        disabled={createPortalMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {createPortalMutation.isPending ? 'Loading...' : 'Manage Subscription'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                    <p className="text-gray-600 mb-4">Choose a plan to get started with premium features.</p>
                    <Button 
                      onClick={() => window.location.href = '/pricing'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="bg-white/90 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethodsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-8 w-8 text-gray-600" />
                          <div>
                            <p className="font-medium">•••• •••• •••• {method.last4}</p>
                            <p className="text-sm text-gray-600">
                              {method.brand} • Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        {method.isDefault && (
                          <Badge className="bg-green-500 text-white">Default</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No payment methods found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card className="bg-white/90 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{formatPrice(invoice.amount)}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(invoice.paidAt)} • {invoice.status}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              invoice.status === 'paid' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                            }
                          >
                            {invoice.status}
                          </Badge>
                          {invoice.invoiceUrl && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          )}
                          {invoice.invoicePdf && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(invoice.invoicePdf, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No invoices found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}