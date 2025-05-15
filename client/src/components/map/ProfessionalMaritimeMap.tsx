import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { Port as PortType, Refinery as RefineryType } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Ship, Anchor, Factory, Map as MapIcon, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Define asset types for improved type safety
interface Vessel {
  id: number;
  name: string;
  imo?: string;
  mmsi?: string;
  callSign?: string;
  flag?: string;
  vesselType?: string;
  status?: string;
  length?: number;
  beam?: number;
  currentLat: string | number;
  currentLng: string | number;
  speedKnots?: number;
  courseHeading?: number;
  destination?: string;
  eta?: string | Date;
  cargo?: string;
  cargoCapacity?: number;
  yearBuilt?: number;
  vesselClass?: string;
}

interface Port {
  id: number;
  name: string;
  country: string;
  type?: string;
  status?: string;
  region?: string;
  lat: string | number;
  lng: string | number;
  capacity?: number;
  description?: string;
}

interface Refinery {
  id: number;
  name: string;
  company?: string;
  country: string;
  region?: string;
  status?: string;
  capacity?: number;
  lat: string | number;
  lng: string | number;
  description?: string;
}

// Map styling
interface MapStyle {
  url: string;
  name: string;
  attribution: string;
  maxZoom: number;
}

const MAP_STYLES: Record<string, MapStyle> = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    name: 'Standard',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    name: 'Dark',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    name: 'Satellite',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  },
  nautical: {
    url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    name: 'Nautical',
    attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
    maxZoom: 19
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    name: 'Terrain',
    attribution: 'Map data: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17
  }
};

// Helper for safely formatting coordinates
const formatCoordinate = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  try {
    return parseFloat(String(value)).toFixed(4);
  } catch (error) {
    console.warn('Error formatting coordinate:', error);
    return 'N/A';
  }
};

// Helper to safely parse coordinates for the map
const parseCoordinate = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  
  try {
    const parsed = parseFloat(String(value));
    if (isNaN(parsed)) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('Error parsing coordinate:', error);
    return null;
  }
};

// Custom icons for different map elements
const createCustomIcon = (iconUrl: string, size: number = 25) => {
  return L.icon({
    iconUrl,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// Map control component for custom controls
interface MapControlProps {
  position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  children: React.ReactNode;
}

const MapControl: React.FC<MapControlProps> = ({ position, children }) => {
  const map = useMap();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = L.DomUtil.create('div', `leaflet-control leaflet-bar custom-map-control-${position}`);
    
    const mapControl = L.Control.extend({
      options: { position },
      onAdd: function() {
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        return container;
      }
    });
    
    map.addControl(new mapControl());
    containerRef.current = container;
    setPortalContainer(container);
    
    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [map, position]);

  return portalContainer ? ReactDOM.createPortal(children, portalContainer) : null;
};

// Main Map Component
interface ProfessionalMaritimeMapProps {
  defaultCenter?: [number, number];
  defaultZoom?: number;
  fullScreen?: boolean;
  themeMode?: 'light' | 'dark';
}

const ProfessionalMaritimeMap: React.FC<ProfessionalMaritimeMapProps> = ({
  defaultCenter = [20, 0],
  defaultZoom = 3,
  fullScreen = false,
  themeMode = 'light'
}): React.ReactNode => {
  // Map state
  const [mapStyle, setMapStyle] = useState<string>(themeMode === 'dark' ? 'dark' : 'standard');
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [useCluster, setUseCluster] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const { toast } = useToast();
  
  // References
  const mapRef = useRef<L.Map | null>(null);
  
  // WebSocket connection for real-time vessel data
  const { 
    vessels, 
    connected: wsConnected, 
    lastUpdated, 
    loading: vesselsLoading,
    error: wsError 
  } = useVesselWebSocket({
    page: 1,
    pageSize: 2500,
    loadAllVessels: true,
    region: selectedRegion,
    trackPortProximity: true,
    proximityRadius: 50
  });
  
  // Fetch ports and refineries
  const { data: ports = [], isLoading: portsLoading } = useQuery<PortType[]>({
    queryKey: ['/api/ports'],
  });
  
  const { data: refineries = [], isLoading: refineriesLoading } = useQuery<RefineryType[]>({
    queryKey: ['/api/refineries'],
  });

  // Handle errors
  useEffect(() => {
    if (wsError) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to vessel tracking service. Using cached data.",
        variant: "destructive"
      });
    }
  }, [wsError, toast]);

  // Apply the right map style when theme changes
  useEffect(() => {
    setMapStyle(themeMode === 'dark' ? 'dark' : 'standard');
  }, [themeMode]);

  // Filter assets based on search term
  const filteredVessels = searchTerm
    ? vessels.filter(v => v.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : vessels;

  const filteredPorts = searchTerm
    ? ports.filter((p: Port) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : ports;

  const filteredRefineries = searchTerm
    ? refineries.filter((r: Refinery) => r.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : refineries;

  // Count assets by region
  const regionCounts = {
    vessels: vessels.filter(v => selectedRegion === 'global' || v.region === selectedRegion).length,
    ports: ports.filter((p: Port) => selectedRegion === 'global' || p.region === selectedRegion).length,
    refineries: refineries.filter((r: Refinery) => selectedRegion === 'global' || r.region === selectedRegion).length
  };

  // Calculate statistics
  const vesselStats = {
    totalVessels: vessels.length,
    activeVessels: vessels.filter(v => v.status === 'active').length,
    totalCargoVolume: vessels.reduce((sum, vessel) => sum + (vessel.cargoCapacity || 0), 0)
  };

  // Icons
  const vesselIcon = createCustomIcon('/assets/vessel-icon.svg', 20);
  const portIcon = createCustomIcon('/assets/port-icon.svg', 22);
  const refineryIcon = createCustomIcon('/assets/refinery-icon.svg', 24);

  // Fallback icons if custom icons are unavailable
  useEffect(() => {
    // Create default icons if custom icons fail to load
    const defaultVesselIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -6]
    });

    const defaultPortIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -7]
    });

    const defaultRefineryIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #f59e0b; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8]
    });

    // Set the default icons on the prototype
    L.Marker.prototype.options.icon = defaultVesselIcon;
  }, []);

  // Render control panels
  const renderControlPanel = () => {
    return (
      <div className="bg-card rounded-lg border border-border shadow-md p-4 w-full max-w-xs">
        <Tabs defaultValue="controls">
          <TabsList className="w-full mb-4">
            <TabsTrigger className="flex-1" value="controls">Controls</TabsTrigger>
            <TabsTrigger className="flex-1" value="layers">Layers</TabsTrigger>
            <TabsTrigger className="flex-1" value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="controls">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">Search Assets</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search vessels, ports, refineries..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="region">Region Filter</Label>
                <Select 
                  value={selectedRegion} 
                  onValueChange={setSelectedRegion}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="north_america">North America</SelectItem>
                    <SelectItem value="south_america">South America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="oceania">Oceania</SelectItem>
                    <SelectItem value="middle_east">Middle East</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="map-style">Map Style</Label>
                <Select 
                  value={mapStyle} 
                  onValueChange={setMapStyle}
                >
                  <SelectTrigger id="map-style">
                    <SelectValue placeholder="Select map style" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MAP_STYLES).map(([key, style]) => (
                      <SelectItem key={key} value={key}>{style.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="clustering">Use Clustering</Label>
                <Switch 
                  id="clustering" 
                  checked={useCluster} 
                  onCheckedChange={setUseCluster} 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="layers">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="show-vessels">Vessels</Label>
                </div>
                <Switch 
                  id="show-vessels" 
                  checked={showVessels} 
                  onCheckedChange={setShowVessels}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-green-500" />
                  <Label htmlFor="show-ports">Ports</Label>
                </div>
                <Switch 
                  id="show-ports" 
                  checked={showPorts} 
                  onCheckedChange={setShowPorts}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-amber-500" />
                  <Label htmlFor="show-refineries">Refineries</Label>
                </div>
                <Switch 
                  id="show-refineries" 
                  checked={showRefineries} 
                  onCheckedChange={setShowRefineries}
                />
              </div>
              
              <div className="pt-2 border-t border-border">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                    Vessels: {regionCounts.vessels}
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                    Ports: {regionCounts.ports}
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                    Refineries: {regionCounts.refineries}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Vessels:</span>
                <span className="font-medium">{vesselStats.totalVessels.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Vessels:</span>
                <span className="font-medium">{vesselStats.activeVessels.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cargo:</span>
                <span className="font-medium">{vesselStats.totalCargoVolume.toLocaleString()} DWT</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-6">
          <div className="flex items-center gap-1">
            <div className={wsConnected ? "h-2 w-2 bg-green-500 rounded-full" : "h-2 w-2 bg-red-500 rounded-full"}></div>
            <span>{wsConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <div>
            {lastUpdated && `Last update: ${new Date(lastUpdated).toLocaleTimeString()}`}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  const isLoading = vesselsLoading || portsLoading || refineriesLoading;

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden border border-border",
      fullScreen ? "h-[calc(100vh-4rem)]" : "h-[600px]"
    )}>
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading maritime data...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenReady={(map) => {
          mapRef.current = map.target;
        }}
      >
        <TileLayer
          url={MAP_STYLES[mapStyle]?.url || MAP_STYLES.standard.url}
          attribution={MAP_STYLES[mapStyle]?.attribution || MAP_STYLES.standard.attribution}
          maxZoom={MAP_STYLES[mapStyle]?.maxZoom || 19}
        />
        
        <ZoomControl position="bottomright" />
        
        {/* Vessels Layer */}
        {showVessels && (
          useCluster ? (
            <MarkerClusterGroup chunkedLoading>
              {filteredVessels.map(vessel => {
                const lat = parseCoordinate(vessel.currentLat);
                const lng = parseCoordinate(vessel.currentLng);
                
                if (!lat || !lng) return null;
                
                return (
                  <Marker
                    key={`vessel-${vessel.id}`}
                    position={[lat, lng]}
                    icon={vesselIcon}
                  >
                    <Popup className="vessel-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-sm">{vessel.name || 'Unknown Vessel'}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Type:</span> {vessel.vesselType || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> {vessel.status || 'N/A'}</div>
                          <div><span className="font-medium">Flag:</span> {vessel.flag || 'N/A'}</div>
                          <div>
                            <span className="font-medium">Coordinates:</span> {formatCoordinate(vessel.currentLat)}, {formatCoordinate(vessel.currentLng)}
                          </div>
                          {vessel.cargo && <div><span className="font-medium">Cargo:</span> {vessel.cargo}</div>}
                          {vessel.destination && <div><span className="font-medium">Destination:</span> {vessel.destination}</div>}
                          {vessel.speedKnots && <div><span className="font-medium">Speed:</span> {vessel.speedKnots} knots</div>}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          ) : (
            <LayerGroup>
              {filteredVessels.map(vessel => {
                const lat = parseCoordinate(vessel.currentLat);
                const lng = parseCoordinate(vessel.currentLng);
                
                if (!lat || !lng) return null;
                
                return (
                  <Marker
                    key={`vessel-${vessel.id}`}
                    position={[lat, lng]}
                    icon={vesselIcon}
                  >
                    <Popup className="vessel-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-sm">{vessel.name || 'Unknown Vessel'}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Type:</span> {vessel.vesselType || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> {vessel.status || 'N/A'}</div>
                          <div><span className="font-medium">Flag:</span> {vessel.flag || 'N/A'}</div>
                          <div>
                            <span className="font-medium">Coordinates:</span> {formatCoordinate(vessel.currentLat)}, {formatCoordinate(vessel.currentLng)}
                          </div>
                          {vessel.cargo && <div><span className="font-medium">Cargo:</span> {vessel.cargo}</div>}
                          {vessel.destination && <div><span className="font-medium">Destination:</span> {vessel.destination}</div>}
                          {vessel.speedKnots && <div><span className="font-medium">Speed:</span> {vessel.speedKnots} knots</div>}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          )
        )}
        
        {/* Ports Layer */}
        {showPorts && (
          useCluster ? (
            <MarkerClusterGroup chunkedLoading>
              {filteredPorts.map((port: Port) => {
                const lat = parseCoordinate(port.lat);
                const lng = parseCoordinate(port.lng);
                
                if (!lat || !lng) return null;
                
                return (
                  <Marker
                    key={`port-${port.id}`}
                    position={[lat, lng]}
                    icon={portIcon}
                  >
                    <Popup className="port-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-sm">{port.name}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Country:</span> {port.country}</div>
                          <div><span className="font-medium">Type:</span> {port.type || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> {port.status || 'N/A'}</div>
                          <div>
                            <span className="font-medium">Coordinates:</span> {formatCoordinate(port.lat)}, {formatCoordinate(port.lng)}
                          </div>
                          {port.capacity && <div><span className="font-medium">Capacity:</span> {port.capacity.toLocaleString()} DWT</div>}
                          {port.description && (
                            <div className="mt-1 text-xs text-muted-foreground">{port.description}</div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          ) : (
            <LayerGroup>
              {filteredPorts.map((port: Port) => {
                const lat = parseCoordinate(port.lat);
                const lng = parseCoordinate(port.lng);
                
                if (!lat || !lng) return null;
                
                return (
                  <Marker
                    key={`port-${port.id}`}
                    position={[lat, lng]}
                    icon={portIcon}
                  >
                    <Popup className="port-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-sm">{port.name}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Country:</span> {port.country}</div>
                          <div><span className="font-medium">Type:</span> {port.type || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> {port.status || 'N/A'}</div>
                          <div>
                            <span className="font-medium">Coordinates:</span> {formatCoordinate(port.lat)}, {formatCoordinate(port.lng)}
                          </div>
                          {port.capacity && <div><span className="font-medium">Capacity:</span> {port.capacity.toLocaleString()} DWT</div>}
                          {port.description && (
                            <div className="mt-1 text-xs text-muted-foreground">{port.description}</div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          )
        )}
        
        {/* Refineries Layer */}
        {showRefineries && (
          useCluster ? (
            <MarkerClusterGroup chunkedLoading>
              {filteredRefineries.map((refinery: Refinery) => {
                const lat = parseCoordinate(refinery.lat);
                const lng = parseCoordinate(refinery.lng);
                
                if (!lat || !lng) return null;
                
                return (
                  <Marker
                    key={`refinery-${refinery.id}`}
                    position={[lat, lng]}
                    icon={refineryIcon}
                  >
                    <Popup className="refinery-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-sm">{refinery.name}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Company:</span> {refinery.company || 'N/A'}</div>
                          <div><span className="font-medium">Country:</span> {refinery.country}</div>
                          <div><span className="font-medium">Status:</span> {refinery.status || 'Active'}</div>
                          <div>
                            <span className="font-medium">Coordinates:</span> {formatCoordinate(refinery.lat)}, {formatCoordinate(refinery.lng)}
                          </div>
                          {refinery.capacity && <div><span className="font-medium">Capacity:</span> {refinery.capacity.toLocaleString()} bbl/day</div>}
                          {refinery.description && (
                            <div className="mt-1 text-xs text-muted-foreground">{refinery.description}</div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          ) : (
            <LayerGroup>
              {filteredRefineries.map((refinery: Refinery) => {
                const lat = parseCoordinate(refinery.lat);
                const lng = parseCoordinate(refinery.lng);
                
                if (!lat || !lng) return null;
                
                return (
                  <Marker
                    key={`refinery-${refinery.id}`}
                    position={[lat, lng]}
                    icon={refineryIcon}
                  >
                    <Popup className="refinery-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-sm">{refinery.name}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Company:</span> {refinery.company || 'N/A'}</div>
                          <div><span className="font-medium">Country:</span> {refinery.country}</div>
                          <div><span className="font-medium">Status:</span> {refinery.status || 'Active'}</div>
                          <div>
                            <span className="font-medium">Coordinates:</span> {formatCoordinate(refinery.lat)}, {formatCoordinate(refinery.lng)}
                          </div>
                          {refinery.capacity && <div><span className="font-medium">Capacity:</span> {refinery.capacity.toLocaleString()} bbl/day</div>}
                          {refinery.description && (
                            <div className="mt-1 text-xs text-muted-foreground">{refinery.description}</div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          )
        )}
        
        {/* Control Panel */}
        <MapControl position="topleft">
          {renderControlPanel()}
        </MapControl>
      </MapContainer>
    </div>
  );
};

export default ProfessionalMaritimeMap;