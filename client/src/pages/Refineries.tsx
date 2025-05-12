import { useState, useEffect, useMemo } from 'react';
import { useDataStream } from '@/hooks/useDataStream';

// Define Refinery type based on the data structure
type Refinery = {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity: number | null;
  status: string | null;
  description: string | null;
  operator?: string | null;
  owner?: string | null;
  type?: string | null;
  products?: string | null;
  year_built?: number | null;
  complexity?: string | null;
  city?: string | null;
  // Add index signature to allow property access with string keys
  [key: string]: string | number | null | undefined;
};
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from 'wouter';
import { 
  Factory, 
  Search, 
  Plus, 
  RefreshCw, 
  Filter, 
  ListFilter, 
  ArrowUpDown, 
  Droplets, 
  BarChart4,
  Globe,
  Grid3X3,
  Info,
  MapPin,
  Eye,
  Settings,
  Download,
  Share2,
  MoreHorizontal,
  FileBarChart,
  Zap,
  Activity
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

// Type for refinery view mode
type ViewMode = 'grid' | 'list' | 'analytics';

// Type for sorting options
type SortOption = {
  label: string;
  value: keyof Refinery | 'none';
  direction: 'asc' | 'desc';
};

// Type for filter options
type FilterOption = {
  type: 'region' | 'status' | 'capacity';
  value: string;
  label: string;
};

export default function Refineries() {
  const { refineries, loading } = useDataStream();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>({ 
    label: 'Default', 
    value: 'none', 
    direction: 'asc' 
  });
  const { toast } = useToast();
  
  // Total refinery capacity
  const totalCapacity = useMemo(() => {
    return refineries.reduce((sum, refinery) => sum + (refinery.capacity || 0), 0);
  }, [refineries]);
  
  // Stats for active refineries
  const refineryStats = useMemo(() => {
    const activeCount = refineries.filter(r => 
      r.status?.toLowerCase() === 'active' || 
      r.status?.toLowerCase() === 'operational'
    ).length;
    
    const maintenanceCount = refineries.filter(r => 
      r.status?.toLowerCase() === 'maintenance' || 
      r.status?.toLowerCase() === 'planned'
    ).length;
    
    const regionCounts: Record<string, number> = {};
    refineries.forEach(refinery => {
      const region = refinery.region || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    
    return {
      active: activeCount,
      maintenance: maintenanceCount,
      offline: refineries.length - activeCount - maintenanceCount,
      regions: regionCounts
    };
  }, [refineries]);
  
  // Function to update refineries with real-world data
  const updateRefineryWithRealData = async () => {
    try {
      setIsUpdating(true);
      
      // Call the API endpoint to update refineries with real data
      const response = await axios.post('/api/refineries/update-real-data');
      
      if (response.data && response.data.success) {
        // Show success toast
        toast({
          title: "Success!",
          description: `Updated refineries with real-world data. Please refresh to see changes.`,
          variant: "default",
        });
        
        // Force a refresh of the page to show updated data
        window.location.reload();
      } else {
        throw new Error(response.data?.message || "Failed to update refineries");
      }
    } catch (error) {
      console.error("Error updating refineries with real data:", error);
      
      // Show error toast
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An error occurred while updating refineries",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Toggle filter function
  const toggleFilter = (filter: FilterOption) => {
    const filterExists = activeFilters.some(
      f => f.type === filter.type && f.value === filter.value
    );
    
    if (filterExists) {
      setActiveFilters(activeFilters.filter(
        f => !(f.type === filter.type && f.value === filter.value)
      ));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
    setSearchTerm('');
    setSortOption({ label: 'Default', value: 'none', direction: 'asc' });
  };
  
  // Sort and filter refineries
  const filteredRefineries = useMemo(() => {
    // First apply search term
    let filtered = refineries.filter(refinery => 
      refinery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refinery.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refinery.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Then apply filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(refinery => {
        return activeFilters.every(filter => {
          switch (filter.type) {
            case 'region':
              return refinery.region?.includes(filter.value);
            case 'status':
              return refinery.status?.toLowerCase() === filter.value.toLowerCase();
            case 'capacity':
              if (filter.value === 'high') {
                return (refinery.capacity || 0) > 500000;
              } else if (filter.value === 'medium') {
                return (refinery.capacity || 0) > 200000 && (refinery.capacity || 0) <= 500000;
              } else {
                return (refinery.capacity || 0) <= 200000;
              }
            default:
              return true;
          }
        });
      });
    }
    
    // Then apply sorting
    if (sortOption.value !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortOption.value as keyof Refinery];
        const bValue = b[sortOption.value as keyof Refinery];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOption.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOption.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    return filtered;
  }, [refineries, searchTerm, activeFilters, sortOption]);
  
  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant = "default";
    
    switch(status.toLowerCase()) {
      case 'operational':
      case 'active':
        variant = "success";
        break;
      case 'maintenance':
      case 'planned':
        variant = "warning";
        break;
      case 'offline':
      case 'shutdown':
        variant = "destructive";
        break;
      default:
        variant = "secondary";
    }
    
    return <Badge variant={variant as any}>{status}</Badge>;
  };

  // Capacity formatter
  const formatCapacity = (capacity: number | null | undefined) => {
    if (!capacity) return 'N/A';
    
    if (capacity >= 1000000) {
      return `${(capacity / 1000000).toFixed(2)} M bpd`;
    } else {
      return `${(capacity / 1000).toFixed(0)} K bpd`;
    }
  };

  // Get capacity level class
  const getCapacityClass = (capacity: number | null | undefined) => {
    if (!capacity) return 'bg-gray-300';
    
    if (capacity > 800000) return 'bg-indigo-600';
    if (capacity > 500000) return 'bg-primary';
    if (capacity > 300000) return 'bg-amber-500';
    if (capacity > 100000) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get capacity percentage
  const getCapacityPercentage = (capacity: number | null | undefined) => {
    if (!capacity) return 0;
    // Use 1.2M as the max capacity for scale
    return Math.min(100, (capacity / 1200000) * 100);
  };
  
  // Get region icon
  const getRegionIcon = (region: string | undefined) => {
    if (!region) return <Globe className="h-5 w-5" />;
    
    if (region.includes('Middle East')) return <Droplets className="h-5 w-5 text-amber-500" />;
    if (region.includes('Asia')) return <Globe className="h-5 w-5 text-blue-500" />;
    if (region.includes('Europe')) return <Globe className="h-5 w-5 text-green-500" />;
    if (region.includes('North America')) return <Globe className="h-5 w-5 text-red-500" />;
    if (region.includes('Africa')) return <Globe className="h-5 w-5 text-amber-600" />;
    if (region.includes('South America')) return <Globe className="h-5 w-5 text-purple-500" />;
    
    return <Globe className="h-5 w-5" />;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header section with stats */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-muted">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Factory className="h-8 w-8 mr-2 text-primary" />
              Global Refineries Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {loading ? 'Loading refinery intelligence...' : `Monitoring ${refineries.length} refineries globally with ${formatCapacity(totalCapacity)} total processing capacity`}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Button 
              variant="outline" 
              onClick={updateRefineryWithRealData} 
              disabled={isUpdating}
              className="border-primary/20 text-primary hover:text-primary/90"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Refinery
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-transparent border-primary/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Refineries</p>
                <h3 className="text-2xl font-bold">{refineries.length}</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Factory className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-transparent border-primary/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing Capacity</p>
                <h3 className="text-2xl font-bold">{formatCapacity(totalCapacity)}</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-transparent border-primary/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Refineries</p>
                <h3 className="text-2xl font-bold">{refineryStats.active}</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-transparent border-primary/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Maintenance</p>
                <h3 className="text-2xl font-bold">{refineryStats.maintenance}</h3>
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Settings className="h-4 w-4 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Filters and View Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, country, region..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 rounded-full">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Region</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['Middle East', 'Asia Pacific', 'North America', 'Europe', 'Africa', 'South America'].map(region => (
                <DropdownMenuItem 
                  key={region}
                  onClick={() => toggleFilter({type: 'region', value: region, label: region})}
                  className={
                    activeFilters.some(f => f.type === 'region' && f.value === region) 
                      ? 'bg-primary/10'
                      : ''
                  }
                >
                  {getRegionIcon(region)}
                  <span className="ml-2">{region}</span>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => toggleFilter({type: 'status', value: 'operational', label: 'Operational'})}
                className={
                  activeFilters.some(f => f.type === 'status' && f.value === 'operational') 
                    ? 'bg-primary/10'
                    : ''
                }
              >
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Operational
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => toggleFilter({type: 'status', value: 'maintenance', label: 'Maintenance'})}
                className={
                  activeFilters.some(f => f.type === 'status' && f.value === 'maintenance') 
                    ? 'bg-primary/10'
                    : ''
                }
              >
                <div className="h-2 w-2 rounded-full bg-amber-500 mr-2" />
                Maintenance
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => toggleFilter({type: 'status', value: 'offline', label: 'Offline'})}
                className={
                  activeFilters.some(f => f.type === 'status' && f.value === 'offline') 
                    ? 'bg-primary/10'
                    : ''
                }
              >
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                Offline
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Capacity</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => toggleFilter({type: 'capacity', value: 'high', label: 'High Capacity'})}
                className={
                  activeFilters.some(f => f.type === 'capacity' && f.value === 'high') 
                    ? 'bg-primary/10'
                    : ''
                }
              >
                <Zap className="h-4 w-4 text-indigo-500 mr-2" />
                High (&gt;500K bpd)
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => toggleFilter({type: 'capacity', value: 'medium', label: 'Medium Capacity'})}
                className={
                  activeFilters.some(f => f.type === 'capacity' && f.value === 'medium') 
                    ? 'bg-primary/10'
                    : ''
                }
              >
                <Zap className="h-4 w-4 text-amber-500 mr-2" />
                Medium (200K-500K bpd)
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => toggleFilter({type: 'capacity', value: 'low', label: 'Low Capacity'})}
                className={
                  activeFilters.some(f => f.type === 'capacity' && f.value === 'low') 
                    ? 'bg-primary/10'
                    : ''
                }
              >
                <Zap className="h-4 w-4 text-gray-500 mr-2" />
                Low (&lt;200K bpd)
              </DropdownMenuItem>
              
              {activeFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <span>{sortOption.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Sort Refineries</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => setSortOption({ label: 'Default', value: 'none', direction: 'asc' })}
                className={sortOption.value === 'none' ? 'bg-primary/10' : ''}
              >
                Default
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setSortOption({ label: 'Name (A-Z)', value: 'name', direction: 'asc' })}
                className={sortOption.value === 'name' && sortOption.direction === 'asc' ? 'bg-primary/10' : ''}
              >
                Name (A-Z)
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setSortOption({ label: 'Name (Z-A)', value: 'name', direction: 'desc' })}
                className={sortOption.value === 'name' && sortOption.direction === 'desc' ? 'bg-primary/10' : ''}
              >
                Name (Z-A)
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setSortOption({ label: 'Capacity (High-Low)', value: 'capacity', direction: 'desc' })}
                className={sortOption.value === 'capacity' && sortOption.direction === 'desc' ? 'bg-primary/10' : ''}
              >
                Capacity (High-Low)
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setSortOption({ label: 'Capacity (Low-High)', value: 'capacity', direction: 'asc' })}
                className={sortOption.value === 'capacity' && sortOption.direction === 'asc' ? 'bg-primary/10' : ''}
              >
                Capacity (Low-High)
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setSortOption({ label: 'Country (A-Z)', value: 'country', direction: 'asc' })}
                className={sortOption.value === 'country' && sortOption.direction === 'asc' ? 'bg-primary/10' : ''}
              >
                Country (A-Z)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Tabs 
            defaultValue="grid" 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as ViewMode)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grid" className="flex items-center gap-1">
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <ListFilter className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart4 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-muted/40 p-3 rounded-md">
          <span className="text-sm font-medium mr-2">Active Filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {filter.label}
              <button 
                className="ml-1 hover:bg-muted rounded-full"
                onClick={() => toggleFilter(filter)}
              >
                ×
              </button>
            </Badge>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs h-7 ml-auto"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Content Area for Each View */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading global refinery data...</p>
        </div>
      ) : filteredRefineries.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Factory className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No refineries found</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {searchTerm || activeFilters.length > 0 
              ? `No refineries match your current filters. Try adjusting your search criteria.` 
              : 'No refineries are currently available in the system.'}
          </p>
          {(searchTerm || activeFilters.length > 0) && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRefineries.map((refinery) => (
                <Card key={refinery.id} className="hover:shadow-md transition-all duration-200 group overflow-hidden">
                  <div className="relative">
                    {/* Background image based on refinery region */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-15 h-32"
                      style={{ 
                        backgroundImage: `url(${
                          refinery.region?.includes("Middle East") ? "https://images.unsplash.com/photo-1605023040084-89c87644e368?w=600&auto=format" : 
                          refinery.region?.includes("Asia") ? "https://images.unsplash.com/photo-1500477967233-53333be64072?w=600&auto=format" : 
                          refinery.region?.includes("Europe") ? "https://images.unsplash.com/photo-1552128427-2e5de3b3d614?w=600&auto=format" : 
                          refinery.region?.includes("North America") ? "https://images.unsplash.com/photo-1532408840957-031d8034aeef?w=600&auto=format" : 
                          refinery.region?.includes("Africa") ? "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=600&auto=format" :
                          refinery.region?.includes("South America") ? "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&auto=format" :
                          "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format"
                        })`
                      }}
                    />
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            {/* Icon based on status */}
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                              refinery.status?.toLowerCase().includes('active') || refinery.status?.toLowerCase().includes('operational') 
                                ? 'bg-green-100 text-green-600' :
                              refinery.status?.toLowerCase().includes('maintenance') || refinery.status?.toLowerCase().includes('planned') 
                                ? 'bg-orange-100 text-orange-600' :
                              refinery.status?.toLowerCase().includes('offline') || refinery.status?.toLowerCase().includes('shutdown') 
                                ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <Factory className="h-4 w-4" />
                            </div>
                            <span className="truncate">{refinery.name}</span>
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            {getRegionIcon(refinery.region)}
                            <span className="ml-1.5 truncate">{refinery.country}, {refinery.region}</span>
                          </CardDescription>
                        </div>
                        {renderStatusBadge(refinery.status || 'Unknown')}
                      </div>
                    </CardHeader>
                  </div>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Processing Capacity:</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-medium text-primary">
                                  {formatCapacity(refinery.capacity)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{refinery.capacity?.toLocaleString()} barrels per day</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {refinery.capacity && (
                          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${getCapacityClass(refinery.capacity)}`}
                              style={{ 
                                width: `${getCapacityPercentage(refinery.capacity)}%` 
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Operator:</span>
                          <p className="font-medium truncate">
                            {refinery.operator || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium truncate">
                            {refinery.type || 'Standard'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Coordinates:</span>
                        <div className="font-medium flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{refinery.lat}, {refinery.lng}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4">
                    <Link href={`/refineries/${refinery.id}`} className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full group hover:border-primary hover:bg-primary/5 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details 
                        <span className="ml-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-card rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Refinery</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRefineries.map((refinery) => (
                    <TableRow key={refinery.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                            refinery.status?.toLowerCase().includes('active') || refinery.status?.toLowerCase().includes('operational') 
                              ? 'bg-green-100 text-green-600' :
                            refinery.status?.toLowerCase().includes('maintenance') || refinery.status?.toLowerCase().includes('planned') 
                              ? 'bg-orange-100 text-orange-600' :
                            refinery.status?.toLowerCase().includes('offline') || refinery.status?.toLowerCase().includes('shutdown') 
                              ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <Factory className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{refinery.name}</div>
                            <div className="text-xs text-muted-foreground">{refinery.country}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getRegionIcon(refinery.region)}
                          <span className="ml-2">{refinery.region}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(refinery.status || 'Unknown')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {formatCapacity(refinery.capacity)}
                        </div>
                        <div className="w-24 ml-auto mt-1 bg-muted h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getCapacityClass(refinery.capacity)}`}
                            style={{ width: `${getCapacityPercentage(refinery.capacity)}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/refineries/${refinery.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          

          
          {/* Analytics View */}
          {viewMode === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Capacity Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of refinery processing capacity by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(refineryStats.regions).map(([region, count]) => {
                      const regionalCapacity = filteredRefineries
                        .filter(r => r.region === region)
                        .reduce((sum, refinery) => sum + (refinery.capacity || 0), 0);
                      
                      const percentOfTotal = totalCapacity 
                        ? (regionalCapacity / totalCapacity * 100).toFixed(1) 
                        : '0';
                        
                      return (
                        <div key={region} className="space-y-1">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              {getRegionIcon(region)}
                              <span className="ml-2 font-medium">{region}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-sm">
                                {formatCapacity(regionalCapacity)}
                              </span>
                              <Badge variant="outline">
                                {percentOfTotal}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={parseFloat(percentOfTotal)} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Operational Status</CardTitle>
                  <CardDescription>
                    Current status of refineries worldwide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <BarChart4 className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-muted-foreground">
                          Analytics charts coming soon
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This will display detailed charts of refinery data
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-card border rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {refineryStats.active}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Operational
                      </div>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {refineryStats.maintenance}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Maintenance
                      </div>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {refineryStats.offline}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Offline
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}