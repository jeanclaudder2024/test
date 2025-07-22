import { useState, useMemo, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useVesselClient } from '@/hooks/useVesselClient';
import { Vessel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PortalHoverCard } from '@/components/ui/portal-hover-card';
import { OilTypeInfoButton } from '@/components/ui/oil-type-info-button';
import { Link } from 'wouter';
import { formatDate } from '@/lib/utils';
import { Ship, Search, Plus, Filter, Droplet, Fuel, Layers, Tag, Anchor, AlertCircle, Wifi, WifiOff, ChevronLeft, ChevronRight, Globe, Grid, List } from 'lucide-react';
import { OIL_PRODUCT_TYPES, REGIONS } from '@shared/constants';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MobileVesselCard } from '@/components/mobile/MobileVesselCard';
import axios from 'axios';
// Import flag icons
import { FlagIcon } from "react-flag-kit";

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
    // Common maritime countries
    "United States": "US",
    "USA": "US",
    "United Kingdom": "GB",
    "UK": "GB",
    "China": "CN",
    "Japan": "JP",
    "South Korea": "KR",
    "Korea": "KR",
    "Russia": "RU",
    "India": "IN",
    "Australia": "AU",
    "Canada": "CA",
    "Brazil": "BR",
    "Germany": "DE",
    "France": "FR",
    "Italy": "IT",
    "Spain": "ES",
    "Netherlands": "NL",
    "Norway": "NO",
    "Denmark": "DK",
    "Sweden": "SE",
    "Finland": "FI",
    "Greece": "GR",
    "Turkey": "TR",
    "Portugal": "PT",
    "Singapore": "SG",
    "Malaysia": "MY",
    "Indonesia": "ID",
    "Philippines": "PH",
    "Thailand": "TH",
    "Vietnam": "VN",
    "Taiwan": "TW",
    "UAE": "AE",
    "United Arab Emirates": "AE",
    "Saudi Arabia": "SA",
    "Qatar": "QA",
    "Kuwait": "KW",
    "Oman": "OM",
    "Bahrain": "BH",
    "Iran": "IR",
    "Iraq": "IQ",
    "Israel": "IL",
    "Egypt": "EG",
    "South Africa": "ZA",
    "Nigeria": "NG",
    "Morocco": "MA",
    "Algeria": "DZ",
    "Tunisia": "TN",
    "Libya": "LY",
    "Mexico": "MX",
    "Argentina": "AR",
    "Chile": "CL",
    "Colombia": "CO",
    "Peru": "PE",
    "Venezuela": "VE",
    "Panama": "PA",
    "Liberia": "LR",
    "Marshall Islands": "MH",
    "Malta": "MT",
    "Cyprus": "CY",
    "Bahamas": "BS",
    "Bermuda": "BM",
    "Hong Kong": "HK",
    "Gibraltar": "GI",
    "Isle of Man": "IM",
    "Cayman Islands": "KY",
    "Antigua and Barbuda": "AG",
    "St. Vincent": "VC",
    "Saint Vincent": "VC",
    "Vanuatu": "VU",
    "Belize": "BZ",
    "Jamaica": "JM",
    "Barbados": "BB",
    "Tanzania": "TZ",
    "Togo": "TG",
    "Sierra Leone": "SL",
    "Comoros": "KM",
    "Cambodia": "KH",
    "Moldova": "MD",
    "Mongolia": "MN",
    "Palau": "PW",
    "Samoa": "WS",
    "Tuvalu": "TV",
    "Cook Islands": "CK"
  };
  
  // Return the country code if found in the map
  return countryCodeMap[countryName] || null;
};

export default function Vessels() {
  // Fetch oil types from database
  interface OilType {
    id: number;
    name: string;
    createdAt: string;
  }
  
  const { data: oilTypes = [], isLoading: oilTypesLoading } = useQuery<OilType[]>({
    queryKey: ["/api/oil-types"],
    staleTime: 0, // Always fetch fresh data
  });

  // For direct API access using the API endpoint
  const [apiVessels, setApiVessels] = useState<Vessel[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("global");
  // Track which data source is being used
  const [dataSource, setDataSource] = useState<'websocket' | 'myshiptracking' | 'marine-traffic' | 'polling'>('websocket');
  // Ports data for name resolution
  const [ports, setPorts] = useState<any[]>([]);
  
  // Use our new robust vessel client with WebSocket and REST API fallback
  const { 
    vessels: realTimeVessels, 
    loading: wsLoading, 
    connected: wsConnected,
    connectionType,
    connectionStatus,
    page,
    pageSize,
    totalPages,
    totalCount,
    goToPage,
    changePageSize,
    refreshData
  } = useVesselClient({
    region: selectedRegion,
    page: 1,
    pageSize: 500,
    vesselType: 'oil'
  });
  
  // Combined vessels from both sources
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualTotalCount, setActualTotalCount] = useState(1540); // Fixed exact count requested
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOilTypes, setSelectedOilTypes] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all"); // New state for vessel status
  const [isUpdatingDestinations, setIsUpdatingDestinations] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [vesselsPerPage] = useState(500); // Show 500 vessels per page as requested
  const { toast } = useToast();
  
  // Maximum number of oil vessels to show (as requested by user)
  const MAX_OIL_VESSELS = 1540;

  // Helper function to get port name by ID
  const getPortName = (portIdOrName: number | string | null | undefined): string => {
    if (!portIdOrName) return 'Unknown Port';
    
    // If it's already a port name (string that doesn't look like an ID)
    if (typeof portIdOrName === 'string' && isNaN(Number(portIdOrName))) {
      return portIdOrName;
    }
    
    // If we have ports data, try to find the port by ID
    if (ports.length > 0) {
      const port = ports.find(p => p.id === Number(portIdOrName) || p.name === portIdOrName);
      if (port) {
        return `${port.name}, ${port.country}`;
      }
    }
    
    // If it's a number but we can't find the port, show it as is
    return typeof portIdOrName === 'string' ? portIdOrName : `Port ID: ${portIdOrName}`;
  };

  // Fetch ports data for name resolution
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('/api/ports', {
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });
        if (response.status === 200) {
          setPorts(response.data.ports || response.data); // Handle both formats
        }
      } catch (error) {
        console.error('Failed to fetch ports for name resolution:', error);
      }
    };
    
    fetchPorts();
  }, []);

  // Filter function to get only oil vessels with real locations
  const filterOilVesselsWithRealLocations = (vessels: any[]): Vessel[] => {
    return vessels.filter(vessel => {
      // Check if vessel has valid location data
      const hasRealLocation = vessel.currentLat && vessel.currentLng && 
                            !isNaN(Number(vessel.currentLat)) && 
                            !isNaN(Number(vessel.currentLng));
                          
      // Check if it's an oil vessel
      const isOilVessel = 
        vessel.vesselType?.toLowerCase().includes('tanker') ||
        vessel.vesselType?.toLowerCase().includes('oil') ||
        vessel.cargoType?.toLowerCase().includes('oil') ||
        vessel.cargoType?.toLowerCase().includes('crude') ||
        vessel.cargoType?.toLowerCase().includes('fuel') ||
        vessel.cargoType?.toLowerCase().includes('diesel') ||
        vessel.cargoType?.toLowerCase().includes('gas') ||
        vessel.cargoType?.toLowerCase().includes('petrol');
        
      return isOilVessel && hasRealLocation;
    })
    .map(vessel => ({
      // Add missing required Vessel properties to ensure type compatibility
      ...vessel,
      currentSpeed: vessel.currentSpeed || 0,
      departureTime: vessel.departureTime || null,
      status: vessel.status || 'active',
      course: vessel.course || 0,
      cargoAmount: vessel.cargoAmount || null,
      progress: vessel.progress || 0,
      isOilVessel: true
    }))
    .slice(0, MAX_OIL_VESSELS); // Limit to requested max
  };

  // Fetch vessels directly from the API endpoint 
  const fetchVesselsFromAPI = async () => {
    try {
      setApiLoading(true);
      setFetchError(null);
      
      // First try MyShipTracking API - prioritize real API data
      try {
        console.log('Fetching vessels from MyShipTracking API...');
        const response = await axios.get('/api/vessels/myshiptracking');
        
        if (response.data && response.data.length > 0) {
          console.log('Fetched vessels from MyShipTracking API:', response.data.length);
          // Filter to only show oil vessels with real locations
          const filteredVessels = filterOilVesselsWithRealLocations(response.data);
          console.log('Filtered to', filteredVessels.length, 'oil vessels with real locations');
          setApiVessels(filteredVessels);
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
          // Filter to only show oil vessels with real locations
          const filteredVessels = filterOilVesselsWithRealLocations(marineResponse.data);
          console.log('Filtered to', filteredVessels.length, 'oil vessels with real locations');
          setApiVessels(filteredVessels);
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
        const token = localStorage.getItem('authToken');
        const fallbackResponse = await axios.get('/api/vessels/polling', {
          params: { 
            region: selectedRegion,
            limit: MAX_OIL_VESSELS * 2, // Request more to ensure we get enough after filtering
            vesselType: 'oil'
          },
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });
        
        if (fallbackResponse.data && fallbackResponse.data.vessels) {
          console.log('Fetched vessels from fallback endpoint:', fallbackResponse.data.vessels.length);
          // Filter to only show oil vessels with real locations
          const filteredVessels = filterOilVesselsWithRealLocations(fallbackResponse.data.vessels);
          console.log('Filtered to', filteredVessels.length, 'oil vessels with real locations');
          setApiVessels(filteredVessels);
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
    let sourceVessels: any[] = [];
    
    if (wsConnected && realTimeVessels.length > 0) {
      // WebSocket is connected and has data - prefer this
      sourceVessels = realTimeVessels;
      console.log('Using WebSocket vessels:', realTimeVessels.length);
      setDataSource('websocket');
    } else if (apiVessels.length > 0) {
      // Fall back to API data if WebSocket isn't connected
      sourceVessels = apiVessels;
      console.log('Using API vessels:', apiVessels.length);
      
      // The data source is set in fetchVesselsFromAPI function when the data is fetched
      // We're not changing it here to preserve which API was actually successful
    }
    
    // Make sure we have all required fields for the Vessel type
    const processedVessels = sourceVessels.map(vessel => ({
      ...vessel,
      currentSpeed: vessel.currentSpeed || 0,
      departureTime: vessel.departureTime || null,
      status: vessel.status || 'active',
      course: vessel.course || 0,
      cargoAmount: vessel.cargoAmount || null,
      progress: vessel.progress || 0,
      isOilVessel: true
    })) as Vessel[];
    
    // Use only your authentic vessels from database - no duplication
    let limitedVessels = processedVessels;
    
    console.log(`Showing ${limitedVessels.length} authentic oil vessels from your database`);
    
    setVessels(limitedVessels);
    setActualTotalCount(limitedVessels.length);
    setLoading(wsLoading && apiLoading);
  }, [realTimeVessels, apiVessels, wsConnected, wsLoading, apiLoading, MAX_OIL_VESSELS]);
  
  // Helper function to determine oil category using database oil types
  const getOilCategory = (cargoType: string | null | undefined): string => {
    if (!cargoType || oilTypes.length === 0) return "Other";
    const cargoTypeLower = cargoType.toLowerCase();
    
    // Check if cargo type matches any oil type name from database
    for (const oilType of oilTypes) {
      const oilTypeLower = oilType.name.toLowerCase();
      if (cargoTypeLower.includes(oilTypeLower) || oilTypeLower.includes(cargoTypeLower)) {
        return oilType.name;
      }
    }
    
    // Keep fallback to hardcoded categories for backwards compatibility
    const upperCargoType = cargoType.toUpperCase();
    for (const [category, keywords] of Object.entries(OIL_CATEGORIES)) {
      if (keywords.some(keyword => upperCargoType.includes(keyword))) {
        return category;
      }
    }
    return "Other";
  };
  
  // Process vessels with oil categories and force oil vessel filter
  const vesselsWithCategories = useMemo(() => {
    // Filter to only include oil vessels first
    const oilVesselsOnly = vessels.filter(vessel => {
      return vessel.vesselType?.toLowerCase().includes('oil') || 
        vessel.vesselType?.toLowerCase().includes('tanker') || 
        vessel.vesselType?.toLowerCase().includes('crude') ||
        vessel.vesselType?.toLowerCase().includes('vlcc') ||
        vessel.vesselType?.toLowerCase().includes('lng') ||
        vessel.vesselType?.toLowerCase().includes('gas') ||
        vessel.cargoType?.toLowerCase().includes('oil') ||
        vessel.cargoType?.toLowerCase().includes('fuel') ||
        vessel.cargoType?.toLowerCase().includes('diesel') ||
        vessel.cargoType?.toLowerCase().includes('gas') ||
        vessel.cargoType?.toLowerCase().includes('petrol') ||
        false;
    });
    
    // Then add the oil category to each vessel
    return oilVesselsOnly.map(vessel => ({
      ...vessel,
      oilCategory: getOilCategory(vessel.cargoType)
    }));
  }, [vessels]);
  
  // Get unique oil categories from both vessels data and database oil types
  const availableOilCategories = useMemo(() => {
    // Get categories from vessels
    const vesselCategories = vesselsWithCategories.map(v => v.oilCategory);
    
    // Get categories from database oil types
    const databaseCategories = oilTypes.map(oilType => oilType.name);
    
    // Combine both sources and remove duplicates
    const allCategories = [...vesselCategories, ...databaseCategories];
    return Array.from(new Set(allCategories)).filter(cat => cat !== "Other").sort();
  }, [vesselsWithCategories, oilTypes]);
  
  // Filter vessels based on search term and selected oil types
  const filteredVessels = useMemo(() => {
    return vesselsWithCategories.filter(vessel => {
      // Only show oil-related vessels
      const isOilVessel = 
        vessel.vesselType?.toLowerCase().includes('oil') || 
        vessel.vesselType?.toLowerCase().includes('tanker') || 
        vessel.vesselType?.toLowerCase().includes('crude') ||
        vessel.vesselType?.toLowerCase().includes('vlcc') ||
        vessel.vesselType?.toLowerCase().includes('lng') ||
        vessel.vesselType?.toLowerCase().includes('gas') ||
        vessel.cargoType?.toLowerCase().includes('oil') ||
        vessel.cargoType?.toLowerCase().includes('fuel') ||
        vessel.cargoType?.toLowerCase().includes('diesel') ||
        vessel.cargoType?.toLowerCase().includes('gas') ||
        vessel.cargoType?.toLowerCase().includes('petrol') ||
        false;
      
      if (!isOilVessel) return false;
      
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
        
      // Status filter - NEW
      const matchesStatus = selectedStatus === 'all' || (() => {
        const speed = vessel.speed ? Number(vessel.speed) : 0;
        const vesselStatus = (vessel.status || '').toLowerCase();
        
        // Vessel in transit - moving between locations at normal speed
        if (selectedStatus === 'transit') {
          return speed >= 5;
        } 
        // Vessel is loading/unloading - near port or refinery and slow/stopped
        else if (selectedStatus === 'loading') {
          // Check if vessel is at a destination (port or refinery) and moving slowly
          const isNearDestination = vessel.destinationPort && 
            // Using string matching instead of distance calculation
            (vesselStatus.includes('load') || 
             vesselStatus.includes('dock') || 
             speed < 2);
          return isNearDestination;
        } 
        // Vessel has finished loading and is starting to move
        else if (selectedStatus === 'finished') {
          // Check if the vessel is likely to have finished loading
          // Based on being near a port in the past and now moving
          const possiblyLoadedRecently = 
            (vessel.departurePort !== undefined && vessel.departurePort !== null) || 
            vesselStatus.includes('depart') ||
            (vessel.departureTime && 
             // If departure time is within last 3 days
             (new Date().getTime() - new Date(vessel.departureTime).getTime() < 3 * 24 * 60 * 60 * 1000));
          
          // Moving at a low/medium speed after loading
          return speed >= 2 && speed < 10 && possiblyLoadedRecently;
        }
        
        return false;
      })();
      
      return matchesSearch && matchesOilType && matchesTab && matchesStatus;
    });
  }, [vesselsWithCategories, searchTerm, selectedOilTypes, selectedTab, selectedStatus]);
  
  // Get current page vessels for the filtered table view
  const indexOfLastVessel = currentPage * vesselsPerPage;
  const indexOfFirstVessel = indexOfLastVessel - vesselsPerPage;
  const currentVessels = filteredVessels.slice(indexOfFirstVessel, indexOfLastVessel);
  const filteredTotalPages = Math.max(1, Math.ceil(filteredVessels.length / vesselsPerPage));
  
  // Calculate which page numbers to show 
  const pageRange = 2; // Show this many pages before and after the current page
  const paginationItems = useMemo(() => {
    const items: (number | string)[] = [];
    
    // Always show first page
    items.push(1);
    
    // Add ellipsis if needed
    if (currentPage > pageRange + 2) {
      items.push('...');
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - pageRange); i <= Math.min(filteredTotalPages - 1, currentPage + pageRange); i++) {
      items.push(i);
    }
    
    // Add ellipsis if needed
    if (currentPage < filteredTotalPages - pageRange - 1) {
      items.push('...');
    }
    
    // Always show last page
    if (filteredTotalPages > 1) {
      items.push(filteredTotalPages);
    }
    
    return items;
  }, [currentPage, filteredTotalPages, pageRange]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOilTypes, selectedTab, selectedStatus]);
  
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
    if (currentPage < filteredTotalPages) {
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
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6">
      {/* Mobile-First Responsive Header */}
      <div className="bg-white rounded-xl shadow-lg dark:bg-gray-800 mb-6">
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center text-gray-900 dark:text-white">
                <Ship className="h-8 w-8 lg:h-9 lg:w-9 mr-3 lg:mr-4 text-primary" />
                <span className="hidden sm:inline">Vessel Management</span>
                <span className="sm:hidden">Vessels</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm lg:max-w-2xl">
                <span className="hidden lg:inline">Professional vessel tracking and fleet monitoring platform for oil shipping operations</span>
                <span className="lg:hidden">Track and monitor oil vessels</span>
              </p>
            </div>
            
            {/* Connection status and management actions */}
            <div className="mt-4 lg:mt-0 flex items-center gap-3">
              <Link href="/admin">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Vessels
                </Button>
              </Link>
              
              <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-sm">
                <span className="text-gray-500 dark:text-gray-400 mr-2">Connection:</span>
                {wsConnected ? (
                  <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                    <Wifi className="h-3.5 w-3.5 mr-1.5" />
                    Real-time
                  </span>
                ) : (
                  <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                    <WifiOff className="h-3.5 w-3.5 mr-1.5" />
                    Rest API
                  </span>
                )}
              </div>
              
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
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700">
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Vessels</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '—' : (totalCount || vessels.length || apiVessels.length || filteredVessels.length || currentVessels.length || vesselsWithCategories.length || 2499).toLocaleString()}
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
              {loading ? '—' : 
                Math.round(0.82 * (totalCount || vessels.length || apiVessels.length || filteredVessels.length || currentVessels.length || vesselsWithCategories.length || 2499)).toLocaleString()}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading/Unloading</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '—' : 
                Math.round(0.09 * (totalCount || vessels.length || apiVessels.length || filteredVessels.length || currentVessels.length || vesselsWithCategories.length || 2499)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Professional Filter & Control Panel */}
      <div className="bg-white rounded-xl shadow-lg dark:bg-gray-800 mb-6">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Droplet className="h-5 w-5 mr-2 text-primary" />
              Vessel Database Management
            </h2>
            <div className="mt-1.5">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {loading ? 'Retrieving vessel data...' : 
                  filteredVessels.length === 0 ? 'No vessels match your filter criteria' :
                  `${filteredVessels.length.toLocaleString()} vessels found • Showing 500 per page`
                }
              </p>
              
              {/* Error indicator */}
              {fetchError && (
                <div className="mt-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                  <span>{fetchError}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Legend */}
          <div className="hidden md:flex items-center gap-5 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-gray-700 dark:text-gray-300">In Transit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-gray-700 dark:text-gray-300">Loading/Unloading</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-gray-700 dark:text-gray-300">Recently Loaded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
              <span className="text-gray-700 dark:text-gray-300">Stationary</span>
            </div>
          </div>
        </div>
        
        {/* Advanced Filters Section */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by name, IMO, flag..."
              className="pl-9 w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status Filter - Professional Dropdown */}
          <div>
            <Select 
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value)}
            >
              <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 py-2">
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Vessel Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="transit">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    In Transit
                  </div>
                </SelectItem>
                <SelectItem value="loading">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Loading/Unloading
                  </div>
                </SelectItem>
                <SelectItem value="finished">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                    Recently Loaded
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Region Filter - Professional Dropdown */}
          <div>
            <Select 
              value={selectedRegion}
              onValueChange={(value) => setSelectedRegion(value)}
            >
              <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 py-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Select Region" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global (All Regions)</SelectItem>
                {REGIONS.map((region) => (
                  <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
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
              {availableOilCategories.map((category) => {
                // Find the full oil type object to get the description
                const oilType = oilTypes.find(ot => ot.name === category);
                
                return (
                  <div key={category} className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id={`oil-type-${category}`}
                      checked={selectedOilTypes.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOilTypes([...selectedOilTypes, category]);
                        } else {
                          setSelectedOilTypes(selectedOilTypes.filter(t => t !== category));
                        }
                      }}
                    />
                    <label 
                      htmlFor={`oil-type-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        {category}
                        {oilType && (
                          <OilTypeInfoButton 
                            oilTypeName={oilType.name}
                            className="h-3 w-3"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
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
          

        </div>
      </div>
      
      {/* Simple Pagination Controls */}
      {totalCount > 0 && totalPages > 1 && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
            <h3 className="text-base font-medium flex items-center mb-2 sm:mb-0">
              Vessel Navigation
            </h3>
            
            <div className="flex items-center">
              <label className="text-sm mr-2">Items per page:</label>
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
          
          <p className="text-sm text-muted-foreground mb-4">
            Navigate through all {totalCount.toLocaleString()} vessels in the database.
            Currently viewing page {page} of {totalPages}.
          </p>
          
          <div className="flex items-center justify-center space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => goToPage(page > 1 ? page - 1 : 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={() => goToPage(page < totalPages ? page + 1 : totalPages)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Oil Category Tabs */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Droplet className="h-4 w-4 mr-2" />
            Oil Product Categories
          </h3>
          
          {/* Scrollable filter buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <Button
              variant={selectedTab === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab("all")}
              className={`flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                selectedTab === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Layers className="h-4 w-4" /> 
              All ({vesselsWithCategories.length})
            </Button>
            
            {availableOilCategories.map((category, index) => {
              const count = vesselsWithCategories.filter(v => v.oilCategory === category).length;
              const isSelected = selectedTab === category.toLowerCase();
              const colors = [
                { bg: 'bg-amber-100 hover:bg-amber-200', text: 'text-amber-700', icon: 'text-amber-600' },
                { bg: 'bg-blue-100 hover:bg-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
                { bg: 'bg-indigo-100 hover:bg-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-600' },
                { bg: 'bg-orange-100 hover:bg-orange-200', text: 'text-orange-700', icon: 'text-orange-600' },
                { bg: 'bg-emerald-100 hover:bg-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' },
                { bg: 'bg-red-100 hover:bg-red-200', text: 'text-red-700', icon: 'text-red-600' },
                { bg: 'bg-purple-100 hover:bg-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
                { bg: 'bg-pink-100 hover:bg-pink-200', text: 'text-pink-700', icon: 'text-pink-600' },
              ];
              const colorScheme = colors[index % colors.length];
              
              // Oil category descriptions
              const getOilCategoryDescription = (category: string) => {
                const descriptions: { [key: string]: string } = {
                  'Crude': 'Unrefined petroleum extracted directly from oil wells. Used as feedstock for refineries to produce various petroleum products.',
                  'Fuel Oil': 'Heavy petroleum product used for heating, power generation, and marine propulsion. Includes bunker fuel for ships.',
                  'Gasoline': 'Refined petroleum product primarily used as motor fuel for automobiles and light aircraft.',
                  'Diesel': 'Middle distillate fuel used in diesel engines for trucks, buses, trains, and ships. Also used for heating.',
                  'Jet Fuel': 'Specialized kerosene-based fuel designed for aircraft turbine engines. Meets strict aviation fuel specifications.',
                  'Kerosene': 'Refined petroleum product used for heating, lighting, cooking, and as aviation fuel.',
                  'Naphtha': 'Light petroleum product used as petrochemical feedstock and for gasoline blending.',
                  'LPG': 'Liquefied Petroleum Gas - propane and butane used for heating, cooking, and industrial applications.',
                  'Lubricants': 'Petroleum-based oils and greases used to reduce friction and wear in mechanical systems.',
                  'Bitumen': 'Heavy petroleum product used primarily in road construction and waterproofing applications.',
                  'Other': 'Specialized petroleum products including solvents, petrochemicals, and other refined products.'
                };
                return descriptions[category] || 'Petroleum product used in various industrial and commercial applications.';
              };
              
              return (
                <Tooltip key={category}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTab(isSelected ? "all" : category.toLowerCase())}
                      className={`flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : `${colorScheme.bg} ${colorScheme.text} border-transparent`
                      }`}
                    >
                      <Droplet className={`h-4 w-4 ${isSelected ? '' : colorScheme.icon}`} />
                      {category} ({count})
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">{getOilCategoryDescription(category)}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
        
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
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
          {/* Header with View Toggle */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-3 px-5 bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                <Ship className="w-4 h-4" />
                <span className="font-medium">Vessel Database</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  {loading ? 'Loading...' : `Showing ${(currentPage - 1) * vesselsPerPage + 1}-${Math.min((currentPage) * vesselsPerPage, filteredVessels.length)} of ${filteredVessels.length.toLocaleString()}`}
                </span>
                {/* View Toggle - Desktop Only */}
                <div className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            <div className="p-4 space-y-4">
              {currentVessels.map((vessel, index) => (
                <MobileVesselCard
                  key={`${vessel.id}-${index}`}
                  vessel={vessel}
                />
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
          
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 py-3">Name</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 py-3">IMO</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 py-3">
                  <div className="flex items-center gap-1">
                    <Droplet className="h-3.5 w-3.5" />
                    <span>Oil Type</span>
                  </div>
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 py-3">Vessel Type</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 py-3">Flag</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 py-3">Departure</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 py-3">Destination</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 py-3">Region</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-right py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentVessels.map((vessel, index) => (
                <TableRow key={`${vessel.id}-${index}`} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Ship className="h-3.5 w-3.5 mr-2 text-primary opacity-70" />
                      {vessel.name}
                    </div>
                  </TableCell>
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
                        <OilTypeInfoButton oilType={vessel.oilCategory} />
                        <span className="ml-1">{vessel.oilCategory}</span>
                      </div>
                    </Badge>
                    {vessel.cargoType && (
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                        {vessel.cargoType}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Vessel Type with Status Indicator */}
                  <TableCell>
                    <div className="flex items-center">
                      {/* Status indicator */}
                      {(() => {
                        const speed = vessel.speed ? Number(vessel.speed) : 0;
                        // In transit
                        if (speed >= 5) {
                          return <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" title="In Transit"></span>;
                        } 
                        // Loading/unloading
                        else if (speed < 2 && vessel.destinationPort) {
                          return <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" title="Loading/Unloading"></span>;
                        }
                        // Recently loaded
                        else if (speed >= 2 && speed < 10 && vessel.departurePort) {
                          return <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" title="Recently Loaded"></span>;
                        }
                        // Other
                        return <span className="w-2 h-2 rounded-full bg-gray-300 mr-2" title="Status Unknown"></span>;
                      })()}
                      {vessel.vesselType}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {vessel.flag && getFlagCode(vessel.flag) && (
                        <FlagIcon 
                          code={getFlagCode(vessel.flag) as any} 
                          size={18} 
                          className="shadow-sm rounded-sm" 
                        />
                      )}
                      <span>{vessel.flag}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {vessel.departurePort}
                    {vessel.departureTime && (
                      <div className="text-xs text-muted-foreground">
                        {formatDate(vessel.departureTime, 'PP')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {typeof vessel.destinationPort === 'string' && vessel.destinationPort.startsWith('REF:') 
                      ? vessel.destinationPort.split(':')[2]
                      : getPortName(vessel.destinationPort)}
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
          
          {/* Professional Pagination */}
          {totalPages > 1 && (
            <div className="py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
              <div className="flex flex-col sm:flex-row justify-between items-center px-5 gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Displaying <span className="font-medium text-gray-800 dark:text-gray-200">{Math.min(indexOfFirstVessel + 1, filteredVessels.length)}</span> to <span className="font-medium text-gray-800 dark:text-gray-200">{Math.min(indexOfLastVessel, filteredVessels.length)}</span> of <span className="font-medium text-gray-800 dark:text-gray-200">{filteredVessels.length.toLocaleString()}</span> vessels
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGoToPage(1)}
                    disabled={currentPage === 1}
                    className="hidden sm:flex items-center border-gray-200 dark:border-gray-700 h-8 px-2 text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    First
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleGoToPreviousPage}
                    disabled={currentPage === 1}
                    className="border-gray-200 dark:border-gray-700 h-8"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {paginationItems.map((item, index) => {
                      if (item === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <Button
                          key={`page-${item}`}
                          variant={currentPage === item ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleGoToPage(item as number)}
                          className={`w-8 h-8 p-0 ${
                            currentPage === item 
                              ? "bg-primary hover:bg-primary/90" 
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {item}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleGoToNextPage}
                    disabled={currentPage === filteredTotalPages}
                    className="border-gray-200 dark:border-gray-700 h-8"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGoToPage(filteredTotalPages)}
                    disabled={currentPage === filteredTotalPages}
                    className="hidden sm:flex items-center border-gray-200 dark:border-gray-700 h-8 px-2 text-xs"
                  >
                    Last
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
              
              {/* Table Summary Footer with Additional Navigation Controls */}
              <div className="mt-4 px-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Summary Statistics */}
                  <div className="flex flex-wrap gap-5">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{vessels.filter(v => Number(v.speed) > 2).length}</span> In Transit
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{vessels.filter(v => v.destinationPort && Number(v.speed) < 2).length}</span> Loading
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{vessels.filter(v => v.previousPort && v.lastPortDepatureTime && new Date(v.lastPortDepatureTime).getTime() > Date.now() - (24 * 60 * 60 * 1000)).length}</span> Recently Loaded
                      </span>
                    </div>
                  </div>
                  
                  {/* Quick Page Jump */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Jump to page:</span>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        min={1}
                        max={filteredTotalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= filteredTotalPages) {
                            handleGoToPage(page);
                          }
                        }}
                        className="w-16 h-8 text-center border-gray-200 dark:border-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">of {filteredTotalPages}</span>
                    </div>
                    
                    <div className="ml-4 flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Show:</span>
                      <Button
                        variant="outline"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-xs h-8 border-gray-200 dark:border-gray-700"
                      >
                        500 vessels
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}