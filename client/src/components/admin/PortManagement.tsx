import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  MapPin,
  Anchor,
  Filter,
  Grid3x3,
  List,
  Map,
  Users,
  Ship,
  TrendingUp,
  Activity,
  Globe,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  RefreshCw,
  Database,
  BarChart3,
  Zap,
  Settings,
  CheckCircle,
} from 'lucide-react';
import { PortAnalyticsDashboard } from '@/components/ports/PortAnalyticsDashboard';
import { AdvancedPortSearch } from '@/components/ports/AdvancedPortSearch';
import { PortRecommendationEngine } from '@/components/ports/PortRecommendationEngine';

// Enhanced form validation schema with comprehensive port details
const portFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Port name is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  lat: z.string().min(1, 'Latitude is required'),
  lng: z.string().min(1, 'Longitude is required'),
  
  // Port Classification
  type: z.string().optional(),
  status: z.string().optional(),
  
  // Operational Details
  capacity: z.string().optional(),
  description: z.string().optional(),
  
  // Contact Information
  portAuthority: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  
  // Technical Specifications
  maxVesselLength: z.string().optional(),
  maxVesselBeam: z.string().optional(),
  maxDraught: z.string().optional(),
  berthCount: z.string().optional(),
  
  // Services and Facilities
  services: z.array(z.string()).optional(),
  facilities: z.array(z.string()).optional(),
  
  // Operating Hours
  operatingHours: z.string().optional(),
  timezone: z.string().optional(),
  
  // Safety and Security
  securityLevel: z.string().optional(),
  pilotageRequired: z.boolean().optional(),
  tugAssistance: z.boolean().optional(),
});

type PortFormData = z.infer<typeof portFormSchema>;

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  type: string | null;
  status: string | null;
  capacity: number | null;
  description: string | null;
  lastUpdated: Date | null;
  vesselCount: number;
  connectedRefineries: number;
  totalCargo: number;
}

interface PortStats {
  totalPorts: number;
  operationalPorts: number;
  totalVessels: number;
  totalCapacity: number;
  averageVesselsPerPort: number;
  topRegions: Array<{ region: string; count: number }>;
}

function PortStatusBadge({ status }: { status: string | null }) {
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'limited':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="secondary" className={`${getStatusColor(status)} border`}>
      {status || 'Unknown'}
    </Badge>
  );
}

function PortCard({ port }: { port: Port }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {port.name}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {port.country}, {port.region}
            </div>
          </div>
          <PortStatusBadge status={port.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center">
              <Ship className="h-4 w-4 mr-2 text-blue-600" />
              <span className="font-medium">{port.vesselCount}</span>
              <span className="text-muted-foreground ml-1">vessels</span>
            </div>
            <div className="flex items-center">
              <Anchor className="h-4 w-4 mr-2 text-green-600" />
              <span className="font-medium">{port.connectedRefineries}</span>
              <span className="text-muted-foreground ml-1">refineries</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-purple-600" />
              <span className="font-medium">{port.totalCargo.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">MT</span>
            </div>
            {port.capacity && (
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-orange-600" />
                <span className="font-medium">{port.capacity.toLocaleString()}</span>
                <span className="text-muted-foreground ml-1">MT cap</span>
              </div>
            )}
          </div>
        </div>
        {port.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {port.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground">
            {port.type && (
              <Badge variant="outline" className="text-xs">
                {port.type}
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddPortDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PortFormData>({
    resolver: zodResolver(portFormSchema),
    defaultValues: {
      name: '',
      country: '',
      region: '',
      lat: '',
      lng: '',
      type: '',
      status: 'operational',
      capacity: '',
      description: '',
    },
  });

  const addPortMutation = useMutation({
    mutationFn: async (data: PortFormData) => {
      const response = await fetch('/api/admin/ports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          capacity: data.capacity ? parseInt(data.capacity) : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to add port');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/port-stats'] });
      toast({
        title: 'Success',
        description: 'Port has been added successfully.',
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add port. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PortFormData) => {
    addPortMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Port
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Port</DialogTitle>
          <DialogDescription>
            Create a comprehensive port profile with detailed information and capabilities.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Port of Rotterdam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Netherlands" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region *</FormLabel>
                      <FormControl>
                        <Input placeholder="Europe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select port type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="oil_terminal">Oil Terminal</SelectItem>
                          <SelectItem value="container">Container</SelectItem>
                          <SelectItem value="bulk">Bulk Cargo</SelectItem>
                          <SelectItem value="naval">Naval</SelectItem>
                          <SelectItem value="fishing">Fishing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Geographic Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude *</FormLabel>
                      <FormControl>
                        <Input placeholder="51.9244" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude *</FormLabel>
                      <FormControl>
                        <Input placeholder="4.4777" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Operational Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Operational Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="limited">Limited Operations</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Capacity (MT)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="500000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the port's capabilities and services..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addPortMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {addPortMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Port
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PortStatistics({ stats }: { stats: PortStats | undefined }) {
  if (!stats) return null;

  const statisticsCards = [
    {
      title: 'Total Ports',
      value: stats.totalPorts.toLocaleString(),
      icon: Anchor,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%',
    },
    {
      title: 'Operational',
      value: stats.operationalPorts.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+8%',
    },
    {
      title: 'Total Vessels',
      value: stats.totalVessels.toLocaleString(),
      icon: Ship,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+15%',
    },
    {
      title: 'Avg Vessels/Port',
      value: stats.averageVesselsPerPort.toFixed(1),
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+5%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statisticsCards.map((stat, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">{stat.trend}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Main Ports Management Component
export function PortManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPortForAnalytics, setSelectedPortForAnalytics] = useState<number | null>(null);
  const [advancedSearchResults, setAdvancedSearchResults] = useState<any[]>([]);
  const pageSize = 12;

  const { data: ports = [], isLoading: portsLoading, error: portsError } = useQuery<Port[]>({
    queryKey: ['/api/admin/ports'],
  });

  const { data: stats } = useQuery<PortStats>({
    queryKey: ['/api/admin/port-stats'],
  });

  // Advanced filtering logic
  const filteredPorts = ports.filter((port: Port) => {
    const matchesSearch = port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         port.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         port.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || port.region === selectedRegion;
    const matchesStatus = selectedStatus === 'all' || port.status === selectedStatus;
    const matchesType = selectedType === 'all' || port.type === selectedType;
    
    return matchesSearch && matchesRegion && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPorts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPorts = filteredPorts.slice(startIndex, startIndex + pageSize);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion, selectedStatus, selectedType]);

  if (portsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (portsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load ports
          </h3>
          <p className="text-gray-500">
            There was an error loading the ports data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Ports Management</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive port management with AI-powered analytics, advanced search, and route planning
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <AddPortDialog />
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Database className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Advanced Search
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Zap className="h-4 w-4 mr-2" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="management">
            <Settings className="h-4 w-4 mr-2" />
            Management
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Traditional Port Management */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistics */}
          <PortStatistics stats={stats} />

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Filters & Search</CardTitle>
              <CardDescription>
                Filter and search through all registered ports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search ports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia">Asia</SelectItem>
                    <SelectItem value="Americas">Americas</SelectItem>
                    <SelectItem value="Africa">Africa</SelectItem>
                    <SelectItem value="Oceania">Oceania</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="oil_terminal">Oil Terminal</SelectItem>
                    <SelectItem value="container">Container</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Grid View
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map">
                  <Map className="h-4 w-4 mr-2" />
                  Map View
                </TabsTrigger>
              </TabsList>
              <div className="text-sm text-muted-foreground">
                Showing {paginatedPorts.length} of {filteredPorts.length} ports
              </div>
            </div>

            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPorts.map((port: Port) => (
                  <PortCard key={port.id} port={port} />
                ))}
              </div>
              {filteredPorts.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No ports found
                  </h3>
                  <p className="text-gray-500">
                    No ports match your current filters.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-medium">Port Name</th>
                          <th className="text-left p-4 font-medium">Location</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Type</th>
                          <th className="text-left p-4 font-medium">Vessels</th>
                          <th className="text-left p-4 font-medium">Capacity</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPorts.map((port: Port) => (
                          <tr key={port.id} className="border-b hover:bg-muted/30">
                            <td className="p-4 font-medium">{port.name}</td>
                            <td className="p-4">{port.country}, {port.region}</td>
                            <td className="p-4">
                              <PortStatusBadge status={port.status} />
                            </td>
                            <td className="p-4">
                              {port.type && (
                                <Badge variant="outline">{port.type}</Badge>
                              )}
                            </td>
                            <td className="p-4">{port.vesselCount}</td>
                            <td className="p-4">
                              {port.capacity ? `${port.capacity.toLocaleString()} MT` : 'N/A'}
                            </td>
                            <td className="p-4">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredPorts.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No ports match your current filters.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="h-[600px] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Interactive Map View
                      </h3>
                      <p className="text-gray-500">
                        Map view will be implemented with port locations and vessel tracking
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Port Analytics Dashboard</CardTitle>
              <CardDescription>
                Advanced analytics and performance metrics for port operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPortForAnalytics ? (
                <PortAnalyticsDashboard portId={selectedPortForAnalytics} />
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Port for Analytics
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Choose a port from the list below to view detailed analytics
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {ports.slice(0, 6).map((port: Port) => (
                      <Button
                        key={port.id}
                        variant="outline"
                        className="h-auto p-4 text-left"
                        onClick={() => setSelectedPortForAnalytics(port.id)}
                      >
                        <div>
                          <div className="font-medium">{port.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {port.country}, {port.region}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Port Search</CardTitle>
              <CardDescription>
                Sophisticated search with multiple criteria and AI-powered matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedPortSearch onResults={setAdvancedSearchResults} />
              
              {advancedSearchResults.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Search Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {advancedSearchResults.map((result, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{result.port.name}</CardTitle>
                            <Badge variant="secondary">
                              {Math.round(result.matchScore * 100)}% match
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>Match Reasons:</strong>
                              <ul className="list-disc list-inside text-muted-foreground mt-1">
                                {result.matchReasons.map((reason: string, i: number) => (
                                  <li key={i}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Port Recommendations</CardTitle>
              <CardDescription>
                Get intelligent port recommendations based on vessel requirements and cargo specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortRecommendationEngine />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage port data, import/export, and synchronization
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Import Ports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Port Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync with External APIs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure system settings and preferences
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Regional Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    User Permissions
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Performance Monitoring
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Quality Assurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Data validation and quality control tools
                </p>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run Data Quality Check
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}