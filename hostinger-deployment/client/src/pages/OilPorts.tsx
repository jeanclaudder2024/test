import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Droplets,
  Search,
  Filter,
  MapPin,
  Ship,
  LayoutGrid,
  Table2,
  Globe,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { PaginationContent } from '@/components/ui/pagination';
import { OilPortCard } from '@/components/ports/OilPortCard';
import { PortWithVessels, PaginationResult } from '@/types';
import { regionOptions } from '@/lib/constants';

interface OilPortWithVessels extends PortWithVessels {
  nearbyVessels: Array<{
    vessels: {
      id: number;
      name: string;
      vesselType: string;
      flag: string;
      currentLat: string | number | null;
      currentLng: string | number | null;
      [key: string]: any;
    };
    distance: number;
  }>;
}

export default function OilPorts() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [viewMode, setViewMode] = useState<string>("grid");
  const [, navigate] = useLocation();
  
  // Page size for pagination
  const pageSize = 8;
  
  // Reset page when region changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, searchTerm]);
  
  // Fetch oil ports data with nearby vessels
  const { 
    data: portsData, 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/ports', 'oil', selectedRegion],
    queryFn: async () => {
      const url = new URL('/api/ports', window.location.origin);
      url.searchParams.append('type', 'oil');
      
      if (selectedRegion !== 'all') {
        url.searchParams.append('region', selectedRegion);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error fetching oil ports: ${response.statusText}`);
      }
      
      const ports = await response.json();
      
      // Now fetch nearby vessels for each port
      const portsWithVessels = await Promise.all(
        ports.map(async (port: any) => {
          try {
            const vesselResponse = await fetch(`/api/port-vessels/${port.id}`);
            
            if (!vesselResponse.ok) {
              return {
                ...port,
                nearbyVessels: []
              };
            }
            
            const vesselData = await vesselResponse.json();
            return {
              ...port,
              nearbyVessels: vesselData.vessels || []
            };
          } catch (err) {
            console.error(`Error fetching vessels for port ${port.id}:`, err);
            return {
              ...port,
              nearbyVessels: []
            };
          }
        })
      );
      
      return portsWithVessels;
    },
    refetchOnWindowFocus: false
  });
  
  // Filter and sort ports
  const processedPorts = useMemo(() => {
    if (!portsData) return [];
    
    // Filter by search term
    let filtered = [...portsData];
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(port => 
        port.name.toLowerCase().includes(search) ||
        port.country.toLowerCase().includes(search) ||
        port.region.toLowerCase().includes(search)
      );
    }
    
    // Sort
    return filtered.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'vesselCount') {
        valueA = a.nearbyVessels?.length || 0;
        valueB = b.nearbyVessels?.length || 0;
      } else if (sortBy === 'capacity') {
        valueA = a.capacity || 0;
        valueB = b.capacity || 0;
      } else {
        valueA = (a[sortBy] || '').toString().toLowerCase();
        valueB = (b[sortBy] || '').toString().toLowerCase();
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return sortOrder === 'asc' 
          ? (valueA as number) - (valueB as number) 
          : (valueB as number) - (valueA as number);
      }
    });
  }, [portsData, searchTerm, sortBy, sortOrder]);
  
  // Pagination
  const paginatedPorts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return processedPorts.slice(start, end);
  }, [processedPorts, currentPage, pageSize]);
  
  const totalPages = Math.ceil((processedPorts?.length || 0) / pageSize);
  
  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <div className="flex items-center gap-2">
                <Droplets className="h-7 w-7" />
                <span>Oil Ports</span>
              </div>
            </h1>
            <p className="text-muted-foreground mt-1">
              Specialized terminals handling crude oil, refined products, and LNG shipments
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-1 bg-neutral-200"></div>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-3 space-y-4">
                <Skeleton className="h-[160px] w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Oil Ports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was a problem loading the oil ports data.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">
            <div className="flex items-center gap-2">
              <Droplets className="h-7 w-7" />
              <span>Oil Ports</span>
            </div>
          </h1>
          <p className="text-muted-foreground mt-1">
            Specialized terminals handling crude oil, refined products, and LNG shipments
          </p>
        </div>
      </div>
      
      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select
            value={selectedRegion}
            onValueChange={setSelectedRegion}
          >
            <SelectTrigger className="w-full sm:w-[200px] gap-2">
              <Globe className="h-4 w-4" />
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regionOptions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Tabs
            value={viewMode}
            onValueChange={setViewMode}
            className="hidden md:flex space-x-1"
          >
            <TabsList className="h-9">
              <TabsTrigger value="grid" className="px-3">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="table" className="px-3">
                <Table2 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-full sm:w-[180px] gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <SelectValue placeholder="Sort by Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="country">Sort by Country</SelectItem>
              <SelectItem value="capacity">Sort by Capacity</SelectItem>
              <SelectItem value="vesselCount">Sort by Vessel Count</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
          </Button>
        </div>
      </div>
      
      {/* Results info */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          Showing {processedPorts.length} oil ports
          {selectedRegion !== 'all' && ' in ' + regionOptions.find(r => r.value === selectedRegion)?.label}
          {searchTerm && ' matching "' + searchTerm + '"'}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={handlePageChange}
          className="hidden md:flex"
        />
      </div>
      
      {/* Oil port grid or table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedPorts.map((port: OilPortWithVessels) => (
            <OilPortCard key={port.id} port={port} />
          ))}
          
          {paginatedPorts.length === 0 && (
            <div className="col-span-full flex justify-center py-12">
              <div className="text-center">
                <Ship className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">No Oil Ports Found</h3>
                <p className="text-muted-foreground max-w-md">
                  No oil ports match your current filters. Try changing your search terms or region selection.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Country</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Region</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Nearby Vessels</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPorts.map((port: OilPortWithVessels) => (
                  <tr key={port.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{port.name}</td>
                    <td className="px-4 py-3 text-sm">{port.country}</td>
                    <td className="px-4 py-3 text-sm">{port.region}</td>
                    <td className="px-4 py-3 text-sm">
                      {port.capacity ? port.capacity.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        port.status === 'active' ? 'bg-green-100 text-green-800' : 
                        port.status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 
                        'bg-neutral-100 text-neutral-800'
                      }`}>
                        {port.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {port.nearbyVessels?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/ports/${port.id}`)}>
                        <MapPin className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {paginatedPorts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <Ship className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">No oil ports found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      {/* Mobile Pagination */}
      <div className="mt-6 flex md:hidden justify-center">
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onChange={handlePageChange}
          className="flex-wrap"
        />
      </div>
    </div>
  );
}