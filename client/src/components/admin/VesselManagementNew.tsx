import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ship, Plus, Edit, Trash2, Search, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CoordinateSelector } from "@/components/map/CoordinateSelector";

interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  currentLat?: string;
  currentLng?: string;
  status?: string;
  speed?: string;
  cargoType?: string;
  cargoCapacity?: number;
}

interface VesselFormData {
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  currentLat: string;
  currentLng: string;
  status: string;
  speed: string;
  cargoType: string;
  cargoCapacity: string;
}

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

const vesselStatuses = [
  "underway",
  "at anchor",
  "moored", 
  "at port",
  "loading",
  "discharging"
];

export function VesselManagementNew() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [formData, setFormData] = useState<VesselFormData>({
    name: "",
    imo: "",
    mmsi: "",
    vesselType: "Oil Tanker",
    flag: "",
    currentLat: "",
    currentLng: "",
    status: "underway",
    speed: "0",
    cargoType: "",
    cargoCapacity: ""
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch vessels
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["/api/vessels"],
    queryFn: async () => {
      const response = await fetch("/api/vessels");
      if (!response.ok) throw new Error("Failed to fetch vessels");
      return response.json();
    }
  });

  // Create vessel mutation
  const createVesselMutation = useMutation({
    mutationFn: async (vesselData: VesselFormData) => {
      // Convert form data to API format
      const payload = {
        name: vesselData.name.trim(),
        imo: vesselData.imo.trim(),
        mmsi: vesselData.mmsi.trim(),
        vesselType: vesselData.vesselType,
        flag: vesselData.flag.trim(),
        currentLat: vesselData.currentLat || undefined,
        currentLng: vesselData.currentLng || undefined,
        status: vesselData.status,
        speed: vesselData.speed || "0",
        cargoType: vesselData.cargoType || undefined,
        cargoCapacity: vesselData.cargoCapacity ? parseInt(vesselData.cargoCapacity) : undefined
      };

      const response = await fetch("/api/vessels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create vessel");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Vessel created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      imo: "",
      mmsi: "",
      vesselType: "Oil Tanker",
      flag: "",
      currentLat: "",
      currentLng: "",
      status: "underway",
      speed: "0",
      cargoType: "",
      cargoCapacity: ""
    });
  };

  const handleInputChange = (field: keyof VesselFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCoordinateSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      currentLat: lat.toString(),
      currentLng: lng.toString()
    }));
    setShowMapSelector(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.imo || !formData.mmsi || !formData.flag) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createVesselMutation.mutate(formData);
  };

  // Filter vessels based on search term
  const filteredVessels = vessels.filter((vessel: Vessel) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      vessel.name.toLowerCase().includes(searchLower) ||
      vessel.imo.toLowerCase().includes(searchLower) ||
      vessel.mmsi.toLowerCase().includes(searchLower) ||
      vessel.vesselType.toLowerCase().includes(searchLower) ||
      vessel.flag.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Vessel Management
              </CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vessel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Vessel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Vessel Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter vessel name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vesselType">Vessel Type *</Label>
                      <Select value={formData.vesselType} onValueChange={(value) => handleInputChange("vesselType", value)}>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imo">IMO Number *</Label>
                      <Input
                        id="imo"
                        value={formData.imo}
                        onChange={(e) => handleInputChange("imo", e.target.value)}
                        placeholder="7-digit IMO number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mmsi">MMSI Number *</Label>
                      <Input
                        id="mmsi"
                        value={formData.mmsi}
                        onChange={(e) => handleInputChange("mmsi", e.target.value)}
                        placeholder="9-digit MMSI number"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flag">Flag *</Label>
                      <Input
                        id="flag"
                        value={formData.flag}
                        onChange={(e) => handleInputChange("flag", e.target.value)}
                        placeholder="Flag state"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {vesselStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentLat">Latitude</Label>
                        <Input
                          id="currentLat"
                          value={formData.currentLat}
                          onChange={(e) => handleInputChange("currentLat", e.target.value)}
                          placeholder="e.g., 25.7617"
                          type="number"
                          step="any"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currentLng">Longitude</Label>
                        <Input
                          id="currentLng"
                          value={formData.currentLng}
                          onChange={(e) => handleInputChange("currentLng", e.target.value)}
                          placeholder="e.g., -80.1918"
                          type="number"
                          step="any"
                        />
                      </div>
                    </div>
                    
                    {/* Map Selector Button */}
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMapSelector(true)}
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Select Position on Map
                      </Button>
                    </div>
                    
                    {/* Show current coordinates if set */}
                    {formData.currentLat && formData.currentLng && (
                      <div className="text-sm text-center text-muted-foreground">
                        Selected: {parseFloat(formData.currentLat).toFixed(6)}, {parseFloat(formData.currentLng).toFixed(6)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="speed">Speed (knots)</Label>
                      <Input
                        id="speed"
                        value={formData.speed}
                        onChange={(e) => handleInputChange("speed", e.target.value)}
                        placeholder="0"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cargoType">Cargo Type</Label>
                      <Input
                        id="cargoType"
                        value={formData.cargoType}
                        onChange={(e) => handleInputChange("cargoType", e.target.value)}
                        placeholder="e.g., Crude Oil"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cargoCapacity">Cargo Capacity</Label>
                      <Input
                        id="cargoCapacity"
                        value={formData.cargoCapacity}
                        onChange={(e) => handleInputChange("cargoCapacity", e.target.value)}
                        placeholder="Capacity in metric tons"
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createVesselMutation.isPending}
                    >
                      {createVesselMutation.isPending ? "Creating..." : "Create Vessel"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search vessels by name, IMO, MMSI, type, or flag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredVessels.length} of {vessels.length} vessels
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
            
            <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>IMO</TableHead>
                  <TableHead>MMSI</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVessels.map((vessel: Vessel) => (
                  <TableRow key={vessel.id}>
                    <TableCell className="font-medium">{vessel.name}</TableCell>
                    <TableCell>{vessel.vesselType}</TableCell>
                    <TableCell>{vessel.imo}</TableCell>
                    <TableCell>{vessel.mmsi}</TableCell>
                    <TableCell>{vessel.flag}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700">
                        {vessel.status || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {vessel.currentLat && vessel.currentLng 
                        ? `${parseFloat(vessel.currentLat).toFixed(2)}, ${parseFloat(vessel.currentLng).toFixed(2)}`
                        : "Not set"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {vessels.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No vessels found. Add your first vessel to get started.
              </div>
            )}
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Selector Modal */}
      {showMapSelector && (
        <Dialog open={showMapSelector} onOpenChange={setShowMapSelector}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select Vessel Position</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Click on the map to select coordinates. You can see refineries (red) and ports (blue) for reference.
              </p>
            </DialogHeader>
            <div className="flex-1">
              <CoordinateSelector
                onCoordinateSelect={handleCoordinateSelect}
                selectedLat={formData.currentLat ? parseFloat(formData.currentLat) : undefined}
                selectedLng={formData.currentLng ? parseFloat(formData.currentLng) : undefined}
                height="60vh"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}