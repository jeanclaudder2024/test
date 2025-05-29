import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Zap, Ship } from "lucide-react";

interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: number | null;
  deadweight: number | null;
  currentLat: string | null;
  currentLng: string | null;
  departurePort: string | null;
  departureDate: string | null;
  destinationPort: string | null;
  eta: string | null;
  cargoType: string | null;
  cargoCapacity: number | null;
  currentRegion: string | null;
  status: string | null;
  speed: string | null;
  lastUpdated: string | null;
}

interface VesselFormData {
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: string;
  deadweight: string;
  currentLat: string;
  currentLng: string;
  departurePort: string;
  departureDate: string;
  destinationPort: string;
  eta: string;
  cargoType: string;
  cargoCapacity: string;
  currentRegion: string;
  status: string;
  speed: string;
}

const vesselTypes = [
  "Oil Tanker",
  "Container Ship",
  "Bulk Carrier",
  "Chemical Tanker",
  "LNG Carrier",
  "General Cargo"
];

const vesselStatuses = [
  "underway",
  "at anchor",
  "moored",
  "not under command",
  "restricted manoeuvrability"
];

const regions = [
  "north-atlantic",
  "south-atlantic", 
  "north-pacific",
  "south-pacific",
  "indian-ocean",
  "mediterranean",
  "baltic-sea",
  "north-sea",
  "persian-gulf",
  "red-sea",
  "caribbean",
  "asia-pacific"
];

const defaultFormData: VesselFormData = {
  name: "",
  imo: "",
  mmsi: "",
  vesselType: "",
  flag: "",
  built: "",
  deadweight: "",
  currentLat: "",
  currentLng: "",
  departurePort: "",
  departureDate: "",
  destinationPort: "",
  eta: "",
  cargoType: "",
  cargoCapacity: "",
  currentRegion: "",
  status: "underway",
  speed: ""
};

export default function NewVesselManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>(defaultFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vessels
  const { data: vessels, isLoading } = useQuery({
    queryKey: ["/api/admin/vessels"],
    queryFn: async () => {
      const response = await fetch("/api/admin/vessels");
      if (!response.ok) throw new Error("Failed to fetch vessels");
      return response.json();
    }
  });

  // Create vessel mutation
  const createVesselMutation = useMutation({
    mutationFn: async (vesselData: VesselFormData) => {
      // Convert form data to proper types
      const processedData = {
        name: vesselData.name.trim(),
        imo: vesselData.imo.trim(),
        mmsi: vesselData.mmsi.trim(),
        vesselType: vesselData.vesselType,
        flag: vesselData.flag.trim(),
        built: vesselData.built ? parseInt(vesselData.built) : null,
        deadweight: vesselData.deadweight ? parseInt(vesselData.deadweight) : null,
        currentLat: vesselData.currentLat ? vesselData.currentLat : null,
        currentLng: vesselData.currentLng ? vesselData.currentLng : null,
        departurePort: vesselData.departurePort.trim() || null,
        departureDate: vesselData.departureDate ? new Date(vesselData.departureDate).toISOString() : null,
        destinationPort: vesselData.destinationPort.trim() || null,
        eta: vesselData.eta ? new Date(vesselData.eta).toISOString() : null,
        cargoType: vesselData.cargoType.trim() || null,
        cargoCapacity: vesselData.cargoCapacity ? parseInt(vesselData.cargoCapacity) : null,
        currentRegion: vesselData.currentRegion || null,
        status: vesselData.status || "underway",
        speed: vesselData.speed.trim() || null
      };

      const response = await fetch("/api/admin/vessels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create vessel");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vessels"] });
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setEditingVessel(null);
      toast({ title: "Success", description: "Vessel created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update vessel mutation
  const updateVesselMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VesselFormData }) => {
      // Convert form data to proper types
      const processedData = {
        name: data.name.trim(),
        imo: data.imo.trim(),
        mmsi: data.mmsi.trim(),
        vesselType: data.vesselType,
        flag: data.flag.trim(),
        built: data.built ? parseInt(data.built) : null,
        deadweight: data.deadweight ? parseInt(data.deadweight) : null,
        currentLat: data.currentLat ? data.currentLat : null,
        currentLng: data.currentLng ? data.currentLng : null,
        departurePort: data.departurePort.trim() || null,
        departureDate: data.departureDate ? new Date(data.departureDate).toISOString() : null,
        destinationPort: data.destinationPort.trim() || null,
        eta: data.eta ? new Date(data.eta).toISOString() : null,
        cargoType: data.cargoType.trim() || null,
        cargoCapacity: data.cargoCapacity ? parseInt(data.cargoCapacity) : null,
        currentRegion: data.currentRegion || null,
        status: data.status || "underway",
        speed: data.speed.trim() || null
      };

      const response = await fetch(`/api/admin/vessels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update vessel");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vessels"] });
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setEditingVessel(null);
      toast({ title: "Success", description: "Vessel updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete vessel mutation
  const deleteVesselMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/vessels/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete vessel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vessels"] });
      toast({ title: "Success", description: "Vessel deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Generate AI vessel data
  const generateAIDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/vessels/generate-ai", {
        method: "POST"
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate AI vessel data");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        name: data.name || "",
        imo: data.imo || "",
        mmsi: data.mmsi || "",
        vesselType: data.vesselType || "",
        flag: data.flag || "",
        built: data.built?.toString() || "",
        deadweight: data.deadweight?.toString() || "",
        currentLat: data.currentLat || "",
        currentLng: data.currentLng || "",
        cargoType: data.cargoType || "",
        cargoCapacity: data.cargoCapacity?.toString() || "",
        speed: data.speed || "",
        currentRegion: data.currentRegion || ""
      }));
      toast({ title: "Success", description: "AI vessel data generated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "AI Generation Failed", 
        description: "Please provide your OpenAI API key to use auto-fill features", 
        variant: "destructive" 
      });
    }
  });

  const handleEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name || "",
      imo: vessel.imo || "",
      mmsi: vessel.mmsi || "",
      vesselType: vessel.vesselType || "",
      flag: vessel.flag || "",
      built: vessel.built?.toString() || "",
      deadweight: vessel.deadweight?.toString() || "",
      currentLat: vessel.currentLat || "",
      currentLng: vessel.currentLng || "",
      departurePort: vessel.departurePort || "",
      departureDate: vessel.departureDate ? vessel.departureDate.split('T')[0] : "",
      destinationPort: vessel.destinationPort || "",
      eta: vessel.eta ? vessel.eta.split('T')[0] : "",
      cargoType: vessel.cargoType || "",
      cargoCapacity: vessel.cargoCapacity?.toString() || "",
      currentRegion: vessel.currentRegion || "",
      status: vessel.status || "underway",
      speed: vessel.speed || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.imo || !formData.mmsi || !formData.vesselType || !formData.flag) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, IMO, MMSI, vessel type, flag)",
        variant: "destructive"
      });
      return;
    }

    if (editingVessel) {
      updateVesselMutation.mutate({ id: editingVessel.id, data: formData });
    } else {
      createVesselMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingVessel(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vessel Management</h2>
          <p className="text-gray-600">Manage your vessel fleet with advanced tracking capabilities</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vessel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVessel ? "Edit Vessel" : "Add New Vessel"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Auto-fill section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Quick Fill Options</h3>
                    <p className="text-sm text-gray-600">Auto-generate realistic vessel data or clear form</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData(defaultFormData)}
                    >
                      Clear All
                    </Button>
                    <Button
                      type="button"
                      onClick={() => generateAIDataMutation.mutate()}
                      disabled={generateAIDataMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {generateAIDataMutation.isPending ? "Generating..." : "Auto-Fill Data"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Vessel Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="imo">IMO Number *</Label>
                    <Input
                      id="imo"
                      value={formData.imo}
                      onChange={(e) => setFormData(prev => ({ ...prev, imo: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mmsi">MMSI Number *</Label>
                    <Input
                      id="mmsi"
                      value={formData.mmsi}
                      onChange={(e) => setFormData(prev => ({ ...prev, mmsi: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vesselType">Vessel Type *</Label>
                    <Select value={formData.vesselType} onValueChange={(value) => setFormData(prev => ({ ...prev, vesselType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vessel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vesselTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="flag">Flag State *</Label>
                    <Input
                      id="flag"
                      value={formData.flag}
                      onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="built">Year Built</Label>
                    <Input
                      id="built"
                      type="number"
                      value={formData.built}
                      onChange={(e) => setFormData(prev => ({ ...prev, built: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Technical Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deadweight">Deadweight (tons)</Label>
                    <Input
                      id="deadweight"
                      type="number"
                      value={formData.deadweight}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadweight: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargoCapacity">Cargo Capacity (tons)</Label>
                    <Input
                      id="cargoCapacity"
                      type="number"
                      value={formData.cargoCapacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, cargoCapacity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargoType">Cargo Type</Label>
                    <Input
                      id="cargoType"
                      value={formData.cargoType}
                      onChange={(e) => setFormData(prev => ({ ...prev, cargoType: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="speed">Current Speed (knots)</Label>
                    <Input
                      id="speed"
                      value={formData.speed}
                      onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Position Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Position Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentLat">Current Latitude</Label>
                    <Input
                      id="currentLat"
                      value={formData.currentLat}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentLat: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentLng">Current Longitude</Label>
                    <Input
                      id="currentLng"
                      value={formData.currentLng}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentLng: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentRegion">Current Region</Label>
                    <Select value={formData.currentRegion} onValueChange={(value) => setFormData(prev => ({ ...prev, currentRegion: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>{region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {vesselStatuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Voyage Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Voyage Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departurePort">Departure Port</Label>
                    <Input
                      id="departurePort"
                      value={formData.departurePort}
                      onChange={(e) => setFormData(prev => ({ ...prev, departurePort: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="destinationPort">Destination Port</Label>
                    <Input
                      id="destinationPort"
                      value={formData.destinationPort}
                      onChange={(e) => setFormData(prev => ({ ...prev, destinationPort: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="departureDate">Departure Date</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eta">Estimated Arrival</Label>
                    <Input
                      id="eta"
                      type="date"
                      value={formData.eta}
                      onChange={(e) => setFormData(prev => ({ ...prev, eta: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVesselMutation.isPending || updateVesselMutation.isPending}
                >
                  {createVesselMutation.isPending || updateVesselMutation.isPending 
                    ? "Saving..." 
                    : editingVessel ? "Update Vessel" : "Create Vessel"
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vessels Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Vessels ({vessels?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading vessels...</div>
          ) : vessels?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No vessels found. Add your first vessel to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>IMO</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Flag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vessels?.map((vessel: Vessel) => (
                    <TableRow key={vessel.id}>
                      <TableCell className="font-medium">{vessel.name}</TableCell>
                      <TableCell>{vessel.imo}</TableCell>
                      <TableCell>{vessel.vesselType}</TableCell>
                      <TableCell>{vessel.flag}</TableCell>
                      <TableCell>
                        <Badge variant={vessel.status === "underway" ? "default" : "secondary"}>
                          {vessel.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(vessel)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteVesselMutation.mutate(vessel.id)}
                            disabled={deleteVesselMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}