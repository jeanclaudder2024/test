import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Anchor, 
  Search, 
  MapPin, 
  Globe, 
  Building2,
  Ship,
  Filter
} from 'lucide-react';
import { FlagIcon } from "react-flag-kit";

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  type: string;
  latitude?: number | null;
  longitude?: number | null;
  capacity?: number | null;
  description?: string | null;
}

interface PortFormData {
  name: string;
  country: string;
  region: string;
  type: string;
  latitude: string;
  longitude: string;
  capacity: string;
  description: string;
}

// Port types for dropdown
const portTypes = [
  "Oil Terminal",
  "Container Port", 
  "Bulk Terminal",
  "LNG Terminal",
  "Refinery Port",
  "Naval Base",
  "Fishing Port",
  "Cruise Terminal"
];

// Regions for dropdown
const regions = [
  "North America",
  "South America", 
  "Europe",
  "Asia",
  "Africa",
  "Middle East",
  "Oceania"
];

// Common countries for dropdown
const countries = [
  "United States", "Canada", "United Kingdom", "Norway", "Netherlands",
  "Germany", "France", "Spain", "Italy", "Greece", "Turkey", 
  "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Oman", "Bahrain",
  "China", "Japan", "South Korea", "Singapore", "India", "Indonesia",
  "Australia", "Brazil", "Argentina", "Mexico", "Nigeria", "Egypt"
];

// Flag code mapping
const countryToFlagCode: { [key: string]: string } = {
  "United States": "US", "Canada": "CA", "United Kingdom": "GB", 
  "Norway": "NO", "Netherlands": "NL", "Germany": "DE", "France": "FR",
  "Spain": "ES", "Italy": "IT", "Greece": "GR", "Turkey": "TR",
  "Saudi Arabia": "SA", "UAE": "AE", "Kuwait": "KW", "Qatar": "QA",
  "Oman": "OM", "Bahrain": "BH", "China": "CN", "Japan": "JP",
  "South Korea": "KR", "Singapore": "SG", "India": "IN", "Indonesia": "ID",
  "Australia": "AU", "Brazil": "BR", "Argentina": "AR", "Mexico": "MX",
  "Nigeria": "NG", "Egypt": "EG"
};

function getFlagCode(countryName: string): string {
  return countryToFlagCode[countryName] || "UN";
}

export default function PortsNew() {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [formData, setFormData] = useState<PortFormData>({
    name: '',
    country: '',
    region: '',
    type: '',
    latitude: '',
    longitude: '',
    capacity: '',
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ports
  const { data: ports = [], isLoading } = useQuery<Port[]>({
    queryKey: ["/api/ports"],
    queryFn: async () => {
      const response = await fetch("/api/ports");
      if (!response.ok) throw new Error("Failed to fetch ports");
      return response.json();
    }
  });

  // Create port mutation
  const createPortMutation = useMutation({
    mutationFn: async (portData: PortFormData) => {
      const response = await fetch("/api/ports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portData)
      });
      if (!response.ok) throw new Error("Failed to create port");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ports"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Port created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to create port: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Update port mutation
  const updatePortMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PortFormData }) => {
      const response = await fetch(`/api/ports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update port");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ports"] });
      setIsDialogOpen(false);
      setEditingPort(null);
      resetForm();
      toast({ title: "Success", description: "Port updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update port: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Delete port mutation
  const deletePortMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/ports/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete port");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ports"] });
      toast({ title: "Success", description: "Port deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to delete port: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      region: '',
      type: '',
      latitude: '',
      longitude: '',
      capacity: '',
      description: ''
    });
    setEditingPort(null);
  };

  const handleEdit = (port: Port) => {
    setEditingPort(port);
    setFormData({
      name: port.name,
      country: port.country,
      region: port.region,
      type: port.type,
      latitude: port.latitude?.toString() || '',
      longitude: port.longitude?.toString() || '',
      capacity: port.capacity?.toString() || '',
      description: port.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.country || !formData.region || !formData.type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (editingPort) {
      updatePortMutation.mutate({ id: editingPort.id, data: formData });
    } else {
      createPortMutation.mutate(formData);
    }
  };

  // Filter ports
  const filteredPorts = ports.filter((port) => {
    const matchesSearch = !searchTerm || 
      port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = regionFilter === 'all' || port.region === regionFilter;
    const matchesType = typeFilter === 'all' || port.type === typeFilter;
    
    return matchesSearch && matchesRegion && matchesType;
  });

  const getPortTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "Oil Terminal": return "default";
      case "Container Port": return "secondary";
      case "LNG Terminal": return "destructive";
      case "Refinery Port": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center text-gray-900">
                <Anchor className="h-7 w-7 mr-3 text-blue-600" />
                Port Management
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl text-sm">
                Comprehensive port and terminal management system
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Port
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">Total Ports</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {ports.length}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">Oil Terminals</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {ports.filter(p => p.type === 'Oil Terminal').length}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">Container Ports</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {ports.filter(p => p.type === 'Container Port').length}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">Regions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {new Set(ports.map(p => p.region)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search ports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              {portTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Ports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ports ({filteredPorts.length})</span>
            {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPorts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {ports.length === 0 ? "No ports found" : "No ports match your search criteria"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Port Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPorts.map((port) => (
                    <TableRow key={port.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium">{port.name}</div>
                            {port.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {port.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FlagIcon 
                            code={getFlagCode(port.country)} 
                            size={16}
                          />
                          <span>{port.country}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPortTypeBadgeVariant(port.type)}>
                          {port.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          {port.region}
                        </div>
                      </TableCell>
                      <TableCell>
                        {port.latitude && port.longitude ? (
                          <div className="text-sm font-mono">
                            <div>{port.latitude.toFixed(4)}°</div>
                            <div>{port.longitude.toFixed(4)}°</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(port)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePortMutation.mutate(port.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Port Dialog */}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingPort ? 'Edit Port' : 'Add New Port'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Port Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Port of Houston"
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      <div className="flex items-center gap-2">
                        <FlagIcon code={getFlagCode(country)} size={16} />
                        {country}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="region">Region *</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Port Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {portTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="29.7604"
                type="number"
                step="any"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="-95.3698"
                type="number"
                step="any"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="capacity">Capacity (TEU/Barrels)</Label>
            <Input
              id="capacity"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              placeholder="2000000"
              type="number"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Major oil terminal with deep water berths"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPortMutation.isPending || updatePortMutation.isPending}
            >
              {editingPort ? 'Update Port' : 'Create Port'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </div>
  );
}