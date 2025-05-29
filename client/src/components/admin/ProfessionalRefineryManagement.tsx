import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Factory,
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Building,
  Globe,
  Activity,
  TrendingUp,
  Filter,
  Download,
  Upload,
  Settings,
  Wand2,
  Target,
  Navigation,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RefineryLocationSelector from '@/components/map/RefineryLocationSelector';
import { Textarea } from '@/components/ui/textarea';

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  capacity: number | null;
  latitude: string;
  longitude: string;
  type: string | null;
  status: string | null;
  description: string | null;
  lastUpdated: Date | null;
}

const regions = [
  'All Regions',
  'Middle East',
  'North America', 
  'Europe',
  'Asia Pacific',
  'Africa',
  'South America',
  'Caribbean'
];

const refineryTypes = [
  'Crude Oil Refinery',
  'Heavy Oil Refinery',
  'Light Oil Refinery',
  'Petrochemical Complex',
  'Gas Processing Plant',
  'Condensate Splitter'
];

const statusOptions = [
  'Operational',
  'Under Maintenance',
  'Planned Shutdown',
  'Decommissioned',
  'Under Construction'
];

export default function ProfessionalRefineryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRefinery, setEditingRefinery] = useState<Refinery | null>(null);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    region: 'Middle East',
    capacity: '',
    latitude: '',
    longitude: '',
    type: 'Crude Oil Refinery',
    status: 'Operational',
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: refineries = [], isLoading } = useQuery({
    queryKey: ['/api/refineries'],
  });

  const addRefineryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/refineries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add refinery');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
      toast({ title: 'Success', description: 'Refinery added successfully' });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add refinery', variant: 'destructive' });
    },
  });

  const updateRefineryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/refineries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update refinery');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
      toast({ title: 'Success', description: 'Refinery updated successfully' });
      setEditingRefinery(null);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update refinery', variant: 'destructive' });
    },
  });

  const deleteRefineryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/refineries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete refinery');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
      toast({ title: 'Success', description: 'Refinery deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete refinery', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      region: 'Middle East',
      capacity: '',
      latitude: '',
      longitude: '',
      type: 'Crude Oil Refinery',
      status: 'Operational',
      description: ''
    });
  };

  const handleAutoFill = async () => {
    if (!formData.name) {
      toast({ title: 'Error', description: 'Please enter a refinery name first', variant: 'destructive' });
      return;
    }

    setIsAutoFilling(true);
    try {
      const response = await fetch('/api/refineries/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          ...data,
          capacity: data.capacity?.toString() || prev.capacity,
        }));
        toast({ title: 'Success', description: 'Refinery data auto-filled successfully' });
      } else {
        toast({ title: 'Error', description: 'Failed to auto-fill refinery data', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to auto-fill refinery data', variant: 'destructive' });
    }
    setIsAutoFilling(false);
  };

  const handleAiEnhancement = async () => {
    if (!formData.name) {
      toast({ title: 'Error', description: 'Please enter a refinery name first', variant: 'destructive' });
      return;
    }

    setIsAiEnhancing(true);
    try {
      const response = await fetch('/api/refineries/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          ...data,
          capacity: data.capacity?.toString() || prev.capacity,
        }));
        toast({ title: 'Success', description: 'Refinery data enhanced with AI' });
      } else {
        toast({ title: 'Error', description: 'Failed to enhance refinery data with AI', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to enhance refinery data with AI', variant: 'destructive' });
    }
    setIsAiEnhancing(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
    setShowMapSelector(false);
    toast({ title: 'Location Selected', description: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}` });
  };

  const handleEdit = (refinery: Refinery) => {
    setEditingRefinery(refinery);
    setFormData({
      name: refinery.name,
      country: refinery.country,
      region: refinery.region,
      capacity: refinery.capacity?.toString() || '',
      latitude: refinery.latitude,
      longitude: refinery.longitude,
      type: refinery.type || 'Crude Oil Refinery',
      status: refinery.status || 'Operational',
      description: refinery.description || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map form fields to database schema fields
    const submitData = {
      name: formData.name,
      country: formData.country,
      region: formData.region,
      lat: formData.latitude,    // Map latitude to lat
      lng: formData.longitude,   // Map longitude to lng
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      type: formData.type,
      status: formData.status,
      description: formData.description
    };

    if (editingRefinery) {
      updateRefineryMutation.mutate({ id: editingRefinery.id, data: submitData });
    } else {
      addRefineryMutation.mutate(submitData);
    }
  };

  const filteredRefineries = refineries.filter((refinery: Refinery) => {
    const matchesSearch = refinery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refinery.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All Regions' || refinery.region === selectedRegion;
    const matchesStatus = selectedStatus === 'All Statuses' || refinery.status === selectedStatus;
    
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Operational': return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Planned Shutdown': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Decommissioned': return 'bg-red-100 text-red-800 border-red-200';
      case 'Under Construction': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalCapacity = filteredRefineries.reduce((sum: number, refinery: Refinery) => 
    sum + (refinery.capacity || 0), 0);

  const operationalRefineries = filteredRefineries.filter((r: Refinery) => r.status === 'Operational').length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Factory className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Refineries</p>
              <p className="text-2xl font-bold">{filteredRefineries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Operational</p>
              <p className="text-2xl font-bold">{operationalRefineries}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-bold">{totalCapacity.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">bbl/day</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Globe className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Regions</p>
              <p className="text-2xl font-bold">{new Set(refineries.map((r: Refinery) => r.region)).size}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Refinery Management
          </CardTitle>
          <CardDescription>
            Manage global oil refineries with comprehensive data and real-time monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search refineries by name or country..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Refinery
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRefinery ? 'Edit Refinery' : 'Add New Refinery'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingRefinery ? 'Update refinery information' : 'Add a new oil refinery to the database'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Auto-fill and AI Enhancement Buttons */}
                    <div className="flex gap-2 p-3 bg-slate-50 rounded-lg border">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAutoFill}
                        disabled={isAutoFilling || !formData.name}
                        className="flex items-center gap-2"
                      >
                        <Target className="h-4 w-4" />
                        {isAutoFilling ? 'Auto-filling...' : 'Auto Fill'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAiEnhancement}
                        disabled={isAiEnhancing || !formData.name}
                        className="flex items-center gap-2"
                      >
                        <Wand2 className="h-4 w-4" />
                        {isAiEnhancing ? 'Enhancing...' : 'AI Enhance'}
                      </Button>
                      <div className="text-sm text-muted-foreground flex items-center">
                        Enter refinery name first to use auto-fill features
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Refinery Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g., Ras Tanura Refinery"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          required
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                          placeholder="e.g., Saudi Arabia"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="region">Region *</Label>
                        <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.slice(1).map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity (bbl/day)</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={formData.capacity}
                          onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                          placeholder="e.g., 550000"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Location Coordinates *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMapSelector(true)}
                          className="flex items-center gap-2"
                        >
                          <Navigation className="h-4 w-4" />
                          Select on Map
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            required
                            value={formData.latitude}
                            onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                            placeholder="e.g., 26.6927"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            required
                            value={formData.longitude}
                            onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                            placeholder="e.g., 50.0279"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Refinery Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {refineryTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Additional information about the refinery..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          setEditingRefinery(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-amber-600 hover:bg-amber-700"
                        disabled={addRefineryMutation.isPending || updateRefineryMutation.isPending}
                      >
                        {editingRefinery ? 'Update Refinery' : 'Add Refinery'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Map Selection Dialog */}
              <Dialog open={showMap} onOpenChange={setShowMap}>
                <DialogContent className="max-w-4xl h-[600px]">
                  <DialogHeader>
                    <DialogTitle>Select Refinery Location</DialogTitle>
                    <DialogDescription>
                      Click on the map to select coordinates for the refinery
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                      <p className="text-muted-foreground mb-4">Click anywhere on the map to set coordinates</p>
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-4">
                        <Button
                          onClick={() => handleMapClick(26.6927, 50.0279)}
                          variant="outline"
                          size="sm"
                        >
                          Saudi Arabia
                        </Button>
                        <Button
                          onClick={() => handleMapClick(25.2048, 55.2708)}
                          variant="outline"
                          size="sm"
                        >
                          UAE
                        </Button>
                        <Button
                          onClick={() => handleMapClick(29.3117, 47.4818)}
                          variant="outline"
                          size="sm"
                        >
                          Kuwait
                        </Button>
                        <Button
                          onClick={() => handleMapClick(25.3548, 51.1839)}
                          variant="outline"
                          size="sm"
                        >
                          Qatar
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quick select common refinery locations or click for custom coordinates
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Refineries Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refinery</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading refineries...
                    </TableCell>
                  </TableRow>
                ) : filteredRefineries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No refineries found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRefineries.map((refinery: Refinery) => (
                    <TableRow key={refinery.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{refinery.name}</div>
                          {refinery.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-48">
                              {refinery.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{refinery.country}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{refinery.region}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{refinery.type || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {refinery.capacity ? (
                          <div>
                            <div className="font-medium">{refinery.capacity.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">bbl/day</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(refinery.status)}>
                          {refinery.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          <div>{parseFloat(refinery.latitude).toFixed(4)}</div>
                          <div>{parseFloat(refinery.longitude).toFixed(4)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleEdit(refinery);
                              setIsAddDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this refinery?')) {
                                deleteRefineryMutation.mutate(refinery.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map Selector */}
      <RefineryLocationSelector
        isOpen={showMapSelector}
        onClose={() => setShowMapSelector(false)}
        onLocationSelected={handleMapClick}
        initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
        initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
      />
    </div>
  );
}