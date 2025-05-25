import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Gauge,
  Link,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { CoordinateMapSelector } from '@/components/map/CoordinateMapSelector';

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

// Status Badge Component
function PortStatusBadge({ status }: { status: string | null }) {
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'construction': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getStatusColor(status)} text-xs font-medium`}
    >
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </Badge>
  );
}

// Enhanced Port Card Component
function EnhancedPortCard({ 
  port, 
  onEdit, 
  onDelete,
  onViewConnections 
}: { 
  port: Port;
  onEdit: (port: Port) => void;
  onDelete: (port: Port) => void;
  onViewConnections: (port: Port) => void;
}) {
  return (
    <Card className="border-border hover:shadow-lg transition-all duration-200 hover:border-primary/20 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Anchor className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                {port.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {port.country} • {port.region}
              </p>
            </div>
          </div>
          <PortStatusBadge status={port.status} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Port Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize truncate ml-2">
                {port.type?.replace('_', ' ') || 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Capacity:</span>
              <span className="font-medium truncate ml-2">
                {port.capacity 
                  ? `${(port.capacity / 1000000).toFixed(1)}M TEU`
                  : 'N/A'
                }
              </span>
            </div>
          </div>

          {/* Connection Information */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-50 rounded">
                <Ship className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vessels</p>
                <p className="text-sm font-semibold text-blue-600">
                  {port.vesselCount || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-orange-50 rounded">
                <Building2 className="h-3 w-3 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Refineries</p>
                <p className="text-sm font-semibold text-orange-600">
                  {port.connectedRefineries || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Total Cargo Information */}
          {port.totalCargo > 0 && (
            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground flex items-center">
                <Truck className="h-3 w-3 mr-1" />
                Total Cargo:
              </span>
              <span className="font-medium text-green-600">
                {(port.totalCargo / 1000000).toFixed(1)}M tons
              </span>
            </div>
          )}
          
          {/* Coordinates */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Coordinates:</span>
            <span className="font-mono">
              {parseFloat(port.lat).toFixed(3)}, {parseFloat(port.lng).toFixed(3)}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 mr-2"
                onClick={() => onViewConnections(port)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEdit(port)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Port
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewConnections(port)}>
                    <Link className="h-4 w-4 mr-2" />
                    Manage Connections
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(port)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Port
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Port Dialog Component
function AddPortDialog() {
  const [open, setOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
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
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ports/statistics'] });
      
      // Generate AI-powered port description if needed
      if (response.id && (!response.description || response.description === '')) {
        await generatePortDescription(response.id);
      }
      
      setOpen(false);
      form.reset();
      setSelectedCoordinates(null);
      setShowMap(false);
      toast({
        title: "Port Added Successfully",
        description: "The new port has been added with AI-generated details.",
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

  // Generate AI-powered port description
  const generatePortDescription = async (portId: number) => {
    try {
      await apiRequest(`/api/ports/${portId}/generate-description`, {
        method: 'POST'
      });
    } catch (error) {
      console.log('Could not generate AI description for port');
    }
  };

  // Handle map coordinate selection
  const handleCoordinateSelect = (lat: number, lng: number) => {
    setSelectedCoordinates({ lat, lng });
    form.setValue('lat', lat.toFixed(6));
    form.setValue('lng', lng.toFixed(6));
    setShowMap(false);
  };

  const onSubmit = (data: PortFormData) => {
    addPortMutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Port
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Anchor className="h-5 w-5 mr-2 text-blue-600" />
              Add New Port
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Port Name</Label>
                <Input
                  id="name"
                  placeholder="Port of Rotterdam"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Netherlands"
                  {...form.register('country')}
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-red-600">{form.formState.errors.country.message}</p>
                )}
              </div>
            </div>

            {/* Map Selection Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Port Location</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(true)}
                  className="flex items-center gap-2"
                >
                  <MapIcon className="h-4 w-4" />
                  Select on Map
                </Button>
              </div>
              
              {selectedCoordinates && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Coordinates Selected from Map
                      </span>
                    </div>
                    <span className="text-sm text-green-700">
                      {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select onValueChange={(value) => form.setValue('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="Latin America">Latin America</SelectItem>
                    <SelectItem value="Middle East">Middle East</SelectItem>
                    <SelectItem value="Africa">Africa</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.region && (
                  <p className="text-sm text-red-600">{form.formState.errors.region.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  placeholder="51.9225"
                  className={selectedCoordinates ? 'bg-green-50 border-green-300' : ''}
                  {...form.register('lat')}
                />
                {form.formState.errors.lat && (
                  <p className="text-sm text-red-600">{form.formState.errors.lat.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  placeholder="4.47917"
                  className={selectedCoordinates ? 'bg-green-50 border-green-300' : ''}
                  {...form.register('lng')}
                />
                {form.formState.errors.lng && (
                  <p className="text-sm text-red-600">{form.formState.errors.lng.message}</p>
                )}
              </div>
            </div>

            {/* Port Specifications */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Port Type</Label>
                <Select onValueChange={(value) => form.setValue('type', value)} defaultValue="commercial">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => form.setValue('status', value)} defaultValue="operational">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="construction">Under Construction</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (TEU)</Label>
                <Input
                  id="capacity"
                  placeholder="14000000"
                  {...form.register('capacity')}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Enter port description..." 
                className="min-h-[80px]"
                {...form.register('description')} 
              />
            </div>

            <DialogFooter>
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Interactive Map Modal */}
      {showMap && (
        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="sm:max-w-[900px] sm:max-h-[700px]">
            <DialogHeader>
              <DialogTitle>Select Port Location</DialogTitle>
            </DialogHeader>
            <CoordinateMapSelector
              onCoordinateSelect={handleCoordinateSelect}
              onClose={() => setShowMap(false)}
              initialLat={25.276987}
              initialLng={55.296249}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Edit Port Dialog Component
function EditPortDialog({ 
  port, 
  open, 
  onOpenChange, 
  onSave, 
  isLoading 
}: { 
  port: Port | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Port>) => void;
  isLoading: boolean;
}) {
  const form = useForm<PortFormData>({
    resolver: zodResolver(portFormSchema),
    defaultValues: {
      name: port?.name || '',
      country: port?.country || '',
      region: port?.region || '',
      lat: port?.lat || '',
      lng: port?.lng || '',
      type: port?.type || 'commercial',
      status: port?.status || 'operational',
      capacity: port?.capacity?.toString() || '',
      description: port?.description || ''
    }
  });

  // Update form when port changes
  useEffect(() => {
    if (port) {
      form.reset({
        name: port.name,
        country: port.country,
        region: port.region,
        lat: port.lat,
        lng: port.lng,
        type: port.type || 'commercial',
        status: port.status || 'operational',
        capacity: port.capacity?.toString() || '',
        description: port.description || ''
      });
    }
  }, [port, form]);

  const onSubmit = (data: PortFormData) => {
    const updates = {
      ...data,
      capacity: data.capacity ? parseInt(data.capacity) : null
    };
    onSave(updates);
  };

  if (!port) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2 text-blue-600" />
            Edit Port: {port.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Port Name</Label>
              <Input
                id="edit-name"
                placeholder="Port of Rotterdam"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country</Label>
              <Input
                id="edit-country"
                placeholder="Netherlands"
                {...form.register('country')}
              />
              {form.formState.errors.country && (
                <p className="text-sm text-red-600">{form.formState.errors.country.message}</p>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-region">Region</Label>
              <Select 
                onValueChange={(value) => form.setValue('region', value)} 
                defaultValue={port.region}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Latin America">Latin America</SelectItem>
                  <SelectItem value="Middle East">Middle East</SelectItem>
                  <SelectItem value="Africa">Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lat">Latitude</Label>
              <Input
                id="edit-lat"
                placeholder="51.9225"
                {...form.register('lat')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lng">Longitude</Label>
              <Input
                id="edit-lng"
                placeholder="4.47917"
                {...form.register('lng')}
              />
            </div>
          </div>

          {/* Port Specifications */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Port Type</Label>
              <Select 
                onValueChange={(value) => form.setValue('type', value)} 
                defaultValue={port.type || 'commercial'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                onValueChange={(value) => form.setValue('status', value)} 
                defaultValue={port.status || 'operational'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="construction">Under Construction</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity (TEU)</Label>
              <Input
                id="edit-capacity"
                placeholder="14000000"
                {...form.register('capacity')}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea 
              id="edit-description"
              placeholder="Enter port description..." 
              className="min-h-[80px]"
              {...form.register('description')} 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Port
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
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
            <div className={`p-2 rounded-lg ${
              stat.color === 'blue' ? 'bg-blue-50' :
              stat.color === 'green' ? 'bg-green-50' :
              stat.color === 'purple' ? 'bg-purple-50' :
              'bg-orange-50'
            }`}>
              <stat.icon className={`h-4 w-4 ${
                stat.color === 'blue' ? 'text-blue-600' :
                stat.color === 'green' ? 'text-green-600' :
                stat.color === 'purple' ? 'text-purple-600' :
                'text-orange-600'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <span className="text-xs text-green-600 font-medium">
                {stat.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Main Enhanced Port Management Component
export function EnhancedPortManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingPort, setDeletingPort] = useState<Port | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const itemsPerPage = 12;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ports data
  const { data: portsData, isLoading, error } = useQuery({
    queryKey: ['/api/ports', currentPage, itemsPerPage, selectedRegion, searchTerm, selectedType, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
        ...(selectedRegion !== 'All' && { region: selectedRegion }),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType !== 'All' && { type: selectedType }),
        ...(selectedStatus !== 'All' && { status: selectedStatus })
      });
      
      const response = await fetch(`/api/ports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ports');
      }
      return response.json();
    }
  });

  // Fetch port statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/ports/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/ports/statistics');
      if (!response.ok) {
        return {
          totalPorts: 0,
          operationalPorts: 0,
          totalVessels: 0,
          totalCapacity: 0,
          averageVesselsPerPort: 0,
          topRegions: []
        };
      }
      return response.json();
    }
  });

  // Delete port mutation
  const deletePortMutation = useMutation({
    mutationFn: async (portId: number) => {
      return apiRequest(`/api/ports/${portId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ports/statistics'] });
      setShowDeleteDialog(false);
      setDeletingPort(null);
      toast({
        title: "Port Deleted Successfully",
        description: "The port has been permanently removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Port",
        description: error.message || "Failed to delete port",
        variant: "destructive",
      });
    }
  });

  // Edit port mutation
  const editPortMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Port> }) => {
      return apiRequest(`/api/ports/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ports/statistics'] });
      setShowEditDialog(false);
      setEditingPort(null);
      toast({
        title: "Port Updated Successfully",
        description: "The port information has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Port",
        description: error.message || "Failed to update port",
        variant: "destructive",
      });
    }
  });

  const ports = portsData?.data || [];
  const totalPages = portsData?.totalPages || 1;

  const handleEditPort = (port: Port) => {
    setEditingPort(port);
    setShowEditDialog(true);
  };

  const handleDeletePort = (port: Port) => {
    setDeletingPort(port);
    setShowDeleteDialog(true);
  };

  const handleViewConnections = (port: Port) => {
    // Navigate to port detail page or open connections modal
    window.location.href = `/port/${port.id}`;
  };

  const confirmDelete = () => {
    if (deletingPort) {
      deletePortMutation.mutate(deletingPort.id);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Port Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor global maritime ports and terminals
          </p>
        </div>
        <div className="flex items-center space-x-3">
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

      {/* Statistics Cards */}
      <PortStatistics stats={stats} />

      {/* Controls */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ports by name or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Regions</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Latin America">Latin America</SelectItem>
                  <SelectItem value="Middle East">Middle East</SelectItem>
                  <SelectItem value="Africa">Africa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="oil_terminal">Oil Terminal</SelectItem>
                  <SelectItem value="container">Container Port</SelectItem>
                  <SelectItem value="bulk_cargo">Bulk Cargo</SelectItem>
                  <SelectItem value="passenger">Passenger Port</SelectItem>
                  <SelectItem value="fishing">Fishing Port</SelectItem>
                  <SelectItem value="naval">Naval Base</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Ports</h3>
            <p className="text-red-700 mb-4">
              There was an error loading the port data. Please try again.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : ports.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Anchor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Ports Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedRegion !== 'All' || selectedType !== 'All'
                ? "No ports match your current filters. Try adjusting your search criteria."
                : "No ports have been added yet. Create your first port to get started."
              }
            </p>
            {(!searchTerm && selectedRegion === 'All' && selectedType === 'All') && (
              <AddPortDialog />
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Port Grid/List */}
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {ports.map((port: Port) => (
              <EnhancedPortCard 
                key={port.id} 
                port={port} 
                onEdit={handleEditPort}
                onDelete={handleDeletePort}
                onViewConnections={handleViewConnections}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, portsData?.totalCount || 0)} of {portsData?.totalCount || 0} ports
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <EditPortDialog
        port={editingPort}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={(updates) => {
          if (editingPort) {
            editPortMutation.mutate({ id: editingPort.id, updates });
          }
        }}
        isLoading={editPortMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Delete Port
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{deletingPort?.name}</strong>"? This action cannot be undone and will remove all associated data including vessel connections and analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletePortMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePortMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Port
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}