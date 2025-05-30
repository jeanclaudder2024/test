import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ship, Search, MapPin, Clock } from 'lucide-react';

export default function Vessels() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const vesselsPerPage = 20;

  // Fetch vessels from your Supabase database
  const { data: vesselsData, isLoading, error } = useQuery({
    queryKey: ['/api/vessels', currentPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: vesselsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/vessels?${params}`);
      if (!response.ok) throw new Error('Failed to fetch vessels');
      return response.json();
    }
  });

  const vessels = vesselsData?.vessels || [];
  const totalVessels = vesselsData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalVessels / vesselsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'underway': return 'bg-green-500';
      case 'at port': return 'bg-blue-500';
      case 'anchored': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Ship className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unable to Load Vessels</h3>
              <p className="text-gray-600 mb-4">
                There was an error loading vessel data from the database.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vessels</h1>
          <p className="text-muted-foreground">
            Manage and track your vessel fleet
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Vessels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search by vessel name, IMO, or MMSI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Vessels ({totalVessels} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vessels.length === 0 ? (
            <div className="text-center py-8">
              <Ship className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Vessels Found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "No vessels match your search criteria." 
                  : "No vessels available in the database."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Flag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Location</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vessels.map((vessel: any) => (
                    <TableRow key={vessel.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-blue-600" />
                          {vessel.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          IMO: {vessel.imo} | MMSI: {vessel.mmsi}
                        </div>
                      </TableCell>
                      <TableCell>{vessel.vesselType}</TableCell>
                      <TableCell>{vessel.flag}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(vessel.status)}>
                          {vessel.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vessel.currentLat && vessel.currentLng ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">
                              {Number(vessel.currentLat).toFixed(2)}, {Number(vessel.currentLng).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {vessel.destinationPort || (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {vessel.lastUpdated 
                            ? new Date(vessel.lastUpdated).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}