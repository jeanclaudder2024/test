import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  Anchor, 
  Ship, 
  MapPin, 
  Building2, 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  Map as MapIcon, 
  Plus, 
  Activity,
  TrendingUp,
  BarChart3,
  Globe,
  Truck,
  Waves,
  Calendar,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Gauge
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Form validation schema
const portFormSchema = z.object({
  name: z.string().min(1, 'Port name is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  lat: z.string().min(1, 'Latitude is required'),
  lng: z.string().min(1, 'Longitude is required'),
  type: z.string().optional(),
  status: z.string().optional(),
  capacity: z.string().optional(),
  description: z.string().optional()
});

type PortFormData = z.infer<typeof portFormSchema>;

// Types
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
  vesselCount?: number;
  connectedRefineries?: number;
  totalCargo?: number;
}

interface PortStats {
  totalPorts: number;
  operationalPorts: number;
  totalVessels: number;
  totalCapacity: number;
  averageVesselsPerPort: number;
  topRegions: Array<{ region: string; count: number }>;
}

// Port Status Badge Component
function PortStatusBadge({ status }: { status: string | null }) {
  const getStatusStyle = (status: string | null) => {
    const s = status?.toLowerCase() || 'unknown';
    if (s.includes('operational') || s.includes('active')) {
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400';
    }
    if (s.includes('maintenance') || s.includes('repair')) {
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
    }
    if (s.includes('construction') || s.includes('planned')) {
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
    }
    if (s.includes('closed') || s.includes('inactive')) {
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <Badge variant="outline" className={getStatusStyle(status)}>
      {status || 'Unknown'}
    </Badge>
  );
}

// Port Card Component
function PortCard({ port }: { port: Port }) {
  const [, navigate] = useLocation();

  const getStatusIcon = (status: string | null) => {
    const s = status?.toLowerCase() || 'unknown';
    if (s.includes('operational') || s.includes('active')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (s.includes('maintenance') || s.includes('repair')) {
      return <Clock className="h-4 w-4 text-orange-600" />;
    }
    if (s.includes('construction') || s.includes('planned')) {
      return <Activity className="h-4 w-4 text-blue-600" />;
    }
    if (s.includes('closed') || s.includes('inactive')) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Anchor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {port.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {port.country}, {port.region}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(port.status)}
            <PortStatusBadge status={port.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Port Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{port.type || 'Commercial'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vessels:</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {port.vesselCount || 0}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-medium">
                  {port.capacity ? (port.capacity / 1000000).toFixed(1) + 'M TEU' : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Refineries:</span>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {port.connectedRefineries || 0}
                </Badge>
              </div>
            </div>
          </div>

          {/* Port Statistics */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Activity className="h-3 w-3 text-green-600" />
                  <span className="text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gauge className="h-3 w-3 text-blue-600" />
                  <span className="text-muted-foreground">{port.capacity ? Math.round((port.vesselCount || 0) / (port.capacity / 1000000) * 100) + '%' : 'N/A'}</span>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/ports/${port.id}`)}
                className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MapIcon className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {port.lastUpdated ? new Date(port.lastUpdated).toLocaleDateString() : 'No data'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Port Dialog Component
function AddPortDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PortFormData>({
    resolver: zodResolver(portFormSchema),
    defaultValues: {
      name: '',
      country: '',
      region: '',
      lat: '',
      lng: '',
      type: 'commercial',
      status: 'operational',
      capacity: '',
      description: ''
    }
  });

  const addPortMutation = useMutation({
    mutationFn: async (data: PortFormData) => {
      const portData = {
        ...data,
        capacity: data.capacity ? parseInt(data.capacity) : null
      };
      return apiRequest('/api/ports', {
        method: 'POST',
        body: JSON.stringify(portData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      setOpen(false);
      form.reset();
      toast({
        title: "Port Added Successfully",
        description: "The new port has been added to the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Port",
        description: error.message || "Failed to add port",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: PortFormData) => {
    addPortMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Port
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Port</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port Name</FormLabel>
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
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Netherlands" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="Latin America">Latin America</SelectItem>
                        <SelectItem value="Middle East">Middle East</SelectItem>
                        <SelectItem value="Africa">Africa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input placeholder="51.9225" {...field} />
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
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input placeholder="4.47917" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="oil_terminal">Oil Terminal</SelectItem>
                        <SelectItem value="container">Container Port</SelectItem>
                        <SelectItem value="bulk_cargo">Bulk Cargo</SelectItem>
                        <SelectItem value="passenger">Passenger Port</SelectItem>
                        <SelectItem value="fishing">Fishing Port</SelectItem>
                        <SelectItem value="naval">Naval Base</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="maintenance">Under Maintenance</SelectItem>
                        <SelectItem value="construction">Under Construction</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
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
                    <FormLabel>Capacity (TEU)</FormLabel>
                    <FormControl>
                      <Input placeholder="14000000" {...field} />
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
                      placeholder="Enter port description..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addPortMutation.isPending}>
                {addPortMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Port
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Statistics Cards Component
function PortStatistics({ stats }: { stats: PortStats | undefined }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Ports",
      value: stats.totalPorts.toLocaleString(),
      icon: Anchor,
      color: "blue",
      description: `${stats.operationalPorts} operational`,
      trend: "+12% from last month"
    },
    {
      title: "Active Vessels",
      value: stats.totalVessels.toLocaleString(),
      icon: Ship,
      color: "green",
      description: `${stats.averageVesselsPerPort.toFixed(1)} per port`,
      trend: "+8% from last week"
    },
    {
      title: "Total Capacity",
      value: `${(stats.totalCapacity / 1000000).toFixed(1)}M TEU`,
      icon: Building2,
      color: "purple",
      description: "Combined port capacity",
      trend: "+5% from last quarter"
    },
    {
      title: "Top Region",
      value: stats.topRegions[0]?.region || "N/A",
      icon: Globe,
      color: "orange",
      description: `${stats.topRegions[0]?.count || 0} ports`,
      trend: "Leading region"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <p className="text-xs text-muted-foreground mb-1">
              {stat.description}
            </p>
            <div className="flex items-center space-x-1">
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
export default function PortsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [, navigate] = useLocation();

  const pageSize = 12;

  // Fetch ports data
  const { 
    data: ports = [], 
    isLoading: portsLoading,
    error: portsError,
    refetch: refetchPorts
  } = useQuery({
    queryKey: ['/api/ports'],
    queryFn: async () => {
      const response = await fetch('/api/ports');
      if (!response.ok) {
        throw new Error('Failed to fetch ports');
      }
      return response.json();
    }
  });

  // Fetch port statistics
  const { 
    data: stats,
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['/api/ports/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/ports/statistics');
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      return response.json();
    }
  });

  // Filter ports based on search and filters
  const filteredPorts = ports.filter((port: Port) => {
    const matchesSearch = !searchTerm || 
      port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || port.region === selectedRegion;
    const matchesStatus = selectedStatus === 'all' || port.status === selectedStatus;
    const matchesType = selectedType === 'all' || port.type === selectedType;

    return matchesSearch && matchesRegion && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPorts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPorts = filteredPorts.slice(startIndex, startIndex + pageSize);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion, selectedStatus, selectedType]);

  if (portsLoading) {
    return (
      <div className="container mx-auto p-6">
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
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Ports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was a problem loading the ports data.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => refetchPorts()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ports Management</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive port management with real-time vessel tracking and analytics
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => navigate('/ports/import')}>
            <Upload className="h-4 w-4 mr-2" />
            Import Ports
          </Button>
          <Button variant="outline" onClick={() => navigate('/ports/analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <AddPortDialog />
        </div>
      </div>

      {/* Statistics */}
      <PortStatistics stats={stats} />

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                <SelectItem value="North America">North America</SelectItem>
                <SelectItem value="Latin America">Latin America</SelectItem>
                <SelectItem value="Middle East">Middle East</SelectItem>
                <SelectItem value="Africa">Africa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Under Maintenance</SelectItem>
                <SelectItem value="construction">Under Construction</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
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
                <SelectItem value="oil_terminal">Oil Terminal</SelectItem>
                <SelectItem value="container">Container Port</SelectItem>
                <SelectItem value="bulk_cargo">Bulk Cargo</SelectItem>
                <SelectItem value="passenger">Passenger Port</SelectItem>
                <SelectItem value="fishing">Fishing Port</SelectItem>
                <SelectItem value="naval">Naval Base</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRegion('all');
                  setSelectedStatus('all');
                  setSelectedType('all');
                }}
              >
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchPorts()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode} className="mb-6">
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
              <MapIcon className="h-4 w-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredPorts.length)} of {filteredPorts.length} ports
          </div>
        </div>

        <TabsContent value="grid" className="mt-0">
          {paginatedPorts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPorts.map((port) => (
                <PortCard key={port.id} port={port} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Anchor className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Ports Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || selectedRegion !== 'all' || selectedStatus !== 'all' || selectedType !== 'all'
                    ? "No ports match your current filters."
                    : "No ports have been added to the system yet."
                  }
                </p>
                <div className="flex gap-2">
                  {(searchTerm || selectedRegion !== 'all' || selectedStatus !== 'all' || selectedType !== 'all') && (
                    <Button variant="outline" onClick={() => {
                      setSearchTerm('');
                      setSelectedRegion('all');
                      setSelectedStatus('all');
                      setSelectedType('all');
                    }}>
                      Clear Filters
                    </Button>
                  )}
                  <AddPortDialog />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {paginatedPorts.length > 0 ? (
                <div className="divide-y divide-border">
                  {paginatedPorts.map((port) => (
                    <div key={port.id} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Anchor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{port.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {port.country}, {port.region}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {port.vesselCount || 0} vessels
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {port.type || 'Commercial'}
                            </div>
                          </div>
                          
                          <PortStatusBadge status={port.status} />
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/ports/${port.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Anchor className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Ports Found</h3>
                  <p className="text-muted-foreground text-center">
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
                  <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                  <p className="text-muted-foreground">
                    Map view will show all ports with real-time vessel data
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/ports/map')}>
                    Open Full Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
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