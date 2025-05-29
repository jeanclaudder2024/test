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
import { Ship, Search, Plus, ExternalLink, Loader2 } from "lucide-react";
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

// Vessel statuses
const vesselStatuses = [
  "underway",
  "anchored",
  "moored",
  "not under command",
  "restricted manoeuvrability"
];

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

export function VesselManagementNew() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Fetch vessels using the same approach as the Vessels page
  const { data: vessels = [], isLoading, error } = useQuery({
    queryKey: ["/api/vessels/myshiptracking"],
    queryFn: async () => {
      try {
        // Try MyShipTracking API first (same as Vessels page)
        const response = await fetch("/api/vessels/myshiptracking");
        if (response.ok) {
          const data = await response.json();
          // Filter to only oil vessels with real locations
          return data.filter((vessel: any) => {
            const hasRealLocation = vessel.currentLat && vessel.currentLng && 
                                  !isNaN(Number(vessel.currentLat)) && 
                                  !isNaN(Number(vessel.currentLng));
            const isOilVessel = 
              vessel.vesselType?.toLowerCase().includes('tanker') ||
              vessel.vesselType?.toLowerCase().includes('oil') ||
              vessel.cargoType?.toLowerCase().includes('oil') ||
              vessel.cargoType?.toLowerCase().includes('crude') ||
              vessel.cargoType?.toLowerCase().includes('fuel');
            return isOilVessel && hasRealLocation;
          });
        }
        
        // Fallback to regular vessels endpoint
        const fallbackResponse = await fetch("/api/vessels");
        if (!fallbackResponse.ok) throw new Error("Failed to fetch vessels");
        return fallbackResponse.json();
      } catch (error) {
        console.error("Failed to fetch vessels:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Create vessel mutation
  const createVesselMutation = useMutation({
    mutationFn: async (vesselData: VesselFormData) => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/vessels/myshiptracking"] });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
  const filteredVessels = vessels.filter((vessel: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      vessel.name?.toLowerCase().includes(searchLower) ||
      vessel.shipName?.toLowerCase().includes(searchLower) ||
      vessel.imo?.toLowerCase().includes(searchLower) ||
      vessel.mmsi?.toLowerCase().includes(searchLower) ||
      vessel.vesselType?.toLowerCase().includes(searchLower) ||
      vessel.flag?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading vessels from authentic sources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Failed to load vessel data from external sources.</p>
        <p className="text-sm text-gray-500">
          This requires API access to vessel tracking services.
        </p>
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
                Vessel Management - Connected to Vessels Page Data
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
                    <TableHead>Cargo Type</TableHead>
                    <TableHead>Flag</TableHead>
                    <TableHead>IMO</TableHead>
                    <TableHead>MMSI</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVessels.map((vessel: any) => (
                    <TableRow key={vessel.id || vessel.imo}>
                      <TableCell className="font-medium">{vessel.name || vessel.shipName || 'Unknown'}</TableCell>
                      <TableCell>{vessel.vesselType || vessel.type || 'Oil Tanker'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${
                          vessel.cargoType?.toLowerCase().includes('crude') ? 'bg-black text-white' :
                          vessel.cargoType?.toLowerCase().includes('lng') ? 'bg-blue-100 text-blue-800' :
                          vessel.cargoType?.toLowerCase().includes('diesel') ? 'bg-yellow-100 text-yellow-800' :
                          vessel.cargoType?.toLowerCase().includes('gasoline') ? 'bg-red-100 text-red-800' :
                          vessel.cargoType?.toLowerCase().includes('jet') ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vessel.cargoType || 'Oil Product'}
                        </Badge>
                      </TableCell>
                      <TableCell>{vessel.flag || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs">{vessel.imo || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs">{vessel.mmsi || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${
                          vessel.status === 'underway' ? 'bg-green-100 text-green-800' :
                          vessel.status === 'anchored' ? 'bg-yellow-100 text-yellow-800' :
                          vessel.status === 'moored' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vessel.status || 'underway'}
                        </Badge>
                      </TableCell>
                      <TableCell>{vessel.speed || vessel.currentSpeed || '0'} kn</TableCell>
                      <TableCell>
                        {vessel.currentLat && vessel.currentLng ? (
                          <div className="text-xs">
                            <div>{Number(vessel.currentLat).toFixed(4)}°N</div>
                            <div>{Number(vessel.currentLng).toFixed(4)}°E</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No position</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/vessels/${vessel.id || vessel.imo}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {vessels.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No vessels found. This requires connection to external vessel tracking APIs.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}