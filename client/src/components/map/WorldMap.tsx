import { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { Vessel, Refinery, Region, MapPosition, RegionData } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Locate, Ship, Factory, Navigation, Droplet } from "lucide-react";
import { REGIONS } from "@/../../shared/constants";

// Define the marker icons here to prevent recreation on each render
const createVesselIcon = (type: string) => {
  let className = 'vessel-marker-oil';
  let color = '#FF6B6B';
  
  if (type.toLowerCase().includes('lng')) {
    className = 'vessel-marker-lng';
    color = '#4ECDC4';
  } else if (type.toLowerCase().includes('cargo')) {
    className = 'vessel-marker-cargo';
    color = '#FFD166';
  } else if (type.toLowerCase().includes('container')) {
    className = 'vessel-marker-container';
    color = '#118AB2';
  } else if (type.toLowerCase().includes('chemical')) {
    className = 'vessel-marker-chemical';
    color = '#9A48D0';
  }
  
  return L.divIcon({
    className: `vessel-marker ${className}`,
    html: `
      <div class="vessel-boat" style="position: relative; width: 14px; height: 14px;">
        <div style="position: absolute; top: 0; left: 0; width: 14px; height: 14px; background-color: ${color}; border-radius: 50%; opacity: 0.2; animation: pulse 2s infinite;"></div>
        <div style="position: absolute; top: 2px; left: 2px; width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; opacity: 0.6;"></div>
        <div style="position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; background-color: ${color}; border-radius: 50%; opacity: 1;">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="white" stroke="white">
            <path d="M2 22a8 8 0 1 1 16 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z"/>
          </svg>
        </div>
      </div>
      <div class="absolute -top-6 -left-3 text-white bg-black/70 px-1 rounded text-[10px] whitespace-nowrap font-bold">
        ${getVesselEmoji(type)}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createRefineryIcon = (status: string = 'operational') => {
  let color = '#28a745'; // operational - green
  
  if (status.toLowerCase().includes('maintenance')) {
    color = '#fd7e14'; // maintenance - orange
  } else if (status.toLowerCase().includes('offline')) {
    color = '#dc3545'; // offline - red
  }
  
  return L.divIcon({
    className: `refinery-marker`,
    html: `
      <div style="position: relative; width: 28px; height: 28px;">
        <div style="position: absolute; width: 28px; height: 28px; background-color: white; border: 2px solid ${color}; border-radius: 50%;"></div>
        <div style="position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 22V16M12 22V10M16 22V16M19 22H5C3.895 22 3 21.105 3 20V10.5C3 9.395 3.895 8.5 5 8.5H5.5M5.5 8.5H18.5V4.5C18.5 3.395 17.605 2.5 16.5 2.5H7.5C6.395 2.5 5.5 3.395 5.5 4.5V8.5Z"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const getVesselEmoji = (type: string): string => {
  if (type.toLowerCase().includes('lng')) return '🔋 LNG';
  if (type.toLowerCase().includes('container')) return '📦 Container';
  if (type.toLowerCase().includes('chemical')) return '⚗️ Chemical';
  if (type.toLowerCase().includes('cargo')) return '🚢 Cargo';
  return '🛢️ Oil';
};

interface WorldMapProps {
  vessels: Vessel[];
  refineries: Refinery[];
  selectedRegion: Region | null;
  trackedVessel?: Vessel | null;
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick?: (refinery: Refinery) => void;
  isLoading?: boolean;
}

// Region center positions
const regionPositions: Record<string, MapPosition> = {
  'north-america': { lat: 40, lng: -100, zoom: 4 },
  'south-america': { lat: -15, lng: -60, zoom: 3 },
  'central-america': { lat: 15, lng: -85, zoom: 4 },
  'western-europe': { lat: 50, lng: 0, zoom: 4 },
  'eastern-europe': { lat: 50, lng: 25, zoom: 4 },
  'middle-east': { lat: 28, lng: 45, zoom: 4 },
  'north-africa': { lat: 25, lng: 20, zoom: 4 },
  'southern-africa': { lat: -10, lng: 20, zoom: 3 },
  'russia': { lat: 60, lng: 80, zoom: 3 },
  'china': { lat: 35, lng: 105, zoom: 4 },
  'asia-pacific': { lat: 20, lng: 110, zoom: 3 },
  'southeast-asia-oceania': { lat: -10, lng: 130, zoom: 3 }
};

// MapUpdater component to change view when region changes
function MapUpdater({ region }: { region: Region | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (region && regionPositions[region]) {
      const position = regionPositions[region];
      map.flyTo([position.lat, position.lng], position.zoom);
    }
  }, [region, map]);
  
  return null;
}

// VesselTracker component to center the map on tracked vessel
function VesselTracker({ vessel }: { vessel: Vessel | null | undefined }) {
  const map = useMap();
  
  useEffect(() => {
    if (vessel && vessel.currentLat && vessel.currentLng) {
      map.flyTo([vessel.currentLat, vessel.currentLng], 8, {
        animate: true,
        duration: 1.5
      });
    }
  }, [vessel, map]);
  
  // Create a historical path for the tracked vessel - simulated previous positions
  const getVesselPath = () => {
    if (!vessel?.currentLat || !vessel?.currentLng) return [];
    
    const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat));
    const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng));
    
    // Create simulated historical path points (slight variations from current position)
    return [
      [lat - 0.8, lng - 0.5],
      [lat - 0.5, lng - 0.3],
      [lat - 0.3, lng - 0.15],
      [lat - 0.1, lng - 0.05],
      [lat, lng] // Current position
    ];
  };
  
  return vessel ? (
    <>
      {/* Vessel tracking path line */}
      <Polyline
        positions={getVesselPath() as L.LatLngExpression[]}
        color="#ff5722"
        weight={3}
        opacity={0.8}
        dashArray="5,10"
      >
        <Tooltip permanent direction="center" className="vessel-path-tooltip">
          <span className="text-xs font-bold">Vessel Path</span>
        </Tooltip>
      </Polyline>
      
      {/* Current position marker */}
      {vessel.currentLat && vessel.currentLng && (
        <Marker
          position={[vessel.currentLat, vessel.currentLng]}
          icon={L.divIcon({
            className: 'tracking-position-marker',
            html: `<div class="w-4 h-4 rounded-full bg-orange-500 border-2 border-white pulse-animation"></div>`,
            iconSize: [16, 16],
          })}
        >
          <Popup>Current position</Popup>
        </Marker>
      )}
      
      <div className="absolute top-20 right-4 z-30 bg-white rounded-lg shadow-md p-3 max-w-[220px]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold flex items-center">
            <Navigation className="h-3 w-3 mr-1 text-blue-500"/>
            Tracking Vessel
          </h4>
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[10px]">LIVE</Badge>
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-medium">{vessel.name}</div>
          <div className="flex justify-between">
            <span className="text-gray-500">Vessel Type:</span>
            <span>{vessel.vesselType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Position:</span>
            <span>
              {typeof vessel.currentLat === 'number' ? vessel.currentLat.toFixed(3) : parseFloat(String(vessel.currentLat)).toFixed(3)}, 
              {typeof vessel.currentLng === 'number' ? vessel.currentLng.toFixed(3) : parseFloat(String(vessel.currentLng)).toFixed(3)}
            </span>
          </div>
          {vessel.destinationPort && (
            <div className="flex justify-between">
              <span className="text-gray-500">Heading to:</span>
              <span>{vessel.destinationPort.split(',')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;
}

export default function WorldMap({ 
  vessels, 
  refineries, 
  selectedRegion, 
  trackedVessel,
  onVesselClick,
  onRefineryClick,
  isLoading = false 
}: WorldMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [renderedVessels, setRenderedVessels] = useState<Vessel[]>([]);
  const [visibleMarkers, setVisibleMarkers] = useState<Set<number>>(new Set());
  
  // Default center on world view
  const defaultPosition: MapPosition = { lat: 25, lng: 10, zoom: 2 };
  
  // Progressive loading for better performance
  useEffect(() => {
    // First, immediately render vessels near the view (if tracked or selected region)
    let initialVessels: Vessel[] = [];
    
    // Simple function to check if a vessel is an oil vessel
    const isOilVessel = (vessel: Vessel): boolean => {
      if (!vessel || !vessel.vesselType) return false;
      
      const type = vessel.vesselType.toLowerCase();
      return (
        type.includes('oil') ||
        type.includes('tanker') ||
        type.includes('crude') ||
        type.includes('vlcc')
      );
    };
    
    // Filter for vessels with location and oil type
    const filterOilVesselsOnly = (v: Vessel): boolean => {
      return Boolean(v.currentLat) && 
             Boolean(v.currentLng) && 
             isOilVessel(v);
    };
    
    if (trackedVessel) {
      // If tracking a vessel, prioritize vessels nearby
      initialVessels = vessels
        .filter(filterOilVesselsOnly)
        .slice(0, 50); // Start with just a few vessels for immediate feedback
    } else if (selectedRegion) {
      // If region selected, prioritize vessels in this region
      initialVessels = vessels
        .filter(v => v.currentRegion === selectedRegion && filterOilVesselsOnly(v))
        .slice(0, 100);
    } else {
      // Default case - show ONLY OIL VESSELS when app first runs
      initialVessels = vessels
        .filter(filterOilVesselsOnly)
        .slice(0, 150); // Show more oil vessels initially
    }
    
    // Set initial vessels
    setRenderedVessels(initialVessels);
    
    // Then progressively load the rest in batches - ONLY OIL VESSELS
    // Make sure to get only vessels that haven't been loaded yet
    const oilVessels = vessels.filter(filterOilVesselsOnly);
    
    // Get remaining vessels that weren't loaded in the initial batch
    const remainingVessels = oilVessels
      .filter(v => !initialVessels.some(iv => iv.id === v.id))
      .slice(0, 200); // Limit total vessels for better performance
    
    const BATCH_SIZE = 50;
    const BATCH_DELAY = 500; // ms between batches
    
    // Load in batches
    for (let i = 0; i < remainingVessels.length; i += BATCH_SIZE) {
      const batch = remainingVessels.slice(i, i + BATCH_SIZE);
      
      setTimeout(() => {
        setRenderedVessels(prev => [...prev, ...batch]);
      }, BATCH_DELAY * (i / BATCH_SIZE + 1));
    }
  }, [vessels, trackedVessel, selectedRegion]);
  
  // Calculate shipping routes more efficiently
  const getShippingRoutes = () => {
    const routes: {
      key: string;
      points: [number, number][];
      vessel: Vessel;
      refinery: Refinery;
      active: boolean;
    }[] = [];
    
    // Only use rendered vessels for routes to improve performance
    // Also limit the total number of routes to avoid overwhelming the map
    const MAX_ROUTES = 50;
    const vesselSource = trackedVessel 
      ? [trackedVessel] // If tracking a vessel, only show its route
      : renderedVessels.slice(0, Math.min(renderedVessels.length, 100)); // Otherwise sample a subset
    
    let routeCount = 0;
    
    vesselSource.forEach(vessel => {
      if (!vessel.currentLat || !vessel.currentLng || routeCount >= MAX_ROUTES) return;
      
      // Find the nearest refinery in the same region (if available)
      // For performance, limit the number of refineries to check
      const nearbyRefineries = refineries
        .filter(r => r.region === vessel.currentRegion || !vessel.currentRegion)
        .slice(0, 10); // Only check closest 10 refineries
      
      if (nearbyRefineries.length > 0) {
        // Find the closest refinery
        let closestRefinery = nearbyRefineries[0];
        let shortestDistance = calculateDistance(
          vessel.currentLat, 
          vessel.currentLng, 
          nearbyRefineries[0].lat, 
          nearbyRefineries[0].lng
        );
        
        nearbyRefineries.forEach(refinery => {
          const distance = calculateDistance(
            vessel.currentLat!, 
            vessel.currentLng!, 
            refinery.lat, 
            refinery.lng
          );
          
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestRefinery = refinery;
          }
        });
        
        // Add route if the refinery is within a reasonable distance (~3000km)
        if (shortestDistance < 30) {
          routes.push({
            key: `route-${vessel.id}-${closestRefinery.id}`,
            points: [
              [vessel.currentLat, vessel.currentLng],
              [closestRefinery.lat, closestRefinery.lng]
            ],
            vessel,
            refinery: closestRefinery,
            // Active if vessel is en route (has destination) and refinery is operational
            active: !!vessel.destinationPort && closestRefinery.status?.toLowerCase() === 'operational'
          });
          
          routeCount++;
        }
      }
    });
    
    return routes;
  };
  
  // Calculate distance between coordinates (simplified)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };
  
  // Get shipping routes
  const shippingRoutes = getShippingRoutes();
  
  // Custom map controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };
  
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };
  
  const handleResetView = () => {
    if (mapRef.current) {
      if (selectedRegion && regionPositions[selectedRegion]) {
        const position = regionPositions[selectedRegion];
        mapRef.current.flyTo([position.lat, position.lng], position.zoom);
      } else {
        mapRef.current.flyTo([defaultPosition.lat, defaultPosition.lng], defaultPosition.zoom);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] bg-ocean flex items-center justify-center">
        <div className="text-primary text-lg">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] bg-ocean">
      <MapContainer
        center={[defaultPosition.lat, defaultPosition.lng]}
        zoom={defaultPosition.zoom}
        zoomControl={false}
        className="h-full w-full"
        ref={mapRef}
        whenReady={(event) => { 
          // Fix TypeScript error by using the correct type
          if (event && event.target) {
            mapRef.current = event.target;
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Update map when region changes */}
        <MapUpdater region={selectedRegion} />
        
        {/* Track vessel if one is selected */}
        {trackedVessel && <VesselTracker vessel={trackedVessel} />}
        
        {/* Shipping Routes (draw first to be on bottom) */}
        {shippingRoutes.map((route) => (
          <Polyline
            key={route.key}
            positions={route.points}
            className={route.active ? 'route-path-active' : 'route-path'}
            weight={2}
            dashArray={route.active ? undefined : "5, 5"}
          >
            <Tooltip direction="center" permanent interactive opacity={0.7}>
              <div className="text-[10px] font-medium">
                {route.vessel.name} → {route.refinery.name}
              </div>
            </Tooltip>
          </Polyline>
        ))}
        
        {/* Refinery Markers */}
        {refineries.map((refinery) => (
          <Marker
            key={refinery.id}
            position={[refinery.lat, refinery.lng]}
            icon={createRefineryIcon(refinery.status)}
            eventHandlers={{
              click: () => onRefineryClick && onRefineryClick(refinery)
            }}
          >
            <Popup>
              <div className="text-sm p-1">
                <h3 className="font-medium flex items-center">
                  <Factory className="h-4 w-4 mr-1 text-primary" />
                  {refinery.name}
                </h3>
                <p className="text-gray-600 text-xs">{refinery.country}, {refinery.region}</p>
                <div className="flex flex-col space-y-1 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{refinery.capacity?.toLocaleString() || 'N/A'} bpd</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${refinery.status?.toLowerCase() === 'operational' ? 'text-green-600' : refinery.status?.toLowerCase() === 'maintenance' ? 'text-orange-500' : 'text-red-500'}`}>
                      {refinery.status || 'Unknown'}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="default" 
                  className="w-full mt-2 text-xs h-7 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (onRefineryClick) onRefineryClick(refinery);
                    // Navigate to refinery detail page
                    window.location.href = `/refineries/${refinery.id}`;
                  }}
                >
                  <Factory className="h-3 w-3 mr-1" />
                  View Refinery Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Vessel Markers (draw last to be on top) - Using progressive loading */}
        {renderedVessels.map((vessel) => (
          vessel.currentLat && vessel.currentLng ? (
            <Marker
              key={vessel.id}
              position={[vessel.currentLat, vessel.currentLng]}
              icon={createVesselIcon(vessel.vesselType || 'oil')}
              eventHandlers={{
                click: () => onVesselClick(vessel)
              }}
            >
              <Popup>
                <div className="text-sm p-1">
                  <h3 className="font-medium flex items-center">
                    <Ship className="h-4 w-4 mr-1 text-primary" />
                    {vessel.name}
                  </h3>
                  <p className="text-gray-600 text-xs">{vessel.vesselType} | {vessel.flag}</p>
                  <div className="flex flex-col space-y-1 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">IMO:</span>
                      <span className="font-medium">{vessel.imo}</span>
                    </div>
                    {vessel.cargoType && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Cargo:</span>
                        <span className="font-medium">{vessel.cargoType}</span>
                      </div>
                    )}
                    {vessel.departurePort && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium">{vessel.departurePort}</span>
                      </div>
                    )}
                    {vessel.destinationPort && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium">{vessel.destinationPort}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex mt-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-xs h-7"
                      onClick={() => onVesselClick(vessel)}
                    >
                      <Ship className="h-3 w-3 mr-1" />
                      Track
                    </Button>
                    <Button 
                      variant="default" 
                      className="flex-1 text-xs h-7 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        onVesselClick(vessel);
                        // Navigate to vessel detail page
                        window.location.href = `/vessels/${vessel.id}`;
                      }}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
        
        {/* Display info about oil vessels being shown */}
        <div className="absolute bottom-4 right-4 bg-white rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm z-30 flex items-center space-x-2">
          <Ship className="h-4 w-4 text-red-500" />
          <div>
            <span className="font-bold">OIL VESSELS ONLY</span>
            <span className="ml-1">({renderedVessels.length} displayed)</span>
          </div>
        </div>
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-md shadow-sm z-30">
        <Button variant="ghost" size="icon" onClick={handleZoomIn} className="p-2 text-gray-600 hover:bg-gray-100 hover:text-primary">
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleZoomOut} className="p-2 text-gray-600 hover:bg-gray-100 hover:text-primary border-t border-gray-100">
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleResetView} className="p-2 text-gray-600 hover:bg-gray-100 hover:text-primary border-t border-gray-100">
          <Locate className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-md shadow-sm p-3 z-30">
        <div className="text-xs font-medium mb-2">Vessel Types</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div key="legend-oil-tanker" className="flex items-center space-x-2 text-xs">
            <div className="relative h-4 w-4">
              <div className="absolute top-0 left-0 w-full h-full bg-[#FF6B6B] rounded-full opacity-20"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-[#FF6B6B] rounded-full"></div>
            </div>
            <span>Oil Tankers</span>
          </div>
          <div key="legend-lng-carrier" className="flex items-center space-x-2 text-xs">
            <div className="relative h-4 w-4">
              <div className="absolute top-0 left-0 w-full h-full bg-[#4ECDC4] rounded-full opacity-20"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-[#4ECDC4] rounded-full"></div>
            </div>
            <span>LNG Carriers</span>
          </div>
          <div key="legend-cargo" className="flex items-center space-x-2 text-xs">
            <div className="relative h-4 w-4">
              <div className="absolute top-0 left-0 w-full h-full bg-[#FFD166] rounded-full opacity-20"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-[#FFD166] rounded-full"></div>
            </div>
            <span>Cargo Vessels</span>
          </div>
          <div key="legend-container" className="flex items-center space-x-2 text-xs">
            <div className="relative h-4 w-4">
              <div className="absolute top-0 left-0 w-full h-full bg-[#118AB2] rounded-full opacity-20"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-[#118AB2] rounded-full"></div>
            </div>
            <span>Container Ships</span>
          </div>
          <div key="legend-chemical" className="flex items-center space-x-2 text-xs">
            <div className="relative h-4 w-4">
              <div className="absolute top-0 left-0 w-full h-full bg-[#9A48D0] rounded-full opacity-20"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-[#9A48D0] rounded-full"></div>
            </div>
            <span>Chemical Tankers</span>
          </div>
        </div>
        
        <div className="text-xs font-medium mt-3 mb-2">Refinery Status</div>
        <div className="grid grid-cols-1 gap-y-1">
          <div key="refinery-operational" className="flex items-center space-x-2 text-xs">
            <div className="relative h-4 w-4">
              <div className="h-4 w-4 rounded-full bg-white border-2 border-[#28a745] flex items-center justify-center">
                <div className="h-2 w-2 bg-[#28a745] rounded-full"></div>
              </div>
            </div>
            <span>Operational</span>
          </div>
          <div key="refinery-maintenance" className="flex items-center space-x-2 text-xs">
            <div className="relative h-4 w-4">
              <div className="h-4 w-4 rounded-full bg-white border-2 border-[#fd7e14] flex items-center justify-center">
                <div className="h-2 w-2 bg-[#fd7e14] rounded-full"></div>
              </div>
            </div>
            <span>Maintenance</span>
          </div>
          <div key="refinery-offline" className="flex items-center space-x-2 text-xs">
            <div className="relative h-4 w-4">
              <div className="h-4 w-4 rounded-full bg-white border-2 border-[#dc3545] flex items-center justify-center">
                <div className="h-2 w-2 bg-[#dc3545] rounded-full"></div>
              </div>
            </div>
            <span>Offline</span>
          </div>
        </div>
        
        <div className="text-xs font-medium mt-3 mb-2">Shipping Routes</div>
        <div className="grid grid-cols-1 gap-y-1">
          <div key="route-planned" className="flex items-center space-x-2 text-xs">
            <div className="w-6 h-0 border-b-2 border-gray-500/40 border-dashed"></div>
            <span>Planned Route</span>
          </div>
          <div key="route-active" className="flex items-center space-x-2 text-xs">
            <div className="w-6 h-0 border-b-2 border-blue-500/60"></div>
            <span>Active Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}
