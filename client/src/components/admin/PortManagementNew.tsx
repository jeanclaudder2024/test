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
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { FlagIcon } from "react-flag-kit";

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  type: string;
  lat?: string | null;
  lng?: string | null;
  capacity?: number | null;
  description?: string | null;
  status?: string | null;
  lastUpdated?: string;
}

interface PortFormData {
  name: string;
  country: string;
  region: string;
  type: string;
  lat: string;
  lng: string;
  capacity: string;
  description: string;
  status: string;
}

const portTypes = [
  "Oil Terminal",
  "Container Port", 
  "Bulk Terminal",
  "LNG Terminal",
  "Refinery Port",
  "Commercial Port",
  "Naval Base",
  "Fishing Port"
];

const regions = [
  "North America",
  "South America", 
  "Europe",
  "Asia",
  "Africa",
  "Middle East",
  "Oceania"
];

const countries = [
  "United States", "Canada", "United Kingdom", "Norway", "Netherlands",
  "Germany", "France", "Spain", "Italy", "Greece", "Turkey", 
  "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Oman", "Bahrain",
  "China", "Japan", "South Korea", "Singapore", "India", "Indonesia",
  "Australia", "Brazil", "Argentina", "Mexico", "Nigeria", "Egypt"
];

const portStatuses = ["operational", "active", "maintenance", "inactive"];

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

export function PortManagementNew() {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [formData, setFormData] = useState<PortFormData>({
    name: '',
    country: '',
    region: '',
    type: '',
    lat: '',
    lng: '',
    capacity: '',
    description: '',
    status: 'operational'
  });

  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ports from database
  const { data: ports = [], isLoading, error, refetch } = useQuery<Port[]>({
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
        body: JSON.stringify({
          ...portData,
          lat: portData.lat ? parseFloat(portData.lat) : null,
          lng: portData.lng ? parseFloat(portData.lng) : null,
          capacity: portData.capacity ? parseInt(portData.capacity) : null
        })
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
        body: JSON.stringify({
          ...data,
          lat: data.lat ? parseFloat(data.lat) : null,
          lng: data.lng ? parseFloat(data.lng) : null,
          capacity: data.capacity ? parseInt(data.capacity) : null
        })
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
      lat: '',
      lng: '',
      capacity: '',
      description: '',
      status: 'operational'
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
      lat: port.lat?.toString() || '',
      lng: port.lng?.toString() || '',
      capacity: port.capacity?.toString() || '',
      description: port.description || '',
      status: port.status || 'operational'
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

  // Filter and paginate ports
  const filteredPorts = ports.filter((port) => {
    const matchesSearch = !searchTerm || 
      port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = regionFilter === 'all' || port.region === regionFilter;
    const matchesType = typeFilter === 'all' || port.type === typeFilter;
    
    return matchesSearch && matchesRegion && matchesType;
  });

  const totalPages = Math.ceil(filteredPorts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPorts = filteredPorts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "operational": 
      case "active": return "default";
      case "maintenance": return "secondary";
      case "inactive": return "destructive";
      default: return "outline";
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "Oil Terminal": return "default";
      case "Container Port": return "secondary";
      case "LNG Terminal": return "destructive";
      case "Refinery Port": return "outline";
      default: return "secondary";
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Database Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">Failed to connect to your ports database.</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Ports Database Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage authentic ports from your Supabase database
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Port
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{ports.length}</div>
              <div className="text-sm text-blue-600">Total Ports</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {ports.filter(p => p.type === 'Oil Terminal').length}
              </div>
              <div className="text-sm text-green-600">Oil Terminals</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(ports.map(p => p.country)).size}
              </div>
              <div className="text-sm text-purple-600">Countries</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(ports.map(p => p.region)).size}
              </div>
              <div className="text-sm text-orange-600">Regions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Search & Filter
          </CardTitle>
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
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPorts.length)} of {filteredPorts.length} ports
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setRegionFilter('all');
                setTypeFilter('all');
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ports Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Authentic Ports ({filteredPorts.length})
            {isLoading && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPorts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {ports.length === 0 ? "No ports found in database" : "No ports match your search criteria"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Port Details</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type & Status</TableHead>
                      <TableHead>Coordinates</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPorts.map((port) => (
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
                            <div>
                              <div className="font-medium">{port.country}</div>
                              <div className="text-sm text-gray-500">{port.region}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={getTypeBadgeVariant(port.type)}>
                              {port.type}
                            </Badge>
                            {port.status && (
                              <div>
                                <Badge variant={getStatusBadgeVariant(port.status)}>
                                  {port.status}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {port.lat && port.lng ? (
                            <div className="text-sm font-mono">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                {parseFloat(port.lat).toFixed(3)}°
                              </div>
                              <div className="text-gray-600">
                                {parseFloat(port.lng).toFixed(3)}°
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Port Dialog */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {portStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="2000000"
                type="number"
              />
            </div>
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                value={formData.lat}
                onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                placeholder="29.7604"
                type="number"
                step="any"
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                value={formData.lng}
                onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                placeholder="-95.3698"
                type="number"
                step="any"
              />
            </div>
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