import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Ship,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  AlertCircle,
  Map,
  Download,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CoordinateMapSelector } from "@/components/map/CoordinateMapSelector";

// Types
interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: number | null;
  deadweight: number | null;
  length: number | null;
  width: number | null;
  status: string | null;
  currentLat: string | null;
  currentLng: string | null;
  destination: string | null;
  eta: string | null;
  speed: string | null;
  course: string | null;
  draught: string | null;
  cargo: string | null;
  cargoCapacity: number | null;
  lastUpdated: Date | null;
}

interface VesselFormData {
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: string;
  deadweight: string;
  length: string;
  width: string;
  status: string;
  currentLat: string;
  currentLng: string;
  destination: string;
  eta: string;
  speed: string;
  course: string;
  draught: string;
  cargo: string;
  cargoCapacity: string;
}

const vesselTypes = [
  "OIL_TANKER",
  "GAS_CARRIER",
  "CONTAINER_SHIP",
  "BULK_CARRIER",
  "GENERAL_CARGO",
  "PASSENGER",
  "OTHER"
];

const vesselStatuses = [
  "AT_SEA",
  "IN_PORT",
  "ANCHORED",
  "LOADING",
  "UNLOADING",
  "MAINTENANCE",
  "UNKNOWN"
];

const flags = [
  "US", "GB", "NO", "DK", "DE", "NL", "FR", "IT", "ES", "GR",
  "PL", "RU", "CN", "JP", "KR", "SG", "HK", "IN", "BR", "AR"
];

export function VesselCrudManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showApiImport, setShowApiImport] = useState(false);
  const [apiImportImo, setApiImportImo] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const itemsPerPage = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<VesselFormData>({
    name: "",
    imo: "",
    mmsi: "",
    vesselType: "OIL_TANKER",
    flag: "US",
    built: "",
    deadweight: "",
    length: "",
    width: "",
    status: "AT_SEA",
    currentLat: "",
    currentLng: "",
    destination: "",
    eta: "",
    speed: "",
    course: "",
    draught: "",
    cargo: "",
    cargoCapacity: "",
  });

  // Fetch vessels
  const { data: vesselsData = [], isLoading, error } = useQuery({
    queryKey: ["/api/vessels"],
    queryFn: async () => {
      const response = await fetch("/api/vessels");
      if (!response.ok) {
        throw new Error("Failed to fetch vessels");
      }
      return response.json();
    },
  });

  // Create vessel mutation
  const createVesselMutation = useMutation({
    mutationFn: async (vesselData: VesselFormData) => {
      const response = await fetch("/api/vessels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...vesselData,
          built: vesselData.built ? parseInt(vesselData.built) : null,
          deadweight: vesselData.deadweight ? parseInt(vesselData.deadweight) : null,
          length: vesselData.length ? parseFloat(vesselData.length) : null,
          width: vesselData.width ? parseFloat(vesselData.width) : null,
          cargoCapacity: vesselData.cargoCapacity ? parseInt(vesselData.cargoCapacity) : null,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create vessel");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success!",
        description: "Vessel created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update vessel mutation
  const updateVesselMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VesselFormData }) => {
      const response = await fetch(`/api/vessels/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          built: data.built ? parseInt(data.built) : null,
          deadweight: data.deadweight ? parseInt(data.deadweight) : null,
          length: data.length ? parseFloat(data.length) : null,
          width: data.width ? parseFloat(data.width) : null,
          cargoCapacity: data.cargoCapacity ? parseInt(data.cargoCapacity) : null,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update vessel");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      setEditingVessel(null);
      resetForm();
      toast({
        title: "Success!",
        description: "Vessel updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete vessel mutation
  const deleteVesselMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/vessels/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete vessel");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      toast({
        title: "Success!",
        description: "Vessel deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Import vessel from API mutation
  const importVesselMutation = useMutation({
    mutationFn: async (imo: string) => {
      const response = await fetch("/api/vessels/import-from-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imo }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import vessel data");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      setShowApiImport(false);
      setApiImportImo("");
      toast({
        title: "Success!",
        description: `Vessel "${data.name}" imported successfully from API.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      imo: "",
      mmsi: "",
      vesselType: "OIL_TANKER",
      flag: "US",
      built: "",
      deadweight: "",
      length: "",
      width: "",
      status: "AT_SEA",
      currentLat: "",
      currentLng: "",
      destination: "",
      eta: "",
      speed: "",
      course: "",
      draught: "",
      cargo: "",
      cargoCapacity: "",
    });
  };

  const handleEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name,
      imo: vessel.imo,
      mmsi: vessel.mmsi,
      vesselType: vessel.vesselType,
      flag: vessel.flag,
      built: vessel.built?.toString() || "",
      deadweight: vessel.deadweight?.toString() || "",
      length: vessel.length?.toString() || "",
      width: vessel.width?.toString() || "",
      status: vessel.status || "AT_SEA",
      currentLat: vessel.currentLat || "",
      currentLng: vessel.currentLng || "",
      destination: vessel.destination || "",
      eta: vessel.eta || "",
      speed: vessel.speed || "",
      course: vessel.course || "",
      draught: vessel.draught || "",
      cargo: vessel.cargo || "",
      cargoCapacity: vessel.cargoCapacity?.toString() || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVessel) {
      updateVesselMutation.mutate({ id: editingVessel.id, data: formData });
    } else {
      createVesselMutation.mutate(formData);
    }
  };

  const handleCoordinateSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      currentLat: lat.toString(),
      currentLng: lng.toString(),
    });
    setShowMapSelector(false);
    toast({
      title: "Coordinates Selected",
      description: `Position set to ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  };

  // Filter vessels
  const filteredVessels = vesselsData.filter((vessel: Vessel) => {
    const matchesSearch = vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vessel.imo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vessel.mmsi.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || vessel.vesselType === typeFilter;
    const matchesStatus = statusFilter === "all" || vessel.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVessels.length / itemsPerPage);
  const paginatedVessels = filteredVessels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string | null) => {
    const statusColors: Record<string, string> = {
      AT_SEA: "bg-blue-100 text-blue-800",
      IN_PORT: "bg-green-100 text-green-800",
      ANCHORED: "bg-yellow-100 text-yellow-800",
      LOADING: "bg-orange-100 text-orange-800",
      UNLOADING: "bg-purple-100 text-purple-800",
      MAINTENANCE: "bg-red-100 text-red-800",
      UNKNOWN: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={statusColors[status || "UNKNOWN"] || statusColors.UNKNOWN}>
        {status?.replace("_", " ") || "Unknown"}
      </Badge>
    );
  };

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load vessels. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vessel Management</h2>
          <p className="text-muted-foreground">
            Manage your vessel fleet with full CRUD operations
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showApiImport} onOpenChange={setShowApiImport}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Import from API
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Vessel from API</DialogTitle>
                <DialogDescription>
                  Enter an IMO number to automatically fetch real vessel data from maritime APIs.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imo-input">IMO Number</Label>
                  <Input
                    id="imo-input"
                    placeholder="e.g., 9234567"
                    value={apiImportImo}
                    onChange={(e) => setApiImportImo(e.target.value)}
                    disabled={importVesselMutation.isPending}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter the 7-digit IMO number to fetch vessel details automatically
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowApiImport(false)}
                  disabled={importVesselMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (apiImportImo.trim()) {
                      setIsImporting(true);
                      importVesselMutation.mutate(apiImportImo.trim());
                    }
                  }}
                  disabled={!apiImportImo.trim() || importVesselMutation.isPending}
                >
                  {importVesselMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import Vessel
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vessel
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Vessel</DialogTitle>
              <DialogDescription>
                Add a new vessel to your fleet management system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Vessel Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imo">IMO Number *</Label>
                  <Input
                    id="imo"
                    value={formData.imo}
                    onChange={(e) => setFormData({ ...formData, imo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mmsi">MMSI *</Label>
                  <Input
                    id="mmsi"
                    value={formData.mmsi}
                    onChange={(e) => setFormData({ ...formData, mmsi: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vesselType">Vessel Type *</Label>
                  <Select value={formData.vesselType} onValueChange={(value) => setFormData({ ...formData, vesselType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vesselTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="flag">Flag State *</Label>
                  <Select value={formData.flag} onValueChange={(value) => setFormData({ ...formData, flag: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {flags.map((flag) => (
                        <SelectItem key={flag} value={flag}>
                          {flag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vesselStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="built">Year Built</Label>
                  <Input
                    id="built"
                    type="number"
                    value={formData.built}
                    onChange={(e) => setFormData({ ...formData, built: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="deadweight">Deadweight (tons)</Label>
                  <Input
                    id="deadweight"
                    type="number"
                    value={formData.deadweight}
                    onChange={(e) => setFormData({ ...formData, deadweight: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="length">Length (m)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width (m)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="currentLat">Current Latitude</Label>
                  <div className="flex gap-2">
                    <Input
                      id="currentLat"
                      value={formData.currentLat}
                      onChange={(e) => setFormData({ ...formData, currentLat: e.target.value })}
                      placeholder="e.g., 40.7128"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMapSelector(true)}
                      className="px-3"
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="currentLng">Current Longitude</Label>
                  <Input
                    id="currentLng"
                    value={formData.currentLng}
                    onChange={(e) => setFormData({ ...formData, currentLng: e.target.value })}
                    placeholder="e.g., -74.0060"
                  />
                </div>
                <div>
                  <Label htmlFor="speed">Speed (knots)</Label>
                  <Input
                    id="speed"
                    value={formData.speed}
                    onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course (degrees)</Label>
                  <Input
                    id="course"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="draught">Draught (m)</Label>
                  <Input
                    id="draught"
                    value={formData.draught}
                    onChange={(e) => setFormData({ ...formData, draught: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cargoCapacity">Cargo Capacity (tons)</Label>
                  <Input
                    id="cargoCapacity"
                    type="number"
                    value={formData.cargoCapacity}
                    onChange={(e) => setFormData({ ...formData, cargoCapacity: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo Description</Label>
                <Textarea
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createVesselMutation.isPending}>
                  {createVesselMutation.isPending ? "Creating..." : "Create Vessel"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vessels by name, IMO, or MMSI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {vesselTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {vesselStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/vessels"] })}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vessels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vessels ({filteredVessels.length})</CardTitle>
          <CardDescription>
            Manage your vessel fleet with complete CRUD operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>IMO</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Flag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVessels.map((vessel: Vessel) => (
                    <TableRow key={vessel.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Ship className="h-4 w-4 text-blue-600" />
                          <span>{vessel.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{vessel.imo}</TableCell>
                      <TableCell>{vessel.vesselType.replace("_", " ")}</TableCell>
                      <TableCell>{vessel.flag}</TableCell>
                      <TableCell>{getStatusBadge(vessel.status)}</TableCell>
                      <TableCell>
                        {vessel.currentLat && vessel.currentLng ? (
                          <div className="flex items-center space-x-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {parseFloat(vessel.currentLat).toFixed(2)}, {parseFloat(vessel.currentLng).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No position</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {vessel.cargoCapacity 
                          ? `${(vessel.cargoCapacity / 1000).toFixed(0)}k tons`
                          : "N/A"
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(vessel)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteVesselMutation.mutate(vessel.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVessels.length)} of {filteredVessels.length} vessels
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingVessel} onOpenChange={() => setEditingVessel(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vessel</DialogTitle>
            <DialogDescription>
              Update vessel information and details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Vessel Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-imo">IMO Number *</Label>
                <Input
                  id="edit-imo"
                  value={formData.imo}
                  onChange={(e) => setFormData({ ...formData, imo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-mmsi">MMSI *</Label>
                <Input
                  id="edit-mmsi"
                  value={formData.mmsi}
                  onChange={(e) => setFormData({ ...formData, mmsi: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-vesselType">Vessel Type *</Label>
                <Select value={formData.vesselType} onValueChange={(value) => setFormData({ ...formData, vesselType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vesselTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-flag">Flag State *</Label>
                <Select value={formData.flag} onValueChange={(value) => setFormData({ ...formData, flag: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {flags.map((flag) => (
                      <SelectItem key={flag} value={flag}>
                        {flag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vesselStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-built">Year Built</Label>
                <Input
                  id="edit-built"
                  type="number"
                  value={formData.built}
                  onChange={(e) => setFormData({ ...formData, built: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-deadweight">Deadweight (tons)</Label>
                <Input
                  id="edit-deadweight"
                  type="number"
                  value={formData.deadweight}
                  onChange={(e) => setFormData({ ...formData, deadweight: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-length">Length (m)</Label>
                <Input
                  id="edit-length"
                  type="number"
                  step="0.1"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-width">Width (m)</Label>
                <Input
                  id="edit-width"
                  type="number"
                  step="0.1"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-currentLat">Current Latitude</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-currentLat"
                    value={formData.currentLat}
                    onChange={(e) => setFormData({ ...formData, currentLat: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMapSelector(true)}
                    className="px-3"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-currentLng">Current Longitude</Label>
                <Input
                  id="edit-currentLng"
                  value={formData.currentLng}
                  onChange={(e) => setFormData({ ...formData, currentLng: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-speed">Speed (knots)</Label>
                <Input
                  id="edit-speed"
                  value={formData.speed}
                  onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-course">Course (degrees)</Label>
                <Input
                  id="edit-course"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-draught">Draught (m)</Label>
                <Input
                  id="edit-draught"
                  value={formData.draught}
                  onChange={(e) => setFormData({ ...formData, draught: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-cargoCapacity">Cargo Capacity (tons)</Label>
                <Input
                  id="edit-cargoCapacity"
                  type="number"
                  value={formData.cargoCapacity}
                  onChange={(e) => setFormData({ ...formData, cargoCapacity: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-destination">Destination</Label>
              <Input
                id="edit-destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-cargo">Cargo Description</Label>
              <Textarea
                id="edit-cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingVessel(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateVesselMutation.isPending}>
                {updateVesselMutation.isPending ? "Updating..." : "Update Vessel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Map Coordinate Selector */}
      {showMapSelector && (
        <CoordinateMapSelector
          isOpen={showMapSelector}
          onClose={() => setShowMapSelector(false)}
          onCoordinateSelect={handleCoordinateSelect}
          title="Select Vessel Position"
          description="Click on the map to set the vessel's current coordinates. Vessels should be positioned in water areas for realistic placement."
          initialLat={formData.currentLat ? parseFloat(formData.currentLat) : 40.7128}
          initialLng={formData.currentLng ? parseFloat(formData.currentLng) : -74.0060}
        />
      )}
    </div>
  );
}