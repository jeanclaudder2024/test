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
  Grid3x3,
  List,
  Map,
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
  Building2,
  Fuel,
  Package,
  Shield,
  Clock,
  Users,
  Star,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapIcon,
  Navigation,
  Compass,
} from 'lucide-react';

// Enhanced form validation schema
const portFormSchema = z.object({
  name: z.string().min(1, 'Port name is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  lat: z.string().min(1, 'Latitude is required'),
  lng: z.string().min(1, 'Longitude is required'),
  type: z.string().optional(),
  status: z.string().optional(),
  capacity: z.string().optional(),
  description: z.string().optional(),
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

function EnhancedPortCard({ port }: { port: Port }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">
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
      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center">
              <Ship className="h-4 w-4 mr-2 text-blue-600" />
              <span className="font-medium">{port.vesselCount}</span>
              <span className="text-muted-foreground ml-1">vessels</span>
            </div>
            <div className="flex items-center">
              <Fuel className="h-4 w-4 mr-2 text-green-600" />
              <span className="font-medium">{port.connectedRefineries}</span>
              <span className="text-muted-foreground ml-1">refineries</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-purple-600" />
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
          <p className="text-sm text-muted-foreground line-clamp-2 bg-gray-50 p-2 rounded">
            {port.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            {port.type && (
              <Badge variant="outline" className="text-xs">
                {port.type}
              </Badge>
            )}
            <div className="text-xs text-muted-foreground flex items-center">
              <Navigation className="h-3 w-3 mr-1" />
              {port.lat}, {port.lng}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MapIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PowerfulAddPortDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
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
      setStep(1);
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

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const autoFillLocation = async (portName: string) => {
    if (portName.length > 3) {
      // Here you could integrate with a geocoding service
      // For now, we'll provide some smart defaults
      const commonPorts = {
        'rotterdam': { country: 'Netherlands', region: 'Europe', lat: '51.9244', lng: '4.4777' },
        'singapore': { country: 'Singapore', region: 'Asia-Pacific', lat: '1.2966', lng: '103.7764' },
        'shanghai': { country: 'China', region: 'Asia-Pacific', lat: '31.2304', lng: '121.4737' },
        'houston': { country: 'United States', region: 'North America', lat: '29.7604', lng: '-95.3698' },
        'dubai': { country: 'UAE', region: 'Middle East', lat: '25.2048', lng: '55.2708' },
      };
      
      const portKey = portName.toLowerCase();
      const match = Object.keys(commonPorts).find(key => portKey.includes(key));
      
      if (match) {
        const portData = commonPorts[match as keyof typeof commonPorts];
        form.setValue('country', portData.country);
        form.setValue('region', portData.region);
        form.setValue('lat', portData.lat);
        form.setValue('lng', portData.lng);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Add New Port
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Anchor className="h-6 w-6 mr-2 text-blue-600" />
            Add New Port - Step {step} of 3
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive port profile with detailed information and capabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-medium">Basic Info</span>
            </div>
            <div className={`h-1 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium">Location</span>
            </div>
            <div className={`h-1 flex-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-medium">Details</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Basic Port Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Start by providing the essential details about the port
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Port Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Port of Rotterdam" 
                            className="h-11"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              autoFillLocation(e.target.value);
                            }}
                          />
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
                        <FormLabel className="text-base font-semibold">Port Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select port type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="commercial">Commercial Port</SelectItem>
                            <SelectItem value="industrial">Industrial Port</SelectItem>
                            <SelectItem value="oil_terminal">Oil Terminal</SelectItem>
                            <SelectItem value="container">Container Port</SelectItem>
                            <SelectItem value="bulk">Bulk Cargo Port</SelectItem>
                            <SelectItem value="cruise">Cruise Terminal</SelectItem>
                            <SelectItem value="naval">Naval Base</SelectItem>
                            <SelectItem value="fishing">Fishing Port</SelectItem>
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
                        <FormLabel className="text-base font-semibold">Operational Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="operational">Fully Operational</SelectItem>
                            <SelectItem value="maintenance">Under Maintenance</SelectItem>
                            <SelectItem value="limited">Limited Operations</SelectItem>
                            <SelectItem value="expansion">Under Expansion</SelectItem>
                            <SelectItem value="closed">Temporarily Closed</SelectItem>
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
                        <FormLabel className="text-base font-semibold">Storage Capacity (MT)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 500000" 
                            className="h-11"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <Compass className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Geographic Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Specify the exact location and regional details
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Country *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Netherlands" 
                            className="h-11"
                            {...field} 
                          />
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
                        <FormLabel className="text-base font-semibold">Region *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
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
                            <SelectItem value="Oceania">Oceania</SelectItem>
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
                        <FormLabel className="text-base font-semibold">Latitude *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 51.9244" 
                            className="h-11"
                            {...field} 
                          />
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
                        <FormLabel className="text-base font-semibold">Longitude *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 4.4777" 
                            className="h-11"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MapIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Smart Location Detection</h4>
                      <p className="text-sm text-blue-700">
                        When you enter a port name, we automatically suggest coordinates for common ports.
                        You can also use external mapping services to find precise coordinates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Add description and finalizing details for the port profile
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Port Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of the port's facilities, services, and capabilities..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{form.watch('name') || '---'}</div>
                    <div className="text-sm text-muted-foreground">Port Name</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{form.watch('country') || '---'}</div>
                    <div className="text-sm text-muted-foreground">Country</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{form.watch('type') || '---'}</div>
                    <div className="text-sm text-muted-foreground">Type</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <div className="flex space-x-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="px-6"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 px-6"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={addPortMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 px-6"
                  >
                    {addPortMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Create Port
                  </Button>
                )}
              </div>
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
        <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
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

export function EnhancedPortManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
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
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Ports Management</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive port management with intelligent features and seamless workflows
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="shadow-sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Bulk
          </Button>
          <PowerfulAddPortDialog />
        </div>
      </div>

      {/* Statistics */}
      <PortStatistics stats={stats} />

      {/* Enhanced Filters */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Smart Filters & Search
          </CardTitle>
          <CardDescription>
            Find and filter ports using multiple criteria
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
                className="pl-10 h-11"
              />
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="h-11">
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
              <SelectTrigger className="h-11">
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
              <SelectTrigger className="h-11">
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

      {/* View Mode Selector */}
      <div className="flex justify-between items-center">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="shadow-sm">
            <TabsTrigger value="grid" className="flex items-center">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="text-sm text-muted-foreground">
          Showing {paginatedPorts.length} of {filteredPorts.length} ports
        </div>
      </div>

      {/* Content Display */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPorts.map((port: Port) => (
            <EnhancedPortCard key={port.id} port={port} />
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <Card className="shadow-sm">
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
                    <tr key={port.id} className="border-b hover:bg-muted/30 transition-colors">
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
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'map' && (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Interactive Port Map
                </h3>
                <p className="text-gray-600 max-w-md">
                  Map view will display all ports with their precise locations, vessel connections, and real-time status indicators
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPorts.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No ports found
          </h3>
          <p className="text-gray-600">
            No ports match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} • {filteredPorts.length} total ports
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}