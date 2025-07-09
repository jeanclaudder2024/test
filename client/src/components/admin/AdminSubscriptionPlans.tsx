import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, DollarSign, Calendar, Users, CheckCircle } from 'lucide-react';

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
  createdAt: string;
  updatedAt: string;
}

interface PlanFormData {
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

const defaultFormData: PlanFormData = {
  name: '',
  description: '',
  price: '0.00',
  interval: 'month',
  trialDays: 5,
  isActive: true,
  features: [],
  maxVessels: 50,
  maxPorts: 5,
  maxRefineries: 10,
  canAccessBrokerFeatures: false,
  canAccessAnalytics: false,
  canExportData: false,
};

export default function AdminSubscriptionPlans() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(defaultFormData);
  const [newFeature, setNewFeature] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch subscription plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: () => apiRequest('GET', '/api/subscription-plans').then(res => res.json()),
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (planData: PlanFormData) =>
      apiRequest('POST', '/api/admin/subscription-plans', planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      setIsCreateDialogOpen(false);
      setFormData(defaultFormData);
      toast({
        title: 'Success',
        description: 'Subscription plan created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create plan: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, planData }: { id: number; planData: PlanFormData }) =>
      apiRequest('PUT', `/api/admin/subscription-plans/${id}`, planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      setEditingPlan(null);
      setFormData(defaultFormData);
      toast({
        title: 'Success',
        description: 'Subscription plan updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update plan: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/admin/subscription-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: 'Success',
        description: 'Subscription plan deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete plan: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, planData: formData });
    } else {
      createPlanMutation.mutate(formData);
    }
  };

  const startEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      interval: plan.interval,
      trialDays: plan.trialDays,
      isActive: plan.isActive,
      features: plan.features || [],
      maxVessels: plan.maxVessels,
      maxPorts: plan.maxPorts,
      maxRefineries: plan.maxRefineries,
      canAccessBrokerFeatures: plan.canAccessBrokerFeatures,
      canAccessAnalytics: plan.canAccessAnalytics,
      canExportData: plan.canExportData,
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Subscription Plans Management</h2>
          <p className="text-muted-foreground">Manage subscription plans, pricing, and features</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
            </DialogHeader>
            <PlanForm
              formData={formData}
              setFormData={setFormData}
              newFeature={newFeature}
              setNewFeature={setNewFeature}
              addFeature={addFeature}
              removeFeature={removeFeature}
              onSubmit={handleSubmit}
              isSubmitting={createPlanMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan: SubscriptionPlan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {plan.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>

              {plan.trialDays > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Calendar className="w-4 h-4" />
                  {plan.trialDays}-day free trial
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Max Vessels: {plan.maxVessels === -1 ? 'Unlimited' : plan.maxVessels}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Ports: {plan.maxPorts === -1 ? 'Unlimited' : plan.maxPorts}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Refineries: {plan.maxRefineries === -1 ? 'Unlimited' : plan.maxRefineries}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-medium text-sm">Features:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {plan.features?.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                  {plan.features?.length > 3 && (
                    <li className="text-muted-foreground">+{plan.features.length - 3} more...</li>
                  )}
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(plan)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletePlanMutation.mutate(plan.id)}
                  disabled={deletePlanMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
          </DialogHeader>
          <PlanForm
            formData={formData}
            setFormData={setFormData}
            newFeature={newFeature}
            setNewFeature={setNewFeature}
            addFeature={addFeature}
            removeFeature={removeFeature}
            onSubmit={handleSubmit}
            isSubmitting={updatePlanMutation.isPending}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PlanFormProps {
  formData: PlanFormData;
  setFormData: (data: PlanFormData | ((prev: PlanFormData) => PlanFormData)) => void;
  newFeature: string;
  setNewFeature: (feature: string) => void;
  addFeature: () => void;
  removeFeature: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

function PlanForm({
  formData,
  setFormData,
  newFeature,
  setNewFeature,
  addFeature,
  removeFeature,
  onSubmit,
  isSubmitting,
  isEditing = false
}: PlanFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="limits">Limits & Access</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Professional Plan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="99.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the plan"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interval">Billing Interval</Label>
              <select
                id="interval"
                value={formData.interval}
                onChange={(e) => setFormData(prev => ({ ...prev, interval: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trialDays">Trial Days</Label>
              <Input
                id="trialDays"
                type="number"
                value={formData.trialDays}
                onChange={(e) => setFormData(prev => ({ ...prev, trialDays: parseInt(e.target.value) || 0 }))}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>{formData.isActive ? 'Active' : 'Inactive'}</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="space-y-2">
            <Label>Plan Features</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature}>Add</Button>
            </div>
          </div>

          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="flex-1">{feature}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxVessels">Max Vessels</Label>
              <Input
                id="maxVessels"
                type="number"
                value={formData.maxVessels}
                onChange={(e) => setFormData(prev => ({ ...prev, maxVessels: parseInt(e.target.value) || 0 }))}
                placeholder="50 (-1 for unlimited)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPorts">Max Ports</Label>
              <Input
                id="maxPorts"
                type="number"
                value={formData.maxPorts}
                onChange={(e) => setFormData(prev => ({ ...prev, maxPorts: parseInt(e.target.value) || 0 }))}
                placeholder="5 (-1 for unlimited)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRefineries">Max Refineries</Label>
              <Input
                id="maxRefineries"
                type="number"
                value={formData.maxRefineries}
                onChange={(e) => setFormData(prev => ({ ...prev, maxRefineries: parseInt(e.target.value) || 0 }))}
                placeholder="10 (-1 for unlimited)"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.canAccessBrokerFeatures}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canAccessBrokerFeatures: checked }))}
              />
              <Label>Broker Features Access</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.canAccessAnalytics}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canAccessAnalytics: checked }))}
              />
              <Label>Analytics Access</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.canExportData}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canExportData: checked }))}
              />
              <Label>Data Export Access</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}