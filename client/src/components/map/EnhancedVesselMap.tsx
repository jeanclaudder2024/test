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
import MapEnhancements from "./MapEnhancements";
import VesselRiskAnalytics from "./VesselRiskAnalytics";
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
  const [nearbyVessels, setNearbyVessels] = useState<any[]>([]);
  const [realTimePosition, setRealTimePosition] = useState<[number, number] | null>(null);
  const [vesselHeading, setVesselHeading] = useState<number>(0);
  const [vesselSpeed, setVesselSpeed] = useState<number>(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [zoomLevel, setZoomLevel] = useState<number>(6);
  const [showProximityRadius, setShowProximityRadius] = useState<boolean>(true);
  const [isGeneratingData, setIsGeneratingData] = useState<boolean>(false);
  const [vesselRoute, setVesselRoute] = useState<any>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeGenerationError, setRouteGenerationError] = useState<string | null>(null);
  const [destinationPortMarker, setDestinationPortMarker] = useState<any>(null);
  const [destinationRefineryMarker, setDestinationRefineryMarker] = useState<any>(null);
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
  
  // Generate realistic vessel data if API fails using server-side API
  const generateVesselData = async () => {
    if (!vessel || isGeneratingData) return;
    
    try {
      setIsGeneratingData(true);
      
      // Call server endpoint which uses OpenAI to generate realistic vessel data
      const response = await axios.post(`/api/vessels/${vessel.id}/generate-position-data`, {
        vesselName: vessel.name,
        vesselType: vessel.vesselType || 'oil tanker',
        cargoType: vessel.cargoType || 'crude oil',
        currentLat: vessel.currentLat,
        currentLng: vessel.currentLng,
        destination: vessel.destinationPort || null,
        previousPort: vessel.previousPort || null
      });
      
      if (response.data && response.data.success) {
        const generatedData = response.data.data;
        
        // Update vessel data with generated values
        setVesselHeading(parseFloat(generatedData.course || 0));
        setVesselSpeed(parseFloat(generatedData.speed || 12.5));
        
        // Update voyage progress if available
        if (generatedData.voyageProgress) {
          // This would be updated in the parent component
          vessel.voyageProgress = generatedData.voyageProgress;
        }
        
        toast({
          title: "Enhanced tracking data generated",
          description: "Using AI-powered vessel simulation for realistic visualization",
          duration: 3000
        });
      } else {
        // If server fails, use simple rule-based approach
        const isOilTanker = vessel.vesselType?.toLowerCase().includes('tanker') || 
                           vessel.cargoType?.toLowerCase().includes('oil') ||
                           vessel.cargoType?.toLowerCase().includes('crude');
        
        const isLNG = vessel.cargoType?.toLowerCase().includes('lng') || 
                     vessel.cargoType?.toLowerCase().includes('gas');
        
        // Generate realistic speed based on vessel type
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
        
        // Generate voyage progress (25-95%)
        vessel.voyageProgress = Math.floor(25 + (Math.random() * 70));
        
        toast({
          title: "Simulated vessel tracking data",
          description: "Using vessel simulation for visualization",
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Failed to generate vessel data:", error);
      
      // Fallback to basic simulation if API call fails
      const speed = 10 + (Math.random() * 8); // 10-18 knots
      const heading = Math.floor(Math.random() * 360); // Random direction
      
      setVesselHeading(heading);
      setVesselSpeed(parseFloat(speed.toFixed(1)));
      
      // Generate voyage progress (25-95%)
      vessel.voyageProgress = Math.floor(25 + (Math.random() * 70));
    } finally {
      setIsGeneratingData(false);
    }
  };
  
  // Find nearby refineries and ports
  const findNearbyLocations = useCallback(async () => {
    if (!realTimePosition) return;
    
    try {
      // Find nearby refineries (within 200km)
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
          
          return distance <= 200; // Within 200km
        });
        
        // Sort refineries by distance (closest first)
        nearby.sort((a: any, b: any) => 
          parseFloat(a.distanceFromVessel) - parseFloat(b.distanceFromVessel)
        );
        
        setNearbyRefineries(nearby);
      }
      
      // Find nearby ports (within 200km)
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
          
          return distance <= 200; // Within 200km
        });
        
        // Sort ports by distance (closest first)
        nearby.sort((a: any, b: any) => 
          parseFloat(a.distanceFromVessel) - parseFloat(b.distanceFromVessel)
        );
        
        setNearbyPorts(nearby);
      }
    } catch (error) {
      console.error("Failed to find nearby locations:", error);
    }
  }, [realTimePosition]);
  
  // Load maritime route data for vessel
  const loadVesselRoute = useCallback(async () => {
    if (!vessel || !vessel.id) return;
    
    // Reset previous errors
    setRouteGenerationError(null);
    
    // Check if vessel has destination port
    if (!vessel.destinationPort) {
      setRouteGenerationError("No destination port set for vessel");
      return;
    }
    
    setIsLoadingRoute(true);
    try {
      // Fetch water-based route from API
      const response = await axios.get(`/api/vessels/${vessel.id}/route`);
      
      if (response.data && response.data.success && response.data.route) {
        setVesselRoute(response.data.route);
        
        toast({
          title: "Loaded maritime route",
          description: "Showing vessel's water-based navigation path that avoids land",
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Failed to load vessel route:", error);
      
      let errorMessage = "Failed to generate maritime route";
      
      // Extract error message if available
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setRouteGenerationError(errorMessage);
      
      // Check if there's a route in vessel metadata as fallback
      try {
        if (vessel.metadata) {
          const metadata = JSON.parse(vessel.metadata);
          if (metadata.route && metadata.route.waypoints) {
            setVesselRoute(metadata.route);
            
            toast({
              title: "Using cached route",
              description: "Displaying previously calculated maritime path",
              duration: 3000
            });
            
            // Clear error if we found a cached route
            setRouteGenerationError(null);
          }
        }
      } catch (metadataError) {
        console.error("Error parsing vessel metadata for route:", metadataError);
      }
      
      if (routeGenerationError) {
        toast({
          title: "Route generation issue",
          description: errorMessage,
          variant: "destructive",
          duration: 5000
        });
      }
    } finally {
      setIsLoadingRoute(false);
    }
  }, [vessel, toast, routeGenerationError]);

  // Function to find destination port or refinery
  const findDestinationLocation = useCallback(async () => {
    if (!vessel) return;
    
    try {
      // Check for destination port information
      if (vessel.destinationPort) {
        const portsResponse = await axios.get('/api/ports');
        if (portsResponse.data) {
          // Find port by name (case-insensitive partial match)
          const destinationPort = portsResponse.data.find((port: any) => 
            port.name && vessel.destinationPort && 
            port.name.toLowerCase().includes(vessel.destinationPort.toLowerCase())
          );
          
          if (destinationPort && destinationPort.lat && destinationPort.lng) {
            setDestinationPortMarker({
              ...destinationPort,
              isDestination: true
            });
            console.log("Found destination port:", destinationPort.name);
          }
        }
      }
      
      // Check if vessel has destination that might be a refinery
      if (vessel.destination) {
        const refineriesResponse = await axios.get('/api/refineries');
        if (refineriesResponse.data) {
          // Find refinery by name or country
          const possibleRefinery = refineriesResponse.data.find((refinery: any) => 
            (refinery.name && vessel.destination && 
             refinery.name.toLowerCase().includes(vessel.destination.toLowerCase())) ||
            (refinery.country && vessel.destination && 
             vessel.destination.toLowerCase().includes(refinery.country.toLowerCase()))
          );
          
          if (possibleRefinery && possibleRefinery.lat && possibleRefinery.lng) {
            setDestinationRefineryMarker({
              ...possibleRefinery,
              isDestination: true
            });
            console.log("Found destination refinery:", possibleRefinery.name);
          }
        }
      }
    } catch (error) {
      console.error("Failed to find destination location:", error);
    }
  }, [vessel]);

  // Load data when component mounts or vessel changes
  useEffect(() => {
    if (vessel) {
      loadRealVesselPosition();
      
      // Find destination port/refinery
      findDestinationLocation();
      
      if (vessel.destinationPort) {
        loadVesselRoute();
      }
    }
  }, [vessel, loadRealVesselPosition, loadVesselRoute, findDestinationLocation]);
  
  // Find nearby locations and vessels when position is loaded
  useEffect(() => {
    if (realTimePosition) {
      findNearbyLocations();
      
      // Find nearby vessels for collision risk analytics (simplified implementation)
      const fetchNearbyVessels = async () => {
        try {
          // Get vessels within a 20km radius for risk analytics
          const response = await axios.get('/api/vessels/polling?page=1&pageSize=50');
          if (response.data && response.data.vessels) {
            const vessels = response.data.vessels;
            
            // Filter vessels that are nearby but not the current vessel
            const nearby = vessels.filter((otherVessel: any) => {
              if (!otherVessel.currentLat || !otherVessel.currentLng || otherVessel.id === vessel.id) 
                return false;
              
              const distance = calculateDistance(
                realTimePosition[0],
                realTimePosition[1],
                parseFloat(otherVessel.currentLat),
                parseFloat(otherVessel.currentLng)
              );
              
              // Store distance for display
              otherVessel.distanceFromVessel = distance.toFixed(1);
              
              return distance <= 200; // Within 200km
            });
            
            setNearbyVessels(nearby);
          }
        } catch (error) {
          console.error("Failed to fetch nearby vessels:", error);
        }
      };
      
      fetchNearbyVessels();
    }
  }, [realTimePosition, findNearbyLocations, vessel.id]);
  
  // Add route direction arrows when route is loaded
  useEffect(() => {
    if (vesselRoute && vesselRoute.waypoints && vesselRoute.waypoints.length > 1) {
      // This effect adds the direction path decorations for the route
      // It's run after the route is rendered on the map
      
      try {
        const mapElement = document.querySelector('.leaflet-container');
        if (mapElement) {
          const map = (mapElement as any)._leaflet_map;
          if (map) {
            // Force map to redraw and update the route path with directional markers
            map.invalidateSize();
            
            // Add CSS to create animated path effect
            const style = document.createElement('style');
            style.innerHTML = `
              .vessel-route-path {
                stroke-dasharray: 8, 4;
                stroke-dashoffset: 0;
                animation: dash 30s linear infinite;
              }
              @keyframes dash {
                to {
                  stroke-dashoffset: -100;
                }
              }
            `;
            document.head.appendChild(style);
          }
        }
      } catch (error) {
        console.error("Error adding route direction indicators:", error);
      }
    }
  }, [vesselRoute]);
  
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
  
  // Get enhanced refinery icon with more detailed visualization
  const getRefineryIcon = (refinery: any) => {
    // Create a sophisticated refinery icon with name and distance display
    const capacity = refinery.capacity || 0;
    const iconSize = Math.min(Math.max(22, capacity / 40), 38); // Larger size based on capacity
    
    const html = `
      <div style="position: relative;">
        <div style="width: ${iconSize}px; height: ${iconSize}px; background-color: #e74c3c; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; animation: pulse-refinery 1.5s infinite;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: ${iconSize/1.8}px; height: ${iconSize/1.8}px;">
            <path d="M3 22V12C3 11.4696 3.21071 10.9609 3.58579 10.5858C3.96086 10.2107 4.46957 10 5 10H19C19.5304 10 20.0391 10.2107 20.4142 10.5858C20.7893 10.9609 21 11.4696 21 12V22"/>
            <path d="M5 10V6C5 5.46957 5.21071 4.96086 5.58579 4.58579C5.96086 4.21071 6.46957 4 7 4H17C17.5304 4 18.0391 4.21071 18.4142 4.58579C18.7893 4.96086 19 5.46957 19 6V10"/>
          </svg>
        </div>
        <div style="position: absolute; bottom: -24px; left: 50%; transform: translateX(-50%); background-color: rgba(231, 76, 60, 0.9); color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; white-space: nowrap; font-size: 11px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; text-align: center; z-index: 1000;">
          ${refinery.name || 'Refinery'}
        </div>
        <div style="position: absolute; top: -15px; right: -25px; background-color: rgba(0, 0, 0, 0.7); color: white; padding: 1px 4px; border-radius: 3px; font-size: 10px; white-space: nowrap; z-index: 1000;">
          ${refinery.distanceFromVessel}km
        </div>
      </div>
    `;
    
    // Add CSS for pulsing animation
    if (!document.getElementById('refinery-animation')) {
      const style = document.createElement('style');
      style.id = 'refinery-animation';
      style.textContent = `
        @keyframes pulse-refinery {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(231, 76, 60, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    return L.divIcon({
      className: 'enhanced-refinery-marker',
      html: html,
      iconSize: [iconSize + 30, iconSize + 30], // Larger size to account for labels
      iconAnchor: [iconSize / 2 + 15, iconSize / 2 + 15],
    });
  };
  
  // Port animations CSS for pulsing effect
  useEffect(() => {
    // Add port animation CSS once
    if (!document.getElementById('port-pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'port-pulse-animation';
      style.textContent = `
        @keyframes pulse-port {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 5px rgba(33, 150, 243, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  // Get port icon with improved visualization and name
  const getPortIcon = (port: any) => {
    // Determine icon style based on port type or if it's a destination
    let iconColor = "green-600";
    let iconSize = port.isDestination ? 30 : 24; // Larger icon for destination
    let iconSymbol = `
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    `;
    
    // Check port type for specialized icons
    if (port.portType?.toLowerCase().includes('oil')) {
      iconColor = "amber-600";
      iconSymbol = `<path d="M7 16a3 3 0 0 1 0 6 3 3 0 0 0 0 6h10a3 3 0 0 0 0-6 3 3 0 0 1 0-6"/>`;
      iconSize = port.isDestination ? 32 : 28;
    } else if (port.portType?.toLowerCase().includes('lng') || port.portType?.toLowerCase().includes('gas')) {
      iconColor = "purple-600";
      iconSymbol = `<path d="M10 5.5V2a1 1 0 0 0-1.74-.67L3.51 6.79a1 1 0 0 0 .75 1.7H8L10 5.5zm-4 2v14h16V7.5H6z"/>`;
      iconSize = port.isDestination ? 30 : 26;
    } else if (port.portType?.toLowerCase().includes('container')) {
      iconColor = "blue-500";
      iconSymbol = `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>`;
    }
    
    // For destination port, override color to red
    if (port.isDestination) {
      iconColor = "red-600"; // Set destination ports to red
    }
    
    // Optional water ripple animation for oil/LNG ports
    const hasWaterEffect = port.portType?.toLowerCase().includes('oil') || port.portType?.toLowerCase().includes('lng');
    
    // Special pulsing effect for destination port
    const animationStyle = port.isDestination 
      ? "animation: destination-pulse 2s infinite;" 
      : "animation: pulse-port 2s infinite;";
    
    // Border style based on destination status
    const borderStyle = port.isDestination 
      ? "border-3 border-red-600" 
      : "border-2 border-white";
    
    // Special destination label
    const destinationLabel = port.isDestination ? 
      `<div class="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap shadow-sm z-30">
        VOYAGE DESTINATION
      </div>` : '';
    
    // Create HTML for port icon with name
    const html = `
      <div class="relative">
        ${destinationLabel}
        <div class="w-${iconSize} h-${iconSize} flex items-center justify-center bg-${iconColor} ${borderStyle} rounded-full shadow-md ${hasWaterEffect ? 'water-ripple-effect' : ''}" style="${animationStyle}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-${iconSize/2} h-${iconSize/2}">
            ${iconSymbol}
          </svg>
        </div>
        <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-${iconColor} text-white px-2 py-0.5 rounded text-xs whitespace-nowrap font-medium shadow-sm">
          ${port.name.length > 15 ? port.name.slice(0, 12) + '...' : port.name}
        </div>
        ${port.distanceFromVessel ? 
          `<div class="absolute -top-4 -right-4 bg-black bg-opacity-70 text-white px-1 py-0.5 rounded text-[9px] whitespace-nowrap shadow-sm z-20">
            ${port.distanceFromVessel}km
          </div>` : ''}
      </div>
    `;
    
    return L.divIcon({
      className: 'port-marker',
      html: html,
      iconSize: [iconSize + 20, iconSize + 30], // Account for the name label
      iconAnchor: [iconSize / 2 + 10, iconSize / 2 + 15],
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
      {/* Loading state or error message */}
      {(isLoadingRoute || routeGenerationError) && (
        <div className="absolute top-2 right-2 z-50 max-w-[200px]">
          {isLoadingRoute && (
            <div className="bg-blue-100 border border-blue-300 text-blue-800 px-2 py-1 rounded text-xs flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-blue-600 mr-2"></div>
              Calculating maritime route...
            </div>
          )}
          
          {routeGenerationError && !isLoadingRoute && (
            <div className="bg-amber-100 border border-amber-300 text-amber-800 px-2 py-1 rounded text-xs">
              {routeGenerationError}
            </div>
          )}
        </div>
      )}
      
      {/* Route info panel - only shown when route exists */}
      {vesselRoute && vesselRoute.waypoints && vesselRoute.waypoints.length > 1 && (
        <div className="absolute bottom-2 left-2 z-50 max-w-[200px] bg-white/90 dark:bg-gray-800/90 rounded border border-gray-200 dark:border-gray-700 p-2 text-xs">
          <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <Navigation className="h-3 w-3 mr-1 text-blue-600" />
            Maritime Route
          </div>
          <div className="mt-1 text-gray-600 dark:text-gray-300 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>Distance:</span>
              <span className="font-medium">{vesselRoute.distance ? Math.round(vesselRoute.distance) : '?'} km</span>
            </div>
            <div className="flex justify-between">
              <span>Waypoints:</span>
              <span className="font-medium">{vesselRoute.waypoints.length}</span>
            </div>
            <div className="mt-1 flex items-center text-blue-600 dark:text-blue-400">
              <Droplet className="h-3 w-3 mr-1" />
              <span>Following water-based path</span>
            </div>
          </div>
        </div>
      )}
      
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
          
          {/* Enhanced map features - weather, sea state, shipping lanes */}
          <MapEnhancements 
            enableWeather={true}
            enableSeaState={true} 
            enableMapStyles={true}
            enableShippingLanes={true}
            weatherType="none"
          />
          
          {/* Advanced vessel risk analytics and collision prediction */}
          <VesselRiskAnalytics 
            vessel={vessel}
            nearbyVessels={nearbyVessels || []}
            riskAnalysisEnabled={true}
            safetyZonesEnabled={true}
            collisionPredictionEnabled={true}
            enableRealTimeAlerts={true}
          />
          
          {/* Maritime route - water-based vessel path */}
          {vesselRoute && vesselRoute.waypoints && vesselRoute.waypoints.length > 1 && (
            <Polyline
              positions={vesselRoute.waypoints}
              pathOptions={{
                color: '#0284c7',
                weight: 3,
                opacity: 0.8,
                dashArray: '8, 4',
                lineCap: 'round',
                lineJoin: 'round',
                className: 'vessel-route-path animate-pulse'
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="text-sm font-semibold">Maritime Route</h3>
                  <p className="text-xs text-gray-600">
                    {vesselRoute.distance ? `Distance: ${Math.round(vesselRoute.distance)} km` : 'Marine navigation path'}
                  </p>
                  <p className="text-xs text-blue-600">
                    Following international shipping lanes
                  </p>
                </div>
              </Popup>
            </Polyline>
          )}
          
          {/* Route waypoint markers */}
          {vesselRoute && vesselRoute.waypoints && vesselRoute.waypoints.length > 1 && (
            vesselRoute.waypoints.map((point, index) => {
              // Only show start, end, and major waypoints to avoid cluttering
              if (index === 0 || index === vesselRoute.waypoints.length - 1 || index % 3 === 0) {
                return (
                  <Circle
                    key={`waypoint-${index}`}
                    center={point}
                    radius={300} // 300m radius for waypoint markers
                    pathOptions={{
                      color: index === 0 ? '#10b981' : 
                             index === vesselRoute.waypoints.length - 1 ? '#ef4444' : 
                             '#6366f1',
                      fillColor: index === 0 ? '#10b981' : 
                                index === vesselRoute.waypoints.length - 1 ? '#ef4444' : 
                                '#6366f1',
                      fillOpacity: 0.6,
                      weight: 1
                    }}
                  >
                    <Popup>
                      <div className="p-1">
                        <h3 className="text-sm font-semibold">
                          {index === 0 ? 'Departure Point' : 
                           index === vesselRoute.waypoints.length - 1 ? 'Destination' : 
                           `Waypoint ${index}`}
                        </h3>
                        <p className="text-xs">Lat: {point[0].toFixed(4)}, Lng: {point[1].toFixed(4)}</p>
                      </div>
                    </Popup>
                  </Circle>
                );
              }
              return null;
            })
          )}
          
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
          
          {/* Destination Refinery (if exists) */}
          {destinationRefineryMarker && (
            <Marker
              key={`destination-refinery-${destinationRefineryMarker.id}`}
              position={[parseFloat(destinationRefineryMarker.lat), parseFloat(destinationRefineryMarker.lng)]}
              icon={getRefineryIcon({...destinationRefineryMarker, isDestination: true})}
              zIndexOffset={1000} // Make sure destination is on top
            >
              <Popup>
                <div className="text-sm space-y-2 max-w-[250px]">
                  <div className="font-semibold text-base flex items-center">
                    <Factory className="h-4 w-4 mr-1.5 text-red-600" />
                    {destinationRefineryMarker.name}
                  </div>
                  
                  <div className="text-xs">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Destination Refinery
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <div className="text-gray-500">Country:</div>
                    <div>{destinationRefineryMarker.country || 'N/A'}</div>
                    
                    <div className="text-gray-500">Capacity:</div>
                    <div>{destinationRefineryMarker.capacity ? `${destinationRefineryMarker.capacity} kb/d` : 'N/A'}</div>
                    
                    <div className="text-red-600 font-medium col-span-2 mt-1">
                      Final destination for this voyage
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
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
          {/* Display destination port with special styling if it exists */}
          {destinationPortMarker && (
            <Marker
              key={`destination-port-${destinationPortMarker.id}`}
              position={[parseFloat(destinationPortMarker.lat), parseFloat(destinationPortMarker.lng)]}
              icon={getPortIcon({...destinationPortMarker, isDestination: true})}
              zIndexOffset={1000} // Make sure destination is on top
            >
              <Popup>
                <div className="text-sm space-y-2 max-w-[250px]">
                  <div className="font-semibold text-base flex items-center">
                    <Anchor className="h-4 w-4 mr-1.5 text-red-600" />
                    {destinationPortMarker.name}
                  </div>
                  
                  <div className="text-xs">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Destination Port
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <div className="text-gray-500">Country:</div>
                    <div>{destinationPortMarker.country || 'N/A'}</div>
                    
                    <div className="text-gray-500">Type:</div>
                    <div>{destinationPortMarker.portType || 'N/A'}</div>
                    
                    <div className="text-red-600 font-medium col-span-2 mt-1">
                      Final destination for this voyage
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Display nearby ports */}
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
          
          {/* Enhanced connection lines to nearby entities with distance-based styling */}
          {nearbyRefineries.map((refinery: any) => {
            // Calculate opacity and dash pattern based on distance
            const distance = parseFloat(refinery.distanceFromVessel);
            const opacity = Math.max(0.3, 1 - (distance / 250));
            // Create curved lines for better visualization
            const refineryPos = [parseFloat(refinery.lat), parseFloat(refinery.lng)];
            const midPoint = [
              realTimePosition[0] + (refineryPos[0] - realTimePosition[0]) * 0.5, 
              realTimePosition[1] + (refineryPos[1] - realTimePosition[1]) * 0.5 + 0.02
            ];
            
            return (
              <Polyline
                key={`refinery-line-${refinery.id}`}
                positions={[
                  realTimePosition,
                  midPoint,
                  refineryPos
                ]}
                pathOptions={{
                  color: '#3b82f6',
                  weight: distance < 50 ? 3 : 2,
                  dashArray: distance < 50 ? '8, 8' : '5, 5',
                  opacity: opacity
                }}
              />
            );
          })}
          
          {nearbyPorts.map((port: any) => {
            // Calculate opacity and dash pattern based on distance
            const distance = parseFloat(port.distanceFromVessel);
            const opacity = Math.max(0.3, 1 - (distance / 250));
            // Create curved lines for better visualization
            const portPos = [parseFloat(port.lat), parseFloat(port.lng)];
            const midPoint = [
              realTimePosition[0] + (portPos[0] - realTimePosition[0]) * 0.5, 
              realTimePosition[1] + (portPos[1] - realTimePosition[1]) * 0.5 - 0.02
            ];
            
            return (
              <Polyline
                key={`port-line-${port.id}`}
                positions={[
                  realTimePosition,
                  midPoint,
                  portPos
                ]}
                pathOptions={{
                  color: '#10b981',
                  weight: distance < 50 ? 3 : 2,
                  dashArray: distance < 50 ? '8, 8' : '5, 5',
                  opacity: opacity
                }}
              />
            );
          })}
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
            <div className="text-xs font-medium mb-2">Nearby Locations (200km radius)</div>
            
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