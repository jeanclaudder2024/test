import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar, Anchor, Navigation, BarChart4, Truck, Ship, Activity, Flag } from 'lucide-react';
import { getEnhancedVesselData, VesselEnhancedData } from '../services/vesselDataEnhancer';

interface VesselPopupProps {
  vessel: any;
  getVesselStatus: (vessel: any) => string;
  getVesselRegion: (vessel: any) => string;
}

const VesselPopup: React.FC<VesselPopupProps> = ({ 
  vessel, 
  getVesselStatus,
  getVesselRegion
}) => {
  const [enhancedData, setEnhancedData] = useState<VesselEnhancedData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch enhanced data when vessel details are displayed
  useEffect(() => {
    const fetchEnhancedData = async () => {
      setLoading(true);
      try {
        const region = getVesselRegion(vessel);
        const data = await getEnhancedVesselData(
          vessel.id,
          vessel.vesselType || 'Unknown',
          vessel.name,
          vessel.flag || 'Unknown',
          region
        );
        setEnhancedData(data);
      } catch (error) {
        console.error('Error fetching enhanced vessel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnhancedData();
  }, [vessel.id]);

  const statusClass = `status-${getVesselStatus(vessel).toLowerCase()}`;
  const status = getVesselStatus(vessel);
  
  return (
    <Card className="w-[350px] border-none shadow-lg">
      <CardHeader className="bg-primary text-primary-foreground pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{vessel.name}</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {vessel.vesselType || 'Unknown Type'} • IMO: {vessel.imo || 'N/A'}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`${statusClass} text-white px-2 py-1`}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="voyage" className="flex-1">Voyage</TabsTrigger>
            <TabsTrigger value="cargo" className="flex-1">Cargo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="p-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Flag:</span>
                </div>
                <span className="text-sm">{vessel.flag || 'Unknown'}</span>
              </div>
              <Separator className="my-1" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Owner:</span>
                </div>
                <span className="text-sm">{enhancedData?.ownerCompany || 'Unknown'}</span>
              </div>
              <Separator className="my-1" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Built:</span>
                </div>
                <span className="text-sm">{enhancedData?.yearBuilt || vessel.built || 'Unknown'}</span>
              </div>
              <Separator className="my-1" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Speed:</span>
                </div>
                <span className="text-sm">{vessel.currentSpeed ? `${vessel.currentSpeed} knots` : 'Unknown'}</span>
              </div>
              <Separator className="my-1" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Captain:</span>
                </div>
                <span className="text-sm">{enhancedData?.captain || 'Unknown'}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="voyage" className="p-4 pt-2">
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Departure:</span>
                <span className="text-sm">{vessel.departurePort || 'Unknown'} • {enhancedData?.estDepartureDate || 'Unknown date'}</span>
              </div>
              <Separator className="my-1" />
              
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Destination:</span>
                <span className="text-sm">{vessel.destinationPort || 'Unknown'} • {enhancedData?.estArrivalDate || 'Unknown date'}</span>
              </div>
              <Separator className="my-1" />
              
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Voyage Notes:</span>
                <span className="text-sm">{enhancedData?.voyageNotes || 'No voyage information available'}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cargo" className="p-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Current Cargo:</span>
                </div>
                <span className="text-sm">{enhancedData?.currentCargo || 'Unknown'}</span>
              </div>
              <Separator className="my-1" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Capacity:</span>
                </div>
                <span className="text-sm">{enhancedData?.cargoCapacity || vessel.cargoCapacity || 'Unknown'}</span>
              </div>
              <Separator className="my-1" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Deadweight:</span>
                </div>
                <span className="text-sm">{vessel.deadweight ? `${vessel.deadweight} tons` : 'Unknown'}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 px-4 text-xs text-gray-500">
        <div className="w-full flex justify-between items-center">
          <span>MMSI: {vessel.mmsi || 'N/A'}</span>
          <span>Last updated: {vessel.lastUpdated ? new Date(vessel.lastUpdated).toLocaleString() : 'Unknown'}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VesselPopup;