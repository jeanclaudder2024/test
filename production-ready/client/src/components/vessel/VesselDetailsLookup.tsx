import { useState } from "react";
import { getVesselDetails, VesselDetails } from "@/api/vesselTracking";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Ship, Anchor, Navigation, Wind, Flag, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function VesselDetailsLookup() {
  const [mmsi, setMmsi] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [vessel, setVessel] = useState<VesselDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Format the received timestamp
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };
  
  // Get vessel type name from type code
  const getVesselTypeName = (typeCode: number): string => {
    const vesselTypes: Record<number, string> = {
      0: "Not available",
      30: "Fishing vessel",
      31: "Tug",
      32: "Towing vessel",
      33: "Dredger",
      34: "Dive vessel",
      35: "Military vessel",
      36: "Sailing vessel",
      37: "Pleasure craft",
      50: "Pilot vessel",
      51: "Search and rescue vessel",
      52: "Tug",
      53: "Port tender",
      54: "Anti-pollution equipment",
      55: "Law enforcement vessel",
      // Oil tankers
      80: "Oil tanker",
      81: "Crude oil tanker",
      82: "Chemical tanker",
      83: "LNG tanker",
      84: "LPG tanker",
      85: "Tanker (hazardous)",
      89: "Other tanker",
      // Cargo
      70: "Cargo vessel",
      71: "Bulk carrier",
      72: "Container ship",
      73: "General cargo",
      74: "Ro-Ro cargo",
      77: "Refrigerated cargo",
      79: "Other cargo",
      // Passengers
      60: "Passenger vessel",
      61: "Passenger cruise ship",
      62: "Ferry",
      69: "Other passenger vessel",
    };
    
    return vesselTypes[typeCode] || `Unknown type (${typeCode})`;
  };
  
  // Handle API key input
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };
  
  // Handle MMSI input
  const handleMmsiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setMmsi(value);
  };
  
  // Fetch vessel details
  const handleLookup = async () => {
    // Validate MMSI
    if (!mmsi || mmsi.length !== 9) {
      setError("Please enter a valid 9-digit MMSI number");
      toast({
        title: "Invalid MMSI",
        description: "MMSI should be a 9-digit number",
        variant: "destructive"
      });
      return;
    }
    
    // Check for API key
    if (!apiKey) {
      setError("Please enter your MyShipTracking API key");
      toast({
        title: "API Key Required",
        description: "Enter your MyShipTracking API key to fetch vessel details",
        variant: "destructive"
      });
      return;
    }
    
    // Reset states
    setError(null);
    setLoading(true);
    
    try {
      // Fetch vessel details using the API module
      const vesselDetails = await getVesselDetails(mmsi, apiKey);
      setVessel(vesselDetails);
      
      toast({
        title: "Vessel Found",
        description: `Successfully retrieved details for ${vesselDetails.vessel_name}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      setVessel(null);
      
      toast({
        title: "Lookup Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MyShipTracking Vessel Lookup</CardTitle>
          <CardDescription>
            Enter a vessel's MMSI number to fetch detailed real-time information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your MyShipTracking API key"
                value={apiKey}
                onChange={handleApiKeyChange}
              />
              <p className="text-xs text-muted-foreground">
                This will use 3 credits per extended lookup
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mmsi">MMSI Number</Label>
              <div className="flex space-x-2">
                <Input
                  id="mmsi"
                  placeholder="9-digit MMSI number"
                  value={mmsi}
                  onChange={handleMmsiChange}
                  maxLength={9}
                />
                <Button
                  onClick={handleLookup}
                  disabled={loading || !mmsi || mmsi.length !== 9}
                >
                  {loading ? "Loading..." : "Lookup"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Display vessel information if available */}
      {vessel && (
        <Card>
          <CardHeader className="bg-primary/10">
            <CardTitle className="flex items-center">
              <Ship className="mr-2 h-5 w-5" />
              {vessel.vessel_name}
            </CardTitle>
            <CardDescription>
              MMSI: {vessel.mmsi} • IMO: {vessel.imo || "Not Available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Navigation className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Position</p>
                  <p className="text-sm text-muted-foreground">
                    Lat: {vessel.lat.toFixed(4)}, Long: {vessel.lng.toFixed(4)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Wind className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Speed & Course</p>
                  <p className="text-sm text-muted-foreground">
                    {vessel.speed.toFixed(1)} knots at {vessel.course.toFixed(1)}°
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Anchor className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {vessel.nav_status || "Not Available"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Flag className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-muted-foreground">
                    {getVesselTypeName(vessel.vtype)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/30 flex justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last update: {formatTimestamp(vessel.received)}</span>
            </div>
            <a
              href={`https://www.myshiptracking.com/vessels/mmsi-${vessel.mmsi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View on MyShipTracking →
            </a>
          </CardFooter>
        </Card>
      )}
      
      {/* Display error message if any */}
      {error && !vessel && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Lookup Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}