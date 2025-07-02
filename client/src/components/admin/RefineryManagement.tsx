import { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Edit, Trash2, Search, Eye, Ship, Anchor, ChevronLeft, ChevronRight, Building2, DollarSign, Shield, Network } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

import RefineryConnectionManager from "./RefineryConnectionManager";

// Define the refinery type based on enhanced schema
interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity?: number;
  status: string;
  description?: string;
  operator?: string;
  owner?: string;
  type?: string;
  products?: string;
  year_built?: number;
  complexity?: string;
  utilization?: string;
  city?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  technical_specs?: string;
  photo?: string;
  
  // Technical Specifications
  distillation_capacity?: string;
  conversion_capacity?: string;
  hydrogen_capacity?: string;
  sulfur_recovery?: string;
  processing_units?: string;
  storage_capacity?: string;
  
  // Financial Information
  investment_cost?: string;
  operating_costs?: string;
  revenue?: string;
  profit_margin?: string;
  market_share?: string;
  
  // Compliance & Regulations
  environmental_certifications?: string;
  safety_record?: string;
  workforce_size?: number;
  annual_throughput?: string;
  crude_oil_sources?: string;
  
  // Strategic Information
  pipeline_connections?: string;
  shipping_terminals?: string;
  rail_connections?: string;
  nearest_port?: string;
  
  // Additional Fields
  fuel_types?: string;
  refinery_complexity?: string;
  daily_throughput?: number;
  annual_revenue?: string;
  employees_count?: number;
  established_year?: number;
  parent_company?: string;
  safety_rating?: string;
  environmental_rating?: string;
  production_capacity?: number;
  maintenance_schedule?: string;
  certifications?: string;
  compliance_status?: string;
  market_position?: string;
  strategic_partnerships?: string;
  expansion_plans?: string;
  technology_upgrades?: string;
  operational_efficiency?: string;
  supply_chain_partners?: string;
  distribution_network?: string;
}

export function RefineryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // State for refinery management
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    country: "",
    region: "Middle East",
    city: "",
    capacity: "",
    lat: "",
    lng: "",
    status: "active",
    description: "",
    operator: "",
    owner: "",
    type: "Crude Oil",
    products: "",
    year_built: "",
    complexity: "",
    utilization: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    technical_specs: "",
    photo: "",
    
    // Technical Specifications
    distillation_capacity: "",
    conversion_capacity: "",
    hydrogen_capacity: "",
    sulfur_recovery: "",
    processing_units: "",
    storage_capacity: "",
    
    // Financial Information
    investment_cost: "",
    operating_costs: "",
    revenue: "",
    profit_margin: "",
    market_share: "",
    
    // Compliance & Regulations
    environmental_certifications: "",
    safety_record: "",
    workforce_size: "",
    annual_throughput: "",
    crude_oil_sources: "",
    
    // Strategic Information
    pipeline_connections: "",
    shipping_terminals: "",
    rail_connections: "",
    nearest_port: "",
    
    // Additional Fields
    fuel_types: "",
    refinery_complexity: "",
    daily_throughput: "",
    annual_revenue: "",
    employees_count: "",
    established_year: "",
    parent_company: "",
    safety_rating: "",
    environmental_rating: "",
    production_capacity: "",
    maintenance_schedule: "",
    certifications: "",
    compliance_status: "",
    market_position: "",
    strategic_partnerships: "",
    expansion_plans: "",
    technology_upgrades: "",
    operational_efficiency: "",
    supply_chain_partners: "",
    distribution_network: "",
    
    generateDetails: true // Enable OpenAI generation by default
  });

  const [isCreating, setIsCreating] = useState(false);

  // Query to fetch refineries
  const { data: refineries, isLoading } = useQuery({
    queryKey: ['/api/refineries', page, pageSize, searchTerm, selectedRegion],
    queryFn: async () => {
      let url = `/api/refineries?page=${page}&pageSize=${pageSize}`;
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      
      if (selectedRegion && selectedRegion !== "All") {
        url += `&region=${selectedRegion}`;
      }
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(url, {
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch refineries");
      }
      
      return response.json();
    }
  });

  // Mutation for creating a new refinery
  const { mutate: createRefinery, isPending: isCreatingRefinery } = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data };
      
      if (payload.generateDetails) {
        payload.generateWithAI = true;
        delete payload.generateDetails;
      }
      
      const token = localStorage.getItem('authToken');
      const response = await fetch("/api/admin/refineries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create refinery');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Set the newly created refinery ID and show the connection dialog
      setNewlyCreatedRefineryId(data.id);
      
      // Show success notification
      toast({
        title: "Refinery Created Successfully",
        description: "Your new refinery has been added to the database.",
      });
      
      // Show the connection dialog immediately after success
      setTimeout(() => {
        setShowConnectionDialog(true);
      }, 500);
      
      // Clear form
      setIsCreating(false);
      
      // Update refinery list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/refineries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Refinery",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for updating a refinery
  const { mutate: updateRefinery, isPending: isUpdatingRefinery } = useMutation({
    mutationFn: async (data: Refinery) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/refineries/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update refinery');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Refinery Updated",
        description: "The refinery has been successfully updated.",
      });
      setSelectedRefinery(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/refineries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Refinery",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting refinery
  const { mutate: deleteRefinery, isPending: isDeletingRefinery } = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/refineries/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete refinery');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Refinery Deleted",
        description: "The refinery has been successfully deleted.",
      });
      setSelectedRefinery(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/refineries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Deleting Refinery",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleOpenCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleOpenEdit = (refinery: Refinery) => {
    // Populate form data with selected refinery values
    const formValues = {
      name: refinery.name || "",
      country: refinery.country || "",
      region: refinery.region || "Middle East",
      city: refinery.city || "",
      capacity: refinery.capacity || 0,
      lat: refinery.lat || "",
      lng: refinery.lng || "",
      status: refinery.status || "active",
      description: refinery.description || "",
      operator: refinery.operator || "",
      owner: refinery.owner || "",
      type: refinery.type || "Crude Oil",
      products: refinery.products || "",
      year_built: refinery.year_built || undefined,
      complexity: refinery.complexity || undefined,
      utilization: refinery.utilization || undefined,
      email: refinery.email || "",
      phone: refinery.phone || "",
      website: refinery.website || "",
      address: refinery.address || "",
      technical_specs: refinery.technical_specs || "",
      photo: refinery.photo || "",
      generateDetails: false // Don't regenerate with AI when editing
    };
    
    // Update form data state with refinery values
    setFormData(formValues);
    
    // Update UI state
    setSelectedRefinery(refinery);
    setIsCreating(false);
    setIsDetailView(false);
  };
  
  const handleOpenDetail = (refinery: Refinery) => {
    setSelectedRefinery(refinery);
    setIsCreating(false);
    setIsDetailView(true);
  };

  const formatCapacity = (capacity: number) => {
    if (!capacity) return "N/A";
    
    if (capacity >= 1000000) {
      return `${(capacity / 1000000).toFixed(2)}M bpd`;
    } else if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(0)}K bpd`;
    } else {
      return `${capacity} bpd`;
    }
  };

  // List of regions for filtering
  const regions = [
    "All",
    "Middle East",
    "North America",
    "South America",
    "Europe",
    "Africa",
    "Asia Pacific"
  ];



  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (isCreating) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (selectedRefinery) {
      setSelectedRefinery(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      country: "",
      region: "Middle East",
      capacity: 0,
      status: "active",
      description: "",
      operator: "",
      owner: "",
      type: "Crude Oil",
      products: "",
      lat: "",
      lng: "",
      city: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      technical_specs: "",
      photo: "",
      year_built: undefined,
      complexity: undefined,
      utilization: undefined,
      generateDetails: true // Reset with OpenAI generation enabled
    });
  };

  // State for connection dialog
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [newlyCreatedRefineryId, setNewlyCreatedRefineryId] = useState<number | null>(null);
  const [connectionType, setConnectionType] = useState<'vessel' | 'port' | null>(null);

  const handleSubmit = () => {
    if (isCreating) {
      // First show toast message so user knows something is happening
      toast({
        title: "Creating refinery...",
        description: "Please wait while we process your request.",
      });
      
      createRefinery(formData);
    } else if (selectedRefinery) {
      updateRefinery(selectedRefinery);
    }
  };

  const confirmDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this refinery? This action cannot be undone.")) {
      deleteRefinery(id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Refinery Management</CardTitle>
            <CardDescription>
              Manage global refineries in the platform
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreate} className="flex items-center gap-1">
            <Plus size={16} /> Add Refinery
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isDetailView && selectedRefinery ? (
          <div className="space-y-6">
            {/* Refinery Detail View */}
            <div className="border rounded-md p-6 mb-6 space-y-6 bg-card">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedRefinery.name}</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDetailView(false)}>
                    Back to List
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      setIsDetailView(false);
                      handleOpenEdit(selectedRefinery);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Refinery
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                    <p className="text-base">{selectedRefinery.city ? `${selectedRefinery.city}, ` : ''}{selectedRefinery.country}, {selectedRefinery.region}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Coordinates: {selectedRefinery.lat}, {selectedRefinery.lng}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={selectedRefinery.status === "active" ? "default" : "secondary"}>
                        {selectedRefinery.status}
                      </Badge>
                      <span>Capacity: {formatCapacity(selectedRefinery.capacity)}</span>
                    </div>
                    <p className="text-sm mt-2">Type: {selectedRefinery.type || "N/A"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Products</h4>
                    <p className="text-sm">{selectedRefinery.products || "N/A"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                    {selectedRefinery.email && <p className="text-sm">Email: {selectedRefinery.email}</p>}
                    {selectedRefinery.phone && <p className="text-sm">Phone: {selectedRefinery.phone}</p>}
                    {selectedRefinery.website && <p className="text-sm">Website: {selectedRefinery.website}</p>}
                    {!selectedRefinery.email && !selectedRefinery.phone && !selectedRefinery.website && 
                      <p className="text-sm text-muted-foreground">No contact information available</p>}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Operator/Owner</h4>
                    <p className="text-sm">Operator: {selectedRefinery.operator || "N/A"}</p>
                    <p className="text-sm">Owner: {selectedRefinery.owner || "N/A"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-sm whitespace-pre-line">{selectedRefinery.description || "No description available"}</p>
                  </div>
                </div>
              </div>
              
              {/* Vessel Connection Manager */}
              <div className="mt-8 pt-4 border-t">
                <RefineryConnectionManager refineryId={selectedRefinery.id} mode="refinery" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search refineries..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/4">
                <Select 
                  value={selectedRegion} 
                  onValueChange={(value) => setSelectedRegion(value)}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Operator</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {refineries && refineries.length > 0 ? (
                        refineries.map((refinery: Refinery) => (
                          <TableRow key={refinery.id}>
                            <TableCell className="font-medium">{refinery.name}</TableCell>
                            <TableCell>
                              {refinery.city}, {refinery.country}
                              <div className="text-xs text-muted-foreground">{refinery.region}</div>
                            </TableCell>
                            <TableCell>{formatCapacity(refinery.capacity)}</TableCell>
                            <TableCell>
                              <Badge variant={refinery.status === "active" ? "default" : "destructive"}>
                                {refinery.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{refinery.type || "Standard"}</TableCell>
                            <TableCell>{refinery.operator || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleOpenEdit(refinery)} title="Edit">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleOpenDetail(refinery)} title="View Details">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => confirmDelete(refinery.id)} title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No refineries found. Try adjusting your search or filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!refineries || refineries.length < pageSize}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>

      {/* Create/Edit Refinery Dialog */}
      <Dialog open={isCreating || (!!selectedRefinery && !isDetailView)} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setSelectedRefinery(null);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Create New Refinery" : "Edit Refinery"}</DialogTitle>
            <DialogDescription>
              {isCreating 
                ? "Add a new refinery to the platform with all relevant details."
                : "Update the details for this refinery."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Refinery Name*</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Yanbu Refinery" 
                  value={isCreating ? formData.name : selectedRefinery?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country*</Label>
                <Input 
                  id="country" 
                  placeholder="e.g., Saudi Arabia" 
                  value={isCreating ? formData.country : selectedRefinery?.country || ""}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="e.g., Yanbu" 
                  value={isCreating ? formData.city : selectedRefinery?.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Region*</Label>
                <Select 
                  value={isCreating ? formData.region : selectedRefinery?.region || "Middle East"}
                  onValueChange={(value) => handleInputChange("region", value)}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.filter(r => r !== "All").map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (bpd)</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  placeholder="e.g., 400000" 
                  value={isCreating ? formData.capacity : selectedRefinery?.capacity || ""}
                  onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={isCreating ? formData.status : selectedRefinery?.status || "active"}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Refinery Type</Label>
                <Input 
                  id="type" 
                  placeholder="e.g., Crude Oil" 
                  value={isCreating ? formData.type : selectedRefinery?.type || ""}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                />
              </div>
              
              {isCreating && (
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="generateDetails" 
                    checked={formData.generateDetails}
                    onCheckedChange={(checked) => 
                      handleInputChange("generateDetails", checked === true)
                    }
                  />
                  <Label 
                    htmlFor="generateDetails" 
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Auto-generate additional details with AI
                  </Label>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="products">Products</Label>
                <Input 
                  id="products" 
                  placeholder="e.g., Gasoline, Diesel, Jet Fuel" 
                  value={isCreating ? formData.products : selectedRefinery?.products || ""}
                  onChange={(e) => handleInputChange("products", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location">Location (Latitude, Longitude)*</Label>

                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    id="lat" 
                    placeholder="Latitude" 
                    value={isCreating ? formData.lat : selectedRefinery?.lat || ""}
                    onChange={(e) => handleInputChange("lat", e.target.value)}
                    required
                  />
                  <Input 
                    id="lng" 
                    placeholder="Longitude" 
                    value={isCreating ? formData.lng : selectedRefinery?.lng || ""}
                    onChange={(e) => handleInputChange("lng", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="operator">Operator</Label>
                <Input 
                  id="operator" 
                  placeholder="e.g., Saudi Aramco" 
                  value={isCreating ? formData.operator : selectedRefinery?.operator || ""}
                  onChange={(e) => handleInputChange("operator", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input 
                  id="owner" 
                  placeholder="e.g., Saudi Aramco" 
                  value={isCreating ? formData.owner : selectedRefinery?.owner || ""}
                  onChange={(e) => handleInputChange("owner", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year_built">Year Built</Label>
                <Input 
                  id="year_built" 
                  type="number" 
                  placeholder="e.g., 1982" 
                  value={isCreating ? formData.year_built || "" : selectedRefinery?.year_built || ""}
                  onChange={(e) => handleInputChange("year_built", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter a description of the refinery" 
                  value={isCreating ? formData.description : selectedRefinery?.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="e.g., contact@refinery.com" 
                  value={isCreating ? formData.email : selectedRefinery?.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  placeholder="e.g., +966 123 4567" 
                  value={isCreating ? formData.phone : selectedRefinery?.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  placeholder="e.g., https://refinery.com" 
                  value={isCreating ? formData.website : selectedRefinery?.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setSelectedRefinery(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isCreatingRefinery || isUpdatingRefinery}
            >
              {isCreatingRefinery || isUpdatingRefinery ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreating ? "Creating..." : "Updating..."}
                </>
              ) : (
                isCreating ? "Create Refinery" : "Update Refinery"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Connection Selection Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect Your New Refinery</DialogTitle>
            <DialogDescription>
              Would you like to connect this refinery to vessels or ports?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                setConnectionType('vessel');
                setShowConnectionDialog(false);
                // Show vessel connection interface
                if (newlyCreatedRefineryId) {
                  queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
                  // Fetch the newly created refinery and open in detail view
                  fetch(`/api/refineries/${newlyCreatedRefineryId}`)
                    .then(res => res.json())
                    .then(data => {
                      setSelectedRefinery(data);
                      setIsDetailView(true);
                    });
                }
              }}
            >
              <Ship className="h-8 w-8" />
              <span>Connect to Vessels</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                setConnectionType('port');
                setShowConnectionDialog(false);
                // Show port connection interface
                if (newlyCreatedRefineryId) {
                  queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
                  // Fetch the newly created refinery and open in detail view
                  fetch(`/api/refineries/${newlyCreatedRefineryId}`)
                    .then(res => res.json())
                    .then(data => {
                      setSelectedRefinery(data);
                      setIsDetailView(true);
                    });
                }
              }}
            >
              <Anchor className="h-8 w-8" />
              <span>Connect to Ports</span>
            </Button>
          </div>
          
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowConnectionDialog(false);
                setConnectionType(null);
                toast({
                  title: "Refinery Created",
                  description: "You can connect it to vessels or ports later from the refinery details view.",
                });
              }}
            >
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default RefineryManagement;