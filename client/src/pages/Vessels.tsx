import { useState, useMemo, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'wouter';
import { formatDate } from '@/lib/utils';
import { Ship, Search, Plus, Filter, Droplet, Fuel, Layers, Tag, Anchor, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { OIL_PRODUCT_TYPES, REGIONS } from '@shared/constants';
import { apiRequest } from "@/lib/queryClient";
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

export default function Vessels() {
  // For direct API access using the API endpoint
  const [apiVessels, setApiVessels] = useState<Vessel[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("global");
  // Track which data source is being used
  const [dataSource, setDataSource] = useState<'websocket' | 'myshiptracking' | 'marine-traffic' | 'polling'>('websocket');
  
  // Use the WebSocket hook with fallback to REST API and pagination support
  const { 
    vessels: realTimeVessels, 
    loading: wsLoading, 
    connected: wsConnected,
    connectionType,
    page,
    pageSize,
    totalPages,
    totalCount,
    goToPage,
    changePageSize
  } = useVesselWebSocket({
    region: selectedRegion,
    page: 1,
    pageSize: 500
  });
  
  // Combined vessels from both sources
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOilTypes, setSelectedOilTypes] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [isUpdatingDestinations, setIsUpdatingDestinations] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [vesselsPerPage] = useState(50); // Show 50 vessels per page
  const { toast } = useToast();
  
  // Fetch vessels directly from the API endpoint 
  const fetchVesselsFromAPI = async () => {
    try {
      setApiLoading(true);
      setFetchError(null);
      
      // First try MyShipTracking API
      try {
        console.log('Fetching vessels from MyShipTracking API...');
        const response = await axios.get('/api/vessels/myshiptracking');
        
        if (response.data && response.data.length > 0) {
          console.log('Fetched vessels from MyShipTracking API:', response.data.length);
          setApiVessels(response.data);
          setFetchError(null);
          setDataSource('myshiptracking');
          setApiLoading(false);
          return; // Success - exit function
        } else {
          console.warn('MyShipTracking API returned empty response');
        }
      } catch (myshipError) {
        console.error('Error fetching from MyShipTracking API:', myshipError);
      }
      
      // If MyShipTracking failed, try marine-traffic API
      try {
        console.log('Trying Marine Traffic API...');
        const marineResponse = await axios.get('/api/vessels/marine-traffic');
        
        if (marineResponse.data && marineResponse.data.length > 0) {
          console.log('Fetched vessels from Marine Traffic API:', marineResponse.data.length);
          setApiVessels(marineResponse.data);
          setFetchError(null);
          setDataSource('marine-traffic');
          setApiLoading(false);
          return; // Success - exit function
        } else {
          console.warn('Marine Traffic API returned empty response');
        }
      } catch (marineError) {
        console.error('Error fetching from Marine Traffic API:', marineError);
      }
      
      // If all external APIs failed, try polling endpoint as final fallback
      try {
        console.log('Trying fallback REST polling endpoint...');
        const fallbackResponse = await axios.get('/api/vessels/polling', {
          params: { region: selectedRegion }
        });
        
        if (fallbackResponse.data && fallbackResponse.data.vessels) {
          console.log('Fetched vessels from fallback endpoint:', fallbackResponse.data.vessels.length);
          setApiVessels(fallbackResponse.data.vessels);
          setFetchError(null);
          setDataSource('polling');
        } else {
          setFetchError('Failed to fetch vessels from all data sources');
        }
      } catch (fallbackError) {
        console.error('Error with fallback endpoint:', fallbackError);
        setFetchError('Failed to fetch vessels from all endpoints');
      }
    } catch (error) {
      console.error('Unexpected error in fetchVesselsFromAPI:', error);
      setFetchError('Failed to fetch vessels from API');
    } finally {
      setApiLoading(false);
    }
  };
  
  // Fetch vessels on component mount and when region changes
  useEffect(() => {
    fetchVesselsFromAPI();
    // Fetch again every 5 minutes
    const intervalId = setInterval(fetchVesselsFromAPI, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [selectedRegion]);
  
  // Combine vessels from real-time WebSocket and API
  useEffect(() => {
    // Determine which source to use
    let combinedVessels: Vessel[] = [];
    
    if (wsConnected && realTimeVessels.length > 0) {
      // WebSocket is connected and has data - prefer this
      combinedVessels = realTimeVessels;
      console.log('Using WebSocket vessels:', realTimeVessels.length);
      setDataSource('websocket');
    } else if (apiVessels.length > 0) {
      // Fall back to API data if WebSocket isn't connected
      combinedVessels = apiVessels;
      console.log('Using API vessels:', apiVessels.length);
      
      // The data source is set in fetchVesselsFromAPI function when the data is fetched
      // We're not changing it here to preserve which API was actually successful
    }
    
    setVessels(combinedVessels);
    setLoading(wsLoading && apiLoading);
  }, [realTimeVessels, apiVessels, wsConnected, wsLoading, apiLoading]);
  
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
  
  // Process vessels with oil categories
  const vesselsWithCategories = useMemo(() => {
    return vessels.map(vessel => ({
      ...vessel,
      oilCategory: getOilCategory(vessel.cargoType)
    }));
  }, [vessels]);
  
  // Get unique oil categories present in the data
  const availableOilCategories = useMemo(() => {
    const categories = vesselsWithCategories.map(v => v.oilCategory);
    return Array.from(new Set(categories)).sort();
  }, [vesselsWithCategories]);
  
  // Filter vessels based on search term and selected oil types
  const filteredVessels = useMemo(() => {
    return vesselsWithCategories.filter(vessel => {
      // Only show cargo vessels
      const isCargoVessel = vessel.vesselType?.toLowerCase().includes('cargo') || false;
      if (!isCargoVessel) return false;
      
      // Search term filter
      const matchesSearch = 
        vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.imo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.flag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vessel.currentRegion && vessel.currentRegion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vessel.cargoType && vessel.cargoType.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Oil type filter
      const matchesOilType = 
        selectedOilTypes.length === 0 || 
        selectedOilTypes.includes(vessel.oilCategory);
      
      // Tab filter
      const matchesTab = 
        selectedTab === "all" || 
        (selectedTab === vessel.oilCategory.toLowerCase());
      
      return matchesSearch && matchesOilType && matchesTab;
    });
  }, [vesselsWithCategories, searchTerm, selectedOilTypes, selectedTab]);
  
  // Get current page vessels for the filtered table view
  const indexOfLastVessel = currentPage * vesselsPerPage;
  const indexOfFirstVessel = indexOfLastVessel - vesselsPerPage;
  const currentVessels = filteredVessels.slice(indexOfFirstVessel, indexOfLastVessel);
  const filteredTotalPages = Math.ceil(filteredVessels.length / vesselsPerPage);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOilTypes, selectedTab]);
  
  // Local pagination handlers for the filtered table results
  const handleGoToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleGoToPreviousPage = () => {
    if (currentPage > 1) {
      handleGoToPage(currentPage - 1);
    }
  };
  
  const handleGoToNextPage = () => {
    if (currentPage < totalPages) {
      handleGoToPage(currentPage + 1);
    }
  };
  
  // Handler for the WebSocket pagination
  const handleWsPageChange = (newPage: number) => {
    goToPage(newPage);
  };
  
  // Function to ensure all vessels have destinations
  const handleEnsureDestinations = async () => {
    try {
      setIsUpdatingDestinations(true);
      
      const response = await fetch('/api/vessels/ensure-destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Destinations updated",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Update failed",
          description: result.message || "Failed to update vessel destinations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating vessel destinations:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating vessel destinations",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingDestinations(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Ship className="h-8 w-8 mr-2 text-primary" />
            Vessels
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <p className="text-muted-foreground">
              {loading ? 'Loading vessels...' : `${vessels.length} vessels in the system`}
            </p>
            
            {/* Connection and data source status indicators */}
            <div className="flex items-center flex-wrap gap-1">
              {/* WebSocket/REST API connection status */}
              <Badge 
                variant="outline" 
                className={`ml-2 flex items-center gap-1 ${
                  wsConnected 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {wsConnected ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-600" />
                    <span>WebSocket</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-amber-600" />
                    <span>REST API</span>
                  </>
                )}
              </Badge>
              
              {/* Data source indicator */}
              {dataSource && (
                <Badge 
                  variant="outline" 
                  className={`ml-2 flex items-center gap-1 ${
                    dataSource === 'myshiptracking' 
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : dataSource === 'websocket'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : dataSource === 'marine-traffic'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <Ship className="h-3 w-3 mr-1" />
                  {dataSource === 'myshiptracking' 
                    ? 'MyShipTracking API' 
                    : dataSource === 'websocket'
                      ? 'WebSocket Data'
                      : dataSource === 'marine-traffic'
                        ? 'Marine Traffic API'
                        : 'Polling Fallback'
                  }
                </Badge>
              )}
              
              {/* Error indicator */}
              {fetchError && (
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <span>Error</span>
                </Badge>
              )}
              
              {/* Connection type from the hook */}
              {connectionType && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                  {connectionType}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vessels..."
              className="pl-8 w-full md:w-[260px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Region Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Region</span>
                {selectedRegion !== 'global' && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedRegion}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Filter by Region
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                key="global"
                checked={selectedRegion === 'global'}
                onCheckedChange={() => setSelectedRegion('global')}
              >
                Global (All Regions)
              </DropdownMenuCheckboxItem>
              
              {REGIONS.map((region) => (
                <DropdownMenuCheckboxItem
                  key={region.id}
                  checked={selectedRegion === region.id}
                  onCheckedChange={() => setSelectedRegion(region.id)}
                >
                  {region.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Oil Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Droplet className="h-4 w-4" />
                <span>Oil Types</span>
                {selectedOilTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedOilTypes.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center">
                  <Droplet className="h-4 w-4 mr-2" />
                  Oil Product Types
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableOilCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedOilTypes.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedOilTypes([...selectedOilTypes, category]);
                    } else {
                      setSelectedOilTypes(selectedOilTypes.filter(t => t !== category));
                    }
                  }}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedOilTypes.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs justify-center" 
                    onClick={() => setSelectedOilTypes([])}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            onClick={handleEnsureDestinations} 
            disabled={isUpdatingDestinations}
            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
          >
            <Anchor className="h-4 w-4 mr-2" />
            {isUpdatingDestinations ? 'Updating...' : 'Ensure All Destinations'}
          </Button>
          
          <Button onClick={fetchVesselsFromAPI}>
            <Plus className="h-4 w-4 mr-2" />
            Refresh Vessels
          </Button>
        </div>
      </div>
      
      {/* Oil Category Tabs */}
      <div className="mb-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-8 mb-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Layers className="h-4 w-4" /> All
            </TabsTrigger>
            <TabsTrigger value="crude" className="flex items-center gap-1">
              <Droplet className="h-4 w-4 text-amber-600" /> Crude
            </TabsTrigger>
            <TabsTrigger value="jet fuel" className="flex items-center gap-1">
              <Droplet className="h-4 w-4 text-blue-600" /> Jet Fuel
            </TabsTrigger>
            <TabsTrigger value="diesel" className="flex items-center gap-1">
              <Droplet className="h-4 w-4 text-indigo-600" /> Diesel
            </TabsTrigger>
            <TabsTrigger value="fuel oil" className="flex items-center gap-1">
              <Droplet className="h-4 w-4 text-orange-600" /> Fuel Oil
            </TabsTrigger>
            <TabsTrigger value="gas" className="flex items-center gap-1">
              <Droplet className="h-4 w-4 text-emerald-600" /> Gas
            </TabsTrigger>
            <TabsTrigger value="gasoline" className="flex items-center gap-1">
              <Droplet className="h-4 w-4 text-red-600" /> Gasoline
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-1">
              <Droplet className="h-4 w-4 text-gray-600" /> Other
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {availableOilCategories.map(category => {
            const count = vesselsWithCategories.filter(v => v.oilCategory === category).length;
            const isSelected = selectedTab === category.toLowerCase();
            
            return (
              <Badge 
                key={category}
                variant={isSelected ? "default" : "outline"} 
                className={`cursor-pointer ${isSelected ? 'bg-primary' : 'hover:bg-primary/10'}`}
                onClick={() => setSelectedTab(isSelected ? "all" : category.toLowerCase())}
              >
                {category}: {count}
              </Badge>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredVessels.length === 0 ? (
        <div className="text-center py-12">
          <Ship className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No vessels found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? `No vessels matching "${searchTerm}"` : 'No vessels available in the system.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>IMO</TableHead>
                <TableHead className="flex items-center gap-1">
                  <Droplet className="h-4 w-4" />
                  <span>Oil Type</span>
                </TableHead>
                <TableHead>Vessel Type</TableHead>
                <TableHead>Flag</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentVessels.map((vessel) => (
                <TableRow key={vessel.id}>
                  <TableCell className="font-medium">{vessel.name}</TableCell>
                  <TableCell>{vessel.imo}</TableCell>
                  
                  {/* Oil Type with colored badge */}
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`
                        ${vessel.oilCategory === 'Crude' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          vessel.oilCategory === 'Jet Fuel' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          vessel.oilCategory === 'Diesel' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          vessel.oilCategory === 'Fuel Oil' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          vessel.oilCategory === 'Gas' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          vessel.oilCategory === 'Gasoline' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-1">
                        <Droplet className={`h-3 w-3 
                          ${vessel.oilCategory === 'Crude' ? 'text-amber-500' :
                            vessel.oilCategory === 'Jet Fuel' ? 'text-blue-500' :
                            vessel.oilCategory === 'Diesel' ? 'text-indigo-500' :
                            vessel.oilCategory === 'Fuel Oil' ? 'text-orange-500' :
                            vessel.oilCategory === 'Gas' ? 'text-emerald-500' :
                            vessel.oilCategory === 'Gasoline' ? 'text-red-500' :
                            'text-gray-500'
                          }
                        `} />
                        {vessel.oilCategory}
                      </div>
                    </Badge>
                    {vessel.cargoType && (
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                        {vessel.cargoType}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>{vessel.vesselType}</TableCell>
                  <TableCell>{vessel.flag}</TableCell>
                  <TableCell>
                    {vessel.departurePort}
                    {vessel.departureDate && (
                      <div className="text-xs text-muted-foreground">
                        {formatDate(vessel.departureDate, 'PP')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {vessel.destinationPort}
                    {vessel.eta && (
                      <div className="text-xs text-muted-foreground">
                        ETA: {formatDate(vessel.eta, 'PP')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{vessel.currentRegion || 'Unknown'}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/vessels/${vessel.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Details
                        <span className="opacity-50">→</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-4 border-t bg-card">
              <div className="flex justify-between items-center px-4">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(indexOfFirstVessel + 1, filteredVessels.length)} to {Math.min(indexOfLastVessel, filteredVessels.length)} of {filteredVessels.length} vessels
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={handleGoToPreviousPage} 
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {/* Show first page */}
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => handleGoToPage(1)}>1</PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Show ellipsis if needed */}
                    {currentPage > 4 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    {/* Show previous page if not first page */}
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => handleGoToPage(currentPage - 1)}>
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Current page */}
                    <PaginationItem>
                      <PaginationLink isActive>{currentPage}</PaginationLink>
                    </PaginationItem>
                    
                    {/* Show next page if not last page */}
                    {currentPage < filteredTotalPages && (
                      <PaginationItem>
                        <PaginationLink onClick={() => handleGoToPage(currentPage + 1)}>
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Show ellipsis if needed */}
                    {currentPage < filteredTotalPages - 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    {/* Show last page */}
                    {currentPage < filteredTotalPages - 2 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => handleGoToPage(filteredTotalPages)}>
                          {filteredTotalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={handleGoToNextPage} 
                        className={currentPage === filteredTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}