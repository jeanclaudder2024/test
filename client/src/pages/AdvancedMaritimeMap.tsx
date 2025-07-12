import React, { useState, useEffect, useRef, useMemo } from 'react';
import GoogleMap from '@/components/map/GoogleMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Ship, 
  Anchor, 
  Factory, 
  MapIcon, 
  RefreshCw, 
  Filter, 
  Layers, 
  Globe, 
  Search, 
  X, 
  AlertCircle, 
  Info, 
  Navigation,
  Activity,
  Compass,
  Wind,
  Waves,
  Fuel,
  Package,
  ChevronRight,
  Eye,
  EyeOff,
  Satellite,
  Map as MapIconSolid,
  Target,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Gauge,
  Route,
  Timer,
  TrendingUp
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PortalHoverCard } from "@/components/ui/portal-hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Define interfaces
interface Vessel {
  id: number;
  name: string;
  lat: string | number;
  lng: string | number;
  vesselType: string;
  imo: string;
  mmsi: string;
  flag: string;
  cargoType?: string;
  status?: string;
  speed?: number;
  course?: number;
  heading?: number;
  cargoCapacity?: number;
  departurePort?: string;
  destinationPort?: string;
  eta?: string;
  draught?: number;
  length?: number;
  width?: number;
}

interface Port {
  id: number;
  name: string;
  lat: string | number;
  lng: string | number;
  country: string;
  region: string;
  type: string;
  status?: string;
  capacity?: number;
  vesselCapacity?: number;
  throughput?: number;
}

interface Refinery {
  id: number;
  name: string;
  lat: string | number;
  lng: string | number;
  country: string;
  region: string;
  operator?: string;
  capacity?: number;
  status?: string;
  products?: string[];
}

interface WeatherData {
  lat: number;
  lng: number;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  temperature: number;
  visibility: number;
}

export default function AdvancedMaritimeMap() {
  const [mapStyle, setMapStyle] = useState<string>('ocean');
  const [showVessels, setShowVessels] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showRefineries, setShowRefineries] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [realTimeTracking, setRealTimeTracking] = useState(true);
  const [selectedVesselTypes, setSelectedVesselTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<'vessel' | 'port' | 'refinery' | null>(null);
  const [filterRadius, setFilterRadius] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const { toast } = useToast();
  const mapRef = useRef<any>(null);

  // Check if user is authenticated
  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;

  // Fetch vessels data
  const { data: vesselsData = [], isLoading: vesselsLoading } = useQuery({
    queryKey: ['/api/admin/vessels'],
    enabled: isAuthenticated,
    staleTime: 0
  });

  // Fetch ports data  
  const { data: portsData = [], isLoading: portsLoading } = useQuery({
    queryKey: ['/api/admin/ports'],
    enabled: isAuthenticated,
    staleTime: 0
  });

  // Fetch refineries data
  const { data: refineriesData = [], isLoading: refineriesLoading } = useQuery({
    queryKey: ['/api/admin/refineries'],
    enabled: isAuthenticated,
    staleTime: 0
  });

  // Convert to proper types
  const vessels: Vessel[] = useMemo(() => {
    return vesselsData.map((v: any) => ({
      ...v,
      lat: Number(v.lat),
      lng: Number(v.lng)
    }));
  }, [vesselsData]);

  const ports: Port[] = useMemo(() => {
    return portsData.map((p: any) => ({
      ...p,
      lat: Number(p.lat),
      lng: Number(p.lng),
      status: p.status || 'Active'
    }));
  }, [portsData]);

  const refineries: Refinery[] = useMemo(() => {
    return refineriesData.map((r: any) => ({
      ...r,
      lat: Number(r.lat),
      lng: Number(r.lng),
      status: r.status || 'Active',
      products: r.products || []
    }));
  }, [refineriesData]);

  // Fetch oil types from public endpoint
  const { data: oilTypes = [] } = useQuery({
    queryKey: ['/api/oil-types'],
    staleTime: 5 * 60 * 1000
  });

  // Filter vessels based on selected types and search
  const filteredVessels = useMemo(() => {
    return vessels.filter(vessel => {
      const matchesType = selectedVesselTypes.length === 0 || 
        selectedVesselTypes.includes(vessel.vesselType);
      const matchesSearch = !searchTerm || 
        vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.imo.includes(searchTerm) ||
        vessel.mmsi.includes(searchTerm);
      return matchesType && matchesSearch;
    });
  }, [vessels, selectedVesselTypes, searchTerm]);

  const isLoading = vesselsLoading || portsLoading || refineriesLoading;

  // Show login message for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="p-8 max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-600 flex items-center justify-center">
              <Ship className="w-8 h-8 mr-2" />
              Advanced Maritime Map
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Please log in to access the advanced maritime intelligence features.</p>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Login to Access Map
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      {/* Google Maps Container */}
      <GoogleMap
        center={{ lat: 20, lng: 0 }}
        zoom={3}
        vessels={showVessels ? filteredVessels : []}
        ports={showPorts ? ports : []}
        refineries={showRefineries ? refineries : []}
        style={{ 
          height: '100%', 
          width: '100%'
        }}
        className="h-full w-full z-0"
        showVessels={showVessels}
        showPorts={showPorts}
        showRefineries={showRefineries}
      />

      {/* Enhanced Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] max-w-sm">
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapIconSolid className="h-5 w-5" />
                Maritime Intelligence Map
              </span>
              {realTimeTracking && (
                <Badge variant="default" className="animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vessels, ports, refineries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Map Style Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Map Style</Label>
              <Select value={mapStyle} onValueChange={(value: any) => setMapStyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="ocean">Ocean</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vessel Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filter by Vessel Type</Label>
              
              <Select onValueChange={(value) => {
                if (value && !selectedVesselTypes.includes(value)) {
                  setSelectedVesselTypes(prev => [...prev, value]);
                }
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select oil types to filter vessels..." />
                </SelectTrigger>
                <SelectContent>
                  {oilTypes.map((oilType: any) => {
                    const vesselCount = vessels.filter((v: any) => 
                      v.oilType === oilType.name || 
                      v.cargoType === oilType.name || 
                      v.vesselType === oilType.name
                    ).length;
                    
                    return (
                      <PortalHoverCard 
                        key={oilType.id}
                        content={
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">{oilType.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {oilType.description || 'No description available'}
                            </p>
                            <div className="flex items-center pt-2">
                              <Ship className="mr-2 h-4 w-4 opacity-70" />
                              <span className="text-sm">{vesselCount} vessels</span>
                            </div>
                          </div>
                        }
                      >
                        <SelectItem key={oilType.id} value={oilType.name}>
                          {oilType.name} ({vesselCount})
                        </SelectItem>
                      </PortalHoverCard>
                    );
                  })}
                  
                  {/* Fallback vessel type options */}
                  {(!oilTypes || oilTypes.length === 0) && [
                    'Tanker', 'Container', 'Bulk Carrier', 'Oil Tanker', 'LNG', 'LPG'
                  ].map((type) => {
                    const vesselCount = vessels.filter(v => v.vesselType === type).length;
                    return (
                      <SelectItem key={type} value={type}>
                        {type} ({vesselCount})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Selected filters */}
              {selectedVesselTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedVesselTypes.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                      <button
                        onClick={() => setSelectedVesselTypes(prev => prev.filter(t => t !== type))}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Layer Controls */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Map Layers</Label>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="vessels" className="text-sm flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Vessels ({filteredVessels.length})
                </Label>
                <Switch
                  id="vessels"
                  checked={showVessels}
                  onCheckedChange={setShowVessels}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ports" className="text-sm flex items-center gap-2">
                  <Anchor className="h-4 w-4" />
                  Ports ({ports.length})
                </Label>
                <Switch
                  id="ports"
                  checked={showPorts}
                  onCheckedChange={setShowPorts}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="refineries" className="text-sm flex items-center gap-2">
                  <Factory className="h-4 w-4" />
                  Refineries ({refineries.length})
                </Label>
                <Switch
                  id="refineries"
                  checked={showRefineries}
                  onCheckedChange={setShowRefineries}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="routes" className="text-sm flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Vessel Routes
                </Label>
                <Switch
                  id="routes"
                  checked={showRoutes}
                  onCheckedChange={setShowRoutes}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="weather" className="text-sm flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  Weather Overlay
                </Label>
                <Switch
                  id="weather"
                  checked={showWeather}
                  onCheckedChange={setShowWeather}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="heatmap" className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Density Heatmap
                </Label>
                <Switch
                  id="heatmap"
                  checked={showHeatMap}
                  onCheckedChange={setShowHeatMap}
                />
              </div>

            </div>

            <Separator />

            {/* Statistics */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Live Statistics</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <p className="text-muted-foreground">Active Vessels</p>
                  <p className="font-semibold text-lg">{filteredVessels.filter(v => v.status === 'At Sea').length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <p className="text-muted-foreground">In Port</p>
                  <p className="font-semibold text-lg">{filteredVessels.filter(v => v.status === 'Moored').length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <p className="text-muted-foreground">Avg Speed</p>
                  <p className="font-semibold text-lg">
                    {(filteredVessels.reduce((acc, v) => acc + (v.speed || 0), 0) / filteredVessels.length).toFixed(1)}kt
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <p className="text-muted-foreground">Coverage</p>
                  <p className="font-semibold text-lg">Global</p>
                </div>
              </div>
            </div>

            {/* Real-time toggle */}
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="realtime" className="text-sm flex items-center gap-2">
                <RefreshCw className={cn("h-4 w-4", realTimeTracking && "animate-spin")} />
                Real-time Tracking
              </Label>
              <Switch
                id="realtime"
                checked={realTimeTracking}
                onCheckedChange={setRealTimeTracking}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 z-[2000] flex items-center justify-center">
          <Card className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-lg font-medium">Loading Maritime Data...</p>
              <p className="text-sm text-muted-foreground">Fetching vessels, ports, and refineries</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}