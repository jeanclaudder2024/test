import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Map, { 
  Source, 
  Layer, 
  Popup, 
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
  ScaleControl,
  ViewStateChangeEvent as ViewState,
  ControlPosition
} from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'mapbox-gl';

// Use a type alias for the event to fix TypeScript errors
type ViewStateChangeEvent = ViewState;
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Vessel, Refinery, Port } from '@shared/schema';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { 
  Loader2, Info, Navigation, Ship, 
  Factory, Anchor as AnchorIcon, MapPin, Route,
  Layers, Sun, Moon, MoonStar, Filter, 
  List, BarChart3, Gauge, ArrowRightCircle,
  Eye, EyeOff
} from 'lucide-react';

// Access token from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Map style options
const mapStyles = {
  dark: 'mapbox://styles/mapbox/dark-v11', // Dark theme
  light: 'mapbox://styles/mapbox/light-v11', // Light theme
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite view 
  nautical: 'mapbox://styles/mapbox/navigation-day-v1' // Nautical chart
};

// Layer IDs
const VESSEL_POINTS_LAYER = 'vessel-points';
const VESSEL_CLUSTERS_LAYER = 'vessel-clusters';
const VESSEL_CLUSTER_COUNT_LAYER = 'vessel-cluster-count';
const VESSEL_HEAT_LAYER = 'vessel-heat';
const REFINERY_POINTS_LAYER = 'refinery-points';
const PORT_POINTS_LAYER = 'port-points';
const VESSEL_ROUTES_LAYER = 'vessel-routes';

// Interface for component props
interface EnhancedMapboxMapProps {
  initialRegion?: string;
  height?: string;
  showRoutes?: boolean;
  showVesselHistory?: boolean;
  showHeatmap?: boolean;
  mapStyle?: 'dark' | 'light' | 'satellite' | 'nautical';
  initialCenterLat?: number;
  initialCenterLng?: number;
  initialZoom?: number;
}

// Get vessel color based on type
const getVesselColor = (type: string | undefined): string => {
  if (!type) return '#FF6F00'; // Default orange
  
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('crude')) return '#e53935'; // Red for crude oil tankers
  if (lowerType.includes('lng')) return '#43a047'; // Green for LNG carriers
  if (lowerType.includes('lpg')) return '#ffb300'; // Amber for LPG carriers
  if (lowerType.includes('product')) return '#1e88e5'; // Blue for product tankers
  if (lowerType.includes('chemical')) return '#8e24aa'; // Purple for chemical tankers
  
  return '#FF6F00'; // Default orange for oil-related vessels
};

// Generate a vessel icon for mapbox
const generateVesselIcon = (vessel: Vessel): mapboxgl.Expression => {
  // Add more rules for icon sizing, etc. if needed
  return [
    'case',
    ['==', ['get', 'vesselType'], 'crude oil tanker'], 'crude-tanker',
    ['==', ['get', 'vesselType'], 'lng carrier'], 'lng-carrier',
    ['==', ['get', 'vesselType'], 'lpg carrier'], 'lpg-carrier',
    ['==', ['get', 'vesselType'], 'product tanker'], 'product-tanker',
    ['==', ['get', 'vesselType'], 'chemical tanker'], 'chemical-tanker',
    'oil-tanker' // default
  ];
};

// Format vessel metadata for popup display
const formatVesselMetadata = (vessel: Vessel): JSX.Element => {
  // Try to parse metadata JSON if it exists
  let metadata: any = {};
  try {
    if (vessel.metadata) {
      metadata = JSON.parse(vessel.metadata);
    }
  } catch (e) {
    console.error('Failed to parse vessel metadata:', e);
  }
  
  return (
    <div className="text-sm space-y-2">
      <div className="bg-blue-50 p-2 rounded-md mb-2 border-l-4 border-blue-500">
        <p className="font-bold text-base text-blue-700">{vessel.name}</p>
        <p className="text-xs text-blue-600">{vessel.vesselType?.toUpperCase()}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="font-semibold">IMO:</div>
        <div>{vessel.imo || 'N/A'}</div>
        
        <div className="font-semibold">MMSI:</div>
        <div>{vessel.mmsi || 'N/A'}</div>
        
        <div className="font-semibold">Flag:</div>
        <div>{vessel.flag || 'N/A'}</div>
        
        <div className="font-semibold">Speed:</div>
        <div>{metadata.speed || '0'} knots</div>
        
        <div className="font-semibold">Course:</div>
        <div>{metadata.course || metadata.heading || '0'}°</div>
        
        {vessel.cargoType && (
          <>
            <div className="font-semibold">Cargo:</div>
            <div>{vessel.cargoType}</div>
          </>
        )}
      </div>
    </div>
  );
};

// Main component
export default function EnhancedMapboxMap({
  initialRegion = 'global',
  height = '600px',
  showRoutes = false,
  showVesselHistory = false,
  showHeatmap = false,
  mapStyle: initialMapStyle = 'dark',
  initialCenterLat = 20,
  initialCenterLng = 0,
  initialZoom = 2
}: EnhancedMapboxMapProps) {
  // References
  const mapRef = useRef<MapRef | null>(null);
  
  // State
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite' | 'nautical'>(initialMapStyle);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [popupCoords, setPopupCoords] = useState<[number, number] | null>(null);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [filterVesselType, setFilterVesselType] = useState<string | null>(null);
  const [viewState, setViewState] = useState({
    longitude: initialCenterLng,
    latitude: initialCenterLat,
    zoom: initialZoom,
    bearing: 0,
    pitch: 0
  });
  
  // Use WebSocket hook for real-time vessel data
  const { 
    vessels, 
    connected: isConnected, 
    lastUpdated, 
    error: vesselError, 
    loading: vesselsLoading,
    totalCount
  } = useVesselWebSocket({ 
    region: selectedRegion,
    loadAllVessels: true,
    pageSize: 500
  });
  
  // Use maritime data hook for refineries, ports, etc.
  const { 
    refineries,
    ports,
    loading: infrastructureLoading,
    error: infrastructureError
  } = useMaritimeData({ region: selectedRegion });
  
  // Prepare GeoJSON data for vessels
  const vesselGeoJson = useMemo(() => {
    const features = vessels
      .filter(vessel => vessel.currentLat && vessel.currentLng && !isNaN(Number(vessel.currentLat)) && !isNaN(Number(vessel.currentLng)))
      .map(vessel => ({
        type: 'Feature' as const,
        properties: {
          id: vessel.id,
          name: vessel.name,
          vesselType: vessel.vesselType || 'oil tanker',
          mmsi: vessel.mmsi,
          imo: vessel.imo,
          flag: vessel.flag,
          color: getVesselColor(vessel.vesselType),
          cargoType: vessel.cargoType,
          deadweight: vessel.deadweight,
          vessel: JSON.stringify(vessel)
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [
            parseFloat(String(vessel.currentLng)),
            parseFloat(String(vessel.currentLat))
          ]
        }
      }));

    return {
      type: 'FeatureCollection' as const,
      features
    };
  }, [vessels]);
  
  // Prepare GeoJSON data for refineries
  const refineryGeoJson = useMemo(() => {
    const features = refineries
      .filter(refinery => refinery.lat && refinery.lng && !isNaN(Number(refinery.lat)) && !isNaN(Number(refinery.lng)))
      .map(refinery => ({
        type: 'Feature' as const,
        properties: {
          id: refinery.id,
          name: refinery.name,
          country: refinery.country,
          region: refinery.region,
          status: refinery.status,
          capacity: refinery.capacity,
          color: '#e53935', // Red for refineries
          refinery: JSON.stringify(refinery)
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [
            parseFloat(String(refinery.lng)),
            parseFloat(String(refinery.lat))
          ]
        }
      }));

    return {
      type: 'FeatureCollection' as const,
      features
    };
  }, [refineries]);
  
  // Prepare GeoJSON data for ports
  const portGeoJson = useMemo(() => {
    const features = ports
      .filter(port => port.lat && port.lng && !isNaN(Number(port.lat)) && !isNaN(Number(port.lng)))
      .map(port => ({
        type: 'Feature' as const,
        properties: {
          id: port.id,
          name: port.name,
          country: port.country,
          region: port.region,
          portType: port.portType,
          capacity: port.capacity,
          color: '#2196f3', // Blue for ports
          port: JSON.stringify(port)
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [
            parseFloat(String(port.lng)),
            parseFloat(String(port.lat))
          ]
        }
      }));

    return {
      type: 'FeatureCollection' as const,
      features
    };
  }, [ports]);
  
  // Add vessel routes if needed
  const vesselRoutesGeoJson = useMemo(() => {
    if (!showRoutes || !selectedVessel) return null;
    
    // For now, we'll create a simple linear route from origin to destination
    // In a real app, this would include actual route coordinates
    const origin = selectedVessel.currentLat && selectedVessel.currentLng 
      ? [parseFloat(String(selectedVessel.currentLng)), parseFloat(String(selectedVessel.currentLat))]
      : null;
    
    const destination = selectedVessel.destinationLat && selectedVessel.destinationLng 
      ? [parseFloat(String(selectedVessel.destinationLng)), parseFloat(String(selectedVessel.destinationLat))]
      : null;
    
    if (!origin || !destination) return null;
    
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {
            id: `route-${selectedVessel.id}`,
            vesselId: selectedVessel.id,
            vesselName: selectedVessel.name
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: [origin, destination]
          }
        }
      ]
    };
  }, [selectedVessel, showRoutes]);
  
  // Handle clicks on the map
  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    // Check if clicking on a vessel
    const vesselFeatures = mapRef.current?.queryRenderedFeatures(event.point, {
      layers: [VESSEL_POINTS_LAYER]
    });
    
    // Check if clicking on a refinery
    const refineryFeatures = mapRef.current?.queryRenderedFeatures(event.point, {
      layers: [REFINERY_POINTS_LAYER]
    });
    
    // Check if clicking on a port
    const portFeatures = mapRef.current?.queryRenderedFeatures(event.point, {
      layers: [PORT_POINTS_LAYER]
    });
    
    // Check if clicking on a cluster
    const clusterFeatures = mapRef.current?.queryRenderedFeatures(event.point, {
      layers: [VESSEL_CLUSTERS_LAYER]
    });
    
    // Priority: Vessel > Refinery > Port > Cluster > Nothing (close popups)
    if (vesselFeatures && vesselFeatures.length > 0) {
      const feature = vesselFeatures[0];
      const vesselJson = feature.properties?.vessel;
      
      if (vesselJson) {
        try {
          const vessel = JSON.parse(vesselJson) as Vessel;
          setSelectedVessel(vessel);
          setSelectedRefinery(null);
          setSelectedPort(null);
          setPopupCoords([
            parseFloat(String(vessel.currentLng)), 
            parseFloat(String(vessel.currentLat))
          ]);
        } catch (e) {
          console.error('Failed to parse vessel data:', e);
        }
      }
    } else if (refineryFeatures && refineryFeatures.length > 0) {
      const feature = refineryFeatures[0];
      const refineryJson = feature.properties?.refinery;
      
      if (refineryJson) {
        try {
          const refinery = JSON.parse(refineryJson) as Refinery;
          setSelectedRefinery(refinery);
          setSelectedVessel(null);
          setSelectedPort(null);
          setPopupCoords([
            parseFloat(String(refinery.lng)), 
            parseFloat(String(refinery.lat))
          ]);
        } catch (e) {
          console.error('Failed to parse refinery data:', e);
        }
      }
    } else if (portFeatures && portFeatures.length > 0) {
      const feature = portFeatures[0];
      const portJson = feature.properties?.port;
      
      if (portJson) {
        try {
          const port = JSON.parse(portJson) as Port;
          setSelectedPort(port);
          setSelectedRefinery(null);
          setSelectedVessel(null);
          setPopupCoords([
            parseFloat(String(port.lng)), 
            parseFloat(String(port.lat))
          ]);
        } catch (e) {
          console.error('Failed to parse port data:', e);
        }
      }
    } else if (clusterFeatures && clusterFeatures.length > 0) {
      // Handle clicking on a cluster - zoom in
      const feature = clusterFeatures[0];
      const clusterId = feature.properties?.cluster_id;
      
      if (mapRef.current && clusterId) {
        const source = mapRef.current.getSource(`vessels-source`);
        
        if (source && 'getClusterExpansionZoom' in source) {
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !mapRef.current) return;
            
            mapRef.current.easeTo({
              center: (feature.geometry as any).coordinates,
              zoom: zoom + 1
            });
          });
        }
      }
    } else {
      // Clicked on empty space - close all popups
      setSelectedVessel(null);
      setSelectedRefinery(null);
      setSelectedPort(null);
      setPopupCoords(null);
    }
  }, []);
  
  // Handle view state changes (zoom, pan, etc.)
  const handleViewStateChange = useCallback((event: ViewStateChangeEvent) => {
    setViewState(event.viewState);
  }, []);
  
  // Load images for custom markers when map loads
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    
    // Load vessel icon images
    map.loadImage('/assets/crude-tanker.png', (error, image) => {
      if (error) throw error;
      if (image && !map.hasImage('crude-tanker')) map.addImage('crude-tanker', image);
    });
    
    map.loadImage('/assets/oil-tanker.png', (error, image) => {
      if (error) throw error;
      if (image && !map.hasImage('oil-tanker')) map.addImage('oil-tanker', image);
    });
    
    map.loadImage('/assets/lng-carrier.png', (error, image) => {
      if (error) throw error;
      if (image && !map.hasImage('lng-carrier')) map.addImage('lng-carrier', image);
    });
    
    map.loadImage('/assets/lpg-carrier.png', (error, image) => {
      if (error) throw error;
      if (image && !map.hasImage('lpg-carrier')) map.addImage('lpg-carrier', image);
    });
    
    map.loadImage('/assets/product-tanker.png', (error, image) => {
      if (error) throw error;
      if (image && !map.hasImage('product-tanker')) map.addImage('product-tanker', image);
    });
    
    map.loadImage('/assets/chemical-tanker.png', (error, image) => {
      if (error) throw error;
      if (image && !map.hasImage('chemical-tanker')) map.addImage('chemical-tanker', image);
    });
    
    map.loadImage('/assets/refinery.png', (error, image) => {
      if (error) throw error;
      if (image && !map.hasImage('refinery')) map.addImage('refinery', image);
    });
    
    map.loadImage('/assets/port.png', (error, image) => {
      if (error) throw error;
      if (image && !map.hasImage('port')) map.addImage('port', image);
    });
  }, []);
  
  // Toggle layers visibility
  const toggleVessels = useCallback(() => {
    setShowVessels(!showVessels);
  }, [showVessels]);
  
  const toggleRefineries = useCallback(() => {
    setShowRefineries(!showRefineries);
  }, [showRefineries]);
  
  const togglePorts = useCallback(() => {
    setShowPorts(!showPorts);
  }, [showPorts]);
  
  const toggleHeatmap = useCallback(() => {
    // Not directly toggling showHeatmap here because it's passed as a prop
    // In a real implementation, you might want to lift this state up
  }, []);
  
  const changeMapStyle = useCallback((newStyle: 'dark' | 'light' | 'satellite' | 'nautical') => {
    setMapStyle(newStyle);
  }, []);
  
  // Calculate map bounds to fit all points if needed
  const fitBounds = useCallback(() => {
    if (!mapRef.current || vessels.length === 0) return;
    
    // Calculate bounds from all vessels with valid coordinates
    const validVessels = vessels.filter(v => 
      v.currentLat && v.currentLng && 
      !isNaN(parseFloat(String(v.currentLat))) && 
      !isNaN(parseFloat(String(v.currentLng)))
    );
    
    if (validVessels.length === 0) return;
    
    // Get min/max coordinates
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    
    for (const vessel of validVessels) {
      const lat = parseFloat(String(vessel.currentLat));
      const lng = parseFloat(String(vessel.currentLng));
      
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
    
    // Add padding for the bounds
    const padding = 50;
    mapRef.current.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding }
    );
  }, [vessels]);
  
  // Effect to fly to specific regions when selected
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Define region coordinates (centers and zoom levels)
    const regionCoordinates: Record<string, { center: [number, number], zoom: number }> = {
      global: { center: [0, 20], zoom: 1.5 },
      middle_east: { center: [54, 25], zoom: 4 },
      north_america: { center: [-100, 40], zoom: 3 },
      europe: { center: [15, 50], zoom: 3.5 },
      africa: { center: [20, 0], zoom: 3 },
      southeast_asia: { center: [110, 5], zoom: 4 },
      east_asia: { center: [120, 35], zoom: 3.5 },
      oceania: { center: [140, -25], zoom: 3.5 },
      south_america: { center: [-60, -15], zoom: 3 }
    };
    
    // Get region settings or default to global
    const regionSettings = regionCoordinates[selectedRegion] || regionCoordinates.global;
    
    // Fly to the region
    mapRef.current.flyTo({
      center: regionSettings.center,
      zoom: regionSettings.zoom,
      duration: 2000
    });
  }, [selectedRegion]);
  
  // Create default vessel icons for fallback
  useEffect(() => {
    // Simulate vessel icon images if not loaded from server
    // In a real app, you would have actual image files
    const createDefaultIcons = async () => {
      if (!mapRef.current) return;
      
      const map = mapRef.current.getMap();
      
      // Only create default icons if the real ones failed to load
      if (!map.hasImage('oil-tanker')) {
        // Create a simple canvas for the oil tanker
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw a simple shape for the oil tanker
          ctx.fillStyle = '#FF6F00';
          ctx.beginPath();
          ctx.arc(12, 12, 8, 0, 2 * Math.PI);
          ctx.fill();
          
          map.addImage('oil-tanker', { width: 24, height: 24, data: new Uint8Array(ctx.getImageData(0, 0, 24, 24).data) });
        }
      }
      
      // Add more fallback icons as needed for other vessel types
    };
    
    createDefaultIcons();
  }, []);
  
  // Show error if any
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
    <div className="relative w-full" style={{ height }}>
      {/* Loading overlay */}
      {(vesselsLoading || infrastructureLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm font-medium">Loading maritime data...</div>
          </div>
        </div>
      )}
      
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {/* Map layer controls panel */}
        <Card className="w-48 bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center">
              <Layers className="h-4 w-4 mr-2" />
              Map Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1">
                <Ship className="h-3 w-3" />
                Vessels
              </Label>
              <Switch 
                checked={showVessels} 
                onCheckedChange={toggleVessels}
                className="scale-75"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1">
                <Factory className="h-3 w-3" />
                Refineries
              </Label>
              <Switch 
                checked={showRefineries} 
                onCheckedChange={toggleRefineries}
                className="scale-75"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1">
                <AnchorIcon className="h-3 w-3" />
                Ports
              </Label>
              <Switch 
                checked={showPorts} 
                onCheckedChange={togglePorts}
                className="scale-75"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Heatmap
              </Label>
              <Switch 
                checked={showHeatmap} 
                onCheckedChange={toggleHeatmap}
                className="scale-75"
              />
            </div>
            
            <Separator className="my-1" />
            
            <Tabs defaultValue={mapStyle} onValueChange={(value) => changeMapStyle(value as any)}>
              <TabsList className="w-full h-7 grid grid-cols-2">
                <TabsTrigger value="dark" className="text-xs px-2 py-1 h-6">
                  <MoonStar className="h-3 w-3 mr-1" />
                  Dark
                </TabsTrigger>
                <TabsTrigger value="light" className="text-xs px-2 py-1 h-6">
                  <Sun className="h-3 w-3 mr-1" />
                  Light
                </TabsTrigger>
                <TabsTrigger value="satellite" className="text-xs px-2 py-1 h-6">
                  <MapPin className="h-3 w-3 mr-1" />
                  Satellite
                </TabsTrigger>
                <TabsTrigger value="nautical" className="text-xs px-2 py-1 h-6">
                  <Navigation className="h-3 w-3 mr-1" />
                  Nautical
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Statistics panel */}
        <Card className="w-48 bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center">
              <Gauge className="h-4 w-4 mr-2" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <div className="text-xs grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Total Vessels:</span>
              <span className="font-medium text-right">{vessels.length.toLocaleString()}</span>
              
              <span className="text-muted-foreground">Crude Tankers:</span>
              <span className="font-medium text-right">{vessels.filter(v => v.vesselType?.toLowerCase().includes('crude')).length}</span>
              
              <span className="text-muted-foreground">LNG Carriers:</span>
              <span className="font-medium text-right">{vessels.filter(v => v.vesselType?.toLowerCase().includes('lng')).length}</span>
              
              <span className="text-muted-foreground">Refineries:</span>
              <span className="font-medium text-right">{refineries.length}</span>
              
              <span className="text-muted-foreground">Ports:</span>
              <span className="font-medium text-right">{ports.length}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs mt-2 h-7"
              onClick={fitBounds}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Fit All Points
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Main map */}
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyles[mapStyle]}
        onMove={handleViewStateChange}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        interactiveLayerIds={[VESSEL_POINTS_LAYER, REFINERY_POINTS_LAYER, PORT_POINTS_LAYER, VESSEL_CLUSTERS_LAYER]}
        maxZoom={16}
        minZoom={1}
      >
        {/* Add map controls */}
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <ScaleControl position="bottom-left" />
        
        {/* Vessels source with clustering */}
        <Source
          id="vessels-source"
          type="geojson"
          data={vesselGeoJson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={40}
        >
          {/* Clustered vessels */}
          <Layer
            id={VESSEL_CLUSTERS_LAYER}
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#90caf9', // Small clusters
                10,
                '#42a5f5', // Medium clusters
                30,
                '#1e88e5', // Large clusters
                100,
                '#0d47a1'  // Very large clusters
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                15, // Small clusters
                10,
                20, // Medium clusters
                30,
                25, // Large clusters
                100,
                30  // Very large clusters
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255, 255, 255, 0.5)',
              'circle-opacity': 0.8
            }}
          />
          
          {/* Cluster counts */}
          <Layer
            id={VESSEL_CLUSTER_COUNT_LAYER}
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            }}
            paint={{
              'text-color': '#ffffff'
            }}
          />
          
          {/* Individual vessel points */}
          <Layer
            id={VESSEL_POINTS_LAYER}
            type="symbol"
            filter={['!', ['has', 'point_count']]}
            layout={{
              'icon-image': generateVesselIcon(selectedVessel as any), // Use expression to select icon
              'icon-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                2, 0.3,  // Small at zoom level 2
                4, 0.4,  // Medium at zoom level 4
                10, 0.8  // Large at zoom level 10
              ],
              'icon-allow-overlap': true,
              'icon-ignore-placement': false,
              'text-field': ['get', 'name'],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-offset': [0, 1.25],
              'text-anchor': 'top',
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                4, 0,    // No text at low zoom
                6, 8,    // Small text at medium zoom
                10, 12   // Full size text at high zoom
              ]
            }}
            paint={{
              'text-color': '#ffffff',
              'text-halo-color': 'rgba(0, 0, 0, 0.8)',
              'text-halo-width': 1
            }}
          />
          
          {/* Heatmap layer for vessel density */}
          {showHeatmap && (
            <Layer
              id={VESSEL_HEAT_LAYER}
              type="heatmap"
              paint={{
                'heatmap-weight': 1,
                'heatmap-intensity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 1,
                  9, 3
                ],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(33,102,172,0)',
                  0.2, 'rgb(103,169,207)',
                  0.4, 'rgb(209,229,240)',
                  0.6, 'rgb(253,219,199)',
                  0.8, 'rgb(239,138,98)',
                  1, 'rgb(178,24,43)'
                ],
                'heatmap-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 2,
                  9, 20
                ],
                'heatmap-opacity': 0.7
              }}
            />
          )}
        </Source>
        
        {/* Refineries source */}
        {showRefineries && (
          <Source
            id="refineries-source"
            type="geojson"
            data={refineryGeoJson}
          >
            <Layer
              id={REFINERY_POINTS_LAYER}
              type="symbol"
              layout={{
                'icon-image': 'refinery',
                'icon-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  2, 0.4,  // Small at zoom level 2
                  4, 0.6,  // Medium at zoom level 4
                  10, 1.0  // Large at zoom level 10
                ],
                'icon-allow-overlap': true,
                'text-field': ['get', 'name'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-offset': [0, 1.25],
                'text-anchor': 'top',
                'text-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  4, 0,    // No text at low zoom
                  6, 8,    // Small text at medium zoom
                  10, 12   // Full size text at high zoom
                ]
              }}
              paint={{
                'text-color': '#ffffff',
                'text-halo-color': 'rgba(0, 0, 0, 0.8)',
                'text-halo-width': 1
              }}
            />
          </Source>
        )}
        
        {/* Ports source */}
        {showPorts && (
          <Source
            id="ports-source"
            type="geojson"
            data={portGeoJson}
          >
            <Layer
              id={PORT_POINTS_LAYER}
              type="symbol"
              layout={{
                'icon-image': 'port',
                'icon-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  2, 0.3,  // Small at zoom level 2
                  4, 0.5,  // Medium at zoom level 4
                  10, 0.8  // Large at zoom level 10
                ],
                'icon-allow-overlap': true,
                'text-field': ['get', 'name'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-offset': [0, 1.25],
                'text-anchor': 'top',
                'text-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  4, 0,    // No text at low zoom
                  7, 8,    // Small text at medium zoom
                  10, 12   // Full size text at high zoom
                ]
              }}
              paint={{
                'text-color': '#ffffff',
                'text-halo-color': 'rgba(0, 0, 0, 0.8)',
                'text-halo-width': 1
              }}
            />
          </Source>
        )}
        
        {/* Vessel routes if available */}
        {showRoutes && vesselRoutesGeoJson && (
          <Source
            id="vessel-routes-source"
            type="geojson"
            data={vesselRoutesGeoJson}
          >
            <Layer
              id={VESSEL_ROUTES_LAYER}
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#FF6F00',
                'line-width': 2,
                'line-dasharray': [2, 1]
              }}
            />
          </Source>
        )}
        
        {/* Popup for selected items */}
        {popupCoords && (
          <Popup
            longitude={popupCoords[0]}
            latitude={popupCoords[1]}
            anchor="bottom"
            onClose={() => {
              setSelectedVessel(null);
              setSelectedRefinery(null);
              setSelectedPort(null);
              setPopupCoords(null);
            }}
            closeOnClick={false}
            className="mapbox-popup"
          >
            {selectedVessel && (
              <div className="w-72 max-w-full">
                {formatVesselMetadata(selectedVessel)}
                
                <div className="flex justify-between gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs flex-1"
                    onClick={() => {
                      if (showRoutes) {
                        // If the vessel has destination coordinates, fly to midpoint
                        if (selectedVessel.destinationLat && selectedVessel.destinationLng) {
                          const startLat = parseFloat(String(selectedVessel.currentLat));
                          const startLng = parseFloat(String(selectedVessel.currentLng));
                          const endLat = parseFloat(String(selectedVessel.destinationLat));
                          const endLng = parseFloat(String(selectedVessel.destinationLng));
                          
                          // Calculate midpoint for the camera target
                          const midLat = (startLat + endLat) / 2;
                          const midLng = (startLng + endLng) / 2;
                          
                          // Fly to midpoint with appropriate zoom to see the route
                          mapRef.current?.flyTo({
                            center: [midLng, midLat],
                            zoom: 4,
                            duration: 1500
                          });
                        }
                      }
                    }}
                  >
                    <Route className="h-3 w-3 mr-1" />
                    View Route
                  </Button>
                  
                  <Button
                    size="sm"
                    className="text-xs flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // Navigate to vessel detail page
                      window.location.href = `/vessels/${selectedVessel.id}`;
                    }}
                  >
                    <Ship className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            )}
            
            {selectedRefinery && (
              <div className="w-72 max-w-full">
                <div className="bg-red-50 p-2 rounded-md mb-2 border-l-4 border-red-500">
                  <p className="font-bold text-base text-red-700">{selectedRefinery.name}</p>
                  <p className="text-xs text-red-600">{selectedRefinery.country.toUpperCase()}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                  <div className="font-semibold">Region:</div>
                  <div>{selectedRefinery.region}</div>
                  
                  <div className="font-semibold">Capacity:</div>
                  <div>{(selectedRefinery.capacity / 1000).toFixed(0)}k bpd</div>
                  
                  <div className="font-semibold">Status:</div>
                  <div>
                    <Badge variant={selectedRefinery.status === 'active' ? 'success' : 'secondary'}>
                      {selectedRefinery.status}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  className="w-full text-xs bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    // Navigate to refinery detail page
                    window.location.href = `/refineries/${selectedRefinery.id}`;
                  }}
                >
                  <Factory className="h-3 w-3 mr-1" />
                  View Refinery Details
                </Button>
              </div>
            )}
            
            {selectedPort && (
              <div className="w-72 max-w-full">
                <div className="bg-blue-50 p-2 rounded-md mb-2 border-l-4 border-blue-500">
                  <p className="font-bold text-base text-blue-700">{selectedPort.name}</p>
                  <p className="text-xs text-blue-600">{selectedPort.country.toUpperCase()}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                  <div className="font-semibold">Type:</div>
                  <div>{selectedPort.portType || 'Standard'}</div>
                  
                  <div className="font-semibold">Region:</div>
                  <div>{selectedPort.region}</div>
                  
                  <div className="font-semibold">Capacity:</div>
                  <div>{selectedPort.capacity ? `${selectedPort.capacity.toLocaleString()} TEU` : 'N/A'}</div>
                </div>
                
                <Button
                  size="sm"
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Navigate to port detail page
                    window.location.href = `/ports/${selectedPort.id}`;
                  }}
                >
                  <AnchorIcon className="h-3 w-3 mr-1" />
                  View Port Details
                </Button>
              </div>
            )}
          </Popup>
        )}
      </Map>
      
      {/* Connection status indicator */}
      <div className="absolute bottom-3 left-3 z-10">
        <Badge 
          variant={isConnected ? "outline" : "destructive"} 
          className={isConnected 
            ? "bg-green-50 text-green-700 border-green-200" 
            : ""
          }
        >
          {isConnected ? "Connected" : "Connecting..."}
        </Badge>
        
        {lastUpdated && (
          <div className="text-xs text-white bg-black/40 backdrop-blur-sm rounded px-2 py-1 mt-1">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}