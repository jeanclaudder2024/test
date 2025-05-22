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
import VesselPopup from './VesselPopup';

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

// Enhanced utility functions for consistent and safe coordinate handling
const parseCoordinate = (coord: string | number | null | undefined): number | null => {
  // Handle null/undefined case
  if (coord === null || coord === undefined) return null;
  
  // Handle numeric values first
  if (typeof coord === 'number') {
    // Ensure it's a valid latitude/longitude range (-90 to 90 for lat, -180 to 180 for lng)
    if (isNaN(coord) || !isFinite(coord)) return null;
    return coord;
  }
  
  // Handle string values
  if (typeof coord === 'string') {
    // Check if string is empty or non-numeric
    if (coord.trim() === '') return null;
    
    try {
      // Try to parse as float with more validation
      const parsed = parseFloat(coord);
      if (isNaN(parsed) || !isFinite(parsed)) return null;
      return parsed;
    } catch (err) {
      console.warn('Error parsing coordinate:', coord, err);
      return null;
    }
  }
  
  // Fallback for unexpected types
  return null;
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
    },
    darkMode: {
      url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      name: 'Premium Dark',
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    },
    lightMode: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      name: 'Premium Light',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    },
    nautical: {
      url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
      name: 'Maritime',
      attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
      maxZoom: 18
    },
    terrain: {
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
      name: 'Terrain',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
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
              maxZoom: style.maxZoom,
              preview: style.preview || `/assets/${style.id}-preview.png`,
              description: style.description,
              type: style.type
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
  const [mapStyle, setMapStyle] = useState<string>(themeMode === 'dark' ? 'darkMode' : 'lightMode');
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [showConnections, setShowConnections] = useState<boolean>(false);
  const [useCluster, setUseCluster] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get vessel status display format
  const getVesselStatusClass = (status?: string) => {
    if (!status) return 'vessel-status-unknown';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('sail') || statusLower.includes('underway') || statusLower.includes('en route')) {
      return 'vessel-status-sailing';
    } else if (statusLower.includes('anchor')) {
      return 'vessel-status-anchored';
    } else if (statusLower.includes('dock') || statusLower.includes('moor') || statusLower.includes('berth')) {
      return 'vessel-status-docked';
    } else if (statusLower.includes('stop') || statusLower.includes('not moving')) {
      return 'vessel-status-stopped';
    }
    return 'vessel-status-unknown';
  };
  
  // Create a function to get vessel status icon based on status
  const getVesselIcon = (status?: string) => {
    // Status-specific class names for visual indication
    let statusClass = 'vessel-icon-pulse';
    
    // Customize the vessel icon display based on status
    switch(status?.toLowerCase()) {
      case 'sailing':
      case 'underway':
      case 'en route':
        statusClass = 'vessel-icon-sailing';
        break;
      case 'anchored':
      case 'at anchor': 
        statusClass = 'vessel-icon-anchored';
        break;
      case 'docked':
      case 'moored':
      case 'berthed':
        statusClass = 'vessel-icon-docked';
        break;
      case 'stopped':
      case 'not moving':
        statusClass = 'vessel-icon-stopped';
        break;
      default:
        statusClass = 'vessel-icon-pulse';
    }
    
    return L.icon({
      iconUrl: '/assets/vessel-icon.svg',
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -21],
      className: statusClass,  // Will add appropriate animation/style based on status
      // Add shadowUrl to improve icon rendering with proper z-index handling
      shadowUrl: '',
      shadowSize: [0, 0],
      shadowAnchor: [0, 0]
    });
  };

  const portIcon = L.icon({
    iconUrl: '/assets/port-icon.svg',
    iconSize: [38, 38], 
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
    className: 'port-icon-highlight',  // Will add highlight effect
    // Add shadowUrl to improve icon rendering with proper z-index handling
    shadowUrl: '',
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
  });

  const refineryIcon = L.icon({
    iconUrl: '/assets/refinery-icon.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: 'refinery-icon-highlight',  // Will add highlight effect
    // Add shadowUrl to improve icon rendering with proper z-index handling
    shadowUrl: '',
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
  });
  
  // Force map refresh when zooming or moving to fix markers disappearing
  const MapEventHandler = () => {
    const map = useMap();
    
    useEffect(() => {
      if (!map) return;
      
      const handleZoomEnd = () => {
        // Force refresh of markers by triggering a resize event
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      };
      
      map.on('zoomend', handleZoomEnd);
      map.on('moveend', handleZoomEnd);
      
      return () => {
        map.off('zoomend', handleZoomEnd);
        map.off('moveend', handleZoomEnd);
      };
    }, [map]);
    
    return null;
  };
  
  // Create styles for icon animations once component loads
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Create a style element for our custom icon effects
      const styleEl = document.createElement('style');
      styleEl.innerHTML = `
        /* Enhanced professional map styling with better visibility */
        .leaflet-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          overflow: hidden;
        }
        
        /* Improved control styling */
        .leaflet-control-zoom {
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
        }
        
        .leaflet-control-zoom a {
          background-color: #fff !important;
          color: #333 !important;
          transition: all 0.2s ease;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: #f0f0f0 !important;
          color: #000 !important;
        }
        
        /* Fix for Leaflet marker visibility at all zoom levels */
        .leaflet-pane {
          z-index: 400 !important;
        }
        
        .leaflet-tile-pane {
          z-index: 200 !important;
        }
        
        .leaflet-overlay-pane {
          z-index: 400 !important;
        }
        
        .leaflet-marker-pane {
          z-index: 1000 !important; /* Higher than 999 to appear above map layers */
        }
        
        .leaflet-marker-icon {
          z-index: 1000 !important; /* Higher than 999 to appear above map layers */
        }
        
        .leaflet-popup-pane {
          z-index: 1200 !important;
        }
        
        /* Enhanced professional popups */
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          background-color: rgba(255, 255, 255, 0.95);
        }
        
        .leaflet-popup-content {
          margin: 14px 18px;
          line-height: 1.6;
          font-size: 14px;
        }
        
        .leaflet-popup-tip {
          background-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        /* Enhanced map controls */
        .map-style-control {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          padding: 8px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(200, 200, 200, 0.3);
        }
        
        .map-style-option {
          cursor: pointer;
          padding: 6px 10px;
          margin-bottom: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }
        
        .map-style-option:hover {
          background-color: rgba(240, 240, 240, 0.9);
        }
        
        .map-style-option.active {
          background-color: #f0f9ff;
          color: #0369a1;
          font-weight: 500;
        }
        
        /* Vessel status icons with visual indicators */
        .vessel-icon-pulse {
          animation: pulse 2s infinite;
          transform-origin: center center;
          filter: drop-shadow(0 0 2px rgba(33, 150, 243, 0.8));
          z-index: 1000 !important;
        }
        
        .vessel-icon-sailing {
          animation: sailing 3s infinite;
          transform-origin: center center;
          filter: drop-shadow(0 0 3px rgba(0, 128, 255, 0.9));
          z-index: 1000 !important;
        }
        
        .vessel-icon-anchored {
          animation: pulse 4s infinite;
          transform-origin: center center;
          filter: drop-shadow(0 0 3px rgba(255, 166, 0, 0.8));
          z-index: 1000 !important;
        }
        
        .vessel-icon-docked {
          transform-origin: center center;
          filter: drop-shadow(0 0 3px rgba(0, 153, 102, 0.8));
          z-index: 1000 !important;
        }
        
        .vessel-icon-stopped {
          animation: pulse 6s infinite;
          transform-origin: center center;
          filter: drop-shadow(0 0 3px rgba(204, 0, 0, 0.7));
          z-index: 1000 !important;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes sailing {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.03) rotate(1deg); }
          50% { transform: scale(1.05) rotate(0deg); }
          75% { transform: scale(1.03) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        /* Status badge styles for vessel popups */
        .vessel-status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
          margin-left: 4px;
        }
        
        .vessel-status-sailing {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .vessel-status-anchored {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .vessel-status-docked {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .vessel-status-stopped {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .vessel-status-unknown {
          background-color: #f3f4f6;
          color: #374151;
        }
        
        /* Port and refinery icons with enhanced visibility */
        .port-icon-highlight, .refinery-icon-highlight {
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.7));
          transition: all 0.3s ease;
          z-index: 1000 !important; /* Higher than 999 to appear above map layers */
        }
        
        .port-icon-highlight:hover, .refinery-icon-highlight:hover {
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.9));
          transform: scale(1.1);
          z-index: 1001 !important; /* Higher than 999 to appear above map layers */
        }
      `;
      document.head.appendChild(styleEl);
      
      return () => {
        // Clean up on unmount
        document.head.removeChild(styleEl);
      };
    }
  }, []);

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
        preferCanvas={false} // Use DOM rendering for better z-index control
        ref={(map) => {
          if (map) mapRef.current = map;
        }}
      >
        <TileLayer
          url={mapStyles[mapStyle]?.url || mapStyles.satellite.url}
          attribution={mapStyles[mapStyle]?.attribution || mapStyles.satellite.attribution}
          maxZoom={mapStyles[mapStyle]?.maxZoom || 19}
          zIndex={10} // Ensure base tile layer has a lower z-index
        />
        
        {/* Event handler to fix markers disappearing on zoom */}
        <MapEventHandler />
        
        {/* Map Style Selector Control */}
        <MapControl position="topleft">
          <div className="map-style-control">
            <div className="text-xs font-semibold mb-2 text-gray-700">Map Style</div>
            {Object.entries(mapStyles).map(([key, style]) => (
              <div 
                key={key}
                className={`map-style-option text-xs ${mapStyle === key ? 'active' : ''}`}
                onClick={() => setMapStyle(key)}
              >
                <div className="w-3 h-3 rounded-full mr-2" 
                  style={{ 
                    backgroundColor: key === 'darkMode' ? '#242424' : 
                                    key === 'lightMode' ? '#f5f5f5' : 
                                    key === 'satellite' ? '#1f4172' : 
                                    key === 'terrain' ? '#70a288' :
                                    key === 'nautical' ? '#2d6a9f' : '#666'
                  }}
                />
                {style.name}
              </div>
            ))}
          </div>
        </MapControl>
        
        <ZoomControl position="bottomright" />
        
        {/* Vessels Layer - Higher z-index to ensure visibility */}
        {showVessels && (
          useCluster ? (
            <MarkerClusterGroup 
              chunkedLoading
              showCoverageOnHover={false} // Prevent hover effects that might cause flickering
              // MarkerClusterGroup doesn't support zIndexOffset directly
            >
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
              
              // More thorough check for valid coordinates
              if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
                console.warn(`Invalid coordinates for refinery ${refinery.name}:`, { lat: refinery.lat, lng: refinery.lng });
                return null;
              }
              
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
                                  backgroundImage: `url(${styleData.preview || `/assets/${key}-preview.png`})`,
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