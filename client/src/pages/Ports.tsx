import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link as WouterLink } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, 
  ChevronLeft,
  MapPin, 
  Anchor, 
  Ship, 
  GalleryVerticalEnd,
  Building2,
  Database,
  Search,
  Filter,
  ArrowUpDown,
  Map,
  Grid3x3,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { REGIONS } from '../../../shared/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Port, Vessel } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PortCard from '@/components/ports/PortCard';

// Define columns for the data table
const columns: ColumnDef<Port>[] = [
  {
    accessorKey: "name",
    header: "Port Name",
    cell: ({ row }) => {
      const port = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Anchor className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{port.name}</span>
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
    cell: ({ row }) => {
      const region = row.getValue("region") as string;
      return (
        <Badge variant="outline" className="bg-secondary/30">
          {region}
        </Badge>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <span className="capitalize">{type}</span>;
    },
  },
  {
    accessorKey: "vesselCount",
    header: "Vessels",
    cell: ({ row }) => {
      const vesselCount = row.getValue("vesselCount") as number;
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
          {vesselCount || 0}
        </Badge>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "destructive"} className={status === "active" ? "bg-green-500 text-white" : ""}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity (TEU/tons)",
    cell: ({ row }) => {
      const capacity = row.getValue("capacity") as number;
      return capacity ? capacity.toLocaleString() : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const port = row.original;
      const [, navigate] = useLocation();
      
      return (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/ports/${port.id}`)}
        >
          Details <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      );
    },
  },
];

interface PortWithVesselCount extends Port {
  vesselCount: number;
  connectedRefineries: number;
  totalCargo: number;
  sampleVessel?: {
    name: string;
    type: string;
    flag: string;
  } | null;
  nearbyVessels?: any[];
}

export default function Ports() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [viewMode, setViewMode] = useState<string>("grid");
  const [, navigate] = useLocation();
  
  // Page size for pagination
  const pageSize = 12;
  
  // Reset page when region changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, searchTerm]);
  
  // Fetch ports data with subscription limits
  const { 
    data: portsData = [], 
    isLoading: isPortsLoading, 
    isError: isPortsError,
    error: portsError,
    refetch: refetchPorts
  } = useQuery({
    queryKey: ['/api/ports'], // Use subscription-limited endpoint
    staleTime: 0, // Always fresh data
  });

  // Fetch vessels data for connections
  const { 
    data: vesselsData = [], 
    isLoading: isVesselsLoading,
  } = useQuery({
    queryKey: ['/api/vessels'],
    staleTime: 0, // Always fresh data
  });

  // Process ports with vessel connections
  const allPorts = useMemo(() => {
    if (!portsData || !vesselsData) return [];
    
    // Handle both API response formats (direct array or object with ports property)
    const ports = portsData.ports || portsData;
    if (!Array.isArray(ports)) return [];
    
    return ports.map((port: Port) => {
      // Find vessels connected to this port
      const departingVessels = vesselsData.filter((vessel: any) => {
        try {
          return vessel.departurePort && Number(vessel.departurePort) === port.id;
        } catch (e) {
          return false;
        }
      });
      
      const arrivingVessels = vesselsData.filter((vessel: any) => {
        try {
          return vessel.destinationPort && Number(vessel.destinationPort) === port.id;
        } catch (e) {
          return false;
        }
      });

      // Create combined vessel connections (avoiding duplicates)
      const allConnectedVessels: any[] = [];
      
      // Add departing vessels
      departingVessels.forEach((vessel: any) => {
        allConnectedVessels.push({
          id: vessel.id,
          name: vessel.name || 'Unknown Vessel',
          type: vessel.vesselType || 'Unknown',
          imo: vessel.imo || 'N/A',
          connectionType: 'Departing',
          distance: 0
        });
      });

      // Add arriving vessels (avoiding duplicates)
      arrivingVessels.forEach((vessel: any) => {
        if (!allConnectedVessels.find(v => v.id === vessel.id)) {
          allConnectedVessels.push({
            id: vessel.id,
            name: vessel.name || 'Unknown Vessel',
            type: vessel.vesselType || 'Unknown',
            imo: vessel.imo || 'N/A',
            connectionType: 'Arriving',
            distance: 0
          });
        }
      });

      return {
        ...port,
        vesselCount: allConnectedVessels.length,
        connectedRefineries: 0, // Calculate if needed
        totalCargo: 0, // Calculate if needed
        sampleVessel: allConnectedVessels.length > 0 ? {
          name: allConnectedVessels[0].name,
          type: allConnectedVessels[0].type,
          flag: 'Unknown'
        } : null,
        // For backwards compatibility with PortCard
        nearbyVessels: allConnectedVessels.map(vessel => ({
          vessels: {
            name: vessel.name,
            type: vessel.type,
            imo: vessel.imo,
            connectionType: vessel.connectionType
          },
          distance: vessel.distance || 0
        }))
      } as PortWithVesselCount;
    });
  }, [portsData, vesselsData]);

  const isLoading = isPortsLoading || isVesselsLoading;
  const isError = isPortsError;
  const error = portsError;
  const refetch = refetchPorts;

  // Apply region filtering client-side
  const regionFilteredPorts = selectedRegion === 'all' 
    ? (allPorts as PortWithVesselCount[]) 
    : (allPorts as PortWithVesselCount[]).filter((port: PortWithVesselCount) => port.region === selectedRegion);

  // Apply sorting client-side
  const sortedPorts = [...regionFilteredPorts].sort((a: PortWithVesselCount, b: PortWithVesselCount) => {
    const getValue = (port: PortWithVesselCount, key: string) => {
      switch (key) {
        case 'name': return port.name;
        case 'country': return port.country;
        case 'capacity': return port.capacity || 0;
        case 'vesselCount': return port.vesselCount || 0;
        default: return port.name;
      }
    };

    const aValue = getValue(a, sortBy);
    const bValue = getValue(b, sortBy);

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Apply pagination client-side
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const ports = sortedPorts.slice(startIndex, endIndex);
  
  const totalItems = sortedPorts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Filter ports by search term (client-side filtering)
  const filteredPorts = ports.filter((port: PortWithVesselCount) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      port.name.toLowerCase().includes(search) ||
      port.country.toLowerCase().includes(search) ||
      ((port as any).type && (port as any).type.toLowerCase().includes(search))
    );
  });
  
  // If we're loading or have an error, return a loading state
  if (isLoading) {
    return <PortsLoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Ports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was a problem loading the ports data.</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ports Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all port facilities with real-time vessel information
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate("/ports/proximity")} className="bg-blue-50 border-blue-200 hover:bg-blue-100">
            <Map className="mr-2 h-4 w-4 text-blue-600" /> Vessel-Port Proximity
          </Button>
          <Button variant="outline" onClick={() => navigate("/ports/import")}>
            <Database className="mr-2 h-4 w-4" /> Import All Ports
          </Button>
          <Button onClick={() => navigate("/ports/new")}>
            <Building2 className="mr-2 h-4 w-4" /> Add New Port
          </Button>
        </div>
      </div>

      <Tabs defaultValue={viewMode} className="mb-6" onValueChange={setViewMode}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="grid">
              <Grid3x3 className="h-4 w-4 mr-2" />
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
          </TabsList>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ports..."
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
                {REGIONS.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="grid" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Port Directory</CardTitle>
              <CardDescription>
                Managing {totalItems} ports {selectedRegion !== 'all' && `in ${
                  REGIONS.find(r => r.id === selectedRegion)?.name || selectedRegion
                }`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPorts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPorts.map((port: PortWithVesselCount) => (
                      <div key={port.id} className="h-full">
                        <PortCard
                          port={port}
                          vessels={(port.nearbyVessels || []).map((vessel: any) => ({
                            vessels: vessel.vessels,
                            distance: vessel.distance
                          }))}
                          isLoading={false}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} ports
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
                  <Anchor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No Ports Found</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {searchTerm 
                      ? `No ports matching "${searchTerm}"` 
                      : selectedRegion === 'all' 
                        ? "There are no ports registered in the system." 
                        : `No ports found in the ${REGIONS.find(r => r.id === selectedRegion)?.name || selectedRegion} region.`}
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
                  <CardTitle>Port Directory</CardTitle>
                  <CardDescription>
                    Complete list of ports in our system
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPorts.length > 0 ? (
                <>
                  <DataTable columns={columns} data={filteredPorts} />
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} ports
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
                  <Anchor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No Ports Found</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {searchTerm 
                      ? `No ports matching "${searchTerm}"` 
                      : selectedRegion === 'all' 
                        ? "There are no ports registered in the system." 
                        : `No ports found in the ${REGIONS.find(r => r.id === selectedRegion)?.name || selectedRegion} region.`}
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
              <CardTitle>Port Locations</CardTitle>
              <CardDescription>
                Geographical view of all ports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border h-[600px] flex items-center justify-center bg-muted/20">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Map View Coming Soon</p>
                  <p className="text-sm text-muted-foreground">Try the Grid or Table view to see port data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Tabs defaultValue="stats" className="mb-6">
        <TabsList>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Port Statistics</CardTitle>
              <CardDescription>
                Key metrics and operational data for all ports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Total Ports</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">
                      {totalItems}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Across {new Set(ports?.map((p: Port) => p.country)).size || 0} countries
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Active Ports</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">
                      {ports?.filter((p: Port) => p.status === 'active').length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Currently operational ports
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-amber-500" />
                      <h3 className="font-medium">Total Vessels</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">
                      {ports?.reduce((sum: number, p: PortWithVesselCount) => sum + (p.vesselCount || 0), 0) || 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vessels currently near ports
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <GalleryVerticalEnd className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium">Total Capacity</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">
                      {ports 
                        ? ports.reduce((sum: number, port: Port) => sum + (port.capacity || 0), 0).toLocaleString()
                        : 0
                      }
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Combined port capacity
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-semibold mb-4">Port Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {['oil', 'commercial', 'container', 'bulk'].map((type) => {
                    const typeCount = ports.filter((p: Port) => 
                      (p as any).type?.toLowerCase() === type.toLowerCase()
                    ).length;
                    
                    return (
                      <Card key={type} className="overflow-hidden">
                        <div className={`h-1 ${getTypeColor(type)}`} />
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium capitalize">{type} Ports</h4>
                            <Badge variant="outline">{typeCount}</Badge>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {typeCount > 0 
                              ? `${Math.round(typeCount / ports.length * 100)}% of all ports` 
                              : 'No ports of this type'}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>Ports by Region</CardTitle>
              <CardDescription>
                Distribution of ports across global regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {REGIONS.map((region) => {
                  const regionPorts = ports.filter((p: Port) => p.region === region.id);
                  return (
                    <Card key={region.id} className="overflow-hidden">
                      <div className={`h-1 ${getRegionColor(region.name)}`} />
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{region.name}</h4>
                          <Badge variant="outline">{regionPorts.length}</Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {regionPorts.length > 0 
                            ? `${regionPorts.filter((p: Port) => p.status === 'active').length} active ports` 
                            : 'No ports in this region'}
                        </div>
                        {regionPorts.length > 0 && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto mt-2 text-xs"
                            onClick={() => {
                              setSelectedRegion(region.id);
                              setViewMode('grid');
                            }}
                          >
                            View all ports in {region.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to get a color based on region
function getRegionColor(region: string): string {
  const colorMap: Record<string, string> = {
    'North America': 'bg-red-500',
    'South America': 'bg-yellow-500',
    'Europe': 'bg-blue-500',
    'Africa': 'bg-green-500',
    'Middle East': 'bg-amber-500',
    'Asia': 'bg-purple-500',
    'Oceania': 'bg-teal-500',
    'Asia-Pacific': 'bg-indigo-500',
    'Caribbean': 'bg-cyan-500',
    'Antarctic': 'bg-slate-500',
    'Baltic': 'bg-emerald-500',
    'Mediterranean': 'bg-orange-500',
    'global': 'bg-gray-500'
  };

  return colorMap[region] || 'bg-gray-500';
}

// Helper function to get a color based on port type
function getTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'oil':
      return 'bg-amber-500';
    case 'commercial':
      return 'bg-blue-500';
    case 'container':
      return 'bg-emerald-500';
    case 'bulk':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}

// Loading skeleton
function PortsLoadingSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="mb-6">
        <Skeleton className="h-10 w-80 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}