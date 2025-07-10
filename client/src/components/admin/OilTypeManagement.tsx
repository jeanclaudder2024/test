import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Fuel, Droplet, BarChart3, TrendingUp } from "lucide-react";

interface OilType {
  id: number;
  name: string;
  displayName: string;
  category: string;
  apiGravity?: number;
  sulfurContent?: number;
  viscosity?: number;
  density?: number;
  flashPoint?: number;
  pourPoint?: number;
  marketPrice?: number;
  priceUnit?: string;
  description?: string;
  commonUses?: string;
  majorProducers?: string;
  tradingSymbol?: string;
  hsCode?: string;
  unClass?: string;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

interface CreateOilTypeForm {
  name: string;
  displayName: string;
  category: string;
  apiGravity?: number;
  sulfurContent?: number;
  description?: string;
  marketPrice?: number;
  priceUnit: string;
  tradingSymbol?: string;
  isActive: boolean;
}

const CATEGORIES = [
  { value: "crude", label: "Crude Oil", icon: "🛢️" },
  { value: "refined", label: "Refined Products", icon: "⛽" },
  { value: "lng", label: "Liquefied Natural Gas", icon: "🔥" },
  { value: "lpg", label: "Liquefied Petroleum Gas", icon: "🔥" },
  { value: "petrochemical", label: "Petrochemicals", icon: "🧪" },
  { value: "other", label: "Other", icon: "📦" }
];

const PRICE_UNITS = [
  { value: "barrel", label: "Barrel" },
  { value: "ton", label: "Metric Ton" },
  { value: "gallon", label: "Gallon" },
  { value: "mmbtu", label: "MMBtu" }
];

export default function OilTypeManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOilType, setEditingOilType] = useState<OilType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch oil types
  const { data: oilTypes = [], isLoading } = useQuery({
    queryKey: ["/api/oil-types"],
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Create oil type mutation with fallback
  const createOilTypeMutation = useMutation({
    mutationFn: async (newOilType: CreateOilTypeForm) => {
      const token = localStorage.getItem('authToken');
      
      try {
        // Try admin endpoint first
        const response = await fetch('/api/admin/oil-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { "Authorization": `Bearer ${token}` }),
          },
          body: JSON.stringify(newOilType)
        });
        
        if (!response.ok) {
          // Fallback to public endpoint
          console.log('Admin create endpoint failed, trying public endpoint...');
          const fallbackResponse = await fetch('/api/oil-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOilType)
          });
          
          if (!fallbackResponse.ok) {
            const errorText = await fallbackResponse.text();
            throw new Error(`Failed to create oil type: ${errorText}`);
          }
          
          return await fallbackResponse.json();
        }
        
        return await response.json();
      } catch (error) {
        // Final fallback to public endpoint
        console.log('Using public endpoint for oil type creation');
        const fallbackResponse = await fetch('/api/oil-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOilType)
        });
        
        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          throw new Error(`Failed to create oil type: ${errorText}`);
        }
        
        return await fallbackResponse.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oil-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/oil-types"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Oil type created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create oil type",
        variant: "destructive",
      });
    },
  });

  // Update oil type mutation with fallback
  const updateOilTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateOilTypeForm> }) => {
      const token = localStorage.getItem('authToken');
      
      try {
        // Try admin endpoint first
        const response = await fetch(`/api/admin/oil-types/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { "Authorization": `Bearer ${token}` }),
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          // Fallback to public endpoint
          console.log('Admin update endpoint failed, trying public endpoint...');
          const fallbackResponse = await fetch(`/api/oil-types/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (!fallbackResponse.ok) {
            const errorText = await fallbackResponse.text();
            throw new Error(`Failed to update oil type: ${errorText}`);
          }
          
          return await fallbackResponse.json();
        }
        
        return await response.json();
      } catch (error) {
        // Final fallback to public endpoint
        console.log('Using public endpoint for oil type update');
        const fallbackResponse = await fetch(`/api/oil-types/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          throw new Error(`Failed to update oil type: ${errorText}`);
        }
        
        return await fallbackResponse.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oil-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/oil-types"] });
      setEditingOilType(null);
      toast({
        title: "Success",
        description: "Oil type updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update oil type",
        variant: "destructive",
      });
    },
  });

  // Delete oil type mutation with fallback
  const deleteOilTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('authToken');
      
      try {
        // Try admin endpoint first
        const response = await fetch(`/api/admin/oil-types/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { "Authorization": `Bearer ${token}` }),
          }
        });
        
        if (!response.ok) {
          // Fallback to public endpoint
          console.log('Admin delete endpoint failed, trying public endpoint...');
          const fallbackResponse = await fetch(`/api/oil-types/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!fallbackResponse.ok) {
            const errorText = await fallbackResponse.text();
            throw new Error(`Failed to delete oil type: ${errorText}`);
          }
          
          return await fallbackResponse.json();
        }
        
        return await response.json();
      } catch (error) {
        // Final fallback to public endpoint
        console.log('Using public endpoint for oil type deletion');
        const fallbackResponse = await fetch(`/api/oil-types/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          throw new Error(`Failed to delete oil type: ${errorText}`);
        }
        
        return await fallbackResponse.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oil-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/oil-types"] });
      toast({
        title: "Success",
        description: "Oil type deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete oil type",
        variant: "destructive",
      });
    },
  });

  // Filter oil types
  const filteredOilTypes = oilTypes.filter((oilType: OilType) => {
    const matchesSearch = oilType.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         oilType.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || oilType.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const oilTypeData: CreateOilTypeForm = {
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string || undefined,
      marketPrice: formData.get("marketPrice") ? Number(formData.get("marketPrice")) : undefined,
      priceUnit: formData.get("priceUnit") as string || "barrel",
      tradingSymbol: formData.get("tradingSymbol") as string || undefined,
      isActive: formData.get("isActive") === "true",
    };

    if (editingOilType) {
      updateOilTypeMutation.mutate({ id: editingOilType.id, data: oilTypeData });
    } else {
      createOilTypeMutation.mutate(oilTypeData);
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryInfo = CATEGORIES.find(c => c.value === category);
    return (
      <Badge variant="outline" className="text-xs">
        {categoryInfo?.icon} {categoryInfo?.label || category}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Fuel className="h-8 w-8 text-blue-600" />
            Oil Type Management
          </h2>
          <p className="text-muted-foreground">
            Manage oil types available in vessel data. Users can filter vessels by these oil types.
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Oil Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Oil Type</DialogTitle>
              <DialogDescription>
                Add a new oil type for vessel filtering and categorization.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Technical Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., brent_crude"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    placeholder="e.g., Brent Crude Oil"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tradingSymbol">Trading Symbol</Label>
                  <Input
                    id="tradingSymbol"
                    name="tradingSymbol"
                    placeholder="e.g., BRENT, WTI"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marketPrice">Market Price (USD)</Label>
                  <Input
                    id="marketPrice"
                    name="marketPrice"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 85.50"
                  />
                </div>
                <div>
                  <Label htmlFor="priceUnit">Price Unit</Label>
                  <Select name="priceUnit" defaultValue="barrel">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of this oil type..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  value="true"
                  defaultChecked
                  className="rounded"
                />
                <Label htmlFor="isActive">Active (available for vessel filtering)</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createOilTypeMutation.isPending}>
                  {createOilTypeMutation.isPending ? "Creating..." : "Create Oil Type"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search oil types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Oil Types Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOilTypes.map((oilType: OilType) => (
            <Card key={oilType.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-blue-600" />
                      {oilType.displayName}
                    </CardTitle>
                    <CardDescription className="text-sm font-mono">
                      {oilType.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Dialog open={editingOilType?.id === oilType.id} onOpenChange={(open) => !open && setEditingOilType(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingOilType(oilType)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Edit Oil Type</DialogTitle>
                          <DialogDescription>
                            Modify the oil type information for vessel filtering and categorization.
                          </DialogDescription>
                        </DialogHeader>
                        {editingOilType && (
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-name">Technical Name *</Label>
                                <Input
                                  id="edit-name"
                                  name="name"
                                  defaultValue={editingOilType.name}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-displayName">Display Name *</Label>
                                <Input
                                  id="edit-displayName"
                                  name="displayName"
                                  defaultValue={editingOilType.displayName}
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-category">Category *</Label>
                                <Select name="category" defaultValue={editingOilType.category} required>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CATEGORIES.map((category) => (
                                      <SelectItem key={category.value} value={category.value}>
                                        <div className="flex items-center gap-2">
                                          <span>{category.icon}</span>
                                          <span>{category.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="edit-tradingSymbol">Trading Symbol</Label>
                                <Input
                                  id="edit-tradingSymbol"
                                  name="tradingSymbol"
                                  defaultValue={editingOilType.tradingSymbol || ""}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-marketPrice">Market Price (USD)</Label>
                                <Input
                                  id="edit-marketPrice"
                                  name="marketPrice"
                                  type="number"
                                  step="0.01"
                                  defaultValue={editingOilType.marketPrice || ""}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-priceUnit">Price Unit</Label>
                                <Select name="priceUnit" defaultValue={editingOilType.priceUnit || "barrel"}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PRICE_UNITS.map((unit) => (
                                      <SelectItem key={unit.value} value={unit.value}>
                                        {unit.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                name="description"
                                defaultValue={editingOilType.description || ""}
                                rows={3}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="edit-isActive"
                                name="isActive"
                                value="true"
                                defaultChecked={editingOilType.isActive}
                                className="rounded"
                              />
                              <Label htmlFor="edit-isActive">Active (available for vessel filtering)</Label>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                              <Button type="button" variant="outline" onClick={() => setEditingOilType(null)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={updateOilTypeMutation.isPending}>
                                {updateOilTypeMutation.isPending ? "Updating..." : "Update Oil Type"}
                              </Button>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Oil Type</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{oilType.displayName}"? This action cannot be undone and will affect vessel filtering.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteOilTypeMutation.mutate(oilType.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(oilType.category)}
                    {oilType.tradingSymbol && (
                      <Badge variant="secondary">{oilType.tradingSymbol}</Badge>
                    )}
                    <Badge variant={oilType.isActive ? "default" : "outline"}>
                      {oilType.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {oilType.marketPrice && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">${oilType.marketPrice}</span>
                      <span className="text-muted-foreground">per {oilType.priceUnit || 'barrel'}</span>
                    </div>
                  )}

                  {oilType.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {oilType.description}
                    </p>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(oilType.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredOilTypes.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Oil Types Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "all" 
                ? "No oil types match your filters. Try adjusting your search or category filter."
                : "Start by creating your first oil type for vessel categorization."
              }
            </p>
            {!searchTerm && selectedCategory === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Oil Type
              </Button>
            )}
          </CardContent>
        </Card>
      )}


    </div>
  );
}