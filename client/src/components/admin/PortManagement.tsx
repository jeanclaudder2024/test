import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FullPageSpinner } from "@/components/common/FullPageSpinner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { RefineryMapSelector } from "./RefineryMapSelector";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Trash2, Search, Plus, MapPin, X, Filter, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the port type based on schema
interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  type: string;
  capacity: number;
  status: string;
  description: string;
  lastUpdated: Date;
}

// Port form schema
const portFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  country: z.string().min(2, { message: "Country must be at least 2 characters" }),
  region: z.string().min(2, { message: "Region is required" }),
  lat: z.string().min(1, { message: "Latitude is required" }),
  lng: z.string().min(1, { message: "Longitude is required" }),
  type: z.string().min(1, { message: "Port type is required" }),
  capacity: z.number().optional(),
  status: z.string().default("active"),
  description: z.string().optional()
});

type PortFormValues = z.infer<typeof portFormSchema>;

// Custom pagination component
const CustomPagination = ({ totalPages, currentPage, onPageChange }: { 
  totalPages: number; 
  currentPage: number; 
  onPageChange: (page: number) => void 
}) => {
  const pageNumbers = [];
  
  // Determine which page numbers to show
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      i === currentPage || 
      i === currentPage - 1 || 
      i === currentPage + 1
    ) {
      pageNumbers.push(i);
    } else if (
      i === currentPage - 2 || 
      i === currentPage + 2
    ) {
      pageNumbers.push(-1); // -1 represents ellipsis
    }
  }
  
  // Filter out duplicate ellipses
  const filteredPageNumbers = pageNumbers.filter((num, index, arr) => {
    if (num === -1) {
      return arr[index - 1] !== -1;
    }
    return true;
  });
  
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          />
        </PaginationItem>
        
        {filteredPageNumbers.map((page, index) => (
          page === -1 ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              {page === currentPage ? (
                <PaginationLink isActive={true}>{page}</PaginationLink>
              ) : (
                <PaginationLink onClick={() => onPageChange(page)}>{page}</PaginationLink>
              )}
            </PaginationItem>
          )
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages || totalPages === 0}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export function PortManagement() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedPortType, setSelectedPortType] = useState<string>("All");
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [formData, setFormData] = useState<Partial<Port>>({
    name: "",
    country: "",
    region: "Middle East",
    lat: "",
    lng: "",
    type: "commercial",
    capacity: 0,
    status: "active",
    description: ""
  });
  const [isRefineryMapOpen, setIsRefineryMapOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Query to fetch ports
  const { data: portsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/ports', page, pageSize, searchTerm, selectedRegion, selectedPortType],
    queryFn: () => apiRequest(`/api/ports?page=${page}&pageSize=${pageSize}&search=${searchTerm}&region=${selectedRegion}&type=${selectedPortType}`),
  });

  // Initialize query client for cache management
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create port form
  const form = useForm<PortFormValues>({
    resolver: zodResolver(portFormSchema),
    defaultValues: formData,
  });

  // Creation mutation
  const createMutation = useMutation({
    mutationFn: (newPort: any) => apiRequest('/api/ports', {
      method: 'POST',
      data: newPort
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      toast({
        title: "Port created",
        description: "The port has been created successfully.",
      });
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create port",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => apiRequest(`/api/ports/${id}`, {
      method: 'PUT',
      data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      toast({
        title: "Port updated",
        description: "The port has been updated successfully.",
      });
      setSelectedPort(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update port",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/ports/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      toast({
        title: "Port deleted",
        description: "The port has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete port",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle create port action
  const handleCreatePort = () => {
    setFormData({
      name: "",
      country: "",
      region: "Middle East",
      lat: "",
      lng: "",
      type: "commercial",
      capacity: 0,
      status: "active",
      description: ""
    });
    form.reset({
      name: "",
      country: "",
      region: "Middle East",
      lat: "",
      lng: "",
      type: "commercial",
      capacity: 0,
      status: "active",
      description: ""
    });
    setIsCreating(true);
  };

  // Handle edit port action
  const handleOpenEdit = (port: Port) => {
    setSelectedPort(port);
    setFormData(port);
    form.reset({
      ...port,
      capacity: port.capacity || 0,
    });
  };

  // Handle submit action (create or update)
  const onSubmit = (values: PortFormValues) => {
    if (selectedPort) {
      updateMutation.mutate({ id: selectedPort.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  // Handle location selection from map
  const handleSelectLocation = (position: [number, number]) => {
    const [lat, lng] = position;
    setFormData(prev => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6)
    }));
    form.setValue('lat', lat.toFixed(6));
    form.setValue('lng', lng.toFixed(6));
    setIsRefineryMapOpen(false);
  };

  // Handle cancel action
  const handleCancel = () => {
    setSelectedPort(null);
    setIsCreating(false);
  };

  // Handle delete action
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this port? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  // Show loading state
  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Port Management</CardTitle>
            <CardDescription>Manage all ports in the system</CardDescription>
          </div>
          <Button onClick={handleCreatePort}>
            <Plus className="mr-2 h-4 w-4" />
            Add Port
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ports..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={selectedRegion}
              onValueChange={setSelectedRegion}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Regions</SelectItem>
                <SelectItem value="Middle East">Middle East</SelectItem>
                <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="North America">North America</SelectItem>
                <SelectItem value="Latin America">Latin America</SelectItem>
                <SelectItem value="Africa">Africa</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedPortType}
              onValueChange={setSelectedPortType}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="oil">Oil</SelectItem>
                <SelectItem value="container">Container</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
                <SelectItem value="cruise">Cruise</SelectItem>
                <SelectItem value="ferry">Ferry</SelectItem>
                <SelectItem value="lng">LNG</SelectItem>
                <SelectItem value="offshore">Offshore</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Ports Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portsData?.data?.length > 0 ? (
                portsData.data.map((port: Port) => (
                  <TableRow key={port.id}>
                    <TableCell className="font-medium">{port.id}</TableCell>
                    <TableCell>{port.name}</TableCell>
                    <TableCell>{port.country}</TableCell>
                    <TableCell>{port.region}</TableCell>
                    <TableCell>
                      <span className="capitalize">{port.type}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        port.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : port.status === 'maintenance' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {port.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(port)}
                        title="Edit port"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(port.id)}
                        title="Delete port"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No ports found. Try adjusting your filters or create a new port.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {portsData?.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((page - 1) * pageSize + 1, portsData.totalCount || 0)} to {Math.min(page * pageSize, portsData.totalCount || 0)} of {portsData.totalCount || 0} ports
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(parseInt(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              
              <CustomPagination
                totalPages={portsData.totalPages}
                currentPage={page}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Port Form Dialog */}
      <Dialog open={isCreating || !!selectedPort} onOpenChange={(open) => {
        if (!open) handleCancel();
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPort ? `Edit Port: ${selectedPort.name}` : 'Create Port'}
            </DialogTitle>
            <DialogDescription>
              {selectedPort 
                ? 'Update the port details below.' 
                : 'Fill in the port details to create a new port entry.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Middle East">Middle East</SelectItem>
                          <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                          <SelectItem value="Europe">Europe</SelectItem>
                          <SelectItem value="North America">North America</SelectItem>
                          <SelectItem value="Latin America">Latin America</SelectItem>
                          <SelectItem value="Africa">Africa</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select port type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="oil">Oil</SelectItem>
                          <SelectItem value="container">Container</SelectItem>
                          <SelectItem value="bulk">Bulk</SelectItem>
                          <SelectItem value="cruise">Cruise</SelectItem>
                          <SelectItem value="ferry">Ferry</SelectItem>
                          <SelectItem value="lng">LNG</SelectItem>
                          <SelectItem value="offshore">Offshore</SelectItem>
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
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
                      <FormLabel>Capacity (tons/day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Handling capacity in tons per day
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="51.9489" {...field} />
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
                        <Input placeholder="4.1472" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRefineryMapOpen(true)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Select Location on Map
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  {form.watch('lat') && form.watch('lng') 
                    ? `Selected: ${form.watch('lat')}, ${form.watch('lng')}` 
                    : 'No location selected'}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the port"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedPort ? 'Update Port' : 'Create Port'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Map Selector Dialog */}
      <Dialog open={isRefineryMapOpen} onOpenChange={setIsRefineryMapOpen}>
        <DialogContent className="sm:max-w-[900px] sm:h-[700px] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Select Port Location</DialogTitle>
            <DialogDescription>
              Click on the map to select the port location.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[600px] w-full relative">
            <RefineryMapSelector
              onSelectPosition={handleSelectLocation}
              initialPosition={form.watch('lat') && form.watch('lng') 
                ? [parseFloat(form.watch('lat')), parseFloat(form.watch('lng'))] 
                : undefined}
              showRefineries={false}
              showVessels={false}
              showPorts={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}