import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Port, Vessel } from '@/types';
import { 
  ArrowLeft, 
  Anchor, 
  Ship, 
  MapPin, 
  Globe, 
  Building2, 
  CircleAlert,
  Calendar,
  BarChart4,
  Truck,
  Clock,
  PanelLeft,
  PanelRight,
  ExternalLink,
  RefreshCw,
  Signal,
  Loader2
} from 'lucide-react';

import PortMiniMap from '@/components/map/PortMiniMap';
import PortVesselsTable from '@/components/PortVesselsTable';
import VesselPortConnectionForm from '@/components/VesselPortConnectionForm';
import { usePortSpecificVessels } from '@/hooks/usePortSpecificVessels';

export default function PortDetail() {
  const [, params] = useRoute('/ports/:id');
  const portId = params?.id ? parseInt(params.id) : null;
  const [proximityRadius, setProximityRadius] = useState<number>(10);
  const [useWebSocketData, setUseWebSocketData] = useState<boolean>(true);
  
  // Fetch port details and nearby vessels from API (traditional REST approach)
  const { 
    data: portData, 
    isLoading: isLoadingApi, 
    isError,
    error
  } = useQuery({
    queryKey: ['/api/port-vessels', portId],
    queryFn: async () => {
      if (!portId) throw new Error('Port ID is required');
      
      const response = await fetch(`/api/port-vessels/${portId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching port: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!portId && !useWebSocketData
  });
  
  // Fetch real-time vessel proximity data using WebSockets
  const {
    connections: vesselConnections,
    vessels: nearbyVesselsRealtime,
    portInfo,
    isConnected: wsConnected,
    error: wsError,
    isLoading: isLoadingWs,
    lastUpdated,
    refreshData
  } = usePortSpecificVessels({
    portId: portId || 0,
    proximityRadius,
    autoConnect: useWebSocketData,
    pollingInterval: 10000
  });
  
  // Determine which data source to use
  const isLoading = useWebSocketData ? isLoadingWs : isLoadingApi;
  
  // Use appropriate data source based on user selection
  const port = useWebSocketData ? (portInfo || portData?.port) : portData?.port;
  
  // Format vessel data from both sources into a consistent format for display
  const nearbyVessels = useMemo(() => {
    if (useWebSocketData) {
      return nearbyVesselsRealtime.map(v => ({
        vessels: {
          id: v.id,
          name: v.name,
          vesselType: v.type,
          currentLat: v.coordinates?.lat,
          currentLng: v.coordinates?.lng,
          flag: ''
        },
        distance: v.distance
      }));
    } else {
      return portData?.vessels || [];
    }
  }, [useWebSocketData, nearbyVesselsRealtime, portData?.vessels]);
  
  // Show loading state if the port data is not available yet
  if (isLoadingApi && !port) {
    return (
      <div className="container mx-auto py-6">
        <Link href="/ports">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ports
          </Button>
        </Link>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Loading port data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show skeleton while loading
  if (isLoading && !port) {
    return <PortDetailSkeleton />;
  }
  
  // Sort vessels by distance for display
  const sortedVessels = useMemo(() => {
    return [...nearbyVessels].sort((a, b) => a.distance - b.distance);
  }, [nearbyVessels]);
  
  if ((isError || !port) && !useWebSocketData) {
    return (
      <div className="container mx-auto py-6">
        <Link href="/ports">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ports
          </Button>
        </Link>
        
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Port</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The port you're looking for could not be found or there was an error loading the data.</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <div className="mt-4">
              <Button 
                onClick={() => setUseWebSocketData(true)}
                variant="outline"
                size="sm"
              >
                Try using WebSocket data
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/ports">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Ports
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <Link href="/ports">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Ports
        </Button>
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
              !port ? 'bg-gray-100 text-gray-600' :
              port.type === 'oil' ? 'bg-amber-100 text-amber-600' : 
              port.type === 'container' ? 'bg-blue-100 text-blue-600' :
              port.type === 'bulk' ? 'bg-emerald-100 text-emerald-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Anchor className="h-6 w-6" />
            </div>
            {port?.name || 'Unknown Port'}
          </h1>
          <p className="text-muted-foreground">
            {port?.country || 'Unknown Country'}, {port?.region || 'Unknown Region'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={
            port?.status === 'active' ? 'default' : 
            port?.status === 'maintenance' ? 'outline' : 
            'outline'
          }>
            {port?.status || 'unknown'}
          </Badge>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View on MarineTraffic
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* First column - Port Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Anchor className="h-5 w-5 mr-2 text-primary" />
              Port Information
            </CardTitle>
            <CardDescription>
              Essential details and specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Port Type and Status Section */}
              <div className="rounded-lg border border-border bg-muted/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Port Type</h4>
                  <Badge className="capitalize">{port?.type || 'Commercial'}</Badge>
                </div>
                
                <Separator className="my-3" />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-primary" />
                      Capacity
                    </span>
                    <span className="font-medium">
                      {port?.capacity ? port.capacity.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      Last Updated
                    </span>
                    <span className="font-medium">
                      {port?.lastUpdated 
                        ? new Date(port.lastUpdated).toLocaleDateString() 
                        : 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center">
                      <Ship className="h-4 w-4 mr-2 text-primary" />
                      Nearby Vessels
                    </span>
                    <span className="font-medium">
                      {nearbyVessels.length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Location Information */}
              <div className="rounded-lg border border-border bg-muted/10 p-4">
                <h4 className="text-sm font-medium mb-3">Location</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                    <span>
                      {port?.lat && port?.lng 
                        ? `${typeof port.lat === 'number' 
                            ? port.lat.toFixed(4) 
                            : Number(port.lat).toFixed(4)}, ${typeof port.lng === 'number'
                            ? port.lng.toFixed(4)
                            : Number(port.lng).toFixed(4)}`
                        : 'Coordinates unavailable'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-primary/70" />
                    <span>
                      {port?.country || 'Unknown Country'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <PanelLeft className="h-4 w-4 mr-2 text-primary/70" />
                    <span>
                      {port?.region || 'Unknown Region'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Port Description */}
              {port?.description && (
                <div className="rounded-lg border border-border bg-muted/10 p-4">
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {port.description}
                  </p>
                </div>
              )}
              
              {/* Port Activity */}
              <div className="rounded-lg border border-border bg-muted/10 p-4">
                <h4 className="text-sm font-medium mb-3">Activity Status</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-3 w-3 rounded-full ${
                    port?.status === 'active' ? 'bg-green-500' : 
                    port?.status === 'maintenance' ? 'bg-amber-500' : 
                    'bg-red-500'
                  }`} />
                  <span className="text-sm capitalize">{port?.status || 'unknown'}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {port?.status === 'active' 
                    ? 'Port is fully operational and accepting vessels.' 
                    : port?.status === 'maintenance'
                    ? 'Port is undergoing scheduled maintenance with limited operations.'
                    : 'Port is currently not operational.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Vessels at Port Component */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Ship className="h-5 w-5 mr-2 text-primary" />
              Vessels at this Port
            </CardTitle>
            <CardDescription>
              Vessels currently at or near {port?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portId && (
              <div className="h-[400px] overflow-y-auto pr-2">
                <PortVesselsTable 
                  portId={portId} 
                  hideTitle={true} 
                  showFilters={false}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Connect Vessel Component */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Anchor className="h-5 w-5 mr-2 text-primary" />
              Connect Vessel
            </CardTitle>
            <CardDescription>
              Connect a vessel to {port?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portId && (
              <VesselPortConnectionForm 
                initialPortId={portId}
                hideTitle={true}
                onSuccess={(result) => {
                  // Force refresh of vessel data
                  if (port) {
                    refreshData();
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Second column - Map */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Port Location
            </CardTitle>
            <CardDescription>
              Map showing the port and nearby vessels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden border border-border mb-6">
              <PortMiniMap 
                port={port} 
                vessels={sortedVessels} 
                height="400px" 
                interactive={true}
              />
            </div>
            
            <div className="rounded-lg border border-border bg-muted/10 p-4">
              <div className="flex flex-col space-y-3 mb-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center">
                    <Ship className="h-4 w-4 mr-2 text-primary" />
                    Nearby Vessels ({sortedVessels.length})
                  </h4>
                  
                  <Badge variant={useWebSocketData ? "default" : "outline"} className="flex items-center gap-1">
                    {useWebSocketData ? (
                      <>
                        <Signal className="h-3 w-3" />
                        Real-time
                      </>
                    ) : (
                      <>Static</>
                    )}
                  </Badge>
                </div>
                
                {useWebSocketData && (
                  <div className="flex flex-col space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Proximity Radius</span>
                      <span className="text-xs font-medium">{proximityRadius} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[proximityRadius]}
                        min={1}
                        max={50}
                        step={1}
                        onValueChange={(values) => setProximityRadius(values[0])}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={refreshData}
                        disabled={isLoadingWs}
                      >
                        {isLoadingWs ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Data Source</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={useWebSocketData ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setUseWebSocketData(true)}
                    >
                      WebSocket
                    </Button>
                    <Button
                      variant={!useWebSocketData ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setUseWebSocketData(false)}
                    >
                      REST API
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                {sortedVessels.length > 0 ? (
                  sortedVessels.map(({ vessels: vessel, distance }) => (
                    <div 
                      key={vessel.id} 
                      className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/40 text-sm border border-border/40"
                    >
                      <div>
                        <div className="font-medium flex items-center">
                          <div 
                            className={`h-2 w-2 rounded-full mr-2 ${
                              distance < 5 ? 'bg-green-500' : 
                              distance < 10 ? 'bg-amber-500' : 
                              'bg-blue-500'
                            }`} 
                          />
                          {vessel.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 ml-4">
                          {vessel.vesselType || 'Unknown'} • {vessel.flag || 'Unknown Flag'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-sm">
                          {distance.toFixed(1)} km
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {vessel.status || 'Unknown Status'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Ship className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No vessels currently near this port</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Port Statistics */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <BarChart4 className="h-5 w-5 mr-2 text-primary" />
              Port Statistics
            </CardTitle>
            <CardDescription>
              Current operational metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border bg-muted/10">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <Ship className="h-4 w-4 mr-2 text-primary" />
                    Vessel Traffic
                  </h3>
                  <span className="text-sm font-medium">{nearbyVessels.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {nearbyVessels.length === 0 
                    ? 'No vessels currently in port' 
                    : `${nearbyVessels.length} vessels within 20km radius`}
                </p>
                <div className="mt-3 text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Oil Tankers</span>
                    <span>{nearbyVessels.filter((v: any) => v.vessels.vesselType?.toLowerCase().includes('oil')).length}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Cargo Ships</span>
                    <span>{nearbyVessels.filter((v: any) => v.vessels.vesselType?.toLowerCase().includes('cargo')).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Vessels</span>
                    <span>{nearbyVessels.length - 
                      nearbyVessels.filter((v: any) => 
                        v.vessels.vesselType?.toLowerCase().includes('oil') || 
                        v.vessels.vesselType?.toLowerCase().includes('cargo')
                      ).length}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-border bg-muted/10">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-primary" />
                    Cargo Volume
                  </h3>
                  <span className="text-sm font-medium">
                    {port?.capacity ? (port.capacity / 1000).toFixed(0) + ' k' : 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {port && port.type === 'oil' 
                    ? 'Daily throughput capacity in barrels' 
                    : 'TEU handling capacity'}
                </p>
                {port && port.type === 'oil' && port.capacity && (
                  <div className="mt-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span>Crude Oil</span>
                      <span>{Math.round(port.capacity * 0.6 / 1000)}k bpd</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Refined Products</span>
                      <span>{Math.round(port.capacity * 0.4 / 1000)}k bpd</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 rounded-lg border border-border bg-muted/10">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Port Activity
                  </h3>
                  <Badge variant={
                    port?.status === 'active' ? 'default' : 
                    port?.status === 'maintenance' ? 'outline' : 
                    'outline'
                  }>
                    {port?.status || 'unknown'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {port?.status === 'active' 
                    ? 'The port is fully operational' 
                    : port?.status === 'maintenance'
                    ? 'Limited operations during maintenance'
                    : 'Port is currently closed'}
                </p>
                {port?.status === 'active' && (
                  <div className="mt-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span>Berth Occupancy</span>
                      <span>{Math.min(nearbyVessels.length * 15, 100)}%</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Average Waiting Time</span>
                      <span>
                        {nearbyVessels.length > 5 
                          ? '24-48 hrs' 
                          : nearbyVessels.length > 3 
                          ? '12-24 hrs' 
                          : '<12 hrs'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PortDetailSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-4">
        <div className="h-9 w-24 bg-muted rounded-md" />
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="h-8 w-64 bg-muted rounded-md mb-2" />
          <div className="h-4 w-40 bg-muted rounded-md" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-6 w-24 bg-muted rounded-md" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-96 bg-muted rounded-md" />
        <div className="h-96 bg-muted rounded-md md:col-span-2" />
        <div className="h-64 bg-muted rounded-md md:col-span-3" />
      </div>
    </div>
  );
}