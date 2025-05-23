import { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Plus, Edit, Trash2, Search, Eye, Map } from "lucide-react";
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
import { RefineryMapSelector } from "./RefineryMapSelector";

// Define the refinery type based on schema
interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity: number;
  status: string;
  description: string;
  operator: string;
  owner: string;
  type: string;
  products: string;
  year_built: number;
  complexity: number;
  utilization: number;
  city: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  technical_specs: string;
  photo: string;
}

export function RefineryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [formData, setFormData] = useState<Partial<Refinery>>({
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
    lng: ""
  });
  const [isRefineryMapOpen, setIsRefineryMapOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Query to fetch refineries
  const { data: refineries, isLoading } = useQuery({
    queryKey: ['/api/refineries', page, pageSize, searchTerm, selectedRegion],
    queryFn: async () => {
      let url = `/api/refineries?page=${page}&pageSize=${pageSize}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (selectedRegion && selectedRegion !== "All") {
        url += `&region=${encodeURIComponent(selectedRegion)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch refineries');
      }
      return response.json();
    }
  });

  // Mutation for creating refinery
  const { mutate: createRefinery, isPending: isCreatingRefinery } = useMutation({
    mutationFn: async (refineryData: Partial<Refinery>) => {
      const response = await fetch("/api/refineries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refineryData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create refinery');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Refinery Created",
        description: "The refinery has been successfully created.",
      });
      setIsCreating(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Refinery",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for updating refinery
  const { mutate: updateRefinery, isPending: isUpdatingRefinery } = useMutation({
    mutationFn: async (refineryData: Partial<Refinery>) => {
      const response = await fetch(`/api/refineries/${refineryData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refineryData),
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
      queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
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
      const response = await fetch(`/api/refineries/${id}`, {
        method: "DELETE",
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
      queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Deleting Refinery",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSelectPosition = (position: { lat: number; lng: number }) => {
    if (isCreating) {
      setFormData(prev => ({ 
        ...prev, 
        lat: position.lat.toString(), 
        lng: position.lng.toString() 
      }));
    } else if (selectedRefinery) {
      setSelectedRefinery(prev => prev ? {
        ...prev,
        lat: position.lat.toString(),
        lng: position.lng.toString()
      } : null);
    }
    setIsRefineryMapOpen(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
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
      lng: ""
    });
  };

  const handleSubmit = () => {
    if (isCreating) {
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

  const handleOpenCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleOpenEdit = (refinery: Refinery) => {
    setSelectedRefinery(refinery);
    setIsCreating(false);
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
                  {refineries && refineries.data && refineries.data.length > 0 ? (
                    refineries.data.map((refinery: Refinery) => (
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
                            <Button variant="outline" size="icon" onClick={() => handleOpenEdit(refinery)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => confirmDelete(refinery.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No refineries found. Try adjusting your filters or add a new refinery.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1} 
                  />
                </PaginationItem>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
                  </PaginationItem>
                )}
                {page > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink isActive>{page}</PaginationLink>
                </PaginationItem>
                {refineries && refineries.totalPages && page < refineries.totalPages - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {refineries && refineries.totalPages && page < refineries.totalPages && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setPage(refineries.totalPages)}>
                      {refineries.totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => refineries && refineries.totalPages && setPage(p => Math.min(refineries.totalPages, p + 1))}
                    disabled={!refineries || !refineries.totalPages || page === refineries.totalPages} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </CardContent>

      {/* Create/Edit Refinery Dialog */}
      <Dialog open={isCreating || !!selectedRefinery} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setSelectedRefinery(null);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add New Refinery" : "Edit Refinery"}</DialogTitle>
            <DialogDescription>
              {isCreating 
                ? "Fill in the details to add a new refinery to the system." 
                : "Update the refinery information."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto">
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
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (barrels per day)</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  placeholder="e.g., 400000" 
                  value={isCreating ? formData.capacity : selectedRefinery?.capacity || ""}
                  onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                />
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
                <Label htmlFor="type">Refinery Type</Label>
                <Input 
                  id="type" 
                  placeholder="e.g., Crude Oil" 
                  value={isCreating ? formData.type : selectedRefinery?.type || ""}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                />
              </div>
              
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsRefineryMapOpen(true)}
                    size="sm"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Select on Map
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    id="latitude" 
                    placeholder="Latitude" 
                    value={isCreating ? formData.lat : selectedRefinery?.lat || ""}
                    onChange={(e) => handleInputChange("lat", e.target.value)}
                    required
                  />
                  <Input 
                    id="longitude" 
                    placeholder="Longitude" 
                    value={isCreating ? formData.lng : selectedRefinery?.lng || ""}
                    onChange={(e) => handleInputChange("lng", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter a description of the refinery..."
                rows={3}
                value={isCreating ? formData.description : selectedRefinery?.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreating(false);
                setSelectedRefinery(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isCreatingRefinery || isUpdatingRefinery}
            >
              {(isCreatingRefinery || isUpdatingRefinery) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isCreating ? "Create Refinery" : "Update Refinery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map Selector Dialog */}
      <RefineryMapSelector
        open={isRefineryMapOpen}
        onOpenChange={setIsRefineryMapOpen}
        onSelectPosition={handleSelectPosition}
        initialPosition={
          isCreating 
            ? formData.lat && formData.lng 
              ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) } 
              : undefined
            : selectedRefinery && selectedRefinery.lat && selectedRefinery.lng
              ? { lat: parseFloat(selectedRefinery.lat), lng: parseFloat(selectedRefinery.lng) }
              : undefined
        }
      />
    </Card>
  );
}

export default RefineryManagement;