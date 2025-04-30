import { useState } from 'react';
import { Vessel } from '@shared/schema';
import { formatDate } from '@/lib/utils';
import { Ship, Flag, Calendar, Navigation, Anchor, MapPin, Clock, Package, Ruler, Gauge, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useVesselProgressEvents } from '@/hooks/useVessels';

interface VesselDetailPanelProps {
  vessel: Vessel;
}

export function VesselDetailPanel({ vessel }: VesselDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('info');
  const { data: progressEvents = [], isLoading: progressLoading } = useVesselProgressEvents(vessel.id);
  
  // Calculate journey progress
  const calculateProgress = () => {
    if (!vessel.departureDate || !vessel.eta) return 0;
    
    const now = new Date();
    const departure = new Date(vessel.departureDate);
    const arrival = new Date(vessel.eta);
    
    const totalJourney = arrival.getTime() - departure.getTime();
    const journeySoFar = now.getTime() - departure.getTime();
    
    if (totalJourney <= 0) return 0;
    
    const progress = (journeySoFar / totalJourney) * 100;
    return Math.max(0, Math.min(100, progress));
  };
  
  // Get status color
  const getStatusColor = () => {
    const status = vessel.status?.toLowerCase() || '';
    
    if (status.includes('port') || status.includes('dock')) return 'bg-orange-500';
    if (status.includes('transit')) return 'bg-green-500';
    if (status.includes('load')) return 'bg-blue-500';
    if (status.includes('unload')) return 'bg-purple-500';
    if (status.includes('anchor')) return 'bg-yellow-500';
    
    return 'bg-gray-500';
  };
  
  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <Ship className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{vessel.name}</h2>
          <p className="text-sm text-muted-foreground flex items-center">
            <Badge variant="outline" className="mr-2">
              {vessel.vesselType || 'Unknown type'}
            </Badge>
            {vessel.imo && <span className="text-xs mr-2">IMO: {vessel.imo}</span>}
          </p>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-2`}></div>
            <span className="text-sm font-medium">{vessel.status || 'Unknown status'}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {vessel.flag || 'Unknown flag'}
          </Badge>
        </div>
        
        {/* Journey progress */}
        {vessel.departureDate && vessel.eta && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{vessel.departurePort || 'Departure'}</span>
              <span>{vessel.destinationPort || 'Destination'}</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatDate(vessel.departureDate, 'MMM d')}</span>
              <span>ETA: {formatDate(vessel.eta, 'MMM d')}</span>
            </div>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="info" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="cargo">Cargo</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
        </TabsList>
        
        {/* Vessel Info Tab */}
        <TabsContent value="info" className="pt-4">
          <dl className="space-y-4">
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-2" />
                Type
              </dt>
              <dd className="w-2/3 text-sm">{vessel.vesselType || 'N/A'}</dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Flag className="h-4 w-4 mr-2" />
                Flag
              </dt>
              <dd className="w-2/3 text-sm">{vessel.flag || 'N/A'}</dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Built
              </dt>
              <dd className="w-2/3 text-sm">{vessel.built || 'N/A'}</dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Ruler className="h-4 w-4 mr-2" />
                DWT
              </dt>
              <dd className="w-2/3 text-sm">
                {vessel.deadweight ? `${(vessel.deadweight).toLocaleString()} tons` : 'N/A'}
              </dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Navigation className="h-4 w-4 mr-2" />
                Heading
              </dt>
              <dd className="w-2/3 text-sm">{vessel.heading ? `${vessel.heading}°` : 'N/A'}</dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Gauge className="h-4 w-4 mr-2" />
                Speed
              </dt>
              <dd className="w-2/3 text-sm">{vessel.speed ? `${vessel.speed} knots` : 'N/A'}</dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                Region
              </dt>
              <dd className="w-2/3 text-sm">{vessel.currentRegion || 'N/A'}</dd>
            </div>
          </dl>
        </TabsContent>
        
        {/* Cargo Tab */}
        <TabsContent value="cargo" className="pt-4">
          <dl className="space-y-4">
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Package className="h-4 w-4 mr-2" />
                Cargo Type
              </dt>
              <dd className="w-2/3 text-sm">
                {vessel.cargoType ? vessel.cargoType.replace('_', ' ') : 'N/A'}
              </dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Ruler className="h-4 w-4 mr-2" />
                Capacity
              </dt>
              <dd className="w-2/3 text-sm">
                {vessel.cargoCapacity ? `${(vessel.cargoCapacity).toLocaleString()} tons` : 'N/A'}
              </dd>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Cargo Description</h4>
              <p className="text-sm text-muted-foreground">
                {vessel.cargoType ? (
                  <>
                    This vessel is carrying {vessel.cargoType.replace('_', ' ')}, 
                    which is a type of oil product that is commonly transported by sea.
                    The cargo is stored in specialized tanker compartments designed
                    for safe transport of this material.
                  </>
                ) : (
                  'No cargo information available'
                )}
              </p>
            </div>
          </dl>
        </TabsContent>
        
        {/* Journey Tab */}
        <TabsContent value="journey" className="pt-4">
          <dl className="space-y-4">
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Anchor className="h-4 w-4 mr-2" />
                Departure
              </dt>
              <dd className="w-2/3 text-sm">
                {vessel.departurePort || 'N/A'}
              </dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Departure Date
              </dt>
              <dd className="w-2/3 text-sm">
                {vessel.departureDate ? formatDate(vessel.departureDate, 'PPP') : 'N/A'}
              </dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                Destination
              </dt>
              <dd className="w-2/3 text-sm">
                {vessel.destinationPort || vessel.destination || 'N/A'}
              </dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                ETA
              </dt>
              <dd className="w-2/3 text-sm">
                {vessel.eta ? formatDate(vessel.eta, 'PPP') : 'N/A'}
              </dd>
            </div>
          </dl>
          
          {progressEvents.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Journey Timeline</h4>
              <div className="space-y-3">
                {progressEvents.map((event, index) => (
                  <div key={event.id} className="relative pl-6 pb-3">
                    <div className="absolute left-0 top-0 h-full border-l-2 border-blue-200"></div>
                    <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(event.timestamp, 'PPp')}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 space-y-2">
        <Button className="w-full" variant="default">
          Track This Vessel
        </Button>
        <Button className="w-full" variant="outline">
          View Documents
        </Button>
      </div>
    </div>
  );
}