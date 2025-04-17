import { useState, useEffect } from "react";
import WorldMap from "@/components/map/WorldMap";
import VesselInfo from "@/components/vessels/VesselInfo";
import ProgressTimeline from "@/components/vessels/ProgressTimeline";
import StatsCards from "@/components/dashboard/StatsCards";
import AIAssistant from "@/components/ai/AIAssistant";
import { Region, Vessel, Refinery } from "@/types";
import { useVesselProgressEvents } from "@/hooks/useVessels";
import { Button } from "@/components/ui/button";
import { useDataStream } from "@/hooks/useDataStream";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Ship, Droplet, RadioTower, Factory, 
  Workflow, Filter, X, MapPin, Navigation 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  
  // Filters
  const [vesselTypeFilters, setVesselTypeFilters] = useState<string[]>([]);
  const [refineryStatusFilters, setRefineryStatusFilters] = useState<string[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  // Use streaming data
  const { vessels = [], refineries = [], stats, loading, error, lastUpdated } = useDataStream();

  // Create list of unique vessel types and refinery statuses for filtering
  const vesselTypes = Array.from(new Set(vessels.map(v => v.vesselType || 'Unknown')));
  const refineryStatuses = Array.from(new Set(refineries.map(r => r.status || 'Unknown')));
  
  // Apply all filters
  const filteredVessels = vessels.filter(vessel => {
    // Apply region filter
    const passesRegionFilter = !selectedRegion || vessel.currentRegion === selectedRegion;
    
    // Apply vessel type filter
    const passesTypeFilter = vesselTypeFilters.length === 0 || 
      vesselTypeFilters.includes(vessel.vesselType || 'Unknown');
    
    return passesRegionFilter && passesTypeFilter;
  });
    
  const filteredRefineries = refineries.filter(refinery => {
    // Apply region filter
    const passesRegionFilter = !selectedRegion || refinery.region === selectedRegion;
    
    // Apply status filter
    const passesStatusFilter = refineryStatusFilters.length === 0 ||
      refineryStatusFilters.includes(refinery.status || 'Unknown');
    
    return passesRegionFilter && passesStatusFilter;
  });
  
  // Fetch progress events for selected vessel
  const { data: progressEvents = [], isLoading: progressLoading } = useVesselProgressEvents(
    selectedVessel?.id || null
  );
  
  // Handle region selection
  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region === selectedRegion ? null : region);
  };
  
  // Handle vessel selection
  const handleVesselSelect = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setSelectedRefinery(null); // Clear refinery selection when selecting vessel
  };
  
  // Handle refinery selection
  const handleRefinerySelect = (refinery: Refinery) => {
    setSelectedRefinery(refinery);
    setSelectedVessel(null); // Clear vessel selection when selecting refinery
  };

  // Toggle vessel type filter
  const toggleVesselTypeFilter = (type: string) => {
    setVesselTypeFilters(prev => 
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
    setVesselTypeFilters([]);
    setRefineryStatusFilters([]);
  };
  
  // Toggle filters panel
  const toggleFiltersPanel = () => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  // Update the selected vessel when data refreshes
  useEffect(() => {
    if (selectedVessel && vessels.length > 0) {
      const updatedVessel = vessels.find(v => v.id === selectedVessel.id);
      if (updatedVessel) {
        setSelectedVessel(updatedVessel);
      }
    }
  }, [vessels, selectedVessel]);

  const regions: Region[] = ['North America', 'Europe', 'MEA', 'Africa', 'Russia', 'Asia'];

  // Get vessel count by type
  const vesselCounts = vesselTypes.reduce((acc, type) => {
    acc[type] = vessels.filter(v => v.vesselType === type).length;
    return acc;
  }, {} as Record<string, number>);

  // Get refinery count by status
  const refineryCounts = refineryStatuses.reduce((acc, status) => {
    acc[status] = refineries.filter(r => r.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full">
      {/* Header Stats Summary */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Maritime Operations Dashboard</h1>
            <p className="text-gray-500 text-sm">
              {lastUpdated ? `Last updated: ${formatDate(lastUpdated, 'PPpp')}` : 'Real-time tracking data'}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className={`flex items-center ${showFiltersPanel ? 'bg-blue-50 border-primary text-primary' : ''}`}
              onClick={toggleFiltersPanel}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters {vesselTypeFilters.length + refineryStatusFilters.length > 0 && 
                `(${vesselTypeFilters.length + refineryStatusFilters.length})`}
            </Button>
            
            <Select value={selectedRegion || 'all'} onValueChange={(value) => setSelectedRegion(value !== 'all' ? value as Region : null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Vessels Tracked</p>
                <h3 className="text-2xl font-bold text-blue-700">{filteredVessels.length}</h3>
              </div>
              <Ship className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Active Refineries</p>
                <h3 className="text-2xl font-bold text-green-700">{filteredRefineries.length}</h3>
              </div>
              <Factory className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">Cargo Volume (k bbl)</p>
                <h3 className="text-2xl font-bold text-amber-700">
                  {Math.round(filteredVessels.reduce((sum, v) => sum + (v.cargoCapacity || 0), 0) / 1000)}
                </h3>
              </div>
              <Droplet className="h-8 w-8 text-amber-500" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Refining Capacity (k bbl)</p>
                <h3 className="text-2xl font-bold text-purple-700">
                  {Math.round(filteredRefineries.reduce((sum, r) => sum + (r.capacity || 0), 0) / 1000)}
                </h3>
              </div>
              <Workflow className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Filters Panel - Collapsible */}
      {showFiltersPanel && (
        <div className="mx-4 md:mx-6 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" /> Advanced Filters
            </h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7">
                Clear All
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleFiltersPanel} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vessel Type Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Vessel Types</h4>
              <div className="grid grid-cols-2 gap-2">
                {vesselTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`vessel-type-${type}`} 
                      checked={vesselTypeFilters.includes(type)}
                      onCheckedChange={() => toggleVesselTypeFilter(type)}
                    />
                    <Label htmlFor={`vessel-type-${type}`} className="text-sm flex items-center justify-between w-full">
                      <span>{type}</span>
                      <Badge variant="outline" className="ml-1">{vesselCounts[type] || 0}</Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Refinery Status Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Refinery Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {refineryStatuses.map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`refinery-status-${status}`} 
                      checked={refineryStatusFilters.includes(status)}
                      onCheckedChange={() => toggleRefineryStatusFilter(status)}
                    />
                    <Label htmlFor={`refinery-status-${status}`} className="text-sm flex items-center justify-between w-full">
                      <span className={`${
                        status === 'operational' ? 'text-green-700' : 
                        status === 'maintenance' ? 'text-amber-700' : 
                        status === 'offline' ? 'text-red-700' : ''
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <Badge variant="outline" className="ml-1">{refineryCounts[status] || 0}</Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            Showing {filteredVessels.length} vessels and {filteredRefineries.length} refineries based on current filters
          </div>
        </div>
      )}
      
      {/* Map Section */}
      <section className="p-4 md:p-6 pt-0">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Region Selector Tabs */}
          <div className="bg-gray-50 border-b border-gray-200 flex overflow-x-auto">
            {regions.map((region) => (
              <Button
                key={region}
                variant="ghost"
                className={`px-4 py-2 text-sm font-medium rounded-none ${
                  selectedRegion === region
                    ? 'text-primary bg-blue-50 border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary hover:bg-blue-50'
                }`}
                onClick={() => handleRegionSelect(region)}
              >
                {region.toUpperCase()}
              </Button>
            ))}
          </div>
          
          {/* Map Container */}
          <WorldMap 
            vessels={filteredVessels}
            refineries={filteredRefineries}
            selectedRegion={selectedRegion}
            onVesselClick={handleVesselSelect}
            onRefineryClick={handleRefinerySelect}
            isLoading={loading}
          />
        </div>
      </section>
      
      {/* Selected Entity Information Section */}
      {(selectedVessel || selectedRefinery) && (
        <section className="p-4 md:p-6 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Vessel or Refinery Details Card */}
            <div className="lg:col-span-2">
              {selectedVessel ? (
                <VesselInfo vessel={selectedVessel} />
              ) : selectedRefinery && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Factory className="mr-2 h-5 w-5 text-primary" />
                          {selectedRefinery.name}
                        </CardTitle>
                        <CardDescription>
                          {selectedRefinery.country}, {selectedRefinery.region}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={`${
                          selectedRefinery.status === 'operational' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                          selectedRefinery.status === 'maintenance' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
                          selectedRefinery.status === 'offline' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                          'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        {selectedRefinery.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Refinery ID</span>
                        <span className="font-medium">#{selectedRefinery.id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Capacity</span>
                        <span className="font-medium">
                          {selectedRefinery.capacity?.toLocaleString() || 'N/A'} bpd
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Coordinates</span>
                        <span className="font-medium flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> 
                          {Number(selectedRefinery.lat).toFixed(4)}, {Number(selectedRefinery.lng).toFixed(4)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Region</span>
                        <span className="font-medium">{selectedRefinery.region}</span>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Connected Vessels</h4>
                      <Badge variant="outline" className="text-xs">
                        {filteredVessels.filter(v => 
                          v.destinationPort?.includes(selectedRefinery.country) || 
                          v.departurePort?.includes(selectedRefinery.country)
                        ).length || 0}
                      </Badge>
                    </div>
                    
                    <div className="mt-2">
                      {filteredVessels.filter(v => 
                        v.destinationPort?.includes(selectedRefinery.country) || 
                        v.departurePort?.includes(selectedRefinery.country)
                      ).slice(0, 3).map(v => (
                        <div key={v.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                          <div className="flex items-center">
                            <Ship className="h-3 w-3 mr-2 text-blue-500" />
                            <span className="text-sm font-medium">{v.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{v.vesselType}</Badge>
                        </div>
                      ))}
                      
                      {filteredVessels.filter(v => 
                        v.destinationPort?.includes(selectedRefinery.country) || 
                        v.departurePort?.includes(selectedRefinery.country)
                      ).length === 0 && (
                        <div className="text-sm text-gray-500 py-1">
                          No vessels currently connected to this refinery
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Progress Card or Region Info */}
            <div>
              {selectedVessel ? (
                <ProgressTimeline 
                  events={progressEvents} 
                  isLoading={progressLoading} 
                />
              ) : selectedRefinery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Regional Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-medium mb-1 text-gray-500">Region Statistics</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-2 rounded-md">
                            <div className="text-xs text-gray-500">Refineries</div>
                            <div className="font-medium">
                              {refineries.filter(r => r.region === selectedRefinery?.region).length}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-md">
                            <div className="text-xs text-gray-500">Vessels</div>
                            <div className="font-medium">
                              {vessels.filter(v => v.currentRegion === selectedRefinery?.region).length}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-md">
                            <div className="text-xs text-gray-500">Total Capacity</div>
                            <div className="font-medium">
                              {(refineries
                                .filter(r => r.region === selectedRefinery?.region)
                                .reduce((sum, r) => sum + (r.capacity || 0), 0) / 1000000).toFixed(1)}M bpd
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-md">
                            <div className="text-xs text-gray-500">Op. Status</div>
                            <div className="font-medium">
                              {Math.round(refineries
                                .filter(r => r.region === selectedRefinery?.region && r.status === 'operational')
                                .length / Math.max(1, refineries.filter(r => r.region === selectedRefinery?.region).length) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium mb-1 text-gray-500">Other Refineries in {selectedRefinery.region}</h4>
                        <div className="space-y-1.5">
                          {refineries
                            .filter(r => r.region === selectedRefinery?.region && r.id !== selectedRefinery?.id)
                            .slice(0, 3)
                            .map(r => (
                              <div key={r.id} className="flex justify-between items-center p-1.5 text-xs border-b border-gray-100 last:border-0">
                                <span className="font-medium">{r.name}</span>
                                <Badge 
                                  className={`text-[10px] ${
                                    r.status === 'operational' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                                    r.status === 'maintenance' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
                                    'bg-red-100 text-red-800 hover:bg-red-100'
                                  }`}
                                >
                                  {r.status}
                                </Badge>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}
      
      {/* Stats Cards Section */}
      <section className="p-4 md:p-6 pt-0">
        <StatsCards />
      </section>
      
      {/* AI Assistant Floating Button */}
      <AIAssistant />
    </div>
  );
}
