import { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  ZoomControl,
  useMap,
  CircleMarker
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Vessel, Refinery, Port } from '@shared/schema';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { Loader2, Ship, Factory, Anchor, Navigation, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Create custom icon types
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Define vessel icon
const vesselIcon = (vesselType: string) => {
  let color = '#FF6F00'; // Default orange
  
  if (vesselType?.toLowerCase().includes('crude')) {
    color = '#e53935'; // Red for crude oil tankers
  } else if (vesselType?.toLowerCase().includes('lng')) {
    color = '#43a047'; // Green for LNG carriers
  } else if (vesselType?.toLowerCase().includes('lpg')) {
    color = '#ffb300'; // Amber for LPG carriers
  } else if (vesselType?.toLowerCase().includes('product')) {
    color = '#1e88e5'; // Blue for product tankers
  } else if (vesselType?.toLowerCase().includes('chemical')) {
    color = '#8e24aa'; // Purple for chemical tankers
  }
  
  return {
    color,
    fillColor: color,
    fillOpacity: 0.8,
    weight: 2,
    radius: 6
  };
};

// Define different map styles
const MAP_STYLES = {
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  nautical: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
};

// Define map tile attribution
const ATTRIBUTIONS = {
  standard: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  light: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  satellite: '&copy; <a href="https://www.arcgis.com/">Esri</a>',
  nautical: '&copy; <a href="https://www.openseamap.org/">OpenSeaMap</a> contributors'
};

// Component to update map center
const SetViewOnRegionChange = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Create marker clusters component
function MarkerCluster({ vessels }: { vessels: Vessel[] }) {
  const map = useMap();
  const clustersRef = useRef<L.LayerGroup>();
  
  useEffect(() => {
    // Remove existing markers
    if (clustersRef.current) {
      clustersRef.current.clearLayers();
    } else {
      clustersRef.current = L.layerGroup().addTo(map);
    }
    
    // Add markers to layer group
    vessels.forEach(vessel => {
      if (vessel.currentLat && vessel.currentLng) {
        try {
          const lat = parseFloat(String(vessel.currentLat));
          const lng = parseFloat(String(vessel.currentLng));
          
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return;
          }
          
          const marker = L.circleMarker([lat, lng], vesselIcon(vessel.vesselType || 'oil tanker'))
            .addTo(clustersRef.current as L.LayerGroup);
          
          marker.bindPopup(() => {
            const content = document.createElement('div');
            content.className = 'p-2 max-w-[250px]';
            content.innerHTML = `
              <h3 class="font-bold text-sm">${vessel.name}</h3>
              <p class="text-xs text-muted-foreground">${vessel.vesselType || 'Unknown vessel type'}</p>
              <div class="mt-2 text-xs">
                <p>IMO: ${vessel.imo || 'N/A'}</p>
                <p>Flag: ${vessel.flag || 'N/A'}</p>
              </div>
              <button 
                class="mt-2 w-full text-xs px-2 py-1 bg-blue-600 text-white rounded flex items-center justify-center gap-1" 
                onclick="window.location.href='/vessels/${vessel.id}'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 9V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"/>
                  <path d="M9 3 C9 3 9 15 12 15 S15 3 15 3"/>
                  <path d="M5 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4a1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 0-1-1H8a1 1 0 0 0-1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1z"/>
                </svg>
                View Details
              </button>
            `;
            
            return content;
          });
        } catch (err) {
          console.error('Error creating marker:', err);
        }
      }
    });
    
    return () => {
      if (clustersRef.current) {
        clustersRef.current.clearLayers();
      }
    };
  }, [vessels, map]);
  
  return null;
}

function RefineryMarkers({ refineries }: { refineries: Refinery[] }) {
  const map = useMap();
  const markersRef = useRef<L.LayerGroup>();
  
  useEffect(() => {
    if (markersRef.current) {
      markersRef.current.clearLayers();
    } else {
      markersRef.current = L.layerGroup().addTo(map);
    }
    
    refineries.forEach(refinery => {
      if (refinery.lat && refinery.lng) {
        try {
          const lat = parseFloat(String(refinery.lat));
          const lng = parseFloat(String(refinery.lng));
          
          if (isNaN(lat) || isNaN(lng)) return;
          
          const marker = L.circleMarker([lat, lng], {
            radius: 8,
            color: '#f44336',
            fillColor: '#f44336',
            fillOpacity: 0.8,
            weight: 2
          }).addTo(markersRef.current as L.LayerGroup);
          
          marker.bindPopup(() => {
            const content = document.createElement('div');
            content.className = 'p-2 max-w-[250px]';
            content.innerHTML = `
              <h3 class="font-bold text-sm">${refinery.name}</h3>
              <p class="text-xs text-muted-foreground">${refinery.country}</p>
              <div class="mt-2 text-xs">
                <p>Region: ${refinery.region}</p>
                <p>Capacity: ${refinery.capacity ? `${Math.round(refinery.capacity / 1000)}k bpd` : 'N/A'}</p>
              </div>
              <button 
                class="mt-2 w-full text-xs px-2 py-1 bg-red-600 text-white rounded flex items-center justify-center gap-1" 
                onclick="window.location.href='/refineries/${refinery.id}'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 8V4"/>
                  <path d="M15 4v4"/>
                  <path d="M11 4v4"/>
                  <path d="M7 4v4"/>
                  <path d="M20 12 H4c0 0 0 8 8 8s8-8 8-8z"/>
                </svg>
                View Details
              </button>
            `;
            
            return content;
          });
        } catch (err) {
          console.error('Error creating refinery marker:', err);
        }
      }
    });
    
    return () => {
      if (markersRef.current) {
        markersRef.current.clearLayers();
      }
    };
  }, [refineries, map]);
  
  return null;
}

function PortMarkers({ ports }: { ports: Port[] }) {
  const map = useMap();
  const markersRef = useRef<L.LayerGroup>();
  
  useEffect(() => {
    if (markersRef.current) {
      markersRef.current.clearLayers();
    } else {
      markersRef.current = L.layerGroup().addTo(map);
    }
    
    ports.forEach(port => {
      if (port.lat && port.lng) {
        try {
          const lat = parseFloat(String(port.lat));
          const lng = parseFloat(String(port.lng));
          
          if (isNaN(lat) || isNaN(lng)) return;
          
          const marker = L.circleMarker([lat, lng], {
            radius: 6,
            color: '#2196f3',
            fillColor: '#2196f3',
            fillOpacity: 0.8,
            weight: 2
          }).addTo(markersRef.current as L.LayerGroup);
          
          marker.bindPopup(() => {
            const content = document.createElement('div');
            content.className = 'p-2 max-w-[250px]';
            content.innerHTML = `
              <h3 class="font-bold text-sm">${port.name}</h3>
              <p class="text-xs text-muted-foreground">${port.country}</p>
              <div class="mt-2 text-xs">
                <p>Region: ${port.region}</p>
                <p>Type: ${port.type || 'Standard'}</p>
              </div>
              <button 
                class="mt-2 w-full text-xs px-2 py-1 bg-blue-600 text-white rounded flex items-center justify-center gap-1" 
                onclick="window.location.href='/ports/${port.id}'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 4V1m0 3L8 7m4-4l4 4"/>
                  <path d="M2 22h20"/>
                  <path d="M3 11c0 5 3 10 11 10s7-5 7-10"/>
                </svg>
                View Details
              </button>
            `;
            
            return content;
          });
        } catch (err) {
          console.error('Error creating port marker:', err);
        }
      }
    });
    
    return () => {
      if (markersRef.current) {
        markersRef.current.clearLayers();
      }
    };
  }, [ports, map]);
  
  return null;
}

// Map Layers control component
function MapLayers({ mapStyle }: { mapStyle: string }) {
  const map = useMap();
  
  useEffect(() => {
    // Remove current tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    
    // Add selected style tile layer
    const url = MAP_STYLES[mapStyle as keyof typeof MAP_STYLES] || MAP_STYLES.standard;
    const attribution = ATTRIBUTIONS[mapStyle as keyof typeof ATTRIBUTIONS] || ATTRIBUTIONS.standard;
    L.tileLayer(url, {
      attribution,
      maxZoom: 19
    }).addTo(map);
    
    // Add nautical layer if style is nautical
    if (mapStyle === 'nautical') {
      L.tileLayer(MAP_STYLES.standard, {
        attribution: ATTRIBUTIONS.standard,
        maxZoom: 19
      }).addTo(map);
      
      L.tileLayer(MAP_STYLES.nautical, {
        attribution: ATTRIBUTIONS.nautical,
        maxZoom: 19
      }).addTo(map);
    }
  }, [mapStyle, map]);
  
  return null;
}

// Main Leaflet Map component
interface LeafletMapProps {
  initialRegion?: string;
  height?: string;
  showRoutes?: boolean;
  showVesselHistory?: boolean;
  showHeatmap?: boolean;
  mapStyle?: 'standard' | 'dark' | 'light' | 'satellite' | 'nautical';
}

export default function LeafletMap({
  initialRegion = 'global',
  height = '600px',
  showRoutes = false,
  showVesselHistory = false,
  showHeatmap = false,
  mapStyle: initialMapStyle = 'standard'
}: LeafletMapProps) {
  // State
  const [mapStyle, setMapStyle] = useState(initialMapStyle);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [center, setCenter] = useState<[number, number]>([20, 0]);
  const [zoom, setZoom] = useState(2);
  
  // Get vessel data from WebSocket
  const { 
    vessels, 
    connected, 
    lastUpdated, 
    loading: vesselsLoading 
  } = useVesselWebSocket({
    region: selectedRegion,
    loadAllVessels: true
  });

  // Get maritime infrastructure data
  const { 
    refineries, 
    ports, 
    loading: infrastructureLoading 
  } = useMaritimeData({ 
    region: selectedRegion 
  });
  
  // Set center based on region
  useEffect(() => {
    switch (selectedRegion) {
      case 'middle_east':
        setCenter([25, 50]);
        setZoom(5);
        break;
      case 'north_america':
        setCenter([40, -100]);
        setZoom(4);
        break;
      case 'europe':
        setCenter([50, 10]);
        setZoom(4);
        break;
      case 'southeast_asia':
        setCenter([5, 115]);
        setZoom(4);
        break;
      case 'east_asia':
        setCenter([30, 120]);
        setZoom(4);
        break;
      case 'africa':
        setCenter([0, 20]);
        setZoom(3);
        break;
      case 'oceania':
        setCenter([-25, 135]);
        setZoom(4);
        break;
      case 'south_america':
        setCenter([-20, -60]);
        setZoom(3);
        break;
      default:
        setCenter([20, 0]);
        setZoom(2);
    }
  }, [selectedRegion]);
  
  // Update selected region when initialRegion changes
  useEffect(() => {
    setSelectedRegion(initialRegion);
  }, [initialRegion]);

  // Update map style when initialMapStyle changes
  useEffect(() => {
    setMapStyle(initialMapStyle);
  }, [initialMapStyle]);
  
  // Loading state
  const isLoading = vesselsLoading || infrastructureLoading;

  return (
    <div className="relative w-full" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000] backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm font-medium">Loading maritime data...</div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <Card className="w-48 bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Map Style</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Tabs value={mapStyle} onValueChange={(v) => setMapStyle(v as any)}>
              <TabsList className="w-full grid grid-cols-2 h-8">
                <TabsTrigger value="standard" className="text-xs">
                  Standard
                </TabsTrigger>
                <TabsTrigger value="dark" className="text-xs">
                  Dark
                </TabsTrigger>
                <TabsTrigger value="light" className="text-xs">
                  Light
                </TabsTrigger>
                <TabsTrigger value="satellite" className="text-xs">
                  Satellite
                </TabsTrigger>
                <TabsTrigger value="nautical" className="text-xs">
                  Nautical
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Stats */}
        <Card className="w-48 bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center">
              <Ship className="h-4 w-4 mr-2" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2 text-xs">
            <div>Vessels: {vessels.length}</div>
            <div>Refineries: {refineries.length}</div>
            <div>Ports: {ports.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        className="z-10"
      >
        <ZoomControl position="topleft" />
        <TileLayer
          attribution={ATTRIBUTIONS.standard}
          url={MAP_STYLES.standard}
        />
        <SetViewOnRegionChange center={center} zoom={zoom} />
        <MapLayers mapStyle={mapStyle} />
        <MarkerCluster vessels={vessels} />
        <RefineryMarkers refineries={refineries} />
        <PortMarkers ports={ports} />
      </MapContainer>

      {/* Connection Status */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <Badge 
          variant={connected ? "outline" : "destructive"} 
          className={connected 
            ? "bg-green-50 text-green-700 border-green-200" 
            : ""
          }
        >
          {connected ? "Connected" : "Connecting..."}
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