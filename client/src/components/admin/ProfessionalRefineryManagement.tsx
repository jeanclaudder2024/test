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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Shuffle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LocationSelector from '@/components/map/LocationSelector';
import { Textarea } from '@/components/ui/textarea';
import RefineryDetailView from './RefineryDetailView';

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  city?: string | null;
  capacity: number | null;
  latitude: string;
  longitude: string;
  type: string | null;
  status: string | null;
  description: string | null;
  lastUpdated: Date | null;
  operator?: string | null;
  owner?: string | null;
  products?: string | null;
  year_built?: number | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  technical_specs?: string | null;
  utilization?: string | null;
  complexity?: string | null;
  
  // Enhanced Operational Details
  crude_oil_sources?: string | null;
  processing_units?: string | null;
  storage_capacity?: string | null;
  pipeline_connections?: string | null;
  shipping_terminals?: string | null;
  rail_connections?: string | null;
  environmental_certifications?: string | null;
  safety_record?: string | null;
  workforce_size?: number | null;
  annual_throughput?: string | null;
  
  // Financial & Market Information
  investment_cost?: string | null;
  operating_costs?: string | null;
  revenue?: string | null;
  profit_margin?: string | null;
  market_share?: string | null;
  
  // Technical Specifications
  distillation_capacity?: string | null;
  conversion_capacity?: string | null;
  hydrogen_capacity?: string | null;
  sulfur_recovery?: string | null;
  octane_rating?: string | null;
  diesel_specifications?: string | null;
  
  // Compliance & Regulations
  environmental_compliance?: string | null;
  regulatory_status?: string | null;
  permits_licenses?: string | null;
  inspection_schedule?: string | null;
  
  // Strategic Information
  expansion_plans?: string | null;
  modernization_projects?: string | null;
  technology_partnerships?: string | null;
  supply_contracts?: string | null;
  distribution_network?: string | null;
  
  // Performance Metrics
  efficiency_rating?: string | null;
  energy_consumption?: string | null;
  water_usage?: string | null;
  emissions_data?: string | null;
  downtime_statistics?: string | null;
  
  // Geographic & Infrastructure
  nearest_port?: string | null;
  nearest_airport?: string | null;
  transportation_links?: string | null;
  utilities_infrastructure?: string | null;
  local_suppliers?: string | null;
  
  // Market Position
  competitive_advantages?: string | null;
  major_customers?: string | null;
  export_markets?: string | null;
  domestic_market_share?: string | null;
  
  // Additional metadata
  data_source?: string | null;
  last_verified?: Date | null;
  confidence_level?: string | null;
  notes?: string | null;
  created_at?: Date | null;
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
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [viewingRefinery, setViewingRefinery] = useState<Refinery | null>(null);

  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    region: 'Middle East',
    city: '',
    capacity: '',
    latitude: '',
    longitude: '',
    type: 'Crude Oil Refinery',
    status: 'Operational',
    description: '',
    operator: '',
    owner: '',
    products: '',
    year_built: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    technical_specs: '',
    utilization: '',
    complexity: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: refineries = [], isLoading } = useQuery<Refinery[]>({
    queryKey: ['/api/admin/refineries'],
  });

  const addRefineryMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/refineries', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add refinery');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/refineries'] });
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
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/refineries/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update refinery');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/refineries'] });
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
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/refineries/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });
      if (!response.ok) throw new Error('Failed to delete refinery');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/refineries'] });
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
      city: '',
      capacity: '',
      latitude: '',
      longitude: '',
      type: 'Crude Oil Refinery',
      status: 'Operational',
      description: '',
      operator: '',
      owner: '',
      products: '',
      year_built: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      technical_specs: '',
      utilization: '',
      complexity: ''
    });
  };

  const handleAutoFill = async () => {
    if (!formData.name) {
      toast({ title: 'Error', description: 'Please enter a refinery name first', variant: 'destructive' });
      return;
    }

    setIsAutoFilling(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/refineries/autofill', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
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
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/refineries/ai-enhance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
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

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
    setShowLocationSelector(false);
    toast({ 
      title: 'Location Selected', 
      description: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}` 
    });
  };

  const generateRandomRefinery = async () => {
    const refineryNames = [
      "Al-Jubail Refinery", "Yanbu Refinery", "Jeddah Refinery", "Riyadh Processing Center",
      "Dubai Integrated Complex", "Abu Dhabi Refinery", "Kuwait National Refinery",
      "Bahrain Petroleum Complex", "Qatar Integrated Refinery", "Sohar Refinery",
      "Port Arthur Refinery", "Texas City Refinery", "Baytown Complex", "Baton Rouge Refinery",
      "Rotterdam Refinery", "Antwerp Processing Center", "Singapore Integrated Complex"
    ];

    const countries = [
      { name: "Saudi Arabia", region: "Middle East", cities: ["Dhahran", "Yanbu", "Jeddah"], coords: { latMin: 16.3, latMax: 32.1, lngMin: 34.5, lngMax: 55.7 } },
      { name: "United Arab Emirates", region: "Middle East", cities: ["Dubai", "Abu Dhabi"], coords: { latMin: 22.6, latMax: 26.1, lngMin: 51.0, lngMax: 56.4 } },
      { name: "United States", region: "North America", cities: ["Houston", "Port Arthur"], coords: { latMin: 25.8, latMax: 49.4, lngMin: -125.0, lngMax: -66.9 } },
      { name: "Netherlands", region: "Europe", cities: ["Rotterdam", "Amsterdam"], coords: { latMin: 50.7, latMax: 53.6, lngMin: 3.4, lngMax: 7.2 } },
      { name: "Singapore", region: "Asia-Pacific", cities: ["Singapore"], coords: { latMin: 1.1, latMax: 1.5, lngMin: 103.6, lngMax: 104.0 } }
    ];

    const operators = ["Saudi Aramco", "ADNOC", "ExxonMobil", "Shell", "BP", "Chevron", "TotalEnergies"];
    const types = ["Crude Oil Refinery", "Integrated Petrochemical Complex", "Heavy Oil Processing"];
    const products = [
      "Gasoline, Diesel, Jet Fuel, LPG, Lubricants",
      "Heavy Fuel Oil, Marine Gas Oil, Petrochemicals",
      "Premium Gasoline, Ultra-Low Sulfur Diesel, Aviation Fuel"
    ];

    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomCity = randomCountry.cities[Math.floor(Math.random() * randomCountry.cities.length)];
    const randomName = refineryNames[Math.floor(Math.random() * refineryNames.length)];
    const randomOperator = operators[Math.floor(Math.random() * operators.length)];
    
    const coords = randomCountry.coords;
    const randomLat = (Math.random() * (coords.latMax - coords.latMin) + coords.latMin).toFixed(6);
    const randomLng = (Math.random() * (coords.lngMax - coords.lngMin) + coords.lngMin).toFixed(6);

    try {
      await addRefineryMutation.mutateAsync({
        name: `${randomName} - Test ${Date.now()}`,
        country: randomCountry.name,
        region: randomCountry.region,
        city: randomCity,
        lat: randomLat,
        lng: randomLng,
        capacity: Math.floor(Math.random() * 500000 + 100000),
        type: types[Math.floor(Math.random() * types.length)],
        status: Math.random() > 0.2 ? 'Operational' : 'Under Maintenance',
        description: `Modern refinery facility with advanced processing capabilities.`,
        operator: randomOperator,
        owner: randomOperator,
        products: products[Math.floor(Math.random() * products.length)],
        year_built: Math.floor(Math.random() * 40 + 1980),
        utilization: (Math.random() * 30 + 70).toFixed(1),
        complexity: (Math.random() * 8 + 8).toFixed(1)
      });
      
      toast({ 
        title: 'Success', 
        description: `Random test refinery generated successfully!` 
      });
    } catch (error) {
      console.error('Error generating random refinery:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to generate random refinery data', 
        variant: 'destructive' 
      });
    }
  };

  const handleEdit = (refinery: Refinery) => {
    setEditingRefinery(refinery);
    setFormData({
      name: refinery.name,
      country: refinery.country,
      region: refinery.region,
      city: refinery.city || '',
      capacity: refinery.capacity?.toString() || '',
      latitude: refinery.latitude,
      longitude: refinery.longitude,
      type: refinery.type || 'Crude Oil Refinery',
      status: refinery.status || 'Operational',
      description: refinery.description || '',
      operator: refinery.operator || '',
      owner: refinery.owner || '',
      products: refinery.products || '',
      year_built: refinery.year_built?.toString() || '',
      email: refinery.email || '',
      phone: refinery.phone || '',
      website: refinery.website || '',
      address: refinery.address || '',
      technical_specs: refinery.technical_specs || '',
      utilization: refinery.utilization?.toString() || '',
      complexity: refinery.complexity?.toString() || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map form fields to database schema fields
    const submitData = {
      name: formData.name,
      country: formData.country,
      region: formData.region,
      city: formData.city,
      lat: formData.latitude,    // Map latitude to lat
      lng: formData.longitude,   // Map longitude to lng
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      type: formData.type,
      status: formData.status,
      description: formData.description,
      operator: formData.operator,
      owner: formData.owner,
      products: formData.products,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      address: formData.address,
      technical_specs: formData.technical_specs,
      utilization: formData.utilization ? parseFloat(formData.utilization) : null,
      complexity: formData.complexity ? parseFloat(formData.complexity) : null
    };

    if (editingRefinery) {
      updateRefineryMutation.mutate({ id: editingRefinery.id, data: submitData });
    } else {
      addRefineryMutation.mutate(submitData);
    }
  };

  const filteredRefineries = (refineries as Refinery[]).filter((refinery: Refinery) => {
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
              <p className="text-2xl font-bold">{new Set((refineries as Refinery[]).map((r: Refinery) => r.region)).size}</p>
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
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={generateRandomRefinery}
                disabled={addRefineryMutation.isPending}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Generate Test Data
              </Button>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Refinery
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRefinery ? 'Edit Refinery' : 'Add New Refinery'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingRefinery ? 'Update comprehensive refinery information' : 'Add a new oil refinery with detailed specifications'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="operational">Operations</TabsTrigger>
                        <TabsTrigger value="technical">Technical</TabsTrigger>
                        <TabsTrigger value="financial">Financial</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                        <TabsTrigger value="strategic">Strategic</TabsTrigger>
                      </TabsList>

                      {/* Basic Information Tab */}
                      <TabsContent value="basic" className="space-y-4">
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
                        
                        <div className="grid grid-cols-3 gap-4">
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
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                              placeholder="e.g., Dhahran"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="year_built">Year Built</Label>
                            <Input
                              id="year_built"
                              type="number"
                              value={formData.year_built}
                              onChange={(e) => setFormData({...formData, year_built: e.target.value})}
                              placeholder="e.g., 1975"
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
                              onClick={() => setShowLocationSelector(true)}
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

                        <div className="space-y-2">
                          <Label htmlFor="address">Complete Address</Label>
                          <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="Complete address of the refinery including street, postal code"
                            rows={2}
                          />
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
                          <Label htmlFor="description">Refinery Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Comprehensive description of the refinery operations, significance, and capabilities"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Contact Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              placeholder="contact@refinery.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              placeholder="+1-234-567-8900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              value={formData.website}
                              onChange={(e) => setFormData({...formData, website: e.target.value})}
                              placeholder="https://company.com"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Operational Tab */}
                      <TabsContent value="operational" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="operator">Operator Company</Label>
                            <Input
                              id="operator"
                              value={formData.operator}
                              onChange={(e) => setFormData({...formData, operator: e.target.value})}
                              placeholder="e.g., Saudi Aramco"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="owner">Owner</Label>
                            <Input
                              id="owner"
                              value={formData.owner}
                            onChange={(e) => setFormData({...formData, owner: e.target.value})}
                            placeholder="e.g., Saudi Aramco"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="capacity">Daily Capacity (bbl/day)</Label>
                            <Input
                              id="capacity"
                              type="number"
                              value={formData.capacity}
                              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                              placeholder="e.g., 550000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="utilization">Utilization (%)</Label>
                            <Input
                              id="utilization"
                              value={formData.utilization}
                              onChange={(e) => setFormData({...formData, utilization: e.target.value})}
                              placeholder="e.g., 85.5"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="products">Main Products</Label>
                          <Textarea
                            id="products"
                            value={formData.products}
                            onChange={(e) => setFormData({...formData, products: e.target.value})}
                            placeholder="e.g., Gasoline, Diesel, Jet Fuel, Lubricants, Petrochemicals"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="complexity">Complexity Index</Label>
                          <Input
                            id="complexity"
                            value={formData.complexity}
                            onChange={(e) => setFormData({...formData, complexity: e.target.value})}
                            placeholder="e.g., 12.5"
                          />
                        </div>
                      </TabsContent>

                      {/* Technical Tab */}
                      <TabsContent value="technical" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="technical_specs">Technical Specifications</Label>
                          <Textarea
                            id="technical_specs"
                            value={formData.technical_specs}
                            onChange={(e) => setFormData({...formData, technical_specs: e.target.value})}
                            placeholder="Detailed technical specifications, equipment, and processing capabilities..."
                            rows={4}
                          />
                        </div>
                      </TabsContent>

                      {/* Financial Tab */}
                      <TabsContent value="financial" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Financial Information</Label>
                          <p className="text-sm text-muted-foreground">Investment, operating costs, and revenue data</p>
                        </div>
                      </TabsContent>

                      {/* Compliance Tab */}
                      <TabsContent value="compliance" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Compliance & Regulations</Label>
                          <p className="text-sm text-muted-foreground">Environmental compliance, safety records, and certifications</p>
                        </div>
                      </TabsContent>

                      {/* Strategic Tab */}
                      <TabsContent value="strategic" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Strategic Information</Label>
                          <p className="text-sm text-muted-foreground">Future plans, partnerships, and market position</p>
                        </div>
                      </TabsContent>
                    </Tabs>

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
                            onClick={() => setViewingRefinery(refinery)}
                            title="View Details"
                          >
                            <Navigation className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleEdit(refinery);
                              setIsAddDialogOpen(true);
                            }}
                            title="Edit Refinery"
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
                            title="Delete Refinery"
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

      {/* Location Selector */}
      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onLocationSelect={handleLocationSelect}
        initialLat={formData.latitude ? parseFloat(formData.latitude) : 25.2048}
        initialLng={formData.longitude ? parseFloat(formData.longitude) : 55.2708}
      />

      {/* Refinery Detail View Dialog */}
      <Dialog open={!!viewingRefinery} onOpenChange={(open) => !open && setViewingRefinery(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              {viewingRefinery?.name || 'Refinery Details'}
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about this refinery facility
            </DialogDescription>
          </DialogHeader>
          
          {viewingRefinery && (
            <RefineryDetailView 
              refinery={{
                ...viewingRefinery,
                latitude: viewingRefinery.lat,
                longitude: viewingRefinery.lng
              }} 
            />
          )}
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setViewingRefinery(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}