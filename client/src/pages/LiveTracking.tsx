import { useState } from 'react';
import LeafletMap from '@/components/map/LeafletMap';
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
  BarChart
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
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';

export default function LiveTracking() {
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [activeTab, setActiveTab] = useState<string>('map');
  
  // Map display options
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showVesselHistory, setShowVesselHistory] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<string>('dark');
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string[]>([]);
  const [cargoTypeFilter, setCargoTypeFilter] = useState<string[]>([]);
  
  // Get vessel data with WebSocket
  const { 
    vessels, 
    connected: isConnected, 
    lastUpdated, 
    totalCount,
    connectionType,
    sendMessage
  } = useVesselWebSocket({ 
    region: selectedRegion,
    page: 1,
    pageSize: 500,
    loadAllVessels: true // Show all vessels at once instead of paginating
  });
  
  // Statistics based on vessel data
  const statistics = {
    totalVessels: vessels.length,
    crudeOilTankers: vessels.filter(v => v.vesselType?.toLowerCase().includes('crude')).length,
    lngCarriers: vessels.filter(v => v.vesselType?.toLowerCase().includes('lng')).length,
    productsTankers: vessels.filter(v => v.vesselType?.toLowerCase().includes('product')).length,
    totalDeadweight: vessels.reduce((acc, v) => acc + (v.deadweight || 0), 0),
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Ship className="h-8 w-8 mr-2 text-primary" />
            Maritime Intelligence Platform
          </h1>
          <p className="text-muted-foreground">
            {isConnected 
              ? totalCount 
                ? `Monitoring all ${totalCount.toLocaleString()} vessels in real-time with advanced analytics` 
                : `Tracking ${vessels.length} vessels with route prediction and analysis`
              : 'Connecting to global maritime tracking network...'}
          </p>
          <div className="flex flex-wrap gap-2 items-center mt-1">
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
            
            {connectionType && (
              <Badge variant="outline" className="text-xs">
                Connection: {connectionType}
              </Badge>
            )}
            
            {totalCount > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                All Vessels Displayed
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <div className="flex flex-wrap gap-2">
            <Select 
              value={selectedRegion} 
              onValueChange={(value) => setSelectedRegion(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
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
                <Button variant="outline" className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  Map Layers
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Map Display Options</h4>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showRoutes" className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-blue-500" />
                      Show Vessel Routes
                    </Label>
                    <Switch 
                      id="showRoutes" 
                      checked={showRoutes}
                      onCheckedChange={setShowRoutes}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showVesselHistory" className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-green-500" />
                      Show Movement History
                    </Label>
                    <Switch 
                      id="showVesselHistory" 
                      checked={showVesselHistory}
                      onCheckedChange={setShowVesselHistory}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showHeatmap" className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-orange-500" />
                      Traffic Density Heatmap
                    </Label>
                    <Switch 
                      id="showHeatmap" 
                      checked={showHeatmap}
                      onCheckedChange={setShowHeatmap}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="mapStyle">Map Style</Label>
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
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Filter Vessels</h4>
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Vessel Types</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="filter-crude" className="rounded" />
                        <label htmlFor="filter-crude">Crude Oil Tankers</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="filter-products" className="rounded" />
                        <label htmlFor="filter-products">Products Tankers</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="filter-lng" className="rounded" />
                        <label htmlFor="filter-lng">LNG Carriers</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="filter-lpg" className="rounded" />
                        <label htmlFor="filter-lpg">LPG Carriers</label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Cargo Types</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="filter-crude-cargo" className="rounded" />
                        <label htmlFor="filter-crude-cargo">Crude Oil</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="filter-gasoline" className="rounded" />
                        <label htmlFor="filter-gasoline">Gasoline</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="filter-diesel" className="rounded" />
                        <label htmlFor="filter-diesel">Diesel</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="filter-jet" className="rounded" />
                        <label htmlFor="filter-jet">Jet Fuel</label>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full" size="sm">
                    Apply Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              onClick={() => sendMessage({ type: 'refresh' })}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Badge 
              variant={isConnected ? "outline" : "destructive"} 
              className={isConnected 
                ? "bg-green-50 text-green-700 border-green-200" 
                : ""
              }
            >
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Vessels</p>
                <h3 className="text-2xl font-bold text-blue-900">{statistics.totalVessels.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                <Ship className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-red-700">Crude Oil Tankers</p>
                <h3 className="text-2xl font-bold text-red-900">{statistics.crudeOilTankers.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
                <Ship className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-700">LNG Carriers</p>
                <h3 className="text-2xl font-bold text-green-900">{statistics.lngCarriers.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                <Ship className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-amber-700">Total Deadweight</p>
                <h3 className="text-2xl font-bold text-amber-900">{(statistics.totalDeadweight / 1000000).toFixed(1)}M DWT</h3>
              </div>
              <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                <Gauge className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" /> 
          Interactive Vessel Map
        </h2>
        
        <Card className="border-none shadow-xl w-full max-w-full">
          <CardHeader className="pb-3 bg-gradient-to-r from-[#003366] to-[#004080] text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MapPin className="h-6 w-6 text-[#FF6F00]" />
              SUPER BIG MARITIME INTELLIGENCE MAP
            </CardTitle>
            <CardDescription className="text-gray-100">
              Ultra-high resolution real-time vessel tracking with advanced route prediction
            </CardDescription>
            
            {totalCount > 0 && (
              <div className="mt-2">
                <div className="text-sm text-gray-200">
                  Displaying all {totalCount.toLocaleString()} vessels with active routes and connections
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <LeafletMap 
              initialRegion={selectedRegion} 
              height="1200px" 
              showRoutes={showRoutes}
              showVesselHistory={showVesselHistory}
              showHeatmap={showHeatmap}
              mapStyle={mapStyle as any}
              vessels={vessels}
            />
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-[#003366] to-[#004080] p-3 text-sm text-white">
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="bg-[#FF6F00] text-white px-2 py-1 rounded-md font-bold">PRO TIP</span>
                <span>Zoom: Use mouse wheel or pinch gesture | Pan: Click and drag</span>
              </div>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-[#003366]/80 rounded-lg border border-[#FF6F00]/30">
                  Click on vessels for ultra-detailed information
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}