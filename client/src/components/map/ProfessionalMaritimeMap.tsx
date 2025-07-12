import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, LayerGroup, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Port as PortType, Refinery as RefineryType, Vessel as VesselType } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Map, Ship, Database, Search, Factory, ArrowDown, FileDown, FileUp, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Define asset types for improved type safety
interface Vessel {
  id: number;
  name: string;
  imo?: string;
  mmsi?: string;
  vesselType?: string;
  flag?: string;
  built?: number | null;
  deadweight?: number | null;
  currentLat: string | number;
  currentLng: string | number;
  departurePort?: string | null;
  departureDate?: Date | null;
  departureLat?: string | number | null;
  departureLng?: string | number | null;
  destinationPort?: string | null;
  destinationLat?: string | number | null;
  destinationLng?: string | number | null;
  eta?: Date | null;
  cargoType?: string | null;
  cargoCapacity?: number | null;
  currentRegion?: string | null;
  metadata?: string | null;
  lastUpdated?: Date | null;
}

interface Port {
  id: number;
  name: string;
  country: string;
  type: string | null;
  status: string | null;
  region: string;
  lat: string;
  lng: string;
  capacity: number | null;
  description: string | null;
  lastUpdated: Date | null;
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
  operator: string | null;
  owner: string | null;
  type: string | null;
  products: string | null;
  year_built: number | null;
  last_maintenance: Date | null;
  next_maintenance: Date | null;
  complexity: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  technical_specs: string | null;
  photo: string | null;
  city: string | null;
  last_updated: Date | null;
  utilization: string | null;
}

// Map styling
interface MapStyle {
  url: string;
  name: string;
  attribution: string;
  maxZoom: number;
}

interface MapControlProps {
  position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  children: React.ReactNode;
}

interface PortConnection {
  vesselId: number;
  portId: number;
  vesselName: string;
  portName: string;
  distance: number;
  vesselType?: string;
  portType?: string;
  coordinates: {
    vessel: { lat: number | string; lng: number | string };
    port: { lat: number | string; lng: number | string };
  };
}

interface ProfessionalMaritimeMapProps {
  defaultCenter?: [number, number];
  defaultZoom?: number;
  fullScreen?: boolean;
  themeMode?: 'light' | 'dark';
  // Maritime data passed directly from parent component
  vessels?: VesselType[];
  ports?: PortType[];
  refineries?: RefineryType[];
  portConnections?: PortConnection[];
  loading?: boolean;
}

// Utility functions for consistent coordinate handling
const parseCoordinate = (coord: string | number | null | undefined): number | null => {
  if (coord === null || coord === undefined) return null;
  const parsed = typeof coord === 'string' ? parseFloat(coord) : coord;
  return isNaN(parsed) ? null : parsed;
};

const formatCoordinate = (coord: string | number | null | undefined): string => {
  const parsed = parseCoordinate(coord);
  return parsed !== null ? parsed.toFixed(6) : 'N/A';
};

// Custom Control for Leaflet
function MapControl({ position, children }: MapControlProps) {
  const map = useMap();
  const controlRef = useRef<HTMLDivElement>(null);

  // Create a custom control for the map
  useEffect(() => {
    if (!controlRef.current) return;

    // Store reference to the container
    const container = controlRef.current;
    
    // Create a custom control class
    const CustomControl = L.Control.extend({
      options: {
        position: position
      },
      
      onAdd: function() {
        // Prevent map events from propagating to control
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        return container;
      }
    });
    
    // Create and add the control to the map
    const customControl = new CustomControl();
    customControl.addTo(map);
    
    // Clean up on unmount
    return () => {
      map.removeControl(customControl);
    };
  }, [map, position]);

  return (
    <div ref={controlRef} className="leaflet-control">
      {children}
    </div>
  );
}

// Custom map component
export default function ProfessionalMaritimeMap({ 
  defaultCenter = [0, 0], 
  defaultZoom = 3, 
  fullScreen = false,
  themeMode = 'light',
  vessels = [],
  ports = [],
  refineries = [],
  portConnections = [],
  loading = false
}: ProfessionalMaritimeMapProps) {
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  
  // Map style options
  const MAP_STYLES: Record<string, MapStyle> = {
    standard: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      name: 'Standard',
      attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      name: 'Satellite',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      name: 'Dark',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    },
    terrain: {
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
      name: 'Terrain',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    },
    toner: {
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png',
      name: 'Toner',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    },
    watercolor: {
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png',
      name: 'Watercolor',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 16
    }
  };

  // State management
  const [mapStyle, setMapStyle] = useState<string>(themeMode === 'dark' ? 'dark' : 'standard');
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [showConnections, setShowConnections] = useState<boolean>(false);
  const [useCluster, setUseCluster] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Create exact same vessel icon as vessel detail page
  const createVesselIcon = (vessel: VesselType) => {
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
    
    // Create professional vessel icon exactly like vessel detail page
    const iconHtml = `
      <div class="vessel-marker ${vesselTypeClass}">
        <div class="vessel-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            ${shipShape}
          </svg>
        </div>
        <div class="vessel-label">${vessel.name}</div>
      </div>
    `;
    
    return L.divIcon({
      className: `custom-vessel-icon`,
      html: iconHtml,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const portIcon = L.icon({
    iconUrl: '/assets/port-icon.svg',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });

  const refineryIcon = L.icon({
    iconUrl: '/assets/refinery-icon.svg',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });

  // Data is now provided directly from props via the parent component
  // which handles the WebSocket connection

  // Filter assets based on search and region
  const filteredVessels = vessels
    ? vessels.filter((v: VesselType) => !searchTerm || v.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const filteredPorts = ports
    ? ports.filter((p: PortType) => (!searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase())) && 
        (selectedRegion === 'global' || p.region === selectedRegion))
    : [];

  const filteredRefineries = refineries
    ? refineries.filter((r: RefineryType) => (!searchTerm || r.name?.toLowerCase().includes(searchTerm.toLowerCase())) && 
        (selectedRegion === 'global' || r.region === selectedRegion))
    : [];

  // Count assets in selected region
  const assetCount = {
    vessels: vessels.filter((v: VesselType) => selectedRegion === 'global' || v.currentRegion === selectedRegion).length,
    ports: ports.filter((p: PortType) => selectedRegion === 'global' || p.region === selectedRegion).length,
    refineries: refineries.filter((r: RefineryType) => selectedRegion === 'global' || r.region === selectedRegion).length
  };

  // Render counter badge for each asset type
  const AssetCounter = ({ label, count, icon }: { label: string, count: number, icon: React.ReactNode }) => {
    return (
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="px-1 py-0 h-5">
          <span className="mr-1">{icon}</span>
          <span>{count}</span>
        </Badge>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    );
  };

  // Loading state now comes directly from props
  const isLoading = loading;

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
        className="h-full w-full" 
        attributionControl={false}
        ref={(map) => {
          if (map) mapRef.current = map;
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
                    icon={createVesselIcon(vessel)}
                  >
                    <Popup className="vessel-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-sm">{vessel.name || 'Unknown Vessel'}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Type:</span> {vessel.vesselType || 'N/A'}</div>
                          <div><span className="font-medium">Flag:</span> {vessel.flag || 'N/A'}</div>
                          <div>
                            <span className="font-medium">Coordinates:</span> {formatCoordinate(vessel.currentLat)}, {formatCoordinate(vessel.currentLng)}
                          </div>
                          {vessel.cargoType && <div><span className="font-medium">Cargo:</span> {vessel.cargoType}</div>}
                          {vessel.destinationPort && <div><span className="font-medium">Destination:</span> {vessel.destinationPort}</div>}
                          {vessel.built && <div><span className="font-medium">Built:</span> {vessel.built}</div>}
                          {vessel.deadweight && <div><span className="font-medium">Deadweight:</span> {vessel.deadweight} tons</div>}
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
                    icon={createVesselIcon(vessel)}
                  >
                    <Popup className="vessel-popup">
                      <div className="p-1">
                        <h3 className="font-bold text-sm">{vessel.name || 'Unknown Vessel'}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Type:</span> {vessel.vesselType || 'N/A'}</div>
                          <div><span className="font-medium">Flag:</span> {vessel.flag || 'N/A'}</div>
                          <div>
                            <span className="font-medium">Coordinates:</span> {formatCoordinate(vessel.currentLat)}, {formatCoordinate(vessel.currentLng)}
                          </div>
                          {vessel.cargoType && <div><span className="font-medium">Cargo:</span> {vessel.cargoType}</div>}
                          {vessel.destinationPort && <div><span className="font-medium">Destination:</span> {vessel.destinationPort}</div>}
                          {vessel.built && <div><span className="font-medium">Built:</span> {vessel.built}</div>}
                          {vessel.deadweight && <div><span className="font-medium">Deadweight:</span> {vessel.deadweight} tons</div>}
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
              {filteredPorts.map((port: PortType) => {
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
                        <h3 className="font-bold text-sm">{port.name || 'Unnamed Port'}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Country:</span> {port.country || 'N/A'}</div>
                          <div><span className="font-medium">Type:</span> {port.type || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> {port.status || 'N/A'}</div>
                          <div><span className="font-medium">Region:</span> {port.region || 'N/A'}</div>
                          <div><span className="font-medium">Capacity:</span> {port.capacity ? `${port.capacity.toLocaleString()} units` : 'N/A'}</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          ) : (
            <LayerGroup>
              {filteredPorts.map((port: PortType) => {
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
                        <h3 className="font-bold text-sm">{port.name || 'Unnamed Port'}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Country:</span> {port.country || 'N/A'}</div>
                          <div><span className="font-medium">Type:</span> {port.type || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> {port.status || 'N/A'}</div>
                          <div><span className="font-medium">Region:</span> {port.region || 'N/A'}</div>
                          <div><span className="font-medium">Capacity:</span> {port.capacity ? `${port.capacity.toLocaleString()} units` : 'N/A'}</div>
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
              {filteredRefineries.map((refinery: RefineryType) => {
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
                        <h3 className="font-bold text-sm">{refinery.name || 'Unnamed Refinery'}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Country:</span> {refinery.country || 'N/A'}</div>
                          <div><span className="font-medium">Region:</span> {refinery.region || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> {refinery.status || 'N/A'}</div>
                          <div><span className="font-medium">Capacity:</span> {refinery.capacity ? `${refinery.capacity.toLocaleString()} bpd` : 'N/A'}</div>
                          <div><span className="font-medium">Owner:</span> {refinery.owner || 'N/A'}</div>
                          <div><span className="font-medium">Operator:</span> {refinery.operator || 'N/A'}</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          ) : (
            <LayerGroup>
              {filteredRefineries.map((refinery: RefineryType) => {
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
                        <h3 className="font-bold text-sm">{refinery.name || 'Unnamed Refinery'}</h3>
                        <div className="text-xs mt-1">
                          <div><span className="font-medium">Country:</span> {refinery.country || 'N/A'}</div>
                          <div><span className="font-medium">Region:</span> {refinery.region || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> {refinery.status || 'N/A'}</div>
                          <div><span className="font-medium">Capacity:</span> {refinery.capacity ? `${refinery.capacity.toLocaleString()} bpd` : 'N/A'}</div>
                          <div><span className="font-medium">Owner:</span> {refinery.owner || 'N/A'}</div>
                          <div><span className="font-medium">Operator:</span> {refinery.operator || 'N/A'}</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          )
        )}

        {/* Map Controls */}
        <MapControl position="topleft">
          <Card className="w-64 shadow-md">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Map className="h-4 w-4" />
                Maritime Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Tabs defaultValue="layers" className="w-full">
                <TabsList className="w-full mb-2 grid grid-cols-3">
                  <TabsTrigger value="layers">Layers</TabsTrigger>
                  <TabsTrigger value="filter">Filter</TabsTrigger>
                  <TabsTrigger value="settings">Display</TabsTrigger>
                </TabsList>
                
                <TabsContent value="layers" className="space-y-2 mt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="vessels" checked={showVessels} onCheckedChange={setShowVessels} />
                      <Label htmlFor="vessels" className="text-sm flex items-center gap-1">
                        <Ship className="h-3.5 w-3.5" /> Vessels
                      </Label>
                    </div>
                    <AssetCounter label="vessels" count={assetCount.vessels} icon={<Ship className="h-3 w-3" />} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="ports" checked={showPorts} onCheckedChange={setShowPorts} />
                      <Label htmlFor="ports" className="text-sm flex items-center gap-1">
                        <Database className="h-3.5 w-3.5" /> Ports
                      </Label>
                    </div>
                    <AssetCounter label="ports" count={assetCount.ports} icon={<Database className="h-3 w-3" />} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="refineries" checked={showRefineries} onCheckedChange={setShowRefineries} />
                      <Label htmlFor="refineries" className="text-sm flex items-center gap-1">
                        <Factory className="h-3.5 w-3.5" /> Refineries
                      </Label>
                    </div>
                    <AssetCounter label="refineries" count={assetCount.refineries} icon={<Factory className="h-3 w-3" />} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="connections" checked={showConnections} onCheckedChange={setShowConnections} />
                      <Label htmlFor="connections" className="text-sm flex items-center gap-1">
                        <ArrowDown className="h-3.5 w-3.5" /> Connections
                      </Label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="filter" className="space-y-2 mt-0">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="search" className="text-xs">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="search" 
                        placeholder="Search assets..." 
                        className="pl-8 h-8 text-sm" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="region" className="text-xs">Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger id="region" className="h-8 text-sm">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="americas">Americas</SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="middle_east">Middle East</SelectItem>
                          <SelectItem value="africa">Africa</SelectItem>
                          <SelectItem value="asia_pacific">Asia Pacific</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-2 mt-0">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="mapStyle" className="text-xs">Map Style</Label>
                    <Select value={mapStyle} onValueChange={setMapStyle}>
                      <SelectTrigger id="mapStyle" className="h-8 text-sm">
                        <SelectValue placeholder="Select map style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(MAP_STYLES).map(([key, style]) => (
                            <SelectItem key={key} value={key}>{style.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="clustering" checked={useCluster} onCheckedChange={setUseCluster} />
                      <Label htmlFor="clustering" className="text-sm">Use clustering</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <FileDown className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <FileUp className="h-3.5 w-3.5 mr-1" />
                    Import
                  </Button>
                </div>
                <div>
                  {lastUpdated && `Last update: ${new Date(lastUpdated).toLocaleTimeString()}`}
                </div>
              </div>
            </CardContent>
          </Card>
        </MapControl>
      </MapContainer>
    </div>
  );
}