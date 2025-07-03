import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, ZoomControl, Circle, Polyline, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Weather overlay data
interface WeatherData {
  lat: number;
  lng: number;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  temperature: number;
  visibility: number;
}

// Map styles
const mapStyles = {
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  ocean: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
  nautical: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
};

// Heat map gradient for vessel density
const heatMapGradient = {
  0.0: 'rgba(0,0,255,0)',
  0.1: 'rgba(0,0,255,0.1)',
  0.25: 'rgba(0,255,0,0.2)',
  0.5: 'rgba(255,255,0,0.3)',
  0.75: 'rgba(255,128,0,0.4)',
  1.0: 'rgba(255,0,0,0.5)'
};

export default function AdvancedMaritimeMap() {
  const [mapStyle, setMapStyle] = useState<keyof typeof mapStyles>('ocean');
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
  const mapRef = useRef<L.Map | null>(null);

  // Fetch data using React Query
  const { data: vessels = [], isLoading: vesselsLoading } = useQuery<Vessel[]>({
    queryKey: ['/api/vessels/polling'],
    refetchInterval: realTimeTracking ? 30000 : false,
    select: (data: any) => {
      return (data.vessels || []).filter((v: any) => 
        v && v.id && v.name && v.currentLat && v.currentLng
      ).map((v: any) => ({
        id: v.id,
        name: v.name,
        lat: parseFloat(v.currentLat),
        lng: parseFloat(v.currentLng),
        vesselType: v.vesselType || 'Unknown',
        imo: v.imo || 'N/A',
        mmsi: v.mmsi || 'N/A',
        flag: v.flag || 'Unknown',
        cargoType: v.cargoType || 'Unknown',
        status: v.status || 'At Sea',
        speed: v.speed || 0,
        course: v.course || 0,
        heading: v.heading || 0,
        cargoCapacity: v.cargoCapacity,
        departurePort: v.departurePort,
        destinationPort: v.destinationPort,
        eta: v.eta,
        draught: v.draught,
        length: v.length,
        width: v.width
      }));
    }
  });

  const { data: ports = [], isLoading: portsLoading } = useQuery<Port[]>({
    queryKey: ['/api/ports'],
    staleTime: 5 * 60 * 1000,
    select: (data: any) => {
      return (data || []).filter((p: any) => 
        p && p.id && p.name && p.lat && p.lng
      ).map((p: any) => ({
        id: p.id,
        name: p.name,
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
        country: p.country || 'Unknown',
        region: p.region || 'Unknown',
        type: p.type || 'Commercial',
        status: p.status || 'Active',
        capacity: p.capacity,
        vesselCapacity: p.vesselCapacity,
        throughput: p.throughput
      }));
    }
  });

  const { data: refineries = [], isLoading: refineriesLoading } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
    staleTime: 5 * 60 * 1000,
    select: (data: any) => {
      return (data || []).filter((r: any) => 
        r && r.id && r.name && r.lat && r.lng
      ).map((r: any) => ({
        id: r.id,
        name: r.name,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lng),
        country: r.country || 'Unknown',
        region: r.region || 'Unknown',
        operator: r.operator || 'Unknown',
        capacity: r.capacity,
        status: r.status || 'Active',
        products: r.products || []
      }));
    }
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

  // Get vessel icon with rotation based on heading
  const getVesselIcon = (vessel: Vessel) => {
    const colorMap: Record<string, string> = {
      'Tanker': '#10b981',
      'Oil': '#10b981',
      'LNG': '#8b5cf6',
      'LPG': '#8b5cf6',
      'Container': '#3b82f6',
      'Bulk': '#f97316',
      'Passenger': '#ec4899',
      'Cargo': '#06b6d4'
    };

    let color = '#6b7280';
    for (const [key, value] of Object.entries(colorMap)) {
      if (vessel.vesselType.includes(key)) {
        color = value;
        break;
      }
    }

    const rotation = vessel.heading || vessel.course || 0;
    const isMoving = vessel.speed && vessel.speed > 0.5;

    return L.divIcon({
      className: 'vessel-marker-advanced',
      html: `
        <div class="relative" style="transform: rotate(${rotation}deg)">
          <div class="absolute inset-0 rounded-full opacity-30 blur-sm ${isMoving ? 'animate-pulse' : ''}" 
               style="background-color: ${color}"></div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" class="relative">
            <path d="M12 2L4 7v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7l-8-5zm0 2.5L18 8v8c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1V8l6-3.5z"/>
            <path d="M12 2v20" stroke="${color}" stroke-width="1" opacity="0.3"/>
            ${isMoving ? '<circle cx="12" cy="20" r="2" fill="white" class="animate-ping"/>' : ''}
          </svg>
          ${vessel.speed ? `<div class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-black/70 px-1 rounded">${vessel.speed.toFixed(1)}kt</div>` : ''}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Port icon with different styles
  const getPortIcon = (port: Port) => {
    const sizeClass = port.vesselCapacity && port.vesselCapacity > 100 ? 'w-6 h-6' : 'w-4 h-4';
    const color = port.status === 'Active' ? '#3b82f6' : '#6b7280';

    return L.divIcon({
      className: 'port-marker-advanced',
      html: `
        <div class="relative group">
          <div class="absolute inset-0 ${sizeClass} rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors"></div>
          <div class="${sizeClass} rounded-full border-2 border-white shadow-lg flex items-center justify-center" 
               style="background-color: ${color}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Refinery icon
  const getRefineryIcon = (refinery: Refinery) => {
    const color = refinery.status === 'Active' ? '#f97316' : '#6b7280';

    return L.divIcon({
      className: 'refinery-marker-advanced',
      html: `
        <div class="relative group">
          <div class="absolute inset-0 w-6 h-6 rounded bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors"></div>
          <div class="w-6 h-6 rounded border-2 border-white shadow-lg flex items-center justify-center" 
               style="background-color: ${color}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M6 19V9l6-6 6 6v10h-5v-7h-2v7H6z"/>
              <path d="M19 19h2v2h-2zM3 19h2v2H3z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Map controls component - must be inside MapContainer
  const MapControlsInner = () => {
    const map = useMap();

    const handleZoomIn = () => map.zoomIn();
    const handleZoomOut = () => map.zoomOut();
    const handleFitBounds = () => {
      if (filteredVessels.length > 0) {
        const bounds = L.latLngBounds(
          filteredVessels.map(v => [Number(v.lat), Number(v.lng)])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };
    const handleFullscreen = () => {
      const container = map.getContainer();
      if (!document.fullscreenElement) {
        container.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    return (
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg p-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFitBounds}>
            <Target className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFullscreen}>
            <Fullscreen className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Vessel route lines
  const VesselRoutes = () => {
    if (!showRoutes) return null;

    return (
      <LayerGroup>
        {filteredVessels.map(vessel => {
          if (!vessel.departurePort || !vessel.destinationPort) return null;

          // Find port coordinates
          const depPort = ports.find(p => p.name.includes(vessel.departurePort!));
          const destPort = ports.find(p => p.name.includes(vessel.destinationPort!));

          if (!depPort || !destPort) return null;

          const positions: [number, number][] = [
            [Number(depPort.lat), Number(depPort.lng)],
            [Number(vessel.lat), Number(vessel.lng)],
            [Number(destPort.lat), Number(destPort.lng)]
          ];

          return (
            <Polyline
              key={`route-${vessel.id}`}
              positions={positions}
              pathOptions={{
                color: '#3b82f6',
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 10'
              }}
            />
          );
        })}
      </LayerGroup>
    );
  };

  // Weather overlay component
  const WeatherOverlay = () => {
    if (!showWeather) return null;

    // Generate mock weather data for demo
    const weatherPoints = Array.from({ length: 20 }, (_, i) => ({
      lat: -60 + Math.random() * 120,
      lng: -180 + Math.random() * 360,
      windSpeed: Math.random() * 30,
      windDirection: Math.random() * 360,
      waveHeight: Math.random() * 5
    }));

    return (
      <LayerGroup>
        {weatherPoints.map((point, idx) => (
          <CircleMarker
            key={`weather-${idx}`}
            center={[point.lat, point.lng]}
            radius={10}
            pathOptions={{
              fillColor: point.windSpeed > 20 ? '#ef4444' : point.windSpeed > 10 ? '#f59e0b' : '#10b981',
              fillOpacity: 0.5,
              color: 'transparent'
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Weather Conditions</p>
                <p>Wind: {point.windSpeed.toFixed(1)}kt @ {point.windDirection.toFixed(0)}°</p>
                <p>Waves: {point.waveHeight.toFixed(1)}m</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </LayerGroup>
    );
  };

  // Heat map for vessel density
  const VesselHeatMap = () => {
    if (!showHeatMap || !filteredVessels.length) return null;

    // Group vessels by region for density calculation
    const regions = filteredVessels.reduce((acc, vessel) => {
      const key = `${Math.floor(Number(vessel.lat) / 5)},${Math.floor(Number(vessel.lng) / 5)}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxDensity = Math.max(...Object.values(regions));

    return (
      <LayerGroup>
        {Object.entries(regions).map(([key, count]) => {
          const [lat, lng] = key.split(',').map(Number);
          const intensity = count / maxDensity;
          
          return (
            <Circle
              key={`heat-${key}`}
              center={[lat * 5 + 2.5, lng * 5 + 2.5]}
              radius={500000}
              pathOptions={{
                fillColor: intensity > 0.75 ? '#ef4444' : intensity > 0.5 ? '#f59e0b' : intensity > 0.25 ? '#eab308' : '#22c55e',
                fillOpacity: 0.3 * intensity,
                color: 'transparent'
              }}
            />
          );
        })}
      </LayerGroup>
    );
  };

  const isLoading = vesselsLoading || portsLoading || refineriesLoading;

  return (
    <div className="h-screen w-full relative">
      {/* Main Map Container */}
      <MapContainer
        ref={mapRef}
        center={[20, 0]}
        zoom={3}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* Base map layers */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={mapStyles[mapStyle]}
        />
        
        {mapStyle === 'ocean' && (
          <TileLayer
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            opacity={0.8}
          />
        )}

        <MapControlsInner />
        <VesselHeatMap />
        <WeatherOverlay />
        <VesselRoutes />

        {/* Ports Layer */}
        {showPorts && (
          <LayerGroup>
            {ports.map(port => (
              <Marker
                key={`port-${port.id}`}
                position={[Number(port.lat), Number(port.lng)]}
                icon={getPortIcon(port)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Anchor className="h-4 w-4" />
                      {port.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Country:</span> {port.country}</p>
                      <p><span className="font-medium">Region:</span> {port.region}</p>
                      <p><span className="font-medium">Type:</span> {port.type}</p>
                      <p><span className="font-medium">Status:</span> 
                        <Badge variant={port.status === 'Active' ? 'default' : 'secondary'} className="ml-1">
                          {port.status}
                        </Badge>
                      </p>
                      {port.vesselCapacity && (
                        <p><span className="font-medium">Capacity:</span> {port.vesselCapacity} vessels</p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        )}

        {/* Refineries Layer */}
        {showRefineries && (
          <LayerGroup>
            {refineries.map(refinery => (
              <Marker
                key={`refinery-${refinery.id}`}
                position={[Number(refinery.lat), Number(refinery.lng)]}
                icon={getRefineryIcon(refinery)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      {refinery.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Operator:</span> {refinery.operator}</p>
                      <p><span className="font-medium">Country:</span> {refinery.country}</p>
                      <p><span className="font-medium">Status:</span> 
                        <Badge variant={refinery.status === 'Active' ? 'default' : 'secondary'} className="ml-1">
                          {refinery.status}
                        </Badge>
                      </p>
                      {refinery.capacity && (
                        <p><span className="font-medium">Capacity:</span> {refinery.capacity.toLocaleString()} bbl/day</p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        )}

        {/* Vessels Layer */}
        {showVessels && (
          <LayerGroup>
            {filteredVessels.map(vessel => (
              <Marker
                key={`vessel-${vessel.id}`}
                position={[Number(vessel.lat), Number(vessel.lng)]}
                icon={getVesselIcon(vessel)}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      {vessel.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Type:</span> {vessel.vesselType}</p>
                      <p><span className="font-medium">IMO:</span> {vessel.imo}</p>
                      <p><span className="font-medium">Flag:</span> {vessel.flag}</p>
                      <p><span className="font-medium">Status:</span> 
                        <Badge variant="default" className="ml-1">
                          {vessel.status}
                        </Badge>
                      </p>
                      {vessel.speed !== undefined && (
                        <p><span className="font-medium">Speed:</span> {vessel.speed.toFixed(1)} knots</p>
                      )}
                      {vessel.course !== undefined && (
                        <p><span className="font-medium">Course:</span> {vessel.course.toFixed(0)}°</p>
                      )}
                      {vessel.destinationPort && (
                        <p><span className="font-medium">Destination:</span> {vessel.destinationPort}</p>
                      )}
                      {vessel.eta && (
                        <p><span className="font-medium">ETA:</span> {new Date(vessel.eta).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        )}
      </MapContainer>

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