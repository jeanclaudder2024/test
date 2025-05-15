import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  useMap, 
  Polyline,
  CircleMarker,
  Tooltip,
  Circle,
  ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import { createPortal } from 'react-dom';
import { OptimizedVesselLayer, OptimizedRefineryLayer, OptimizedPortLayer } from './OptimizedMarkerLayer';
import { Vessel, Refinery, Port } from '@shared/schema';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Info, Navigation, Ship, 
  Factory, Anchor as AnchorIcon, MapPin, Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Ensure Leaflet CSS is imported
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Define marker icons for different vessel types
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Define a memoized vessel icon creator for better performance
// Using a simple caching mechanism to avoid recreating icons on every render
const iconCache: Record<string, L.Icon> = {};

// Create custom vessel icon with caching for performance
const vesselIcon = (heading: number = 0, speed: number = 0, vesselType: string = 'oil products tanker') => {
  // Create a cache key based on icon parameters
  const cacheKey = `${heading}-${speed}-${vesselType}`;
  
  // Return cached icon if available
  if (iconCache[cacheKey]) {
    return iconCache[cacheKey];
  }
  
  // Different colors based on vessel type
  let color = '#3388ff'; // default blue
  
  if (vesselType.includes('crude')) {
    color = '#e53935'; // red for crude oil tankers
  } else if (vesselType.includes('lng')) {
    color = '#43a047'; // green for LNG
  } else if (vesselType.includes('lpg')) {
    color = '#ffb300'; // amber for LPG
  }
  
  // Simplified size calculation for better performance - fewer calculations
  const size = Math.min(16, 10 + Math.floor(speed / 2)); 
  
  // Create a simple ship icon with rotation based on heading
  // Simplified SVG for better performance
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size * 2}" height="${size * 2}"><path fill="${color}" transform="rotate(${heading}, 12, 12)" d="M3,13A9,9 0 0,0 12,22A9,9 0 0,0 21,13H3M12,4.26L15,6V10H9V6L12,4.26M12,2C11.73,2 11.45,2.09 11.24,2.23L4.24,7.23C3.95,7.43 3.76,7.75 3.75,8.09C3.75,8.44 3.95,8.75 4.24,8.95L7,10.86V13H17V10.86L19.76,8.95C20.05,8.75 20.25,8.44 20.25,8.09C20.24,7.75 20.05,7.43 19.76,7.23L12.76,2.23C12.55,2.09 12.27,2 12,2Z" /></svg>`;
  
  // Convert SVG to data URL
  const svgBase64 = btoa(svgIcon);
  const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
  
  // Create icon
  const icon = L.icon({
    iconUrl: dataUrl,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size]
  });
  
  // Cache the icon
  iconCache[cacheKey] = icon;
  
  return icon;
};

// Create and cache single instance of refinery icon
let cachedRefineryIcon: L.Icon | null = null;
const refineryIcon = () => {
  if (cachedRefineryIcon) return cachedRefineryIcon;
  
  // Create an SVG factory icon
  const size = 24;
  // Simplified SVG with fewer path points for better performance
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}"><circle cx="12" cy="12" r="10" fill="#f44336" fill-opacity="0.8" stroke="#000" stroke-width="1"/><path fill="#fff" d="M7 12h2v5H7v-5zm8 0h2v5h-2v-5zm-4-8h2v3h-2V4zm0 4h2v2h-2V8zm0 3h2v8h-2v-8z"/></svg>`;
  
  // Convert SVG to data URL
  const svgBase64 = btoa(svgIcon);
  const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
  
  cachedRefineryIcon = L.icon({
    iconUrl: dataUrl,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
  
  return cachedRefineryIcon;
};

// Create and cache single instance of port icon
let cachedPortIcon: L.Icon | null = null;
const portIcon = () => {
  if (cachedPortIcon) return cachedPortIcon;
  
  // Create an SVG anchor icon
  const size = 22;
  // Simplified SVG with fewer path points for better performance
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}"><circle cx="12" cy="12" r="10" fill="#2196f3" fill-opacity="0.8" stroke="#000" stroke-width="1"/><path fill="#fff" d="M16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8A4,4 0 0,1 16,12M13,4.26V6.34C12.16,6.42 11.5,6.7 10.9,7.1L9.67,6.34L11.29,7.23C10.5,7.8 10.1,8.5 10.07,9.5H8V10.5H10.07C10.18,11.5 10.5,12 11.29,12.7L9.67,13.06L11.53,12.31C12.16,12.54 12.8,12.6 13,12.67V14.74C13,14.74 12.92,15 12.92,14.3C12.92,13.6 13.5,13 12.5,12C11.5,11 11.12,11 11,10C10.88,9 10.29,8.31 10.29,8.31L11.8,7C11.8,7 12.3,6.5 13,6.34V4.26Z" /></svg>`;
  
  // Convert SVG to data URL
  const svgBase64 = btoa(svgIcon);
  const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
  
  cachedPortIcon = L.icon({
    iconUrl: dataUrl,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
  
  return cachedPortIcon;
};

// Custom viewport management to only render what's visible
function useViewportRendering(map: L.Map | null) {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [zoom, setZoom] = useState<number>(3);
  
  useEffect(() => {
    if (!map) return;
    
    // Set initial values
    setBounds(map.getBounds());
    setZoom(map.getZoom());
    
    // Update on map move
    const updateViewport = () => {
      setBounds(map.getBounds());
      setZoom(map.getZoom());
    };
    
    map.on('moveend', updateViewport);
    map.on('zoomend', updateViewport);
    
    return () => {
      map.off('moveend', updateViewport);
      map.off('zoomend', updateViewport);
    };
  }, [map]);
  
  return { bounds, zoom };
}

// Custom Map Control for the floating control panel
function MapControl({ 
  position, 
  className,
  children 
}: { 
  position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright',
  className?: string,
  children: React.ReactNode
}) {
  const map = useMap();
  const controlRef = useRef<HTMLDivElement | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create control
    const controlOptions = { position };
    const control = new (L.Control.extend({
      options: controlOptions,
      // Override the _initLayout method to use our custom container
      onAdd: function(map: L.Map) {
        const containerDiv = L.DomUtil.create('div', `leaflet-custom-control ${className || ''}`);
        containerDiv.style.padding = '0';
        containerDiv.style.margin = '0';
        containerDiv.style.background = 'none';
        containerDiv.style.border = 'none';
        containerDiv.style.boxShadow = 'none';
        
        L.DomEvent.disableClickPropagation(containerDiv);
        L.DomEvent.disableScrollPropagation(containerDiv);
        
        return containerDiv;
      }
    }))();
    
    // Add control to map
    control.addTo(map);
    setContainer(control.getContainer() as HTMLDivElement);
    
    // Clean up on unmount
    return () => {
      if (map) control.remove();
    };
  }, [map, position, className]);
  
  return container ? createPortal(children, container) : null;
}

// Component to fix map display issues and handle events
function MapEvents() {
  const map = useMap();
  
  useEffect(() => {
    // Fix gray areas by ensuring proper wrapping of the map
    if (map) {
      // Enable proper map wrapping around the globe
      map.options.worldCopyJump = true;
      
      // Handle map resize events to ensure proper rendering
      const handleResize = () => {
        map.invalidateSize();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [map]);
  
  return null;
}

// MapUpdateComponent - handles updating the map when vessels change
interface MapUpdateProps {
  vessels: Vessel[];
}

function MapUpdate({ vessels }: MapUpdateProps) {
  const map = useMap();

  useEffect(() => {
    if (vessels.length > 0) {
      // If we have vessels, fit bounds to include all vessels
      const points = vessels.map(vessel => 
        [parseFloat(String(vessel.currentLat) || '0'), parseFloat(String(vessel.currentLng) || '0')] as [number, number]
      );
      
      // Only include valid coordinates
      const validPoints = points.filter(p => !isNaN(p[0]) && !isNaN(p[1]));
      
      if (validPoints.length > 0) {
        map.fitBounds(validPoints);
      }
    }
  }, [vessels, map]);

  return null;
}

interface LiveVesselMapProps {
  initialRegion?: string;
  height?: string;
  showRoutes?: boolean;
  showVesselHistory?: boolean;
  showHeatmap?: boolean;
  mapStyle?: string;
}

export default function LiveVesselMap({ 
  initialRegion, 
  height = '600px',
  showRoutes = false,
  showVesselHistory = false,
  showHeatmap = false,
  mapStyle: initialMapStyle = 'dark'
}: LiveVesselMapProps) {
  const [mapStyle, setMapStyle] = useState<string>(initialMapStyle);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion || 'global');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(3);
  
  // Use our WebSocket hook for real-time vessel data
  const { 
    vessels, 
    connected: isConnected, 
    lastUpdated, 
    error: vesselError, 
    loading: vesselsLoading 
  } = useVesselWebSocket({ 
    region: selectedRegion,
    loadAllVessels: true,
    pageSize: 500
  });
  
  // Use the maritime data hook for refineries, ports, etc.
  const { 
    refineries,
    ports,
    loading: infrastructureLoading,
    error: infrastructureError
  } = useMaritimeData({ region: selectedRegion });
  
  // Handle vessel click
  const handleVesselClick = (vessel: Vessel) => {
    // Toggle selection if clicking the same vessel
    if (selectedVessel && selectedVessel.id === vessel.id) {
      setSelectedVessel(null);
    } else {
      setSelectedVessel(vessel);
      setSelectedRefinery(null);
      setSelectedPort(null);
    }
  };
  
  // Handle refinery click
  const handleRefineryClick = (refinery: Refinery) => {
    // Toggle selection if clicking the same refinery
    if (selectedRefinery && selectedRefinery.id === refinery.id) {
      setSelectedRefinery(null);
    } else {
      setSelectedRefinery(refinery);
      setSelectedVessel(null);
      setSelectedPort(null);
    }
  };
  
  // Handle port click
  const handlePortClick = (port: Port) => {
    // Toggle selection if clicking the same port
    if (selectedPort && selectedPort.id === port.id) {
      setSelectedPort(null);
    } else {
      setSelectedPort(port);
      setSelectedVessel(null);
      setSelectedRefinery(null);
    }
  };
  
  // Show error message if there's an issue
  if (vesselError || infrastructureError) {
    const error = vesselError || infrastructureError;
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
        <h3 className="font-medium mb-2">Error Loading Map Data</h3>
        <p className="text-sm">{error?.toString()}</p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {(vesselsLoading || infrastructureLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm font-medium">Loading maritime data...</div>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', background: '#1B262C' }}
            minZoom={2}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
            worldCopyJump={true}
          >
            
            {/* Handle different map styles */}
            {mapStyle === 'dark' && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            )}
            
            {mapStyle === 'light' && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
            )}
            
            {mapStyle === 'satellite' && (
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}
            
            {mapStyle === 'nautical' && (
              <TileLayer
                attribution='Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
                url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
              />
            )}
            
            {/* Fix map issues */}
            <MapEvents />
            
            {/* Vessel Markers */}
            <OptimizedVesselLayer
              vessels={vessels}
              onVesselSelect={handleVesselClick}
              vesselsWithRoutes={vessels.reduce((acc, vessel) => {
                // Only show routes for vessels with destination coordinates
                acc[vessel.id] = showRoutes && !!vessel.destinationLat && !!vessel.destinationLng;
                return acc;
              }, {} as Record<number, boolean>)}
              setVesselsWithRoutes={() => {}} // Empty function since we're not changing it dynamically
            />
            
            {/* Refinery Markers */}
            <OptimizedRefineryLayer
              refineries={refineries}
              onRefinerySelect={handleRefineryClick}
            />
            
            {/* Port Markers */}
            <OptimizedPortLayer
              ports={ports}
              onPortSelect={handlePortClick}
            />
            
            <MapUpdate vessels={vessels} />
            
            {/* Modal-style popup for selected vessel */}
            {selectedVessel && (
              <MapControl position="topright" className="w-96">
                <Card className="border-blue-200 shadow-lg bg-white/95 backdrop-blur-sm">
                  <CardHeader className="pb-2 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <Badge className="bg-blue-100 text-blue-700 mb-1 hover:bg-blue-200">{selectedVessel.vesselType}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedVessel(null)} className="h-6 w-6 p-0">×</Button>
                    </div>
                    <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                      <Ship className="h-5 w-5 text-blue-600" />
                      {selectedVessel.name}
                    </CardTitle>
                    <CardDescription className="text-blue-600">
                      {selectedVessel.flag} • IMO: {selectedVessel.imo}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-3 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Position</p>
                        <p className="font-medium">
                          {(() => {
                            try {
                              const lat = typeof selectedVessel.currentLat === 'string' ? 
                                parseFloat(selectedVessel.currentLat) : 
                                selectedVessel.currentLat || 0;
                              const lng = typeof selectedVessel.currentLng === 'string' ? 
                                parseFloat(selectedVessel.currentLng) : 
                                selectedVessel.currentLng || 0;
                              return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
                            } catch (e) {
                              return "N/A";
                            }
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Speed</p>
                        <p className="font-medium">
                          {(() => {
                            try {
                              if (selectedVessel.metadata) {
                                const metadata = JSON.parse(selectedVessel.metadata);
                                return metadata.speed ? `${metadata.speed} knots` : 'N/A';
                              }
                              return 'N/A';
                            } catch (e) {
                              return 'N/A';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="my-1" />
                    
                    <div className="space-y-1">
                      <h4 className="font-medium text-xs flex items-center gap-1">
                        <Info className="h-3 w-3 text-blue-500" />
                        Vessel Information
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Built</p>
                          <p className="font-medium">{selectedVessel.built || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Deadweight</p>
                          <p className="font-medium">{selectedVessel.deadweight?.toLocaleString() || 'N/A'} t</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-medium text-xs flex items-center gap-1">
                        <Route className="h-3 w-3 text-blue-500" />
                        Voyage
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">From</p>
                          <p className="font-medium">{selectedVessel.departurePort || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">To</p>
                          <p className="font-medium">{selectedVessel.destinationPort || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </MapControl>
            )}
            
            {/* Modal-style popup for selected refinery */}
            {selectedRefinery && (
              <MapControl position="topright" className="w-96">
                <Card className="border-red-200 shadow-lg bg-white/95 backdrop-blur-sm">
                  <CardHeader className="pb-2 bg-gradient-to-b from-red-50 to-white border-b border-red-100">
                    <div className="flex justify-between items-center">
                      <Badge className="bg-red-100 text-red-700 mb-1 hover:bg-red-200">Refinery</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedRefinery(null)} className="h-6 w-6 p-0">×</Button>
                    </div>
                    <CardTitle className="flex items-center gap-2 text-red-800 text-lg">
                      <Factory className="h-5 w-5 text-red-600" />
                      {selectedRefinery.name}
                    </CardTitle>
                    <CardDescription className="text-red-600">
                      {selectedRefinery.country} • {selectedRefinery.region}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-3 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Capacity</p>
                        <p className="font-medium">{selectedRefinery.capacity?.toLocaleString() || 'Unknown'} bpd</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className="font-medium capitalize">{selectedRefinery.status || 'Active'}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-1" />
                    
                    {selectedRefinery.description && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {selectedRefinery.description.substring(0, 200)}
                          {selectedRefinery.description.length > 200 ? '...' : ''}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full text-xs border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => {
                          window.open(`/refineries/${selectedRefinery.id}`, '_blank');
                        }}
                      >
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </MapControl>
            )}
            
            {/* Modal-style popup for selected port */}
            {selectedPort && (
              <MapControl position="topright" className="w-96">
                <Card className="border-blue-200 shadow-lg bg-white/95 backdrop-blur-sm">
                  <CardHeader className="pb-2 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <Badge className="bg-blue-100 text-blue-700 mb-1 hover:bg-blue-200">{selectedPort.type || 'Port'}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPort(null)} className="h-6 w-6 p-0">×</Button>
                    </div>
                    <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                      <AnchorIcon className="h-5 w-5 text-blue-600" />
                      {selectedPort.name}
                    </CardTitle>
                    <CardDescription className="text-blue-600">
                      {selectedPort.country} • {selectedPort.region}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-3 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium">{selectedPort.type || 'Commercial'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className="font-medium capitalize">{selectedPort.status || 'Active'}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-1" />
                    
                    {selectedPort.description && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {selectedPort.description.substring(0, 200)}
                          {selectedPort.description.length > 200 ? '...' : ''}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          window.open(`/ports/${selectedPort.id}`, '_blank');
                        }}
                      >
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </MapControl>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}