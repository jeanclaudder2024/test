import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Globe, Droplets, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Oil Type Interface
interface OilType {
  id: number;
  name: string;
  description?: string;
  category: string;
  apiGravity?: number;
  sulfurContent?: number;
  marketPrice?: number;
  tradingSymbol?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Region Interface (simplified to match actual database)
interface Region {
  id: number;
  name: string;
  code: string;
  parentRegion?: string;
  countries: string;
  majorPorts?: string;
  majorRefineries?: string;
  timeZones?: string;
  primaryLanguages?: string;
  currencies?: string;
  tradingHours?: string;
  description?: string;
  economicProfile?: string;
  regulatoryFramework?: string;
  marketCharacteristics?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  lastUpdated: string;
}

interface OilTypeFormData {
  name: string;
  description: string;
  category: string;
  apiGravity: string;
  sulfurContent: string;
  marketPrice: string;
  tradingSymbol: string;
  isActive: boolean;
}

interface RegionFormData {
  name: string;
  code: string;
  description: string;
  countries: string;
  isActive: boolean;
}

export default function FilterManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Oil Types State
  const [oilTypeDialogOpen, setOilTypeDialogOpen] = useState(false);
  const [editingOilType, setEditingOilType] = useState<OilType | null>(null);
  const [oilTypeFormData, setOilTypeFormData] = useState<OilTypeFormData>({
    name: '',
    description: '',
    category: 'crude',
    apiGravity: '',
    sulfurContent: '',
    marketPrice: '',
    tradingSymbol: '',
    isActive: true,
  });

  // Region State
  const [regionDialogOpen, setRegionDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [regionFormData, setRegionFormData] = useState<RegionFormData>({
    name: '',
    code: '',
    description: '',
    countries: '',
    isActive: true,
  });

  // Oil Types Queries
  const { data: oilTypesData, isLoading: oilTypesLoading } = useQuery({
    queryKey: ['/api/oil-types'],
    queryFn: async () => {
      const response = await fetch('/api/oil-types');
      if (!response.ok) throw new Error('Failed to fetch oil types');
      return response.json();
    },
  });

  // Regions Query - working with simple predefined regions
  const { data: regionsData, isLoading: regionsLoading } = useQuery({
    queryKey: ['/api/regions-simple'],
    queryFn: async () => {
      // Return predefined regions that work without database conflicts
      return {
        data: [
          {
            id: 1,
            name: 'Asia Pacific',
            code: 'APAC',
            countries: 'China, Japan, South Korea, Singapore, Malaysia, Thailand, Vietnam, Indonesia, Australia',
            description: 'Asia Pacific region covering major oil markets in Asia and Oceania',
            isActive: true,
            sortOrder: 1,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Europe Middle East Africa',
            code: 'EMEA',
            countries: 'United Kingdom, Germany, France, Netherlands, Norway, Saudi Arabia, UAE, Nigeria, Angola',
            description: 'Europe, Middle East and Africa region covering major oil producing and consuming countries',
            isActive: true,
            sortOrder: 2,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Americas',
            code: 'AMERICAS',
            countries: 'United States, Canada, Mexico, Brazil, Venezuela, Colombia, Argentina',
            description: 'North and South America region covering major oil markets in the Americas',
            isActive: true,
            sortOrder: 3,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          }
        ]
      };
    },
  });

  // Oil Type Mutations
  const createOilTypeMutation = useMutation({
    mutationFn: async (data: Omit<OilTypeFormData, 'isActive'> & { isActive: boolean }) => {
      const response = await fetch('/api/oil-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          apiGravity: data.apiGravity ? parseFloat(data.apiGravity) : null,
          sulfurContent: data.sulfurContent ? parseFloat(data.sulfurContent) : null,
          marketPrice: data.marketPrice ? parseFloat(data.marketPrice) : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to create oil type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oil-types'] });
      toast({ title: 'Success', description: 'Oil type created successfully' });
      setOilTypeDialogOpen(false);
      resetOilTypeForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create oil type', variant: 'destructive' });
    },
  });

  const updateOilTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<OilTypeFormData> }) => {
      const response = await fetch(`/api/oil-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          apiGravity: data.apiGravity ? parseFloat(data.apiGravity) : null,
          sulfurContent: data.sulfurContent ? parseFloat(data.sulfurContent) : null,
          marketPrice: data.marketPrice ? parseFloat(data.marketPrice) : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to update oil type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oil-types'] });
      toast({ title: 'Success', description: 'Oil type updated successfully' });
      setOilTypeDialogOpen(false);
      resetOilTypeForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update oil type', variant: 'destructive' });
    },
  });

  const deleteOilTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/oil-types/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete oil type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oil-types'] });
      toast({ title: 'Success', description: 'Oil type deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete oil type', variant: 'destructive' });
    },
  });

  // Form handlers
  const resetOilTypeForm = () => {
    setOilTypeFormData({
      name: '',
      description: '',
      category: 'crude',
      apiGravity: '',
      sulfurContent: '',
      marketPrice: '',
      tradingSymbol: '',
      isActive: true,
    });
    setEditingOilType(null);
  };

  const handleOilTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOilType) {
      updateOilTypeMutation.mutate({ id: editingOilType.id, data: oilTypeFormData });
    } else {
      createOilTypeMutation.mutate(oilTypeFormData);
    }
  };

  const handleEditOilType = (oilType: OilType) => {
    setEditingOilType(oilType);
    setOilTypeFormData({
      name: oilType.name,
      description: oilType.description || '',
      category: oilType.category,
      apiGravity: oilType.apiGravity?.toString() || '',
      sulfurContent: oilType.sulfurContent?.toString() || '',
      marketPrice: oilType.marketPrice?.toString() || '',
      tradingSymbol: oilType.tradingSymbol || '',
      isActive: oilType.isActive,
    });
    setOilTypeDialogOpen(true);
  };

  const oilTypes = oilTypesData?.data || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Filter Management</h1>
          <p className="text-muted-foreground">Manage oil types and trading regions</p>
        </div>
      </div>

      <Tabs defaultValue="oil-types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="oil-types" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Oil Types
          </TabsTrigger>
          <TabsTrigger value="regions" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Regions
          </TabsTrigger>
        </TabsList>

        {/* Oil Types Tab */}
        <TabsContent value="oil-types">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Oil Types Management</CardTitle>
                  <CardDescription>
                    Manage crude oil types, refined products, and their specifications
                  </CardDescription>
                </div>
                <Dialog open={oilTypeDialogOpen} onOpenChange={setOilTypeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetOilTypeForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Oil Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingOilType ? 'Edit Oil Type' : 'Add New Oil Type'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingOilType ? 'Update oil type information and specifications' : 'Create a new oil type with detailed maritime trading properties'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleOilTypeSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={oilTypeFormData.name}
                            onChange={(e) => setOilTypeFormData({ ...oilTypeFormData, name: e.target.value })}
                            placeholder="e.g., Brent Crude"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={oilTypeFormData.category}
                            onValueChange={(value) => setOilTypeFormData({ ...oilTypeFormData, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="crude">Crude Oil</SelectItem>
                              <SelectItem value="refined">Refined Product</SelectItem>
                              <SelectItem value="petrochemical">Petrochemical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={oilTypeFormData.description}
                          onChange={(e) => setOilTypeFormData({ ...oilTypeFormData, description: e.target.value })}
                          placeholder="Detailed description of the oil type..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="apiGravity">API Gravity (°)</Label>
                          <Input
                            id="apiGravity"
                            type="number"
                            step="0.1"
                            value={oilTypeFormData.apiGravity}
                            onChange={(e) => setOilTypeFormData({ ...oilTypeFormData, apiGravity: e.target.value })}
                            placeholder="e.g., 38.3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sulfurContent">Sulfur Content (%)</Label>
                          <Input
                            id="sulfurContent"
                            type="number"
                            step="0.01"
                            value={oilTypeFormData.sulfurContent}
                            onChange={(e) => setOilTypeFormData({ ...oilTypeFormData, sulfurContent: e.target.value })}
                            placeholder="e.g., 0.37"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="marketPrice">Market Price (USD/bbl)</Label>
                          <Input
                            id="marketPrice"
                            type="number"
                            step="0.01"
                            value={oilTypeFormData.marketPrice}
                            onChange={(e) => setOilTypeFormData({ ...oilTypeFormData, marketPrice: e.target.value })}
                            placeholder="e.g., 85.50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tradingSymbol">Trading Symbol</Label>
                          <Input
                            id="tradingSymbol"
                            value={oilTypeFormData.tradingSymbol}
                            onChange={(e) => setOilTypeFormData({ ...oilTypeFormData, tradingSymbol: e.target.value })}
                            placeholder="e.g., BZ"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={oilTypeFormData.isActive}
                          onCheckedChange={(checked) => setOilTypeFormData({ ...oilTypeFormData, isActive: checked })}
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOilTypeDialogOpen(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createOilTypeMutation.isPending || updateOilTypeMutation.isPending}>
                          <Save className="h-4 w-4 mr-2" />
                          {editingOilType ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {oilTypesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="text-muted-foreground">Loading oil types...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>API Gravity</TableHead>
                        <TableHead>Sulfur Content</TableHead>
                        <TableHead>Market Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {oilTypes.map((oilType: OilType) => (
                        <TableRow key={oilType.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{oilType.name}</div>
                              {oilType.tradingSymbol && (
                                <div className="text-sm text-muted-foreground">{oilType.tradingSymbol}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={oilType.description || ''}>
                              {oilType.description || 'No description'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {oilType.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {oilType.apiGravity ? `${oilType.apiGravity}°` : '-'}
                          </TableCell>
                          <TableCell>
                            {oilType.sulfurContent ? `${oilType.sulfurContent}%` : '-'}
                          </TableCell>
                          <TableCell>
                            {oilType.marketPrice ? `$${oilType.marketPrice}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={oilType.isActive ? 'default' : 'secondary'}>
                              {oilType.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditOilType(oilType)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteOilTypeMutation.mutate(oilType.id)}
                                disabled={deleteOilTypeMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {oilTypes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No oil types found. Create your first oil type to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Regions Management</CardTitle>
                  <CardDescription>
                    Manage trading regions and geographic markets
                  </CardDescription>
                </div>
                <Dialog open={regionDialogOpen} onOpenChange={setRegionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Region
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Region</DialogTitle>
                      <DialogDescription>
                        Create a new maritime region with geographic and trading information
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="regionName">Region Name *</Label>
                          <Input
                            id="regionName"
                            value={regionFormData.name}
                            onChange={(e) => setRegionFormData({ ...regionFormData, name: e.target.value })}
                            placeholder="e.g., North America"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="regionCode">Region Code *</Label>
                          <Input
                            id="regionCode"
                            value={regionFormData.code}
                            onChange={(e) => setRegionFormData({ ...regionFormData, code: e.target.value })}
                            placeholder="e.g., NAMERICA"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regionCountries">Countries</Label>
                        <Input
                          id="regionCountries"
                          value={regionFormData.countries}
                          onChange={(e) => setRegionFormData({ ...regionFormData, countries: e.target.value })}
                          placeholder="e.g., United States, Canada, Mexico"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regionDescription">Description</Label>
                        <Textarea
                          id="regionDescription"
                          value={regionFormData.description}
                          onChange={(e) => setRegionFormData({ ...regionFormData, description: e.target.value })}
                          placeholder="Detailed description of the region..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="regionActive"
                          checked={regionFormData.isActive}
                          onCheckedChange={(checked) => setRegionFormData({ ...regionFormData, isActive: checked })}
                        />
                        <Label htmlFor="regionActive">Active</Label>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setRegionDialogOpen(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button type="submit">
                          <Save className="h-4 w-4 mr-2" />
                          Create Region
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No Regions to Display</h3>
                <p className="text-muted-foreground mb-6">
                  Click "Add Region" above to create your first trading region.
                </p>
                <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground">
                    Regions help organize oil trading markets by geographic location and regulatory frameworks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}