import { useState, useEffect } from "react";
import SimpleLeafletMap from "@/components/map/SimpleLeafletMap";
import VesselInfo from "@/components/vessels/VesselInfo";
import ProgressTimeline from "@/components/vessels/ProgressTimeline";
import StatsCards from "@/components/dashboard/StatsCards";
import RegionDistribution from "@/components/dashboard/RegionDistribution";
import AIAssistant from "@/components/ai/AIAssistant";
import { type Region, type RegionData } from "@/types";
import { type Vessel, type Refinery, type Port } from "@shared/schema";
import { useVesselProgressEvents } from "@/hooks/useVessels";
// استيراد خدمة توليد السفن لمحطات النفط
import { getVesselsAtRefineryPorts } from "@/services/asiStreamService";
import { Button } from "@/components/ui/button";
import { useDataStream } from "@/hooks/useDataStream";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { REGIONS, OIL_PRODUCT_TYPES, VESSEL_TYPES } from "@/../../shared/constants";
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
  const [associatedVessels, setAssociatedVessels] = useState<Vessel[]>([]);
  
  // Filters - Default to showing all vessel types (empty array means no filtering)
  const [vesselTypeFilters, setVesselTypeFilters] = useState<string[]>([]);
  const [refineryStatusFilters, setRefineryStatusFilters] = useState<string[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  // Use streaming data
  const { vessels = [], refineries = [], ports = [], stats, loading, error, lastUpdated } = useDataStream();

  // Create list of unique refinery statuses for filtering
  const refineryStatuses = Array.from(new Set(refineries.map(r => r.status || 'Unknown')));
  
  // Get unique vessel types for filtering
  const uniqueVesselTypes = Array.from(new Set(vessels.map(v => v.vesselType || 'Unknown')));
  
  // Apply all filters
  const filteredVessels = vessels.filter(vessel => {
    // Only show cargo vessels
    const isCargoVessel = vessel.vesselType?.toLowerCase().includes('cargo') || false;
    if (!isCargoVessel) return false;
    
    // Apply region filter
    const passesRegionFilter = !selectedRegion || vessel.currentRegion === selectedRegion;
    
    // Apply cargo/oil product type filter for cargo type
    const passesCargoTypeFilter = vesselTypeFilters.length === 0 || 
      vesselTypeFilters.includes(vessel.cargoType || 'Unknown');
    
    // Apply vessel type filter for vessel type
    const passesVesselTypeFilter = vesselTypeFilters.length === 0 || 
      vesselTypeFilters.includes(vessel.vesselType || 'Unknown');
    
    // Pass if either cargo type or vessel type matches the filter
    return passesRegionFilter && (passesCargoTypeFilter || passesVesselTypeFilter);
  });
    
  const filteredRefineries = refineries.filter(refinery => {
    // Apply region filter
    const passesRegionFilter = !selectedRegion || refinery.region === selectedRegion;
    
    // Apply status filter
    const passesStatusFilter = refineryStatusFilters.length === 0 ||
      refineryStatusFilters.includes(refinery.status || 'Unknown');
    
    return passesRegionFilter && passesStatusFilter;
  });
  
  // Filter ports by region if a region is selected
  const filteredPorts = ports.filter(port => {
    // Apply region filter
    return !selectedRegion || port.region === selectedRegion;
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
    
    // إنشاء بيانات سفن وهمية مرتبطة بالمصفاة المختارة
    const vesselCount = 3 + Math.floor(Math.random() * 3); // توليد 3-5 سفن
    const mockVessels: Vessel[] = [];
    
    // إنشاء سفن وهمية بناءً على بيانات المصفاة
    for (let i = 0; i < vesselCount; i++) {
      // إنشاء اسم السفينة
      const vesselNames = [
        'Pacific Crown', 'Oriental Jade', 'Gulf Explorer', 'Atlantic Pioneer', 
        'Nordic Prince', 'Desert Voyager', 'Ocean Guardian', 'Liberty Star'
      ];
      const name = vesselNames[Math.floor(Math.random() * vesselNames.length)];
      
      // إنشاء نوع السفينة
      const vesselTypes = ['crude oil tanker', 'oil/chemical tanker', 'oil products tanker'];
      const vesselType = vesselTypes[Math.floor(Math.random() * vesselTypes.length)];
      
      // إنشاء العلم
      const flags = ['Liberia', 'Panama', 'Marshall Islands', 'Bahamas', 'Malta', 'Singapore'];
      const flag = flags[Math.floor(Math.random() * flags.length)];
      
      // توليد إحداثيات قريبة من المصفاة
      const refineryLat = parseFloat(String(refinery.lat));
      const refineryLng = parseFloat(String(refinery.lng));
      const latOffset = (Math.random() * 0.1 - 0.05);
      const lngOffset = (Math.random() * 0.1 - 0.05);
      
      // إنشاء كائن السفينة متوافق مع نوع Vessel المحدد في السكيما
      const vesselObj = {
        id: refinery.id * 100 + i,
        name,
        vesselType,
        flag,
        imo: `IMO${9000000 + refinery.id * 100 + i}`,
        mmsi: `${200000000 + refinery.id * 100 + i}`,
        // القيم المحددة مع مراعاة أن built و deadweight تقبل undefined بدلاً من null
        built: 1990 + Math.floor(Math.random() * 30), 
        deadweight: 50000 + Math.floor(Math.random() * 50000),
        currentLat: (refineryLat + latOffset).toString(),
        currentLng: (refineryLng + lngOffset).toString(),
        destinationPort: `Port of ${refinery.name}`,
        departurePort: 'Various Ports',
        cargoType: 'crude_oil',
        cargoCapacity: 50000 + Math.floor(Math.random() * 150000),
        eta: new Date(Date.now() + 86400000 * Math.floor(Math.random() * 5)),
        departureDate: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 10)),
        currentRegion: refinery.region
        // حذف التالي لأنها غير موجودة في التعريف الأصلي:
        // progress: Math.round(Math.random() * 100),
        // status: Math.random() > 0.5 ? 'loading' : 'unloading'
      };
      
      mockVessels.push(vesselObj as Vessel);
    }
    
    setAssociatedVessels(mockVessels);
    console.log(`Generated ${mockVessels.length} vessels for refinery ${refinery.name}`);
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
  
  // Tracking functionality removed

  // Use the REGIONS constant for region selection

  // Get vessel count by oil product type
  const oilProductCounts = OIL_PRODUCT_TYPES.reduce((acc, type) => {
    acc[type] = vessels.filter(v => v.cargoType === type).length;
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Maritime Operations Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              {lastUpdated ? `Last updated: ${formatDate(lastUpdated, 'PPpp')}` : 'Real-time tracking data'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={showFiltersPanel ? "default" : "outline"}
              className={`flex items-center transition-all duration-200 ${
                showFiltersPanel 
                  ? 'bg-primary text-white shadow-md' 
                  : 'border-primary/20 text-primary hover:bg-primary/10'
              }`}
              onClick={toggleFiltersPanel}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters {vesselTypeFilters.length + refineryStatusFilters.length > 0 && 
                (<Badge variant="secondary" className="ml-1 bg-white/20">{vesselTypeFilters.length + refineryStatusFilters.length}</Badge>)}
            </Button>
            
            <Select value={selectedRegion || 'all'} onValueChange={(value) => setSelectedRegion(value !== 'all' ? value as Region : null)}>
              <SelectTrigger className="w-[180px] border-primary/20">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {REGIONS.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name} - {region.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="backdrop-blur-sm bg-white/70 border border-blue-200 shadow-sm overflow-hidden">
            <div className="absolute w-full h-1 top-0 left-0 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Vessels Tracked</p>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                  {filteredVessels.length.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-50 border border-blue-100">
                <Ship className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/70 border border-green-200 shadow-sm overflow-hidden">
            <div className="absolute w-full h-1 top-0 left-0 bg-gradient-to-r from-green-400 to-green-600"></div>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Refineries</p>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
                  {filteredRefineries.length.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-50 border border-green-100">
                <Factory className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/70 border border-amber-200 shadow-sm overflow-hidden">
            <div className="absolute w-full h-1 top-0 left-0 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Cargo Volume</p>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-400">
                  {Math.round(filteredVessels.reduce((sum, v) => sum + (v.cargoCapacity || 0), 0) / 1000).toLocaleString()} k
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-50 border border-amber-100">
                <Droplet className="h-6 w-6 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/70 border border-purple-200 shadow-sm overflow-hidden">
            <div className="absolute w-full h-1 top-0 left-0 bg-gradient-to-r from-purple-400 to-purple-600"></div>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Refining Capacity</p>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400">
                  {Math.round(filteredRefineries.reduce((sum, r) => sum + (r.capacity || 0), 0) / 1000).toLocaleString()} k
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-purple-50 border border-purple-100">
                <Workflow className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Filters Panel - Collapsible */}
      {showFiltersPanel && (
        <div className="mx-4 md:mx-6 mb-6 p-5 backdrop-blur-sm bg-white/70 rounded-xl border border-primary/10 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium flex items-center text-primary">
              <Filter className="h-4 w-4 mr-2" /> Advanced Filters
            </h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters} 
                className="text-xs h-8 border-primary/20 text-primary hover:bg-primary/10"
              >
                Clear All
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleFiltersPanel} 
                className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
              >
                <X className="h-4 w-4 text-primary" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Oil Product Types */}
            <div>
              <h4 className="text-sm font-medium mb-2">Oil Product Types</h4>
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                {OIL_PRODUCT_TYPES.map(product => (
                  <div key={product} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`product-type-${product}`} 
                      checked={vesselTypeFilters.includes(product)}
                      onCheckedChange={() => toggleVesselTypeFilter(product)}
                    />
                    <Label htmlFor={`product-type-${product}`} className="text-sm flex items-center justify-between w-full">
                      <span>{product}</span>
                      <Badge variant="outline" className="ml-1">{oilProductCounts[product] || 0}</Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Vessel Types Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Vessel Types</h4>
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                {VESSEL_TYPES.map(vesselType => {
                  const count = vessels.filter(v => v.vesselType === vesselType).length;
                  return (
                    <div key={vesselType} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`vessel-type-${vesselType}`} 
                        checked={vesselTypeFilters.includes(vesselType)}
                        onCheckedChange={() => toggleVesselTypeFilter(vesselType)}
                      />
                      <Label htmlFor={`vessel-type-${vesselType}`} className="text-sm flex items-center justify-between w-full">
                        <span>{vesselType}</span>
                        <Badge variant="outline" className="ml-1">{count}</Badge>
                      </Label>
                    </div>
                  );
                })}
                
                {/* Show additional vessel types found in the data */}
                {uniqueVesselTypes
                  .filter(type => !VESSEL_TYPES.includes(type) && type !== 'Unknown')
                  .map(vesselType => {
                    const count = vessels.filter(v => v.vesselType === vesselType).length;
                    return (
                      <div key={vesselType} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`vessel-type-${vesselType}`} 
                          checked={vesselTypeFilters.includes(vesselType)}
                          onCheckedChange={() => toggleVesselTypeFilter(vesselType)}
                        />
                        <Label htmlFor={`vessel-type-${vesselType}`} className="text-sm flex items-center justify-between w-full">
                          <span>{vesselType}</span>
                          <Badge variant="outline" className="ml-1">{count}</Badge>
                        </Label>
                      </div>
                    );
                  })}
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
          
          <div className="mt-4 pt-4 border-t border-primary/10 text-xs text-gray-500 flex items-center justify-between">
            <div>
              Showing <span className="font-medium text-primary">{filteredVessels.length}</span> vessels and <span className="font-medium text-primary">{filteredRefineries.length}</span> refineries
            </div>
            <Button variant="link" size="sm" className="text-xs h-7 text-primary p-0">
              Apply to Map View
            </Button>
          </div>
        </div>
      )}
      
      {/* Detailed Statistics Section */}
      <div className="p-4 md:p-6 pt-0 pb-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Region Distribution Chart */}
          <RegionDistribution />
          
          {/* AI Assistant Card */}
          <Card className="col-span-12 md:col-span-6 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Workflow className="mr-2 h-5 w-5" />
                AI Insights Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about vessels, regions, or supply chains
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AIAssistant />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Map Section */}
      <section className="p-4 md:p-6 pt-0">
        <div className="backdrop-blur-sm bg-white/80 rounded-xl shadow-sm overflow-hidden border border-primary/10">
          {/* Map Header with Controls */}
          <div className="border-b border-primary/10 p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-primary" />
              <h3 className="font-medium text-primary">Marine Traffic Tracking System</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedRegion && (
                <Badge variant="outline" className="bg-primary/5 text-primary flex items-center">
                  {REGIONS.find(r => r.id === selectedRegion)?.name || 'Unknown Region'}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 p-0" 
                    onClick={() => setSelectedRegion(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              >
                <Filter className="mr-1 h-3 w-3" />
                Filters
              </Button>
            </div>
          </div>
          
          {/* Map Container */}
          {console.log('Dashboard rendering with ports:', filteredPorts)}
          <SimpleLeafletMap 
            vessels={selectedRefinery ? associatedVessels : filteredVessels}
            refineries={selectedRefinery ? [selectedRefinery] : filteredRefineries}
            ports={filteredPorts}
            selectedRegion={selectedRegion}
            onVesselClick={handleVesselSelect}
            onRefineryClick={handleRefinerySelect}
            isLoading={loading}
            initialCenter={selectedRefinery && selectedRefinery.lat && selectedRefinery.lng 
              ? [parseFloat(selectedRefinery.lat as string), parseFloat(selectedRefinery.lng as string)]
              : undefined}
            initialZoom={selectedRefinery ? 6 : undefined}
            showConnections={true}
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
                          {selectedRefinery.lat && selectedRefinery.lng 
                            ? `${parseFloat(selectedRefinery.lat as string).toFixed(4)}, ${parseFloat(selectedRefinery.lng as string).toFixed(4)}`
                            : 'Coordinates unavailable'}
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
                        {associatedVessels.length || 0}
                      </Badge>
                    </div>
                    
                    <div className="mt-2">
                      {associatedVessels.slice(0, 3).map(v => (
                        <div key={v.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                          <div className="flex items-center">
                            <Ship className="h-3 w-3 mr-2 text-blue-500" />
                            <span className="text-sm font-medium">{v.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{v.vesselType}</Badge>
                        </div>
                      ))}
                      
                      {associatedVessels.length === 0 && (
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
