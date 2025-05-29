import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ship, Search, Plus, ExternalLink, Loader2, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Vessel types for the form
const vesselTypes = [
  "Oil Tanker",
  "Chemical Tanker", 
  "LNG Carrier",
  "LPG Carrier",
  "Product Tanker",
  "Crude Oil Tanker",
  "Bulk Carrier",
  "Container Ship",
  "General Cargo"
];

// Regions for vessel location
const regions = [
  "middle-east",
  "europe", 
  "asia-pacific",
  "americas",
  "africa",
  "global"
];

// Vessel status options
const vesselStatuses = [
  "underway",
  "at anchor",
  "in port",
  "loading",
  "discharging",
  "maintenance"
];

// Cargo types
const cargoTypes = [
  "Crude Oil",
  "Refined Products",
  "Diesel",
  "Gasoline",
  "Jet Fuel",
  "Heavy Fuel Oil",
  "Chemicals",
  "LNG",
  "LPG"
];

interface VesselFormData {
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: string;
  deadweight: string;
  cargoCapacity: string;
  currentLat: string;
  currentLng: string;
  departurePort: string;
  departureDate: string;
  destinationPort: string;
  eta: string;
  cargoType: string;
  currentRegion: string;
  status: string;
  speed: string;
  buyerName: string;
  sellerName: string;
}

const initialFormData: VesselFormData = {
  name: "",
  imo: "",
  mmsi: "",
  vesselType: "",
  flag: "",
  built: "",
  deadweight: "",
  cargoCapacity: "",
  currentLat: "",
  currentLng: "",
  departurePort: "",
  departureDate: "",
  destinationPort: "",
  eta: "",
  cargoType: "",
  currentRegion: "",
  status: "",
  speed: "",
  buyerName: "",
  sellerName: ""
};

export default function VesselManagementNew() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<VesselFormData>(initialFormData);
  const [editingVessel, setEditingVessel] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vessels
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["/api/vessels"],
  });

  // Create vessel mutation
  const createVesselMutation = useMutation({
    mutationFn: async (vesselData: any) => {
      const response = await fetch("/api/vessels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vesselData),
      });
      if (!response.ok) throw new Error("Failed to create vessel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      setDialogOpen(false);
      setFormData(initialFormData);
      setEditingVessel(null);
      toast({
        title: "Success",
        description: "Vessel created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vessel",
        variant: "destructive",
      });
    },
  });

  // Update vessel mutation
  const updateVesselMutation = useMutation({
    mutationFn: async ({ id, ...vesselData }: any) => {
      const response = await fetch(`/api/vessels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vesselData),
      });
      if (!response.ok) throw new Error("Failed to update vessel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      setDialogOpen(false);
      setFormData(initialFormData);
      setEditingVessel(null);
      toast({
        title: "Success",
        description: "Vessel updated successfully",
      });
    },
    onError: (error: any) => {
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
      const response = await fetch(`/api/vessels/${vesselId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete vessel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      toast({
        title: "Success",
        description: "Vessel deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vessel",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to proper types
    const vesselData = {
      ...formData,
      built: formData.built ? parseInt(formData.built) : null,
      deadweight: formData.deadweight ? parseInt(formData.deadweight) : null,
      cargoCapacity: formData.cargoCapacity ? parseInt(formData.cargoCapacity) : null,
      departureDate: formData.departureDate ? new Date(formData.departureDate) : null,
      eta: formData.eta ? new Date(formData.eta) : null,
    };

    if (editingVessel) {
      updateVesselMutation.mutate({ id: editingVessel.id, ...vesselData });
    } else {
      createVesselMutation.mutate(vesselData);
    }
  };

  const handleEdit = (vessel: any) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name || "",
      imo: vessel.imo || "",
      mmsi: vessel.mmsi || "",
      vesselType: vessel.vesselType || "",
      flag: vessel.flag || "",
      built: vessel.built ? vessel.built.toString() : "",
      deadweight: vessel.deadweight ? vessel.deadweight.toString() : "",
      cargoCapacity: vessel.cargoCapacity ? vessel.cargoCapacity.toString() : "",
      currentLat: vessel.currentLat || "",
      currentLng: vessel.currentLng || "",
      departurePort: vessel.departurePort || "",
      departureDate: vessel.departureDate ? vessel.departureDate.split('T')[0] : "",
      destinationPort: vessel.destinationPort || "",
      eta: vessel.eta ? vessel.eta.split('T')[0] : "",
      cargoType: vessel.cargoType || "",
      currentRegion: vessel.currentRegion || "",
      status: vessel.status || "",
      speed: vessel.speed || "",
      buyerName: vessel.buyerName || "",
      sellerName: vessel.sellerName || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = (vesselId: number) => {
    if (confirm("Are you sure you want to delete this vessel?")) {
      deleteVesselMutation.mutate(vesselId);
    }
  };

  const openCreateDialog = () => {
    setEditingVessel(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  // Filter vessels based on search term
  const filteredVessels = vessels.filter((vessel: any) =>
    vessel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.imo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.mmsi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ship className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Vessel Management</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Vessel</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVessel ? "Edit Vessel" : "Create New Vessel"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  
                  <div>
                    <Label htmlFor="name">Vessel Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Atlantic Voyager"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="imo">IMO Number *</Label>
                    <Input
                      id="imo"
                      value={formData.imo}
                      onChange={(e) => setFormData({...formData, imo: e.target.value})}
                      placeholder="e.g., IMO1234567"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="mmsi">MMSI Number</Label>
                    <Input
                      id="mmsi"
                      value={formData.mmsi}
                      onChange={(e) => setFormData({...formData, mmsi: e.target.value})}
                      placeholder="e.g., 123456789"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vesselType">Vessel Type *</Label>
                    <Select value={formData.vesselType} onValueChange={(value) => setFormData({...formData, vesselType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vessel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vesselTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="flag">Flag State</Label>
                    <Input
                      id="flag"
                      value={formData.flag}
                      onChange={(e) => setFormData({...formData, flag: e.target.value})}
                      placeholder="e.g., Panama, Liberia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="built">Year Built</Label>
                    <Input
                      id="built"
                      type="number"
                      value={formData.built}
                      onChange={(e) => setFormData({...formData, built: e.target.value})}
                      placeholder="e.g., 2015"
                    />
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Technical Specifications</h3>
                  
                  <div>
                    <Label htmlFor="deadweight">Deadweight (tons)</Label>
                    <Input
                      id="deadweight"
                      type="number"
                      value={formData.deadweight}
                      onChange={(e) => setFormData({...formData, deadweight: e.target.value})}
                      placeholder="e.g., 150000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargoCapacity">Cargo Capacity (barrels)</Label>
                    <Input
                      id="cargoCapacity"
                      type="number"
                      value={formData.cargoCapacity}
                      onChange={(e) => setFormData({...formData, cargoCapacity: e.target.value})}
                      placeholder="e.g., 1000000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargoType">Cargo Type</Label>
                    <Select value={formData.cargoType} onValueChange={(value) => setFormData({...formData, cargoType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cargo type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cargoTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Current Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {vesselStatuses.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="speed">Speed (knots)</Label>
                    <Input
                      id="speed"
                      value={formData.speed}
                      onChange={(e) => setFormData({...formData, speed: e.target.value})}
                      placeholder="e.g., 12.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentRegion">Current Region</Label>
                    <Select value={formData.currentRegion} onValueChange={(value) => setFormData({...formData, currentRegion: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentLat">Current Latitude</Label>
                    <Input
                      id="currentLat"
                      value={formData.currentLat}
                      onChange={(e) => setFormData({...formData, currentLat: e.target.value})}
                      placeholder="e.g., 25.2048"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentLng">Current Longitude</Label>
                    <Input
                      id="currentLng"
                      value={formData.currentLng}
                      onChange={(e) => setFormData({...formData, currentLng: e.target.value})}
                      placeholder="e.g., 55.2708"
                    />
                  </div>

                  <div>
                    <Label htmlFor="departurePort">Departure Port</Label>
                    <Input
                      id="departurePort"
                      value={formData.departurePort}
                      onChange={(e) => setFormData({...formData, departurePort: e.target.value})}
                      placeholder="e.g., Port of Houston"
                    />
                  </div>

                  <div>
                    <Label htmlFor="departureDate">Departure Date</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="destinationPort">Destination Port</Label>
                    <Input
                      id="destinationPort"
                      value={formData.destinationPort}
                      onChange={(e) => setFormData({...formData, destinationPort: e.target.value})}
                      placeholder="e.g., Port of Rotterdam"
                    />
                  </div>

                  <div>
                    <Label htmlFor="eta">Estimated Arrival</Label>
                    <Input
                      id="eta"
                      type="date"
                      value={formData.eta}
                      onChange={(e) => setFormData({...formData, eta: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Trading Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Trading Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buyerName">Buyer Name</Label>
                    <Input
                      id="buyerName"
                      value={formData.buyerName}
                      onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
                      placeholder="e.g., Shell Trading"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sellerName">Seller Name</Label>
                    <Input
                      id="sellerName"
                      value={formData.sellerName}
                      onChange={(e) => setFormData({...formData, sellerName: e.target.value})}
                      placeholder="e.g., ExxonMobil"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createVesselMutation.isPending || updateVesselMutation.isPending}
                >
                  {(createVesselMutation.isPending || updateVesselMutation.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {editingVessel ? "Update Vessel" : "Create Vessel"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search vessels by name, IMO, or MMSI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Vessels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vessels ({filteredVessels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>IMO</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVessels.map((vessel: any) => (
                  <TableRow key={vessel.id}>
                    <TableCell className="font-medium">{vessel.name}</TableCell>
                    <TableCell>{vessel.imo}</TableCell>
                    <TableCell>{vessel.vesselType}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{vessel.status}</Badge>
                    </TableCell>
                    <TableCell>{vessel.currentRegion}</TableCell>
                    <TableCell>{vessel.cargoType}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(vessel)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(vessel.id)}
                          disabled={deleteVesselMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVessels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No vessels found. Click "Add Vessel" to create your first vessel.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}