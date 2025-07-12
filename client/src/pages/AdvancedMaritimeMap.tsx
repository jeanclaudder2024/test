import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, ZoomControl, Circle, Polyline, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Map styles - using CartoDB tiles for English country names
const mapStyles = {
  standard: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  ocean: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
  nautical: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  terrain: 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png'
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

  // Check if user is authenticated
  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;

  // Fetch data using React Query with error handling
  const { data: vesselData, isLoading: vesselsLoading, error: vesselError } = useQuery<any>({
    queryKey: ['/api/vessels/polling'],
    refetchInterval: realTimeTracking ? 30000 : false,
    retry: 1,
    enabled: isAuthenticated
  });

  const vessels = useMemo(() => {
    if (!vesselData) return [];
    const vesselArray = vesselData.vessels || vesselData || [];
    if (!Array.isArray(vesselArray)) return [];
    
    return vesselArray.filter((v: any) => 
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
  }, [vesselData]);

  const { data: portsData, isLoading: portsLoading, error: portsError } = useQuery<any>({
    queryKey: ['/api/ports'],
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: isAuthenticated
  });

  const ports = useMemo(() => {
    if (!portsData) return [];
    const portArray = portsData.ports || portsData || [];
    if (!Array.isArray(portArray)) return [];
    
    return portArray.filter((p: any) => 
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
  }, [portsData]);

  const { data: refineriesData, isLoading: refineriesLoading, error: refineriesError } = useQuery<any>({
    queryKey: ['/api/refineries'],
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: isAuthenticated
  });

  const refineries = useMemo(() => {
    if (!refineriesData) return [];
    const refineryArray = Array.isArray(refineriesData) ? refineriesData : [];
    
    return refineryArray.filter((r: any) => 
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

  // Get exact same vessel icon as vessel detail page
  const getVesselIcon = (vessel: Vessel) => {
    // Determine vessel type class for styling (same as vessel detail page)
    let vesselTypeClass = 'vessel-type-default';
    const lowerType = vessel.vesselType?.toLowerCase() || '';
    
    if (lowerType.includes('crude')) {
      vesselTypeClass = 'vessel-type-crude';
    } else if (lowerType.includes('product')) {
      vesselTypeClass = 'vessel-type-products';
    } else if (lowerType.includes('lng')) {
      vesselTypeClass = 'vessel-type-lng';
    } else if (lowerType.includes('lpg')) {
      vesselTypeClass = 'vessel-type-lpg';
    } else if (lowerType.includes('chemical')) {
      vesselTypeClass = 'vessel-type-chemical';
    }
    
    // Ship-shaped icon that looks like a tanker from above (exact same as vessel detail page)
    const shipShape = `
      <path d="M3,14 L6,7 L18,7 L21,14 L12,18 L3,14 Z" />
    `;
    
    const rotation = vessel.heading || vessel.course || 0;
    
    // Create professional vessel icon exactly like vessel detail page
    const iconHtml = `
      <div class="vessel-marker ${vesselTypeClass}">
        <div class="vessel-icon" style="transform: rotate(${rotation}deg);">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            ${shipShape}
          </svg>
        </div>
        <div class="vessel-label">${vessel.name}</div>
        ${vessel.speed ? `<div class="vessel-speed">${vessel.speed.toFixed(1)} kn</div>` : ''}
      </div>
    `;
    
    return L.divIcon({
      className: `custom-vessel-icon`,
      html: iconHtml,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
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

  // Show login message for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="p-8 max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-600 flex items-center justify-center">
              <MapIcon className="w-8 h-8 mr-2" />
              Advanced Maritime Map
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Please log in to view advanced maritime tracking data.</p>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Login to View Map
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                  {oilTypes.map((oilType) => {
                    const vesselCount = vessels.filter(v => 
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
                              <span className="text-xs text-muted-foreground">
                                {vesselCount} vessels match this oil type
                              </span>
                            </div>
                          </div>
                        }
                        className="w-80"
                      >
                        <SelectItem value={oilType.name}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{oilType.name}</span>
                              {oilType.description && (
                                <span className="text-xs text-muted-foreground">{oilType.description}</span>
                              )}
                            </div>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {vesselCount}
                            </Badge>
                          </div>
                        </SelectItem>
                      </PortalHoverCard>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Selected Oil Types */}
              {selectedVesselTypes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Selected Filters:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedVesselTypes.map((type) => (
                      <Badge 
                        key={type} 
                        variant="default" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => {
                          setSelectedVesselTypes(prev => prev.filter(t => t !== type));
                        }}
                      >
                        {type} ×
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVesselTypes([])}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
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