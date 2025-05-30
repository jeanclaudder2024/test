import { useState, useEffect } from 'react';
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
  Database,
  Wand2,
  Bot,
  Map
} from 'lucide-react';
import { FlagIcon } from 'react-flag-kit';
import type { FlagIconCode } from 'react-flag-kit';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  type: string;
  lat: number | string;
  lng: number | string;
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
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>([25.276987, 55.296249]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
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
          name: portData.name,
          country: portData.country,
          region: portData.region,
          type: portData.type,
          status: portData.status,
          description: portData.description,
          lat: portData.lat,
          lng: portData.lng,
          capacity: portData.capacity
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create port");
      }
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
        method: "PATCH",
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

  // Auto Fill function with authentic port data
  const handleAutoFill = () => {
    const samplePorts = [
      {
        name: "Port of Jebel Ali",
        country: "UAE",
        region: "Middle East",
        lat: "25.012414",
        lng: "55.113632",
        type: "Oil Terminal",
        capacity: "19300000",
        description: "Major container and oil terminal in Dubai, one of the largest ports in the Middle East",
        status: "operational"
      },
      {
        name: "Port of Rotterdam",
        country: "Netherlands", 
        region: "Europe",
        lat: "51.942237",
        lng: "4.141868",
        type: "Oil Terminal",
        capacity: "469000000",
        description: "Europe's largest port and major petrochemical hub with extensive oil refining facilities",
        status: "operational"
      },
      {
        name: "Port of Houston",
        country: "United States",
        region: "North America", 
        lat: "29.760427",
        lng: "-95.369803",
        type: "Oil Terminal",
        capacity: "285000000",
        description: "Major US petrochemical port with significant oil and gas handling capabilities",
        status: "operational"
      }
    ];
    
    const randomPort = samplePorts[Math.floor(Math.random() * samplePorts.length)];
    setFormData(randomPort);
    setMapPosition([parseFloat(randomPort.lat), parseFloat(randomPort.lng)]);
    
    toast({
      title: "Auto Fill Complete",
      description: `Form filled with ${randomPort.name} data`
    });
  };

  // AI Generate function
  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/ports/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingPorts: ports.length })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate AI port data");
      }
      
      const aiPort = await response.json();
      setFormData({
        name: aiPort.name,
        country: aiPort.country,
        region: aiPort.region,
        lat: aiPort.lat.toString(),
        lng: aiPort.lng.toString(),
        type: aiPort.type,
        capacity: aiPort.capacity?.toString() || '',
        description: aiPort.description,
        status: aiPort.status || 'operational'
      });
      
      setMapPosition([parseFloat(aiPort.lat), parseFloat(aiPort.lng)]);
      
      toast({
        title: "AI Generation Complete",
        description: `Generated ${aiPort.name} with intelligent data`
      });
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: "Could not generate AI port data. Please try manual entry.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Fix for Leaflet default marker icon
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

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
    setShowMap(false);
    setMapPosition([25.276987, 55.296249]);
  };

  const handleEdit = (port: Port) => {
    setEditingPort(port);
    setFormData({
      name: port.name,
      country: port.country,
      region: port.region,
      type: port.type,
      lat: port.lat.toString(),
      lng: port.lng.toString(),
      capacity: port.capacity?.toString() || '',
      description: port.description || '',
      status: port.status || 'operational'
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.country || !formData.region || !formData.lat || !formData.lng) {
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
    switch (status) {
      case "operational": return "default";
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

  // Map click handler component
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMapPosition([lat, lng]);
        setFormData(prev => ({
          ...prev,
          lat: lat.toString(),
          lng: lng.toString()
        }));
        toast({
          title: "Coordinates Selected",
          description: `Location set to ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      },
    });
    return null;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Anchor className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Port Management</h2>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Failed to load ports data</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Anchor className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Port Management</h2>
          <Badge variant="secondary">{ports.length} Ports</Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Port Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search ports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {portTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Port Dialog */}
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Port
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>{editingPort ? 'Edit Port' : 'Add New Port'}</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAutoFill}
                        className="flex items-center gap-2"
                      >
                        <Wand2 className="h-4 w-4" />
                        Auto Fill
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAIGenerate}
                        disabled={isGeneratingAI}
                        className="flex items-center gap-2"
                      >
                        <Bot className="h-4 w-4" />
                        {isGeneratingAI ? 'Generating...' : 'AI Generate'}
                      </Button>
                    </div>
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
                        placeholder="Port of Dubai"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>
                              <div className="flex items-center gap-2">
                                <FlagIcon code={getFlagCode(country) as FlagIconCode} size={16} />
                                {country}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="region">Region *</Label>
                      <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
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
                      <Label htmlFor="type">Port Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select port type" />
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
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
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
                      <Label htmlFor="capacity">Capacity (TEU/day)</Label>
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
                      <div className="flex gap-2">
                        <Input
                          id="lat"
                          value={formData.lat}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, lat: e.target.value }));
                            if (e.target.value && formData.lng) {
                              setMapPosition([parseFloat(e.target.value), parseFloat(formData.lng)]);
                            }
                          }}
                          placeholder="29.7604"
                          type="number"
                          step="any"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMap(!showMap)}
                          className="flex items-center gap-2"
                        >
                          <Map className="h-4 w-4" />
                          {showMap ? 'Hide' : 'Show'} Map
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        value={formData.lng}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, lng: e.target.value }));
                          if (formData.lat && e.target.value) {
                            setMapPosition([parseFloat(formData.lat), parseFloat(e.target.value)]);
                          }
                        }}
                        placeholder="-95.3698"
                        type="number"
                        step="any"
                      />
                    </div>
                  </div>
                  
                  {/* Interactive Map for Coordinate Selection */}
                  {showMap && (
                    <div className="space-y-2">
                      <Label>Select Location on Map (Click to set coordinates)</Label>
                      <div className="h-64 w-full border rounded-lg overflow-hidden">
                        <MapContainer
                          center={mapPosition}
                          zoom={6}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <MapClickHandler />
                          {formData.lat && formData.lng && (
                            <Marker position={[parseFloat(formData.lat), parseFloat(formData.lng)]} />
                          )}
                        </MapContainer>
                      </div>
                      <p className="text-sm text-gray-600">
                        Current coordinates: {formData.lat && formData.lng ? 
                          `${parseFloat(formData.lat).toFixed(6)}, ${parseFloat(formData.lng).toFixed(6)}` : 
                          'Click on the map to select coordinates'
                        }
                      </p>
                    </div>
                  )}
                  
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
            </Dialog>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading ports...
            </div>
          ) : (
            <>
              {/* Ports Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Port Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Coordinates</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPorts.map((port) => (
                      <TableRow key={port.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Anchor className="h-4 w-4 text-blue-600" />
                            {port.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FlagIcon code={getFlagCode(port.country) as FlagIconCode} size={16} />
                            {port.country}
                          </div>
                        </TableCell>
                        <TableCell>{port.region}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(port.type)}>
                            {port.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(port.status || 'operational')}>
                            {port.status || 'operational'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {port.capacity ? port.capacity.toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {typeof port.lat === 'number' ? port.lat.toFixed(3) : parseFloat(port.lat).toFixed(3)}, {typeof port.lng === 'number' ? port.lng.toFixed(3) : parseFloat(port.lng).toFixed(3)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(port)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePortMutation.mutate(port.id)}
                              disabled={deletePortMutation.isPending}
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
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPorts.length)} of {filteredPorts.length} ports
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
    </div>
  );
}