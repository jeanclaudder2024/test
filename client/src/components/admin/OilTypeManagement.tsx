import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Filter, BarChart3, TrendingUp, Fuel, Factory, Droplet, Zap } from 'lucide-react';

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
  priceUnit: string;
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

interface FormData {
  name: string;
  displayName: string;
  category: string;
  apiGravity: string;
  sulfurContent: string;
  viscosity: string;
  density: string;
  flashPoint: string;
  pourPoint: string;
  marketPrice: string;
  priceUnit: string;
  description: string;
  commonUses: string;
  majorProducers: string;
  tradingSymbol: string;
  hsCode: string;
  unClass: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  name: '',
  displayName: '',
  category: 'crude',
  apiGravity: '',
  sulfurContent: '',
  viscosity: '',
  density: '',
  flashPoint: '',
  pourPoint: '',
  marketPrice: '',
  priceUnit: 'barrel',
  description: '',
  commonUses: '',
  majorProducers: '',
  tradingSymbol: '',
  hsCode: '',
  unClass: '',
  isActive: true,
};

const categories = [
  { value: 'crude', label: 'Crude Oil', icon: <Fuel className="h-4 w-4" /> },
  { value: 'refined', label: 'Refined Products', icon: <Factory className="h-4 w-4" /> },
  { value: 'lng', label: 'Liquefied Natural Gas', icon: <Droplet className="h-4 w-4" /> },
  { value: 'lpg', label: 'Liquefied Petroleum Gas', icon: <Zap className="h-4 w-4" /> },
  { value: 'petrochemical', label: 'Petrochemicals', icon: <BarChart3 className="h-4 w-4" /> },
];

export default function OilTypeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOilType, setEditingOilType] = useState<OilType | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [page, setPage] = useState(1);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch oil types
  const { data: oilTypesData, isLoading, error } = useQuery({
    queryKey: ['oil-types', page, searchTerm, selectedCategory, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        category: selectedCategory,
        isActive: activeFilter,
      });
      
      const response = await fetch(`/api/oil-types?${params}`);
      if (!response.ok) throw new Error('Failed to fetch oil types');
      return response.json();
    },
  });

  // Create oil type mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<FormData>) => {
      const response = await fetch('/api/oil-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create oil type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oil-types'] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      toast({ title: 'Oil type created successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to create oil type', variant: 'destructive' });
    },
  });

  // Update oil type mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FormData> }) => {
      const response = await fetch(`/api/oil-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update oil type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oil-types'] });
      setIsDialogOpen(false);
      setEditingOilType(null);
      setFormData(initialFormData);
      toast({ title: 'Oil type updated successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to update oil type', variant: 'destructive' });
    },
  });

  // Delete oil type mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/oil-types/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete oil type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oil-types'] });
      toast({ title: 'Oil type deleted successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to delete oil type', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      apiGravity: formData.apiGravity ? parseFloat(formData.apiGravity) : undefined,
      sulfurContent: formData.sulfurContent ? parseFloat(formData.sulfurContent) : undefined,
      viscosity: formData.viscosity ? parseFloat(formData.viscosity) : undefined,
      density: formData.density ? parseFloat(formData.density) : undefined,
      flashPoint: formData.flashPoint ? parseInt(formData.flashPoint) : undefined,
      pourPoint: formData.pourPoint ? parseInt(formData.pourPoint) : undefined,
      marketPrice: formData.marketPrice ? parseFloat(formData.marketPrice) : undefined,
    };

    if (editingOilType) {
      updateMutation.mutate({ id: editingOilType.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (oilType: OilType) => {
    setEditingOilType(oilType);
    setFormData({
      name: oilType.name,
      displayName: oilType.displayName,
      category: oilType.category,
      apiGravity: oilType.apiGravity?.toString() || '',
      sulfurContent: oilType.sulfurContent?.toString() || '',
      viscosity: oilType.viscosity?.toString() || '',
      density: oilType.density?.toString() || '',
      flashPoint: oilType.flashPoint?.toString() || '',
      pourPoint: oilType.pourPoint?.toString() || '',
      marketPrice: oilType.marketPrice?.toString() || '',
      priceUnit: oilType.priceUnit,
      description: oilType.description || '',
      commonUses: oilType.commonUses || '',
      majorProducers: oilType.majorProducers || '',
      tradingSymbol: oilType.tradingSymbol || '',
      hsCode: oilType.hsCode || '',
      unClass: oilType.unClass || '',
      isActive: oilType.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this oil type?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingOilType(null);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || <Fuel className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crude': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'refined': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'lng': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'lpg': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'petrochemical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-destructive">Failed to load oil types</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Oil Type Management</h2>
          <p className="text-muted-foreground">Manage oil types, categories, and specifications for the platform</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Oil Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOilType ? 'Edit Oil Type' : 'Create New Oil Type'}</DialogTitle>
              <DialogDescription>
                {editingOilType ? 'Update the oil type information below.' : 'Add a new oil type to the system with detailed specifications.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Internal Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="crude_wti"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="West Texas Intermediate"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              {cat.icon}
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tradingSymbol">Trading Symbol</Label>
                    <Input
                      id="tradingSymbol"
                      value={formData.tradingSymbol}
                      onChange={(e) => setFormData({ ...formData, tradingSymbol: e.target.value })}
                      placeholder="WTI, BRENT, etc."
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiGravity">API Gravity</Label>
                      <Input
                        id="apiGravity"
                        type="number"
                        step="0.01"
                        value={formData.apiGravity}
                        onChange={(e) => setFormData({ ...formData, apiGravity: e.target.value })}
                        placeholder="39.6"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sulfurContent">Sulfur Content (%)</Label>
                      <Input
                        id="sulfurContent"
                        type="number"
                        step="0.001"
                        value={formData.sulfurContent}
                        onChange={(e) => setFormData({ ...formData, sulfurContent: e.target.value })}
                        placeholder="0.24"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="viscosity">Viscosity (cSt)</Label>
                      <Input
                        id="viscosity"
                        type="number"
                        step="0.01"
                        value={formData.viscosity}
                        onChange={(e) => setFormData({ ...formData, viscosity: e.target.value })}
                        placeholder="2.5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="density">Density (g/cm³)</Label>
                      <Input
                        id="density"
                        type="number"
                        step="0.0001"
                        value={formData.density}
                        onChange={(e) => setFormData({ ...formData, density: e.target.value })}
                        placeholder="0.827"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flashPoint">Flash Point (°C)</Label>
                      <Input
                        id="flashPoint"
                        type="number"
                        value={formData.flashPoint}
                        onChange={(e) => setFormData({ ...formData, flashPoint: e.target.value })}
                        placeholder="-18"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pourPoint">Pour Point (°C)</Label>
                      <Input
                        id="pourPoint"
                        type="number"
                        value={formData.pourPoint}
                        onChange={(e) => setFormData({ ...formData, pourPoint: e.target.value })}
                        placeholder="-30"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marketPrice">Market Price</Label>
                      <Input
                        id="marketPrice"
                        type="number"
                        step="0.01"
                        value={formData.marketPrice}
                        onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                        placeholder="75.50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priceUnit">Price Unit</Label>
                      <Select value={formData.priceUnit} onValueChange={(value) => setFormData({ ...formData, priceUnit: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="barrel">Per Barrel</SelectItem>
                          <SelectItem value="ton">Per Ton</SelectItem>
                          <SelectItem value="gallon">Per Gallon</SelectItem>
                          <SelectItem value="mmbtu">Per MMBtu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hsCode">HS Code</Label>
                    <Input
                      id="hsCode"
                      value={formData.hsCode}
                      onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                      placeholder="2709.00.10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unClass">UN Classification</Label>
                    <Input
                      id="unClass"
                      value={formData.unClass}
                      onChange={(e) => setFormData({ ...formData, unClass: e.target.value })}
                      placeholder="UN1267"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Light, sweet crude oil with low sulfur content..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commonUses">Common Uses (JSON array)</Label>
                    <Textarea
                      id="commonUses"
                      value={formData.commonUses}
                      onChange={(e) => setFormData({ ...formData, commonUses: e.target.value })}
                      placeholder='["Gasoline production", "Diesel fuel", "Jet fuel"]'
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="majorProducers">Major Producers (JSON array)</Label>
                    <Textarea
                      id="majorProducers"
                      value={formData.majorProducers}
                      onChange={(e) => setFormData({ ...formData, majorProducers: e.target.value })}
                      placeholder='["United States", "Canada", "Mexico"]'
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingOilType ? 'Update' : 'Create'} Oil Type
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search oil types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        {cat.icon}
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="active-filter">Status</Label>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Active Only</SelectItem>
                  <SelectItem value="false">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Actions</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setActiveFilter('all');
                  setPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oil Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Oil Types ({oilTypesData?.pagination?.total || 0})</span>
            <Badge variant="outline">
              Page {oilTypesData?.pagination?.page || 1} of {oilTypesData?.pagination?.totalPages || 1}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Market Price</TableHead>
                    <TableHead>API Gravity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {oilTypesData?.data?.map((oilType: OilType) => (
                    <TableRow key={oilType.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{oilType.displayName}</div>
                          <div className="text-sm text-muted-foreground">{oilType.name}</div>
                          {oilType.tradingSymbol && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {oilType.tradingSymbol}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(oilType.category)}>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(oilType.category)}
                            {categories.find(c => c.value === oilType.category)?.label || oilType.category}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {oilType.marketPrice ? (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            ${oilType.marketPrice.toFixed(2)}
                            <span className="text-xs text-muted-foreground">/{oilType.priceUnit}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {oilType.apiGravity ? `${oilType.apiGravity}°` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={oilType.isActive ? "default" : "secondary"}>
                          {oilType.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(oilType)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(oilType.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {oilTypesData?.pagination?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= (oilTypesData?.pagination?.totalPages || 1) || isLoading}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}