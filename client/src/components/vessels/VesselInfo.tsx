import { Card, CardContent } from "@/components/ui/card";
import { Vessel } from "@/types";
import { Package, MapPin, Box, RefreshCcw, Navigation, Compass, Clock, Gauge, Anchor, Ship } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { FlagIcon } from "react-flag-kit";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface VesselInfoProps {
  vessel: Vessel;
}

// Map country names to ISO country codes for flag icons
const getFlagCode = (countryName: string): string | null => {
  const countryCodeMap: Record<string, string> = {
    // Common maritime countries
    "United States": "US",
    "USA": "US",
    "United Kingdom": "GB",
    "UK": "GB",
    "China": "CN",
    "Japan": "JP",
    "South Korea": "KR",
    "Korea": "KR",
    "Russia": "RU",
    "India": "IN",
    "Australia": "AU",
    "Canada": "CA",
    "Brazil": "BR",
    "Germany": "DE",
    "France": "FR",
    "Italy": "IT",
    "Spain": "ES",
    "Netherlands": "NL",
    "Norway": "NO",
    "Denmark": "DK",
    "Sweden": "SE",
    "Finland": "FI",
    "Greece": "GR",
    "Turkey": "TR",
    "Portugal": "PT",
    "Singapore": "SG",
    "Malaysia": "MY",
    "Indonesia": "ID",
    "Philippines": "PH",
    "Thailand": "TH",
    "Vietnam": "VN",
    "Taiwan": "TW",
    "UAE": "AE",
    "United Arab Emirates": "AE",
    "Saudi Arabia": "SA",
    "Qatar": "QA",
    "Kuwait": "KW",
    "Oman": "OM",
    "Bahrain": "BH",
    "Iran": "IR",
    "Iraq": "IQ",
    "Israel": "IL",
    "Egypt": "EG",
    "South Africa": "ZA",
    "Nigeria": "NG",
    "Morocco": "MA",
    "Algeria": "DZ",
    "Tunisia": "TN",
    "Libya": "LY",
    "Mexico": "MX",
    "Argentina": "AR",
    "Chile": "CL",
    "Colombia": "CO",
    "Peru": "PE",
    "Venezuela": "VE",
    "Panama": "PA",
    "Liberia": "LR",
    "Marshall Islands": "MH",
    "Malta": "MT",
    "Cyprus": "CY",
    "Bahamas": "BS",
    "Bermuda": "BM",
    "Hong Kong": "HK",
    "Gibraltar": "GI",
    "Isle of Man": "IM",
    "Cayman Islands": "KY",
    "Antigua and Barbuda": "AG",
    "St. Vincent": "VC",
    "Saint Vincent": "VC",
    "Vanuatu": "VU",
    "Belize": "BZ",
    "Jamaica": "JM",
    "Barbados": "BB",
    "Tanzania": "TZ",
    "Togo": "TG",
    "Sierra Leone": "SL",
    "Comoros": "KM",
    "Cambodia": "KH",
    "Moldova": "MD",
    "Mongolia": "MN",
    "Palau": "PW",
    "Samoa": "WS",
    "Tuvalu": "TV",
    "Cook Islands": "CK"
  };
  
  // Return the country code if found in the map
  return countryCodeMap[countryName] || null;
};

// Voyage Progress interface
interface VoyageProgress {
  percentComplete: number;
  distanceTraveled: number;
  distanceRemaining: number;
  estimatedArrival: Date | null;
  currentSpeed: number;
  averageSpeed: number;
  lastUpdated: Date;
  fromAPI?: boolean;
  estimated?: boolean;
}

export default function VesselInfo({ vessel }: VesselInfoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingVoyage, setIsLoadingVoyage] = useState(false);
  const [sellerName, setSellerName] = useState<string | null>(vessel.sellerName);
  const [currentLocation, setCurrentLocation] = useState<{
    currentLat: string;
    currentLng: string;
    speed?: number;
    heading?: number;
    status?: string;
    lastUpdated: Date;
    fromAPI?: boolean;
    fromDatabase?: boolean;
  } | null>(null);
  const [voyageProgress, setVoyageProgress] = useState<VoyageProgress | null>(null);
  const { toast } = useToast();
  
  // Function to generate seller name using OpenAI
  const generateSellerName = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/ai/generate-seller-name', {
        method: 'POST',
        body: JSON.stringify({ vesselId: vessel.id })
      });
      
      if (response.success && response.sellerName) {
        setSellerName(response.sellerName);
        toast({
          title: "Seller Name Generated",
          description: `Generated seller name: ${response.sellerName}`,
        });
      } else {
        throw new Error(response.error || 'Failed to generate seller name');
      }
    } catch (error) {
      console.error('Error generating seller name:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate seller name',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch current location from API
  const fetchCurrentLocation = async () => {
    if (isLoadingLocation) return;
    
    setIsLoadingLocation(true);
    try {
      const response = await axios.get(`/api/vessels/${vessel.id}/location`);
      
      if (response.data && response.data.currentLocation) {
        setCurrentLocation(response.data.currentLocation);
        toast({
          title: response.data.fromAPI ? "Location Updated from API" : "Location Retrieved",
          description: `Current position: ${response.data.currentLocation.currentLat}, ${response.data.currentLocation.currentLng}`,
        });
      } else {
        throw new Error(response.data?.message || 'Failed to fetch current location');
      }
    } catch (error) {
      console.error('Error fetching current location:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch current location',
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };
  
  // Function to fetch voyage progress from API
  const fetchVoyageProgress = async () => {
    if (isLoadingVoyage || !vessel.destinationPort) return;
    
    setIsLoadingVoyage(true);
    try {
      const response = await axios.get(`/api/vessels/${vessel.id}/voyage-progress`);
      
      if (response.data && response.data.voyageProgress) {
        // Parse any date strings
        const progressData = {
          ...response.data.voyageProgress,
          lastUpdated: new Date(response.data.voyageProgress.lastUpdated),
          estimatedArrival: response.data.voyageProgress.estimatedArrival 
            ? new Date(response.data.voyageProgress.estimatedArrival) 
            : null
        };
        
        setVoyageProgress(progressData);
        toast({
          title: response.data.voyageProgress.fromAPI ? "Voyage Progress Updated" : "Voyage Progress Retrieved",
          description: `Current progress: ${progressData.percentComplete}% complete`,
        });
      } else {
        throw new Error(response.data?.message || 'Failed to fetch voyage progress');
      }
    } catch (error) {
      console.error('Error fetching voyage progress:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch voyage progress',
      });
    } finally {
      setIsLoadingVoyage(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    // Only fetch if we have vessel ID
    if (vessel.id) {
      fetchCurrentLocation();
      if (vessel.destinationPort) {
        fetchVoyageProgress();
      }
    }
  }, [vessel.id]);
  
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-heading font-medium text-gray-800">Vessel Information</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            onClick={fetchCurrentLocation}
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
              onClick={fetchVoyageProgress}
              disabled={isLoadingVoyage}
            >
              <Ship className={`h-3 w-3 mr-1 ${isLoadingVoyage ? 'animate-spin' : ''}`} />
              Update Journey
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            onClick={generateSellerName}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Update Trade Info
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vessel Basic Info */}
          <div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">{vessel.name}</h4>
                <p className="text-sm text-gray-500">
                  IMO: {vessel.imo} | MMSI: {vessel.mmsi}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">VESSEL TYPE</p>
                <p className="text-sm font-medium">{vessel.vesselType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">FLAG</p>
                <div className="flex items-center gap-2">
                  {vessel.flag && getFlagCode(vessel.flag) && (
                    <FlagIcon 
                      code={getFlagCode(vessel.flag) as string} 
                      size={20} 
                      className="shadow-sm rounded-sm" 
                    />
                  )}
                  <p className="text-sm font-medium">{vessel.flag}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">BUILT</p>
                <p className="text-sm font-medium">{vessel.built || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">DEADWEIGHT</p>
                <p className="text-sm font-medium">
                  {vessel.deadweight ? `${vessel.deadweight.toLocaleString()} t` : "N/A"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Voyage Info */}
          <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">CURRENT DESTINATION</h4>
            
            {/* Departure */}
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">DEPARTURE</p>
                <p className="text-sm font-medium">{vessel.departurePort || "N/A"}</p>
                <p className="text-xs text-gray-500">{vessel.departureDate ? formatDate(new Date(vessel.departureDate)) : "N/A"}</p>
              </div>
            </div>
            
            {/* Destination */}
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">DESTINATION</p>
                <p className="text-sm font-medium">{vessel.destinationPort || "N/A"}</p>
                <p className="text-xs text-gray-500">
                  {vessel.eta ? `ETA: ${formatDate(new Date(vessel.eta))}` : "ETA: N/A"}
                </p>
              </div>
            </div>
            
            {/* Cargo */}
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Box className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">CARGO</p>
                <p className="text-sm font-medium">{vessel.cargoType || "N/A"}</p>
                <p className="text-xs text-gray-500">
                  {vessel.cargoCapacity 
                    ? `${vessel.cargoCapacity.toLocaleString()} barrels` 
                    : "Capacity: N/A"}
                </p>
              </div>
            </div>

            {/* Current Location */}
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Navigation className="h-4 w-4 text-primary" />
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
                        {`${parseFloat(currentLocation.currentLat).toFixed(4)}°, ${parseFloat(currentLocation.currentLng).toFixed(4)}°`}
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
                      Updated: {formatDate(new Date(currentLocation.lastUpdated))}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">
                      {vessel.currentLat && vessel.currentLng
                        ? `${parseFloat(vessel.currentLat).toFixed(4)}°, ${parseFloat(vessel.currentLng).toFixed(4)}°`
                        : "Position not available"}
                    </p>
                    <p className="text-xs text-gray-500">From vessel database record</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Voyage Progress */}
            {vessel.destinationPort && (
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Anchor className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-3 w-full">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">VOYAGE PROGRESS</p>
                    {voyageProgress?.fromAPI && (
                      <Badge variant="outline" className="ml-2 text-xs bg-green-50 border-green-200 text-green-700">
                        Live
                      </Badge>
                    )}
                    {voyageProgress?.estimated && (
                      <Badge variant="outline" className="ml-2 text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                        Estimated
                      </Badge>
                    )}
                  </div>
                  
                  {isLoadingVoyage ? (
                    <div className="flex items-center">
                      <Ship className="h-3 w-3 mr-1 animate-spin text-primary" />
                      <span className="text-sm">Fetching voyage progress...</span>
                    </div>
                  ) : voyageProgress ? (
                    <div className="w-full">
                      <div className="flex justify-between mb-1 text-xs text-gray-500">
                        <span>{vessel.departurePort}</span>
                        <span className="text-primary font-medium">{voyageProgress.percentComplete}%</span>
                        <span>{vessel.destinationPort}</span>
                      </div>
                      <Progress value={voyageProgress.percentComplete} className="h-2 mb-1" />
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                        <div>
                          <p className="text-gray-500">Distance traveled:</p>
                          <p className="font-medium">{voyageProgress.distanceTraveled.toLocaleString()} nautical miles</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Remaining:</p>
                          <p className="font-medium">{voyageProgress.distanceRemaining.toLocaleString()} nautical miles</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Current speed:</p>
                          <p className="font-medium">{voyageProgress.currentSpeed} knots</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Average speed:</p>
                          <p className="font-medium">{voyageProgress.averageSpeed} knots</p>
                        </div>
                      </div>
                      
                      {voyageProgress.estimatedArrival && (
                        <div className="mt-2 text-xs">
                          <p className="text-gray-500">Estimated arrival:</p>
                          <p className="font-medium">{formatDate(voyageProgress.estimatedArrival)}</p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Updated: {formatDate(new Date(voyageProgress.lastUpdated))}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Progress information not available</p>
                      <p className="text-xs text-gray-500">Click "Update Journey" to fetch voyage progress</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Trade Info (Buyer & Seller) */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">TRADE INFORMATION</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">SELLER</p>
                  <p className="text-sm font-medium">
                    {isLoading ? (
                      <span className="inline-flex items-center">
                        <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      sellerName || vessel.sellerName || "Unknown"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">BUYER</p>
                  <p className="text-sm font-medium">{vessel.buyerName || "NA"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
