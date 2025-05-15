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

// Port connections type
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

// Map styling
interface MapStyle {
  url: string;
  name: string;
  attribution: string;
  maxZoom: number;
  preview?: string;
  description?: string;
  type?: string;
}

interface MapControlProps {
  position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  children: React.ReactNode;
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
  
  // Map style options with high-quality satellite imagery and professional styles
  // Fetch map styles from the API
  const [mapStyles, setMapStyles] = useState<Record<string, MapStyle>>({
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      name: 'Satellite Imagery',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    }
  });

  // Fetch map styles from the API on component mount
  useEffect(() => {
    const fetchMapStyles = async () => {
      try {
        const response = await fetch('/api/map-styles');
        const styles = await response.json();
        if (styles && styles.length > 0) {
          const stylesMap: Record<string, MapStyle> = {};
          styles.forEach((style: any) => {
            stylesMap[style.id] = {
              url: style.url,
              name: style.name,
              attribution: style.attribution,
              maxZoom: style.maxZoom
            };
          });
          setMapStyles(stylesMap);
          console.log('Loaded professional map styles:', styles.length);
        }
      } catch (error) {
        console.error('Failed to load map styles:', error);
        toast({
          title: 'Warning',
          description: 'Using default map styles due to API error.',
          variant: 'destructive'
        });
      }
    };

    fetchMapStyles();
  }, [toast]);

  // State management
  const [mapStyle, setMapStyle] = useState<string>(themeMode === 'dark' ? 'dark' : 'satellite');
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [showConnections, setShowConnections] = useState<boolean>(false);
  const [useCluster, setUseCluster] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Custom icons
  const vesselIcon = L.icon({
    iconUrl: '/assets/vessel-icon.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

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
          url={mapStyles[mapStyle]?.url || mapStyles.satellite.url}
          attribution={mapStyles[mapStyle]?.attribution || mapStyles.satellite.attribution}
          maxZoom={mapStyles[mapStyle]?.maxZoom || 19}
        />
        
        <ZoomControl position="bottomright" />
        
        {/* Vessels Layer */}
        {showVessels && (
          useCluster ? (
            <MarkerClusterGroup chunkedLoading>
              {filteredVessels.map((vessel: VesselType) => {
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
              {filteredVessels.map((vessel: VesselType) => {
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
                      <h3 className="font-bold text-sm">{port.name}</h3>
                      <div className="text-xs mt-1">
                        <div><span className="font-medium">Country:</span> {port.country || 'N/A'}</div>
                        <div><span className="font-medium">Type:</span> {port.type || 'General Port'}</div>
                        <div><span className="font-medium">Status:</span> {port.status || 'Operational'}</div>
                        <div><span className="font-medium">Region:</span> {port.region || 'N/A'}</div>
                        {port.capacity && <div><span className="font-medium">Capacity:</span> {port.capacity} vessels/day</div>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </LayerGroup>
        )}
        
        {/* Refineries Layer */}
        {showRefineries && (
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
                      <h3 className="font-bold text-sm">{refinery.name}</h3>
                      <div className="text-xs mt-1">
                        <div><span className="font-medium">Country:</span> {refinery.country || 'N/A'}</div>
                        <div><span className="font-medium">Operator:</span> {refinery.operator || 'N/A'}</div>
                        <div><span className="font-medium">Status:</span> {refinery.status || 'Operational'}</div>
                        <div><span className="font-medium">Region:</span> {refinery.region || 'N/A'}</div>
                        {refinery.capacity && <div><span className="font-medium">Capacity:</span> {refinery.capacity} bpd</div>}
                        {refinery.products && <div><span className="font-medium">Products:</span> {refinery.products}</div>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </LayerGroup>
        )}
        
        {/* Controls */}
        <MapControl position="topleft">
          <Card className="shadow-lg w-56">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="text-sm flex items-center space-x-1">
                <Settings className="w-4 h-4" />
                <span>Map Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs" htmlFor="map-style">Map Style</Label>
                <Select
                  value={mapStyle}
                  onValueChange={setMapStyle}
                >
                  <SelectTrigger id="map-style" className="h-7 text-xs">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Object.entries(mapStyles).map(([key, style]) => {
                        const styleData = style as MapStyle;
                        return (
                          <SelectItem key={key} value={key} className="text-xs">
                            <div className="flex items-center gap-2">
                              {/* Show preview image if available or use a placeholder */}
                              <div 
                                className="w-6 h-6 rounded overflow-hidden border border-border" 
                                style={{
                                  backgroundImage: `url(${(style as any).preview || `/assets/${key}-preview.png`})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }}
                              />
                              <span>{styleData.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs" htmlFor="region-filter">Region Filter</Label>
                <Select
                  value={selectedRegion}
                  onValueChange={setSelectedRegion}
                >
                  <SelectTrigger id="region-filter" className="h-7 text-xs">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="global" className="text-xs">Global</SelectItem>
                      <SelectItem value="north_america" className="text-xs">North America</SelectItem>
                      <SelectItem value="south_america" className="text-xs">South America</SelectItem>
                      <SelectItem value="europe" className="text-xs">Europe</SelectItem>
                      <SelectItem value="africa" className="text-xs">Africa</SelectItem>
                      <SelectItem value="middle_east" className="text-xs">Middle East</SelectItem>
                      <SelectItem value="asia" className="text-xs">Asia</SelectItem>
                      <SelectItem value="oceania" className="text-xs">Australia & Oceania</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs" htmlFor="search-assets">Search Assets</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="search-assets"
                    placeholder="Search by name..."
                    className="h-7 pl-7 text-xs"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium mb-1.5">Layers</p>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="show-vessels" 
                      checked={showVessels}
                      onCheckedChange={setShowVessels}
                    />
                    <Label htmlFor="show-vessels" className="text-xs cursor-pointer">
                      <div className="flex items-center">
                        <Ship className="h-3.5 w-3.5 mr-1.5" />
                        Vessels
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="show-ports" 
                      checked={showPorts}
                      onCheckedChange={setShowPorts}
                    />
                    <Label htmlFor="show-ports" className="text-xs cursor-pointer">
                      <div className="flex items-center">
                        <Ship className="h-3.5 w-3.5 mr-1.5" />
                        Ports
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="show-refineries" 
                      checked={showRefineries}
                      onCheckedChange={setShowRefineries}
                    />
                    <Label htmlFor="show-refineries" className="text-xs cursor-pointer">
                      <div className="flex items-center">
                        <Factory className="h-3.5 w-3.5 mr-1.5" />
                        Refineries
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="use-cluster" 
                      checked={useCluster}
                      onCheckedChange={setUseCluster}
                    />
                    <Label htmlFor="use-cluster" className="text-xs cursor-pointer">
                      <div className="flex items-center">
                        <Map className="h-3.5 w-3.5 mr-1.5" />
                        Clustering
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <AssetCounter 
                  label="Vessels" 
                  count={assetCount.vessels} 
                  icon={<Ship className="h-3 w-3" />}
                />
                <AssetCounter 
                  label="Ports" 
                  count={assetCount.ports} 
                  icon={<Ship className="h-3 w-3" />}
                />
                <AssetCounter 
                  label="Refineries" 
                  count={assetCount.refineries} 
                  icon={<Factory className="h-3 w-3" />}
                />
              </div>
            </CardContent>
          </Card>
        </MapControl>
      </MapContainer>
    </div>
  );
}