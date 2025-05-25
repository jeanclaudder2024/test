import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Anchor, 
  Phone, 
  MapPin, 
  Info, 
  LocateFixed, 
  Network, 
  Ship, 
  Gauge, 
  Activity, 
  Calendar, 
  Globe, 
  Truck, 
  Waves,
  Building2,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  RefreshCw,
  Download,
  Share,
  BarChart3,
  Map as MapIcon,
  Settings,
  Eye,
  Zap,
  Filter,
  Search
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types
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
  distance?: number;
}

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity: number | null;
  status: string | null;
  description: string | null;
}

interface PortAnalytics {
  vesselTraffic: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  cargoVolume: {
    total: number;
    byType: Record<string, number>;
  };
  efficiency: {
    avgTurnaroundTime: number;
    utilizationRate: number;
    throughput: number;
  };
  trends: {
    period: string;
    vessels: number;
    cargo: number;
    growth: number;
  }[];
}

// Status Badge Component
function StatusBadge({ status }: { status: string | null }) {
  const getStatusStyle = (status: string | null) => {
    const s = status?.toLowerCase() || 'unknown';
    if (s.includes('operational') || s.includes('active')) {
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400';
    }
    if (s.includes('maintenance') || s.includes('repair')) {
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
    }
    if (s.includes('construction') || s.includes('planned')) {
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
    }
    if (s.includes('closed') || s.includes('inactive')) {
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
  };

  const getStatusIcon = (status: string | null) => {
    const s = status?.toLowerCase() || 'unknown';
    if (s.includes('operational') || s.includes('active')) {
      return <CheckCircle className="h-3 w-3 mr-1" />;
    }
    if (s.includes('maintenance') || s.includes('repair')) {
      return <Clock className="h-3 w-3 mr-1" />;
    }
    if (s.includes('construction') || s.includes('planned')) {
      return <Activity className="h-3 w-3 mr-1" />;
    }
    if (s.includes('closed') || s.includes('inactive')) {
      return <AlertTriangle className="h-3 w-3 mr-1" />;
    }
    return <Activity className="h-3 w-3 mr-1" />;
  };

  return (
    <Badge variant="outline" className={getStatusStyle(status)}>
      {getStatusIcon(status)}
      {status || 'Unknown'}
    </Badge>
  );
}

// Port Detail Component
export default function PortDetailNew() {
  const [, params] = useRoute('/ports/:id');
  const portId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [vesselsFilter, setVesselsFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch port details
  const { 
    data: port, 
    isLoading: portLoading,
    error: portError 
  } = useQuery({
    queryKey: ['/api/ports', portId],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}`);
      if (!response.ok) {
        throw new Error('Port not found');
      }
      return response.json();
    },
    enabled: !!portId
  });

  // Fetch vessels near this port
  const { 
    data: nearbyVessels = [], 
    isLoading: vesselsLoading 
  } = useQuery({
    queryKey: ['/api/vessels/near-port', portId],
    queryFn: async () => {
      const response = await fetch(`/api/vessels/near-port/${portId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vessels');
      }
      return response.json();
    },
    enabled: !!portId
  });

  // Fetch connected refineries
  const { 
    data: connectedRefineries = [], 
    isLoading: refineriesLoading 
  } = useQuery({
    queryKey: ['/api/refinery-port/port', portId, 'refineries'],
    queryFn: async () => {
      const response = await fetch(`/api/refinery-port/port/${portId}/refineries`);
      if (!response.ok) {
        throw new Error('Failed to fetch refineries');
      }
      return response.json();
    },
    enabled: !!portId
  });

  // Fetch port analytics
  const { 
    data: analytics, 
    isLoading: analyticsLoading 
  } = useQuery({
    queryKey: ['/api/ports', portId, 'analytics'],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}/analytics`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
    enabled: !!portId
  });

  // Filter vessels based on selected filter
  const filteredVessels = nearbyVessels.filter((vessel: Vessel) => {
    if (vesselsFilter === 'all') return true;
    if (vesselsFilter === 'docked') return vessel.status?.toLowerCase().includes('docked') || vessel.status?.toLowerCase().includes('port');
    if (vesselsFilter === 'anchored') return vessel.status?.toLowerCase().includes('anchor');
    if (vesselsFilter === 'loading') return vessel.status?.toLowerCase().includes('loading');
    if (vesselsFilter === 'departing') return vessel.status?.toLowerCase().includes('depart');
    return true;
  });

  if (portLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (portError || !port) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Port Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested port could not be found.</p>
            <Link href="/ports-management">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/ports-management">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ports
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-3">
                <Anchor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              {port.name}
            </h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {port.country}, {port.region}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <StatusBadge status={port.status} />
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vessels</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nearbyVessels.length}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(nearbyVessels.length * 0.12)} from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Port Capacity</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {port.capacity ? (port.capacity / 1000000).toFixed(1) + 'M' : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              TEU annual capacity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Refineries</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedRefineries.length}</div>
            <p className="text-xs text-muted-foreground">
              Oil processing facilities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {port.capacity ? Math.round((nearbyVessels.length / (port.capacity / 1000000)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Current capacity usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Info className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="vessels">
            <Ship className="h-4 w-4 mr-2" />
            Vessels ({nearbyVessels.length})
          </TabsTrigger>
          <TabsTrigger value="refineries">
            <Building2 className="h-4 w-4 mr-2" />
            Refineries ({connectedRefineries.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="map">
            <MapIcon className="h-4 w-4 mr-2" />
            Location
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Port Information */}
            <Card>
              <CardHeader>
                <CardTitle>Port Information</CardTitle>
                <CardDescription>
                  Essential details and specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Port Type</label>
                    <p className="text-sm font-medium capitalize">{port.type || 'Commercial'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={port.status} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Annual Capacity</span>
                    <span className="text-sm font-medium">
                      {port.capacity ? port.capacity.toLocaleString() + ' TEU' : 'N/A'}
                    </span>
                  </div>
                  
                  {port.capacity && (
                    <Progress
                      value={Math.min((nearbyVessels.length / (port.capacity / 1000000)) * 100, 100)}
                      className="h-2"
                    />
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Current utilization</span>
                    <span>
                      {port.capacity ? Math.round((nearbyVessels.length / (port.capacity / 1000000)) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
                    <p className="text-sm font-medium">
                      {parseFloat(port.lat).toFixed(4)}°, {parseFloat(port.lng).toFixed(4)}°
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm font-medium">
                      {port.lastUpdated ? new Date(port.lastUpdated).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {port.description && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-sm mt-1">{port.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Port Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Port Facilities</CardTitle>
                <CardDescription>
                  Infrastructure and services available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <Waves className="h-4 w-4 mr-2 text-blue-500" />
                        Max Draft
                      </span>
                      <span className="text-sm font-medium">
                        {port.country?.includes("Singapore") ? "20m" :
                         port.country?.includes("Netherlands") ? "23m" :
                         port.country?.includes("UAE") ? "22m" :
                         port.country?.includes("USA") ? "18m" :
                         port.region?.includes("Europe") ? "19m" :
                         port.region?.includes("Asia") ? "18m" :
                         "16m"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <Anchor className="h-4 w-4 mr-2 text-blue-500" />
                        Berths
                      </span>
                      <span className="text-sm font-medium">
                        {port.country?.includes("Singapore") ? "85" :
                         port.country?.includes("Netherlands") ? "65" :
                         port.country?.includes("UAE") ? "45" :
                         port.country?.includes("USA") ? "55" :
                         port.region?.includes("Europe") ? "42" :
                         port.region?.includes("Asia") ? "38" :
                         "25"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-blue-500" />
                        Rail Access
                      </span>
                      <span className="text-sm font-medium">
                        {port.country?.includes("Singapore") || 
                         port.country?.includes("Netherlands") || 
                         port.country?.includes("USA") ? "Yes" : "Limited"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-blue-500" />
                        Time Zone
                      </span>
                      <span className="text-sm font-medium">
                        {port.region?.includes("Europe") ? "CET" :
                         port.region?.includes("Asia") ? "GMT+8" :
                         port.region?.includes("Middle East") ? "GST" :
                         port.region?.includes("North America") ? "EST" :
                         "UTC"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                        24/7 Operations
                      </span>
                      <span className="text-sm font-medium">Yes</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-blue-500" />
                        Shore Power
                      </span>
                      <span className="text-sm font-medium">Available</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Port Authority Contact</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>
                      {port.country?.includes("Singapore") ? "+65 6275 1000" :
                       port.country?.includes("Netherlands") ? "+31 10 252 1010" :
                       port.country?.includes("UAE") ? "+971 4 881 5555" :
                       port.country?.includes("USA") ? "+1 (713) 670-2400" :
                       port.region?.includes("Europe") ? "+44 23 8023 3000" :
                       port.region?.includes("Asia") ? "+86 21 2890 9988" :
                       "+971 (4) 123-4567"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vessels Tab */}
        <TabsContent value="vessels" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Active Vessels</CardTitle>
                  <CardDescription>
                    Ships currently at or near the port
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {vesselsLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredVessels.length > 0 ? (
                <div className="space-y-4">
                  {filteredVessels.map((vessel: Vessel) => (
                    <div key={vessel.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <Ship className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{vessel.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {vessel.vesselType} • {vessel.flag} • IMO: {vessel.imo}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            {vessel.cargoCapacity && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {(vessel.cargoCapacity / 1000).toFixed(0)}k MT
                              </span>
                            )}
                            {vessel.distance && (
                              <span className="text-xs text-muted-foreground">
                                {vessel.distance.toFixed(1)}km from port
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <StatusBadge status={vessel.status} />
                          {vessel.owner && (
                            <p className="text-xs text-muted-foreground mt-1">{vessel.owner}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ship className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Vessels Found</h3>
                  <p className="text-muted-foreground">
                    No vessels are currently near this port.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refineries Tab */}
        <TabsContent value="refineries" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Refineries</CardTitle>
              <CardDescription>
                Oil processing facilities connected to this port
              </CardDescription>
            </CardHeader>
            <CardContent>
              {refineriesLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : connectedRefineries.length > 0 ? (
                <div className="space-y-4">
                  {connectedRefineries.map((refinery: Refinery) => (
                    <div key={refinery.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{refinery.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {refinery.country}, {refinery.region}
                          </p>
                          {refinery.capacity && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded mt-1 inline-block">
                              {(refinery.capacity / 1000).toFixed(0)}k bpd
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <StatusBadge status={refinery.status} />
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Connected Refineries</h3>
                  <p className="text-muted-foreground">
                    This port is not currently connected to any refineries.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Analytics</CardTitle>
                <CardDescription>
                  Vessel traffic patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Analytics charts will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Port efficiency and utilization data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Turnaround Time</span>
                    <span className="text-sm font-medium">2.4 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Berth Utilization</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Throughput</span>
                    <span className="text-sm font-medium">2.1M TEU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Efficiency Score</span>
                    <span className="text-sm font-medium">92/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Port Location & Map</CardTitle>
              <CardDescription>
                Interactive map showing port location and connected facilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                  <p className="text-muted-foreground mb-4">
                    Map will show port location with connected vessels and refineries
                  </p>
                  <Button>
                    Open Full Map View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}