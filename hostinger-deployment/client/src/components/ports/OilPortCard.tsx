import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Anchor, Ship, MapPin, Droplets, ArrowUpRight, Info, Flag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PortMiniMap from '@/components/map/PortMiniMap';
import { Port, Vessel } from '@/types';

interface OilPortCardProps {
  port: Port & {
    nearbyVessels?: Array<{
      vessels: Vessel;
      distance: number;
    }>;
  };
}

// Function to get color based on port type
const getPortTypeColor = (type: string | null | undefined) => {
  switch (type?.toLowerCase()) {
    case 'oil':
      return 'bg-amber-500';
    case 'lng':
      return 'bg-blue-500';
    case 'gas':
      return 'bg-purple-500';
    case 'container':
      return 'bg-green-500';
    case 'bulk':
      return 'bg-orange-500';
    default:
      return 'bg-slate-500';
  }
};

// Function to get vessel type display text
const getVesselTypeDisplay = (vesselType: string) => {
  const type = vesselType.toLowerCase();
  if (type.includes('crude') || type.includes('oil')) return 'Crude Oil Tanker';
  if (type.includes('lng')) return 'LNG Carrier';
  if (type.includes('product')) return 'Product Tanker';
  if (type.includes('chemical')) return 'Chemical Tanker';
  return vesselType;
};

export function OilPortCard({ port }: OilPortCardProps) {
  const [, navigate] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort vessels by distance (closest first)
  const sortedVessels = port.nearbyVessels || [];
  
  // Create a subset of vessels to show (4-9 vessels)
  // Ensure we have at least 4 but no more than 9 vessels
  const displayedVessels = sortedVessels.slice(0, isExpanded ? 9 : 4);
  const hasMoreVessels = sortedVessels.length > displayedVessels.length;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className={`h-1 ${getPortTypeColor(port.type)}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Droplets className="h-4 w-4 mr-2 text-amber-500" />
              {port.name}
            </CardTitle>
            <CardDescription>
              {port.country} • {port.region}
            </CardDescription>
          </div>
          <Badge variant={port.status === 'active' ? 'default' : port.status === 'maintenance' ? 'outline' : 'outline'} 
                className={port.status === 'maintenance' ? 'border-amber-500 text-amber-500' : ''}>
            {port.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-grow flex flex-col gap-4">
        <div className="space-y-4">
          {/* Port Mini Map */}
          <PortMiniMap 
            port={port} 
            vessels={sortedVessels} 
            height="160px" 
            interactive={false}
          />
          
          {/* Port Details */}
          <div className="flex flex-wrap justify-between text-sm gap-y-2">
            <div>
              <div className="text-muted-foreground">Type</div>
              <div className="font-medium capitalize">{port.type || 'Standard'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Capacity</div>
              <div className="font-medium">
                {port.capacity ? `${Math.round(port.capacity / 1000)}K bpd` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Coordinates</div>
              <div className="font-medium">
                {typeof port.lat === 'number' && typeof port.lng === 'number'
                  ? `${port.lat.toFixed(2)}, ${port.lng.toFixed(2)}`
                  : typeof port.lat === 'string' && typeof port.lng === 'string' && port.lat && port.lng
                    ? `${parseFloat(port.lat).toFixed(2)}, ${parseFloat(port.lng).toFixed(2)}`
                    : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Nearby Vessels</div>
              <div className="font-medium">
                {sortedVessels.length}
              </div>
            </div>
          </div>
          
          {/* Port Description Popover */}
          {port.description && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Info className="h-4 w-4" />
                  Port Information
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <h4 className="font-medium mb-2">About {port.name}</h4>
                <p className="text-muted-foreground">
                  {port.description}
                </p>
              </PopoverContent>
            </Popover>
          )}
          
          {/* Nearby Vessels */}
          {displayedVessels.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Ship className="h-4 w-4 mr-1 text-primary" /> 
                Nearby Vessels
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {displayedVessels.map(({ vessels: vessel, distance }) => (
                  <div 
                    key={vessel.id}
                    className="flex items-center justify-between p-2 text-xs bg-muted/40 rounded-md border border-border/40"
                  >
                    <div>
                      <div className="font-medium">{vessel.name}</div>
                      <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Flag className="h-3 w-3" />
                        {vessel.flag} • {getVesselTypeDisplay(vessel.vesselType)}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {Math.round(distance)} km
                    </Badge>
                  </div>
                ))}
                
                {hasMoreVessels && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs mt-1"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Show Less' : `Show ${sortedVessels.length - displayedVessels.length} More`}
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {displayedVessels.length === 0 && (
            <div className="text-center py-3 text-muted-foreground text-sm">
              <Ship className="h-5 w-5 mx-auto mb-2 opacity-50" />
              No vessels currently near this port
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 mt-auto">
        <Button 
          variant="outline" 
          className="w-full gap-1"
          onClick={() => navigate(`/ports/${port.id}`)}
        >
          View Port Details
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}