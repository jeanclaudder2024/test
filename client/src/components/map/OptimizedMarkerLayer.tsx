import React, { useState, useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { Marker, Popup, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Vessel, Refinery, Port } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Ship, Navigation, Factory, Anchor
} from 'lucide-react';

// Cache for icons to improve performance
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

// Custom clustering solution with viewport filtering
interface OptimizedVesselLayerProps {
  vessels: Vessel[];
  onVesselSelect: (vessel: Vessel) => void;
  vesselsWithRoutes: Record<number, boolean>;
  setVesselsWithRoutes: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}

export function OptimizedVesselLayer({ 
  vessels, 
  onVesselSelect,
  vesselsWithRoutes,
  setVesselsWithRoutes
}: OptimizedVesselLayerProps) {
  const map = useMap();
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [zoom, setZoom] = useState<number>(0);
  const [clusters, setClusters] = useState<any[]>([]);
  const [renderedVessels, setRenderedVessels] = useState<Vessel[]>([]);
  
  // Update bounds when map moves or zooms
  useEffect(() => {
    if (!map) return;
    
    const handleMove = () => {
      setMapBounds(map.getBounds());
      setZoom(map.getZoom());
    };
    
    // Initial set
    handleMove();
    
    // Event listeners
    map.on('moveend', handleMove);
    map.on('zoomend', handleMove);
    
    return () => {
      map.off('moveend', handleMove);
      map.off('zoomend', handleMove);
    };
  }, [map]);
  
  // Process vessels based on viewport - only do expensive calculations when bounds or zoom changes
  useEffect(() => {
    if (!mapBounds) return;
    
    // Decide whether to cluster or not based on zoom level and number of vessels
    const shouldCluster = zoom < 6 && vessels.length > 100;
    
    // Filter to only vessels in bounds (with padding to ensure smooth panning)
    let visibleVessels: Vessel[] = [];
    
    // Create a padded bounds for smoother rendering during panning
    const padding = 0.5; // 50% padding around viewport
    const paddedBounds = mapBounds.pad(padding);
    
    for (const vessel of vessels) {
      if (!vessel.currentLat || !vessel.currentLng) continue;
      
      const lat = parseFloat(vessel.currentLat);
      const lng = parseFloat(vessel.currentLng);
      
      if (isNaN(lat) || isNaN(lng)) continue;
      
      // Check if in padded bounds
      if (paddedBounds.contains([lat, lng])) {
        visibleVessels.push(vessel);
      }
    }
    
    // Cap the number of vessels to render based on zoom level to maintain performance
    const maxVessels = zoom < 3 ? 200 : zoom < 5 ? 500 : 2500;
    if (visibleVessels.length > maxVessels) {
      // If we have too many vessels, sample them
      const samplingRate = maxVessels / visibleVessels.length;
      visibleVessels = visibleVessels.filter(() => Math.random() < samplingRate);
    }
    
    // For clustering at low zoom levels
    if (shouldCluster) {
      // Convert vessels to points for clustering
      const points = visibleVessels.map(vessel => ({
        lat: parseFloat(vessel.currentLat || '0'),
        lng: parseFloat(vessel.currentLng || '0'),
        data: vessel
      }));
      
      // Define cluster distance based on zoom
      const clusterDistance = zoom < 3 ? 100 : zoom < 5 ? 50 : 30;
      
      // Do clustering
      const clusteredPoints: Array<{
        lat: number;
        lng: number;
        count: number;
        points: Array<{lat: number, lng: number, data: Vessel}>;
      }> = [];
      
      // Simple clustering algorithm
      const processed = new Set<number>();
      
      for (let i = 0; i < points.length; i++) {
        if (processed.has(i)) continue;
        
        const point = points[i];
        processed.add(i);
        
        // Find nearby points
        const nearby = [];
        for (let j = 0; j < points.length; j++) {
          if (i === j || processed.has(j)) continue;
          
          const otherPoint = points[j];
          const distance = Math.sqrt(
            Math.pow((point.lat - otherPoint.lat) * 111, 2) +
            Math.pow((point.lng - otherPoint.lng) * 111 * Math.cos(point.lat * Math.PI / 180), 2)
          );
          
          if (distance < clusterDistance / 111) {
            nearby.push(otherPoint);
            processed.add(j);
          }
        }
        
        if (nearby.length > 0) {
          // Create a cluster
          const allPoints = [point, ...nearby];
          
          // Calculate center
          const centerLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
          const centerLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;
          
          clusteredPoints.push({
            lat: centerLat,
            lng: centerLng,
            count: allPoints.length,
            points: allPoints
          });
        } else {
          // Individual point
          clusteredPoints.push({
            lat: point.lat,
            lng: point.lng,
            count: 1,
            points: [point]
          });
        }
      }
      
      setClusters(clusteredPoints);
      setRenderedVessels([]); // Clear individual vessels when clustered
    } else {
      // No clustering, just render individual vessels
      setClusters([]);
      setRenderedVessels(visibleVessels);
    }
  }, [mapBounds, zoom, vessels]);
  
  // Split rendering between clusters (for low zoom) and individual vessels (for high zoom)
  return (
    <>
      {/* Render clusters at low zoom levels */}
      {clusters.length > 0 && clusters.map((cluster, index) => (
        <CircleMarker
          key={`cluster-${index}`}
          center={[cluster.lat, cluster.lng]}
          radius={Math.min(20, 10 + Math.log(cluster.count) * 3)}
          pathOptions={{
            fillColor: '#3388ff',
            fillOpacity: 0.6,
            weight: 1,
            color: '#fff'
          }}
          eventHandlers={{
            click: () => {
              // If fewer vessels, show them individually
              if (cluster.count <= 5) {
                // Show all vessels in this cluster
                setRenderedVessels(cluster.points.map((p: any) => p.data));
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
            metadata = JSON.parse(vessel.metadata);
          }
        } catch (e) {
          console.error('Failed to parse vessel metadata:', e);
        }
        
        // Only render if we have valid coordinates
        if (vessel.currentLat && vessel.currentLng) {
          const lat = parseFloat(vessel.currentLat);
          const lng = parseFloat(vessel.currentLng);
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker
              key={`vessel-${vessel.id}`}
              position={[lat, lng]}
              icon={vesselIcon(metadata.heading, metadata.speed, vessel.vesselType)}
              eventHandlers={{
                click: () => {
                  onVesselSelect(vessel);
                }
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="bg-blue-50 p-2 rounded-md mb-2 border-l-4 border-blue-500">
                    <p className="font-bold text-base text-blue-700">{vessel.name}</p>
                    <p className="text-xs text-blue-600">{vessel.vesselType.toUpperCase()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                    <div className="font-semibold">IMO:</div>
                    <div>{vessel.imo}</div>
                    
                    <div className="font-semibold">MMSI:</div>
                    <div>{vessel.mmsi}</div>
                    
                    <div className="font-semibold">Flag:</div>
                    <div>{vessel.flag}</div>
                    
                    <div className="font-semibold">Speed:</div>
                    <div>{metadata.speed} knots</div>
                    
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
                      checked={!!vesselsWithRoutes[vessel.id]}
                      onCheckedChange={(checked) => {
                        setVesselsWithRoutes(prev => ({
                          ...prev,
                          [vessel.id]: checked
                        }));
                      }}
                      className="scale-75 origin-right"
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 mt-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent map click from interfering
                      // Close the popup
                      const closeButton = e.currentTarget.closest('.leaflet-popup')?.querySelector('.leaflet-popup-close-button');
                      if (closeButton instanceof HTMLElement) {
                        closeButton.click();
                      }
                      // Navigate to vessel detail page
                      window.location.href = `/vessels/${vessel.id}`;
                    }}
                  >
                    <Ship className="h-3 w-3 mr-1" />
                    Show Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        }
        
        return null;
      })}
    </>
  );
}

// Similar component for refineries
interface OptimizedRefineryLayerProps {
  refineries: Refinery[];
  onRefinerySelect: (refinery: Refinery) => void;
}

export function OptimizedRefineryLayer({ 
  refineries, 
  onRefinerySelect 
}: OptimizedRefineryLayerProps) {
  const map = useMap();
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  
  // Update bounds when map moves
  useEffect(() => {
    if (!map) return;
    
    const handleMove = () => {
      setMapBounds(map.getBounds());
    };
    
    // Initial set
    handleMove();
    
    // Event listeners
    map.on('moveend', handleMove);
    
    return () => {
      map.off('moveend', handleMove);
    };
  }, [map]);
  
  // Only render refineries in viewport (with padding)
  const visibleRefineries = useMemo(() => {
    if (!mapBounds) return [];
    
    // Add padding for smoother rendering during panning
    const paddedBounds = mapBounds.pad(0.5);
    
    return refineries.filter(refinery => {
      if (!refinery.lat || !refinery.lng) return false;
      
      const lat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat;
      const lng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng;
      
      if (isNaN(lat) || isNaN(lng)) return false;
      
      return paddedBounds.contains([lat, lng]);
    });
  }, [refineries, mapBounds]);
  
  return (
    <>
      {visibleRefineries.map(refinery => {
        // Only render if we have valid coordinates
        if (refinery.lat && refinery.lng) {
          const lat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat;
          const lng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng;
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker
              key={`refinery-${refinery.id}`}
              position={[lat, lng]}
              icon={refineryIcon()}
              eventHandlers={{
                click: () => {
                  onRefinerySelect(refinery);
                }
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="bg-red-50 p-2 rounded-md mb-2 border-l-4 border-red-500">
                    <p className="font-bold text-base text-red-700">{refinery.name}</p>
                    <p className="text-xs text-red-600">{refinery.region.toUpperCase()} REGION</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                    <div className="font-semibold">Country:</div>
                    <div>{refinery.country}</div>
                    {refinery.capacity && (
                      <>
                        <div className="font-semibold">Capacity:</div>
                        <div>{refinery.capacity.toLocaleString()} bpd</div>
                      </>
                    )}
                    {refinery.status && (
                      <>
                        <div className="font-semibold">Status:</div>
                        <div className="capitalize">{refinery.status}</div>
                      </>
                    )}
                  </div>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 mt-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent map click from interfering
                      // Close the popup
                      const closeButton = e.currentTarget.closest('.leaflet-popup')?.querySelector('.leaflet-popup-close-button');
                      if (closeButton instanceof HTMLElement) {
                        closeButton.click();
                      }
                      // Navigate to refinery detail page
                      window.location.href = `/refineries/${refinery.id}`;
                    }}
                  >
                    <Factory className="h-3 w-3 mr-1" />
                    Show Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </>
  );
}

// Similar component for ports
interface OptimizedPortLayerProps {
  ports: Port[];
  onPortSelect: (port: Port) => void;
}

export function OptimizedPortLayer({ 
  ports, 
  onPortSelect 
}: OptimizedPortLayerProps) {
  const map = useMap();
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  
  // Update bounds when map moves
  useEffect(() => {
    if (!map) return;
    
    const handleMove = () => {
      setMapBounds(map.getBounds());
    };
    
    // Initial set
    handleMove();
    
    // Event listeners
    map.on('moveend', handleMove);
    
    return () => {
      map.off('moveend', handleMove);
    };
  }, [map]);
  
  // Only render ports in viewport (with padding)
  const visiblePorts = useMemo(() => {
    if (!mapBounds) return [];
    
    // Add padding for smoother rendering during panning
    const paddedBounds = mapBounds.pad(0.5);
    
    return ports.filter(port => {
      if (!port.lat || !port.lng) return false;
      
      const lat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
      const lng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
      
      if (isNaN(lat) || isNaN(lng)) return false;
      
      return paddedBounds.contains([lat, lng]);
    });
  }, [ports, mapBounds]);
  
  return (
    <>
      {visiblePorts.map(port => {
        // Only render if we have valid coordinates
        if (port.lat && port.lng) {
          const lat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
          const lng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker
              key={`port-${port.id}`}
              position={[lat, lng]}
              icon={portIcon()}
              eventHandlers={{
                click: () => {
                  onPortSelect(port);
                }
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="bg-blue-50 p-2 rounded-md mb-2 border-l-4 border-blue-500">
                    <p className="font-bold text-base text-blue-700">{port.name}</p>
                    <p className="text-xs text-blue-600">{port.region.toUpperCase()} REGION</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                    <div className="font-semibold">Country:</div>
                    <div>{port.country}</div>
                    {port.capacity && (
                      <>
                        <div className="font-semibold">Capacity:</div>
                        <div>{port.capacity.toLocaleString()} tons/year</div>
                      </>
                    )}
                    {port.type && (
                      <>
                        <div className="font-semibold">Type:</div>
                        <div className="capitalize">{port.type.replace('_', ' ')}</div>
                      </>
                    )}
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 mt-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent map click from interfering
                      // Close the popup
                      const closeButton = e.currentTarget.closest('.leaflet-popup')?.querySelector('.leaflet-popup-close-button');
                      if (closeButton instanceof HTMLElement) {
                        closeButton.click();
                      }
                      // Navigate to port detail page
                      window.location.href = `/ports/${port.id}`;
                    }}
                  >
                    <Anchor className="h-3 w-3 mr-1" />
                    Show Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </>
  );
}