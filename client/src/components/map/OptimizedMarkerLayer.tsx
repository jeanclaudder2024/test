import React, { useState, useEffect } from 'react';
import { CircleMarker, Marker, Popup, useMap, Polyline, LayerGroup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Vessel, Refinery, Port } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Ship,
  Navigation,
  Anchor,
  Factory,
  Info,
  ArrowRight,
  MapPin,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Create custom vessel icon with caching for performance
const iconCache: Record<string, L.Icon> = {};

const defaultVesselIcon = (heading: number = 0, speed: number = 0, vesselType: string = 'oil products tanker') => {
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
const defaultRefineryIcon = () => {
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
const defaultPortIcon = () => {
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

// Custom clustering solution with viewport filtering
interface OptimizedVesselLayerProps {
  vessels: Vessel[];
  onVesselClick?: (vessel: Vessel) => void;
  selectedVessel?: Vessel | null;
  vesselIcon?: (heading: number, speed: number, vesselType: string) => L.Icon;
  showRoutes?: boolean;
}

export function OptimizedVesselLayer({ 
  vessels, 
  onVesselClick,
  selectedVessel,
  vesselIcon = defaultVesselIcon,
  showRoutes = false
}: OptimizedVesselLayerProps) {
  const map = useMap();
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [zoom, setZoom] = useState<number>(0);
  const [clusters, setClusters] = useState<any[]>([]);
  const [renderedVessels, setRenderedVessels] = useState<Vessel[]>([]);
  const [vesselsWithRoutes, setVesselsWithRoutes] = useState<Record<number, boolean>>({});
  
  // Update bounds when map moves or zooms
  useEffect(() => {
    // Get current map bounds
    const bounds = map.getBounds();
    const currentZoom = map.getZoom();
    
    setMapBounds(bounds);
    setZoom(currentZoom);
    
    // When map moves or zoom changes, update visible vessels
    const updateViewport = () => {
      const newBounds = map.getBounds();
      const newZoom = map.getZoom();
      
      setMapBounds(newBounds);
      setZoom(newZoom);
    };
    
    map.on('moveend', updateViewport);
    map.on('zoomend', updateViewport);
    
    return () => {
      map.off('moveend', updateViewport);
      map.off('zoomend', updateViewport);
    };
  }, [map]);
  
  // Cluster vessels based on zoom level and bounds
  useEffect(() => {
    if (!mapBounds) return;
    
    // Simplified clustering logic
    const visibleVessels = vessels.filter(vessel => {
      // Skip vessels without valid coordinates
      if (!vessel.currentLat || !vessel.currentLng) return false;
      
      const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat));
      const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng));
      
      // Check if vessel is within map bounds
      return mapBounds.contains([lat, lng]);
    });
    
    // If zoom is high enough, don't cluster
    if (zoom >= 8) {
      setClusters([]);
      setRenderedVessels(visibleVessels.slice(0, 1000)); // Limit for performance
      return;
    }
    
    // Simple grid-based clustering
    const cellSize = 1.0; // degrees
    const grid: Record<string, any> = {};
    
    // Put vessels into grid cells
    visibleVessels.forEach(vessel => {
      const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat) || '0');
      const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng) || '0');
      
      const cellX = Math.floor(lng / cellSize);
      const cellY = Math.floor(lat / cellSize);
      const cellKey = `${cellX}-${cellY}`;
      
      if (!grid[cellKey]) {
        grid[cellKey] = {
          points: [],
          lat: (cellY * cellSize) + (cellSize / 2),
          lng: (cellX * cellSize) + (cellSize / 2)
        };
      }
      
      grid[cellKey].points.push({
        data: vessel,
        lat,
        lng
      });
    });
    
    // Convert grid to clusters
    const newClusters = Object.values(grid)
      .filter((cell: any) => cell.points.length > 1)
      .map((cell: any) => ({
        ...cell,
        count: cell.points.length
      }));
    
    // For cells with only one vessel, add directly to rendered vessels
    const singleVessels = Object.values(grid)
      .filter((cell: any) => cell.points.length === 1)
      .flatMap((cell: any) => cell.points.map((p: any) => p.data));
    
    setClusters(newClusters);
    setRenderedVessels(singleVessels.slice(0, 500)); // Limit for performance
  }, [vessels, mapBounds, zoom]);
  
  // If no vessels, show empty message
  if (vessels.length === 0) {
    return (
      <CircleMarker
        center={[0, 0]}
        radius={10}
        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.5 }}
      >
        <Popup>No vessels found</Popup>
      </CircleMarker>
    );
  }
  
  return (
    <LayerGroup>
      {/* Render clusters at lower zoom levels */}
      {clusters.map((cluster, index) => (
        <CircleMarker
          key={`cluster-${index}`}
          center={[cluster.lat, cluster.lng]}
          radius={Math.min(20, 10 + Math.log(cluster.count) * 2)}
          pathOptions={{
            color: '#3388ff',
            weight: 1,
            fillColor: '#3388ff',
            fillOpacity: 0.5
          }}
          eventHandlers={{
            click: () => {
              // If fewer vessels, show them individually
              if (cluster.count <= 5) {
                // Show all vessels in this cluster
                setRenderedVessels(prev => [...prev, ...cluster.points.map((p: any) => p.data)]);
                setClusters(clusters.filter((_, i) => i !== index));
              } else {
                // Zoom in to see more detail
                map.flyTo([cluster.lat, cluster.lng], Math.min(zoom + 2, 8));
              }
            },
            mouseover: (e) => {
              e.target.openPopup();
            }
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{cluster.count} vessels in this area</p>
              <Button
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() => map.flyTo([cluster.lat, cluster.lng], Math.min(zoom + 2, 8))}
              >
                Zoom in to view
              </Button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      
      {/* Render individual vessels at higher zoom levels */}
      {renderedVessels.map(vessel => {
        // Parse vessel metadata if available
        let metadata = {
          heading: 0,
          course: 0,
          speed: 0,
          status: 'Unknown',
          lastPositionTime: new Date().toISOString()
        };
        
        try {
          if (vessel.metadata) {
            if (typeof vessel.metadata === 'string') {
              metadata = JSON.parse(vessel.metadata);
            } else {
              metadata = vessel.metadata as any;
            }
          }
        } catch (e) {
          console.error('Error parsing vessel metadata', e);
        }
        
        // Get coordinates
        const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat) || '0');
        const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng) || '0');
        
        // Skip if invalid coordinates
        if (isNaN(lat) || isNaN(lng)) return null;
        
        // Create icon based on vessel data
        const heading = metadata.heading || metadata.course || 0;
        const speed = typeof vessel.currentSpeed === 'number' 
          ? vessel.currentSpeed 
          : parseFloat(String(vessel.currentSpeed) || '0');
        
        const icon = vesselIcon(heading, speed, vessel.vesselType || '');
        
        return (
          <React.Fragment key={`vessel-${vessel.id}`}>
            <Marker
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onVesselClick) onVesselClick(vessel);
                }
              }}
            >
              <Tooltip direction="top" permanent={selectedVessel?.id === vessel.id}>
                <div className="text-xs font-semibold">{vessel.name}</div>
                <div className="text-xs">{vessel.vesselType}</div>
              </Tooltip>
              
              <Popup>
                <div className="text-sm space-y-2 w-64 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <Ship className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-800">{vessel.name}</h4>
                  </div>
                  
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {vessel.vesselType}
                  </Badge>
                  
                  <Separator className="my-1" />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">IMO</p>
                      <p className="font-medium">{vessel.imo || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Flag</p>
                      <p className="font-medium">{vessel.flag || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Speed</p>
                      <p className="font-medium">{vessel.currentSpeed || '0'} knots</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Built</p>
                      <p className="font-medium">{vessel.built || 'Unknown'}</p>
                    </div>
                    
                    {vessel.cargoType && (
                      <>
                        <div className="font-semibold">Cargo:</div>
                        <div>{vessel.cargoType}</div>
                      </>
                    )}
                  </div>
                  
                  {/* Route Toggle Button */}
                  <div className="flex items-center justify-between my-2 bg-blue-50 p-2 rounded-md">
                    <label className="text-xs flex items-center text-blue-700 font-medium">
                      <Navigation className="h-3 w-3 mr-1" />
                      Show Vessel Route
                    </label>
                    <Switch 
                      checked={!!vesselsWithRoutes[vessel.id || 0]}
                      onCheckedChange={(checked) => {
                        setVesselsWithRoutes(prev => ({
                          ...prev,
                          [vessel.id || 0]: checked
                        }));
                      }}
                    />
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => onVesselClick && onVesselClick(vessel)}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
            
            {/* Render vessel route if enabled */}
            {vesselsWithRoutes[vessel.id || 0] && vessel.routeHistory && (
              <Polyline
                positions={
                  vessel.routeHistory.map(point => [
                    typeof point.lat === 'number' ? point.lat : parseFloat(String(point.lat) || '0'),
                    typeof point.lng === 'number' ? point.lng : parseFloat(String(point.lng) || '0')
                  ] as [number, number])
                }
                pathOptions={{
                  color: 'blue',
                  weight: 2,
                  opacity: 0.7,
                  dashArray: '5, 5'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </LayerGroup>
  );
}

interface OptimizedRefineryLayerProps {
  refineries: Refinery[];
  onRefineryClick?: (refinery: Refinery) => void;
  selectedRefinery?: Refinery | null;
  refineryIcon?: () => L.Icon;
}

export function OptimizedRefineryLayer({
  refineries,
  onRefineryClick,
  selectedRefinery,
  refineryIcon = defaultRefineryIcon
}: OptimizedRefineryLayerProps) {
  const map = useMap();
  
  if (refineries.length === 0) return null;
  
  return (
    <LayerGroup>
      {refineries.map(refinery => {
        // Skip if invalid coordinates
        if (!refinery.lat || !refinery.lng) return null;
        
        const lat = typeof refinery.lat === 'number' ? refinery.lat : parseFloat(String(refinery.lat) || '0');
        const lng = typeof refinery.lng === 'number' ? refinery.lng : parseFloat(String(refinery.lng) || '0');
        
        if (isNaN(lat) || isNaN(lng)) return null;
        
        const icon = refineryIcon();
        
        return (
          <Marker
            key={`refinery-${refinery.id}`}
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                if (onRefineryClick) onRefineryClick(refinery);
              }
            }}
          >
            <Tooltip direction="top" permanent={selectedRefinery?.id === refinery.id}>
              <div className="text-xs font-semibold">{refinery.name}</div>
              <div className="text-xs">{refinery.country}</div>
            </Tooltip>
            
            <Popup>
              <div className="text-sm space-y-2 w-64 max-w-xs">
                <div className="flex items-center space-x-2">
                  <Factory className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-red-800">{refinery.name}</h4>
                </div>
                
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                  Refinery
                </Badge>
                
                <Separator className="my-1" />
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Country</p>
                    <p className="font-medium">{refinery.country || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Region</p>
                    <p className="font-medium">{refinery.region || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Capacity</p>
                    <p className="font-medium">{refinery.capacity?.toLocaleString() || 'Unknown'} bpd</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium capitalize">{refinery.status || 'Active'}</p>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    window.open(`/refineries/${refinery.id}`, '_blank');
                  }}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </LayerGroup>
  );
}

interface OptimizedPortLayerProps {
  ports: Port[];
  onPortClick?: (port: Port) => void;
  selectedPort?: Port | null;
  portIcon?: () => L.Icon;
}

export function OptimizedPortLayer({
  ports,
  onPortClick,
  selectedPort,
  portIcon = defaultPortIcon
}: OptimizedPortLayerProps) {
  const map = useMap();
  
  if (ports.length === 0) return null;
  
  return (
    <LayerGroup>
      {ports.map(port => {
        // Skip if invalid coordinates
        if (!port.lat || !port.lng) return null;
        
        const lat = typeof port.lat === 'number' ? port.lat : parseFloat(String(port.lat) || '0');
        const lng = typeof port.lng === 'number' ? port.lng : parseFloat(String(port.lng) || '0');
        
        if (isNaN(lat) || isNaN(lng)) return null;
        
        const icon = portIcon();
        
        return (
          <Marker
            key={`port-${port.id}`}
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                if (onPortClick) onPortClick(port);
              }
            }}
          >
            <Tooltip direction="top" permanent={selectedPort?.id === port.id}>
              <div className="text-xs font-semibold">{port.name}</div>
              <div className="text-xs">{port.country}</div>
            </Tooltip>
            
            <Popup>
              <div className="text-sm space-y-2 w-64 max-w-xs">
                <div className="flex items-center space-x-2">
                  <Anchor className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-800">{port.name}</h4>
                </div>
                
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {port.type || 'Port'}
                </Badge>
                
                <Separator className="my-1" />
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Country</p>
                    <p className="font-medium">{port.country || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Region</p>
                    <p className="font-medium">{port.region || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium">{port.type || 'Commercial'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium capitalize">{port.status || 'Active'}</p>
                  </div>
                </div>
                
                {port.description && (
                  <div className="mt-2 text-xs text-gray-600">
                    {port.description.substring(0, 100)}
                    {port.description.length > 100 ? '...' : ''}
                  </div>
                )}
                
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    window.open(`/ports/${port.id}`, '_blank');
                  }}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </LayerGroup>
  );
}