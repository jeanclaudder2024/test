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
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  MapPin,
  Loader2,
  Globe,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CoordinateMapSelector } from "@/components/map/CoordinateMapSelector";

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

const initialFormData: VesselFormData = {
  name: "",
  imo: "",
  mmsi: "",
  vesselType: "Oil Tanker",
  flag: "",
  built: "",
  deadweight: "",
  length: "",
  width: "",
  status: "At Sea",
  currentLat: "",
  currentLng: "",
  destination: "",
  eta: "",
  speed: "",
  course: "",
  draught: "",
  cargo: "",
  cargoCapacity: "",
};

const vesselTypes = [
  "Oil Tanker",
  "Chemical Tanker",
  "LNG Carrier",
  "LPG Carrier",
  "Product Tanker",
  "Crude Oil Tanker",
  "Bunker Tanker",
  "FPSO",
  "FSU",
  "Other",
];

const vesselStatuses = [
  "At Sea",
  "In Port",
  "Anchored",
  "Under Way",
  "Loading",
  "Discharging",
  "Maintenance",
  "Laid Up",
  "Unknown",
];

export function VesselCrudManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showApiImport, setShowApiImport] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [formData, setFormData] = useState<VesselFormData>(initialFormData);
  const [imoInput, setImoInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vessels
  const { data: vesselsData = [], isLoading, error } = useQuery({
    queryKey: ["/api/vessels"],
    select: (data) => data || [],
  });

  // Import vessel from API mutation
  const importVesselMutation = useMutation({
    mutationFn: async (imo: string) => {
      const response = await apiRequest(`/api/vessels/import/${imo}`, {
        method: "POST",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      toast({
        title: "Success",
        description: "Vessel imported successfully from maritime API!",
      });
      setShowApiImport(false);
      setImoInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import vessel data. Please check the IMO number and try again.",
        variant: "destructive",
      });
    },
  });

  // Create vessel mutation
  const createVesselMutation = useMutation({
    mutationFn: async (vesselData: VesselFormData) => {
      const processedData = {
        ...vesselData,
        built: vesselData.built ? parseInt(vesselData.built) : null,
        deadweight: vesselData.deadweight ? parseInt(vesselData.deadweight) : null,
        length: vesselData.length ? parseFloat(vesselData.length) : null,
        width: vesselData.width ? parseFloat(vesselData.width) : null,
        cargoCapacity: vesselData.cargoCapacity ? parseInt(vesselData.cargoCapacity) : null,
        speed: vesselData.speed || null,
        course: vesselData.course || null,
        draught: vesselData.draught || null,
      };

      const response = await apiRequest("/api/vessels", {
        method: "POST",
        body: JSON.stringify(processedData),
        headers: { "Content-Type": "application/json" },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      toast({
        title: "Success",
        description: "Vessel created successfully!",
      });
      setShowAddDialog(false);
      setFormData(initialFormData);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vessel",
        variant: "destructive",
      });
    },
  });

  // Update vessel mutation
  const updateVesselMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VesselFormData }) => {
      const processedData = {
        ...data,
        built: data.built ? parseInt(data.built) : null,
        deadweight: data.deadweight ? parseInt(data.deadweight) : null,
        length: data.length ? parseFloat(data.length) : null,
        width: data.width ? parseFloat(data.width) : null,
        cargoCapacity: data.cargoCapacity ? parseInt(data.cargoCapacity) : null,
        speed: data.speed || null,
        course: data.course || null,
        draught: data.draught || null,
      };

      const response = await apiRequest(`/api/vessels/${id}`, {
        method: "PATCH",
        body: JSON.stringify(processedData),
        headers: { "Content-Type": "application/json" },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      toast({
        title: "Success",
        description: "Vessel updated successfully!",
      });
      setEditingVessel(null);
      setFormData(initialFormData);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vessel",
        variant: "destructive",
      });
    },
  });

  // Delete vessel mutation
  const deleteVesselMutation = useMutation({
    mutationFn: async (vesselId: number) => {
      const response = await apiRequest(`/api/vessels/${vesselId}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      toast({
        title: "Success",
        description: "Vessel deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vessel",
        variant: "destructive",
      });
    },
  });

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
      status: vessel.status || "At Sea",
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
  };

  const handleImportVessel = () => {
    if (!imoInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid IMO number",
        variant: "destructive",
      });
      return;
    }
    importVesselMutation.mutate(imoInput.trim());
  };

  // Filter and search vessels
  const filteredVessels = vesselsData.filter((vessel: Vessel) => {
    const matchesSearch = vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vessel.imo.includes(searchTerm) ||
                         vessel.mmsi.includes(searchTerm);
    const matchesType = filterType === "all" || vessel.vesselType === filterType;
    const matchesStatus = filterStatus === "all" || vessel.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVessels.length / itemsPerPage);
  const paginatedVessels = filteredVessels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load vessels. Please try again later.
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
                <DialogTitle>Import Vessel from Maritime API</DialogTitle>
                <DialogDescription>
                  Enter the IMO number to automatically fetch vessel data from maritime databases.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imo-input">IMO Number</Label>
                  <Input
                    id="imo-input"
                    placeholder="Enter 7-digit IMO number (e.g., 9074729)"
                    value={imoInput}
                    onChange={(e) => setImoInput(e.target.value)}
                    maxLength={7}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    IMO numbers are 7-digit identifiers for vessels
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowApiImport(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleImportVessel}
                  disabled={importVesselMutation.isPending}
                >
                  {importVesselMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import Vessel'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vessel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vessel</DialogTitle>
                <DialogDescription>
                  Create a new vessel entry with detailed information.
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
                    <Label htmlFor="mmsi">MMSI Number *</Label>
                    <Input
                      id="mmsi"
                      value={formData.mmsi}
                      onChange={(e) => setFormData({ ...formData, mmsi: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vesselType">Vessel Type</Label>
                    <Select value={formData.vesselType} onValueChange={(value) => setFormData({ ...formData, vesselType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vesselTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="flag">Flag</Label>
                    <Input
                      id="flag"
                      value={formData.flag}
                      onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    />
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
                        placeholder="40.7128"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMapSelector(true)}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="currentLng">Current Longitude</Label>
                    <Input
                      id="currentLng"
                      value={formData.currentLng}
                      onChange={(e) => setFormData({ ...formData, currentLng: e.target.value })}
                      placeholder="-74.0060"
                    />
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
                    <Label htmlFor="eta">ETA</Label>
                    <Input
                      id="eta"
                      value={formData.eta}
                      onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
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
                  <Label htmlFor="cargo">Current Cargo</Label>
                  <Textarea
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
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
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search vessels by name, IMO, or MMSI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {vesselTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
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
      </div>

      {/* Vessels Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Vessels ({filteredVessels.length})
          </CardTitle>
          <CardDescription>
            Comprehensive vessel fleet management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
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
                    <TableHead>Destination</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVessels.map((vessel: Vessel) => (
                    <TableRow key={vessel.id}>
                      <TableCell className="font-medium">{vessel.name}</TableCell>
                      <TableCell>{vessel.imo}</TableCell>
                      <TableCell>{vessel.vesselType}</TableCell>
                      <TableCell>{vessel.flag}</TableCell>
                      <TableCell>
                        <Badge variant={vessel.status === "At Sea" ? "default" : "secondary"}>
                          {vessel.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vessel.currentLat && vessel.currentLng ? (
                          <span className="text-sm text-muted-foreground">
                            {parseFloat(vessel.currentLat).toFixed(4)}, {parseFloat(vessel.currentLng).toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>{vessel.destination || "N/A"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(vessel)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
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
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredVessels.length)} of{" "}
                    {filteredVessels.length} vessels
                  </p>
                  <div className="flex gap-2">
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
      {editingVessel && (
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
                  <Label htmlFor="edit-mmsi">MMSI Number *</Label>
                  <Input
                    id="edit-mmsi"
                    value={formData.mmsi}
                    onChange={(e) => setFormData({ ...formData, mmsi: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vesselType">Vessel Type</Label>
                  <Select value={formData.vesselType} onValueChange={(value) => setFormData({ ...formData, vesselType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vesselTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-flag">Flag</Label>
                  <Input
                    id="edit-flag"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  />
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
                      placeholder="40.7128"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMapSelector(true)}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-currentLng">Current Longitude</Label>
                  <Input
                    id="edit-currentLng"
                    value={formData.currentLng}
                    onChange={(e) => setFormData({ ...formData, currentLng: e.target.value })}
                    placeholder="-74.0060"
                  />
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
                  <Label htmlFor="edit-eta">ETA</Label>
                  <Input
                    id="edit-eta"
                    value={formData.eta}
                    onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
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
                <Label htmlFor="edit-cargo">Current Cargo</Label>
                <Textarea
                  id="edit-cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  rows={3}
                />
              </div>
            </form>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingVessel(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateVesselMutation.isPending}>
                {updateVesselMutation.isPending ? "Updating..." : "Update Vessel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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