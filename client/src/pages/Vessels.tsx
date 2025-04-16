import { useState } from 'react';
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
import { Link } from 'wouter';
import { formatDate } from '@/lib/utils';
import { Ship, Search, Plus } from 'lucide-react';

export default function Vessels() {
  const { vessels, loading } = useDataStream();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter vessels based on search term
  const filteredVessels = vessels.filter(vessel => 
    vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.imo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.flag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vessel.currentRegion && vessel.currentRegion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        
        <div className="flex gap-4 mt-4 md:mt-0">
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
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vessel
          </Button>
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
                <TableHead>Type</TableHead>
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
                      <Button variant="ghost" size="sm">
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
    </div>
  );
}