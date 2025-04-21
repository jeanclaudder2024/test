import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Users, CreditCard, Flag, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin?: boolean;
  role?: string;
  isSubscribed?: boolean;
  subscriptionTier?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: string;
  interval: string;
  features?: string[];
  stripePriceId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeatureFlag {
  id: number;
  featureName: string;
  description?: string;
  isEnabled: boolean;
  requiredSubscription?: string;
  createdAt: string;
}

interface Stats {
  users: {
    total: number;
    subscribed: number;
    conversionRate: number;
  };
  vessels: number;
  refineries: number;
  brokers: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  
  // Dialog states
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [showNewFeatureFlagDialog, setShowNewFeatureFlagDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly",
    stripePriceId: "",
    features: "",
    isActive: true
  });
  const [newFeatureFlag, setNewFeatureFlag] = useState({
    featureName: "",
    description: "",
    isEnabled: true,
    requiredSubscription: ""
  });
  
  // Check if user is admin
  useEffect(() => {
    if (user && !((user.isAdmin === true) || (user.role === "admin" || user.role === "superadmin"))) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard.",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);
  
  // Load data
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch users
        const usersResponse = await apiRequest({ method: "GET", url: "/api/admin/users" });
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
        // Fetch subscription plans
        const plansResponse = await apiRequest({ method: "GET", url: "/api/admin/subscription-plans" });
        const plansData = await plansResponse.json();
        setPlans(plansData);
        
        // Fetch feature flags
        const flagsResponse = await apiRequest({ method: "GET", url: "/api/admin/feature-flags" });
        const flagsData = await flagsResponse.json();
        setFeatureFlags(flagsData);
        
        // Fetch stats
        const statsResponse = await apiRequest({ method: "GET", url: "/api/admin/stats" });
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [user, toast]);
  
  // Handle create subscription plan
  const handleCreatePlan = async () => {
    try {
      // Convert features string to array
      const featuresArray = newPlan.features.split(',').map(f => f.trim()).filter(f => f !== '');
      
      const response = await apiRequest({ 
        method: "POST", 
        url: "/api/admin/subscription-plans", 
        body: {
          ...newPlan,
          features: featuresArray
        }
      });
      
      if (response.ok) {
        const newPlanData = await response.json();
        setPlans([...plans, newPlanData]);
        setShowNewPlanDialog(false);
        setNewPlan({
          name: "",
          description: "",
          price: "",
          interval: "monthly",
          stripePriceId: "",
          features: "",
          isActive: true
        });
        
        toast({
          title: "Success",
          description: "Subscription plan created successfully.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create subscription plan");
      }
    } catch (error: any) {
      console.error("Error creating subscription plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription plan.",
        variant: "destructive"
      });
    }
  };
  
  // Handle create feature flag
  const handleCreateFeatureFlag = async () => {
    try {
      const response = await apiRequest({ 
        method: "POST", 
        url: "/api/admin/feature-flags", 
        body: newFeatureFlag 
      });
      if (response.ok) {
        const newFlagData = await response.json();
        setFeatureFlags([...featureFlags, newFlagData]);
        setShowNewFeatureFlagDialog(false);
        setNewFeatureFlag({
          featureName: "",
          description: "",
          isEnabled: true,
          requiredSubscription: ""
        });
        
        toast({
          title: "Success",
          description: "Feature flag created successfully.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create feature flag");
      }
    } catch (error: any) {
      console.error("Error creating feature flag:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create feature flag.",
        variant: "destructive"
      });
    }
  };
  
  // Handle toggle feature flag
  const handleToggleFeatureFlag = async (flagId: number, isEnabled: boolean) => {
    try {
      const response = await apiRequest({ 
        method: "PATCH", 
        url: `/api/admin/feature-flags/${flagId}`, 
        body: { isEnabled } 
      });
      
      if (response.ok) {
        // Update local state
        setFeatureFlags(prevFlags => 
          prevFlags.map(flag => 
            flag.id === flagId ? { ...flag, isEnabled } : flag
          )
        );
        
        toast({
          title: "Success",
          description: `Feature ${isEnabled ? 'enabled' : 'disabled'} successfully.`,
        });
      } else {
        throw new Error("Failed to update feature flag");
      }
    } catch (error) {
      console.error("Error updating feature flag:", error);
      toast({
        title: "Error",
        description: "Failed to update feature flag status.",
        variant: "destructive"
      });
    }
  };
  
  // Handle toggle subscription plan active status
  const handleTogglePlanStatus = async (planId: number, isActive: boolean) => {
    try {
      const response = await apiRequest({ 
        method: "PATCH", 
        url: `/api/admin/subscription-plans/${planId}`, 
        body: { isActive } 
      });
      
      if (response.ok) {
        // Update local state
        setPlans(prevPlans => 
          prevPlans.map(plan => 
            plan.id === planId ? { ...plan, isActive } : plan
          )
        );
        
        toast({
          title: "Success",
          description: `Plan ${isActive ? 'activated' : 'deactivated'} successfully.`,
        });
      } else {
        throw new Error("Failed to update subscription plan");
      }
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription plan status.",
        variant: "destructive"
      });
    }
  };
  
  if (!user) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                  <CardDescription>Current user count</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.users.total}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.users.subscribed} subscribed ({stats.users.conversionRate.toFixed(1)}%)
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Vessels</CardTitle>
                  <CardDescription>Tracked vessels</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.vessels}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Refineries</CardTitle>
                  <CardDescription>Active refineries</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.refineries}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Brokers</CardTitle>
                  <CardDescription>Registered brokers</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.brokers}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role || "user"}</TableCell>
                      <TableCell>
                        {user.isSubscribed ? (
                          <span className="text-green-600">
                            {user.subscriptionTier || "standard"}
                          </span>
                        ) : (
                          <span className="text-gray-400">none</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Manage available subscription plans</CardDescription>
              </div>
              <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>New Plan</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Subscription Plan</DialogTitle>
                    <DialogDescription>
                      Add a new subscription plan to the platform.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        value={newPlan.name}
                        onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                        className="col-span-3"
                        placeholder="Premium"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Input
                        id="description"
                        value={newPlan.description}
                        onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                        className="col-span-3"
                        placeholder="Premium access to all features"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                        className="col-span-3"
                        placeholder="29.99"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="interval" className="text-right">Interval</Label>
                      <select
                        id="interval"
                        value={newPlan.interval}
                        onChange={(e) => setNewPlan({...newPlan, interval: e.target.value})}
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stripe-id" className="text-right">Stripe Price ID</Label>
                      <Input
                        id="stripe-id"
                        value={newPlan.stripePriceId}
                        onChange={(e) => setNewPlan({...newPlan, stripePriceId: e.target.value})}
                        className="col-span-3"
                        placeholder="price_1234567890"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="features" className="text-right">Features</Label>
                      <Input
                        id="features"
                        value={newPlan.features}
                        onChange={(e) => setNewPlan({...newPlan, features: e.target.value})}
                        className="col-span-3"
                        placeholder="Feature 1, Feature 2, Feature 3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="active" className="text-right">Active</Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={newPlan.isActive}
                          onCheckedChange={(checked) => setNewPlan({...newPlan, isActive: checked})}
                        />
                        <Label htmlFor="active">{newPlan.isActive ? "Yes" : "No"}</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewPlanDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreatePlan}>Create Plan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map(plan => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>${Number(plan.price).toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{plan.interval}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${plan.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Switch 
                            checked={plan.isActive} 
                            onCheckedChange={(checked) => handleTogglePlanStatus(plan.id, checked)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Control feature availability across the platform</CardDescription>
              </div>
              <Dialog open={showNewFeatureFlagDialog} onOpenChange={setShowNewFeatureFlagDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>New Feature</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Feature Flag</DialogTitle>
                    <DialogDescription>
                      Add a new feature flag to control access to platform features.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="featureName" className="text-right">Feature Name</Label>
                      <Input
                        id="featureName"
                        value={newFeatureFlag.featureName}
                        onChange={(e) => setNewFeatureFlag({...newFeatureFlag, featureName: e.target.value})}
                        className="col-span-3"
                        placeholder="advanced_analytics"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="flagDescription" className="text-right">Description</Label>
                      <Input
                        id="flagDescription"
                        value={newFeatureFlag.description}
                        onChange={(e) => setNewFeatureFlag({...newFeatureFlag, description: e.target.value})}
                        className="col-span-3"
                        placeholder="Advanced analytics dashboard"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="requiredSubscription" className="text-right">Required Plan</Label>
                      <Input
                        id="requiredSubscription"
                        value={newFeatureFlag.requiredSubscription}
                        onChange={(e) => setNewFeatureFlag({...newFeatureFlag, requiredSubscription: e.target.value})}
                        className="col-span-3"
                        placeholder="premium"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="flagEnabled" className="text-right">Enabled</Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Switch
                          id="flagEnabled"
                          checked={newFeatureFlag.isEnabled}
                          onCheckedChange={(checked) => setNewFeatureFlag({...newFeatureFlag, isEnabled: checked})}
                        />
                        <Label htmlFor="flagEnabled">{newFeatureFlag.isEnabled ? "Yes" : "No"}</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewFeatureFlagDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateFeatureFlag}>Create Feature</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Feature Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Required Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureFlags.map(flag => (
                    <TableRow key={flag.id}>
                      <TableCell>{flag.id}</TableCell>
                      <TableCell>{flag.featureName}</TableCell>
                      <TableCell>{flag.description}</TableCell>
                      <TableCell>{flag.requiredSubscription || "All"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${flag.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          {flag.isEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Switch 
                            checked={flag.isEnabled} 
                            onCheckedChange={(checked) => handleToggleFeatureFlag(flag.id, checked)}
                          />
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