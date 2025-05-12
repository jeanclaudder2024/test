import { useState } from 'react';
import { Refinery, Vessel } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { 
  Factory, 
  Ship, 
  MapPin, 
  Building2, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Droplets,
  Globe,
  Zap
} from 'lucide-react';

interface RefineryCardProps {
  refinery: Refinery;
  vessels?: {
    vessels: Vessel;
    distance: number;
  }[];
  isLoading?: boolean;
}

export default function RefineryCard({ refinery, vessels = [], isLoading = false }: RefineryCardProps) {
  const [, navigate] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return <RefineryCardSkeleton />;
  }

  // Sort vessels by distance if available
  const sortedVessels = vessels.length ? [...vessels].sort((a, b) => a.distance - b.distance) : [];

  // Calculate capacity percentage for visualization
  const capacityPercentage = getCapacityPercentage(refinery.capacity);
  
  // Capacity formatter
  const formatCapacity = (capacity: number | null | undefined) => {
    if (!capacity) return 'N/A';
    
    if (capacity >= 1000000) {
      return `${(capacity / 1000000).toFixed(2)} M bpd`;
    } else {
      return `${(capacity / 1000).toFixed(0)}K bpd`;
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className={`h-1 ${getRefineryTypeColor(refinery.type || 'oil')}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Factory className="h-4 w-4 mr-2 text-primary" />
              {refinery.name}
            </CardTitle>
            <CardDescription>
              {refinery.country} • {refinery.region}
            </CardDescription>
          </div>
          <Badge variant={
            refinery.status?.toLowerCase().includes('active') || refinery.status?.toLowerCase().includes('operational') 
              ? 'default' 
              : refinery.status?.toLowerCase().includes('maintenance') || refinery.status?.toLowerCase().includes('planned')
                ? 'warning' 
                : 'outline'
          }>
            {refinery.status || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-grow">
        <div className="space-y-4">
          {/* Refinery Capacity Visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center">
                <Droplets className="h-3.5 w-3.5 mr-1 text-primary/60" />
                Processing Capacity
              </span>
              <span className="font-medium">{formatCapacity(refinery.capacity)}</span>
            </div>
            <div className="space-y-1">
              <Progress value={capacityPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>600K</span>
                <span>1.2M bpd</span>
              </div>
            </div>
          </div>
          
          {/* Refinery Location */}
          <div className="bg-muted/30 rounded-md p-3 text-sm">
            <div className="flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-1.5 text-primary/70" />
              <span className="font-medium">Location</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coordinates:</span>
              <span>{refinery.lat}, {refinery.lng}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Region:</span>
              <span className="flex items-center">
                {getRegionIcon(refinery.region)}
                <span className="ml-1">{refinery.region}</span>
              </span>
            </div>
          </div>
          
          {/* Refinery Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Operator</div>
              <div className="font-medium truncate" title={refinery.operator || 'Unknown'}>
                {refinery.operator || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Type</div>
              <div className="font-medium capitalize">{refinery.type || 'Oil'}</div>
            </div>
            {refinery.yearBuilt && (
              <div>
                <div className="text-muted-foreground">Year Built</div>
                <div className="font-medium">{refinery.yearBuilt}</div>
              </div>
            )}
            {refinery.complexity && (
              <div>
                <div className="text-muted-foreground">Complexity</div>
                <div className="font-medium">{refinery.complexity}</div>
              </div>
            )}
          </div>
          
          {/* Nearby Vessels (if data available) */}
          {vessels.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Ship className="h-4 w-4 mr-1.5 text-primary/70" />
                  Nearby Vessels
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 
                    <ChevronUp className="h-4 w-4 mr-1" /> : 
                    <ChevronDown className="h-4 w-4 mr-1" />
                  }
                  {isExpanded ? 'Show Less' : 'Show More'}
                </Button>
              </div>
              <div className="space-y-1">
                {sortedVessels
                  .slice(0, isExpanded ? sortedVessels.length : 3)
                  .map(({ vessels: vessel, distance }) => (
                    <div 
                      key={vessel.id} 
                      className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted/40 text-sm"
                    >
                      <div className="flex items-center">
                        <div 
                          className={`h-2 w-2 rounded-full mr-2 ${
                            distance < 5 ? 'bg-green-500' : 
                            distance < 10 ? 'bg-amber-500' : 
                            'bg-blue-500'
                          }`} 
                        />
                        <span className="font-medium truncate max-w-[150px]" title={vessel.name}>
                          {vessel.name}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{distance.toFixed(1)} km</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t mt-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between" 
          onClick={() => navigate(`/refineries/${refinery.id}`)}
        >
          <span>View Refinery Details</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function RefineryCardSkeleton() {
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
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          
          <Skeleton className="h-20 w-full" />
          
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
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

function getRefineryTypeColor(type?: string): string {
  switch (type?.toLowerCase()) {
    case 'oil':
      return 'bg-amber-500';
    case 'petrochemical':
      return 'bg-purple-500';
    case 'lng':
      return 'bg-blue-500';
    case 'bitumen':
      return 'bg-gray-700';
    case 'specialty':
      return 'bg-emerald-500';
    default:
      return 'bg-primary';
  }
}

function getCapacityPercentage(capacity: number | null | undefined): number {
  if (!capacity) return 0;
  // Use 1.2M as the max capacity for scale
  return Math.min(100, (capacity / 1200000) * 100);
}

function getRegionIcon(region: string | undefined) {
  if (!region) return <Globe className="h-4 w-4 text-muted-foreground" />;
  
  if (region.includes('Middle East')) return <Globe className="h-4 w-4 text-amber-500" />;
  if (region.includes('Asia')) return <Globe className="h-4 w-4 text-blue-500" />;
  if (region.includes('Europe')) return <Globe className="h-4 w-4 text-green-500" />;
  if (region.includes('North America')) return <Globe className="h-4 w-4 text-red-500" />;
  if (region.includes('Africa')) return <Globe className="h-4 w-4 text-amber-600" />;
  if (region.includes('South America')) return <Globe className="h-4 w-4 text-purple-500" />;
  
  return <Globe className="h-4 w-4 text-muted-foreground" />;
}