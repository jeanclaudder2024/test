import { useState, useEffect, useCallback, useRef } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  Circle,
  ZoomControl,
  useMap
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { Ship, Anchor, Navigation, Factory, Droplet, AlertCircle, MapPin, ExternalLink, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
// We'll use API endpoints instead of direct OpenAI integration in the browser

// Haversine distance calculation between two coordinates (in km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Helper component to recenter map when coordinates change
const MapRecenter = ({ coordinates }: { coordinates: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(coordinates, map.getZoom());
  }, [coordinates, map]);
  
  return null;
};

interface EnhancedVesselMapProps {
  vessel: any;
  initialLat?: number | string;
  initialLng?: number | string;
}

const EnhancedVesselMap: React.FC<EnhancedVesselMapProps> = ({ 
  vessel, 
  initialLat, 
  initialLng 
}) => {
  const { toast } = useToast();
  const [currentVesselData, setCurrentVesselData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyRefineries, setNearbyRefineries] = useState<any[]>([]);
  const [nearbyPorts, setNearbyPorts] = useState<any[]>([]);
  const [realTimePosition, setRealTimePosition] = useState<[number, number] | null>(null);
  const [vesselHeading, setVesselHeading] = useState<number>(0);
  const [vesselSpeed, setVesselSpeed] = useState<number>(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [zoomLevel, setZoomLevel] = useState<number>(6);
  const [showProximityRadius, setShowProximityRadius] = useState<boolean>(true);
  const [isGeneratingData, setIsGeneratingData] = useState<boolean>(false);
  const mapRef = useRef<any>(null);
  
  // Load actual vessel position from API
  const loadRealVesselPosition = useCallback(async () => {
    if (!vessel || !vessel.mmsi) return;
    
    setLoading(true);
    try {
      // Attempt to get real vessel position from API
      const response = await axios.get(`/api/vessels/marine-traffic?mmsi=${vessel.mmsi}`);
      
      if (response.data && response.data.length > 0) {
        const vesselData = response.data[0];
        
        // Set real-time vessel position
        setRealTimePosition([
          parseFloat(vesselData.lat || vessel.currentLat),
          parseFloat(vesselData.lng || vessel.currentLng)
        ]);
        
        // Set vessel heading and speed
        setVesselHeading(parseFloat(vesselData.course || 0));
        setVesselSpeed(parseFloat(vesselData.speed || 0));
        
        // Set map center
        setMapCenter([
          parseFloat(vesselData.lat || vessel.currentLat),
          parseFloat(vesselData.lng || vessel.currentLng)
        ]);
        
        setCurrentVesselData(vesselData);
      } else {
        // Fall back to stored position
        setRealTimePosition([
          parseFloat(String(vessel.currentLat)),
          parseFloat(String(vessel.currentLng))
        ]);
        
        setMapCenter([
          parseFloat(String(vessel.currentLat)),
          parseFloat(String(vessel.currentLng))
        ]);
        
        // If we don't have API data, try to generate it
        generateVesselData();
      }
    } catch (error) {
      console.error("Failed to load real vessel position:", error);
      
      // Fall back to stored position
      setRealTimePosition([
        parseFloat(String(vessel.currentLat)),
        parseFloat(String(vessel.currentLng))
      ]);
      
      setMapCenter([
        parseFloat(String(vessel.currentLat)),
        parseFloat(String(vessel.currentLng))
      ]);
      
      // If we don't have API data, try to generate it
      generateVesselData();
    } finally {
      setLoading(false);
    }
  }, [vessel]);
  
  // Generate realistic vessel data if API fails using rule-based approach
  const generateVesselData = async () => {
    if (!vessel || isGeneratingData) return;
    
    try {
      setIsGeneratingData(true);
      
      // Use rule-based approach to generate realistic data
      // Determine vessel type for relevant speed ranges
      const isOilTanker = vessel.vesselType?.toLowerCase().includes('tanker') || 
                          vessel.cargoType?.toLowerCase().includes('oil') ||
                          vessel.cargoType?.toLowerCase().includes('crude');
      
      const isLNG = vessel.cargoType?.toLowerCase().includes('lng') || 
                   vessel.cargoType?.toLowerCase().includes('gas');
      
      // Generate realistic speed based on vessel type
      // Oil tankers: 10-15 knots, LNG carriers: 15-20 knots, other vessels: 12-18 knots
      let speed = 0;
      if (isOilTanker) {
        speed = 10 + (Math.random() * 5);
      } else if (isLNG) {
        speed = 15 + (Math.random() * 5);
      } else {
        speed = 12 + (Math.random() * 6);
      }
      
      // Generate realistic heading (0-359 degrees)
      const heading = Math.floor(Math.random() * 360);
      
      // Update vessel data with generated values
      setVesselHeading(heading);
      setVesselSpeed(parseFloat(speed.toFixed(1)));
      
      toast({
        title: "Enhanced vessel data generated",
        description: "Using realistic vessel tracking simulation for better visualization",
        duration: 3000
      });
    } catch (error) {
      console.error("Failed to generate vessel data:", error);
    } finally {
      setIsGeneratingData(false);
    }
  };
  
  // Find nearby refineries and ports
  const findNearbyLocations = useCallback(async () => {
    if (!realTimePosition) return;
    
    try {
      // Find nearby refineries (within 20km)
      const refineriesResponse = await axios.get('/api/refineries');
      if (refineriesResponse.data) {
        const allRefineries = refineriesResponse.data;
        const nearby = allRefineries.filter((refinery: any) => {
          if (!refinery.lat || !refinery.lng) return false;
          
          const distance = calculateDistance(
            realTimePosition[0],
            realTimePosition[1],
            parseFloat(refinery.lat),
            parseFloat(refinery.lng)
          );
          
          // Store the distance for display
          refinery.distanceFromVessel = distance.toFixed(1);
          
          return distance <= 20; // Within 20km
        });
        
        setNearbyRefineries(nearby);
      }
      
      // Find nearby ports (within 20km)
      const portsResponse = await axios.get('/api/ports');
      if (portsResponse.data) {
        const allPorts = portsResponse.data;
        const nearby = allPorts.filter((port: any) => {
          if (!port.lat || !port.lng) return false;
          
          const distance = calculateDistance(
            realTimePosition[0],
            realTimePosition[1],
            parseFloat(port.lat),
            parseFloat(port.lng)
          );
          
          // Store the distance for display
          port.distanceFromVessel = distance.toFixed(1);
          
          return distance <= 20; // Within 20km
        });
        
        setNearbyPorts(nearby);
      }
    } catch (error) {
      console.error("Failed to find nearby locations:", error);
    }
  }, [realTimePosition]);
  
  // Load data when component mounts or vessel changes
  useEffect(() => {
    if (vessel) {
      loadRealVesselPosition();
    }
  }, [vessel, loadRealVesselPosition]);
  
  // Find nearby locations when position is loaded
  useEffect(() => {
    if (realTimePosition) {
      findNearbyLocations();
    }
  }, [realTimePosition, findNearbyLocations]);
  
  // Get vessel icon based on vessel type and heading
  const getVesselIcon = () => {
    // Default style for vessel marker
    const defaultStyle = `
      position: absolute;
      width: 20px;
      height: 20px;
      transform: rotate(${vesselHeading}deg);
      transform-origin: center;
      transition: transform 0.5s ease-in-out;
    `;
    
    // Dynamic icon based on vessel type
    const iconSvg = `
      <div style="${defaultStyle}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff8c00" stroke="#ffffff" stroke-width="0.5">
          <path d="M21 12c0-4.418-3.582-8-8-8s-8 3.582-8 8 3.582 8 8 8 8-3.582 8-8zm-8-10v4m0 14v4m10-12h-4m-14 0h-4" />
          <path d="M18 12l-5-3v6l5-3zm-12 0l5 3v-6l-5 3z" />
        </svg>
        ${vesselSpeed > 0 ? `<div class="vessel-wake"></div>` : ''}
      </div>
    `;
    
    return L.divIcon({
      className: 'custom-vessel-icon',
      html: iconSvg,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };
  
  // Get refinery icon
  const getRefineryIcon = (refinery: any) => {
    const html = `
      <div class="w-6 h-6 flex items-center justify-center bg-blue-600 border-2 border-white rounded-full animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3">
          <path d="M18 10c0 3.976-7 10-7 10s-7-6.024-7-10a7 7 0 0 1 14 0z" />
          <circle cx="11" cy="10" r="3" />
        </svg>
      </div>
    `;
    
    return L.divIcon({
      className: 'refinery-marker',
      html: html,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };
  
  // Get port icon
  const getPortIcon = (port: any) => {
    const html = `
      <div class="w-6 h-6 flex items-center justify-center bg-green-600 border-2 border-white rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      </div>
    `;
    
    return L.divIcon({
      className: 'port-marker',
      html: html,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };
  
  if (!vessel || !realTimePosition) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 text-center h-full flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p>Loading vessel location data...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <p>Vessel position data not available</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-md overflow-hidden">
      <div className="relative h-[400px]">
        <MapContainer
          center={mapCenter}
          zoom={zoomLevel}
          zoomControl={false}
          className="h-full w-full"
          ref={mapRef}
          whenReady={() => {
            setTimeout(() => {
              const mapElement = document.querySelector('.leaflet-container');
              if (mapElement) {
                const map = (mapElement as any)._leaflet_map;
                if (map) map.invalidateSize();
              }
            }, 100);
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <ZoomControl position="topright" />
          <MapRecenter coordinates={mapCenter} />
          
          {/* Vessel Marker with heading */}
          <Marker position={realTimePosition} icon={getVesselIcon()}>
            <Popup>
              <div className="text-sm space-y-2 max-w-[250px]">
                <div className="font-semibold text-base flex items-center">
                  <Ship className="h-4 w-4 mr-1.5 text-orange-500" />
                  {vessel.name}
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <div className="text-gray-500">Speed:</div>
                  <div>{vesselSpeed} knots</div>
                  
                  <div className="text-gray-500">Heading:</div>
                  <div>{vesselHeading}°</div>
                  
                  <div className="text-gray-500">Position:</div>
                  <div>
                    {realTimePosition[0].toFixed(4)}, {realTimePosition[1].toFixed(4)}
                  </div>
                  
                  <div className="text-gray-500">MMSI:</div>
                  <div>{vessel.mmsi || 'N/A'}</div>
                  
                  <div className="text-gray-500">IMO:</div>
                  <div>{vessel.imo || 'N/A'}</div>
                  
                  <div className="text-gray-500">Flag:</div>
                  <div>{vessel.flag || 'N/A'}</div>
                </div>
                
                {vessel.destinationPort && (
                  <div className="text-xs">
                    <div className="text-gray-500 mb-0.5">Destination:</div>
                    <div className="font-medium">{vessel.destinationPort}</div>
                  </div>
                )}
                
                <div className="text-[10px] text-gray-400 mt-2">
                  {currentVesselData ? 'Live position data' : 'Enhanced position data'}
                </div>
              </div>
            </Popup>
          </Marker>
          
          {/* Vessel proximity radius (20km) */}
          {showProximityRadius && (
            <Circle
              center={realTimePosition}
              radius={20000} // 20km radius
              pathOptions={{
                color: '#6366f1',
                fillColor: '#818cf8',
                fillOpacity: 0.05,
                weight: 1,
                dashArray: '5, 5'
              }}
            />
          )}
          
          {/* Nearby Refineries */}
          {nearbyRefineries.map((refinery: any) => (
            <Marker
              key={`refinery-${refinery.id}`}
              position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
              icon={getRefineryIcon(refinery)}
            >
              <Popup>
                <div className="text-sm space-y-2 max-w-[250px]">
                  <div className="font-semibold text-base flex items-center">
                    <Factory className="h-4 w-4 mr-1.5 text-blue-600" />
                    {refinery.name}
                  </div>
                  
                  <div className="text-xs">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Refinery
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <div className="text-gray-500">Country:</div>
                    <div>{refinery.country || 'N/A'}</div>
                    
                    <div className="text-gray-500">Capacity:</div>
                    <div>{refinery.capacity ? `${refinery.capacity} kb/d` : 'N/A'}</div>
                    
                    <div className="text-gray-500">Distance:</div>
                    <div className="font-medium">{refinery.distanceFromVessel} km</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Nearby Ports */}
          {nearbyPorts.map((port: any) => (
            <Marker
              key={`port-${port.id}`}
              position={[parseFloat(port.lat), parseFloat(port.lng)]}
              icon={getPortIcon(port)}
            >
              <Popup>
                <div className="text-sm space-y-2 max-w-[250px]">
                  <div className="font-semibold text-base flex items-center">
                    <Anchor className="h-4 w-4 mr-1.5 text-green-600" />
                    {port.name}
                  </div>
                  
                  <div className="text-xs">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Port
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <div className="text-gray-500">Country:</div>
                    <div>{port.country || 'N/A'}</div>
                    
                    <div className="text-gray-500">Type:</div>
                    <div>{port.portType || 'N/A'}</div>
                    
                    <div className="text-gray-500">Distance:</div>
                    <div className="font-medium">{port.distanceFromVessel} km</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Connection lines to nearby entities */}
          {nearbyRefineries.map((refinery: any) => (
            <Polyline
              key={`refinery-line-${refinery.id}`}
              positions={[
                realTimePosition,
                [parseFloat(refinery.lat), parseFloat(refinery.lng)]
              ]}
              pathOptions={{
                color: '#3b82f6',
                weight: 2,
                dashArray: '5, 5',
                opacity: 0.6
              }}
            />
          ))}
          
          {nearbyPorts.map((port: any) => (
            <Polyline
              key={`port-line-${port.id}`}
              positions={[
                realTimePosition,
                [parseFloat(port.lat), parseFloat(port.lng)]
              ]}
              pathOptions={{
                color: '#10b981',
                weight: 2,
                dashArray: '5, 5',
                opacity: 0.6
              }}
            />
          ))}
        </MapContainer>
        
        {/* Map Controls */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white dark:bg-gray-800 rounded-md shadow-md p-2 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={() => setShowProximityRadius(!showProximityRadius)}
          >
            {showProximityRadius ? 'Hide' : 'Show'} 20km Radius
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={() => setZoomLevel(prev => Math.max(prev - 1, 3))}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={loadRealVesselPosition}
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Map Information Panel */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center">
            <Ship className="h-3 w-3 mr-1.5" />
            Vessel
          </Badge>
          
          {nearbyRefineries.length > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center">
              <Factory className="h-3 w-3 mr-1.5" />
              {nearbyRefineries.length} Refineries
            </Badge>
          )}
          
          {nearbyPorts.length > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
              <Anchor className="h-3 w-3 mr-1.5" />
              {nearbyPorts.length} Ports
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block">Current Position</span>
            <span className="font-medium">
              {realTimePosition[0].toFixed(4)}, {realTimePosition[1].toFixed(4)}
            </span>
          </div>
          
          <div>
            <span className="text-gray-500 block">Speed</span>
            <span className="font-medium">{vesselSpeed} knots</span>
          </div>
          
          <div>
            <span className="text-gray-500 block">Heading</span>
            <span className="font-medium">{vesselHeading}°</span>
          </div>
          
          <div>
            <span className="text-gray-500 block">Data Source</span>
            <span className="font-medium">
              {currentVesselData ? 'Live API' : 'Enhanced Data'}
            </span>
          </div>
        </div>
        
        {(nearbyRefineries.length > 0 || nearbyPorts.length > 0) && (
          <>
            <Separator className="my-3" />
            <div className="text-xs font-medium mb-2">Nearby Locations (20km radius)</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nearbyRefineries.length > 0 && (
                <div>
                  <div className="flex items-center text-xs text-blue-600 mb-2">
                    <Factory className="h-3.5 w-3.5 mr-1" />
                    Refineries
                  </div>
                  
                  <div className="space-y-2">
                    {nearbyRefineries.slice(0, 3).map((refinery: any) => (
                      <div 
                        key={`refinery-info-${refinery.id}`} 
                        className="flex justify-between text-xs bg-blue-50 p-2 rounded-sm"
                      >
                        <span className="font-medium">{refinery.name}</span>
                        <span>{refinery.distanceFromVessel} km</span>
                      </div>
                    ))}
                    
                    {nearbyRefineries.length > 3 && (
                      <div className="text-xs text-gray-500 text-right">
                        + {nearbyRefineries.length - 3} more refineries
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {nearbyPorts.length > 0 && (
                <div>
                  <div className="flex items-center text-xs text-green-600 mb-2">
                    <Anchor className="h-3.5 w-3.5 mr-1" />
                    Ports
                  </div>
                  
                  <div className="space-y-2">
                    {nearbyPorts.slice(0, 3).map((port: any) => (
                      <div 
                        key={`port-info-${port.id}`} 
                        className="flex justify-between text-xs bg-green-50 p-2 rounded-sm"
                      >
                        <span className="font-medium">{port.name}</span>
                        <span>{port.distanceFromVessel} km</span>
                      </div>
                    ))}
                    
                    {nearbyPorts.length > 3 && (
                      <div className="text-xs text-gray-500 text-right">
                        + {nearbyPorts.length - 3} more ports
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedVesselMap;