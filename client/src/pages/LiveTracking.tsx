import { useState } from 'react';
import LiveVesselMap from '@/components/map/LiveVesselMap';
import { Ship, Anchor, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';

export default function LiveTracking() {
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [activeTab, setActiveTab] = useState<string>('map');
  
  // Get vessel data with WebSocket pagination support
  const { 
    vessels, 
    connected: isConnected, 
    lastUpdated, 
    refreshData,
    page,
    pageSize,
    totalPages,
    totalCount,
    goToPage,
    changePageSize,
    connectionType
  } = useVesselWebSocket({ 
    region: selectedRegion,
    page: 1,
    pageSize: 500
  });
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Ship className="h-8 w-8 mr-2 text-primary" />
            Live Vessel Tracking
          </h1>
          <p className="text-muted-foreground">
            {isConnected 
              ? totalCount 
                ? `Tracking ${totalCount.toLocaleString()} vessels in real-time (page ${page} of ${totalPages})` 
                : `Tracking ${vessels.length} vessels in real-time`
              : 'Connecting to vessel tracking service...'}
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
                Page Size: {pageSize}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <div className="flex gap-2">
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
            
            <Button 
              variant="outline" 
              onClick={() => refreshData()}
              className="flex items-center gap-2"
            >
              <Anchor className="h-4 w-4" />
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="map" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-1">
            <Ship className="h-4 w-4" />
            Vessel List
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="map">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Live Map View</CardTitle>
              <CardDescription>
                Interactive map showing real-time vessel positions by region
              </CardDescription>
              
              {/* Only show pagination controls if we have more than one page */}
              {totalPages > 1 && (
                <div className="mt-2 flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} ({totalCount.toLocaleString()} vessels total)
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Page Size:</label>
                      <select 
                        className="text-sm border rounded-md px-2 py-1"
                        value={pageSize}
                        onChange={(e) => changePageSize(Number(e.target.value))}
                      >
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="500">500</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(1)} 
                        disabled={page === 1}
                      >
                        First
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => goToPage(page > 1 ? page - 1 : 1)} 
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => goToPage(page < totalPages ? page + 1 : totalPages)} 
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(totalPages)} 
                        disabled={page === totalPages}
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <LiveVesselMap initialRegion={selectedRegion} height="700px" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Vessel List</CardTitle>
              <CardDescription>
                Complete list of vessels currently being tracked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* The list view is already included in the LiveVesselMap component */}
              <div className="bg-muted rounded-lg p-4 text-center">
                <p>Please switch to the Interactive Map tab to view vessels in list format.</p>
                <Button 
                  variant="default" 
                  className="mt-2"
                  onClick={() => setActiveTab('map')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Go to Map View
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}