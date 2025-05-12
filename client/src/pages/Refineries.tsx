import { useState, useEffect, useMemo } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { Refinery } from '@/types';
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
import { Link, useLocation } from 'wouter';
import { 
  Factory, 
  Search, 
  Plus, 
  RefreshCw, 
  Filter, 
  Map, 
  ListFilter, 
  ArrowUpDown, 
  Droplets, 
  BarChart4,
  Globe,
  Grid3X3,
  Info,
  Map as MapIcon,
  Eye,
  Settings,
  Download,
  Share2,
  MoreHorizontal,
  FileBarChart,
  Zap,
  Activity,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { REGIONS } from '../../../shared/constants';
import { Skeleton } from '@/components/ui/skeleton';
import RefineryCard from '@/components/refineries/RefineryCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Type for refinery view mode
type ViewMode = 'grid' | 'list' | 'map' | 'analytics';

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

// Define columns for the data table
const columns = [
  {
    accessorKey: "name",
    header: "Refinery Name",
    cell: ({ row }: any) => {
      const refinery = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Factory className="h-4 w-4 text-primary" />
          <span className="font-medium">{refinery.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row }: any) => {
      const region = row.getValue("region") as string;
      return (
        <Badge variant="outline" className="bg-secondary/30">
          {region}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status") as string;
      let variant = "default";
      
      if (status?.toLowerCase().includes('active') || status?.toLowerCase().includes('operational')) {
        variant = "success";
      } else if (status?.toLowerCase().includes('maintenance') || status?.toLowerCase().includes('planned')) {
        variant = "warning";
      } else if (status?.toLowerCase().includes('offline') || status?.toLowerCase().includes('shutdown')) {
        variant = "destructive";
      }
      
      return (
        <Badge variant={variant as any} className={variant === "success" ? "bg-green-500 text-white" : ""}>
          {status || 'Unknown'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity (bpd)",
    cell: ({ row }: any) => {
      const capacity = row.getValue("capacity") as number;
      return capacity ? capacity.toLocaleString() : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const refinery = row.original;
      const [, navigate] = useLocation();
      
      return (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/refineries/${refinery.id}`)}
        >
          Details <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      );
    },
  },
];

export default function Refineries() {
  const { refineries, loading } = useDataStream();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOption, setSortOption] = useState<SortOption>({ 
    label: 'Default', 
    value: 'none', 
    direction: 'asc' 
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Page size for pagination
  const pageSize = 12;
  
  // Reset page when region changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, searchTerm]);
  
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
  
  // Filter and paginate refineries
  const filteredRefineries = useMemo(() => {
    // First apply region filter
    let filtered = refineries;
    
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(refinery => 
        refinery.region === selectedRegion
      );
    }
    
    // Then apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(refinery => 
        refinery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refinery.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (refinery.region && refinery.region.toLowerCase().includes(searchTerm.toLowerCase()))
      );
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
  }, [refineries, searchTerm, selectedRegion, sortOption]);
  
  // Calculate pagination
  const totalItems = filteredRefineries.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Get current page items
  const currentRefineries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRefineries.slice(startIndex, startIndex + pageSize);
  }, [filteredRefineries, currentPage, pageSize]);
  
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
  
  // If we're loading, return a loading state
  if (loading) {
    return <RefineryLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refineries Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze {refineries.length} global refineries with {formatCapacity(totalCapacity)} processing capacity
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={updateRefineryWithRealData} 
            disabled={isUpdating}
            className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
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
          <Button variant="outline" onClick={() => navigate("/refineries/import")}>
            <Database className="mr-2 h-4 w-4" /> Import Refineries
          </Button>
          <Button onClick={() => navigate("/refineries/new")}>
            <Factory className="mr-2 h-4 w-4" /> Add New Refinery
          </Button>
        </div>
      </div>

      <Tabs defaultValue={viewMode} className="mb-6" onValueChange={(value) => setViewMode(value as ViewMode)}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="grid">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="table">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="map">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart4 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search refineries..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select defaultValue={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {Object.entries(refineryStats.regions).map(([region]) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="grid" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Refinery Directory</CardTitle>
              <CardDescription>
                Managing {totalItems} refineries {selectedRegion !== 'all' && `in ${selectedRegion}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentRefineries.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentRefineries.map((refinery) => (
                      <div key={refinery.id} className="h-full">
                        <RefineryCard
                          refinery={refinery}
                          vessels={[]}
                          isLoading={false}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} refineries
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Factory className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No Refineries Found</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {searchTerm 
                      ? `No refineries matching "${searchTerm}"` 
                      : selectedRegion === 'all' 
                        ? "There are no refineries registered in the system." 
                        : `No refineries found in the ${selectedRegion} region.`}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  )}
                  {selectedRegion !== 'all' && !searchTerm && (
                    <Button variant="outline" onClick={() => setSelectedRegion('all')}>
                      View All Regions
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="table" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Refinery Directory</CardTitle>
                  <CardDescription>
                    Complete list of refineries in our system
                  </CardDescription>
                </div>
                <div className="flex gap-2 items-center">
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentRefineries.length > 0 ? (
                <>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Refinery</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Capacity</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRefineries.map((refinery) => (
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
                                  <div className="text-xs text-muted-foreground">{refinery.operator || 'Unknown'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{refinery.country}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-secondary/30">
                                {refinery.region}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {renderStatusBadge(refinery.status || 'Unknown')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-medium">
                                {formatCapacity(refinery.capacity)}
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
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} refineries
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Factory className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No Refineries Found</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {searchTerm 
                      ? `No refineries matching "${searchTerm}"` 
                      : selectedRegion === 'all' 
                        ? "There are no refineries registered in the system." 
                        : `No refineries found in the ${selectedRegion} region.`}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  )}
                  {selectedRegion !== 'all' && !searchTerm && (
                    <Button variant="outline" onClick={() => setSelectedRegion('all')}>
                      View All Regions
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="map" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Global Refinery Map</CardTitle>
              <CardDescription>
                Interactive map showing all refineries with geographical distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-muted-foreground">
                      Interactive map view coming soon
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will display all refineries on a world map with clustering and filtering
                    </p>
                  </div>
                  <Button variant="outline">Initialize Map</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
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
                    const regionalCapacity = refineries
                      .filter(r => r.region === region)
                      .reduce((sum, refinery) => sum + (refinery.capacity || 0), 0);
                    
                    const percentOfTotal = totalCapacity 
                      ? (regionalCapacity / totalCapacity * 100).toFixed(1) 
                      : '0';
                      
                    return (
                      <div key={region} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{region}</span>
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
                <div className="grid grid-cols-3 gap-4 mb-6">
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
                
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <BarChart4 className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-muted-foreground">
                        Detailed analytics charts coming soon
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This will display regional distribution, capacity trends, and operational efficiency
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Key Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="bg-card">
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
        
        <Card className="bg-card">
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
        
        <Card className="bg-card">
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
        
        <Card className="bg-card">
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
  );
}

function RefineryLoadingSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      
      <Skeleton className="h-12 w-full mb-6" />
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden h-full">
                <div className="h-1 bg-gray-200" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}