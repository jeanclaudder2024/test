import { useState, useEffect, useMemo } from 'react';
import LiveVesselMap from '@/components/map/LiveVesselMap';
import { 
  Ship, 
  Anchor, 
  MapPin, 
  Layers, 
  Filter, 
  Route, 
  RefreshCw, 
  ChevronDown, 
  List, 
  Info, 
  Gauge, 
  AlertTriangle, 
  Settings, 
  BarChart,
  Building,
  Droplets, // Using Droplets instead of Oil
  X,
  Factory,
  ChevronRight,
  CircleDollarSign,
  Building2,
  PanelRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from '@/hooks/use-toast';

// Major oil companies for filtering
const MAJOR_COMPANIES = [
  'Rosneft',
  'TotalEnergies',
  'Aramco',
  'Kazakhstan Oil'
];

// Oil product types 
const OIL_PRODUCT_TYPES = [
  'Crude Oil',
  'LNG',
  'Diesel',
  'Gasoline',
  'Jet Fuel',
  'LPG',
  'Fuel Oil',
  'Naphtha'
];

export default function LiveTracking() {
  // Basic state
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  const [selectedRegionDetails, setSelectedRegionDetails] = useState<any>(null);
  
  // Map display options
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showVesselHistory, setShowVesselHistory] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<string>('dark');
  
  // Filtering state
  const [productTypeFilter, setProductTypeFilter] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string[]>([]);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  
  // Get vessel data with WebSocket
  const { 
    vessels, 
    connected: isConnected, 
    lastUpdated, 
    refreshData,
    totalCount,
    connectionType
  } = useVesselWebSocket({ 
    region: selectedRegion,
    page: 1,
    pageSize: 500,
    loadAllVessels: true
  });
  
  // Get refinery data
  const { 
    refineries, 
    ports,
    isLoading: dataLoading, 
    error: dataError
  } = useMaritimeData({
    region: selectedRegion
  });
  
  // Apply product type filter to vessels
  const filteredVessels = useMemo(() => {
    if (productTypeFilter.length === 0 && companyFilter.length === 0) {
      return vessels;
    }
    
    return vessels.filter(vessel => {
      // Product type filtering
      const matchesProductType = productTypeFilter.length === 0 || 
        productTypeFilter.some(type => 
          vessel.cargoType?.toLowerCase().includes(type.toLowerCase())
        );
      
      // Company filtering
      const matchesCompany = companyFilter.length === 0 || 
        companyFilter.some(company => 
          vessel.buyerName?.toLowerCase().includes(company.toLowerCase()) || 
          vessel.sellerName?.toLowerCase().includes(company.toLowerCase())
        );
      
      return matchesProductType && matchesCompany;
    });
  }, [vessels, productTypeFilter, companyFilter]);
  
  // Filtered refineries
  const filteredRefineries = useMemo(() => {
    if (companyFilter.length === 0) {
      return refineries;
    }
    
    return refineries.filter(refinery => 
      companyFilter.some(company => 
        refinery.name?.toLowerCase().includes(company.toLowerCase())
      )
    );
  }, [refineries, companyFilter]);
  
  // Handle region click from the map
  const handleRegionClick = (region: string) => {
    setSelectedRegion(region);
    
    // Create region details for the sidebar
    const regionRefineries = refineries.filter(r => r.region.toLowerCase() === region.toLowerCase());
    const regionVessels = vessels.filter(v => v.currentRegion?.toLowerCase() === region.toLowerCase());
    
    const details = {
      name: formatRegionName(region),
      refineries: regionRefineries.length,
      vessels: regionVessels.length,
      oilTypes: getUniqueOilTypesInRegion(regionVessels),
      companies: getUniqueCompaniesInRegion([...regionVessels, ...regionRefineries])
    };
    
    setSelectedRegionDetails(details);
    setShowDetailsPanel(true);
  };
  
  // Helper function to format region names
  const formatRegionName = (region: string): string => {
    return region
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Helper to get unique oil types in a region
  const getUniqueOilTypesInRegion = (vessels: any[]): string[] => {
    const oilTypes = new Set<string>();
    
    vessels.forEach(vessel => {
      if (vessel.cargoType) {
        oilTypes.add(vessel.cargoType);
      }
    });
    
    return Array.from(oilTypes);
  };
  
  // Helper to get unique companies in a region
  const getUniqueCompaniesInRegion = (items: any[]): string[] => {
    const companies = new Set<string>();
    
    items.forEach(item => {
      if (item.buyerName && item.buyerName !== 'NA') {
        companies.add(item.buyerName);
      }
      if (item.sellerName && item.sellerName !== 'NA') {
        companies.add(item.sellerName);
      }
      // Check for company name in refinery name
      if (item.name) {
        MAJOR_COMPANIES.forEach(company => {
          if (item.name.includes(company)) {
            companies.add(company);
          }
        });
      }
    });
    
    return Array.from(companies);
  };
  
  // Toggle product type filter
  const toggleProductTypeFilter = (type: string) => {
    setProductTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Toggle company filter
  const toggleCompanyFilter = (company: string) => {
    setCompanyFilter(prev => 
      prev.includes(company) 
        ? prev.filter(c => c !== company) 
        : [...prev, company]
    );
  };
  
  // Statistics based on vessel and refinery data
  const statistics = useMemo(() => ({
    // Vessel statistics
    totalVessels: filteredVessels.length,
    crudeOilTankers: filteredVessels.filter(v => v.vesselType?.toLowerCase().includes('crude')).length,
    lngCarriers: filteredVessels.filter(v => v.vesselType?.toLowerCase().includes('lng')).length,
    productsTankers: filteredVessels.filter(v => v.vesselType?.toLowerCase().includes('product')).length,
    totalDeadweight: filteredVessels.reduce((acc, v) => acc + (v.deadweight || 0), 0),
    
    // Refinery statistics
    totalRefineries: filteredRefineries.length,
    activeRefineries: filteredRefineries.filter(r => r.status?.toLowerCase() === 'operational').length,
    totalRefiningCapacity: filteredRefineries.reduce((acc, r) => acc + (r.capacity || 0), 0),
    
    // Region statistics by vessel location
    regionCounts: vessels.reduce((acc, vessel) => {
      if (vessel.currentRegion) {
        acc[vessel.currentRegion] = (acc[vessel.currentRegion] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    
    // Region statistics by refinery location
    refineryRegionCounts: refineries.reduce((acc, refinery) => {
      if (refinery.region) {
        acc[refinery.region] = (acc[refinery.region] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  }), [filteredVessels, filteredRefineries, vessels, refineries]);
  
  // For alert sound when region is clicked
  const { toast } = useToast();
  
  // Helper function to show a toast when region is clicked
  const showRegionSelectedToast = (region: string) => {
    toast({
      title: `Region Selected: ${formatRegionName(region)}`,
      description: "Loading vessels and refineries in this region...",
      duration: 3000,
    });
  };
  
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top header with controls */}
      <div className="border-b px-4 py-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center">
              <Ship className="h-6 w-6 mr-2 text-primary" />
              Maritime Intelligence
            </h1>
            <p className="text-xs text-muted-foreground">
              {isConnected 
                ? `Live Tracking: ${filteredVessels.length.toLocaleString()} vessels${selectedRegion !== 'global' ? ` in ${formatRegionName(selectedRegion)}` : ''}`
                : 'Connecting to tracking network...'}
            </p>
          </div>
          
          <Badge 
            variant={isConnected ? "outline" : "destructive"} 
            className={isConnected 
              ? "bg-green-50 text-green-700 border-green-200 hidden md:flex" 
              : "hidden md:flex"
            }
          >
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Select 
            value={selectedRegion} 
            onValueChange={(value) => {
              setSelectedRegion(value);
              showRegionSelectedToast(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global View</SelectItem>
              <SelectItem value="middle_east">Middle East</SelectItem>
              <SelectItem value="north_america">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="africa">Africa</SelectItem>
              <SelectItem value="southeast_asia">Southeast Asia</SelectItem>
              <SelectItem value="east_asia">East Asia</SelectItem>
              <SelectItem value="oceania">Oceania</SelectItem>
              <SelectItem value="south_america">South America</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Filter Options</h4>
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Product Types</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {OIL_PRODUCT_TYPES.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`filter-${type.toLowerCase().replace(/\s+/g, '-')}`}
                          checked={productTypeFilter.includes(type)}
                          onCheckedChange={() => toggleProductTypeFilter(type)}
                        />
                        <label 
                          htmlFor={`filter-${type.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-sm cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Major Companies</Label>
                  <div className="space-y-1">
                    {MAJOR_COMPANIES.map(company => (
                      <div key={company} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`company-${company.toLowerCase().replace(/\s+/g, '-')}`}
                          checked={companyFilter.includes(company)}
                          onCheckedChange={() => toggleCompanyFilter(company)}
                        />
                        <label 
                          htmlFor={`company-${company.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-sm cursor-pointer"
                        >
                          {company}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Display Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showVessels" className="text-sm cursor-pointer">Show Vessels</Label>
                      <Switch 
                        id="showVessels" 
                        checked={showVessels}
                        onCheckedChange={setShowVessels}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showRefineries" className="text-sm cursor-pointer">Show Refineries</Label>
                      <Switch 
                        id="showRefineries" 
                        checked={showRefineries}
                        onCheckedChange={setShowRefineries}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showPorts" className="text-sm cursor-pointer">Show Ports</Label>
                      <Switch 
                        id="showPorts" 
                        checked={showPorts}
                        onCheckedChange={setShowPorts}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    // Clear all filters
                    setProductTypeFilter([]);
                    setCompanyFilter([]);
                    setShowVessels(true);
                    setShowRefineries(true);
                    setShowPorts(true);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                Map Style
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Map Display Options</h4>
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="mapStyle">Base Map Style</Label>
                  <Select 
                    value={mapStyle} 
                    onValueChange={setMapStyle}
                  >
                    <SelectTrigger id="mapStyle">
                      <SelectValue placeholder="Select Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark (Night Mode)</SelectItem>
                      <SelectItem value="light">Light (Day Mode)</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                      <SelectItem value="nautical">Nautical Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showRoutes" className="flex items-center gap-2 cursor-pointer">
                      <Route className="h-4 w-4 text-blue-500" />
                      Vessel Routes
                    </Label>
                    <Switch 
                      id="showRoutes" 
                      checked={showRoutes}
                      onCheckedChange={setShowRoutes}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showVesselHistory" className="flex items-center gap-2 cursor-pointer">
                      <Route className="h-4 w-4 text-green-500" />
                      Vessel History
                    </Label>
                    <Switch 
                      id="showVesselHistory" 
                      checked={showVesselHistory}
                      onCheckedChange={setShowVesselHistory}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showHeatmap" className="flex items-center gap-2 cursor-pointer">
                      <BarChart className="h-4 w-4 text-orange-500" />
                      Traffic Heatmap
                    </Label>
                    <Switch 
                      id="showHeatmap" 
                      checked={showHeatmap}
                      onCheckedChange={setShowHeatmap}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refreshData()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDetailsPanel(!showDetailsPanel)}
            className="md:hidden"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main content area - Full height map with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main map area - takes full width when sidebar is closed */}
        <div className="flex-1 relative">
          <LiveVesselMap 
            initialRegion={selectedRegion}
            showRoutes={showRoutes}
            showVesselHistory={showVesselHistory}
            showHeatmap={showHeatmap}
            mapStyle={mapStyle}
            height="100%"
            onRegionClick={handleRegionClick}
            vesselFilter={productTypeFilter}
            companyFilter={companyFilter}
            showRefineries={showRefineries}
            showVessels={showVessels}
            showPorts={showPorts}
          />
          
          {/* Floating stats panel */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-10">
            <Card className="bg-background/90 backdrop-blur-sm shadow-lg border w-[180px]">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-primary">Vessels</p>
                    <p className="text-xl font-bold">{statistics.totalVessels.toLocaleString()}</p>
                  </div>
                  <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
                    <Ship className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/90 backdrop-blur-sm shadow-lg border w-[180px]">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-primary">Refineries</p>
                    <p className="text-xl font-bold">{statistics.totalRefineries.toLocaleString()}</p>
                  </div>
                  <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
                    <Factory className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {selectedRegion !== 'global' && (
              <Card className="bg-background/90 backdrop-blur-sm shadow-lg border w-[180px]">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[11px] uppercase font-semibold text-primary">Region</p>
                      <p className="text-xl font-bold">{formatRegionName(selectedRegion)}</p>
                    </div>
                    <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Right sidebar - stats and filters */}
        {showDetailsPanel && (
          <div className="w-80 border-l bg-card flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Maritime Intelligence</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailsPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Region details section */}
                {selectedRegionDetails && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        {selectedRegionDetails.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm pt-0">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-muted/50 rounded p-2 text-center">
                          <p className="text-xs text-muted-foreground">Vessels</p>
                          <p className="font-semibold">{selectedRegionDetails.vessels}</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2 text-center">
                          <p className="text-xs text-muted-foreground">Refineries</p>
                          <p className="font-semibold">{selectedRegionDetails.refineries}</p>
                        </div>
                      </div>
                      
                      {selectedRegionDetails.companies.length > 0 && (
                        <Collapsible className="mt-2">
                          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium p-2 rounded hover:bg-muted/50">
                            <span className="flex items-center">
                              <Building2 className="h-3.5 w-3.5 mr-2 text-primary" />
                              Major Companies
                            </span>
                            <ChevronRight className="h-4 w-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 pt-2 space-y-1">
                            {selectedRegionDetails.companies.slice(0, 5).map((company: string) => (
                              <div key={company} className="text-xs flex items-center">
                                <CircleDollarSign className="h-3 w-3 mr-2 text-muted-foreground" />
                                {company}
                              </div>
                            ))}
                            {selectedRegionDetails.companies.length > 5 && (
                              <div className="text-xs text-muted-foreground">
                                +{selectedRegionDetails.companies.length - 5} more
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      
                      {selectedRegionDetails.oilTypes.length > 0 && (
                        <Collapsible className="mt-2">
                          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium p-2 rounded hover:bg-muted/50">
                            <span className="flex items-center">
                              <Droplets className="h-3.5 w-3.5 mr-2 text-primary" />
                              Oil Products
                            </span>
                            <ChevronRight className="h-4 w-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 pt-2 space-y-1">
                            {selectedRegionDetails.oilTypes.slice(0, 5).map((type: string) => (
                              <div key={type} className="text-xs flex items-center">
                                <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                                {type}
                              </div>
                            ))}
                            {selectedRegionDetails.oilTypes.length > 5 && (
                              <div className="text-xs text-muted-foreground">
                                +{selectedRegionDetails.oilTypes.length - 5} more
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Global statistics */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-primary" />
                    Live Monitoring Statistics
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-blue-100/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-blue-800">Vessels</p>
                          <Ship className="h-4 w-4 text-blue-700" />
                        </div>
                        <p className="text-lg font-bold text-blue-900">{statistics.totalVessels.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-amber-100 bg-gradient-to-br from-amber-50/50 to-amber-100/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-amber-800">Crude Tankers</p>
                          <Ship className="h-4 w-4 text-amber-700" />
                        </div>
                        <p className="text-lg font-bold text-amber-900">{statistics.crudeOilTankers.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-green-100 bg-gradient-to-br from-green-50/50 to-green-100/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-green-800">Refineries</p>
                          <Factory className="h-4 w-4 text-green-700" />
                        </div>
                        <p className="text-lg font-bold text-green-900">{statistics.totalRefineries.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-red-100 bg-gradient-to-br from-red-50/50 to-red-100/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-red-800">Capacity</p>
                          <Gauge className="h-4 w-4 text-red-700" />
                        </div>
                        <p className="text-lg font-bold text-red-900">{(statistics.totalRefiningCapacity / 1000000).toFixed(1)}M bpd</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Region statistics */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    Regional Vessel Distribution
                  </h3>
                  
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      {Object.entries(statistics.regionCounts)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .slice(0, 5)
                        .map(([region, count]) => (
                          <div key={region} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6 mr-2"
                                onClick={() => {
                                  setSelectedRegion(region);
                                  showRegionSelectedToast(region);
                                }}
                              >
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <span className="text-xs">{formatRegionName(region)}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {count} vessels
                            </Badge>
                          </div>
                        ))
                      }
                    </CardContent>
                  </Card>
                </div>
                
                {/* Refinery statistics */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <Factory className="h-4 w-4 mr-2 text-primary" />
                    Regional Refinery Distribution
                  </h3>
                  
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      {Object.entries(statistics.refineryRegionCounts)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .slice(0, 5)
                        .map(([region, count]) => (
                          <div key={region} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6 mr-2"
                                onClick={() => {
                                  setSelectedRegion(region);
                                  showRegionSelectedToast(region);
                                }}
                              >
                                <Factory className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <span className="text-xs">{formatRegionName(region)}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {count} refineries
                            </Badge>
                          </div>
                        ))
                      }
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
            
            <div className="border-t p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p>
                  {lastUpdated 
                    ? `Updated: ${new Date(lastUpdated).toLocaleTimeString()}` 
                    : 'Connecting...'}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refreshData()}
                  className="h-8 px-2"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}