import { Card, CardContent } from "@/components/ui/card";
import { Vessel } from "@/types";
import { Package, MapPin, Box, RefreshCcw, Navigation, Compass, Clock, Gauge } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { FlagIcon } from "react-flag-kit";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import axios from "axios";
import { Badge } from "@/components/ui/badge";

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

export default function VesselInfo({ vessel }: VesselInfoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
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
  
  // Fetch current location on component mount
  useEffect(() => {
    // Only fetch if we have vessel ID
    if (vessel.id) {
      fetchCurrentLocation();
    }
  }, [vessel.id]);
  
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-heading font-medium text-gray-800">Vessel Information</h3>
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
            <h4 className="text-sm font-medium text-gray-900 mb-3">CURRENT VOYAGE</h4>
            
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
