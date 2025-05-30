import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VesselApiTracker } from "@/components/vessel/VesselApiTracker";
import { Ship, Info, AlertTriangle, FileText } from "lucide-react";
import { Link } from "wouter";

export default function VesselLookup() {
  const [active, setActive] = useState("lookup");

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Vessel Lookup</h1>
        <p className="text-muted-foreground mt-1">
          Track vessels in real-time using MyShipTracking API
        </p>
      </div>

      <Tabs defaultValue="lookup" className="space-y-4" onValueChange={setActive}>
        <TabsList>
          <TabsTrigger value="lookup" className="flex items-center gap-1">
            <Ship className="h-4 w-4" />
            <span>Vessel Lookup</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span>About API</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Batch Lookup</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="lookup" className="space-y-4">
          <VesselApiTracker />
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About MyShipTracking API</CardTitle>
              <CardDescription>
                How the vessel tracking API works and what data it provides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">API Features</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The MyShipTracking API provides real-time vessel tracking data from AIS signals
                  worldwide. The system collects information from a network of AIS receivers and
                  satellite feeds.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Available Data</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mt-1">
                  <li>Vessel position (latitude, longitude)</li>
                  <li>Speed and course</li>
                  <li>Vessel type and dimensions</li>
                  <li>Destination and ETA when available</li>
                  <li>Navigation status</li>
                  <li>MMSI, IMO, and callsign identification</li>
                </ul>
              </div>
              
              <div className="flex items-start gap-2 p-3 border rounded bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">API Usage Note</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    API calls consume credits from your MyShipTracking account. Use batch lookup
                    where possible to minimize API usage. Vessel data is cached for 15 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button asChild>
                <a 
                  href="https://www.myshiptracking.com/api-docs/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  API Documentation
                </a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Vessel Lookup</CardTitle>
              <CardDescription>
                Look up multiple vessels at once to save API credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mmsi-list">MMSI Numbers (one per line)</Label>
                  <textarea
                    id="mmsi-list"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter MMSI numbers, one per line. Example:
366943250
636092895
235095435"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum 10 vessels per batch to avoid excessive API usage
                  </p>
                </div>
                
                <Button className="w-full">Batch Lookup</Button>
                
                <div className="flex items-start gap-2 p-3 border rounded bg-blue-50">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Coming Soon</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Batch vessel lookup functionality is coming soon! This feature will allow
                      you to efficiently lookup multiple vessels with a single API call.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}