import { useState, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { Vessel, ProgressEvent } from '@/types';
import { useVesselProgressEvents, useAddProgressEvent } from '@/hooks/useVessels';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from '@/lib/utils';
import { Link, useRoute } from 'wouter';
import {
  ArrowLeft, Ship, Calendar, Map, Info, Edit, Plus, Navigation, Anchor,
  Flag, Droplet, Package, AlertCircle, Truck, Gauge, BarChart, History,
  Users, Clock, Compass, ArrowRight, FileText, Clipboard, Download
} from 'lucide-react';

// Helper components for vessel details
const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value || 'N/A'}</span>
  </div>
);

const ProgressTimeline = ({ events }: { events: ProgressEvent[] }) => {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <div key={event.id} className="relative pl-6">
          {index !== sortedEvents.length - 1 && (
            <div className="absolute left-[9px] top-6 bottom-0 w-[2px] bg-muted"></div>
          )}
          <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            {event.event.toLowerCase().includes('departure') ? (
              <Navigation className="h-3 w-3 text-white" />
            ) : event.event.toLowerCase().includes('arrival') ? (
              <Anchor className="h-3 w-3 text-white" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-white" />
            )}
          </div>
          
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="font-medium">{event.event}</div>
            <div className="text-sm text-muted-foreground">
              {formatDate(event.date)}
              {event.location && ` at ${event.location}`}
              {(event.lat && event.lng) && 
                <div className="text-xs">
                  Coordinates: {event.lat}, {event.lng}
                </div>
              }
            </div>
          </div>
        </div>
      ))}
      
      {sortedEvents.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          No progress events recorded yet
        </div>
      )}
    </div>
  );
};

export default function VesselDetail() {
  const [, params] = useRoute('/vessels/:id');
  const vesselId = params?.id ? parseInt(params.id) : null;
  const { vessels, loading } = useDataStream();
  const { data: progressEvents = [], isLoading: progressLoading } = useVesselProgressEvents(vesselId);
  const { toast } = useToast();
  
  // Find the vessel from our stream data
  const vessel = vessels.find(v => v.id === vesselId);
  
  // Redirect to vessels page if vessel not found and not loading
  if (!loading && !vessel) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="py-12">
          <Ship className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Vessel not found</h3>
          <p className="text-muted-foreground mb-8">
            The vessel with ID {vesselId} does not exist or was deleted.
          </p>
          <Link href="/vessels">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vessels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/vessels">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vessels
        </Button>
      </Link>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : vessel ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Ship className="h-8 w-8 mr-2 text-primary" />
                {vessel.name}
              </h1>
              <p className="text-muted-foreground">
                IMO: {vessel.imo} | MMSI: {vessel.mmsi} | {vessel.flag}
              </p>
            </div>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Vessel
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Progress Event
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">
                <Info className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="journey">
                <Map className="h-4 w-4 mr-2" />
                Journey
              </TabsTrigger>
              <TabsTrigger value="documents">
                <Calendar className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Vessel Information</CardTitle>
                    <CardDescription>
                      Technical details and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <InfoItem label="Vessel Name" value={vessel.name} />
                        <InfoItem label="IMO Number" value={vessel.imo} />
                        <InfoItem label="MMSI" value={vessel.mmsi} />
                        <InfoItem label="Vessel Type" value={vessel.vesselType} />
                        <InfoItem label="Flag" value={vessel.flag} />
                      </div>
                      <div>
                        <InfoItem label="Year Built" value={vessel.built} />
                        <InfoItem 
                          label="Deadweight" 
                          value={vessel.deadweight ? `${vessel.deadweight.toLocaleString()} tons` : 'N/A'} 
                        />
                        <InfoItem 
                          label="Cargo Capacity" 
                          value={vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} barrels` : 'N/A'} 
                        />
                        <InfoItem label="Cargo Type" value={vessel.cargoType} />
                        <InfoItem label="Current Region" value={vessel.currentRegion} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Current Location</CardTitle>
                    <CardDescription>
                      Last reported coordinates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vessel.currentLat && vessel.currentLng ? (
                      <>
                        <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-4">
                          <div className="text-center">
                            <Navigation className="h-8 w-8 text-primary mx-auto mb-2" />
                            <div className="text-sm">Map View</div>
                          </div>
                        </div>
                        <InfoItem 
                          label="Latitude" 
                          value={vessel.currentLat} 
                        />
                        <InfoItem 
                          label="Longitude" 
                          value={vessel.currentLng} 
                        />
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No location data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Journey Details</CardTitle>
                  <CardDescription>
                    Current voyage information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Departure</h3>
                      <InfoItem label="Port" value={vessel.departurePort} />
                      <InfoItem label="Date" value={vessel.departureDate ? formatDate(vessel.departureDate) : 'N/A'} />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Destination</h3>
                      <InfoItem label="Port" value={vessel.destinationPort} />
                      <InfoItem label="ETA" value={vessel.eta ? formatDate(vessel.eta) : 'N/A'} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="journey">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Voyage Progress</CardTitle>
                    <CardDescription>
                      Timeline of vessel's journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgressTimeline events={progressEvents} />
                  </CardContent>
                </Card>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Progress Event</CardTitle>
                      <CardDescription>
                        Record a new location or status update
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="event" className="text-sm font-medium">
                            Event Type
                          </label>
                          <Input id="event" placeholder="e.g. Departure, Arrival, Position Update" />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="location" className="text-sm font-medium">
                            Location
                          </label>
                          <Input id="location" placeholder="Port or location name" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="lat" className="text-sm font-medium">
                              Latitude
                            </label>
                            <Input id="lat" placeholder="e.g. 51.5074" />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="lng" className="text-sm font-medium">
                              Longitude
                            </label>
                            <Input id="lng" placeholder="e.g. -0.1278" />
                          </div>
                        </div>
                        
                        <Button className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Event
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Vessel Documents</CardTitle>
                      <CardDescription>
                        Certificates, bills of lading, and other documents
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No documents available for this vessel
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}