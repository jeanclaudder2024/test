import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define the data structure for traffic insights
interface TrafficData {
  footTraffic: number;
  vehicleTraffic: number;
  dwellTime: number; // in minutes
  peakHours: string;
  timestamp: string;
}

export default function TrafficInsights() {
  const [loading, setLoading] = useState<boolean>(true);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 30.2672, // Default coordinates (can be customized)
    lng: -97.7431
  });
  const [apiKey, setApiKey] = useState<string>("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const { toast } = useToast();

  // Initialize map when component mounts
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 13);
      
      // Add tile layer (map style)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add marker at the specified coordinates
      const marker = L.marker([coordinates.lat, coordinates.lng]).addTo(map);
      markerRef.current = marker;
      
      // Store map instance
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      // Update marker position
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      
      // Center map on new coordinates
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 13);
      
      // If we have traffic data, update the popup
      if (trafficData) {
        updateMarkerPopup();
      }
    }
  }, [coordinates, trafficData]);

  // Function to update the marker popup with traffic data
  const updateMarkerPopup = () => {
    if (markerRef.current && trafficData) {
      const popupContent = `
        <div class="map-popup">
          <h4>Traffic Insights</h4>
          <p><strong>Foot Traffic:</strong> ${trafficData.footTraffic} people/hour</p>
          <p><strong>Vehicle Traffic:</strong> ${trafficData.vehicleTraffic} vehicles/hour</p>
          <p><strong>Avg. Dwell Time:</strong> ${trafficData.dwellTime} minutes</p>
          <p><strong>Peak Hours:</strong> ${trafficData.peakHours}</p>
          <p class="text-xs text-muted-foreground">Updated: ${new Date(trafficData.timestamp).toLocaleString()}</p>
        </div>
      `;
      
      markerRef.current.bindPopup(popupContent).openPopup();
    }
  };

  // Function to fetch traffic data from the API
  const fetchTrafficData = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your MyTraffic API key to fetch data.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // In a real application, you would call the actual API here
      // For demonstration, we're using a fake fetch that returns a Promise
      // This should be replaced with an actual fetch call to the MyTraffic API
      
      // This is where you'd make the actual API call:
      // const response = await fetch(
      //   `https://api.mytraffic.com/insights?lat=${coordinates.lat}&lng=${coordinates.lng}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${apiKey}`
      //     }
      //   }
      // );
      
      // if (!response.ok) {
      //   throw new Error('Failed to fetch traffic data');
      // }
      
      // const data = await response.json();
      
      // Simulating API response for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      // Sample data (to be replaced with actual API response)
      const data: TrafficData = {
        footTraffic: Math.floor(Math.random() * 500) + 100,
        vehicleTraffic: Math.floor(Math.random() * 300) + 50,
        dwellTime: Math.floor(Math.random() * 60) + 5,
        peakHours: "12:00 PM - 2:00 PM",
        timestamp: new Date().toISOString()
      };
      
      setTrafficData(data);
      updateMarkerPopup();
      
      toast({
        title: "Data Loaded",
        description: "Traffic insights have been successfully loaded."
      });
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch traffic data. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle coordinate updates
  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'lat' | 'lng') => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setCoordinates(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Traffic Insights</h1>
      
      {/* Map container */}
      <div className="w-full h-[400px] mb-6 rounded-lg overflow-hidden shadow-md" ref={mapRef}></div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle>Location Settings</CardTitle>
            <CardDescription>Enter coordinates and API key to fetch traffic data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input 
                    id="latitude" 
                    type="number" 
                    step="0.0001" 
                    value={coordinates.lat} 
                    onChange={(e) => handleCoordinateChange(e, 'lat')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input 
                    id="longitude" 
                    type="number" 
                    step="0.0001" 
                    value={coordinates.lng} 
                    onChange={(e) => handleCoordinateChange(e, 'lng')}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">MyTraffic API Key</Label>
                <Input 
                  id="apiKey" 
                  type="password" 
                  placeholder="Enter your API key" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={fetchTrafficData} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Loading..." : "Fetch Traffic Data"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Traffic Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Analysis</CardTitle>
            <CardDescription>Real-time traffic insights at selected location</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-6 w-3/5" />
              </div>
            ) : trafficData ? (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 p-4 rounded-lg">
                    <p className="text-sm font-medium">Foot Traffic</p>
                    <h3 className="text-2xl font-bold">{trafficData.footTraffic}</h3>
                    <p className="text-xs text-muted-foreground">people/hour</p>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-lg">
                    <p className="text-sm font-medium">Vehicle Traffic</p>
                    <h3 className="text-2xl font-bold">{trafficData.vehicleTraffic}</h3>
                    <p className="text-xs text-muted-foreground">vehicles/hour</p>
                  </div>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg">
                  <p className="text-sm font-medium">Average Dwell Time</p>
                  <h3 className="text-2xl font-bold">{trafficData.dwellTime} minutes</h3>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg">
                  <p className="text-sm font-medium">Peak Hours</p>
                  <h3 className="text-xl font-bold">{trafficData.peakHours}</h3>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(trafficData.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No data available</p>
                <p className="text-sm">Enter coordinates and API key, then click "Fetch Traffic Data"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add this for the page integration instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integration Notes</CardTitle>
          <CardDescription>How to customize this page for your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">API Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Replace the simulated API call with your actual MyTraffic API endpoint.
                Uncomment and modify the fetch call in the fetchTrafficData function.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold">Default Location</h3>
              <p className="text-sm text-muted-foreground">
                Set your default coordinates by changing the initial state values:
                <code className="ml-2 px-1 py-0.5 bg-muted rounded text-xs">
                  lat: 30.2672, lng: -97.7431
                </code>
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold">Map Customization</h3>
              <p className="text-sm text-muted-foreground">
                You can change the map style by replacing the tile layer URL.
                Mapbox or other custom tile servers can be used for a different look.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}