import { useState } from 'react';
import { Port, Vessel } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';
import PortMiniMap from '@/components/map/PortMiniMap';
import { Anchor, Ship, MapPin, Building2, ArrowRight, ChevronDown, ChevronUp, Info, ExternalLink } from 'lucide-react';

interface PortCardProps {
  port: Port;
  vessels: {
    vessels: Vessel;
    distance: number;
  }[];
  isLoading?: boolean;
}

export default function PortCard({ port, vessels, isLoading = false }: PortCardProps) {
  const [, navigate] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return <PortCardSkeleton />;
  }

  // Sort vessels by distance
  const sortedVessels = [...vessels].sort((a, b) => a.distance - b.distance);

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className={`h-1 ${getPortTypeColor(port.type)}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Anchor className="h-4 w-4 mr-2 text-primary" />
              {port.name}
            </CardTitle>
            <CardDescription>
              {port.country} • {port.region}
            </CardDescription>
          </div>
          <Badge variant={port.status === 'active' ? 'default' : port.status === 'maintenance' ? 'warning' : 'outline'}>
            {port.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-grow">
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
              <div className="font-medium capitalize">{port.type}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Capacity</div>
              <div className="font-medium">
                {port.capacity ? port.capacity.toLocaleString() : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Nearby Vessels</div>
              <div className="font-medium">{vessels.length}</div>
            </div>
          </div>
          
          {/* Nearby Vessels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center">
                <Ship className="h-4 w-4 mr-1.5 text-primary/70" />
                Connected Vessels
              </h4>
              <Badge variant="secondary" className="text-xs">
                {(port as any).vesselCount || vessels.length}
              </Badge>
            </div>
            <div className="space-y-1">
              {/* Show connected vessels from port data if available */}
              {(port as any).connectedVessels?.length > 0 ? (
                <>
                  {(port as any).connectedVessels
                    .slice(0, isExpanded ? (port as any).connectedVessels.length : 3)
                    .map((vessel: any, index: number) => (
                    <div 
                      key={vessel.id || `vessel-${index}`} 
                      className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/40 text-sm group"
                    >
                      <div className="flex items-center flex-1">
                        <div 
                          className={`h-2 w-2 rounded-full mr-2 ${
                            vessel.connectionType === 'Departing' ? 'bg-red-500' : 
                            vessel.connectionType === 'Arriving' ? 'bg-green-500' : 
                            'bg-blue-500'
                          }`} 
                        />
                        <span className="font-medium truncate max-w-[100px]" title={vessel.name}>
                          {vessel.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {vessel.connectionType}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary"
                          onClick={() => navigate(`/vessels/${vessel.id}`)}
                          title="Go to vessel details"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    ))}
                  {(port as any).connectedVessels.length > 3 && (
                    <div className="text-center pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? 
                          <><ChevronUp className="h-3 w-3 mr-1" /> Show Less</> : 
                          <><ChevronDown className="h-3 w-3 mr-1" /> Show More ({(port as any).connectedVessels.length - 3})</>
                        }
                      </Button>
                    </div>
                  )}
                </>
              ) : sortedVessels.length > 0 ? (
                /* Fallback to original vessel format */
                sortedVessels
                  .slice(0, isExpanded ? sortedVessels.length : 3)
                  .map(({ vessels: vessel, distance }) => (
                    <div 
                      key={vessel.id} 
                      className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/40 text-sm group"
                    >
                      <div className="flex items-center flex-1">
                        <div 
                          className={`h-2 w-2 rounded-full mr-2 ${
                            distance < 5 ? 'bg-green-500' : 
                            distance < 10 ? 'bg-amber-500' : 
                            'bg-blue-500'
                          }`} 
                        />
                        <span className="font-medium truncate max-w-[100px]" title={vessel.name}>
                          {vessel.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {distance.toFixed(1)} km
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary"
                          onClick={() => navigate(`/vessels/${vessel.id}`)}
                          title="Go to vessel details"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-3 text-sm text-muted-foreground">
                  No vessels currently connected
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t mt-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between" 
          onClick={() => navigate(`/ports/${port.id}`)}
        >
          <span>View Port Details</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function PortCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-1 bg-gray-200" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-grow">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          
          <div className="flex flex-wrap justify-between text-sm gap-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-20" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t mt-auto">
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}

function getPortTypeColor(type?: string): string {
  switch (type?.toLowerCase()) {
    case 'oil':
      return 'bg-amber-500';
    case 'container':
      return 'bg-blue-500';
    case 'bulk':
      return 'bg-emerald-500';
    case 'passenger':
      return 'bg-purple-500';
    case 'lng':
      return 'bg-red-500';
    default:
      return 'bg-primary';
  }
}