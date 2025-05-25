import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  MapPin, 
  Anchor, 
  Ship, 
  Building2, 
  Save, 
  X, 
  RefreshCw,
  MoreHorizontal,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { CoordinateMapSelector } from '@/components/map/CoordinateMapSelector';

// Port form validation schema
const portFormSchema = z.object({
  name: z.string().min(1, "Port name is required"),
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  lat: z.string().min(1, "Latitude is required"),
  lng: z.string().min(1, "Longitude is required"),
  type: z.string().optional(),
  status: z.string().optional(),
  capacity: z.number().optional(),
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
  vesselCount?: number;
  connectedRefineries?: number;
  totalCargo?: number;
}

const regions = [
  'Asia-Pacific',
  'Europe', 
  'North America',
  'Latin America',
  'Middle East',
  'Africa'
];

const portTypes = [
  'oil',
  'commercial', 
  'container',
  'bulk',
  'cruise',
  'fishing',
  'naval'
];

const portStatuses = [
  'operational',
  'under_construction',
  'maintenance',
  'closed',
  'planned'
];

export default function PortCRUD() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [viewingPort, setViewingPort] = useState<Port | null>(null);
  const [portToDelete, setPortToDelete] = useState<Port | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isMapForEdit, setIsMapForEdit] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for creating ports
  const createForm = useForm<PortFormData>({
    resolver: zodResolver(portFormSchema),
    defaultValues: {
      name: '',
      country: '',
      region: '',
      lat: '',
      lng: '',
      type: 'commercial',
      status: 'operational',
      capacity: undefined,
      description: '',
    }
  });

  // Form for editing ports
  const editForm = useForm<PortFormData>({
    resolver: zodResolver(portFormSchema),
    defaultValues: {
      name: '',
      country: '',
      region: '',
      lat: '',
      lng: '',
      type: 'commercial',
      status: 'operational',
      capacity: undefined,
      description: '',
    }
  });

  // Fetch ports
  const { data: ports = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/ports'],
    queryFn: async () => {
      const response = await fetch('/api/ports');
      if (!response.ok) throw new Error('Failed to fetch ports');
      return response.json();
    }
  });

  // Create port mutation
  const createPortMutation = useMutation({
    mutationFn: async (data: PortFormData) => {
      return apiRequest('/api/ports', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (newPort) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      setShowCreateDialog(false);
      createForm.reset();
      toast({
        title: "Port Created",
        description: `Successfully created port: ${newPort.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create port",
        variant: "destructive",
      });
    }
  });

  // Update port mutation
  const updatePortMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PortFormData> }) => {
      return apiRequest(`/api/ports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (updatedPort) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      setShowEditDialog(false);
      setEditingPort(null);
      editForm.reset();
      toast({
        title: "Port Updated",
        description: `Successfully updated port: ${updatedPort.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed", 
        description: error.message || "Failed to update port",
        variant: "destructive",
      });
    }
  });

  // Delete port mutation
  const deletePortMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/ports/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      setShowDeleteDialog(false);
      setPortToDelete(null);
      toast({
        title: "Port Deleted",
        description: "Port has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete port",
        variant: "destructive",
      });
    }
  });

  // Handle coordinate selection from map
  const handleCoordinateSelect = (lat: number, lng: number) => {
    setSelectedCoordinates({ lat, lng });
    if (isMapForEdit && editingPort) {
      editForm.setValue('lat', lat.toFixed(6));
      editForm.setValue('lng', lng.toFixed(6));
    } else {
      createForm.setValue('lat', lat.toFixed(6));
      createForm.setValue('lng', lng.toFixed(6));
    }
    setShowMap(false);
  };

  // Handle edit port
  const handleEditPort = (port: Port) => {
    setEditingPort(port);
    editForm.reset({
      name: port.name,
      country: port.country,
      region: port.region,
      lat: port.lat,
      lng: port.lng,
      type: port.type || 'commercial',
      status: port.status || 'operational',
      capacity: port.capacity || undefined,
      description: port.description || '',
    });
    setShowEditDialog(true);
  };

  // Handle view port
  const handleViewPort = (port: Port) => {
    setViewingPort(port);
    setShowViewDialog(true);
  };

  // Handle delete port
  const handleDeletePort = (port: Port) => {
    setPortToDelete(port);
    setShowDeleteDialog(true);
  };

  // Handle create port form submission
  const onCreateSubmit = (data: PortFormData) => {
    createPortMutation.mutate(data);
  };

  // Handle edit port form submission
  const onEditSubmit = (data: PortFormData) => {
    if (editingPort) {
      updatePortMutation.mutate({ id: editingPort.id, data });
    }
  };

  // Filter ports based on search and filters
  const filteredPorts = ports.filter((port: Port) => {
    const matchesSearch = port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         port.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         port.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || port.region === selectedRegion;
    const matchesType = selectedType === 'all' || port.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || port.status === selectedStatus;
    
    return matchesSearch && matchesRegion && matchesType && matchesStatus;
  });

  const PortStatusBadge = ({ status }: { status: string | null }) => {
    const variant = status === 'operational' ? 'default' : 
                   status === 'under_construction' ? 'secondary' :
                   status === 'maintenance' ? 'outline' : 'destructive';
    
    return <Badge variant={variant}>{status || 'Unknown'}</Badge>;
  };

  const PortTypeBadge = ({ type }: { type: string | null }) => {
    const variant = type === 'oil' ? 'default' : 'secondary';
    return <Badge variant={variant}>{type || 'Unknown'}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Port Management</h1>
          <p className="text-muted-foreground">
            Create, read, update, and delete ports in your maritime system
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Port
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search ports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {portTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {portStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading ports...</p>
          </div>
        ) : filteredPorts.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Anchor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ports Found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or create a new port.</p>
          </div>
        ) : (
          filteredPorts.map((port: Port) => (
            <Card key={port.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Anchor className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg truncate">{port.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewPort(port)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPort(port)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePort(port)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Country</span>
                    <span className="text-sm font-medium">{port.country}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Region</span>
                    <span className="text-sm font-medium">{port.region}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <PortTypeBadge type={port.type} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <PortStatusBadge status={port.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Coordinates</span>
                    <span className="text-sm font-mono">
                      {parseFloat(port.lat).toFixed(3)}, {parseFloat(port.lng).toFixed(3)}
                    </span>
                  </div>

                  {port.vesselCount !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Vessels</span>
                      <div className="flex items-center space-x-1">
                        <Ship className="h-3 w-3" />
                        <span className="text-sm font-medium">{port.vesselCount}</span>
                      </div>
                    </div>
                  )}

                  {port.connectedRefineries !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Refineries</span>
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-3 w-3" />
                        <span className="text-sm font-medium">{port.connectedRefineries}</span>
                      </div>
                    </div>
                  )}

                  {port.capacity && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Capacity</span>
                      <span className="text-sm font-medium">{port.capacity.toLocaleString()} MT</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Port Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create New Port</span>
            </DialogTitle>
            <DialogDescription>
              Add a new port to your maritime system with detailed information
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter port name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter latitude" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter longitude" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsMapForEdit(false);
                  setShowMap(true);
                }}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Select Coordinates on Map
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
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
                          {portTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
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
                          {portStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (MT)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter capacity in metric tons" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter port description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPortMutation.isPending}>
                  {createPortMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Port
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Port Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Port</span>
            </DialogTitle>
            <DialogDescription>
              Update port information and settings
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter port name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter latitude" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter longitude" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsMapForEdit(true);
                  setShowMap(true);
                }}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Update Coordinates on Map
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {portTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {portStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (MT)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter capacity in metric tons" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter port description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePortMutation.isPending}>
                  {updatePortMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Port
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Port Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Port Details</span>
            </DialogTitle>
          </DialogHeader>

          {viewingPort && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Port Name</Label>
                  <p className="text-sm text-muted-foreground">{viewingPort.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Country</Label>
                  <p className="text-sm text-muted-foreground">{viewingPort.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Region</Label>
                  <p className="text-sm text-muted-foreground">{viewingPort.region}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <PortTypeBadge type={viewingPort.type} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <PortStatusBadge status={viewingPort.status} />
                </div>
                {viewingPort.capacity && (
                  <div>
                    <Label className="text-sm font-medium">Capacity</Label>
                    <p className="text-sm text-muted-foreground">{viewingPort.capacity.toLocaleString()} MT</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Coordinates</Label>
                <p className="text-sm text-muted-foreground font-mono">
                  {parseFloat(viewingPort.lat).toFixed(6)}, {parseFloat(viewingPort.lng).toFixed(6)}
                </p>
              </div>

              {viewingPort.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{viewingPort.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {viewingPort.vesselCount !== undefined && (
                  <div>
                    <Label className="text-sm font-medium">Connected Vessels</Label>
                    <div className="flex items-center space-x-2">
                      <Ship className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">{viewingPort.vesselCount}</span>
                    </div>
                  </div>
                )}
                {viewingPort.connectedRefineries !== undefined && (
                  <div>
                    <Label className="text-sm font-medium">Connected Refineries</Label>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">{viewingPort.connectedRefineries}</span>
                    </div>
                  </div>
                )}
              </div>

              {viewingPort.lastUpdated && (
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingPort.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {viewingPort && (
              <Button onClick={() => {
                setShowViewDialog(false);
                handleEditPort(viewingPort);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Port
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Port</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{portToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (portToDelete) {
                  deletePortMutation.mutate(portToDelete.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Map Selection Dialog */}
      {showMap && (
        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="sm:max-w-[900px] sm:max-h-[700px]">
            <DialogHeader>
              <DialogTitle>Select Port Location</DialogTitle>
              <DialogDescription>
                Click on the map to select precise coordinates for the port
              </DialogDescription>
            </DialogHeader>
            <CoordinateMapSelector
              onCoordinateSelect={handleCoordinateSelect}
              onClose={() => setShowMap(false)}
              initialLat={selectedCoordinates?.lat || 25.276987}
              initialLng={selectedCoordinates?.lng || 55.296249}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}