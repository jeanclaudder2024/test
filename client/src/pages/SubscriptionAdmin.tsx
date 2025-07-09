import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import AdminSubscriptionPlans from "@/components/admin/AdminSubscriptionPlans";
import { 
  Users, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Activity
} from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  isSubscribed: boolean;
  subscriptionTier: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  createdAt: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  interval: string;
  trialDays: number;
  isActive: boolean;
  features: string[];
  maxVessels: number;
  maxPorts: number;
  maxRefineries: number;
  canAccessBrokerFeatures: boolean;
  canAccessAnalytics: boolean;
  canExportData: boolean;
}

interface Subscription {
  id: number;
  userId: number;
  planId: number;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  billingInterval: string;
  user: User;
  plan: SubscriptionPlan;
}

export default function SubscriptionAdmin() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    staleTime: 0,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/subscription-plans"],
    staleTime: 0,
  });

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["/api/admin/subscriptions"],
    staleTime: 0,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/subscription-stats"],
    staleTime: 0,
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-500",
      trial: "bg-blue-500",
      canceled: "bg-red-500",
      past_due: "bg-orange-500",
      trialing: "bg-blue-500",
      incomplete: "bg-yellow-500",
    };
    
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || "bg-gray-500"} text-white`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage subscription plans, user subscriptions, and billing
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter((u: User) => u.isSubscribed).length} subscribed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter((s: Subscription) => s.status === "active" || s.status === "trial").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptions.filter((s: Subscription) => s.status === "trial").length} on trial
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Plans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {plans.filter((p: SubscriptionPlan) => p.isActive).length} active plans
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.monthlyRevenue || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated recurring revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Users by subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                {plans.map((plan: SubscriptionPlan) => {
                  const count = subscriptions.filter((s: Subscription) => 
                    s.planId === plan.id && (s.status === "active" || s.status === "trial")
                  ).length;
                  return (
                    <div key={plan.id} className="flex items-center justify-between py-2">
                      <span className="font-medium">{plan.name}</span>
                      <Badge variant="outline">{count} users</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest subscription changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subscriptions.slice(0, 5).map((sub: Subscription) => (
                    <div key={sub.id} className="flex items-center justify-between text-sm">
                      <span>{sub.user?.email || 'Unknown user'}</span>
                      {getStatusBadge(sub.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe Customer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.isSubscribed ? "default" : "secondary"}>
                          {user.subscriptionTier || "Free"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isSubscribed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.stripeCustomerId || "Not created"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <AdminSubscriptionPlans />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Manage user subscriptions and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription: Subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.user?.email || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subscription.plan?.name || 'Unknown Plan'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell>
                        ${subscription.plan?.price || '0'}/{subscription.billingInterval || 'month'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {subscription.currentPeriodEnd ? 
                          new Date(subscription.currentPeriodEnd).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          {subscription.status === "active" && (
                            <Button variant="destructive" size="sm">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}