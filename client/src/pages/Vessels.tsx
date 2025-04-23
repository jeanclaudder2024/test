import { useState, useMemo } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
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
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'wouter';
import { formatDate } from '@/lib/utils';
import { Ship, Search, Plus, Filter, Droplet, Fuel, Layers, Tag, Anchor, AlertCircle } from 'lucide-react';
import { OIL_PRODUCT_TYPES } from '@shared/constants';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const { vessels, loading } = useDataStream();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOilTypes, setSelectedOilTypes] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [isUpdatingDestinations, setIsUpdatingDestinations] = useState(false);
  const [isRefreshingASI, setIsRefreshingASI] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();
  
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
  
  // Function to refresh data from ASI Stream API
  const handleRefreshASIData = async () => {
    try {
      setIsRefreshingASI(true);
      
      const result = await apiRequest('/api/refresh-asi-data', { method: 'POST' });
      
      if (result.success) {
        toast({
          title: "ASI Stream Data Refreshed",
          description: `Successfully fetched ${result.data.fetched} vessels. Created: ${result.data.created}, Updated: ${result.data.updated}`,
          variant: "default",
        });
        
        // Force reload of vessel data
        window.location.reload();
      } else {
        toast({
          title: "Refresh failed",
          description: result.message || "Failed to fetch data from ASI Stream API",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error refreshing ASI Stream data:", error);
      toast({
        title: "Error",
        description: "An error occurred while refreshing vessel data from ASI Stream API",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingASI(false);
    }
  };
  
  // Function to clear all vessel and refinery data
  const handleClearAllData = async () => {
    // Confirm deletion with user
    if (!confirm("This will delete ALL vessel and refinery data from the system. This action cannot be undone. Are you sure?")) {
      return;
    }
    
    try {
      setIsClearing(true);
      
      const result = await apiRequest('/api/clear-data', { method: 'POST' });
      
      if (result.success) {
        toast({
          title: "Data Cleared Successfully",
          description: `Deleted ${result.data.vessels} vessels, ${result.data.refineries} refineries, ${result.data.events} events, and ${result.data.documents} documents.`,
          variant: "default",
        });
        
        // Force reload of page
        window.location.reload();
      } else {
        toast({
          title: "Clear Operation Failed",
          description: result.message || "Failed to clear vessel and refinery data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error clearing data:", error);
      toast({
        title: "Error",
        description: "An error occurred while attempting to clear data",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
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
          <p className="text-muted-foreground">
            {loading ? 'Loading vessels...' : `${vessels.length} vessels in the system`}
          </p>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
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
          
          <Button 
            variant="outline" 
            onClick={handleRefreshASIData} 
            disabled={isRefreshingASI}
            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {isRefreshingASI ? 'Refreshing...' : 'Refresh ASI Stream Data'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleClearAllData} 
            disabled={isClearing}
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </Button>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vessel
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
              {filteredVessels.map((vessel) => (
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
        </div>
      )}
    </div>
  );
}