import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Crown,
  DollarSign,
  Users,
  CheckCircle,
  XCircle
} from "lucide-react";

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
  createdAt?: string;
}

export default function AdminSubscriptionPlans() {
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch subscription plans
  const { data: plans = [], isLoading: plansLoading, refetch } = useQuery({
    queryKey: ["/api/admin/subscription-plans"],
    staleTime: 0,
  });

  // Real API mutations for subscription plan management
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiRequest("POST", "/api/admin/subscription-plans", {
        name: planData.name,
        description: planData.description,
        price: parseFloat(planData.price),
        interval: planData.interval || "month",
        trialDays: parseInt(planData.trialDays) || 5,
        isActive: planData.isActive !== false,
        features: Array.isArray(planData.features) ? planData.features : [],
        maxVessels: parseInt(planData.maxVessels) || -1,
        maxPorts: parseInt(planData.maxPorts) || -1,
        maxRefineries: parseInt(planData.maxRefineries) || -1,
        canAccessBrokerFeatures: planData.canAccessBrokerFeatures || false,
        canAccessAnalytics: planData.canAccessAnalytics || false,
        canExportData: planData.canExportData || false
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create subscription plan");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsCreatePlanOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      toast({ title: "Success", description: "Subscription plan created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create subscription plan", variant: "destructive" });
      console.error("Create plan error:", error);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...planData }: any) => {
      const response = await apiRequest("PUT", `/api/admin/subscription-plans/${id}`, {
        name: planData.name,
        description: planData.description,
        price: parseFloat(planData.price),
        interval: planData.interval || "month",
        trialDays: parseInt(planData.trialDays) || 5,
        isActive: planData.isActive !== false,
        features: Array.isArray(planData.features) ? planData.features : [],
        maxVessels: parseInt(planData.maxVessels) || -1,
        maxPorts: parseInt(planData.maxPorts) || -1,
        maxRefineries: parseInt(planData.maxRefineries) || -1,
        canAccessBrokerFeatures: planData.canAccessBrokerFeatures || false,
        canAccessAnalytics: planData.canAccessAnalytics || false,
        canExportData: planData.canExportData || false
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update subscription plan");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsEditPlanOpen(false);
      setSelectedPlan(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      toast({ title: "Success", description: "Subscription plan updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update subscription plan", variant: "destructive" });
      console.error("Update plan error:", error);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/subscription-plans/${id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete subscription plan");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      toast({ title: "Success", description: "Subscription plan deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: "Failed to delete subscription plan", variant: "destructive" });
      console.error("Delete plan error:", error);
    },
  });

  const handleCreatePlan = (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    
    // Debug log to see what we're sending
    console.log("Create plan data:", { name, description, price });
    
    if (!name || !description || !price) {
      toast({ 
        title: "Error", 
        description: "Please fill in all required fields (name, description, price)", 
        variant: "destructive" 
      });
      return;
    }
    
    const planData = {
      name,
      description,
      price,
      interval: formData.get("interval") as string || "month",
      trialDays: parseInt(formData.get("trialDays") as string) || 5,
      features: (formData.get("features") as string)?.split('\n').filter(f => f.trim()) || [],
      maxVessels: parseInt(formData.get("maxVessels") as string) || 0,
      maxPorts: parseInt(formData.get("maxPorts") as string) || 0,
      maxRefineries: parseInt(formData.get("maxRefineries") as string) || 0,
      canAccessBrokerFeatures: formData.get("canAccessBrokerFeatures") === "on",
      canAccessAnalytics: formData.get("canAccessAnalytics") === "on",
      canExportData: formData.get("canExportData") === "on",
      isActive: true,
    };
    createPlanMutation.mutate(planData);
  };

  const handleUpdatePlan = (formData: FormData) => {
    if (!selectedPlan) return;
    
    const planData = {
      id: selectedPlan.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      interval: formData.get("interval") as string || "month",
      trialDays: parseInt(formData.get("trialDays") as string) || 5,
      features: (formData.get("features") as string)?.split('\n').filter(f => f.trim()) || [],
      maxVessels: parseInt(formData.get("maxVessels") as string) || 0,
      maxPorts: parseInt(formData.get("maxPorts") as string) || 0,
      maxRefineries: parseInt(formData.get("maxRefineries") as string) || 0,
      canAccessBrokerFeatures: formData.get("canAccessBrokerFeatures") === "on",
      canAccessAnalytics: formData.get("canAccessAnalytics") === "on",
      canExportData: formData.get("canExportData") === "on",
      isActive: formData.get("isActive") === "on",
    };
    updatePlanMutation.mutate(planData);
  };

  const handleDeletePlan = (id: number) => {
    if (confirm("Are you sure you want to delete this subscription plan? This action cannot be undone.")) {
      deletePlanMutation.mutate(id);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsEditPlanOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Plans Management</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage subscription plans for your platform
          </p>
        </div>
        <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
              <DialogDescription>
                Create a new subscription plan that will be available to users across the platform
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); handleCreatePlan(formData); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input id="name" name="name" placeholder="Professional Plan" required />
                </div>
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input id="price" name="price" type="number" step="0.01" placeholder="150" required />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" name="description" placeholder="Full access to maritime tracking features" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interval">Billing Interval</Label>
                  <Select name="interval" defaultValue="month">
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trialDays">Trial Days</Label>
                  <Input id="trialDays" name="trialDays" type="number" placeholder="5" defaultValue="5" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Features & Limits</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxVessels">Max Vessels</Label>
                    <Input id="maxVessels" name="maxVessels" type="number" placeholder="100" />
                  </div>
                  <div>
                    <Label htmlFor="maxPorts">Max Ports</Label>
                    <Input id="maxPorts" name="maxPorts" type="number" placeholder="50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxRefineries">Max Refineries</Label>
                    <Input id="maxRefineries" name="maxRefineries" type="number" placeholder="25" />
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="flex items-center space-x-2">
                      <Switch id="canAccessBrokerFeatures" name="canAccessBrokerFeatures" />
                      <Label htmlFor="canAccessBrokerFeatures">Broker Features</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="canAccessAnalytics" name="canAccessAnalytics" />
                      <Label htmlFor="canAccessAnalytics">Analytics Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="canExportData" name="canExportData" />
                      <Label htmlFor="canExportData">Data Export</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="features">Features List (one per line)</Label>
                <Textarea 
                  id="features" 
                  name="features" 
                  rows={6}
                  placeholder="Real-time vessel tracking
Advanced analytics dashboard
Professional documentation
Direct seller access
24/7 support"
                />
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

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Current Subscription Plans
          </CardTitle>
          <CardDescription>
            Manage all subscription plans available to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan: SubscriptionPlan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-xs text-muted-foreground">{plan.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">${plan.price}</span>
                        <span className="text-xs text-muted-foreground">/{plan.interval}</span>
                      </div>
                      {plan.trialDays > 0 && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {plan.trialDays} days trial
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {plan.canAccessBrokerFeatures && (
                          <Badge variant="secondary" className="text-xs">Broker</Badge>
                        )}
                        {plan.canAccessAnalytics && (
                          <Badge variant="secondary" className="text-xs">Analytics</Badge>
                        )}
                        {plan.canExportData && (
                          <Badge variant="secondary" className="text-xs">Export</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="space-y-1">
                        <div>🚢 {plan.maxVessels || "∞"} vessels</div>
                        <div>⚓ {plan.maxPorts || "∞"} ports</div>
                        <div>🏭 {plan.maxRefineries || "∞"} refineries</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {plan.isActive ? (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan details
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); handleUpdatePlan(formData); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Plan Name *</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={selectedPlan.name}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Price ($) *</Label>
                  <Input 
                    id="edit-price" 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    defaultValue={selectedPlan.price}
                    required 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  defaultValue={selectedPlan.description}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-interval">Billing Interval</Label>
                  <Select name="interval" defaultValue={selectedPlan.interval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-trialDays">Trial Days</Label>
                  <Input 
                    id="edit-trialDays" 
                    name="trialDays" 
                    type="number" 
                    defaultValue={selectedPlan.trialDays}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Features & Limits</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-maxVessels">Max Vessels</Label>
                    <Input 
                      id="edit-maxVessels" 
                      name="maxVessels" 
                      type="number" 
                      defaultValue={selectedPlan.maxVessels}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-maxPorts">Max Ports</Label>
                    <Input 
                      id="edit-maxPorts" 
                      name="maxPorts" 
                      type="number" 
                      defaultValue={selectedPlan.maxPorts}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-maxRefineries">Max Refineries</Label>
                    <Input 
                      id="edit-maxRefineries" 
                      name="maxRefineries" 
                      type="number" 
                      defaultValue={selectedPlan.maxRefineries}
                    />
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="edit-canAccessBrokerFeatures" 
                        name="canAccessBrokerFeatures" 
                        defaultChecked={selectedPlan.canAccessBrokerFeatures}
                      />
                      <Label htmlFor="edit-canAccessBrokerFeatures">Broker Features</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="edit-canAccessAnalytics" 
                        name="canAccessAnalytics" 
                        defaultChecked={selectedPlan.canAccessAnalytics}
                      />
                      <Label htmlFor="edit-canAccessAnalytics">Analytics Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="edit-canExportData" 
                        name="canExportData" 
                        defaultChecked={selectedPlan.canExportData}
                      />
                      <Label htmlFor="edit-canExportData">Data Export</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-features">Features List (one per line)</Label>
                <Textarea 
                  id="edit-features" 
                  name="features" 
                  rows={6}
                  defaultValue={selectedPlan.features?.join('\n') || ''}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-isActive" 
                  name="isActive" 
                  defaultChecked={selectedPlan.isActive}
                />
                <Label htmlFor="edit-isActive">Plan Active</Label>
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