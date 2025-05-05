import React, { useState } from "react";
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
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Vessel } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    { date: new Date(2023, 2, 15), description: "Route adjusted due to weather conditions near the Strait of Gibraltar" },
    { date: new Date(2023, 2, 12), description: "Initial route planned from Hammerfest to Tokyo" }
  ];

  // Stopovers - would be from API
  const stopovers = vessel.destinationPort ? [
    { port: "Singapore", arrival: new Date(2023, 3, 20), departure: new Date(2023, 3, 21), purpose: "Refueling" }
  ] : [];

  // Alerts - would be from API
  const alerts = [
    { type: "Delay", severity: "medium", message: "Weather conditions may delay arrival by 6-12 hours", date: new Date() }
  ];

  // Calculate the estimated time of arrival display
  const getETADisplay = () => {
    try {
      if (voyageProgress?.estimatedArrival) {
        return formatDate(new Date(voyageProgress.estimatedArrival));
      } else if (vessel?.eta) {
        return formatDate(new Date(vessel.eta));
      }
      return "Not available";
    } catch (error) {
      console.error("Error formatting ETA:", error);
      return "Not available";
    }
  };

  // For demo purposes, use a static image for route map
  // In a real implementation, this would be a dynamic map showing the route
  const routeMapUrl = "https://via.placeholder.com/500x250?text=Route+Map";

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Route className="h-5 w-5 mr-2 text-primary" />
            Voyage Details
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
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="route">Route</TabsTrigger>
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
                      {voyageProgress?.fromAPI && (
                        <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                          Live Data
                        </Badge>
                      )}
                      {voyageProgress?.estimated && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                          Estimated
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {isLoadingVoyage ? (
                    <div className="flex items-center justify-center py-4">
                      <Ship className="h-4 w-4 mr-2 animate-spin text-primary" />
                      <span className="text-sm">Fetching voyage progress...</span>
                    </div>
                  ) : voyageProgress ? (
                    <>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                        <div className="flex flex-col items-center">
                          <MapPin className="h-3 w-3 text-primary mb-1" />
                          <span>{vessel.departurePort?.split(',')[0]}</span>
                        </div>
                        <span className="text-primary font-medium">{voyageProgress.percentComplete}% Complete</span>
                        <div className="flex flex-col items-center">
                          <MapPin className="h-3 w-3 text-primary mb-1" />
                          <span>{vessel.destinationPort?.split(',')[0]}</span>
                        </div>
                      </div>
                      
                      <Progress 
                        value={voyageProgress?.percentComplete ?? 0} 
                        className="h-2 mb-3" 
                      />
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Distance traveled</p>
                          <p className="text-sm font-medium">
                            {(voyageProgress?.distanceTraveled !== undefined && 
                              voyageProgress.distanceTraveled !== null && 
                              typeof voyageProgress.distanceTraveled === 'number') ? 
                              `${voyageProgress.distanceTraveled.toLocaleString()} nautical miles` : 
                              'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Remaining</p>
                          <p className="text-sm font-medium">
                            {(voyageProgress?.distanceRemaining !== undefined && 
                              voyageProgress.distanceRemaining !== null && 
                              typeof voyageProgress.distanceRemaining === 'number') ? 
                              `${voyageProgress.distanceRemaining.toLocaleString()} nautical miles` : 
                              'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Current speed</p>
                          <p className="text-sm font-medium">
                            {(voyageProgress?.currentSpeed !== undefined && 
                              voyageProgress.currentSpeed !== null && 
                              typeof voyageProgress.currentSpeed === 'number') ? 
                              `${voyageProgress.currentSpeed} knots` : 
                              'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Average speed</p>
                          <p className="text-sm font-medium">
                            {(voyageProgress?.averageSpeed !== undefined && 
                              voyageProgress.averageSpeed !== null && 
                              typeof voyageProgress.averageSpeed === 'number') ? 
                              `${voyageProgress.averageSpeed} knots` : 
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
                    <p className="text-sm font-medium">{vessel.departurePort || "N/A"}</p>
                    <p className="text-xs text-gray-500">
                      {vessel.departureDate ? formatDate(new Date(vessel.departureDate)) : "N/A"}
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
                    <p className="text-sm font-medium">{vessel.destinationPort || "N/A"}</p>
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
                              `${parseFloat(String(currentLocation.currentLat)).toFixed(4)}°, ${parseFloat(String(currentLocation.currentLng)).toFixed(4)}°` : 
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
                            ? `${parseFloat(String(vessel.currentLat)).toFixed(4)}°, ${parseFloat(String(vessel.currentLng)).toFixed(4)}°`
                            : "Position not available"}
                        </p>
                        <p className="text-xs text-gray-500">From vessel database record</p>
                      </div>
                    )}
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
              
              {/* Route map - in production this would be a real interactive map */}
              <div className="relative rounded-md overflow-hidden mb-4 bg-gray-100">
                <img 
                  src={routeMapUrl} 
                  alt="Vessel route map" 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-white text-primary border-primary">
                    Interactive Map
                  </Badge>
                </div>
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
                      {(voyageProgress?.distanceTraveled !== undefined && voyageProgress?.distanceRemaining !== undefined &&
                          typeof voyageProgress.distanceTraveled === 'number' && typeof voyageProgress.distanceRemaining === 'number')
                        ? `${(voyageProgress.distanceTraveled + voyageProgress.distanceRemaining).toLocaleString()} nautical miles`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estimated Duration</p>
                    <p className="text-sm font-medium">
                      {vessel?.eta && vessel?.departureDate
                        ? `${Math.ceil((new Date(vessel.eta).getTime() - new Date(vessel.departureDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                        : "N/A"}
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