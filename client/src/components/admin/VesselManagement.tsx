import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, MapPin, Zap, Ship, Eye } from "lucide-react";
import MapSelector from "../MapSelector";

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
  departureLat: string | null;
  departureLng: string | null;
  destinationPort: string | null;
  destinationLat: string | null;
  destinationLng: string | null;
  eta: string | null;
  cargoType: string | null;
  cargoCapacity: number | null;
  currentRegion: string | null;
  status: string | null;
  speed: string | null;
  buyerName: string | null;
  sellerName: string | null;
  ownerName: string | null;
  operatorName: string | null;
  oilSource: string | null;
  metadata: string | null;
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
  departureLat: string;
  departureLng: string;
  destinationPort: string;
  destinationLat: string;
  destinationLng: string;
  eta: string;
  cargoType: string;
  cargoCapacity: string;
  currentRegion: string;
  status: string;
  speed: string;
  buyerName: string;
  sellerName: string;
  ownerName: string;
  operatorName: string;
  oilSource: string;
}

const vesselTypes = [
  "Oil Tanker",
  "Chemical Tanker", 
  "Gas Tanker",
  "Bulk Carrier",
  "Container Ship",
  "General Cargo",
  "Other"
];

const vesselStatuses = [
  "underway",
  "at port",
  "anchored",
  "moored",
  "idle",
  "near refinery",
  "loading",
  "discharging"
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
  departureLat: "",
  departureLng: "",
  destinationPort: "",
  destinationLat: "",
  destinationLng: "",
  eta: "",
  cargoType: "",
  cargoCapacity: "",
  currentRegion: "",
  status: "underway",
  speed: "",
  buyerName: "",
  sellerName: "",
  ownerName: "",
  operatorName: "",
  oilSource: ""
};

export default function VesselManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>(defaultFormData);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [mapSelectorType, setMapSelectorType] = useState<'current' | 'departure' | 'destination'>('current');
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
      const response = await fetch("/api/admin/vessels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vesselData)
      });
      if (!response.ok) throw new Error("Failed to create vessel");
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
      const response = await fetch(`/api/admin/vessels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update vessel");
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
      if (!response.ok) throw new Error("Failed to generate AI vessel data");
      return response.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        ...data
      }));
      toast({ title: "Success", description: "AI vessel data generated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      departureLat: vessel.departureLat || "",
      departureLng: vessel.departureLng || "",
      destinationPort: vessel.destinationPort || "",
      destinationLat: vessel.destinationLat || "",
      destinationLng: vessel.destinationLng || "",
      eta: vessel.eta ? vessel.eta.split('T')[0] : "",
      cargoType: vessel.cargoType || "",
      cargoCapacity: vessel.cargoCapacity?.toString() || "",
      currentRegion: vessel.currentRegion || "",
      status: vessel.status || "underway",
      speed: vessel.speed || "",
      buyerName: vessel.buyerName || "",
      sellerName: vessel.sellerName || "",
      ownerName: vessel.ownerName || "",
      operatorName: vessel.operatorName || "",
      oilSource: vessel.oilSource || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vessel?")) {
      deleteVesselMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVessel) {
      updateVesselMutation.mutate({ id: editingVessel.id, data: formData });
    } else {
      createVesselMutation.mutate(formData);
    }
  };

  const handleMapSelect = (lat: number, lng: number) => {
    if (mapSelectorType === 'current') {
      setFormData(prev => ({ ...prev, currentLat: lat.toString(), currentLng: lng.toString() }));
    } else if (mapSelectorType === 'departure') {
      setFormData(prev => ({ ...prev, departureLat: lat.toString(), departureLng: lng.toString() }));
    } else if (mapSelectorType === 'destination') {
      setFormData(prev => ({ ...prev, destinationLat: lat.toString(), destinationLng: lng.toString() }));
    }
    setShowMapSelector(false);
  };

  const openMapSelector = (type: 'current' | 'departure' | 'destination') => {
    setMapSelectorType(type);
    setShowMapSelector(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vessel Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingVessel(null);
              setFormData(defaultFormData);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vessel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVessel ? "Edit Vessel" : "Add New Vessel"}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* AI Generation Button */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => generateAIDataMutation.mutate()}
                  disabled={generateAIDataMutation.isPending}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {generateAIDataMutation.isPending ? "Generating..." : "Generate AI Data"}
                </Button>
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

              {/* Current Position */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="currentLat">Latitude</Label>
                      <Input
                        id="currentLat"
                        value={formData.currentLat}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentLat: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentLng">Longitude</Label>
                      <Input
                        id="currentLng"
                        value={formData.currentLng}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentLng: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={() => openMapSelector('current')}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Select on Map
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentRegion">Current Region</Label>
                      <Input
                        id="currentRegion"
                        value={formData.currentRegion}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentRegion: e.target.value }))}
                      />
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
                  </div>
                </CardContent>
              </Card>

              {/* Route Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Route Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="departurePort">Departure Port</Label>
                      <Input
                        id="departurePort"
                        value={formData.departurePort}
                        onChange={(e) => setFormData(prev => ({ ...prev, departurePort: e.target.value }))}
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="departureLat">Departure Latitude</Label>
                      <Input
                        id="departureLat"
                        value={formData.departureLat}
                        onChange={(e) => setFormData(prev => ({ ...prev, departureLat: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="departureLng">Departure Longitude</Label>
                      <Input
                        id="departureLng"
                        value={formData.departureLng}
                        onChange={(e) => setFormData(prev => ({ ...prev, departureLng: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={() => openMapSelector('departure')}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Select on Map
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="destinationPort">Destination Port</Label>
                      <Input
                        id="destinationPort"
                        value={formData.destinationPort}
                        onChange={(e) => setFormData(prev => ({ ...prev, destinationPort: e.target.value }))}
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="destinationLat">Destination Latitude</Label>
                      <Input
                        id="destinationLat"
                        value={formData.destinationLat}
                        onChange={(e) => setFormData(prev => ({ ...prev, destinationLat: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="destinationLng">Destination Longitude</Label>
                      <Input
                        id="destinationLng"
                        value={formData.destinationLng}
                        onChange={(e) => setFormData(prev => ({ ...prev, destinationLng: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={() => openMapSelector('destination')}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Select on Map
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerName">Owner Company</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="operatorName">Operator Company</Label>
                    <Input
                      id="operatorName"
                      value={formData.operatorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, operatorName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyerName">Buyer</Label>
                    <Input
                      id="buyerName"
                      value={formData.buyerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellerName">Seller</Label>
                    <Input
                      id="sellerName"
                      value={formData.sellerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, sellerName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="oilSource">Oil Source</Label>
                    <Input
                      id="oilSource"
                      value={formData.oilSource}
                      onChange={(e) => setFormData(prev => ({ ...prev, oilSource: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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

      {/* Map Selector Dialog */}
      <Dialog open={showMapSelector} onOpenChange={setShowMapSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Location on Map</DialogTitle>
          </DialogHeader>
          <div className="h-96">
            <MapSelector onLocationSelect={handleMapSelect} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Vessels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vessels ({vessels?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading vessels...</div>
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
                    <TableHead>Current Location</TableHead>
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
                        <Badge variant={vessel.status === 'underway' ? 'default' : 'secondary'}>
                          {vessel.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vessel.currentLat && vessel.currentLng 
                          ? `${parseFloat(vessel.currentLat).toFixed(4)}, ${parseFloat(vessel.currentLng).toFixed(4)}`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/vessels/${vessel.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(vessel)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(vessel.id)}
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