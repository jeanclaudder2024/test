import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Ship, Filter, RefreshCw } from 'lucide-react';
import VesselMapV2 from '@/components/map/VesselMapV2';

const NewLiveTracking: React.FC = () => {
  const [mapView, setMapView] = useState('standard');
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Live Maritime Traffic</h1>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Live Data</span>
          </Badge>
          
          <button 
            className="flex items-center text-sm text-blue-500 hover:text-blue-700"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Ship className="mr-2 h-5 w-5" />
                Vessel Tracking Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="border rounded-md overflow-hidden">
                <VesselMapV2 height="80vh" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Map Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Map View</label>
                    <Tabs defaultValue={mapView} onValueChange={setMapView} className="w-full">
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="standard">Standard</TabsTrigger>
                        <TabsTrigger value="satellite">Satellite</TabsTrigger>
                        <TabsTrigger value="dark">Dark</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Region</label>
                    <Select defaultValue="global">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Regions</SelectLabel>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="middle_east">Middle East</SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="north_america">North America</SelectItem>
                          <SelectItem value="south_america">South America</SelectItem>
                          <SelectItem value="asia_pacific">Asia Pacific</SelectItem>
                          <SelectItem value="africa">Africa</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Filter By Vessel Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white justify-center py-1">Crude Oil</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white justify-center py-1">Product</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white justify-center py-1">Oil</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white justify-center py-1">LNG</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white justify-center py-1">LPG</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white justify-center py-1">Other</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">Crude Oil Tankers</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Product Tankers</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#FF5722] mr-2"></div>
                    <span className="text-sm">Oil Vessels</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">LNG Carriers</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm">LPG Carriers</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">Other Vessels</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLiveTracking;