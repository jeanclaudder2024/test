import { useState, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import MapContainer from '@/components/map/MapContainer';
import { Vessel, Refinery } from '@shared/schema';
import { Loader2, Filter, RefreshCw, Ship, Building2, Globe, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { REGIONS, VESSEL_TYPES, OIL_PRODUCT_TYPES } from '@shared/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const MapExplorer = () => {
  // Fetch data using our data stream hook
  const { vessels, refineries, loading, error, refetch, lastUpdated } = useDataStream();
  
  // Selected item states
  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(null);
  const [selectedRefineryId, setSelectedRefineryId] = useState<number | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  
  // Filter states
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedVesselTypes, setSelectedVesselTypes] = useState<string[]>([]);
  const [selectedOilTypes, setSelectedOilTypes] = useState<string[]>([]);
  const [detailPanelVisible, setDetailPanelVisible] = useState(true);
  
  // Filtered data
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([]);
  const [filteredRefineries, setFilteredRefineries] = useState<Refinery[]>([]);
  
  // Apply filters to vessels and refineries
  useEffect(() => {
    if (!vessels || !refineries) return;
    
    // Filter vessels
    let filteredVesselsList = [...vessels];
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredVesselsList = filteredVesselsList.filter(vessel => 
        vessel.name.toLowerCase().includes(searchLower) || 
        vessel.imo.toLowerCase().includes(searchLower) ||
        vessel.mmsi.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply region filter
    if (selectedRegion) {
      filteredVesselsList = filteredVesselsList.filter(
        vessel => vessel.currentRegion === selectedRegion
      );
    }
    
    // Apply vessel type filter
    if (selectedVesselTypes.length > 0) {
      filteredVesselsList = filteredVesselsList.filter(
        vessel => selectedVesselTypes.includes(vessel.vesselType)
      );
    }
    
    // Apply oil type filter
    if (selectedOilTypes.length > 0) {
      filteredVesselsList = filteredVesselsList.filter(
        vessel => vessel.cargoType && selectedOilTypes.includes(vessel.cargoType)
      );
    }
    
    setFilteredVessels(filteredVesselsList);
    
    // Filter refineries
    let filteredRefineryList = [...refineries];
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredRefineryList = filteredRefineryList.filter(refinery => 
        refinery.name.toLowerCase().includes(searchLower) || 
        refinery.country.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply region filter
    if (selectedRegion) {
      filteredRefineryList = filteredRefineryList.filter(
        refinery => refinery.region === selectedRegion
      );
    }
    
    setFilteredRefineries(filteredRefineryList);
    
  }, [vessels, refineries, searchTerm, selectedRegion, selectedVesselTypes, selectedOilTypes]);
  
  // Handle vessel selection
  const handleVesselClick = (vessel: Vessel) => {
    setSelectedVesselId(vessel.id);
    setSelectedVessel(vessel);
    setSelectedRefineryId(null);
    setSelectedRefinery(null);
    setDetailPanelVisible(true);
  };
  
  // Handle refinery selection
  const handleRefineryClick = (refinery: Refinery) => {
    setSelectedRefineryId(refinery.id);
    setSelectedRefinery(refinery);
    setSelectedVesselId(null);
    setSelectedVessel(null);
    setDetailPanelVisible(true);
  };
  
  // Toggle vessel type filter
  const toggleVesselTypeFilter = (type: string) => {
    setSelectedVesselTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Toggle oil type filter
  const toggleOilTypeFilter = (type: string) => {
    setSelectedOilTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedVesselTypes([]);
    setSelectedOilTypes([]);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with controls */}
      <div className="p-4 border-b flex justify-between items-center bg-muted/30">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h1 className="font-bold text-xl">Map Explorer</h1>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-background rounded-md border px-3 py-1">
            <Input 
              className="border-0 bg-transparent h-8 focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
              placeholder="Search vessels and refineries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              "gap-2", 
              showFilterPanel && "bg-primary/10 border-primary/30"
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {(selectedRegion || selectedVesselTypes.length > 0 || selectedOilTypes.length > 0) && (
              <Badge variant="secondary" className="ml-1">{
                selectedVesselTypes.length + selectedOilTypes.length + (selectedRegion ? 1 : 0)
              }</Badge>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDetailPanelVisible(!detailPanelVisible)}
            className="hidden sm:flex gap-1"
          >
            {detailPanelVisible ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span>{detailPanelVisible ? "Hide" : "Show"} Details</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Search */}
      <div className="p-4 md:hidden">
        <Input 
          className="w-full"
          placeholder="Search vessels and refineries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefixIcon={<Globe className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      
      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="p-4 border-b bg-background/70 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Filters</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Region Filter */}
            <div>
              <Label className="block mb-2">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Vessel Types */}
            <div>
              <Label className="block mb-2">Vessel Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {VESSEL_TYPES.slice(0, 4).map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`vessel-type-${type}`} 
                      checked={selectedVesselTypes.includes(type)}
                      onCheckedChange={() => toggleVesselTypeFilter(type)}
                    />
                    <label
                      htmlFor={`vessel-type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Oil Product Types */}
            <div>
              <Label className="block mb-2">Cargo Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {OIL_PRODUCT_TYPES.slice(0, 4).map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`oil-type-${type}`} 
                      checked={selectedOilTypes.includes(type)}
                      onCheckedChange={() => toggleOilTypeFilter(type)}
                    />
                    <label
                      htmlFor={`oil-type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 h-full overflow-hidden">
          {error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-destructive text-lg font-semibold">Error loading data</p>
                <p className="text-muted-foreground mb-4">Unable to load map data</p>
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            </div>
          ) : (
            <MapContainer 
              vessels={filteredVessels}
              refineries={filteredRefineries}
              onVesselClick={handleVesselClick}
              onRefineryClick={handleRefineryClick}
              selectedVesselId={selectedVesselId || undefined}
              selectedRefineryId={selectedRefineryId || undefined}
            />
          )}
        </div>
        
        {/* Detail Panel */}
        {detailPanelVisible && (
          <div className="w-full md:w-96 border-l overflow-y-auto h-full bg-background">
            {/* No selection state */}
            {!selectedVessel && !selectedRefinery && (
              <div className="p-6 text-center">
                <div className="rounded-full bg-muted p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No item selected</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Click on a vessel or refinery on the map to view detailed information
                </p>
                
                <div className="border-t pt-4 mt-6">
                  <p className="text-sm text-muted-foreground mb-2">Quick Stats</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-primary font-bold">
                        <Ship className="h-4 w-4" />
                        {filteredVessels.length}
                      </div>
                      <span className="text-xs text-muted-foreground">Vessels</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-primary font-bold">
                        <Building2 className="h-4 w-4" />
                        {filteredRefineries.length}
                      </div>
                      <span className="text-xs text-muted-foreground">Refineries</span>
                    </div>
                  </div>
                </div>
                
                {lastUpdated && (
                  <div className="mt-6 text-xs text-muted-foreground">
                    Last updated: {format(lastUpdated, 'MMM d, yyyy HH:mm:ss')}
                  </div>
                )}
              </div>
            )}
            
            {/* Vessel Detail View */}
            {selectedVessel && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    <span>Vessel Details</span>
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setSelectedVessel(null);
                    setSelectedVesselId(null);
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-bold mb-1">{selectedVessel.name}</h3>
                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary">{selectedVessel.vesselType}</Badge>
                        <Badge variant="outline">{selectedVessel.flag}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">IMO:</span>
                          <span className="ml-2 font-medium">{selectedVessel.imo}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">MMSI:</span>
                          <span className="ml-2 font-medium">{selectedVessel.mmsi}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Built:</span>
                          <span className="ml-2 font-medium">{selectedVessel.built || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">DWT:</span>
                          <span className="ml-2 font-medium">
                            {selectedVessel.deadweight 
                              ? `${(selectedVessel.deadweight / 1000).toFixed(1)}k MT` 
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Cargo Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Cargo Type:</span>
                          <span className="ml-2 font-medium">{selectedVessel.cargoType || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cargo Capacity:</span>
                          <span className="ml-2 font-medium">
                            {selectedVessel.cargoCapacity 
                              ? `${(selectedVessel.cargoCapacity / 1000).toFixed(1)}k MT` 
                              : 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Departure Port:</span>
                          <span className="ml-2 font-medium">{selectedVessel.departurePort || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Destination Port:</span>
                          <span className="ml-2 font-medium">{selectedVessel.destinationPort || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ETA:</span>
                          <span className="ml-2 font-medium">
                            {selectedVessel.eta 
                              ? format(new Date(selectedVessel.eta), 'MMM d, yyyy') 
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Current Location</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Coordinates:</span>
                          <span className="ml-2 font-medium">
                            {selectedVessel.currentLat && selectedVessel.currentLng
                              ? `${parseFloat(selectedVessel.currentLat).toFixed(4)}, ${parseFloat(selectedVessel.currentLng).toFixed(4)}`
                              : 'Unknown'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Region:</span>
                          <span className="ml-2 font-medium">{selectedVessel.currentRegion || 'Unknown'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Refinery Detail View */}
            {selectedRefinery && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-amber-600" />
                    <span>Refinery Details</span>
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setSelectedRefinery(null);
                    setSelectedRefineryId(null);
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-bold mb-1">{selectedRefinery.name}</h3>
                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary">{selectedRefinery.country}</Badge>
                        {selectedRefinery.status && (
                          <Badge 
                            variant={selectedRefinery.status === 'Active' ? 'default' : 'destructive'}
                          >
                            {selectedRefinery.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="text-muted-foreground">Region:</span>
                          <span className="ml-2 font-medium">{selectedRefinery.region}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Capacity:</span>
                          <span className="ml-2 font-medium">
                            {selectedRefinery.capacity 
                              ? `${(selectedRefinery.capacity / 1000).toFixed(1)}k bpd`
                              : 'Unknown'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Coordinates:</span>
                          <span className="ml-2 font-medium">
                            {`${parseFloat(selectedRefinery.lat).toFixed(4)}, ${parseFloat(selectedRefinery.lng).toFixed(4)}`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {selectedRefinery.description && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm">{selectedRefinery.description}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div>
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={() => {
                        // The API endpoint will be implemented to fetch vessels near this refinery
                        // For now, we're just filtering visible vessels that are nearby
                        console.log(`Fetching vessels near refinery ID ${selectedRefinery.id}`);
                      }}
                    >
                      <Ship className="mr-2 h-4 w-4" />
                      View Vessels Near This Refinery
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapExplorer;