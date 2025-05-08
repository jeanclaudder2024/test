import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  Polyline,
  Rectangle,
  CircleMarker,
  Tooltip,
  Circle,
  ZoomControl
} from 'react-leaflet';
import L, { LatLngExpression, DomUtil, Control, LayerGroup } from 'leaflet';
import { createPortal } from 'react-dom';
import { OptimizedVesselLayer, OptimizedRefineryLayer, OptimizedPortLayer } from './OptimizedMarkerLayer';
import { Vessel, Refinery, Port, RefineryPortConnection } from '@shared/schema';
import { OIL_PRODUCT_TYPES } from '@shared/constants';

// Helper function to generate coordinates for ports
// In a real application, this would be replaced with actual port coordinates from the database
function getRandomCoordinatesForPort(portName: string): [number, number] {
  // Create a deterministic "random" value based on the port name
  let hash = 0;
  for (let i = 0; i < portName.length; i++) {
    hash = ((hash << 5) - hash) + portName.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Use the hash to create a somewhat deterministic latitude and longitude
  // This is just for demonstration - real world would use actual coordinates
  const regions: Record<string, [number, number, number, number]> = {
    'Rotterdam': [51.9225, 4.47917, 0.5, 0.5],
    'Singapore': [1.29027, 103.851, 0.5, 0.5], 
    'Shanghai': [31.2304, 121.474, 0.5, 0.5],
    'Antwerp': [51.2194, 4.40026, 0.5, 0.5],
    'New York': [40.7128, -74.006, 1, 1],
    'Houston': [29.7604, -95.3698, 1, 1],
    'Dubai': [25.2048, 55.2708, 0.5, 0.5],
    'Tokyo': [35.6762, 139.6503, 0.5, 0.5],
    'Hamburg': [53.5511, 9.9937, 0.5, 0.5],
    'Los Angeles': [33.7701, -118.1937, 1, 1]
  };
  
  // Check if this is a known major port
  for (const [key, value] of Object.entries(regions)) {
    if (portName.toLowerCase().includes(key.toLowerCase())) {
      return [value[0], value[1]];
    }
  }
  
  // For ports we don't recognize, create a somewhat random but reasonable coordinate
  // This ensures we stay in ocean regions roughly
  const lat = ((Math.abs(hash % 140) - 70) + 5) % 75; // -65 to +70 degrees latitude
  const lng = ((hash % 360) - 180) % 360; // -180 to +180 degrees longitude
  
  return [lat, lng];
}
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Anchor, Info, Navigation, Flag, Calendar, Ship, 
  Factory, Warehouse, Anchor as AnchorIcon, Sparkles,
  CheckCircle, FileText, MapPin, Layers, RefreshCw, Settings
} from 'lucide-react';
import { AIGenerationPanel } from '@/components/AIGenerationPanel';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
// Import removed - using hardcoded regions instead

// Ensure Leaflet CSS is imported
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Import MarkerCluster for performance optimization
import 'leaflet.markercluster';

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

// Create a custom clustering utility to improve performance
const clusterPoints = (points: Array<{lat: number, lng: number, data: any}>, distance: number = 50) => {
  // If we have few points, don't cluster
  if (points.length < 100) return points.map(p => ({...p, cluster: false}));
  
  const clusters: Array<{
    lat: number, 
    lng: number, 
    count: number, 
    items: Array<{lat: number, lng: number, data: any}>,
    radius: number
  }> = [];
  
  const processed = new Set<number>();
  
  // Process each point
  for (let i = 0; i < points.length; i++) {
    if (processed.has(i)) continue;
    
    const point = points[i];
    processed.add(i);
    
    // Find nearby points
    const nearby: Array<{lat: number, lng: number, data: any, index: number}> = [];
    
    for (let j = 0; j < points.length; j++) {
      if (i === j || processed.has(j)) continue;
      
      const otherPoint = points[j];
      const pointDistance = Math.sqrt(
        Math.pow(point.lat - otherPoint.lat, 2) + 
        Math.pow(point.lng - otherPoint.lng, 2)
      ) * 111; // Rough km conversion
      
      if (pointDistance < distance / 1000) {
        nearby.push({...otherPoint, index: j});
      }
    }
    
    // If we have nearby points, create a cluster
    if (nearby.length > 0) {
      // Mark all nearby points as processed
      nearby.forEach(n => processed.add(n.index));
      
      // Calculate cluster center and radius
      const allPoints = [point, ...nearby.map(n => ({lat: n.lat, lng: n.lng, data: n.data}))];
      const centerLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
      const centerLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;
      
      // Calculate radius - distance from center to furthest point
      const radius = Math.max(...allPoints.map(p => 
        Math.sqrt(Math.pow(centerLat - p.lat, 2) + Math.pow(centerLng - p.lng, 2))
      )) * 111 * 1000; // Convert to meters
      
      clusters.push({
        lat: centerLat,
        lng: centerLng,
        count: allPoints.length,
        items: allPoints,
        radius: Math.max(30, radius) // Minimum 30m radius for visibility
      });
    } else {
      // Single point - add as individual marker
      clusters.push({
        lat: point.lat,
        lng: point.lng,
        count: 1,
        items: [point],
        radius: 20
      });
    }
  }
  
  return clusters;
};

// MapUpdateComponent - handles updating the map when vessels change
interface MapUpdateProps {
  vessels: Vessel[];
}

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

function MapUpdate({ vessels }: MapUpdateProps) {
  const map = useMap();

  useEffect(() => {
    if (vessels.length > 0) {
      // If we have vessels, fit bounds to include all vessels
      const points = vessels.map(vessel => 
        [parseFloat(vessel.currentLat || '0'), parseFloat(vessel.currentLng || '0')] as [number, number]
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
  onRegionClick?: (region: string) => void;
  vesselFilter?: string[];
  companyFilter?: string[];
  showRefineries?: boolean;
  showVessels?: boolean;
  showPorts?: boolean;
}

export default function LiveVesselMap({ 
  initialRegion, 
  height = '600px',
  showRoutes = false,
  showVesselHistory = false,
  showHeatmap = false,
  mapStyle: initialMapStyle = 'dark',
  onRegionClick,
  vesselFilter = [],
  companyFilter = [],
  showRefineries: initialShowRefineries = true,
  showVessels: initialShowVessels = true,
  showPorts: initialShowPorts = true
}: LiveVesselMapProps) {
  const [mapStyle, setMapStyle] = useState<string>(initialMapStyle);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion || 'global');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(3);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showConnections, setShowConnections] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<string>("all");
  const [hoveredVessel, setHoveredVessel] = useState<Vessel | null>(null);
  const [vesselsWithRoutes, setVesselsWithRoutes] = useState<Record<number, boolean>>({});
  const [selectedOilType, setSelectedOilType] = useState<string>("all");
  
  // Apply filters from props
  useEffect(() => {
    setShowRefineries(initialShowRefineries);
    setShowPorts(initialShowPorts);
  }, [initialShowRefineries, initialShowPorts]);
  
  // Use our WebSocket hook for real-time vessel data with fallback to REST API polling
  const { 
    vessels, 
    connected: isConnected, 
    lastUpdated, 
    error: vesselError, 
    loading: vesselsLoading, 
    refreshData: refreshVesselData,
    connectionType: usingFallback
  } = useVesselWebSocket({ 
    region: selectedRegion,
    pollingInterval: 30000, // 30 seconds polling interval for REST API fallback
    loadAllVessels: true // Load all vessels at once for routing visualization
  });
  
  // Use maritime data hook for refineries and ports with their connections
  const {
    refineries,
    ports,
    connections,
    isLoading: infrastructureLoading,
    error: infrastructureError,
    refreshData: refreshInfrastructureData
  } = useMaritimeData({
    region: selectedRegion,
    includeVessels: false, // Already getting vessels from WebSocket
    includeRefineries: showRefineries,
    includePorts: showPorts,
    includeConnections: showConnections,
    pollingInterval: 60000 // 1 minute polling interval
  });

  // Combine errors and loading states
  const error = vesselError || infrastructureError;
  const isLoading = vesselsLoading || infrastructureLoading;

  // Handle region selection change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    // Reset selections when changing regions
    setSelectedVessel(null);
    setSelectedRefinery(null);
    setSelectedPort(null);
    
    // If onRegionClick callback is provided, call it
    if (onRegionClick) {
      onRegionClick(region);
    }
  };
  
  // Function to refresh all data
  const refreshData = () => {
    refreshVesselData();
    refreshInfrastructureData();
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap justify-between items-center mb-4 p-2 bg-card rounded-md">
        <div className="flex items-center space-x-2">
          <Ship className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Maritime Tracking</h2>
          
          {isConnected ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected {usingFallback ? "(REST API)" : "(WebSocket)"}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Reconnecting...
            </Badge>
          )}
          
          {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="middle_east">Middle East</SelectItem>
              <SelectItem value="north_america">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="africa">Africa</SelectItem>
              <SelectItem value="southeast_asia">Southeast Asia</SelectItem>
              <SelectItem value="east_asia">East Asia</SelectItem>
              <SelectItem value="oceania">Oceania</SelectItem>
              <SelectItem value="south_america">South America</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={displayMode} onValueChange={setDisplayMode}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Display Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Maritime Assets</SelectItem>
              <SelectItem value="vessels">Vessels Only</SelectItem>
              <SelectItem value="infrastructure">Infrastructure Only</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedOilType} onValueChange={setSelectedOilType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Oil Type" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-auto">
              <SelectItem value="all">All Oil Types</SelectItem>
              {OIL_PRODUCT_TYPES.map(oilType => (
                <SelectItem key={oilType} value={oilType.toLowerCase()}>
                  {oilType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={(usingFallback ? false : !isConnected) || isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>
      

      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`col-span-1 md:col-span-2 rounded-lg overflow-hidden`} style={{ height }}>
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
                subdomains="abcd"
                maxZoom={19}
              />
            )}
            
            {mapStyle === 'light' && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
            )}
            
            {mapStyle === 'satellite' && (
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            )}
            
            {mapStyle === 'nautical' && (
              <TileLayer
                attribution='Tiles &copy; ESRI &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                maxZoom={16}
              />
            )}
            
            {/* Add heatmap layer for traffic density if enabled */}
            {showHeatmap && (
              <div>
                {/* Placeholder for heatmap - in a real implementation this would be a proper heatmap layer */}
                <Rectangle 
                  bounds={[[-60, -180], [70, 180]]} 
                  pathOptions={{ 
                    fillColor: '#ff9800', 
                    fillOpacity: 0.05, 
                    weight: 0 
                  }} 
                />
              </div>
            )}
            
            {/* Add a MapEvents component to handle fitWorld */}
            <MapEvents />
            
            {/* Floating Map Control Panel with hover to expand */}
            <MapControl position="topright" className="floating-map-control">
              <div className="relative group">
                {/* Control Panel Icon - Always Visible */}
                <div className="absolute right-0 top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-800 cursor-pointer group-hover:opacity-0 transition-opacity duration-300">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                
                {/* Expanded Control Panel - Visible on Hover */}
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100 origin-top-right">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5 text-blue-600" />
                      Region Filter
                    </h3>
                    <Select value={selectedRegion} onValueChange={handleRegionChange}>
                      <SelectTrigger className="w-full text-sm h-8">
                        <SelectValue placeholder="Select Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="middle_east">Middle East</SelectItem>
                        <SelectItem value="north_america">North America</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="africa">Africa</SelectItem>
                        <SelectItem value="southeast_asia">Southeast Asia</SelectItem>
                        <SelectItem value="east_asia">East Asia</SelectItem>
                        <SelectItem value="oceania">Oceania</SelectItem>
                        <SelectItem value="south_america">South America</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <Ship className="h-4 w-4 mr-1.5 text-blue-600" />
                      Oil Type Filter
                    </h3>
                    <Select value={selectedOilType} onValueChange={setSelectedOilType}>
                      <SelectTrigger className="w-full text-sm h-8">
                        <SelectValue placeholder="Select Oil Type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-auto">
                        <SelectItem value="all">All Oil Types</SelectItem>
                        {OIL_PRODUCT_TYPES.map(oilType => (
                          <SelectItem key={oilType} value={oilType.toLowerCase()}>
                            {oilType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <Layers className="h-4 w-4 mr-1.5 text-blue-600" />
                      Map Style
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        variant={mapStyle === 'dark' ? 'default' : 'outline'} 
                        className="text-xs h-8" 
                        onClick={() => setMapStyle('dark')}
                      >
                        Dark
                      </Button>
                      <Button 
                        size="sm" 
                        variant={mapStyle === 'light' ? 'default' : 'outline'} 
                        className="text-xs h-8" 
                        onClick={() => setMapStyle('light')}
                      >
                        Light
                      </Button>
                      <Button 
                        size="sm" 
                        variant={mapStyle === 'satellite' ? 'default' : 'outline'} 
                        className="text-xs h-8" 
                        onClick={() => setMapStyle('satellite')}
                      >
                        Satellite
                      </Button>
                      <Button 
                        size="sm" 
                        variant={mapStyle === 'nautical' ? 'default' : 'outline'} 
                        className="text-xs h-8" 
                        onClick={() => setMapStyle('nautical')}
                      >
                        Nautical
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <Layers className="h-4 w-4 mr-1.5 text-blue-600" />
                      Map Layers
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center cursor-pointer">
                          <Ship className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                          Vessels
                        </label>
                        <Switch 
                          checked={true}
                          disabled={true}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center cursor-pointer">
                          <Factory className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                          Refineries
                        </label>
                        <Switch 
                          checked={showRefineries}
                          onCheckedChange={setShowRefineries}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center cursor-pointer">
                          <AnchorIcon className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                          Ports
                        </label>
                        <Switch 
                          checked={showPorts}
                          onCheckedChange={setShowPorts}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center cursor-pointer">
                          <Warehouse className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                          Connections
                        </label>
                        <Switch 
                          checked={showConnections}
                          onCheckedChange={setShowConnections}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs w-full h-8 flex items-center"
                      onClick={refreshData}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Refresh Data
                    </Button>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-center">
                    <div className={`h-2 w-2 rounded-full mr-1.5 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <p className="text-xs text-muted-foreground">
                      {isConnected 
                        ? `${vessels.length} vessels${usingFallback ? ' (REST API)' : ' (WebSocket)'}`
                        : 'Reconnecting...'}
                    </p>
                  </div>
                </div>
              </div>
            </MapControl>
            
            {/* Display vessel history if enabled */}
            {showVesselHistory && (displayMode === 'all' || displayMode === 'vessels') && 
              (selectedOilType === 'all' 
                ? vessels 
                : vessels.filter(v => 
                    (v.cargoType && v.cargoType.toLowerCase().includes(selectedOilType.toLowerCase())) ||
                    (v.vesselType && v.vesselType.toLowerCase().includes(selectedOilType.toLowerCase()))
                  )
              ).map(vessel => {
              // For demonstration, we'll create synthetic vessel history paths
              // In a real application, this would come from the vessel's actual historical positions
              if (vessel.currentLat && vessel.currentLng) {
                const currentLat = parseFloat(vessel.currentLat);
                const currentLng = parseFloat(vessel.currentLng);
                
                if (isNaN(currentLat) || isNaN(currentLng)) return null;
                
                // Create a simple "wake" pattern behind the vessel using vessel ID to make it deterministic
                const historyPoints: [number, number][] = [];
                
                // Use vessel ID to create a somewhat deterministic pattern
                const vesselIdNum = parseInt(vessel.id.toString());
                const direction = vesselIdNum % 8; // 0-7 for different directions
                const directionMap = [
                  [-0.01, 0], // North
                  [-0.007, 0.007], // Northeast
                  [0, 0.01], // East
                  [0.007, 0.007], // Southeast
                  [0.01, 0], // South
                  [0.007, -0.007], // Southwest
                  [0, -0.01], // West
                  [-0.007, -0.007], // Northwest
                ];
                
                // Use the direction to create history points
                for (let i = 1; i <= 5; i++) {
                  historyPoints.push([
                    currentLat - (directionMap[direction][0] * i),
                    currentLng - (directionMap[direction][1] * i)
                  ]);
                }
                
                // Add current position as first point
                historyPoints.unshift([currentLat, currentLng]);
                
                return (
                  <Polyline
                    key={`history-${vessel.id}`}
                    positions={historyPoints as LatLngExpression[]}
                    pathOptions={{
                      color: '#00ff00',
                      weight: 2,
                      opacity: 0.5,
                      dashArray: '3, 6'
                    }}
                  />
                );
              }
              return null;
            })}
            
            {/* Display vessel routes only for vessels with enabled routes */}
            {(displayMode === 'all' || displayMode === 'vessels') && 
              (selectedOilType === 'all' 
                ? vessels 
                : vessels.filter(v => 
                    (v.cargoType && v.cargoType.toLowerCase().includes(selectedOilType.toLowerCase())) ||
                    (v.vesselType && v.vesselType.toLowerCase().includes(selectedOilType.toLowerCase()))
                  )
              ).map(vessel => {
                // Only show vessels with routes enabled and that have current coordinates
                if (!vesselsWithRoutes[vessel.id] || !vessel.currentLat || !vessel.currentLng) {
                  return null;
                }
                
                // Get current vessel position
                const currentCoords = [
                  parseFloat(vessel.currentLat as string), 
                  parseFloat(vessel.currentLng as string)
                ];
                
                // Check if we have precise route coordinates
                const hasDepartureCoords = vessel.departureLat && vessel.departureLng;
                const hasDestinationCoords = vessel.destinationLat && vessel.destinationLng;
                
                // Get departure coordinates (precise or fallback)
                let departureCoords = null;
                if (hasDepartureCoords) {
                  departureCoords = [
                    parseFloat(vessel.departureLat as string), 
                    parseFloat(vessel.departureLng as string)
                  ];
                } else if (vessel.departurePort) {
                  departureCoords = getRandomCoordinatesForPort(vessel.departurePort);
                }
                
                // Get destination coordinates (precise or fallback)
                let destinationCoords = null;
                if (hasDestinationCoords) {
                  destinationCoords = [
                    parseFloat(vessel.destinationLat as string), 
                    parseFloat(vessel.destinationLng as string)
                  ];
                } else if (vessel.destinationPort) {
                  destinationCoords = getRandomCoordinatesForPort(vessel.destinationPort);
                }
                
                return (
                  <div key={`route-${vessel.id}`} style={{ display: 'contents' }}>
                    {/* Past route (from departure to current position) */}
                    {departureCoords && (
                      <Polyline 
                        positions={[
                          [departureCoords[0], departureCoords[1]] as LatLngExpression,
                          [currentCoords[0], currentCoords[1]] as LatLngExpression
                        ]}
                        pathOptions={{ 
                          color: '#3388ff', 
                          weight: 2, 
                          opacity: 0.6,
                          dashArray: '6, 8'
                        }}
                      />
                    )}
                    
                    {/* Future route (from current position to destination) */}
                    {destinationCoords && (
                      <Polyline 
                        positions={[
                          [currentCoords[0], currentCoords[1]] as LatLngExpression,
                          [destinationCoords[0], destinationCoords[1]] as LatLngExpression
                        ]}
                        pathOptions={{ 
                          color: '#ff3366', 
                          weight: 2, 
                          opacity: 0.4,
                          dashArray: '3, 6'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            
            {/* Custom Performance Optimized Rendering with Viewport-Based Loading */}
            
            {/* Vessels with optimized rendering and clustering */}
            {(displayMode === 'all' || displayMode === 'vessels') && initialShowVessels && (
              <OptimizedVesselLayer 
                vessels={vessels.filter(vessel => {
                  // Start with base filter for oil type from dropdown
                  const matchesOilType = selectedOilType === 'all' ||
                    (vessel.cargoType && vessel.cargoType.toLowerCase().includes(selectedOilType.toLowerCase())) ||
                    (vessel.vesselType && vessel.vesselType.toLowerCase().includes(selectedOilType.toLowerCase()));
                    
                  // Apply additional product type filter from props
                  const matchesProductFilter = !vesselFilter || vesselFilter.length === 0 ||
                    vesselFilter.some(filter => 
                      vessel.cargoType?.toLowerCase().includes(filter.toLowerCase())
                    );
                    
                  // Apply company filter from props
                  const matchesCompanyFilter = !companyFilter || companyFilter.length === 0 ||
                    companyFilter.some(company => 
                      (vessel.buyerName && vessel.buyerName.toLowerCase().includes(company.toLowerCase())) ||
                      (vessel.sellerName && vessel.sellerName.toLowerCase().includes(company.toLowerCase()))
                    );
                    
                  // Vessel must match all active filters
                  return matchesOilType && matchesProductFilter && matchesCompanyFilter;
                })}
                onVesselSelect={(vessel) => {
                  setSelectedVessel(vessel);
                  setSelectedRefinery(null);
                  setSelectedPort(null);
                }}
                vesselsWithRoutes={vesselsWithRoutes}
                setVesselsWithRoutes={setVesselsWithRoutes}
              />
            )}
            
            {/* Refineries with optimized rendering */}
            {showRefineries && (displayMode === 'all' || displayMode === 'infrastructure') && (
              <OptimizedRefineryLayer
                refineries={refineries}
                onRefinerySelect={(refinery) => {
                  setSelectedRefinery(refinery);
                  setSelectedVessel(null);
                  setSelectedPort(null);
                }}
              />
            )}
            
            {/* Ports with optimized rendering */}
            {showPorts && (displayMode === 'all' || displayMode === 'infrastructure') && (
              <OptimizedPortLayer
                ports={ports}
                onPortSelect={(port) => {
                  setSelectedPort(port);
                  setSelectedVessel(null);
                  setSelectedRefinery(null);
                }}
              />
            )}
            
            {/* Display connections between refineries and ports */}
            {showConnections && (displayMode === 'all' || displayMode === 'infrastructure') && connections.map(conn => {
              const refinery = refineries.find(r => r.id === conn.refineryId);
              const port = ports.find(p => p.id === conn.portId);
              
              if (!refinery || !port || !refinery.lat || !refinery.lng || !port.lat || !port.lng) {
                return null;
              }
              
              const refineryLat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat;
              const refineryLng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng;
              const portLat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
              const portLng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
              
              if (isNaN(refineryLat) || isNaN(refineryLng) || isNaN(portLat) || isNaN(portLng)) {
                return null;
              }
              
              // Generate a slightly curved line for better visualization
              // Calculate midpoint
              const midLat = (refineryLat + portLat) / 2;
              const midLng = (refineryLng + portLng) / 2;
              
              // Add a slight offset to create a curve
              const latOffset = (refineryLng - portLng) * 0.1;
              const lngOffset = (portLat - refineryLat) * 0.1;
              const curvedMidLat = midLat + latOffset;
              const curvedMidLng = midLng + lngOffset;
              
              // Create positions array with the midpoint
              const positions: L.LatLngExpression[] = [
                [refineryLat, refineryLng] as L.LatLngTuple,
                [curvedMidLat, curvedMidLng] as L.LatLngTuple,
                [portLat, portLng] as L.LatLngTuple
              ];
              
              return (
                <Polyline
                  key={`connection-${conn.id}`}
                  positions={positions}
                  color="#9c27b0"
                  weight={2}
                  opacity={0.7}
                  dashArray="5,5"
                />
              );
            })}
            
            <MapUpdate vessels={vessels} />
          </MapContainer>
        </div>
        
        <div className="col-span-1 flex flex-col space-y-4" style={{ maxHeight: height, overflowY: 'auto' }}>
          {/* Vessel Details */}
          {selectedVessel ? (
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-100 text-blue-700 mb-2 hover:bg-blue-200">{selectedVessel.vesselType}</Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                </div>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Ship className="h-5 w-5 text-blue-600" />
                  {selectedVessel.name}
                </CardTitle>
                <CardDescription className="text-blue-600">
                  {selectedVessel.flag} • IMO: {selectedVessel.imo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <Tabs defaultValue="voyage" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="voyage" className="flex gap-1 items-center text-xs">
                      <Navigation className="h-3 w-3" /> Voyage
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex gap-1 items-center text-xs">
                      <Info className="h-3 w-3" /> Details
                    </TabsTrigger>
                    <TabsTrigger value="position" className="flex gap-1 items-center text-xs">
                      <MapPin className="h-3 w-3" /> Position
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex gap-1 items-center text-xs">
                      <FileText className="h-3 w-3" /> Docs
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="voyage" className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center space-y-1">
                          <div className="flex flex-col items-center">
                            <AnchorIcon className="h-4 w-4 text-blue-600 mb-1" />
                            <span className="text-xs text-muted-foreground">Origin</span>
                          </div>
                          <div className="font-semibold text-sm">{selectedVessel.departurePort || 'Unknown'}</div>
                          {selectedVessel.departureDate && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(selectedVessel.departureDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 px-4">
                          <div className="h-0.5 w-full bg-gradient-to-r from-blue-200 via-primary to-red-200 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full h-3 w-3"></div>
                          </div>
                        </div>
                        
                        <div className="text-center space-y-1">
                          <div className="flex flex-col items-center">
                            <AnchorIcon className="h-4 w-4 text-red-600 mb-1" />
                            <span className="text-xs text-muted-foreground">Destination</span>
                          </div>
                          <div className="font-semibold text-sm">{selectedVessel.destinationPort || 'Unknown'}</div>
                          {selectedVessel.eta && (
                            <div className="text-xs text-muted-foreground">
                              ETA: {new Date(selectedVessel.eta).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm bg-blue-50 rounded-md p-3">
                        <div className="font-medium text-slate-700">Cargo Type:</div>
                        <div>{selectedVessel.cargoType || 'Unknown'}</div>
                        
                        <div className="font-medium text-slate-700">Amount:</div>
                        <div>
                          {selectedVessel.cargoCapacity 
                            ? selectedVessel.cargoCapacity.toLocaleString() + ' tons capacity' 
                            : 'Unknown'}
                        </div>
                        
                        <div className="font-medium text-slate-700">Status:</div>
                        <div className="flex items-center">
                          <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                          <span>In Transit</span>
                        </div>
                        
                        <div className="font-medium text-slate-700">Progress:</div>
                        <div className="flex items-center">
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="pt-4">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm bg-slate-50 rounded-md p-3">
                      <div className="font-medium text-slate-700">IMO Number:</div>
                      <div>{selectedVessel.imo}</div>
                      
                      <div className="font-medium text-slate-700">MMSI:</div>
                      <div>{selectedVessel.mmsi}</div>
                      
                      <div className="font-medium text-slate-700">Flag:</div>
                      <div className="flex items-center gap-1">
                        <Flag className="h-3 w-3 text-blue-600" />
                        {selectedVessel.flag}
                      </div>
                      
                      <div className="font-medium text-slate-700">Vessel Type:</div>
                      <div className="capitalize">{selectedVessel.vesselType}</div>
                      
                      {selectedVessel.built && (
                        <>
                          <div className="font-medium text-slate-700">Built:</div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-600" />
                            {selectedVessel.built}
                          </div>
                        </>
                      )}
                      
                      {selectedVessel.deadweight && (
                        <>
                          <div className="font-medium text-slate-700">Deadweight:</div>
                          <div>{selectedVessel.deadweight.toLocaleString()} tons</div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="position" className="pt-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm bg-green-50 rounded-md p-3">
                        {selectedVessel.currentLat && selectedVessel.currentLng && (
                          <>
                            <div className="font-medium text-slate-700">Coordinates:</div>
                            <div>
                              {parseFloat(selectedVessel.currentLat).toFixed(4)}, {parseFloat(selectedVessel.currentLng).toFixed(4)}
                            </div>
                          </>
                        )}
                        
                        {selectedVessel.metadata && (() => {
                          try {
                            const metadata = JSON.parse(selectedVessel.metadata);
                            return (
                              <>
                                <div className="font-medium text-slate-700">Course:</div>
                                <div>{metadata.course || 0}°</div>
                                
                                <div className="font-medium text-slate-700">Speed:</div>
                                <div>{metadata.speed || 0} knots</div>
                                
                                <div className="font-medium text-slate-700">Navigation Status:</div>
                                <div className="flex items-center">
                                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                                  <span>{metadata.status || 'Under way'}</span>
                                </div>
                              </>
                            );
                          } catch (e) {
                            return null;
                          }
                        })()}
                        
                        <div className="font-medium text-slate-700">Last Update:</div>
                        <div className="text-xs">{new Date().toLocaleString()}</div>
                      </div>
                      
                      <div className="text-xs text-slate-500">
                        <p className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> 
                          Vessel position data verified and validated by AIS
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="pt-4">
                    <div className="space-y-2">
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="text-xs text-amber-700 mb-2">
                          No documents are currently associated with this vessel. Generate required documentation:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-8"
                            onClick={() => window.alert('Document generation feature will open in a dedicated panel')}
                          >
                            <FileText className="h-3 w-3 mr-1" /> Bill of Lading
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-8"
                            onClick={() => window.alert('Document generation feature will open in a dedicated panel')}
                          >
                            <FileText className="h-3 w-3 mr-1" /> Cargo Manifest
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-8"
                            onClick={() => window.alert('Document generation feature will open in a dedicated panel')}
                          >
                            <FileText className="h-3 w-3 mr-1" /> Certificate of Origin
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-8"
                            onClick={() => window.alert('Document generation feature will open in a dedicated panel')}
                          >
                            <FileText className="h-3 w-3 mr-1" /> Commercial Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="bg-gradient-to-t from-blue-50 to-white border-t border-blue-100 flex flex-col gap-2">
                <div className="w-full flex gap-2">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => {
                      window.location.href = `/vessels/${selectedVessel.id}`;
                    }}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Full Details
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedVessel(null)}
                  >
                    Close
                  </Button>
                </div>
                
                <Button 
                  onClick={() => {
                    // Toggle route visibility for this vessel
                    setVesselsWithRoutes(prev => ({
                      ...prev,
                      [selectedVessel.id]: !prev[selectedVessel.id]
                    }));
                  }}
                  className="w-full flex items-center justify-center gap-2"
                  variant={vesselsWithRoutes[selectedVessel.id] ? "default" : "outline"}
                >
                  <Navigation className="h-4 w-4" /> 
                  {vesselsWithRoutes[selectedVessel.id] ? "Hide Route on Map" : "Show Route on Map"}
                </Button>
              </CardFooter>
            </Card>
          ) : selectedRefinery ? (
            /* Refinery Details */
            <Card>
              <CardContent className="pt-6">
                <div className="bg-red-50 p-3 rounded-md mb-4 border-l-4 border-red-500 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-red-800">{selectedRefinery.name}</h3>
                    <p className="text-sm text-red-600">{selectedRefinery.region.toUpperCase()} REGION</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-sm">Refinery</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                  <div className="flex items-center">
                    <Factory className="h-4 w-4 mr-2" />
                    <span className="text-muted-foreground">Country:</span>
                  </div>
                  <div>{selectedRefinery.country}</div>
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Region:</span>
                  </div>
                  <div>{selectedRefinery.region}</div>
                  
                  {selectedRefinery.capacity && (
                    <>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">Capacity:</span>
                      </div>
                      <div>{selectedRefinery.capacity.toLocaleString()} bpd</div>
                    </>
                  )}
                  
                  {selectedRefinery.status && (
                    <>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">Status:</span>
                      </div>
                      <div>{selectedRefinery.status}</div>
                    </>
                  )}
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Location:</span>
                  </div>
                  <div>
                    {(() => {
                      const lat = selectedRefinery.lat;
                      if (typeof lat === 'string') return parseFloat(lat).toFixed(4);
                      if (typeof lat === 'number') return lat.toFixed(4);
                      return '0.0000';
                    })()}, 
                    {(() => {
                      const lng = selectedRefinery.lng;
                      if (typeof lng === 'string') return parseFloat(lng).toFixed(4);
                      if (typeof lng === 'number') return lng.toFixed(4);
                      return '0.0000';
                    })()}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h4 className="font-semibold mb-2">Connected Ports</h4>
                
                {connections
                  .filter(conn => conn.refineryId === selectedRefinery.id)
                  .map(conn => {
                    const port = ports.find(p => p.id === conn.portId);
                    if (!port) return null;
                    
                    return (
                      <div 
                        key={`conn-${conn.id}`} 
                        className="p-2 mb-2 rounded border border-purple-200 bg-purple-50"
                        onClick={() => setSelectedPort(port)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="font-medium text-sm flex items-center">
                          <AnchorIcon className="h-3 w-3 mr-1 text-blue-600" />
                          {port.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{port.country}</div>
                      </div>
                    );
                  })
                }
                
                {connections.filter(conn => conn.refineryId === selectedRefinery.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">No connected ports found</p>
                )}
                
                <Separator className="my-4" />
                
                {/* AI Description Generation Panel */}
                <AIGenerationPanel
                  entityType="refinery"
                  entityId={selectedRefinery.id}
                  entityName={selectedRefinery.name}
                  currentDescription={selectedRefinery.description}
                  onDescriptionGenerated={(description) => {
                    // Update the selected refinery with the new description
                    setSelectedRefinery({
                      ...selectedRefinery,
                      description: description
                    });
                    refreshInfrastructureData();
                  }}
                />
              </CardContent>
            </Card>
          ) : selectedPort ? (
            /* Port Details */
            <Card>
              <CardContent className="pt-6">
                <div className="bg-blue-50 p-3 rounded-md mb-4 border-l-4 border-blue-500 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-blue-800">{selectedPort.name}</h3>
                    <p className="text-sm text-blue-600">{selectedPort.region.toUpperCase()} REGION</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm">Port</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                  <div className="flex items-center">
                    <AnchorIcon className="h-4 w-4 mr-2" />
                    <span className="text-muted-foreground">Country:</span>
                  </div>
                  <div>{selectedPort.country}</div>
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Region:</span>
                  </div>
                  <div>{selectedPort.region}</div>
                  
                  {selectedPort.capacity && (
                    <>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">Capacity:</span>
                      </div>
                      <div>{selectedPort.capacity.toLocaleString()} tons/year</div>
                    </>
                  )}
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Location:</span>
                  </div>
                  <div>
                    {(() => {
                      const lat = selectedPort.lat;
                      if (typeof lat === 'string') return parseFloat(lat).toFixed(4);
                      if (typeof lat === 'number') return lat.toFixed(4);
                      return '0.0000';
                    })()}, 
                    {(() => {
                      const lng = selectedPort.lng;
                      if (typeof lng === 'string') return parseFloat(lng).toFixed(4);
                      if (typeof lng === 'number') return lng.toFixed(4);
                      return '0.0000';
                    })()}
                  </div>
                </div>
                
                {selectedPort.description && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm">{selectedPort.description}</p>
                  </>
                )}
                
                <Separator className="my-4" />
                
                <h4 className="font-semibold mb-2">Connected Refineries</h4>
                
                {connections
                  .filter(conn => conn.portId === selectedPort.id)
                  .map(conn => {
                    const refinery = refineries.find(r => r.id === conn.refineryId);
                    if (!refinery) return null;
                    
                    return (
                      <div 
                        key={`conn-${conn.id}`} 
                        className="p-2 mb-2 rounded border border-red-200 bg-red-50"
                        onClick={() => setSelectedRefinery(refinery)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="font-medium text-sm flex items-center">
                          <Factory className="h-3 w-3 mr-1 text-red-600" />
                          {refinery.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{refinery.country}</div>
                      </div>
                    );
                  })
                }
                
                {connections.filter(conn => conn.portId === selectedPort.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">No connected refineries found</p>
                )}
                
                <Separator className="my-4" />
                
                {/* AI Description Generation Panel */}
                <AIGenerationPanel
                  entityType="port"
                  entityId={selectedPort.id}
                  entityName={selectedPort.name}
                  currentDescription={selectedPort.description}
                  onDescriptionGenerated={(description) => {
                    // Update the selected port with the new description
                    setSelectedPort({
                      ...selectedPort,
                      description: description
                    });
                    refreshInfrastructureData();
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            /* No Selection - Summary Card */
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Maritime Assets</h3>
                <p className="text-muted-foreground mb-4">Select an item on the map to view details</p>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-2 text-center">
                    <div className="text-lg font-semibold text-blue-700">{vessels.length}</div>
                    <div className="text-xs text-blue-600">Vessels</div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-100 rounded-md p-2 text-center">
                    <div className="text-lg font-semibold text-red-700">{refineries.length}</div>
                    <div className="text-xs text-red-600">Refineries</div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-2 text-center">
                    <div className="text-lg font-semibold text-blue-700">{ports.length}</div>
                    <div className="text-xs text-blue-600">Ports</div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  {lastUpdated 
                    ? `Last updated: ${new Date(lastUpdated).toLocaleString()}`
                    : 'Waiting for data...'}
                </p>
                
                {/* Connection status indicator */}
                <div className="mt-2 flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <p className="text-xs text-muted-foreground">
                    {isConnected 
                      ? `Using ${usingFallback ? 'REST API' : 'WebSocket'} ${usingFallback ? '(fallback)' : '(real-time)'}`
                      : 'Reconnecting...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tabs for Lists */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="vessels">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="vessels" className="flex-1">
                    <Ship className="h-4 w-4 mr-1" />
                    Vessels
                  </TabsTrigger>
                  <TabsTrigger value="refineries" className="flex-1">
                    <Factory className="h-4 w-4 mr-1" />
                    Refineries
                  </TabsTrigger>
                  <TabsTrigger value="ports" className="flex-1">
                    <AnchorIcon className="h-4 w-4 mr-1" />
                    Ports
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="vessels">
                  <h3 className="text-lg font-semibold mb-2">Vessels List</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Showing {vessels.length} vessels in {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1).replace('_', ' ')}
                  </p>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {vessels.slice(0, 20).map((vessel) => (
                      <div 
                        key={vessel.id}
                        className={`p-2 rounded-md cursor-pointer hover:bg-accent ${
                          selectedVessel?.id === vessel.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          window.location.href = `/vessels/${vessel.id}`;
                        }}
                      >
                        <div className="font-medium">{vessel.name}</div>
                        <div className="text-xs flex justify-between">
                          <span>{vessel.vesselType}</span>
                          <span>IMO: {vessel.imo}</span>
                        </div>
                      </div>
                    ))}
                    
                    {vessels.length > 20 && (
                      <p className="text-xs text-center text-muted-foreground pt-2">
                        + {vessels.length - 20} more vessels
                      </p>
                    )}
                    
                    {vessels.length === 0 && !isLoading && (
                      <p className="text-sm text-muted-foreground">
                        No vessels found in this region
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="refineries">
                  <h3 className="text-lg font-semibold mb-2">Refineries List</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Showing {refineries.length} refineries in {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1).replace('_', ' ')}
                  </p>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {refineries.map((refinery) => (
                      <div 
                        key={refinery.id}
                        className={`p-2 rounded-md cursor-pointer hover:bg-accent ${
                          selectedRefinery?.id === refinery.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          window.location.href = `/refineries/${refinery.id}`;
                        }}
                      >
                        <div className="font-medium">{refinery.name}</div>
                        <div className="text-xs flex justify-between">
                          <span>{refinery.country}</span>
                          {refinery.capacity && <span>{refinery.capacity.toLocaleString()} bpd</span>}
                        </div>
                      </div>
                    ))}
                    
                    {refineries.length === 0 && !infrastructureLoading && (
                      <p className="text-sm text-muted-foreground">
                        No refineries found in this region
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="ports">
                  <h3 className="text-lg font-semibold mb-2">Ports List</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Showing {ports.length} ports in {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1).replace('_', ' ')}
                  </p>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ports.map((port) => (
                      <div 
                        key={port.id}
                        className={`p-2 rounded-md cursor-pointer hover:bg-accent ${
                          selectedPort?.id === port.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          window.location.href = `/ports/${port.id}`;
                        }}
                      >
                        <div className="font-medium">{port.name}</div>
                        <div className="text-xs flex justify-between">
                          <span>{port.country}</span>
                        </div>
                      </div>
                    ))}
                    
                    {ports.length === 0 && !infrastructureLoading && (
                      <p className="text-sm text-muted-foreground">
                        No ports found in this region
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}