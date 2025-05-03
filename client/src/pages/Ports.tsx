import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, 
  MapPin, 
  Anchor, 
  Ship, 
  GalleryVerticalEnd,
  Building2
} from 'lucide-react';
import { REGIONS } from '../../../shared/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Port } from '../../../shared/schema';

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

export default function Ports() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [, navigate] = useLocation();
  
  // Fetch ports data
  const { 
    data: ports, 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['/api/ports', selectedRegion !== 'all' ? selectedRegion : null],
    queryFn: async () => {
      const url = selectedRegion === 'all' 
        ? '/api/ports' 
        : `/api/ports?region=${selectedRegion}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching ports: ${response.statusText}`);
      }
      
      return response.json();
    }
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ports Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all port facilities and their details
          </p>
        </div>
        <Button onClick={() => navigate("/ports/new")}>
          <Building2 className="mr-2 h-4 w-4" /> Add New Port
        </Button>
      </div>

      <Tabs defaultValue="map" className="mb-6">
        <TabsList>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="p-1">
          <Card>
            <CardHeader>
              <CardTitle>Port Locations</CardTitle>
              <CardDescription>
                Interactive map showing port locations and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[60vh] bg-muted/30 rounded-md flex items-center justify-center border">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">Map View Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    We're enhancing our port mapping capabilities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Port Directory</CardTitle>
                  <CardDescription>
                    Complete list of ports in our system
                  </CardDescription>
                </div>
                
                <div>
                  <select 
                    className="w-full sm:w-auto px-3 py-2 border rounded-md"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="all">All Regions</option>
                    {REGIONS.map((region: string) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ports && ports.length > 0 ? (
                <DataTable columns={columns} data={ports} />
              ) : (
                <div className="text-center py-12">
                  <Anchor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No Ports Found</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {selectedRegion === 'all' 
                      ? "There are no ports registered in the system." 
                      : `No ports found in the ${selectedRegion} region.`}
                  </p>
                  {selectedRegion !== 'all' && (
                    <Button variant="outline" onClick={() => setSelectedRegion('all')}>
                      View All Regions
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Port Statistics</CardTitle>
              <CardDescription>
                Key metrics and operational data for all ports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Total Ports</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">
                      {ports ? ports.length : 0}
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
                      {ports ? ports.filter((p: Port) => p.status === 'active').length : 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Currently operational ports
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <GalleryVerticalEnd className="h-5 w-5 text-amber-500" />
                      <h3 className="font-medium">Total Capacity</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">
                      {ports 
                        ? ports.reduce((sum, port) => sum + (port.capacity || 0), 0).toLocaleString()
                        : 0
                      }
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Combined port capacity in TEU/tons
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-semibold mb-4">Ports by Region</h3>
                {ports ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {REGIONS.map(region => {
                      const regionPorts = ports.filter(p => p.region === region);
                      return (
                        <Card key={region} className="overflow-hidden">
                          <div className={`h-1 ${getRegionColor(region)}`} />
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{region}</h4>
                              <Badge variant="outline">{regionPorts.length}</Badge>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              {regionPorts.length > 0 
                                ? `${regionPorts.filter(p => p.status === 'active').length} active ports` 
                                : 'No ports in this region'}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p>No data available</p>
                )}
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
            <div className="space-y-2">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}