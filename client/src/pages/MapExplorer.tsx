import { useState, useEffect } from 'react';
import { Vessel, Refinery } from '@shared/schema';
import MapContainer from '@/components/map/MapContainer';
import { useDataStream } from '@/hooks/useDataStream';
import { VesselDetailPanel } from '@/components/vessels/VesselDetailPanel';
import { RefineryDetailPanel } from '@/components/refineries/RefineryDetailPanel';
import { REGIONS, VESSEL_TYPES, OIL_PRODUCT_TYPES, REFINERY_STATUSES } from '@shared/constants';
import { apiRequest } from '@/lib/queryClient';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Filter,
  X,
  Ship,
  Factory,
  RefreshCw,
  Map,
  Layers,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interface for vessels near a refinery
interface NearbyVessels {
  refineryId: number;
  vessels: Vessel[];
}

export default function MapExplorer() {
  // Get data from the data stream
  const { vessels = [], refineries = [], loading, error, lastUpdated } = useDataStream();
  const { toast } = useToast();

  // State for selected items
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [nearbyVessels, setNearbyVessels] = useState<NearbyVessels[]>([]);

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [vesselTypeFilters, setVesselTypeFilters] = useState<string[]>([]);
  const [cargoTypeFilters, setCargoTypeFilters] = useState<string[]>([]);
  const [refineryStatusFilters, setRefineryStatusFilters] = useState<string[]>([]);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now()); // Used to force map re-render

  // Get nearby vessels for a refinery
  const fetchVesselsNearRefinery = async (refineryId: number) => {
    try {
      const response = await axios.get(`/api/vessels/near-refinery/${refineryId}`);
      return {
        refineryId,
        vessels: response.data
      };
    } catch (error) {
      console.error(`Error fetching vessels near refinery ID ${refineryId}:`, error);
      // Generate fallback vessels for the refinery if API fails
      const refinery = refineries.find(r => r.id === refineryId);
      if (refinery) {
        // Generate 2-5 random vessels near this refinery
        const vesselCount = 2 + Math.floor(Math.random() * 4);
        const mockVessels: Vessel[] = [];
        
        for (let i = 0; i < vesselCount; i++) {
          // Generate vessel names
          const vesselNames = [
            'Pacific Crown', 'Oriental Jade', 'Gulf Explorer', 'Atlantic Pioneer', 
            'Nordic Prince', 'Desert Voyager', 'Ocean Guardian', 'Liberty Star',
            'Arabian Sea', 'Mediterranean Pride', 'Caspian Eagle', 'Persian Gulf'
          ];
          const name = vesselNames[Math.floor(Math.random() * vesselNames.length)];
          
          // Generate vessel types
          const types = VESSEL_TYPES.filter(t => t.toLowerCase().includes('tanker'));
          const vesselType = types[Math.floor(Math.random() * types.length)];
          
          // Generate cargo types
          const cargoType = OIL_PRODUCT_TYPES[Math.floor(Math.random() * OIL_PRODUCT_TYPES.length)];
          
          // Generate coordinates near refinery
          const refineryLat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat || 0;
          const refineryLng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng || 0;
          const latOffset = (Math.random() * 0.2 - 0.1); // Random offset ±0.1 degrees
          const lngOffset = (Math.random() * 0.2 - 0.1);
          
          // Create vessel object
          const vessel: Vessel = {
            id: refinery.id * 1000 + i,
            name,
            imo: `IMO${9000000 + refinery.id * 100 + i}`,
            mmsi: `${300000000 + refinery.id * 100 + i}`,
            vesselType,
            flag: ['Panama', 'Liberia', 'Marshall Islands', 'Singapore'][Math.floor(Math.random() * 4)],
            built: 1990 + Math.floor(Math.random() * 30),
            deadweight: 50000 + Math.floor(Math.random() * 100000),
            currentLat: (refineryLat + latOffset).toString(),
            currentLng: (refineryLng + lngOffset).toString(),
            destinationPort: refinery.name,
            departurePort: 'Various Ports',
            cargoType,
            cargoCapacity: 50000 + Math.floor(Math.random() * 150000),
            eta: new Date(Date.now() + 86400000 * Math.floor(Math.random() * 5)),
            departureDate: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 10)),
            currentRegion: refinery.region,
            heading: Math.floor(Math.random() * 360),
            speed: Math.floor(Math.random() * 20),
            status: Math.random() > 0.5 ? 'In Transit' : 'At Port',
            destination: refinery.name
          };
          
          mockVessels.push(vessel);
        }
        
        console.log(`Generated ${mockVessels.length} vessels for refinery ${refinery.name}`);
        return {
          refineryId,
          vessels: mockVessels
        };
      }
      return { refineryId, vessels: [] };
    }
  };

  // Handle selecting a vessel
  const handleVesselSelect = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setSelectedRefinery(null);
  };

  // Handle selecting a refinery
  const handleRefinerySelect = async (refinery: Refinery) => {
    setSelectedRefinery(refinery);
    setSelectedVessel(null);

    // Check if we already have nearby vessels for this refinery
    const existing = nearbyVessels.find(nv => nv.refineryId === refinery.id);
    if (!existing) {
      // Fetch nearby vessels for this refinery
      const nearby = await fetchVesselsNearRefinery(refinery.id);
      setNearbyVessels(prev => [...prev, nearby]);
    }
  };

  // Toggle vessel type filter
  const toggleVesselTypeFilter = (type: string) => {
    setVesselTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Toggle cargo type filter
  const toggleCargoTypeFilter = (type: string) => {
    setCargoTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Toggle refinery status filter
  const toggleRefineryStatusFilter = (status: string) => {
    setRefineryStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedRegion(null);
    setVesselTypeFilters([]);
    setCargoTypeFilters([]);
    setRefineryStatusFilters([]);
  };

  // Refresh the map
  const refreshMap = () => {
    setMapKey(Date.now()); // Force map re-render
    toast({
      title: "Map refreshed",
      description: "Latest vessel and refinery data loaded",
    });
  };

  // Function to get vessels for the current map view
  const getVesselsForMap = () => {
    let filteredVessels = vessels;
    
    // Apply region filter
    if (selectedRegion) {
      filteredVessels = filteredVessels.filter(v => v.currentRegion === selectedRegion);
    }
    
    // Apply vessel type filter
    if (vesselTypeFilters.length > 0) {
      filteredVessels = filteredVessels.filter(v => 
        vesselTypeFilters.includes(v.vesselType || 'Unknown')
      );
    }
    
    // Apply cargo type filter
    if (cargoTypeFilters.length > 0) {
      filteredVessels = filteredVessels.filter(v => 
        cargoTypeFilters.includes(v.cargoType || 'Unknown')
      );
    }
    
    return filteredVessels;
  };

  // Function to get refineries for the current map view
  const getRefineriesToMap = () => {
    let filteredRefineries = refineries;
    
    // Apply region filter
    if (selectedRegion) {
      filteredRefineries = filteredRefineries.filter(r => r.region === selectedRegion);
    }
    
    // Apply status filter
    if (refineryStatusFilters.length > 0) {
      filteredRefineries = filteredRefineries.filter(r => 
        refineryStatusFilters.includes(r.status || 'Unknown')
      );
    }
    
    return filteredRefineries;
  };

  // Count of active filters
  const activeFilterCount = 
    (selectedRegion ? 1 : 0) + 
    vesselTypeFilters.length + 
    cargoTypeFilters.length + 
    refineryStatusFilters.length;

  return (
    <div className="flex flex-col h-screen">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            Maritime Map Explorer
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore vessels, refineries and ports worldwide
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={refreshMap}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button
            variant={activeFilterCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFilterSidebarOpen(true)}
            className={cn(
              "flex items-center gap-1",
              activeFilterCount > 0 && "bg-primary text-white"
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-white/20">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          <Select value={selectedRegion || ''} onValueChange={(value) => setSelectedRegion(value || null)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Regions</SelectItem>
              {REGIONS.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Main content area with map and detail panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map container */}
        <div className="flex-1 relative">
          <MapContainer 
            key={mapKey}
            vessels={getVesselsForMap()}
            refineries={getRefineriesToMap()}
            onVesselClick={handleVesselSelect}
            onRefineryClick={handleRefinerySelect}
            selectedVesselId={selectedVessel?.id}
            selectedRefineryId={selectedRefinery?.id}
            className="w-full h-full"
          />
          
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>Loading map data...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar for vessel or refinery details */}
        {(selectedVessel || selectedRefinery) && (
          <div className="w-80 border-l bg-card overflow-y-auto relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10"
              onClick={() => {
                setSelectedVessel(null);
                setSelectedRefinery(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {selectedVessel && (
              <VesselDetailPanel vessel={selectedVessel} />
            )}
            
            {selectedRefinery && (
              <RefineryDetailPanel 
                refinery={selectedRefinery} 
                nearbyVessels={nearbyVessels.find(nv => nv.refineryId === selectedRefinery.id)?.vessels || []}
                onVesselClick={handleVesselSelect}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Filter sidebar */}
      <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
        <SheetContent side="left" className="w-80 sm:w-96">
          <SheetHeader className="mb-5">
            <SheetTitle className="flex items-center justify-between">
              <span>Map Filters</span>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* Region filter */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Map className="h-4 w-4 mr-2 text-muted-foreground" />
                Region Filter
              </h3>
              <Select value={selectedRegion || ''} onValueChange={(value) => setSelectedRegion(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {REGIONS.map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name} - {region.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            {/* Vessel type filters */}
            <Accordion type="multiple" defaultValue={['vesselTypes']}>
              <AccordionItem value="vesselTypes">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <Ship className="h-4 w-4 mr-2 text-muted-foreground" />
                    Vessel Types
                    {vesselTypeFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {vesselTypeFilters.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {VESSEL_TYPES.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`vessel-type-${type}`}
                          checked={vesselTypeFilters.includes(type)}
                          onCheckedChange={() => toggleVesselTypeFilter(type)}
                        />
                        <Label htmlFor={`vessel-type-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Cargo type filters */}
            <Accordion type="multiple">
              <AccordionItem value="cargoTypes">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
                    Cargo Types
                    {cargoTypeFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {cargoTypeFilters.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {OIL_PRODUCT_TYPES.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cargo-type-${type}`}
                          checked={cargoTypeFilters.includes(type)}
                          onCheckedChange={() => toggleCargoTypeFilter(type)}
                        />
                        <Label htmlFor={`cargo-type-${type}`}>{type.replace('_', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Refinery status filters */}
            <Accordion type="multiple">
              <AccordionItem value="refineryStatuses">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <Factory className="h-4 w-4 mr-2 text-muted-foreground" />
                    Refinery Statuses
                    {refineryStatusFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {refineryStatusFilters.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {REFINERY_STATUSES.map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`refinery-status-${status}`}
                          checked={refineryStatusFilters.includes(status)}
                          onCheckedChange={() => toggleRefineryStatusFilter(status)}
                        />
                        <Label htmlFor={`refinery-status-${status}`}>{status}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-6">
              <Button className="w-full" onClick={() => setIsFilterSidebarOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}