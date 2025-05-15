import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProfessionalMaritimeMap from '@/components/map/ProfessionalMaritimeMap';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { 
  Sheet, 
  SheetClose, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Ship, 
  Factory, 
  Anchor, 
  Info, 
  Settings, 
  RefreshCw,
  Maximize2,
  Globe,
  HelpCircle,
  FileText,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Vessel, Port, Refinery } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

// Custom hook for maritime WebSocket connection
function useMaritimeWebSocket(selectedRegion = 'global') {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [portConnections, setPortConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Fetch vessels fallback via REST API
  const fetchVesselsFallback = useCallback(async () => {
    try {
      console.log('Fetching vessels via REST API fallback');
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedRegion !== 'global') {
        params.append('region', selectedRegion);
      }
      
      const response = await fetch(`/api/vessels/polling?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch vessels: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.vessels && Array.isArray(data.vessels)) {
        console.log(`Received ${data.vessels.length} vessels from REST API`);
        setVessels(data.vessels);
      } else {
        console.warn('No vessels data in REST API response', data);
      }
      
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vessels via REST:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch vessels'));
      setLoading(false);
      setVessels([]);
    }
  }, [selectedRegion]);
  
  // Initialize and manage WebSocket connection
  useEffect(() => {
    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    setLoading(true);
    
    // Create WebSocket URL properly
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;
    
    console.log(`Connecting to WebSocket at: ${wsUrl}`);
    
    try {
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Connection opened handler
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setConnected(true);
        setError(null);
        
        // Send configuration message
        if (socket.readyState === WebSocket.OPEN) {
          const configMessage = JSON.stringify({
            type: 'config',
            region: selectedRegion,
            loadAllVessels: true,
            page: 1,
            pageSize: 1000,
            trackPortProximity: true,
            proximityRadius: 50
          });
          
          socket.send(configMessage);
          console.log('Sent configuration to server', configMessage);
        }
      });
      
      // Message handler
      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`Received WebSocket message of type: ${data.type}`);
          
          if (data.type === 'vessel_update' || data.type === 'vessels') {
            if (data.vessels && Array.isArray(data.vessels)) {
              console.log(`Received ${data.vessels.length} vessels via WebSocket`);
              
              // Filter vessels with valid coordinates
              const validVessels = data.vessels.filter((v: any) => 
                v.currentLat != null && v.currentLng != null &&
                !isNaN(parseFloat(String(v.currentLat))) &&
                !isNaN(parseFloat(String(v.currentLng)))
              );
              
              if (validVessels.length > 0) {
                setVessels(validVessels);
              } else {
                console.warn('No vessels with valid coordinates');
              }
              
              // Handle port connections if present
              if (data.portConnections && Array.isArray(data.portConnections)) {
                setPortConnections(data.portConnections);
                console.log(`Received ${data.portConnections.length} port connections`);
              }
              
              setLastUpdated(new Date());
              setLoading(false);
            }
          } else if (data.type === 'error') {
            console.error('WebSocket error from server:', data.message);
            setError(new Error(data.message));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });
      
      // Error handler
      socket.addEventListener('error', (event) => {
        console.error('WebSocket connection error:', event);
        setConnected(false);
        setError(new Error('WebSocket connection error'));
        
        // Fall back to REST API
        fetchVesselsFallback();
        
        // Show error toast
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to vessel tracking service. Using fallback data.',
          variant: 'destructive'
        });
      });
      
      // Close handler
      socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        setConnected(false);
        
        // Set up reconnection if not intentionally closed
        if (!socketRef.current) return;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          // Recursively call this effect to reconnect
          socketRef.current = null;
        }, 5000);
      });
      
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError(err instanceof Error ? err : new Error('Failed to create WebSocket connection'));
      setConnected(false);
      setLoading(false);
      
      // Fall back to REST API
      fetchVesselsFallback();
    }
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Closing WebSocket connection due to cleanup');
        socketRef.current.close();
        socketRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [selectedRegion, fetchVesselsFallback, toast]);
  
  return {
    vessels,
    portConnections,
    loading,
    error,
    connected,
    lastUpdated
  };
}

const AdvancedMapPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  
  // Fetch maritime data using the custom WebSocket hook
  const { vessels, portConnections, loading, error, connected, lastUpdated } = useMaritimeWebSocket(selectedRegion);
  
  // Fetch static data from API
  const { data: ports = [] } = useQuery<Port[]>({
    queryKey: ['/api/ports'],
  });
  
  const { data: refineries = [] } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
  });
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };
  
  return (
      <div className="w-full h-full">
        <div className="absolute top-4 left-4 z-10">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center space-x-1 bg-background/80 backdrop-blur-sm shadow-md">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-4 pt-4">
          <div>
            <h1 className="text-3xl font-bold">Advanced Maritime Map</h1>
            <p className="text-muted-foreground">
              Real-time tracking of vessels, refineries, and ports worldwide
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Info
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Maritime Map Guide</SheetTitle>
                  <SheetDescription>
                    Learn how to use the advanced maritime tracking map
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-4 space-y-4">
                  <h3 className="font-medium">Map Controls</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Ship className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Vessels</span>
                        <p className="text-muted-foreground text-xs">Click on vessel icons to view details</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Factory className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <span className="font-medium">Refineries</span>
                        <p className="text-muted-foreground text-xs">Oil refineries with production data</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Anchor className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Ports</span>
                        <p className="text-muted-foreground text-xs">Maritime ports with vessel connections</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Settings className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Filters</span>
                        <p className="text-muted-foreground text-xs">Use the filter panel to find specific entities</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="font-medium">Tips & Tricks</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>Toggle map layers with the filter panel on the left side</li>
                    <li>Click any marker to see detailed information</li>
                    <li>Use the search box to find vessels by name, IMO, or MMSI</li>
                    <li>Enable vessel routes to see planned paths</li>
                    <li>Click on vessel details to open the full vessel page</li>
                    <li>Try different map styles for various visualization options</li>
                  </ul>
                  
                  <Separator />
                  
                  <h3 className="font-medium">Legend</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Crude Oil Tankers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Product Tankers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>LNG Carriers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span>LPG Carriers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Chemical Tankers</span>
                    </div>
                  </div>
                </div>
                
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Close Guide</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="theme-toggle" className="sr-only">
                Dark Mode
              </Label>
              <Switch
                id="theme-toggle"
                checked={themeMode === 'dark'}
                onCheckedChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
              />
            </div>
          </div>
        </div>
        
        {/* Map Tabs */}
        <Tabs defaultValue="global" className="mb-6">
          <TabsList>
            <TabsTrigger value="global">
              <Globe className="h-4 w-4 mr-1.5" />
              Global
            </TabsTrigger>
            <TabsTrigger value="north-america">North America</TabsTrigger>
            <TabsTrigger value="europe">Europe</TabsTrigger>
            <TabsTrigger value="middle-east">Middle East</TabsTrigger>
            <TabsTrigger value="asia-pacific">Asia-Pacific</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center">
                <Ship className="h-4 w-4 mr-2 text-primary" />
                Live Vessels
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1">
              <div className="text-2xl font-bold">2,496</div>
              <p className="text-xs text-muted-foreground">Oil tankers worldwide</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center">
                <Factory className="h-4 w-4 mr-2 text-destructive" />
                Refineries
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1">
              <div className="text-2xl font-bold">105</div>
              <p className="text-xs text-muted-foreground">Global refining facilities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center">
                <Anchor className="h-4 w-4 mr-2 text-blue-500" />
                Ports
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1">
              <div className="text-2xl font-bold">223</div>
              <p className="text-xs text-muted-foreground">Oil terminals and facilities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2 text-orange-500" />
                Cargo Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1">
              <div className="text-2xl font-bold">1.7B+</div>
              <p className="text-xs text-muted-foreground">Tons of active cargo</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Status indicator */}
        {error && (
          <div className="mb-4 p-2 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Connection error: {error.message}</span>
          </div>
        )}
        
        {/* Main Map - pass all maritime data to map component */}
        <ProfessionalMaritimeMap 
          fullScreen={isFullscreen} 
          themeMode={themeMode}
          vessels={vessels}
          ports={ports}
          refineries={refineries}
          portConnections={portConnections}
          loading={loading}
        />
        
        {/* Bottom disclaimer */}
        <div className="mt-4 text-xs text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <p>
              {connected ? 'Connected to real-time tracking' : 'Using fallback data'} • 
              Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
            </p>
          </div>
          <p className="mt-1">Real-time maritime data provided by PetroDealHub tracking system.</p>
        </div>
      </div>
  );
};

export default AdvancedMapPage;