import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, Calendar, Flag, Anchor, MapPin, Navigation, Droplets, Timer, AlertCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';

interface PortVesselsTableProps {
  portId: number;
  hideTitle?: boolean;
  maxVessels?: number;
  showFilters?: boolean;
}

interface VesselData {
  vessels: {
    id: number;
    name: string;
    vesselType: string;
    cargoType: string;
    flag: string;
    eta?: string;
    currentLat?: string;
    currentLng?: string;
    departurePort?: string;
    destinationPort?: string;
    cargoCapacity?: number;
  };
  distance: number;
}

const PortVesselsTable: React.FC<PortVesselsTableProps> = ({ 
  portId, 
  hideTitle = false, 
  maxVessels = 10,
  showFilters = true
}) => {
  const [sortField, setSortField] = useState<keyof VesselData | 'vessels.name' | 'vessels.vesselType'>('distance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch vessels at port
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/port-vessels', portId],
    queryFn: async () => {
      const response = await fetch(`/api/port-vessels/${portId}/vessels`);
      if (!response.ok) {
        throw new Error('Failed to fetch vessels at port');
      }
      return response.json();
    },
    enabled: !!portId,
    refetchInterval: 30000, // Refetch data every 30 seconds
  });

  // Filter and sort vessels
  const filteredVessels = React.useMemo(() => {
    if (!data?.vessels) return [];
    
    let vessels = [...data.vessels];
    
    // Apply vessel type filter
    if (vesselTypeFilter !== 'all') {
      vessels = vessels.filter(v => 
        v.vessels.vesselType?.toLowerCase().includes(vesselTypeFilter.toLowerCase())
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      vessels = vessels.filter(v => 
        v.vessels.name.toLowerCase().includes(query) ||
        v.vessels.cargoType?.toLowerCase().includes(query) ||
        v.vessels.departurePort?.toLowerCase().includes(query) ||
        v.vessels.flag?.toLowerCase().includes(query)
      );
    }
    
    // Sort vessels
    vessels.sort((a, b) => {
      let fieldA, fieldB;
      
      // Handle nested fields
      if (sortField === 'vessels.name') {
        fieldA = a.vessels.name;
        fieldB = b.vessels.name;
      } else if (sortField === 'vessels.vesselType') {
        fieldA = a.vessels.vesselType;
        fieldB = b.vessels.vesselType;
      } else {
        fieldA = a[sortField as keyof VesselData];
        fieldB = b[sortField as keyof VesselData];
      }
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      // Numeric comparison
      const numA = Number(fieldA) || 0;
      const numB = Number(fieldB) || 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
    
    // Limit number of vessels if maxVessels is set
    return maxVessels ? vessels.slice(0, maxVessels) : vessels;
  }, [data?.vessels, vesselTypeFilter, sortField, sortDirection, searchQuery, maxVessels]);
  
  // Toggle sort direction or set new sort field
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sort indicator icon
  const getSortIndicator = (field: typeof sortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        {!hideTitle && (
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ship className="h-5 w-5 mr-2 text-primary" />
              Vessels at Port
            </CardTitle>
            <CardDescription>
              Loading vessels...
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        {!hideTitle && (
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Loading Vessels
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to load vessels for this port. Please try again later.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      {!hideTitle && (
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ship className="h-5 w-5 mr-2 text-primary" />
            Vessels at Port
          </CardTitle>
          <CardDescription>
            {data.count} vessels currently at {data.portName || `Port #${portId}`}
          </CardDescription>
        </CardHeader>
      )}
      
      {showFilters && (
        <CardContent className="pb-2">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vessels..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={vesselTypeFilter} 
              onValueChange={setVesselTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vessel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vessel Types</SelectItem>
                <SelectItem value="tanker">Oil Tankers</SelectItem>
                <SelectItem value="container">Container Ships</SelectItem>
                <SelectItem value="cargo">Cargo Ships</SelectItem>
                <SelectItem value="bulk">Bulk Carriers</SelectItem>
                <SelectItem value="chemical">Chemical Tankers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}
      
      <CardContent>
        {filteredVessels.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No vessels found at this port</p>
            {vesselTypeFilter !== 'all' && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setVesselTypeFilter('all')}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-[220px] cursor-pointer"
                    onClick={() => handleSort('vessels.name')}
                  >
                    <div className="flex items-center">
                      Vessel Name {getSortIndicator('vessels.name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('vessels.vesselType')}
                  >
                    <div className="flex items-center">
                      Type {getSortIndicator('vessels.vesselType')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('distance')}
                  >
                    <div className="flex items-center justify-end">
                      Distance {getSortIndicator('distance')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVessels.map((vessel) => (
                  <TableRow key={vessel.vessels.id}>
                    <TableCell className="font-medium">
                      <Link href={`/vessels/${vessel.vessels.id}`}>
                        <a className="flex items-center text-primary hover:underline">
                          <Ship className="h-4 w-4 mr-2" />
                          {vessel.vessels.name}
                        </a>
                      </Link>
                      {vessel.vessels.flag && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Flag className="h-3 w-3 mr-1" />
                          {vessel.vessels.flag}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {vessel.vessels.vesselType || 'Unknown'}
                      </Badge>
                      {vessel.vessels.cargoType && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <Droplets className="h-3 w-3 inline mr-1" />
                          {vessel.vessels.cargoType}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">
                        {vessel.distance < 1 
                          ? `${(vessel.distance * 1000).toFixed(0)}m` 
                          : `${vessel.distance.toFixed(1)}km`}
                      </span>
                      {vessel.vessels.eta && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center justify-end">
                          <Timer className="h-3 w-3 mr-1" />
                          ETA: {new Date(vessel.vessels.eta).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {data.count > maxVessels && filteredVessels.length > 0 && (
        <CardFooter className="flex justify-center">
          <Link href={`/ports/${portId}`}>
            <Button variant="outline" size="sm">
              View All {data.count} Vessels
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

export default PortVesselsTable;