import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Ship, 
  Anchor, 
  Building2, 
  Plus, 
  Link2, 
  Unlink, 
  MapPin, 
  Navigation, 
  GitBranch,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  type: string | null;
  status: string | null;
  capacity: number | null;
  description: string | null;
}

interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  currentLat: string | null;
  currentLng: string | null;
  cargoType: string | null;
  cargoCapacity: number | null;
  status: string | null;
}

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity: number | null;
  type: string | null;
  status: string | null;
}

export default function PortConnectionManager() {
  const { portId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchVessel, setSearchVessel] = useState('');
  const [searchRefinery, setSearchRefinery] = useState('');
  const [newVesselDialog, setNewVesselDialog] = useState(false);
  const [connectVesselDialog, setConnectVesselDialog] = useState(false);
  const [connectRefineryDialog, setConnectRefineryDialog] = useState(false);

  // Fetch port details
  const { data: port, isLoading: portLoading } = useQuery({
    queryKey: [`/api/ports/${portId}`],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}`);
      if (!response.ok) throw new Error('Failed to fetch port');
      return response.json();
    },
    enabled: !!portId
  });

  // Fetch connected vessels
  const { data: connectedVessels = [], refetch: refetchVessels } = useQuery({
    queryKey: [`/api/ports/${portId}/vessels`],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}/vessels`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!portId
  });

  // Fetch all vessels for connection
  const { data: allVessels = [] } = useQuery({
    queryKey: ['/api/vessels'],
    queryFn: async () => {
      const response = await fetch('/api/vessels');
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Fetch nearby refineries
  const { data: nearbyRefineries = [] } = useQuery({
    queryKey: [`/api/ports/${portId}/nearby-refineries`],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}/nearby-refineries`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!portId
  });

  // Connect vessel to port mutation
  const connectVesselMutation = useMutation({
    mutationFn: async ({ vesselId, connectionType }: { vesselId: number; connectionType: string }) => {
      return apiRequest(`/api/ports/${portId}/connect-vessel`, {
        method: 'POST',
        body: JSON.stringify({ vesselId, connectionType })
      });
    },
    onSuccess: () => {
      refetchVessels();
      setConnectVesselDialog(false);
      toast({
        title: "Vessel Connected",
        description: "Vessel has been successfully connected to the port.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect vessel to port",
        variant: "destructive",
      });
    }
  });

  // Add new vessel mutation
  const addVesselMutation = useMutation({
    mutationFn: async (vesselData: any) => {
      return apiRequest('/api/vessels', {
        method: 'POST',
        body: JSON.stringify({
          ...vesselData,
          currentLat: port?.lat,
          currentLng: port?.lng,
          region: port?.region
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vessels'] });
      refetchVessels();
      setNewVesselDialog(false);
      toast({
        title: "Vessel Added",
        description: "New vessel has been added to this port's region.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Vessel",
        description: error.message || "Failed to add new vessel",
        variant: "destructive",
      });
    }
  });

  // Filter available vessels (not connected to this port)
  const availableVessels = allVessels.filter(vessel => 
    !connectedVessels.some((cv: Vessel) => cv.id === vessel.id) &&
    vessel.name.toLowerCase().includes(searchVessel.toLowerCase())
  );

  // Filter refineries by search
  const filteredRefineries = nearbyRefineries.filter((refinery: Refinery) =>
    refinery.name.toLowerCase().includes(searchRefinery.toLowerCase())
  );

  if (portLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!port) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Port Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested port could not be found.</p>
          <Button onClick={() => setLocation('/admin/ports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation('/admin/ports')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{port.name}</h1>
            <p className="text-muted-foreground">
              {port.country} • {port.region} • Connection Management
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Badge variant={port.status === 'operational' ? 'default' : 'secondary'}>
            {port.status}
          </Badge>
          <Badge variant="outline">{port.type}</Badge>
        </div>
      </div>

      {/* Port Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Anchor className="h-5 w-5 mr-2" />
            Port Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Location</Label>
              <p className="font-medium">{port.lat}, {port.lng}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Capacity</Label>
              <p className="font-medium">
                {port.capacity ? `${(port.capacity / 1000000).toFixed(1)}M TEU` : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Connected Vessels</Label>
              <p className="font-medium">{connectedVessels.length}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Nearby Refineries</Label>
              <p className="font-medium">{nearbyRefineries.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="vessels" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vessels" className="flex items-center space-x-2">
            <Ship className="h-4 w-4" />
            <span>Vessel Connections</span>
          </TabsTrigger>
          <TabsTrigger value="refineries" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Refinery Links</span>
          </TabsTrigger>
          <TabsTrigger value="new-vessels" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Vessels</span>
          </TabsTrigger>
        </TabsList>

        {/* Vessel Connections Tab */}
        <TabsContent value="vessels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Connected Vessels ({connectedVessels.length})</h3>
            <Dialog open={connectVesselDialog} onOpenChange={setConnectVesselDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect Vessel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Connect Vessel to Port</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Search Vessels</Label>
                    <Input
                      placeholder="Search by vessel name..."
                      value={searchVessel}
                      onChange={(e) => setSearchVessel(e.target.value)}
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {availableVessels.map((vessel: Vessel) => (
                      <div key={vessel.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{vessel.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {vessel.vesselType} • {vessel.flag} • IMO: {vessel.imo}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => connectVesselMutation.mutate({ 
                            vesselId: vessel.id, 
                            connectionType: 'docked' 
                          })}
                          disabled={connectVesselMutation.isPending}
                        >
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedVessels.map((vessel: Vessel) => (
              <Card key={vessel.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Ship className="h-4 w-4 mr-2" />
                    {vessel.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="text-sm">{vessel.vesselType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Flag:</span>
                      <span className="text-sm">{vessel.flag}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">IMO:</span>
                      <span className="text-sm">{vessel.imo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={vessel.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                        {vessel.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      Track
                    </Button>
                    <Button variant="outline" size="sm">
                      <Unlink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {connectedVessels.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Connected Vessels</h3>
                <p className="text-muted-foreground mb-4">
                  Connect vessels to this port to start tracking their operations.
                </p>
                <Button onClick={() => setConnectVesselDialog(true)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect First Vessel
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Refinery Links Tab */}
        <TabsContent value="refineries" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Nearby Refineries ({nearbyRefineries.length})</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Search refineries..."
                value={searchRefinery}
                onChange={(e) => setSearchRefinery(e.target.value)}
                className="w-64"
              />
              <Button>
                <GitBranch className="h-4 w-4 mr-2" />
                Link Refinery
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRefineries.map((refinery: Refinery) => (
              <Card key={refinery.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    {refinery.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Country:</span>
                      <span className="text-sm">{refinery.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="text-sm">{refinery.type || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Capacity:</span>
                      <span className="text-sm">
                        {refinery.capacity ? `${(refinery.capacity / 1000).toFixed(0)}K bpd` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Link2 className="h-3 w-3 mr-1" />
                      Link
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPin className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Add New Vessels Tab */}
        <TabsContent value="new-vessels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Vessel to {port.region} Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const vesselData = {
                  name: formData.get('name'),
                  imo: formData.get('imo'),
                  mmsi: formData.get('mmsi'),
                  vesselType: formData.get('vesselType'),
                  flag: formData.get('flag'),
                  cargoType: formData.get('cargoType'),
                  cargoCapacity: formData.get('cargoCapacity') ? parseInt(formData.get('cargoCapacity') as string) : null
                };
                addVesselMutation.mutate(vesselData);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Vessel Name</Label>
                    <Input id="name" name="name" placeholder="Enter vessel name" required />
                  </div>
                  <div>
                    <Label htmlFor="imo">IMO Number</Label>
                    <Input id="imo" name="imo" placeholder="1234567" required />
                  </div>
                  <div>
                    <Label htmlFor="mmsi">MMSI</Label>
                    <Input id="mmsi" name="mmsi" placeholder="123456789" required />
                  </div>
                  <div>
                    <Label htmlFor="vesselType">Vessel Type</Label>
                    <Select name="vesselType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vessel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Oil Tanker">Oil Tanker</SelectItem>
                        <SelectItem value="Container Ship">Container Ship</SelectItem>
                        <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem>
                        <SelectItem value="LNG Carrier">LNG Carrier</SelectItem>
                        <SelectItem value="Chemical Tanker">Chemical Tanker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="flag">Flag</Label>
                    <Input id="flag" name="flag" placeholder="Country flag" required />
                  </div>
                  <div>
                    <Label htmlFor="cargoType">Cargo Type</Label>
                    <Input id="cargoType" name="cargoType" placeholder="Crude Oil, Refined Products, etc." />
                  </div>
                  <div>
                    <Label htmlFor="cargoCapacity">Cargo Capacity (tons)</Label>
                    <Input id="cargoCapacity" name="cargoCapacity" type="number" placeholder="50000" />
                  </div>
                </div>
                <Button type="submit" disabled={addVesselMutation.isPending}>
                  {addVesselMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Adding Vessel...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vessel to Region
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}