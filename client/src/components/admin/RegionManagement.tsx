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
import { Plus, Edit, Trash2, Search, Filter, Globe, MapPin, Clock, DollarSign, Building, TrendingUp } from 'lucide-react';

interface Region {
  id: number;
  name: string;
  displayName: string;
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

interface FormData {
  name: string;
  displayName: string;
  code: string;
  parentRegion: string;
  countries: string;
  majorPorts: string;
  majorRefineries: string;
  timeZones: string;
  primaryLanguages: string;
  currencies: string;
  tradingHours: string;
  description: string;
  economicProfile: string;
  regulatoryFramework: string;
  marketCharacteristics: string;
  isActive: boolean;
  sortOrder: string;
}

const initialFormData: FormData = {
  name: '',
  displayName: '',
  code: '',
  parentRegion: '',
  countries: '',
  majorPorts: '',
  majorRefineries: '',
  timeZones: '',
  primaryLanguages: '',
  currencies: '',
  tradingHours: '',
  description: '',
  economicProfile: '',
  regulatoryFramework: '',
  marketCharacteristics: '',
  isActive: true,
  sortOrder: '0',
};

const predefinedRegions = [
  { code: 'APAC', name: 'Asia-Pacific', description: 'Asia-Pacific region including major oil consuming markets' },
  { code: 'EMEA', name: 'Europe, Middle East & Africa', description: 'European, Middle Eastern and African markets' },
  { code: 'AMERICAS', name: 'Americas', description: 'North and South American markets' },
  { code: 'MENA', name: 'Middle East & North Africa', description: 'Major oil producing region' },
  { code: 'SEA', name: 'Southeast Asia', description: 'Southeast Asian emerging markets' },
];

export default function RegionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [parentRegionFilter, setParentRegionFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [page, setPage] = useState(1);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch regions
  const { data: regionsData, isLoading, error } = useQuery({
    queryKey: ['regions', page, searchTerm, parentRegionFilter, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        parentRegion: parentRegionFilter,
        isActive: activeFilter,
      });
      
      const response = await fetch(`/api/regions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch regions');
      return response.json();
    },
  });

  // Create region mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<FormData>) => {
      const response = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create region');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      toast({ title: 'Region created successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to create region', variant: 'destructive' });
    },
  });

  // Update region mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FormData> }) => {
      const response = await fetch(`/api/regions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update region');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      setIsDialogOpen(false);
      setEditingRegion(null);
      setFormData(initialFormData);
      toast({ title: 'Region updated successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to update region', variant: 'destructive' });
    },
  });

  // Delete region mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/regions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete region');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      toast({ title: 'Region deleted successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to delete region', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      sortOrder: parseInt(formData.sortOrder) || 0,
    };

    if (editingRegion) {
      updateMutation.mutate({ id: editingRegion.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (region: Region) => {
    setEditingRegion(region);
    setFormData({
      name: region.name,
      displayName: region.displayName,
      code: region.code,
      parentRegion: region.parentRegion || '',
      countries: region.countries,
      majorPorts: region.majorPorts || '',
      majorRefineries: region.majorRefineries || '',
      timeZones: region.timeZones || '',
      primaryLanguages: region.primaryLanguages || '',
      currencies: region.currencies || '',
      tradingHours: region.tradingHours || '',
      description: region.description || '',
      economicProfile: region.economicProfile || '',
      regulatoryFramework: region.regulatoryFramework || '',
      marketCharacteristics: region.marketCharacteristics || '',
      isActive: region.isActive,
      sortOrder: region.sortOrder.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this region?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingRegion(null);
  };

  const populatePredefinedRegion = (predefined: typeof predefinedRegions[0]) => {
    setFormData({
      ...formData,
      name: predefined.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      displayName: predefined.name,
      code: predefined.code,
      description: predefined.description,
    });
  };

  const parseJsonField = (field: string) => {
    try {
      return JSON.parse(field || '[]');
    } catch {
      return [];
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-destructive">Failed to load regions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Region Management</h2>
          <p className="text-muted-foreground">Manage trading regions and geographic markets for the platform</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Region
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRegion ? 'Edit Region' : 'Create New Region'}</DialogTitle>
              <DialogDescription>
                {editingRegion ? 'Update the region information below.' : 'Add a new trading region with detailed market information.'}
              </DialogDescription>
            </DialogHeader>
            
            {!editingRegion && (
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Quick Start - Predefined Regions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {predefinedRegions.map((region) => (
                    <Button
                      key={region.code}
                      variant="outline"
                      size="sm"
                      onClick={() => populatePredefinedRegion(region)}
                      className="justify-start h-auto p-3"
                    >
                      <div className="text-left">
                        <div className="font-medium">{region.name}</div>
                        <div className="text-xs text-muted-foreground">{region.code}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Internal Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="asia_pacific"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="Asia-Pacific"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Region Code *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="APAC"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parentRegion">Parent Region</Label>
                    <Input
                      id="parentRegion"
                      value={formData.parentRegion}
                      onChange={(e) => setFormData({ ...formData, parentRegion: e.target.value })}
                      placeholder="Leave empty for top-level regions"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="countries">Countries (JSON array) *</Label>
                    <Textarea
                      id="countries"
                      value={formData.countries}
                      onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
                      placeholder='["US", "CA", "MX"]'
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="majorPorts">Major Ports (JSON array)</Label>
                    <Textarea
                      id="majorPorts"
                      value={formData.majorPorts}
                      onChange={(e) => setFormData({ ...formData, majorPorts: e.target.value })}
                      placeholder='["Port of Los Angeles", "Port of Long Beach"]'
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="majorRefineries">Major Refineries (JSON array)</Label>
                    <Textarea
                      id="majorRefineries"
                      value={formData.majorRefineries}
                      onChange={(e) => setFormData({ ...formData, majorRefineries: e.target.value })}
                      placeholder='["Phillips 66 Refinery", "Marathon Refinery"]'
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeZones">Time Zones (JSON array)</Label>
                    <Textarea
                      id="timeZones"
                      value={formData.timeZones}
                      onChange={(e) => setFormData({ ...formData, timeZones: e.target.value })}
                      placeholder='["PST", "EST", "CST"]'
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryLanguages">Primary Languages (JSON array)</Label>
                    <Textarea
                      id="primaryLanguages"
                      value={formData.primaryLanguages}
                      onChange={(e) => setFormData({ ...formData, primaryLanguages: e.target.value })}
                      placeholder='["English", "Spanish", "French"]'
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currencies">Currencies (JSON array)</Label>
                    <Textarea
                      id="currencies"
                      value={formData.currencies}
                      onChange={(e) => setFormData({ ...formData, currencies: e.target.value })}
                      placeholder='["USD", "CAD", "MXN"]'
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tradingHours">Trading Hours (JSON object)</Label>
                    <Textarea
                      id="tradingHours"
                      value={formData.tradingHours}
                      onChange={(e) => setFormData({ ...formData, tradingHours: e.target.value })}
                      placeholder='{"open": "09:00", "close": "17:00", "timezone": "EST"}'
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Regional overview and key characteristics..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="economicProfile">Economic Profile</Label>
                  <Textarea
                    id="economicProfile"
                    value={formData.economicProfile}
                    onChange={(e) => setFormData({ ...formData, economicProfile: e.target.value })}
                    placeholder="GDP, oil consumption, economic indicators..."
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regulatoryFramework">Regulatory Framework</Label>
                  <Textarea
                    id="regulatoryFramework"
                    value={formData.regulatoryFramework}
                    onChange={(e) => setFormData({ ...formData, regulatoryFramework: e.target.value })}
                    placeholder="Key regulations, compliance requirements..."
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="marketCharacteristics">Market Characteristics</Label>
                  <Textarea
                    id="marketCharacteristics"
                    value={formData.marketCharacteristics}
                    onChange={(e) => setFormData({ ...formData, marketCharacteristics: e.target.value })}
                    placeholder="Market structure, trading patterns..."
                    rows={4}
                  />
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
                  {editingRegion ? 'Update' : 'Create'} Region
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
                  placeholder="Search regions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parent-filter">Parent Region</Label>
              <Select value={parentRegionFilter} onValueChange={setParentRegionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="">Top Level Only</SelectItem>
                  {predefinedRegions.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.name}
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
                  setParentRegionFilter('all');
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

      {/* Regions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Regions ({regionsData?.pagination?.total || 0})</span>
            <Badge variant="outline">
              Page {regionsData?.pagination?.page || 1} of {regionsData?.pagination?.totalPages || 1}
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
                    <TableHead>Region</TableHead>
                    <TableHead>Countries</TableHead>
                    <TableHead>Major Markets</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionsData?.data?.map((region: Region) => (
                    <TableRow key={region.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{region.displayName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{region.name}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {region.code}
                          </Badge>
                          {region.parentRegion && (
                            <Badge variant="secondary" className="text-xs mt-1 ml-1">
                              Sub-region
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {parseJsonField(region.countries).slice(0, 3).map((country: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1">
                              {country}
                            </Badge>
                          ))}
                          {parseJsonField(region.countries).length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{parseJsonField(region.countries).length - 3} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {region.majorPorts && (
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin className="h-3 w-3 text-blue-500" />
                              {parseJsonField(region.majorPorts).length} ports
                            </div>
                          )}
                          {region.majorRefineries && (
                            <div className="flex items-center gap-1 text-xs">
                              <Building className="h-3 w-3 text-orange-500" />
                              {parseJsonField(region.majorRefineries).length} refineries
                            </div>
                          )}
                          {region.timeZones && (
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3 text-green-500" />
                              {parseJsonField(region.timeZones).length} timezones
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={region.isActive ? "default" : "secondary"}>
                          {region.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(region)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(region.id)}
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
              Page {page} of {regionsData?.pagination?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= (regionsData?.pagination?.totalPages || 1) || isLoading}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}