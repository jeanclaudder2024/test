import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Database, Ship, RefreshCw, FileJson } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Define interface for vessel data
interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built?: number | null;
  cargoType?: string | null;
  currentLat?: string | null;
  currentLng?: string | null;
  currentRegion?: string | null;
  [key: string]: any; // Allow for other properties we might not know about
}

export default function ApiTest() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/vessels/polling');
  const [rawData, setRawData] = useState<string>('');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  
  const { toast } = useToast();
  
  // Function to fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(apiEndpoint);
      console.log('API Response:', response.data);
      
      // Check if it's an array of vessels
      if (Array.isArray(response.data)) {
        setVessels(response.data);
        setRawData(JSON.stringify(response.data, null, 2));
      } 
      // Check if it's an object with a vessels property
      else if (response.data && Array.isArray(response.data.vessels)) {
        setVessels(response.data.vessels);
        setRawData(JSON.stringify(response.data, null, 2));
      }
      // Otherwise set the raw data
      else {
        setVessels([]);
        setRawData(JSON.stringify(response.data, null, 2));
        setError('Response does not contain vessels array');
      }
      
      toast({
        title: 'Data fetched successfully',
        description: `Retrieved ${Array.isArray(response.data) ? response.data.length : (response.data.vessels ? response.data.vessels.length : 0)} vessels`,
      });
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      setVessels([]);
      
      toast({
        title: 'Error fetching data',
        description: err.message || 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to view details of a vessel
  const viewVesselDetails = (vessel: Vessel) => {
    setSelectedVessel(vessel);
  };
  
  // Function to clear selected vessel
  const clearSelectedVessel = () => {
    setSelectedVessel(null);
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [apiEndpoint]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Database className="h-8 w-8 text-primary" />
        API Test Page
      </h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            Vessel Database API
          </CardTitle>
          <CardDescription>
            Test the vessel polling API to view vessel data from our database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              The Polling API endpoint provides vessel data directly from our database. It serves as a fallback mechanism when WebSocket connections fail to establish.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <Badge variant="outline">
              Endpoint: {apiEndpoint}
            </Badge>
          </div>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vessel List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Vessel List
            </CardTitle>
            <CardDescription>
              {vessels.length} vessels retrieved from API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : vessels.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground">
                No vessels found
              </div>
            ) : (
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>IMO</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vessels.map((vessel) => (
                      <TableRow key={vessel.id}>
                        <TableCell className="font-mono">{vessel.id}</TableCell>
                        <TableCell>{vessel.name}</TableCell>
                        <TableCell>{vessel.imo}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => viewVesselDetails(vessel)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
        
        {/* Selected Vessel or Raw JSON */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedVessel ? (
                <>
                  <Ship className="h-5 w-5 text-primary" />
                  Vessel Details
                </>
              ) : (
                <>
                  <FileJson className="h-5 w-5 text-primary" />
                  Raw JSON Data
                </>
              )}
            </CardTitle>
            <CardDescription>
              {selectedVessel ? 
                `Detailed information for vessel: ${selectedVessel.name}` : 
                'Raw JSON response from the API'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedVessel ? (
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{selectedVessel.name}</h3>
                  
                  <Table>
                    <TableBody>
                      {Object.entries(selectedVessel).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-semibold">{key}</TableCell>
                          <TableCell className="font-mono">
                            {typeof value === 'object' ? 
                              JSON.stringify(value) : 
                              String(value)
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-[400px] rounded-md border">
                <pre className="p-4 text-xs overflow-x-auto">{rawData}</pre>
              </ScrollArea>
            )}
          </CardContent>
          {selectedVessel && (
            <CardFooter>
              <Button variant="outline" onClick={clearSelectedVessel}>
                Back to Raw JSON
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}