import { useState } from 'react';
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
    refreshData,
    totalCount,
    connectionType
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
              onClick={() => refreshData()}
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="map" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-1">
            <List className="h-4 w-4" />
            Vessel List
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="map">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-3 bg-card rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Advanced Maritime Intelligence Map
                  </CardTitle>
                  <CardDescription>
                    Real-time vessel tracking with route prediction and integrated analytics
                  </CardDescription>
                  
                  {totalCount > 0 && (
                    <div className="mt-2">
                      <div className="text-sm text-muted-foreground">
                        Displaying all {totalCount.toLocaleString()} vessels with active routes and connections
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <LiveVesselMap 
                    initialRegion={selectedRegion} 
                    height="700px" 
                    showRoutes={showRoutes}
                    showVesselHistory={showVesselHistory}
                    showHeatmap={showHeatmap}
                    mapStyle={mapStyle}
                  />
                </CardContent>
                <CardFooter className="bg-muted/40 p-2 text-xs text-muted-foreground">
                  <div className="flex justify-between w-full">
                    <span>Zoom: Use mouse wheel or pinch gesture | Pan: Click and drag</span>
                    <span>Click on vessels for detailed information and tracking options</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <div className="h-[calc(700px+4rem)]">
              <Card className="h-full border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Vessel Details
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select a vessel on the map to view details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <ScrollArea className="h-[calc(700px-8rem)] pr-3">
                    <div className="text-sm space-y-4">
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                        <h3 className="font-bold text-blue-800 mb-1">Selected Vessel</h3>
                        <p className="text-blue-600 text-xs mb-3">Click on any vessel on the map to see its details</p>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                          <div className="font-semibold text-slate-700">Name:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Type:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">IMO:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">MMSI:</div>
                          <div className="text-slate-900">-</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-1">Current Voyage</h3>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                          <div className="font-semibold text-slate-700">From:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">To:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Departure:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">ETA:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Cargo:</div>
                          <div className="text-slate-900">-</div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-md border border-green-100">
                        <h3 className="font-bold text-green-800 mb-1">Current Position</h3>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                          <div className="font-semibold text-slate-700">Latitude:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Longitude:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Speed:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Course:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Status:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Last Updated:</div>
                          <div className="text-slate-900">-</div>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
                        <h3 className="font-bold text-amber-800 mb-1">Vessel Specifications</h3>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                          <div className="font-semibold text-slate-700">Flag:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Built:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Deadweight:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Length:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Beam:</div>
                          <div className="text-slate-900">-</div>
                          <div className="font-semibold text-slate-700">Draught:</div>
                          <div className="text-slate-900">-</div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="bg-muted/40 p-2 flex justify-center">
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    <Ship className="h-3 w-3 mr-1" />
                    No Vessel Selected
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Vessel Fleet Overview</CardTitle>
              <CardDescription>
                Comprehensive list of vessels with filtering and sorting capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center">
                <Ship className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-4">Vessel list view is being enhanced with advanced filtering and data export capabilities.</p>
                <Button 
                  variant="default" 
                  className="mt-2"
                  onClick={() => setActiveTab('map')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Return to Map View
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Maritime Traffic Analytics</CardTitle>
              <CardDescription>
                Advanced analytics and insights from vessel movement patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center">
                <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-4">Analytics dashboard is under development with traffic pattern analysis and predictive insights.</p>
                <Button 
                  variant="default" 
                  className="mt-2"
                  onClick={() => setActiveTab('map')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Return to Map View
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Maritime Alerts & Notifications</CardTitle>
              <CardDescription>
                Set up custom alerts for vessel movements and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-4">Alert system is being configured to notify users of important maritime events and vessel status changes.</p>
                <Button 
                  variant="default" 
                  className="mt-2"
                  onClick={() => setActiveTab('map')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Return to Map View
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure your maritime intelligence experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-4">Settings panel is being developed with user preferences, data refresh rates, and notification options.</p>
                <Button 
                  variant="default" 
                  className="mt-2"
                  onClick={() => setActiveTab('map')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Return to Map View
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}