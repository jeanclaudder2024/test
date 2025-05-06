import { useState, useCallback, useMemo } from 'react';
import { usePortVesselProximity, type PortVesselConnection } from '@/hooks/usePortVesselProximity';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MapPin, Ship, Anchor, RefreshCw, LocateFixed, Waves, Map } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import MapComponent from '@/components/PortVesselProximityMap.tsx';

export default function PortVesselProximityPage() {
  const [proximityRadius, setProximityRadius] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>('map');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  
  // Use our custom hook to get real-time vessel-port proximity data
  const {
    connections,
    vessels,
    isConnected,
    error,
    isLoading,
    lastUpdated,
    refreshData,
  } = usePortVesselProximity({
    proximityRadius,
    autoConnect: true,
    pollingInterval: autoRefresh ? 10000 : 0
  });
  
  // Handler for changing the proximity radius
  const handleRadiusChange = useCallback((value: number[]) => {
    setProximityRadius(value[0]);
  }, []);
  
  // Format the last updated time
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return 'Never';
    
    return lastUpdated.toLocaleTimeString();
  }, [lastUpdated]);
  
  // Group connections by port
  const connectionsByPort = useMemo(() => {
    const grouped: Record<number, PortVesselConnection[]> = {};
    
    connections.forEach(connection => {
      if (!grouped[connection.portId]) {
        grouped[connection.portId] = [];
      }
      
      grouped[connection.portId].push(connection);
    });
    
    return grouped;
  }, [connections]);
  
  // Get unique ports
  const uniquePorts = useMemo(() => {
    const portIds = new Set<number>();
    const ports: { id: number; name: string; type: string; vesselCount: number }[] = [];
    
    connections.forEach(connection => {
      if (!portIds.has(connection.portId)) {
        portIds.add(connection.portId);
        ports.push({
          id: connection.portId,
          name: connection.portName,
          type: connection.portType,
          vesselCount: 0
        });
      }
    });
    
    // Count vessels per port
    ports.forEach(port => {
      port.vesselCount = connectionsByPort[port.id]?.length || 0;
    });
    
    // Sort by vessel count (highest first)
    return ports.sort((a, b) => b.vesselCount - a.vesselCount);
  }, [connections, connectionsByPort]);
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vessel-Port Proximity</h1>
            <p className="text-muted-foreground">
              Real-time tracking of vessels near ports (within {proximityRadius}km)
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh">Auto-refresh</Label>
            </div>
            
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left sidebar with stats */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Connection Summary
                <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-500" : ""}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {error ? (
                  <span className="text-destructive">{error}</span>
                ) : (
                  <>Last updated: {formattedLastUpdated}</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="text-sm font-medium">Proximity Radius</div>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[proximityRadius]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={handleRadiusChange}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{proximityRadius} km</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-md p-3">
                  <div className="text-sm font-medium mb-1">Vessels</div>
                  <div className="text-2xl font-bold flex items-center">
                    <Ship className="h-5 w-5 mr-2 text-primary" />
                    {vessels.length}
                  </div>
                </div>
                <div className="bg-secondary rounded-md p-3">
                  <div className="text-sm font-medium mb-1">Connections</div>
                  <div className="text-2xl font-bold flex items-center">
                    <LocateFixed className="h-5 w-5 mr-2 text-primary" />
                    {connections.length}
                  </div>
                </div>
                <div className="bg-secondary rounded-md p-3">
                  <div className="text-sm font-medium mb-1">Active Ports</div>
                  <div className="text-2xl font-bold flex items-center">
                    <Anchor className="h-5 w-5 mr-2 text-primary" />
                    {uniquePorts.length}
                  </div>
                </div>
                <div className="bg-secondary rounded-md p-3">
                  <div className="text-sm font-medium mb-1">Avg. Distance</div>
                  <div className="text-2xl font-bold flex items-center">
                    <Waves className="h-5 w-5 mr-2 text-primary" />
                    {connections.length > 0
                      ? (
                          connections.reduce((sum, c) => sum + c.distance, 0) /
                          connections.length
                        ).toFixed(1)
                      : "-"}
                    <span className="text-sm ml-1">km</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Active Ports ({uniquePorts.length})</h3>
                <div className="max-h-60 overflow-y-auto pr-2">
                  {uniquePorts.length > 0 ? (
                    uniquePorts.map((port) => (
                      <div
                        key={port.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm font-medium">{port.name}</span>
                        </div>
                        <Badge variant="secondary">
                          {port.vesselCount} vessel{port.vesselCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground py-2">
                      No vessels within {proximityRadius}km of any ports
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Main content area */}
          <div className="md:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Vessel List
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    <div className="h-[600px] w-full">
                      <MapComponent
                        connections={connections}
                        proximityRadius={proximityRadius}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="py-2 px-4 text-xs text-muted-foreground">
                    Showing {connections.length} connections between vessels and ports within {proximityRadius}km radius
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="list" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Vessels Near Ports</CardTitle>
                    <CardDescription>
                      All vessels within {proximityRadius}km of a port
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : connections.length > 0 ? (
                      <div className="space-y-4">
                        {uniquePorts.map((port) => (
                          <div key={port.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Anchor className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">{port.name}</h3>
                              <Badge variant="outline">{port.type}</Badge>
                              <Badge>{port.vesselCount} vessels</Badge>
                            </div>
                            
                            <div className="rounded-md border">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-muted/50">
                                    <th className="text-left p-2 text-sm">Vessel</th>
                                    <th className="text-left p-2 text-sm">Type</th>
                                    <th className="text-left p-2 text-sm">Distance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {connectionsByPort[port.id]?.map((connection) => (
                                    <tr
                                      key={connection.vesselId}
                                      className="border-t border-border hover:bg-muted/50"
                                    >
                                      <td className="p-2 text-sm">{connection.vesselName}</td>
                                      <td className="p-2 text-sm">{connection.vesselType}</td>
                                      <td className="p-2 text-sm">
                                        {connection.distance.toFixed(1)} km
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No vessels found near ports within {proximityRadius}km.
                        <br />
                        Try increasing the proximity radius or refresh the data.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}