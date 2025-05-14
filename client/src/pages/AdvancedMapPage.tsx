import React, { useState } from 'react';
import EnhancedVesselMap from '@/components/map/EnhancedVesselMap';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { 
  Sheet, 
  SheetClose, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Ship, 
  Factory, 
  Anchor, 
  Info, 
  Settings, 
  RefreshCw,
  Maximize2,
  Globe,
  HelpCircle,
  FileText
} from 'lucide-react';

const AdvancedMapPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };
  
  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Advanced Maritime Map</h1>
            <p className="text-muted-foreground">
              Real-time tracking of vessels, refineries, and ports worldwide
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Info
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Maritime Map Guide</SheetTitle>
                  <SheetDescription>
                    Learn how to use the advanced maritime tracking map
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-4 space-y-4">
                  <h3 className="font-medium">Map Controls</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Ship className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Vessels</span>
                        <p className="text-muted-foreground text-xs">Click on vessel icons to view details</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Factory className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <span className="font-medium">Refineries</span>
                        <p className="text-muted-foreground text-xs">Oil refineries with production data</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Anchor className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Ports</span>
                        <p className="text-muted-foreground text-xs">Maritime ports with vessel connections</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Settings className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Filters</span>
                        <p className="text-muted-foreground text-xs">Use the filter panel to find specific entities</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="font-medium">Tips & Tricks</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>Toggle map layers with the filter panel on the left side</li>
                    <li>Click any marker to see detailed information</li>
                    <li>Use the search box to find vessels by name, IMO, or MMSI</li>
                    <li>Enable vessel routes to see planned paths</li>
                    <li>Click on vessel details to open the full vessel page</li>
                    <li>Try different map styles for various visualization options</li>
                  </ul>
                  
                  <Separator />
                  
                  <h3 className="font-medium">Legend</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Crude Oil Tankers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Product Tankers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>LNG Carriers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span>LPG Carriers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Chemical Tankers</span>
                    </div>
                  </div>
                </div>
                
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Close Guide</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="theme-toggle" className="sr-only">
                Dark Mode
              </Label>
              <Switch
                id="theme-toggle"
                checked={themeMode === 'dark'}
                onCheckedChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
              />
            </div>
          </div>
        </div>
        
        {/* Map Tabs */}
        <Tabs defaultValue="global" className="mb-6">
          <TabsList>
            <TabsTrigger value="global">
              <Globe className="h-4 w-4 mr-1.5" />
              Global
            </TabsTrigger>
            <TabsTrigger value="north-america">North America</TabsTrigger>
            <TabsTrigger value="europe">Europe</TabsTrigger>
            <TabsTrigger value="middle-east">Middle East</TabsTrigger>
            <TabsTrigger value="asia-pacific">Asia-Pacific</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center">
                <Ship className="h-4 w-4 mr-2 text-primary" />
                Live Vessels
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1">
              <div className="text-2xl font-bold">2,496</div>
              <p className="text-xs text-muted-foreground">Oil tankers worldwide</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center">
                <Factory className="h-4 w-4 mr-2 text-destructive" />
                Refineries
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1">
              <div className="text-2xl font-bold">105</div>
              <p className="text-xs text-muted-foreground">Global refining facilities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center">
                <Anchor className="h-4 w-4 mr-2 text-blue-500" />
                Ports
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1">
              <div className="text-2xl font-bold">223</div>
              <p className="text-xs text-muted-foreground">Oil terminals and facilities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2 text-orange-500" />
                Cargo Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1">
              <div className="text-2xl font-bold">1.7B+</div>
              <p className="text-xs text-muted-foreground">Tons of active cargo</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Map */}
        <EnhancedVesselMap fullScreen={isFullscreen} themeMode={themeMode} />
        
        {/* Bottom disclaimer */}
        <div className="mt-4 text-xs text-center text-muted-foreground">
          <p>Real-time maritime data provided by PetroDealHub tracking system. Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
  );
};

export default AdvancedMapPage;