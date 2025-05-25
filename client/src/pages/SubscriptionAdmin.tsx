import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  CreditCard, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Crown, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Calendar,
  TrendingUp,
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
  slug: string;
  description: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
  monthlyPrice: string;
  yearlyPrice: string;
  currency: string;
  features: string;
  isPopular: boolean;
  trialDays: number;
  isActive: boolean;
  sortOrder: number;
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
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/admin/subscription-plans"],
  });

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["/api/admin/subscriptions"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/subscription-stats"],
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: (planData: any) => apiRequest("/api/admin/subscription-plans", "POST", planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setIsCreatePlanOpen(false);
      toast({ title: "Success", description: "Subscription plan created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create subscription plan", variant: "destructive" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, ...planData }: any) => apiRequest(`/api/admin/subscription-plans/${id}`, "PATCH", planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setIsEditPlanOpen(false);
      setSelectedPlan(null);
      toast({ title: "Success", description: "Subscription plan updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update subscription plan", variant: "destructive" });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/subscription-plans/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      toast({ title: "Success", description: "Subscription plan deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete subscription plan", variant: "destructive" });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/admin/subscriptions/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      toast({ title: "Success", description: "Subscription updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update subscription", variant: "destructive" });
    },
  });

  const handleCreatePlan = (formData: FormData) => {
    const planData = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      monthlyPriceId: formData.get("monthlyPriceId") as string,
      yearlyPriceId: formData.get("yearlyPriceId") as string,
      monthlyPrice: formData.get("monthlyPrice") as string,
      yearlyPrice: formData.get("yearlyPrice") as string,
      currency: formData.get("currency") as string || "usd",
      features: formData.get("features") as string,
      isPopular: formData.get("isPopular") === "on",
      trialDays: parseInt(formData.get("trialDays") as string) || 0,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
      isActive: true,
    };
    createPlanMutation.mutate(planData);
  };

  const handleUpdatePlan = (formData: FormData) => {
    if (!selectedPlan) return;
    
    const planData = {
      id: selectedPlan.id,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      monthlyPriceId: formData.get("monthlyPriceId") as string,
      yearlyPriceId: formData.get("yearlyPriceId") as string,
      monthlyPrice: formData.get("monthlyPrice") as string,
      yearlyPrice: formData.get("yearlyPrice") as string,
      currency: formData.get("currency") as string || "usd",
      features: formData.get("features") as string,
      isPopular: formData.get("isPopular") === "on",
      trialDays: parseInt(formData.get("trialDays") as string) || 0,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
      isActive: formData.get("isActive") === "on",
    };
    updatePlanMutation.mutate(planData);
  };

  const handleCancelSubscription = (subscriptionId: number) => {
    updateSubscriptionMutation.mutate({
      id: subscriptionId,
      cancelAtPeriodEnd: true,
    });
  };

  const handleReactivateSubscription = (subscriptionId: number) => {
    updateSubscriptionMutation.mutate({
      id: subscriptionId,
      cancelAtPeriodEnd: false,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-500",
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
            Manage user subscriptions, plans, and billing with Stripe integration
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
              {subscriptions.filter((s: Subscription) => s.status === "active").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptions.filter((s: Subscription) => s.cancelAtPeriodEnd).length} canceling
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
                    s.planId === plan.id && s.status === "active"
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
                      <span>{sub.user?.email}</span>
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
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Subscription Plans</h3>
              <p className="text-sm text-muted-foreground">Create and manage your pricing plans</p>
            </div>
            <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Subscription Plan</DialogTitle>
                  <DialogDescription>
                    Create a new subscription plan with Stripe integration
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreatePlan} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <Input id="name" name="name" placeholder="Premium Plan" required />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input id="slug" name="slug" placeholder="premium" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Full access to all features" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                      <Input id="monthlyPrice" name="monthlyPrice" type="number" step="0.01" placeholder="29.99" />
                    </div>
                    <div>
                      <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
                      <Input id="yearlyPrice" name="yearlyPrice" type="number" step="0.01" placeholder="299.99" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="monthlyPriceId">Stripe Monthly Price ID</Label>
                      <Input id="monthlyPriceId" name="monthlyPriceId" placeholder="price_1234567890" />
                    </div>
                    <div>
                      <Label htmlFor="yearlyPriceId">Stripe Yearly Price ID</Label>
                      <Input id="yearlyPriceId" name="yearlyPriceId" placeholder="price_0987654321" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Plan Features & Access Control</Label>
                    <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-muted/50">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-feature-vessel-tracking" className="text-sm font-medium">Vessel Tracking</Label>
                            <Switch id="new-feature-vessel-tracking" name="feature-vessel-tracking" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-feature-port-analytics" className="text-sm font-medium">Port Analytics</Label>
                            <Switch id="new-feature-port-analytics" name="feature-port-analytics" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-feature-cargo-monitoring" className="text-sm font-medium">Cargo Monitoring</Label>
                            <Switch id="new-feature-cargo-monitoring" name="feature-cargo-monitoring" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-feature-route-optimization" className="text-sm font-medium">Route Optimization</Label>
                            <Switch id="new-feature-route-optimization" name="feature-route-optimization" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-feature-ai-assistant" className="text-sm font-medium">AI Assistant</Label>
                            <Switch id="new-feature-ai-assistant" name="feature-ai-assistant" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-feature-document-generation" className="text-sm font-medium">Document Generation</Label>
                            <Switch id="new-feature-document-generation" name="feature-document-generation" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-feature-premium-support" className="text-sm font-medium">Premium Support</Label>
                            <Switch id="new-feature-premium-support" name="feature-premium-support" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-feature-api-access" className="text-sm font-medium">API Access</Label>
                            <Switch id="new-feature-api-access" name="feature-api-access" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <Label htmlFor="new-vessels-limit" className="text-sm font-medium">Vessels Limit</Label>
                          <Select name="vessels-limit">
                            <SelectTrigger>
                              <SelectValue placeholder="Select limit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 vessels</SelectItem>
                              <SelectItem value="50">50 vessels</SelectItem>
                              <SelectItem value="100">100 vessels</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="new-data-retention" className="text-sm font-medium">Data Retention</Label>
                          <Select name="data-retention">
                            <SelectTrigger>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <Label className="text-sm font-semibold">Access Filtering Controls</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-vessel-types-filter" className="text-sm font-medium">Allowed Vessel Types</Label>
                            <Select name="vessel-types-filter">
                              <SelectTrigger>
                                <SelectValue placeholder="Select vessel types access" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="oil-tankers-only">Oil Tankers Only</SelectItem>
                                <SelectItem value="commercial-vessels">Commercial Vessels</SelectItem>
                                <SelectItem value="cargo-vessels">Cargo + Oil Vessels</SelectItem>
                                <SelectItem value="all-vessel-types">All Vessel Types</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="new-regions-access" className="text-sm font-medium">Regional Access</Label>
                            <Select name="regions-access">
                              <SelectTrigger>
                                <SelectValue placeholder="Select regional access" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single-region">Single Region</SelectItem>
                                <SelectItem value="three-regions">Up to 3 Regions</SelectItem>
                                <SelectItem value="five-regions">Up to 5 Regions</SelectItem>
                                <SelectItem value="global-access">Global Access</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-vessel-types-count" className="text-sm font-medium">Max Vessel Types Visible</Label>
                            <Select name="vessel-types-count">
                              <SelectTrigger>
                                <SelectValue placeholder="Select max types" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">2 vessel types</SelectItem>
                                <SelectItem value="5">5 vessel types</SelectItem>
                                <SelectItem value="10">10 vessel types</SelectItem>
                                <SelectItem value="unlimited">All vessel types</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="new-regions-count" className="text-sm font-medium">Max Regions Visible</Label>
                            <Select name="regions-count">
                              <SelectTrigger>
                                <SelectValue placeholder="Select max regions" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 region</SelectItem>
                                <SelectItem value="3">3 regions</SelectItem>
                                <SelectItem value="5">5 regions</SelectItem>
                                <SelectItem value="8">8 regions</SelectItem>
                                <SelectItem value="unlimited">All regions</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="features">Additional Features (one per line)</Label>
                      <Textarea 
                        id="features" 
                        name="features" 
                        placeholder="Enter additional custom features..."
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="trialDays">Trial Days</Label>
                      <Input id="trialDays" name="trialDays" type="number" placeholder="7" />
                    </div>
                    <div>
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input id="sortOrder" name="sortOrder" type="number" placeholder="1" />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch id="isPopular" name="isPopular" />
                      <Label htmlFor="isPopular">Popular Plan</Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPlanMutation.isPending}>
                      {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan: SubscriptionPlan) => (
              <Card key={plan.id} className={`relative ${plan.isPopular ? "border-blue-500" : ""}`}>
                {plan.isPopular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setIsEditPlanOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePlanMutation.mutate(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly:</span>
                      <span className="font-semibold">${plan.monthlyPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Yearly:</span>
                      <span className="font-semibold">${plan.yearlyPrice}</span>
                    </div>
                    {plan.trialDays > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Trial:</span>
                        <span className="text-sm">{plan.trialDays} days</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">Features:</p>
                      <div className="space-y-1">
                        {plan.features.split('\n').slice(0, 3).map((feature, index) => (
                          <div key={index} className="text-xs flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {subscriptions.filter((s: Subscription) => s.planId === plan.id && s.status === "active").length} subscribers
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                    <TableHead>Current Period</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription: Subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subscription.user?.username}</p>
                          <p className="text-xs text-muted-foreground">{subscription.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{subscription.plan?.name}</TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subscription.billingInterval}ly
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>
                          <p>Start: {new Date(subscription.currentPeriodStart).toLocaleDateString()}</p>
                          <p>End: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {subscription.cancelAtPeriodEnd ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReactivateSubscription(subscription.id)}
                            >
                              Reactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelSubscription(subscription.id)}
                            >
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

      {/* Edit Plan Dialog */}
      <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan details
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <form action={handleUpdatePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Plan Name</Label>
                  <Input id="edit-name" name="name" defaultValue={selectedPlan.name} required />
                </div>
                <div>
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input id="edit-slug" name="slug" defaultValue={selectedPlan.slug} required />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" name="description" defaultValue={selectedPlan.description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-monthlyPrice">Monthly Price ($)</Label>
                  <Input id="edit-monthlyPrice" name="monthlyPrice" type="number" step="0.01" defaultValue={selectedPlan.monthlyPrice} />
                </div>
                <div>
                  <Label htmlFor="edit-yearlyPrice">Yearly Price ($)</Label>
                  <Input id="edit-yearlyPrice" name="yearlyPrice" type="number" step="0.01" defaultValue={selectedPlan.yearlyPrice} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-monthlyPriceId">Stripe Monthly Price ID</Label>
                  <Input id="edit-monthlyPriceId" name="monthlyPriceId" defaultValue={selectedPlan.monthlyPriceId} />
                </div>
                <div>
                  <Label htmlFor="edit-yearlyPriceId">Stripe Yearly Price ID</Label>
                  <Input id="edit-yearlyPriceId" name="yearlyPriceId" defaultValue={selectedPlan.yearlyPriceId} />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-base font-semibold">Plan Features & Access Control</Label>
                <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="feature-vessel-tracking" className="text-sm font-medium">Vessel Tracking</Label>
                        <Switch id="feature-vessel-tracking" name="feature-vessel-tracking" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="feature-port-analytics" className="text-sm font-medium">Port Analytics</Label>
                        <Switch id="feature-port-analytics" name="feature-port-analytics" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="feature-cargo-monitoring" className="text-sm font-medium">Cargo Monitoring</Label>
                        <Switch id="feature-cargo-monitoring" name="feature-cargo-monitoring" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="feature-route-optimization" className="text-sm font-medium">Route Optimization</Label>
                        <Switch id="feature-route-optimization" name="feature-route-optimization" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="feature-ai-assistant" className="text-sm font-medium">AI Assistant</Label>
                        <Switch id="feature-ai-assistant" name="feature-ai-assistant" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="feature-document-generation" className="text-sm font-medium">Document Generation</Label>
                        <Switch id="feature-document-generation" name="feature-document-generation" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="feature-premium-support" className="text-sm font-medium">Premium Support</Label>
                        <Switch id="feature-premium-support" name="feature-premium-support" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="feature-api-access" className="text-sm font-medium">API Access</Label>
                        <Switch id="feature-api-access" name="feature-api-access" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="vessels-limit" className="text-sm font-medium">Vessels Limit</Label>
                      <Select name="vessels-limit">
                        <SelectTrigger>
                          <SelectValue placeholder="Select limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 vessels</SelectItem>
                          <SelectItem value="50">50 vessels</SelectItem>
                          <SelectItem value="100">100 vessels</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="data-retention" className="text-sm font-medium">Data Retention</Label>
                      <Select name="data-retention">
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <Label className="text-sm font-semibold">Access Filtering Controls</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vessel-types-filter" className="text-sm font-medium">Allowed Vessel Types</Label>
                        <Select name="vessel-types-filter">
                          <SelectTrigger>
                            <SelectValue placeholder="Select vessel types access" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oil-tankers-only">Oil Tankers Only</SelectItem>
                            <SelectItem value="commercial-vessels">Commercial Vessels</SelectItem>
                            <SelectItem value="cargo-vessels">Cargo + Oil Vessels</SelectItem>
                            <SelectItem value="all-vessel-types">All Vessel Types</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="regions-access" className="text-sm font-medium">Regional Access</Label>
                        <Select name="regions-access">
                          <SelectTrigger>
                            <SelectValue placeholder="Select regional access" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single-region">Single Region</SelectItem>
                            <SelectItem value="three-regions">Up to 3 Regions</SelectItem>
                            <SelectItem value="five-regions">Up to 5 Regions</SelectItem>
                            <SelectItem value="global-access">Global Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vessel-types-count" className="text-sm font-medium">Max Vessel Types Visible</Label>
                        <Select name="vessel-types-count">
                          <SelectTrigger>
                            <SelectValue placeholder="Select max types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 vessel types</SelectItem>
                            <SelectItem value="5">5 vessel types</SelectItem>
                            <SelectItem value="10">10 vessel types</SelectItem>
                            <SelectItem value="unlimited">All vessel types</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="regions-count" className="text-sm font-medium">Max Regions Visible</Label>
                        <Select name="regions-count">
                          <SelectTrigger>
                            <SelectValue placeholder="Select max regions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 region</SelectItem>
                            <SelectItem value="3">3 regions</SelectItem>
                            <SelectItem value="5">5 regions</SelectItem>
                            <SelectItem value="8">8 regions</SelectItem>
                            <SelectItem value="unlimited">All regions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-features">Additional Features (one per line)</Label>
                  <Textarea 
                    id="edit-features" 
                    name="features" 
                    defaultValue={selectedPlan.features} 
                    placeholder="Enter additional custom features..."
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="edit-trialDays">Trial Days</Label>
                  <Input id="edit-trialDays" name="trialDays" type="number" defaultValue={selectedPlan.trialDays} />
                </div>
                <div>
                  <Label htmlFor="edit-sortOrder">Sort Order</Label>
                  <Input id="edit-sortOrder" name="sortOrder" type="number" defaultValue={selectedPlan.sortOrder} />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch id="edit-isPopular" name="isPopular" defaultChecked={selectedPlan.isPopular} />
                  <Label htmlFor="edit-isPopular">Popular</Label>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch id="edit-isActive" name="isActive" defaultChecked={selectedPlan.isActive} />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditPlanOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePlanMutation.isPending}>
                  {updatePlanMutation.isPending ? "Updating..." : "Update Plan"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}