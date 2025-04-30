import { useState } from 'react';
import { Refinery, Vessel } from '@shared/schema';
import { formatDate } from '@/lib/utils';
import { 
  Factory, 
  MapPin, 
  Info, 
  Building, 
  Globe, 
  Ship, 
  Calendar,
  BarChart4,
  AlertCircle, 
  CircleDot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface RefineryDetailPanelProps {
  refinery: Refinery;
  nearbyVessels: Vessel[];
  onVesselClick: (vessel: Vessel) => void;
}

export function RefineryDetailPanel({ refinery, nearbyVessels, onVesselClick }: RefineryDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('info');
  
  // Get status color
  const getStatusColor = () => {
    const status = refinery.status?.toLowerCase() || '';
    
    if (status === 'active') return 'bg-green-500';
    if (status === 'under maintenance') return 'bg-yellow-500';
    if (status === 'inactive') return 'bg-red-500';
    if (status === 'planned') return 'bg-blue-500';
    if (status === 'under construction') return 'bg-orange-500';
    
    return 'bg-gray-500';
  };
  
  // Format capacity
  const formatCapacity = (capacity?: number | null) => {
    if (!capacity) return 'N/A';
    
    // Format as barrels per day with k/m suffix
    if (capacity >= 1000000) {
      return `${(capacity / 1000000).toFixed(1)}m bpd`;
    } else if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)}k bpd`;
    } else {
      return `${capacity} bpd`;
    }
  };
  
  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
          <Factory className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{refinery.name}</h2>
          <p className="text-sm text-muted-foreground flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {refinery.country || 'Unknown location'}
          </p>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-2`}></div>
          <span className="text-sm font-medium">{refinery.status || 'Unknown status'}</span>
        </div>
      </div>
      
      <Tabs defaultValue="info" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="vessels">
            Vessels
            {nearbyVessels.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-primary/20 text-xs">
                {nearbyVessels.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        {/* Refinery Info Tab */}
        <TabsContent value="info" className="pt-4">
          <dl className="space-y-4">
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Building className="h-4 w-4 mr-2" />
                Company
              </dt>
              <dd className="w-2/3 text-sm">{refinery.operator || 'N/A'}</dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <BarChart4 className="h-4 w-4 mr-2" />
                Capacity
              </dt>
              <dd className="w-2/3 text-sm">{formatCapacity(refinery.capacity)}</dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <Globe className="h-4 w-4 mr-2" />
                Region
              </dt>
              <dd className="w-2/3 text-sm">{refinery.region || 'N/A'}</dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </dt>
              <dd className="w-2/3 text-sm">
                {refinery.lat && refinery.lng ? (
                  <span className="text-xs font-mono">
                    {refinery.lat.toString().substring(0, 7)}, {refinery.lng.toString().substring(0, 7)}
                  </span>
                ) : (
                  'N/A'
                )}
              </dd>
            </div>
            
            <div className="flex">
              <dt className="w-1/3 flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-2" />
                Status
              </dt>
              <dd className="w-2/3 text-sm">{refinery.status || 'N/A'}</dd>
            </div>
          </dl>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Refinery Description</h4>
            <p className="text-sm text-muted-foreground">
              {refinery.description || `This is the ${refinery.name} refinery located in ${refinery.country || 'unknown location'}. 
              It has a processing capacity of ${formatCapacity(refinery.capacity)} and is currently ${refinery.status || 'in unknown status'}.`}
            </p>
          </div>
        </TabsContent>
        
        {/* Nearby Vessels Tab */}
        <TabsContent value="vessels" className="pt-4">
          {nearbyVessels.length > 0 ? (
            <div className="space-y-4">
              {nearbyVessels.map(vessel => (
                <div 
                  key={vessel.id}
                  className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onVesselClick(vessel)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Ship className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{vessel.name}</h4>
                        <p className="text-xs text-muted-foreground">{vessel.vesselType || 'Unknown type'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {vessel.flag || 'Unknown flag'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Cargo:</span>{' '}
                      {vessel.cargoType ? vessel.cargoType.replace('_', ' ') : 'N/A'}
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">ETA:</span>{' '}
                      {vessel.eta ? formatDate(vessel.eta, 'MMM d') : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Ship className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No vessels currently near this refinery</p>
            </div>
          )}
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats" className="pt-4">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Processing Capacity</h4>
              <div className="bg-muted rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">{formatCapacity(refinery.capacity)}</span>
                  <span className="text-xs text-muted-foreground">Max capacity</span>
                </div>
                <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${refinery.status === 'active' ? '85' : '0'}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {refinery.status === 'active' 
                    ? 'Currently operating at approximately 85% of maximum capacity' 
                    : refinery.status === 'under maintenance'
                    ? 'Currently under maintenance, operating at reduced capacity'
                    : 'Not currently operational'
                  }
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Products</h4>
              <div className="space-y-2">
                {['Gasoline', 'Diesel', 'Jet Fuel', 'Lubricants', 'Asphalt'].map(product => (
                  <div key={product} className="flex items-center space-x-2">
                    <CircleDot className="h-4 w-4 text-primary" />
                    <span className="text-sm">{product}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
              <div className="space-y-3">
                <div className="relative pl-6 pb-3">
                  <div className="absolute left-0 top-0 h-full border-l-2 border-amber-200"></div>
                  <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-amber-500"></div>
                  <div>
                    <p className="text-sm font-medium">Vessel Arrival</p>
                    <p className="text-xs text-muted-foreground">{formatDate(new Date(Date.now() - 86400000 * 2), 'PPp')}</p>
                    <p className="text-xs text-muted-foreground mt-1">Vessel "Nordic Prince" arrived with crude oil cargo</p>
                  </div>
                </div>
                
                <div className="relative pl-6 pb-3">
                  <div className="absolute left-0 top-0 h-full border-l-2 border-amber-200"></div>
                  <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-amber-500"></div>
                  <div>
                    <p className="text-sm font-medium">Production Update</p>
                    <p className="text-xs text-muted-foreground">{formatDate(new Date(Date.now() - 86400000 * 5), 'PPp')}</p>
                    <p className="text-xs text-muted-foreground mt-1">Increased diesel production by 15%</p>
                  </div>
                </div>
                
                <div className="relative pl-6">
                  <div className="absolute left-0 top-0 h-full border-l-2 border-amber-200"></div>
                  <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-amber-500"></div>
                  <div>
                    <p className="text-sm font-medium">Maintenance Completed</p>
                    <p className="text-xs text-muted-foreground">{formatDate(new Date(Date.now() - 86400000 * 10), 'PPp')}</p>
                    <p className="text-xs text-muted-foreground mt-1">Scheduled maintenance on distillation unit completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 space-y-2">
        <Button className="w-full" variant="default">
          Monitor Refinery
        </Button>
        <Button className="w-full" variant="outline">
          View Production Reports
        </Button>
      </div>
    </div>
  );
}