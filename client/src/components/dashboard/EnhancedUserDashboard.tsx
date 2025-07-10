import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  Ship, 
  MapPin, 
  Building2, 
  Calendar, 
  Download,
  Settings,
  Crown,
  Star,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Globe,
  Shield
} from "lucide-react";
import { format } from "date-fns";

interface UserSubscriptionData {
  subscription: {
    id: number;
    planId: number;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEndDate?: string;
    plan: {
      name: string;
      price: string;
      features: string[];
    };
  };
  usage: {
    vesselsAccessed: number;
    portsAccessed: number;
    refineriesAccessed: number;
    documentsGenerated: number;
    apiCallsThisMonth: number;
  };
  limits: {
    maxVessels: number;
    maxPorts: number;
    maxRefineries: number;
    maxDocuments: number;
    maxApiCalls: number;
  };
}

interface PaymentHistory {
  id: number;
  amount: string;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function EnhancedUserDashboard() {
  const { user } = useAuth();
  const subscription = useSubscription();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user subscription data
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/user-subscription'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user-subscription');
      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });

  // Fetch payment history
  const { data: paymentHistory, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/user-payments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user-payments');
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });

  // Fetch usage analytics
  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['/api/user-usage'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user-usage');
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'past_due': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'trial': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'past_due': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPlanIcon = (planId: number) => {
    switch (planId) {
      case 1: return <Zap className="h-5 w-5 text-blue-600" />;
      case 2: return <Star className="h-5 w-5 text-purple-600" />;
      case 3: return <Crown className="h-5 w-5 text-yellow-600" />;
      default: return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateUsagePercentage = (used: number, limit: number) => {
    if (limit === -1 || limit === 999) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const exportUsageData = async () => {
    try {
      const response = await apiRequest('GET', '/api/user-usage/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Usage data has been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export usage data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.firstName || user?.email}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subscription Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                {subscriptionData?.subscription && getStatusIcon(subscriptionData.subscription.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionData?.subscription?.status || 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscriptionData?.subscription?.plan?.name || 'No active plan'}
                </p>
              </CardContent>
            </Card>

            {/* Vessels Accessed */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vessels Accessed</CardTitle>
                <Ship className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageData?.vesselsAccessed || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {subscription.maxVessels === 999 ? 'unlimited' : subscription.maxVessels}
                </p>
              </CardContent>
            </Card>

            {/* Documents Generated */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents Generated</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageData?.documentsGenerated || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            {/* API Calls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageData?.apiCallsThisMonth || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Commonly used features and tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Ship className="h-6 w-6" />
                  <span>View Vessels</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Download className="h-6 w-6" />
                  <span>Generate Document</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {subscriptionData?.subscription && getPlanIcon(subscriptionData.subscription.planId)}
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {subscriptionData?.subscription?.plan?.name || 'No Plan'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${subscriptionData?.subscription?.plan?.price || '0'}/month
                    </p>
                  </div>
                  <Badge className={getStatusColor(subscriptionData?.subscription?.status || 'inactive')}>
                    {subscriptionData?.subscription?.status || 'Inactive'}
                  </Badge>
                </div>
                
                {subscriptionData?.subscription?.currentPeriodEnd && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Next billing: {format(new Date(subscriptionData.subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Plan Features:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {subscriptionData?.subscription?.plan?.features?.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    Upgrade Plan
                  </Button>
                  <Button size="sm" variant="ghost">
                    View All Plans
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading payments...</div>
                  ) : paymentHistory?.length > 0 ? (
                    paymentHistory.slice(0, 5).map((payment: PaymentHistory) => (
                      <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="text-sm font-medium">{payment.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${payment.amount}
                          </p>
                          <Badge variant={payment.status === 'succeeded' ? 'default' : 'destructive'}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No payment history</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage & Analytics Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Usage Analytics</h2>
            <Button onClick={exportUsageData} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Vessel Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Vessel Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Used</span>
                    <span className="text-sm font-medium">
                      {usageData?.vesselsAccessed || 0} / {subscription.maxVessels === 999 ? '∞' : subscription.maxVessels}
                    </span>
                  </div>
                  <Progress 
                    value={calculateUsagePercentage(usageData?.vesselsAccessed || 0, subscription.maxVessels)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Port Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Port Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Used</span>
                    <span className="text-sm font-medium">
                      {usageData?.portsAccessed || 0} / {subscription.maxPorts === 999 ? '∞' : subscription.maxPorts}
                    </span>
                  </div>
                  <Progress 
                    value={calculateUsagePercentage(usageData?.portsAccessed || 0, subscription.maxPorts)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Refinery Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Refinery Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Used</span>
                    <span className="text-sm font-medium">
                      {usageData?.refineriesAccessed || 0} / {subscription.maxRefineries === 999 ? '∞' : subscription.maxRefineries}
                    </span>
                  </div>
                  <Progress 
                    value={calculateUsagePercentage(usageData?.refineriesAccessed || 0, subscription.maxRefineries)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
              <CardDescription>
                Your platform usage over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">Activity chart will display here</p>
                  <p className="text-xs text-muted-foreground">Coming soon with enhanced analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">
                      {user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Badge variant="outline">{user?.role || 'User'}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Member Since</label>
                    <p className="text-sm text-muted-foreground">
                      {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <Button size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Not enabled</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Enable
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Login Sessions</p>
                      <p className="text-xs text-muted-foreground">Manage active sessions</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}