import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Ship, Anchor } from "lucide-react";

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
  "Oil Tanker", "Chemical Tanker", "LNG Tanker", "LPG Tanker", 
  "Product Tanker", "Crude Oil Tanker", "Bulk Carrier", "Container Ship"
];

const vesselStatuses = [
  "At Sea", "In Port", "Anchored", "Loading", "Discharging", "Under Repair", "Unknown"
];

const regions = [
  "north-america", "south-america", "europe", "africa", "asia", "oceania", "middle-east"
];

const defaultFormData: VesselFormData = {
  name: "", imo: "", mmsi: "", vesselType: "", flag: "", built: "",
  deadweight: "", currentLat: "", currentLng: "", departurePort: "",
  departureDate: "", destinationPort: "", eta: "", cargoType: "",
  cargoCapacity: "", currentRegion: "", status: "", speed: ""
};

export default function NewVesselManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
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

  // Fetch refineries for connection options
  const { data: refineries } = useQuery({
    queryKey: ["/api/refineries"],
    queryFn: async () => {
      const response = await fetch("/api/refineries");
      if (!response.ok) throw new Error("Failed to fetch refineries");
      return response.json();
    }
  });

  // Fetch ports for departure and destination options
  const { data: ports } = useQuery({
    queryKey: ["/api/ports"],
    queryFn: async () => {
      const response = await fetch("/api/ports");
      if (!response.ok) throw new Error("Failed to fetch ports");
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
      toast({ title: "Success", description: "Vessel created successfully" });
      setFormData(defaultFormData);
      setShowAddForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create vessel", variant: "destructive" });
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
      toast({ title: "Success", description: "Vessel updated successfully" });
      setEditingVessel(null);
      setFormData(defaultFormData);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update vessel", variant: "destructive" });
    }
  });

  // Delete vessel mutation
  const deleteVesselMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/vessels/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete vessel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vessels"] });
      toast({ title: "Success", description: "Vessel deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete vessel", variant: "destructive" });
    }
  });

  const handleEdit = (vessel: Vessel) => {
    setFormData({
      name: vessel.name,
      imo: vessel.imo,
      mmsi: vessel.mmsi,
      vesselType: vessel.vesselType,
      flag: vessel.flag,
      built: vessel.built?.toString() || "",
      deadweight: vessel.deadweight?.toString() || "",
      currentLat: vessel.currentLat || "",
      currentLng: vessel.currentLng || "",
      departurePort: vessel.departurePort || "",
      departureDate: vessel.departureDate || "",
      destinationPort: vessel.destinationPort || "",
      eta: vessel.eta || "",
      cargoType: vessel.cargoType || "",
      cargoCapacity: vessel.cargoCapacity?.toString() || "",
      currentRegion: vessel.currentRegion || "",
      status: vessel.status || "",
      speed: vessel.speed || "",
    });
    setEditingVessel(vessel);
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setShowAddForm(false);
    setEditingVessel(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vessel Management</h2>
          <p className="text-muted-foreground">Manage your vessel fleet with port and refinery connections</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Vessel
        </Button>
      </div>

      {/* Add Vessel Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Vessel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              createVesselMutation.mutate(formData);
            }} className="space-y-6">
              
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
                </CardContent>
              </Card>

              {/* Port & Refinery Connections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Anchor className="h-5 w-5 mr-2" />
                    Port & Refinery Connections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="departurePort">Departure Location</Label>
                        <Select 
                          value={formData.departurePort} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, departurePort: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select departure port or refinery" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">PORTS</div>
                            {ports && ports.map((port: any) => (
                              <SelectItem key={`port-${port.id}`} value={port.name}>
                                <div className="flex items-center">
                                  <Anchor className="h-3 w-3 mr-2 text-blue-600" />
                                  <span>{port.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">({port.country})</span>
                                </div>
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border-t">REFINERIES</div>
                            {refineries && refineries.map((refinery: any) => (
                              <SelectItem key={`refinery-${refinery.id}`} value={refinery.name}>
                                <div className="flex items-center">
                                  <div className="h-3 w-3 mr-2 bg-orange-500 rounded-sm"></div>
                                  <span>{refinery.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">({refinery.country})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="destinationPort">Destination Location</Label>
                        <Select 
                          value={formData.destinationPort} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, destinationPort: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination port or refinery" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">PORTS</div>
                            {ports && ports.map((port: any) => (
                              <SelectItem key={`port-${port.id}`} value={port.name}>
                                <div className="flex items-center">
                                  <Anchor className="h-3 w-3 mr-2 text-blue-600" />
                                  <span>{port.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">({port.country})</span>
                                </div>
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border-t">REFINERIES</div>
                            {refineries && refineries.map((refinery: any) => (
                              <SelectItem key={`refinery-${refinery.id}`} value={refinery.name}>
                                <div className="flex items-center">
                                  <div className="h-3 w-3 mr-2 bg-orange-500 rounded-sm"></div>
                                  <span>{refinery.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">({refinery.country})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Select from available ports (⚓) or refineries (🟧) to establish vessel connections
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVesselMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createVesselMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Ship className="h-4 w-4 mr-2" />
                      Create Vessel
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vessels List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vessel Fleet</span>
            <Badge variant="secondary">{vessels?.length || 0} vessels</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading vessels...</span>
            </div>
          ) : vessels && vessels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vessel Details</TableHead>
                  <TableHead>Route Connections</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vessels?.map((vessel: Vessel) => (
                  <TableRow key={vessel.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{vessel.name}</div>
                        <div className="text-sm text-muted-foreground">
                          IMO: {vessel.imo} • Type: {vessel.vesselType}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {vessel.departurePort && (
                          <div className="flex items-center">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-xs">From: {vessel.departurePort}</span>
                          </div>
                        )}
                        {vessel.destinationPort && (
                          <div className="flex items-center">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs">To: {vessel.destinationPort}</span>
                          </div>
                        )}
                        {!vessel.departurePort && !vessel.destinationPort && (
                          <span className="text-muted-foreground text-xs">No connections set</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={vessel.status === 'At Sea' ? 'default' : 'secondary'}>
                        {vessel.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(vessel)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteVesselMutation.mutate(vessel.id)}
                          disabled={deleteVesselMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No vessels found</h3>
              <p className="text-muted-foreground">Add your first vessel to start tracking connections.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Vessel Dialog */}
      <Dialog open={!!editingVessel} onOpenChange={() => setEditingVessel(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vessel</DialogTitle>
          </DialogHeader>
          {editingVessel && (
            <form onSubmit={(e) => {
              e.preventDefault();
              updateVesselMutation.mutate({ 
                id: editingVessel.id, 
                data: formData 
              });
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Vessel Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-imo">IMO Number *</Label>
                  <Input
                    id="edit-imo"
                    value={formData.imo}
                    onChange={(e) => setFormData(prev => ({ ...prev, imo: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingVessel(null)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateVesselMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateVesselMutation.isPending ? 'Updating...' : 'Update Vessel'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}