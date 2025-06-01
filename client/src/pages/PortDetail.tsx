import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { ArrowLeft, Anchor, Phone, MapPin, Info, LocateFixed, Network, Ship, Gauge, Activity, Calendar, Globe, Truck, Waves, Edit3, Settings, FileText, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useDataStream } from '@/hooks/useDataStream';
import { PortDetailForm } from '@/components/ports/PortDetailForm';
import PortMap from '@/components/map/PortMap';

// Types
interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string | number;
  lng: string | number;
  type: string | null;
  status: string | null;
  capacity: number | null;
  description: string | null;
  lastUpdated: Date | null;
}

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
  status: string | null;
  cargoCapacity: number | null;
  cargoType: string | null;
  owner: string | null;
  connectionType?: string;
  cargoVolume?: string;
  connectionStartDate?: string;
  connectionEndDate?: string;
  connectionStatus?: string;
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('operational')) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
    if (s.includes('maintenance') || s.includes('repair')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400';
    if (s.includes('construction') || s.includes('planned')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
    if (s.includes('closed') || s.includes('shutdown')) return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <Badge variant="secondary" className={getStatusColor(status)}>
      {status}
    </Badge>
  );
}

// Port Detail Component
function PortDetail() {
  const [, params] = useRoute('/ports/:id');
  const portId = params?.id ? parseInt(params.id) : null;
  const { ports, vessels, loading } = useDataStream();
  const { toast } = useToast();
  const [associatedVessels, setAssociatedVessels] = useState<Vessel[]>([]);
  const [connectedRefineries, setConnectedRefineries] = useState<any[]>([]);
  const [loadingRefineries, setLoadingRefineries] = useState(false);
  const [showFullVesselList, setShowFullVesselList] = useState(false);
  const [showFullRefineryList, setShowFullRefineryList] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Find the port from our stream data
  const port = ports.find(p => p.id === portId);
  
  // Fetch vessels associated with this port
  useEffect(() => {
    if (portId) {
      const fetchAssociatedVessels = async () => {
        try {
          // Fetch vessels that are currently at this port or have this port as destination
          const vesselsResponse = await fetch(`/api/vessels/near-port/${portId}`);
          
          if (vesselsResponse.ok) {
            const vesselsData = await vesselsResponse.json();
            setAssociatedVessels(vesselsData);
          } else {
            console.error('Failed to fetch associated vessels:', await vesselsResponse.text());
            setAssociatedVessels([]);
          }
        } catch (error) {
          console.error('Error fetching associated vessels:', error);
          setAssociatedVessels([]);
        }
      };
      
      fetchAssociatedVessels();
    } else {
      setAssociatedVessels([]);
    }
  }, [portId]);
  
  // Fetch connected refineries
  useEffect(() => {
    if (portId) {
      const fetchConnectedRefineries = async () => {
        setLoadingRefineries(true);
        try {
          const response = await fetch(`/api/refinery-port/port/${portId}/refineries`);
          if (response.ok) {
            const data = await response.json();
            setConnectedRefineries(data);
          } else {
            console.error('Failed to fetch connected refineries:', await response.text());
          }
        } catch (error) {
          console.error('Error fetching connected refineries:', error);
        } finally {
          setLoadingRefineries(false);
        }
      };
      
      fetchConnectedRefineries();
    } else {
      setConnectedRefineries([]);
    }
  }, [portId]);
  
  // Redirect to ports page if port not found and not loading
  if (!loading && !port) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="py-12">
          <Anchor className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Port not found</h3>
          <p className="text-muted-foreground mb-8">
            The port with ID {portId} does not exist or was deleted.
          </p>
          <Link href="/ports">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ports
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter vessels and refineries to display
  const displayVessels = showFullVesselList ? associatedVessels : associatedVessels.slice(0, 3);
  const displayRefineries = showFullRefineryList ? connectedRefineries : connectedRefineries.slice(0, 3);

  // Show edit form if in editing mode
  if (isEditing && port) {
    return (
      <div className="container mx-auto p-4 pb-16">
        <Link href="/ports">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ports
          </Button>
        </Link>
        
        <PortDetailForm 
          port={port} 
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-16">
      <Link href="/ports">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Ports
        </Button>
      </Link>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : port ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                  port.status?.toLowerCase().includes('operational') || port.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
                  port.status?.toLowerCase().includes('maintenance') || port.status?.toLowerCase().includes('repair') ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' :
                  port.status?.toLowerCase().includes('construction') || port.status?.toLowerCase().includes('planned') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                  port.status?.toLowerCase().includes('closed') || port.status?.toLowerCase().includes('shutdown') ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <Anchor className="h-6 w-6" />
                </div>
                {port.name}
              </h1>
              <p className="text-muted-foreground">
                {port.country}, {port.region}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <StatusBadge status={port.status || 'Unknown'} />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Port'}
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="overview">
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="location">
                <LocateFixed className="h-4 w-4 mr-2" />
                Location
              </TabsTrigger>
              <TabsTrigger value="connections">
                <Network className="h-4 w-4 mr-2" />
                Connections
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First column - Port Info Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Anchor className="h-5 w-5 mr-2 text-primary" />
                      Port Overview
                    </CardTitle>
                    <CardDescription>
                      Essential details and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status and capacity section */}
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium">Status</h4>
                          <StatusBadge status={port.status || 'Unknown'} />
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center">
                              <Gauge className="h-4 w-4 mr-2 text-primary" />
                              Capacity
                            </span>
                            <span className="font-medium">
                              {port.capacity ? (port.capacity / 1000000).toFixed(1) + 'M TEU' : 'N/A'}
                            </span>
                          </div>
                          
                          {port.capacity && (
                            <Progress
                              value={(port.capacity / 50000000) * 100}
                              className="h-1.5"
                            />
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            {port.capacity 
                              ? `${port.capacity.toLocaleString()} TEU annual capacity` 
                              : 'Capacity information not available'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Quick stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-muted/10 border border-border p-3 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Port Type</div>
                          <div className="font-medium text-sm">
                            {port.type || 'Commercial'}
                          </div>
                        </div>
                        
                        <div className="rounded-lg bg-muted/10 border border-border p-3 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Max Draft</div>
                          <div className="font-medium text-sm">
                            {port?.country?.includes("Singapore") ? "20m" :
                             port?.country?.includes("Netherlands") ? "23m" :
                             port?.country?.includes("UAE") ? "22m" :
                             port?.country?.includes("USA") ? "18m" :
                             port?.region?.includes("Europe") ? "19m" :
                             port?.region?.includes("Asia") ? "18m" :
                             "16m"}
                          </div>
                        </div>
                        
                        <div className="rounded-lg bg-muted/10 border border-border p-3 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Berths</div>
                          <div className="font-medium text-sm">
                            {port?.country?.includes("Singapore") ? "85" :
                             port?.country?.includes("Netherlands") ? "65" :
                             port?.country?.includes("UAE") ? "45" :
                             port?.country?.includes("USA") ? "55" :
                             port?.region?.includes("Europe") ? "42" :
                             port?.region?.includes("Asia") ? "38" :
                             "25"}
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact info */}
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium mb-3">Port Authority</h4>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-primary/70" />
                            <span>
                              {port?.country?.includes("Singapore") ? "+65 6275 1000" :
                               port?.country?.includes("Netherlands") ? "+31 10 252 1010" :
                               port?.country?.includes("UAE") ? "+971 4 881 5555" :
                               port?.country?.includes("USA") ? "+1 (713) 670-2400" :
                               port?.region?.includes("Europe") ? "+44 23 8023 3000" :
                               port?.region?.includes("Asia") ? "+86 21 2890 9988" :
                               "+971 (4) 123-4567"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                            <span>
                              {port.lat && port.lng 
                                ? `${typeof port.lat === 'number' 
                                    ? port.lat.toFixed(4) 
                                    : parseFloat(port.lat).toFixed(4)}°, ${typeof port.lng === 'number'
                                    ? port.lng.toFixed(4)
                                    : parseFloat(port.lng).toFixed(4)}°`
                                : 'Coordinates not available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Second column - Vessels Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Ship className="h-5 w-5 mr-2 text-primary" />
                        Vessels at Port
                      </div>
                      <Badge variant="outline">
                        {associatedVessels.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Ships currently docked or approaching
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {associatedVessels.length === 0 ? (
                      <div className="text-center py-8">
                        <Ship className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No vessels currently at port</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {displayVessels.map((vessel) => (
                          <div key={vessel.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                vessel.status?.toLowerCase().includes('loading') || vessel.status?.toLowerCase().includes('discharging') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                                vessel.status?.toLowerCase().includes('at_port') || vessel.status?.toLowerCase().includes('docked') ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
                                vessel.status?.toLowerCase().includes('anchored') ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                <Ship className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{vessel.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {vessel.vesselType} • {vessel.flag}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <StatusBadge status={vessel.status || 'Unknown'} />
                              {vessel.cargoCapacity && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {(vessel.cargoCapacity / 1000).toFixed(0)}k MT
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {associatedVessels.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFullVesselList(!showFullVesselList)}
                            className="w-full"
                          >
                            {showFullVesselList ? 'Show Less' : `Show ${associatedVessels.length - 3} More`}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Third column - Connected Refineries Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-primary" />
                        Connected Refineries
                      </div>
                      <Badge variant="outline">
                        {connectedRefineries.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Oil refineries connected to this port
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingRefineries ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : connectedRefineries.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No connected refineries</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {displayRefineries.map((refinery) => (
                          <div key={refinery.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                refinery.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
                                refinery.status?.toLowerCase().includes('maintenance') ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                <Activity className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{refinery.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {refinery.country} • {refinery.region}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <StatusBadge status={refinery.status || 'Unknown'} />
                              {refinery.capacity && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {(refinery.capacity / 1000).toFixed(0)}k bpd
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {connectedRefineries.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFullRefineryList(!showFullRefineryList)}
                            className="w-full"
                          >
                            {showFullRefineryList ? 'Show Less' : `Show ${connectedRefineries.length - 3} More`}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="location" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LocateFixed className="h-5 w-5 mr-2 text-primary" />
                    Port Location & Map
                  </CardTitle>
                  <CardDescription>
                    Interactive map showing {port.name} and connected facilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px] rounded-lg overflow-hidden border border-border">
                    <PortMap 
                      port={port} 
                      height="500px"
                      showControls={true}
                      showConnections={true}
                    />
                  </div>
                  
                  {/* Location details */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-muted/10 border border-border p-4 text-center">
                      <MapPin className="h-5 w-5 mx-auto text-primary mb-2" />
                      <div className="text-xs text-muted-foreground mb-1">Coordinates</div>
                      <div className="font-medium text-sm">
                        {port.lat && port.lng 
                          ? `${typeof port.lat === 'number' 
                              ? port.lat.toFixed(4) 
                              : parseFloat(port.lat).toFixed(4)}°, ${typeof port.lng === 'number'
                              ? port.lng.toFixed(4)
                              : parseFloat(port.lng).toFixed(4)}°`
                          : 'N/A'}
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-muted/10 border border-border p-4 text-center">
                      <Globe className="h-5 w-5 mx-auto text-primary mb-2" />
                      <div className="text-xs text-muted-foreground mb-1">Time Zone</div>
                      <div className="font-medium text-sm">
                        {port?.region?.includes("Europe") ? "CET" :
                         port?.region?.includes("Asia") ? "GMT+8" :
                         port?.region?.includes("Middle East") ? "GST" :
                         port?.region?.includes("North America") ? "EST" :
                         "UTC"}
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-muted/10 border border-border p-4 text-center">
                      <Waves className="h-5 w-5 mx-auto text-primary mb-2" />
                      <div className="text-xs text-muted-foreground mb-1">Water Depth</div>
                      <div className="font-medium text-sm">
                        {port?.country?.includes("Singapore") ? "20m" :
                         port?.country?.includes("Netherlands") ? "23m" :
                         port?.country?.includes("UAE") ? "22m" :
                         port?.country?.includes("USA") ? "18m" :
                         "16m"}
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-muted/10 border border-border p-4 text-center">
                      <Truck className="h-5 w-5 mx-auto text-primary mb-2" />
                      <div className="text-xs text-muted-foreground mb-1">Rail Access</div>
                      <div className="font-medium text-sm">
                        {port?.country?.includes("Singapore") || 
                         port?.country?.includes("Netherlands") || 
                         port?.country?.includes("USA") ? "Yes" : "Limited"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="connections" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vessel Connections */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Ship className="h-5 w-5 mr-2 text-primary" />
                      Vessel Traffic
                    </CardTitle>
                    <CardDescription>
                      Ships currently at port or en route
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {associatedVessels.length === 0 ? (
                      <div className="text-center py-8">
                        <Ship className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No vessels currently tracked</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {associatedVessels.map((vessel) => (
                          <div key={vessel.id} className="p-4 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{vessel.name}</h4>
                              <StatusBadge status={vessel.status || 'Unknown'} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <span className="ml-2 font-medium">{vessel.vesselType}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Flag:</span>
                                <span className="ml-2 font-medium">{vessel.flag}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">IMO:</span>
                                <span className="ml-2 font-medium">{vessel.imo}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Capacity:</span>
                                <span className="ml-2 font-medium">
                                  {vessel.cargoCapacity ? `${(vessel.cargoCapacity / 1000).toFixed(0)}k MT` : 'N/A'}
                                </span>
                              </div>
                            </div>
                            
                            {vessel.owner && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <span className="text-muted-foreground text-sm">Owner:</span>
                                <span className="ml-2 text-sm font-medium">{vessel.owner}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Refinery Connections */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-primary" />
                      Refinery Network
                    </CardTitle>
                    <CardDescription>
                      Connected oil processing facilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingRefineries ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : connectedRefineries.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No connected refineries</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {connectedRefineries.map((refinery) => (
                          <div key={refinery.id} className="p-4 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{refinery.name}</h4>
                              <StatusBadge status={refinery.status || 'Unknown'} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Country:</span>
                                <span className="ml-2 font-medium">{refinery.country}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Region:</span>
                                <span className="ml-2 font-medium">{refinery.region}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Capacity:</span>
                                <span className="ml-2 font-medium">
                                  {refinery.capacity ? `${(refinery.capacity / 1000).toFixed(0)}k bpd` : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <span className="ml-2 font-medium">{refinery.type || 'Refinery'}</span>
                              </div>
                            </div>
                            
                            {refinery.description && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-sm text-muted-foreground">{refinery.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}

export default PortDetail;