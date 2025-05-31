import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Anchor, 
  Ship, 
  Navigation, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Wind, 
  Droplets, 
  Fuel, 
  BarChart3, 
  History, 
  Route,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Building,
  Package,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

// Helper function to parse the vessel metadata field for additional vessel information
const parseVesselMetadata = (vessel: Vessel) => {
  if (!vessel.metadata) return null;
  
  try {
    // Parse the metadata JSON string
    const metadata = typeof vessel.metadata === 'string' 
      ? JSON.parse(vessel.metadata)
      : vessel.metadata;
    
    return {
      currentSpeed: metadata.currentSpeed,
      voyageProgress: metadata.voyageProgress,
      course: metadata.course,
      navStatus: metadata.navStatus,
      draught: metadata.draught,
      generatedData: metadata.generatedData || false,
      generatedAt: metadata.generatedAt ? new Date(metadata.generatedAt) : null
    };
  } catch (error) {
    console.error("Error parsing vessel metadata:", error);
    return null;
  }
};
import { Vessel } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Import Leaflet map components
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface VoyageDetailsProps {
  vessel: Vessel;
  voyageProgress: any | null;
  isLoadingVoyage: boolean;
  onRefreshVoyage: () => void;
  currentLocation: any | null;
  isLoadingLocation: boolean;
  onRefreshLocation: () => void;
}

export const VoyageDetails: React.FC<VoyageDetailsProps> = ({
  vessel,
  voyageProgress,
  isLoadingVoyage,
  onRefreshVoyage,
  currentLocation,
  isLoadingLocation,
  onRefreshLocation
}) => {
  const [showWeatherDetails, setShowWeatherDetails] = useState(false);
  const [showFuelDetails, setShowFuelDetails] = useState(false);
  const [ports, setPorts] = useState<any[]>([]);
  const [aiVoyageProgress, setAiVoyageProgress] = useState<any>(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('VoyageDetails error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // Fetch ports data for proper name resolution
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const response = await axios.get('/api/ports');
        if (response.status === 200) {
          setPorts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch ports for voyage details:', error);
      }
    };
    
    fetchPorts();
  }, []);

  // Fetch AI-generated voyage progress
  useEffect(() => {
    const fetchVoyageProgress = async () => {
      try {
        const response = await axios.get(`/api/vessels/${vessel.id}/progress`);
        if (response.status === 200 && response.data.success) {
          // Ensure we're setting a proper object structure and not rendering the object directly
          const progressData = response.data.data;
          if (progressData && typeof progressData === 'object') {
            setAiVoyageProgress({
              percentComplete: progressData.percentComplete || 0,
              currentSpeed: progressData.currentSpeed || 0,
              averageSpeed: progressData.averageSpeed || 0,
              estimatedArrival: progressData.estimatedArrival || null,
              distanceTraveled: progressData.distanceTraveled || 0,
              distanceRemaining: progressData.distanceRemaining || 0,
              currentStatus: progressData.currentStatus || '',
              nextMilestone: progressData.nextMilestone || '',
              weatherConditions: progressData.weatherConditions || '',
              fuelConsumption: progressData.fuelConsumption || 0
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch voyage progress:', error);
        setHasError(true);
      }
    };

    if (vessel.id) {
      fetchVoyageProgress();
    }
  }, [vessel.id]);

  // Function to manually update voyage progress
  const updateVoyageProgress = async () => {
    setIsUpdatingProgress(true);
    try {
      const response = await axios.post(`/api/vessels/${vessel.id}/update-progress`);
      if (response.status === 200 && response.data.success) {
        // Ensure we're setting a proper object structure and not rendering the object directly
        const progressData = response.data.data;
        if (progressData && typeof progressData === 'object') {
          setAiVoyageProgress({
            percentComplete: progressData.percentComplete || 0,
            currentSpeed: progressData.currentSpeed || 0,
            averageSpeed: progressData.averageSpeed || 0,
            estimatedArrival: progressData.estimatedArrival || null,
            distanceTraveled: progressData.distanceTraveled || 0,
            distanceRemaining: progressData.distanceRemaining || 0,
            currentStatus: progressData.currentStatus || '',
            nextMilestone: progressData.nextMilestone || '',
            weatherConditions: progressData.weatherConditions || '',
            fuelConsumption: progressData.fuelConsumption || 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to update voyage progress:', error);
      setHasError(true);
    } finally {
      setIsUpdatingProgress(false);
    }
  };
  
  // Helper function to get port name by ID or name
  const getPortName = (portIdOrName: number | string | null | undefined): string => {
    if (!portIdOrName) return 'Unknown Port';
    
    // If it's already a port name (string that doesn't look like an ID)
    if (typeof portIdOrName === 'string' && isNaN(Number(portIdOrName))) {
      return portIdOrName;
    }
    
    // If we have ports data, try to find the port by ID
    if (ports.length > 0) {
      const port = ports.find(p => p.id === Number(portIdOrName) || p.name === portIdOrName);
      if (port) {
        return `${port.name}, ${port.country}`;
      }
    }
    
    // If it's a number but we can't find the port, show it as is
    return typeof portIdOrName === 'string' ? portIdOrName : `Port ID: ${portIdOrName}`;
  };

  // Weather condition data - would be from API in production
  const weatherData = {
    currentCondition: "Partly Cloudy",
    temperature: 18.5,
    windSpeed: 15,
    windDirection: "NE",
    waveHeight: 1.2,
    visibility: "Good",
    pressure: 1015,
    upcoming: [
      { day: "Tomorrow", condition: "Sunny", temperature: 21, windSpeed: 10 },
      { day: "Day 2", condition: "Light Rain", temperature: 17, windSpeed: 20 },
      { day: "Day 3", condition: "Cloudy", temperature: 16, windSpeed: 18 }
    ]
  };

  // Fuel consumption data - would be from API in production
  const fuelData = {
    current: 22.5, // tons per day
    average: 25.2,
    total: 126.8,
    remaining: 258.4,
    efficiency: 0.92, // 92% of expected
    co2Emissions: 398.2 // tons
  };

  // History of route changes - would be from API
  const routeChanges = [
    { date: new Date(2025, 4, 2), description: "Route optimized to avoid storm front in the Arabian Sea" },
    { date: new Date(2025, 3, 28), description: "Speed increased to meet delivery schedule" },
    { date: new Date(2025, 3, 15), description: "Route adjusted to accommodate new port regulations" },
    { date: new Date(2025, 3, 5), description: "Initial route planned from departure port to destination" }
  ];

  // Stopovers - would be from API
  const stopovers = vessel.destinationPort ? [
    { 
      port: "Singapore", 
      arrival: new Date(2025, 3, 25), 
      departure: new Date(2025, 3, 26), 
      purpose: "Refueling and Maintenance",
      // Add coordinates for the stopover for map display
      lat: 1.290270,
      lng: 103.851959
    },
    {
      port: "Port Klang",
      arrival: new Date(2025, 4, 2),
      departure: new Date(2025, 4, 3),
      purpose: "Cargo Inspection",
      // Add coordinates for the stopover
      lat: 3.005,
      lng: 101.395
    }
  ] : [];

  // Alerts - would be from API
  const alerts = [
    { 
      type: "Weather", 
      severity: "medium", 
      message: "Moderate storm activity detected ahead. Captain adjusting route to minimize impact.", 
      date: new Date(2025, 4, 4, 9, 32) 
    },
    { 
      type: "Port", 
      severity: "low", 
      message: "Port authorities at destination report higher than normal congestion. Possible docking delays.", 
      date: new Date(2025, 4, 3, 14, 15) 
    },
    { 
      type: "Technical", 
      severity: "low", 
      message: "Minor engine maintenance scheduled during next port call.", 
      date: new Date(2025, 4, 2, 8, 45)
    }
  ];

  // Calculate the estimated time of arrival display with enhanced error handling
  const getETADisplay = () => {
    try {
      // Check AI voyage progress first
      if (effectiveVoyageProgress?.estimatedArrival) {
        if (typeof effectiveVoyageProgress.estimatedArrival === 'string') {
          return effectiveVoyageProgress.estimatedArrival;
        }
        return formatDate(new Date(effectiveVoyageProgress.estimatedArrival));
      }
      
      // Check standard voyage progress
      if (voyageProgress?.estimatedArrival) {
        if (typeof voyageProgress.estimatedArrival === 'string') {
          return voyageProgress.estimatedArrival;
        }
        return formatDate(new Date(voyageProgress.estimatedArrival));
      } 
      
      // Check vessel ETA
      if (vessel?.eta) {
        return formatDate(new Date(vessel.eta));
      }
      
      return "Not available";
    } catch (error) {
      console.error("Error formatting ETA:", error);
      return "Not available";
    }
  };

  // State to store route data
  const [routeData, setRouteData] = useState<any>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [simulatedProgress, setSimulatedProgress] = useState<number | null>(null);
  
  // Function to fetch route data
  const fetchRouteData = async () => {
    if (!vessel?.id) return;
    
    setIsLoadingRoute(true);
    try {
      const response = await axios.get(`/api/vessels/${vessel.id}/route`);
      console.log("Route data response:", response.data);
      
      if (response.data && response.data.route) {
        // Process the route data to ensure all coordinates are numbers
        const route = response.data.route;
        
        // Ensure current position coordinates are numbers
        if (route.currentPosition) {
          route.currentPosition = {
            ...route.currentPosition,
            lat: Number(route.currentPosition.lat),
            lng: Number(route.currentPosition.lng)
          };
        }
        
        // Ensure departure position coordinates are numbers
        if (route.departurePosition) {
          route.departurePosition = {
            ...route.departurePosition,
            lat: Number(route.departurePosition.lat),
            lng: Number(route.departurePosition.lng)
          };
        }
        
        // Ensure destination position coordinates are numbers
        if (route.destinationPosition) {
          route.destinationPosition = {
            ...route.destinationPosition,
            lat: Number(route.destinationPosition.lat),
            lng: Number(route.destinationPosition.lng)
          };
        }
        
        // Validate vessel coordinates are numbers
        if (route.vessel && route.vessel.currentLat && route.vessel.currentLng) {
          route.vessel.currentLat = Number(route.vessel.currentLat);
          route.vessel.currentLng = Number(route.vessel.currentLng);
        }
        
        // Update the state with the processed route data
        setRouteData(route);
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
      setRouteData(null); // Clear route data on error
    } finally {
      setIsLoadingRoute(false);
    }
  };
  
  // Fetch route data when vessel changes
  useEffect(() => {
    if (vessel?.id) {
      fetchRouteData();
    }
  }, [vessel?.id]);

  // Extract enhanced vessel data from metadata if available
  const enhancedVesselData = parseVesselMetadata(vessel);
  
  // Simulate voyage progress over time
  useEffect(() => {
    if (!vessel) return;
    
    // Only simulate if we have enhanced vessel data and a departure/destination
    if (enhancedVesselData && vessel.departurePort && vessel.destinationPort) {
      // Don't override if already computed
      if (simulatedProgress !== null) return;
      
      const baseProgress = enhancedVesselData?.voyageProgress || 0;
      
      // Set the initial simulated progress
      setSimulatedProgress(baseProgress);
      
      // Setup auto progression that simulates vessel movement over time
      const interval = setInterval(() => {
        setSimulatedProgress(currentProgress => {
          if (currentProgress === null) return baseProgress;
          
          // Calculate the daily progress increment based on vessel speed
          const speedFactor = enhancedVesselData?.currentSpeed || 12;
          // Fast vessels make more progress per day
          const dailyIncrement = 0.2 + (speedFactor / 100);
          
          // Increase progress by small random amount every interval
          // to simulate vessel movement 
          let newProgress = currentProgress + (Math.random() * dailyIncrement);
          
          // Cap at 100%
          if (newProgress >= 100) {
            newProgress = 100;
            clearInterval(interval);
          }
          
          return newProgress;
        });
      }, 5000); // Update every 5 seconds to simulate passage of time
      
      return () => clearInterval(interval);
    }
  }, [vessel, enhancedVesselData]);
  
  // Prioritize AI-generated voyage progress over all other data with safe fallbacks
  const effectiveVoyageProgress = aiVoyageProgress || 
    (enhancedVesselData && enhancedVesselData.voyageProgress 
      ? {
          percentComplete: simulatedProgress !== null ? simulatedProgress : enhancedVesselData.voyageProgress || 0,
          currentSpeed: enhancedVesselData.currentSpeed || 0,
          averageSpeed: enhancedVesselData.currentSpeed ? enhancedVesselData.currentSpeed * 0.9 : 0,
          estimated: true,
          generatedData: true,
          estimatedArrival: simulatedProgress === 100 ? 'Arrived at destination' : 
                           `${Math.ceil((100 - (simulatedProgress || 0)) / 4)} days`,
          distanceTraveled: null,
          distanceRemaining: null
        } 
      : voyageProgress);
  
  // Safety check for error state
  if (hasError) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Voyage Information Temporarily Unavailable</h3>
            <p className="text-gray-500 mb-4">There was an issue loading the voyage details. Please try refreshing the page.</p>
            <Button 
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }}
              variant="outline"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Route className="h-5 w-5 mr-2 text-primary" />
            Voyage Details
            {enhancedVesselData?.generatedData && (
              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 border-blue-200 text-blue-700">
                AI Enhanced
              </Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs" 
              onClick={onRefreshLocation}
              disabled={isLoadingLocation}
            >
              <Navigation className={`h-3 w-3 mr-1 ${isLoadingLocation ? 'animate-spin' : ''}`} />
              Update Location
            </Button>
            {vessel.destinationPort && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs" 
                onClick={onRefreshVoyage}
                disabled={isLoadingVoyage}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingVoyage ? 'animate-spin' : ''}`} />
                Refresh Journey
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
            <TabsTrigger value="deal">Deal Info</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Journey Progress */}
              {vessel.destinationPort && (
                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Ship className="h-4 w-4 mr-2 text-primary" />
                      Journey Progress
                    </h3>
                    <div className="flex space-x-1">
                      {aiVoyageProgress && (
                        <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                          AI Generated
                        </Badge>
                      )}
                      {voyageProgress?.fromAPI && !aiVoyageProgress && (
                        <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                          Live Data
                        </Badge>
                      )}
                      {voyageProgress?.estimated && !aiVoyageProgress && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                          Estimated
                        </Badge>
                      )}
                      <Button
                        onClick={updateVoyageProgress}
                        disabled={isUpdatingProgress}
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 px-2"
                      >
                        {isUpdatingProgress ? (
                          <>
                            <Ship className="h-3 w-3 mr-1 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Update
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {isLoadingVoyage ? (
                    <div className="flex items-center justify-center py-4">
                      <Ship className="h-4 w-4 mr-2 animate-spin text-primary" />
                      <span className="text-sm">Fetching voyage progress...</span>
                    </div>
                  ) : effectiveVoyageProgress ? (
                    <>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                        <div className="flex flex-col items-center">
                          <MapPin className="h-3 w-3 text-primary mb-1" />
                          <span>{getPortName(vessel.departurePort)}</span>
                        </div>
                        <span className="text-primary font-medium">{effectiveVoyageProgress.percentComplete}% Complete</span>
                        <div className="flex flex-col items-center">
                          <MapPin className="h-3 w-3 text-primary mb-1" />
                          <span>{getPortName(vessel.destinationPort)}</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Progress 
                          value={effectiveVoyageProgress?.percentComplete ?? 0} 
                          className="h-2 mb-3 voyage-progress-bar" 
                        />
                        {/* Pulsing indicator for active voyage */}
                        {effectiveVoyageProgress?.percentComplete && effectiveVoyageProgress.percentComplete < 100 && (
                          <div 
                            className="absolute top-0 h-2 rounded pulse-animation" 
                            style={{ 
                              left: `${effectiveVoyageProgress.percentComplete - 1}%`, 
                              width: '6px', 
                              backgroundColor: 'var(--primary)'
                            }}
                          />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Distance traveled</p>
                          <p className="text-sm font-medium">
                            {(effectiveVoyageProgress?.distanceTraveled !== undefined && 
                              effectiveVoyageProgress.distanceTraveled !== null) ? 
                              `${(typeof effectiveVoyageProgress.distanceTraveled === 'number' ? 
                                effectiveVoyageProgress.distanceTraveled : 
                                parseFloat(String(effectiveVoyageProgress.distanceTraveled || 0))).toLocaleString()} nautical miles` : 
                              // Generate an estimated distance based on voyage progress
                              enhancedVesselData?.voyageProgress ? 
                              `${Math.floor((enhancedVesselData.voyageProgress || 0) * 40).toLocaleString()} nautical miles` :
                              'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Remaining</p>
                          <p className="text-sm font-medium">
                            {(effectiveVoyageProgress?.distanceRemaining !== undefined && 
                              effectiveVoyageProgress.distanceRemaining !== null) ? 
                              `${(typeof effectiveVoyageProgress.distanceRemaining === 'number' ? 
                                effectiveVoyageProgress.distanceRemaining : 
                                parseFloat(String(effectiveVoyageProgress.distanceRemaining || 0))).toLocaleString()} nautical miles` : 
                              // Generate an estimated distance remaining based on voyage progress
                              enhancedVesselData?.voyageProgress ? 
                              `${Math.floor((100 - (enhancedVesselData.voyageProgress || 0)) * 40).toLocaleString()} nautical miles` :
                              'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Current speed</p>
                          <p className="text-sm font-medium">
                            {(effectiveVoyageProgress?.currentSpeed !== undefined && 
                              effectiveVoyageProgress.currentSpeed !== null) ? 
                              `${effectiveVoyageProgress.currentSpeed.toFixed(1)} knots` : 
                              enhancedVesselData?.currentSpeed ?
                              `${enhancedVesselData.currentSpeed.toFixed(1)} knots` :
                              'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Average speed</p>
                          <p className="text-sm font-medium">
                            {(effectiveVoyageProgress?.averageSpeed !== undefined && 
                              effectiveVoyageProgress.averageSpeed !== null) ? 
                              `${effectiveVoyageProgress.averageSpeed.toFixed(1)} knots` : 
                              enhancedVesselData?.currentSpeed ?
                              `${(enhancedVesselData.currentSpeed * 0.9).toFixed(1)} knots` :
                              'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">Estimated arrival</p>
                        <p className="text-sm font-medium">{getETADisplay()}</p>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-sm text-gray-500">
                      <p>Progress information not available</p>
                      {vessel.destinationPort && (
                        <p className="text-xs mt-1">Click "Refresh Journey" to fetch data</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Journey Details */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  Voyage Information
                </h3>
                
                {/* Departure */}
                <div className="flex items-start mb-3">
                  <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Anchor className="h-3 w-3 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">DEPARTURE</p>
                    <p className="text-sm font-medium">{getPortName(vessel.departurePort)}</p>
                    <p className="text-xs text-gray-500">
                      {vessel.departureTime ? formatDate(new Date(vessel.departureTime)) : "N/A"}
                    </p>
                  </div>
                </div>
                
                {/* Destination */}
                <div className="flex items-start mb-3">
                  <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-3 w-3 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">DESTINATION</p>
                    <p className="text-sm font-medium">{getPortName(vessel.destinationPort)}</p>
                    <p className="text-xs text-gray-500">
                      {vessel.eta ? `ETA: ${formatDate(new Date(vessel.eta))}` : "ETA: N/A"}
                    </p>
                  </div>
                </div>
                
                {/* Current Location */}
                <div className="flex items-start">
                  <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Navigation className="h-3 w-3 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">CURRENT LOCATION</p>
                    {isLoadingLocation ? (
                      <div className="flex items-center">
                        <Navigation className="h-3 w-3 mr-1 animate-spin text-primary" />
                        <span className="text-sm">Fetching location...</span>
                      </div>
                    ) : currentLocation ? (
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium">
                            {currentLocation.currentLat && currentLocation.currentLng ? 
                              `${typeof currentLocation.currentLat === 'number' 
                                ? currentLocation.currentLat.toFixed(4) 
                                : parseFloat(String(currentLocation.currentLat)).toFixed(4)}°, 
                                ${typeof currentLocation.currentLng === 'number'
                                ? currentLocation.currentLng.toFixed(4)
                                : parseFloat(String(currentLocation.currentLng)).toFixed(4)}°` : 
                              "Position not available"
                            }
                          </p>
                          {currentLocation.fromAPI && (
                            <Badge variant="outline" className="ml-2 text-xs bg-green-50 border-green-200 text-green-700">
                              Live
                            </Badge>
                          )}
                        </div>
                        
                        {currentLocation.status && (
                          <p className="text-xs text-gray-500">Status: {currentLocation.status}</p>
                        )}
                        
                        {currentLocation.speed !== undefined && (
                          <p className="text-xs text-gray-500">
                            Speed: {currentLocation.speed} knots 
                            {currentLocation.heading !== undefined && ` • Heading: ${currentLocation.heading}°`}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Updated: {currentLocation.lastUpdated ? formatDate(new Date(currentLocation.lastUpdated)) : 'N/A'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium">
                          {vessel.currentLat && vessel.currentLng
                            ? `${typeof vessel.currentLat === 'number' 
                                ? vessel.currentLat.toFixed(4) 
                                : parseFloat(String(vessel.currentLat)).toFixed(4)}°, 
                                ${typeof vessel.currentLng === 'number' 
                                ? vessel.currentLng.toFixed(4) 
                                : parseFloat(String(vessel.currentLng)).toFixed(4)}°`
                            : "Position not available"}
                        </p>
                        <p className="text-xs text-gray-500">From vessel database record</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Maritime Specifications */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <Anchor className="h-4 w-4 mr-2 text-slate-600" />
                  Vessel Specifications
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Vessel Type</p>
                    <p className="text-sm font-medium">{vessel.vesselType || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Flag State</p>
                    <p className="text-sm font-medium">{vessel.flag || "Not specified"}</p>
                  </div>
                  {vessel.built && (
                    <div>
                      <p className="text-xs text-gray-500">Year Built</p>
                      <p className="text-sm font-medium">{vessel.built}</p>
                    </div>
                  )}
                  {vessel.deadweight && (
                    <div>
                      <p className="text-xs text-gray-500">Deadweight Tonnage</p>
                      <p className="text-sm font-medium">{vessel.deadweight.toLocaleString()} DWT</p>
                    </div>
                  )}
                  {vessel.imo && (
                    <div>
                      <p className="text-xs text-gray-500">IMO Number</p>
                      <p className="text-sm font-medium">{vessel.imo}</p>
                    </div>
                  )}
                  {vessel.mmsi && (
                    <div>
                      <p className="text-xs text-gray-500">MMSI</p>
                      <p className="text-sm font-medium">{vessel.mmsi}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Details */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <Navigation className="h-4 w-4 mr-2 text-blue-600" />
                  Navigation & Performance
                </h3>
                <div className="space-y-2">
                  {enhancedVesselData?.course && (
                    <div>
                      <p className="text-xs text-gray-500">Course (Heading)</p>
                      <p className="text-sm font-medium">{enhancedVesselData.course}° True</p>
                    </div>
                  )}
                  {enhancedVesselData?.navStatus && (
                    <div>
                      <p className="text-xs text-gray-500">Navigation Status</p>
                      <p className="text-sm font-medium">{enhancedVesselData.navStatus}</p>
                    </div>
                  )}
                  {vessel.speed && (
                    <div>
                      <p className="text-xs text-gray-500">Current Speed</p>
                      <p className="text-sm font-medium">{vessel.speed} knots</p>
                    </div>
                  )}
                  {enhancedVesselData?.draught && (
                    <div>
                      <p className="text-xs text-gray-500">Current Draught</p>
                      <p className="text-sm font-medium">{enhancedVesselData.draught} meters</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Last Position Update</p>
                    <p className="text-sm font-medium">
                      {vessel.lastUpdated ? formatDate(new Date(vessel.lastUpdated)) : "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cargo & Operational Information */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <BarChart3 className="h-4 w-4 mr-2 text-orange-600" />
                  Cargo & Operations
                </h3>
                <div className="space-y-2">
                  {vessel.cargoType && (
                    <div>
                      <p className="text-xs text-gray-500">Cargo Type</p>
                      <p className="text-sm font-medium">{vessel.cargoType}</p>
                    </div>
                  )}
                  {vessel.cargoCapacity && (
                    <div>
                      <p className="text-xs text-gray-500">Cargo Capacity</p>
                      <p className="text-sm font-medium">{vessel.cargoCapacity.toLocaleString()} metric tons</p>
                    </div>
                  )}
                  {vessel.ownerName && (
                    <div>
                      <p className="text-xs text-gray-500">Owner</p>
                      <p className="text-sm font-medium">{vessel.ownerName}</p>
                    </div>
                  )}
                  {vessel.operatorName && (
                    <div>
                      <p className="text-xs text-gray-500">Operator</p>
                      <p className="text-sm font-medium">{vessel.operatorName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Current Region</p>
                    <p className="text-sm font-medium">{vessel.currentRegion || "Unknown"}</p>
                  </div>
                </div>
              </div>

              {/* Voyage Economics */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  Commercial Information
                </h3>
                <div className="space-y-2">
                  {vessel.buyerName && (
                    <div>
                      <p className="text-xs text-gray-500">Buyer</p>
                      <p className="text-sm font-medium">{vessel.buyerName}</p>
                    </div>
                  )}
                  {vessel.sellerName && (
                    <div>
                      <p className="text-xs text-gray-500">Seller</p>
                      <p className="text-sm font-medium">{vessel.sellerName}</p>
                    </div>
                  )}
                  {vessel.oilSource && (
                    <div>
                      <p className="text-xs text-gray-500">Oil Source</p>
                      <p className="text-sm font-medium">{vessel.oilSource}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Voyage Status</p>
                    <Badge variant={vessel.status === "underway" ? "default" : "secondary"} className="text-xs">
                      {vessel.status || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
              <div className="mt-4 bg-white rounded-lg border border-amber-200 p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  Voyage Alerts
                </h3>
                
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-start bg-amber-50 p-2 rounded-md border border-amber-100">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-amber-700">{alert.type} Alert</p>
                        <p className="text-xs text-amber-600">{alert.message}</p>
                        <p className="text-xs text-amber-500 mt-1">{formatDate(alert.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="route" className="mt-0">
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="text-sm font-medium flex items-center mb-3">
                <Route className="h-4 w-4 mr-2 text-primary" />
                Route Map
              </h3>
              
              {/* Interactive Route Map */}
              <div className="relative rounded-md overflow-hidden mb-4 bg-gray-100">
                <div className="flex justify-between items-center py-2 px-4">
                  <p className="text-xs text-gray-600">Interactive voyage tracking</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs" 
                    onClick={fetchRouteData}
                    disabled={isLoadingRoute}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingRoute ? 'animate-spin' : ''}`} />
                    {isLoadingRoute ? 'Loading...' : 'Refresh Route'}
                  </Button>
                </div>
                
                {isLoadingRoute ? (
                  <div className="h-64 flex items-center justify-center flex-col">
                    <Route className="h-8 w-8 text-gray-400 mb-2 animate-pulse" />
                    <p className="text-gray-500 text-sm">Loading route data...</p>
                  </div>
                ) : routeData && vessel.currentLat && vessel.currentLng ? (
                  <div className="aspect-video w-full">
                    <MapContainer
                      center={[Number(vessel.currentLat), Number(vessel.currentLng)]}
                      zoom={4}
                      style={{ height: "100%", width: "100%" }}
                      className="rounded-md"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Show voyage route */}
                      {routeData.departurePosition && routeData.destinationPosition && (
                        <Polyline 
                          positions={[
                            [routeData.departurePosition.lat, routeData.departurePosition.lng], 
                            [Number(vessel.currentLat), Number(vessel.currentLng)],
                            [routeData.destinationPosition.lat, routeData.destinationPosition.lng]
                          ]}
                          color="#2563eb"
                          weight={3}
                          dashArray="6, 10"
                        />
                      )}
                      
                      {/* Departure Marker */}
                      {routeData.departurePosition && (
                        <Marker 
                          position={[routeData.departurePosition.lat, routeData.departurePosition.lng]}
                          icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div style="background-color: #2563eb; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                          })}
                        >
                          <Popup>
                            <div className="text-sm">
                              <strong>Departure:</strong> {routeData.departurePosition.portName || getPortName(vessel.departurePort)}<br/>
                              <span className="text-xs text-gray-500">
                                {vessel.departureTime ? formatDate(new Date(vessel.departureTime)) : "Unknown date"}
                              </span>
                              {routeData.departurePosition.isEstimated && (
                                <div className="text-xs text-amber-600 mt-1">Estimated position</div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      
                      {/* Current Position Marker */}
                      <Marker 
                        position={[
                          typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat)), 
                          typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng))
                        ]}
                        icon={L.divIcon({
                          className: 'custom-div-icon',
                          html: `<div style="background-color: #047857; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; position: relative;">
                                  <div style="position: absolute; top: -4px; right: -4px; width: 8px; height: 8px; background-color: #f97316; border-radius: 50%; border: 1px solid white;"></div>
                                 </div>`,
                          iconSize: [14, 14],
                          iconAnchor: [7, 7]
                        })}
                      >
                        <Popup>
                          <div className="text-sm">
                            <strong>Current Position</strong><br/>
                            <span className="text-xs">
                              {vessel.currentLat ? 
                                (typeof vessel.currentLat === 'number' 
                                  ? vessel.currentLat.toFixed(4) 
                                  : parseFloat(String(vessel.currentLat)).toFixed(4)) 
                                : 'N/A'}°, 
                              {vessel.currentLng ? 
                                (typeof vessel.currentLng === 'number' 
                                  ? vessel.currentLng.toFixed(4) 
                                  : parseFloat(String(vessel.currentLng)).toFixed(4)) 
                                : 'N/A'}°
                            </span>
                            {currentLocation?.speed && (
                              <div className="text-xs text-gray-500 mt-1">
                                Speed: {currentLocation.speed} knots
                                {currentLocation.heading && ` • Heading: ${currentLocation.heading}°`}
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Destination Marker */}
                      {routeData.destinationPosition && (
                        <Marker 
                          position={[routeData.destinationPosition.lat, routeData.destinationPosition.lng]}
                          icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div style="background-color: #dc2626; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                          })}
                        >
                          <Popup>
                            <div className="text-sm">
                              <strong>Destination:</strong> {routeData.destinationPosition.portName || getPortName(vessel.destinationPort)}<br/>
                              <span className="text-xs text-gray-500">
                                {vessel.eta ? `ETA: ${formatDate(new Date(vessel.eta))}` : "Unknown ETA"}
                              </span>
                              {routeData.destinationPosition.isEstimated && (
                                <div className="text-xs text-amber-600 mt-1">Estimated position</div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      
                      {/* Add stopovers if available with midpoint calculations */}
                      {stopovers.length > 0 && routeData.departurePosition && routeData.destinationPosition && stopovers.map((stop, index) => (
                        <Marker 
                          key={index}
                          position={[
                            // Calculate a position along the route for the stopover
                            (routeData.departurePosition.lat + routeData.destinationPosition.lat) / 2 + (index * 0.5 - 0.5),
                            (routeData.departurePosition.lng + routeData.destinationPosition.lng) / 2
                          ]}
                          icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div style="background-color: #8b5cf6; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
                            iconSize: [10, 10],
                            iconAnchor: [5, 5]
                          })}
                        >
                          <Popup>
                            <div className="text-sm">
                              <strong>Stopover:</strong> {stop.port}<br/>
                              <span className="text-xs text-gray-500">
                                Arrival: {formatDate(stop.arrival)}<br/>
                                Departure: {formatDate(stop.departure)}<br/>
                                Purpose: {stop.purpose}
                              </span>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                      
                      <ZoomControl position="bottomright" />
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center flex-col">
                    <Route className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">Route data not available</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={fetchRouteData}>
                      Load Route Data
                    </Button>
                  </div>
                )}
                
                {routeData && (
                  <div className="px-4 pb-2 pt-1 text-xs flex items-center space-x-3">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-600 mr-1"></div>
                      <span>Departure</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-700 mr-1"></div>
                      <span>Current</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-600 mr-1"></div>
                      <span>Destination</span>
                    </div>
                    {stopovers.length > 0 && (
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>
                        <span>Stopover</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Stopovers */}
              {stopovers.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Scheduled Stopovers</h4>
                  <div className="space-y-2">
                    {stopovers.map((stop, index) => (
                      <div key={index} className="flex items-start border-l-2 border-primary pl-3 py-1">
                        <div>
                          <p className="text-sm font-medium">{stop.port}</p>
                          <p className="text-xs text-gray-500">
                            Arrival: {formatDate(stop.arrival)} • Departure: {formatDate(stop.departure)}
                          </p>
                          <p className="text-xs text-gray-600">Purpose: {stop.purpose}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Route details */}
              <div>
                <h4 className="text-sm font-medium mb-2">Route Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Total Distance</p>
                    <p className="text-sm font-medium">
                      {(voyageProgress?.distanceTraveled !== undefined && voyageProgress?.distanceRemaining !== undefined)
                        ? `${(
                            (typeof voyageProgress.distanceTraveled === 'number' ? voyageProgress.distanceTraveled : parseFloat(String(voyageProgress.distanceTraveled || 0))) + 
                            (typeof voyageProgress.distanceRemaining === 'number' ? voyageProgress.distanceRemaining : parseFloat(String(voyageProgress.distanceRemaining || 0)))
                          ).toLocaleString()} nautical miles`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estimated Duration</p>
                    <p className="text-sm font-medium">
                      {vessel?.eta && vessel?.departureTime
                        ? `${Math.ceil((new Date(vessel.eta).getTime() - new Date(vessel.departureTime).getTime()) / (1000 * 60 * 60 * 24))} days`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="destinations" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Destination From */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Destination From
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Departure Port</p>
                    <p className="text-sm font-medium">{getPortName(vessel.departurePort)}</p>
                  </div>
                  {vessel.departureDate && (
                    <div>
                      <p className="text-xs text-gray-500">Departure Date</p>
                      <p className="text-sm font-medium">{formatDate(new Date(vessel.departureDate))}</p>
                    </div>
                  )}
                  {vessel.departureLat && vessel.departureLng && (
                    <div>
                      <p className="text-xs text-gray-500">Coordinates</p>
                      <p className="text-sm font-medium">{vessel.departureLat}°, {vessel.departureLng}°</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Destination To */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-2 text-red-600" />
                  Destination To
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Destination Port</p>
                    <p className="text-sm font-medium">{getPortName(vessel.destinationPort)}</p>
                  </div>
                  {vessel.eta && (
                    <div>
                      <p className="text-xs text-gray-500">ETA</p>
                      <p className="text-sm font-medium">{formatDate(new Date(vessel.eta))}</p>
                    </div>
                  )}
                  {vessel.destinationLat && vessel.destinationLng && (
                    <div>
                      <p className="text-xs text-gray-500">Coordinates</p>
                      <p className="text-sm font-medium">{vessel.destinationLat}°, {vessel.destinationLng}°</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Refinery */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <Building className="h-4 w-4 mr-2 text-blue-600" />
                  Target Refinery
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Refinery Name</p>
                    <p className="text-sm font-medium">{vessel.targetRefinery || getPortName(vessel.destinationPort)}</p>
                  </div>
                  {vessel.oilSource && (
                    <div>
                      <p className="text-xs text-gray-500">Oil Source</p>
                      <p className="text-sm font-medium">{vessel.oilSource}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Route Distance */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <Route className="h-4 w-4 mr-2 text-purple-600" />
                  Route / Distance
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Total Distance</p>
                    <p className="text-sm font-medium">
                      {vessel.routeDistance ? `${vessel.routeDistance} nautical miles` : 
                       (voyageProgress?.distanceTraveled && voyageProgress?.distanceRemaining) ? 
                       `${(parseFloat(String(voyageProgress.distanceTraveled)) + parseFloat(String(voyageProgress.distanceRemaining))).toLocaleString()} nautical miles` : 
                       'Not calculated'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Speed</p>
                    <p className="text-sm font-medium">{(vessel as any).speed || currentLocation?.speed || 'Not available'} knots</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deal" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Oil Type & Cargo */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <Fuel className="h-4 w-4 mr-2 text-amber-600" />
                  Oil Type / Cargo Type
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Cargo Type</p>
                    <p className="text-sm font-medium">{(vessel as any).oilType || vessel.cargoType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cargo Capacity</p>
                    <p className="text-sm font-medium">{vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} tons` : 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Quantity & Value */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <Package className="h-4 w-4 mr-2 text-green-600" />
                  Quantity & Value
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="text-sm font-medium">{(vessel as any).quantity ? `${parseFloat((vessel as any).quantity).toLocaleString()} barrels` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Deal Value</p>
                    <p className="text-sm font-medium">{(vessel as any).dealValue ? `$${parseFloat((vessel as any).dealValue).toLocaleString()}` : 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Loading Port & Pricing */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                  Loading Port & Pricing
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Loading Port</p>
                    <p className="text-sm font-medium">{getPortName((vessel as any).loadingPort || vessel.departurePort)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price per Barrel</p>
                    <p className="text-sm font-medium">{(vessel as any).price ? `$${parseFloat((vessel as any).price).toFixed(2)}` : 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Market Data & Source */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                  Market Price & Source
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Market Price</p>
                    <p className="text-sm font-medium">{(vessel as any).marketPrice ? `$${parseFloat((vessel as any).marketPrice).toFixed(2)}` : 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Source Company</p>
                    <p className="text-sm font-medium">{(vessel as any).sourceCompany || vessel.sellerName || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Refinery & Shipping Type */}
              <div className="bg-white rounded-lg border p-4 shadow-sm col-span-1 md:col-span-2">
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <Ship className="h-4 w-4 mr-2 text-indigo-600" />
                  Refinery & Shipping Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Target Refinery</p>
                    <p className="text-sm font-medium">{(vessel as any).targetRefinery || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipping Type</p>
                    <p className="text-sm font-medium">
                      {(vessel as any).shippingType || 'Not specified'}
                      {(vessel as any).shippingType && (
                        <span className="ml-2 text-xs text-gray-500">
                          {(vessel as any).shippingType === 'FOB' ? '(Free On Board)' : 
                           (vessel as any).shippingType === 'CIF' ? '(Cost, Insurance, Freight)' : 
                           (vessel as any).shippingType === 'In Tank' ? '(In Tank Storage)' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Weather Conditions */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Wind className="h-4 w-4 mr-2 text-primary" />
                    Weather Conditions
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowWeatherDetails(!showWeatherDetails)}
                    className="h-7 px-2"
                  >
                    {showWeatherDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Current Weather</p>
                      <p className="text-sm font-medium">{weatherData.currentCondition}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Temperature</p>
                      <p className="text-sm font-medium">{weatherData.temperature}°C</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Wind</p>
                      <p className="text-sm font-medium">{weatherData.windSpeed} knots {weatherData.windDirection}</p>
                    </div>
                  </div>
                </div>
                
                {showWeatherDetails && (
                  <div className="mt-4 border-t pt-3">
                    <h4 className="text-xs font-medium mb-2">Upcoming Conditions</h4>
                    <div className="space-y-2">
                      {weatherData.upcoming.map((day, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="font-medium">{day.day}</span>
                          <span>{day.condition}</span>
                          <span>{day.temperature}°C</span>
                          <span>{day.windSpeed} knots</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Wave Height</p>
                        <p className="text-xs font-medium">{weatherData.waveHeight} meters</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Visibility</p>
                        <p className="text-xs font-medium">{weatherData.visibility}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pressure</p>
                        <p className="text-xs font-medium">{weatherData.pressure} hPa</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fuel & Consumption */}
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Fuel className="h-4 w-4 mr-2 text-primary" />
                    Fuel & Consumption
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFuelDetails(!showFuelDetails)}
                    className="h-7 px-2"
                  >
                    {showFuelDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Current consumption</p>
                    <p className="text-sm font-medium">{fuelData.current} tons/day</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Average consumption</p>
                    <p className="text-sm font-medium">{fuelData.average} tons/day</p>
                  </div>
                </div>
                
                {showFuelDetails && (
                  <div className="mt-4 border-t pt-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Total used</p>
                        <p className="text-xs font-medium">{fuelData.total} tons</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Remaining</p>
                        <p className="text-xs font-medium">{fuelData.remaining} tons</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Efficiency</p>
                        <p className="text-xs font-medium">{(fuelData.efficiency * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CO2 emissions</p>
                        <p className="text-xs font-medium">{fuelData.co2Emissions} tons</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">Efficiency trend</p>
                      <div className="h-8 bg-gray-100 rounded-md mt-1 flex items-end">
                        {[0.85, 0.92, 0.89, 0.93, 0.9, 0.95, 0.92].map((val, i) => (
                          <div 
                            key={i}
                            className="bg-green-500 w-full mx-0.5 rounded-t-sm"
                            style={{ height: `${val * 100}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>7 days ago</span>
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="text-sm font-medium flex items-center mb-3">
                <History className="h-4 w-4 mr-2 text-primary" />
                Voyage History
              </h3>
              
              {/* Past voyages */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="route-changes">
                  <AccordionTrigger>
                    <span className="text-sm font-medium flex items-center">
                      <Route className="h-4 w-4 mr-2 text-primary" />
                      Route Changes
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-2">
                      {routeChanges.map((change, index) => (
                        <div key={index} className="border-l-2 border-primary pl-3 py-1">
                          <p className="text-xs text-gray-500">{formatDate(change.date)}</p>
                          <p className="text-sm">{change.description}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="past-voyages">
                  <AccordionTrigger>
                    <span className="text-sm font-medium flex items-center">
                      <Ship className="h-4 w-4 mr-2 text-primary" />
                      Past Voyages
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-2">
                      <div className="border-l-2 border-gray-300 pl-3 py-1">
                        <p className="text-sm font-medium">Rotterdam to Singapore</p>
                        <p className="text-xs text-gray-500">Feb 2 - Mar 1, 2023</p>
                        <p className="text-xs">Transported crude oil, 120,000 tons</p>
                      </div>
                      <div className="border-l-2 border-gray-300 pl-3 py-1">
                        <p className="text-sm font-medium">Houston to Rotterdam</p>
                        <p className="text-xs text-gray-500">Dec 15, 2022 - Jan 20, 2023</p>
                        <p className="text-xs">Transported petroleum products, 95,000 tons</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="performance">
                  <AccordionTrigger>
                    <span className="text-sm font-medium flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                      Performance Analytics
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Average speed (last 30 days)</p>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '82%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>15.2 knots (avg)</span>
                          <span className="font-medium">18.5 knots</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fuel efficiency (last 30 days)</p>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '76%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Standard</span>
                          <span className="font-medium">24% better than fleet avg</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VoyageDetails;