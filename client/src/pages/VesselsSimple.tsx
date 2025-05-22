import { useState, useMemo, useEffect } from 'react';
import { useVesselClient } from '@/hooks/useVesselClient';
import { Vessel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'wouter';
import { formatDate } from '@/lib/utils';
import { Ship, Search, Filter, Globe } from 'lucide-react';
import { REGIONS } from '@shared/constants';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

// Define oil product categories for filtering
const OIL_CATEGORIES = {
  "Crude": ["CRUDE", "EXPORT BLEND CRUDE", "EASTERN SIBERIA PACIFIC OCEAN CRUDE OIL", "ESPO"],
  "Jet Fuel": ["JET FUEL", "JET A1", "AVIATION KEROSENE", "COLONIAL GRADE 54"],
  "Diesel": ["DIESEL", "GASOIL", "ULTRA‐LOW SULPHUR DIESEL", "AUTOMATIVE GAS OIL", "AGO OIL"],
  "Fuel Oil": ["FUEL OIL", "IFO", "HFO", "MFO", "MAZUT", "M100", "VIRGIN FUEL OIL D6", "CST-180"],
  "Gas": ["LPG", "LNG", "LIQUEFIED PETROLEUM GAS", "LIQUEFIED NATURAL GAS", "COMPRESSED NATURAL GAS", "CNG"],
  "Gasoline": ["GASOLINE", "PETROL", "MOGAS", "GASOLENE", "OCTANES"],
  "Other": ["NAPHTHA", "KEROSENE", "BITUMEN", "ASPHALT", "BASE OIL", "SULPHUR", "UREA", "DIAMMONIUM PHOSPHATE", "DAP"]
};

// Map country names to ISO country codes for flag icons
const getFlagCode = (countryName: string): string | null => {
  const countryCodeMap: Record<string, string> = {
    "United States": "US",
    "USA": "US",
    "United Kingdom": "GB",
    "UK": "GB",
    "China": "CN",
    "Japan": "JP",
    "Russia": "RU",
    "India": "IN",
    "Singapore": "SG",
    "Panama": "PA",
    "Liberia": "LR",
    "Marshall Islands": "MH",
    "Malta": "MT",
    "Cyprus": "CY",
    "Bahamas": "BS",
    "Greece": "GR"
  };
  
  return countryCodeMap[countryName] || null;
};

export default function VesselsSimple() {
  // For vessel data
  const [apiVessels, setApiVessels] = useState<Vessel[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("global");
  const [dataSource, setDataSource] = useState<'websocket' | 'myshiptracking' | 'marine-traffic' | 'polling'>('polling');
  
  // Use vessel client with maximum page size
  const { 
    vessels: realTimeVessels, 
    loading: wsLoading, 
    connected: wsConnected,
    connectionStatus,
    totalCount
  } = useVesselClient({
    region: selectedRegion,
    page: 1,
    pageSize: 5000, // Request maximum vessels
    vesselType: 'oil'
  });
  
  // Combined vessels from both sources
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOilTypes, setSelectedOilTypes] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const { toast } = useToast();
  
  // Maximum number to display
  const MAX_OIL_VESSELS = 5000;

  // Fetch vessels on component mount and when region changes
  useEffect(() => {
    fetchVesselsFromAPI();
    const intervalId = setInterval(fetchVesselsFromAPI, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [selectedRegion]);
  
  // Helper function to determine oil category
  const getOilCategory = (cargoType: string | null | undefined): string => {
    if (!cargoType) return "Other";
    const upperCargoType = cargoType.toUpperCase();
    
    for (const [category, keywords] of Object.entries(OIL_CATEGORIES)) {
      if (keywords.some(keyword => upperCargoType.includes(keyword))) {
        return category;
      }
    }
    return "Other";
  };
  
  // Fetch vessels from API
  const fetchVesselsFromAPI = async () => {
    try {
      setApiLoading(true);
      setFetchError(null);
      
      console.log('Trying fallback REST polling endpoint...');
      const fallbackResponse = await axios.get('/api/vessels/polling', {
        params: { 
          region: selectedRegion,
          limit: MAX_OIL_VESSELS,
          vesselType: 'oil'
        }
      });
      
      if (fallbackResponse.data && fallbackResponse.data.vessels) {
        console.log('Fetched vessels from fallback endpoint:', fallbackResponse.data.vessels.length);
        setApiVessels(fallbackResponse.data.vessels);
        setFetchError(null);
        setDataSource('polling');
      } else {
        setFetchError('Failed to fetch vessels');
      }
    } catch (error) {
      console.error('Error fetching vessels:', error);
      setFetchError('Failed to fetch vessels from API');
    } finally {
      setApiLoading(false);
    }
  };
  
  // Combine vessels from real-time and API
  useEffect(() => {
    let sourceVessels: any[] = [];
    
    if (wsConnected && realTimeVessels.length > 0) {
      sourceVessels = realTimeVessels;
      console.log('Using WebSocket vessels:', realTimeVessels.length);
      setDataSource('websocket');
    } else if (apiVessels.length > 0) {
      sourceVessels = apiVessels;
      console.log('Using API vessels:', apiVessels.length);
    }
    
    setVessels(sourceVessels);
    setLoading(wsLoading && apiLoading);
  }, [realTimeVessels, apiVessels, wsConnected, wsLoading, apiLoading]);
  
  // Process vessels with oil categories
  const vesselsWithCategories = useMemo(() => {
    return vessels.map(vessel => ({
      ...vessel,
      oilCategory: getOilCategory(vessel.cargoType)
    }));
  }, [vessels]);
  
  // Apply filters
  const filteredVessels = useMemo(() => {
    return vesselsWithCategories.filter(vessel => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        vessel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.imo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.mmsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.flag?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Oil type filter
      const matchesOilType = selectedOilTypes.length === 0 || 
        selectedOilTypes.includes(vessel.oilCategory);
      
      // Tab filter
      const matchesTab = selectedTab === "all" || 
        (selectedTab === "crude" && vessel.oilCategory === "Crude") ||
        (selectedTab === "gas" && vessel.oilCategory === "Gas") ||
        (selectedTab === "products" && ["Diesel", "Fuel Oil", "Jet Fuel", "Gasoline"].includes(vessel.oilCategory));
      
      return matchesSearch && matchesOilType && matchesTab;
    });
  }, [vesselsWithCategories, searchTerm, selectedOilTypes, selectedTab]);

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Global Maritime Intelligence
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl text-sm">
                Professional vessel tracking and maritime intelligence platform for global oil transportation monitoring
              </p>
            </div>
            
            {/* Connection status indicator */}
            <div className="mt-4 lg:mt-0 flex items-center gap-3">
              <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-sm">
                <span className="text-gray-500 dark:text-gray-400 mr-2">Data:</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {dataSource === 'websocket' ? 'Live' : dataSource === 'myshiptracking' ? 'MyShipTracking' : 'API'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Vessels</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '—' : totalCount?.toLocaleString() || vessels.length.toLocaleString()}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Oil Tankers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '—' : 
                vessels.filter(v => v.vesselType?.toLowerCase().includes('oil') || 
                  v.vesselType?.toLowerCase().includes('tanker')).length.toLocaleString()}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Vessels</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '—' : vessels.filter(v => v.speed && Number(v.speed) > 2).length.toLocaleString()}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading/Unloading</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '—' : 
                vessels.filter(v => v.speed && Number(v.speed) < 2 && v.destinationPort).length.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Professional Filter & Control Panel */}
      <div className="bg-white rounded-xl shadow-lg dark:bg-gray-800 my-6">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vessel Directory</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Database of {filteredVessels.length.toLocaleString()} oil vessels with real-time positions
            </p>
            
            {/* Error indicator */}
            {fetchError && (
              <div className="mt-2 text-amber-600 dark:text-amber-400 text-sm flex items-center">
                <span className="mr-1">⚠️</span> {fetchError}
              </div>
            )}
          </div>
          
          {/* Filter controls */}
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search vessels..."
                className="pl-9 h-9 w-full sm:w-[250px] rounded-lg bg-gray-50 dark:bg-gray-900/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Region selector */}
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="h-9 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 w-[180px]">
                <Globe className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <SelectValue placeholder="Global" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                {Object.keys(REGIONS).map((region) => (
                  <SelectItem key={region} value={region.toLowerCase()}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Oil type filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <Filter className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Oil Types
                  {selectedOilTypes.length > 0 && (
                    <Badge className="ml-2 bg-primary/20 text-primary border-primary/20 h-5" variant="outline">
                      {selectedOilTypes.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Oil Product Types</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(OIL_CATEGORIES).map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedOilTypes.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedOilTypes([...selectedOilTypes, category]);
                      } else {
                        setSelectedOilTypes(selectedOilTypes.filter((t) => t !== category));
                      }
                    }}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="px-5 pt-3 border-b border-gray-200 dark:border-gray-700">
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-transparent border-b-0 h-10 mb-0">
              <TabsTrigger className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4" value="all">
                All Oil Vessels
              </TabsTrigger>
              <TabsTrigger className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4" value="crude">
                Crude Carriers
              </TabsTrigger>
              <TabsTrigger className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4" value="products">
                Product Tankers
              </TabsTrigger>
              <TabsTrigger className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4" value="gas">
                Gas Carriers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Vessels Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800/60">
                <TableRow>
                  <TableHead className="w-[250px]">Vessel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead>IMO / MMSI</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Built</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVessels.map((vessel) => (
                  <TableRow key={vessel.id}>
                    <TableCell className="font-medium">
                      {vessel.name || "Unknown Vessel"}
                    </TableCell>
                    <TableCell>{vessel.vesselType || "Tanker"}</TableCell>
                    <TableCell>
                      {vessel.flag && getFlagCode(vessel.flag) ? (
                        <div className="flex items-center">
                          <span className="flex items-center">
                            {vessel.flag}
                          </span>
                        </div>
                      ) : (
                        vessel.flag || "Unknown"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>IMO: {vessel.imo || "N/A"}</p>
                        <p className="text-gray-500">MMSI: {vessel.mmsi || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vessel.currentLat && vessel.currentLng ? (
                        <span className="text-sm">
                          {Number(vessel.currentLat).toFixed(2)}, {Number(vessel.currentLng).toFixed(2)}
                        </span>
                      ) : (
                        "Position unknown"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-secondary/20">
                        {vessel.oilCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>{vessel.built || "N/A"}</TableCell>
                    <TableCell>
                      {vessel.speed && Number(vessel.speed) > 0 ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Stationary
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/vessel/${vessel.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* All Vessels Display - Simple Footer */}
          <div className="py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
            <div className="flex justify-between items-center px-5">
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Ship className="h-4 w-4 mr-2 text-primary" />
                Displaying all <span className="font-medium text-gray-800 dark:text-gray-200 mx-1">{filteredVessels.length.toLocaleString()}</span> vessels
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs h-8 border-gray-200 dark:border-gray-700"
              >
                Back to top
              </Button>
            </div>
            
            <div className="mt-4 px-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-5 justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{vessels.filter(v => v.speed && Number(v.speed) > 2).length}</span> In Transit
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{vessels.filter(v => v.destinationPort && v.speed && Number(v.speed) < 2).length}</span> Loading
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{vessels.filter(v => v.previousPort && v.lastPortDepatureTime && new Date(v.lastPortDepatureTime).getTime() > Date.now() - (24 * 60 * 60 * 1000)).length}</span> Recently Loaded
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}