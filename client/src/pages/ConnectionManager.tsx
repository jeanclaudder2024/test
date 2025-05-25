import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Ship, 
  Building2, 
  Anchor, 
  Search, 
  Filter, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Link, 
  ArrowLeft,
  Save,
  RefreshCw,
  MapPin,
  Calendar,
  Gauge,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Vessel {
  id: number;
  name: string;
  imo: string;
  vesselType: string;
  flag: string;
  cargoCapacity: number | null;
  cargoType: string | null;
  currentLat: string | null;
  currentLng: string | null;
  status: string | null;
}

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  capacity: number | null;
  type: string | null;
  status: string | null;
  lat: string;
  lng: string;
}

interface Connection {
  id?: number;
  vesselId?: number;
  refineryId?: number;
  portId: number;
  connectionType: string;
  status: string;
  startDate?: string;
  endDate?: string;
  cargoVolume?: string;
}

export default function ConnectionManager() {
  const [selectedVessels, setSelectedVessels] = useState<number[]>([]);
  const [selectedRefineries, setSelectedRefineries] = useState<number[]>([]);
  const [vesselSearch, setVesselSearch] = useState('');
  const [refinerySearch, setRefinerySearch] = useState('');
  const [connectionType, setConnectionType] = useState('cargo_transfer');
  const [connectionStatus, setConnectionStatus] = useState('active');
  const [activeTab, setActiveTab] = useState('vessels');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const portId = parseInt(urlParams.get('portId') || '0');
  const portName = urlParams.get('portName') || 'Unknown Port';
  const initialType = urlParams.get('type') || 'both';

  useEffect(() => {
    if (initialType === 'vessels') setActiveTab('vessels');
    else if (initialType === 'refineries') setActiveTab('refineries');
    else setActiveTab('vessels');
  }, [initialType]);

  // Fetch vessels
  const { data: vessels = [], isLoading: vesselsLoading } = useQuery({
    queryKey: ['/api/vessels'],
    enabled: true
  });

  // Fetch refineries
  const { data: refineries = [], isLoading: refineriesLoading } = useQuery({
    queryKey: ['/api/refineries'],
    enabled: true
  });

  // Fetch existing connections
  const { data: existingConnections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: [`/api/ports/${portId}/connections`],
    enabled: portId > 0
  });

  // Create vessel connections mutation
  const vesselConnectionMutation = useMutation({
    mutationFn: async (connections: Connection[]) => {
      const promises = connections.map(connection =>
        apiRequest('/api/vessel-port-connections', {
          method: 'POST',
          body: JSON.stringify(connection)
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ports/${portId}/connections`] });
      toast({
        title: "Vessel Connections Created",
        description: `Successfully connected ${selectedVessels.length} vessels to ${portName}`,
      });
      setSelectedVessels([]);
    },
    onError: (error: any) => {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to create vessel connections",
        variant: "destructive",
      });
    }
  });

  // Create refinery connections mutation
  const refineryConnectionMutation = useMutation({
    mutationFn: async (connections: Connection[]) => {
      const promises = connections.map(connection =>
        apiRequest('/api/refinery-connections', {
          method: 'POST',
          body: JSON.stringify(connection)
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ports/${portId}/connections`] });
      toast({
        title: "Refinery Connections Created",
        description: `Successfully connected ${selectedRefineries.length} refineries to ${portName}`,
      });
      setSelectedRefineries([]);
    },
    onError: (error: any) => {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to create refinery connections",
        variant: "destructive",
      });
    }
  });

  // Filter vessels
  const filteredVessels = vessels.filter((vessel: Vessel) =>
    vessel.name.toLowerCase().includes(vesselSearch.toLowerCase()) ||
    vessel.imo.toLowerCase().includes(vesselSearch.toLowerCase()) ||
    vessel.vesselType.toLowerCase().includes(vesselSearch.toLowerCase())
  );

  // Filter refineries
  const filteredRefineries = refineries.filter((refinery: Refinery) =>
    refinery.name.toLowerCase().includes(refinerySearch.toLowerCase()) ||
    refinery.country.toLowerCase().includes(refinerySearch.toLowerCase()) ||
    refinery.region.toLowerCase().includes(refinerySearch.toLowerCase())
  );

  // Handle vessel selection
  const handleVesselToggle = (vesselId: number) => {
    setSelectedVessels(prev =>
      prev.includes(vesselId)
        ? prev.filter(id => id !== vesselId)
        : [...prev, vesselId]
    );
  };

  // Handle refinery selection
  const handleRefineryToggle = (refineryId: number) => {
    setSelectedRefineries(prev =>
      prev.includes(refineryId)
        ? prev.filter(id => id !== refineryId)
        : [...prev, refineryId]
    );
  };

  // Save vessel connections
  const handleSaveVesselConnections = () => {
    if (selectedVessels.length === 0) {
      toast({
        title: "No Vessels Selected",
        description: "Please select at least one vessel to connect",
        variant: "destructive",
      });
      return;
    }

    const connections: Connection[] = selectedVessels.map(vesselId => ({
      vesselId,
      portId,
      connectionType,
      status: connectionStatus,
      startDate: new Date().toISOString().split('T')[0],
    }));

    vesselConnectionMutation.mutate(connections);
  };

  // Save refinery connections
  const handleSaveRefineryConnections = () => {
    if (selectedRefineries.length === 0) {
      toast({
        title: "No Refineries Selected",
        description: "Please select at least one refinery to connect",
        variant: "destructive",
      });
      return;
    }

    const connections: Connection[] = selectedRefineries.map(refineryId => ({
      refineryId,
      portId,
      connectionType,
      status: connectionStatus,
      startDate: new Date().toISOString().split('T')[0],
    }));

    refineryConnectionMutation.mutate(connections);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (portId === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Invalid Port ID</h3>
              <p className="text-muted-foreground">
                No valid port ID provided for connection management.
              </p>
              <Button onClick={handleGoBack} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Connection Manager</h1>
            <p className="text-muted-foreground">
              Connect vessels and refineries to <span className="font-semibold">{portName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Anchor className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Connection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Connection Settings</span>
          </CardTitle>
          <CardDescription>
            Configure the type and status for all new connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="connectionType">Connection Type</Label>
              <Select value={connectionType} onValueChange={setConnectionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cargo_transfer">Cargo Transfer</SelectItem>
                  <SelectItem value="fuel_supply">Fuel Supply</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="connectionStatus">Status</Label>
              <Select value={connectionStatus} onValueChange={setConnectionStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vessels" className="flex items-center space-x-2">
            <Ship className="h-4 w-4" />
            <span>Vessels ({selectedVessels.length} selected)</span>
          </TabsTrigger>
          <TabsTrigger value="refineries" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Refineries ({selectedRefineries.length} selected)</span>
          </TabsTrigger>
        </TabsList>

        {/* Vessels Tab */}
        <TabsContent value="vessels" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search vessels..."
                  value={vesselSearch}
                  onChange={(e) => setVesselSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Badge variant="secondary">
                {filteredVessels.length} vessels available
              </Badge>
            </div>
            <Button 
              onClick={handleSaveVesselConnections}
              disabled={selectedVessels.length === 0 || vesselConnectionMutation.isPending}
            >
              {vesselConnectionMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Connect {selectedVessels.length} Vessels
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vesselsLoading ? (
              <div className="col-span-full text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading vessels...</p>
              </div>
            ) : (
              filteredVessels.map((vessel: Vessel) => (
                <Card 
                  key={vessel.id} 
                  className={`cursor-pointer transition-all ${
                    selectedVessels.includes(vessel.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleVesselToggle(vessel.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Ship className="h-4 w-4 text-blue-600" />
                          <h3 className="font-semibold truncate">{vessel.name}</h3>
                          <Checkbox 
                            checked={selectedVessels.includes(vessel.id)}
                            onChange={() => handleVesselToggle(vessel.id)}
                          />
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><span className="font-medium">IMO:</span> {vessel.imo}</p>
                          <p><span className="font-medium">Type:</span> {vessel.vesselType}</p>
                          <p><span className="font-medium">Flag:</span> {vessel.flag}</p>
                          {vessel.cargoCapacity && (
                            <p><span className="font-medium">Capacity:</span> {vessel.cargoCapacity.toLocaleString()} MT</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={vessel.status === 'at_port' ? 'default' : 'secondary'}>
                            {vessel.status || 'Unknown'}
                          </Badge>
                          {vessel.cargoType && (
                            <Badge variant="outline">{vessel.cargoType}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Refineries Tab */}
        <TabsContent value="refineries" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search refineries..."
                  value={refinerySearch}
                  onChange={(e) => setRefinerySearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Badge variant="secondary">
                {filteredRefineries.length} refineries available
              </Badge>
            </div>
            <Button 
              onClick={handleSaveRefineryConnections}
              disabled={selectedRefineries.length === 0 || refineryConnectionMutation.isPending}
            >
              {refineryConnectionMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Connect {selectedRefineries.length} Refineries
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {refineriesLoading ? (
              <div className="col-span-full text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading refineries...</p>
              </div>
            ) : (
              filteredRefineries.map((refinery: Refinery) => (
                <Card 
                  key={refinery.id} 
                  className={`cursor-pointer transition-all ${
                    selectedRefineries.includes(refinery.id) 
                      ? 'ring-2 ring-orange-500 bg-orange-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleRefineryToggle(refinery.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building2 className="h-4 w-4 text-orange-600" />
                          <h3 className="font-semibold truncate">{refinery.name}</h3>
                          <Checkbox 
                            checked={selectedRefineries.includes(refinery.id)}
                            onChange={() => handleRefineryToggle(refinery.id)}
                          />
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><span className="font-medium">Country:</span> {refinery.country}</p>
                          <p><span className="font-medium">Region:</span> {refinery.region}</p>
                          {refinery.capacity && (
                            <p><span className="font-medium">Capacity:</span> {(refinery.capacity / 1000000).toFixed(1)}M bbl/day</p>
                          )}
                          <p><span className="font-medium">Location:</span> {parseFloat(refinery.lat).toFixed(3)}, {parseFloat(refinery.lng).toFixed(3)}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={refinery.status === 'operational' ? 'default' : 'secondary'}>
                            {refinery.status || 'Unknown'}
                          </Badge>
                          {refinery.type && (
                            <Badge variant="outline">{refinery.type}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}