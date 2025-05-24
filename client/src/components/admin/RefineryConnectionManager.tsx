import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Anchor, Ship, Building, Trash2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

// Types for connections
interface VesselRefineryConnection {
  id: number;
  vesselId: number;
  refineryId: number;
  connectionType: string;
  status: string;
  cargoVolume: number | null;
  startDate: string | null;
  endDate: string | null;
}

interface Vessel {
  id: number;
  name: string;
  vesselType: string;
  cargoCapacity: number | null;
  currentLat: string | null;
  currentLng: string | null;
}

interface Refinery {
  id: number;
  name: string;
  region: string;
  country: string;
  capacity: number | null;
}

interface RefineryConnectionManagerProps {
  refineryId?: number;
  vesselId?: number;
  mode?: 'refinery' | 'vessel';
}

const RefineryConnectionManager: React.FC<RefineryConnectionManagerProps> = ({
  refineryId,
  vesselId,
  mode = 'refinery'
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<number | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<number | null>(null);
  const [connectionType, setConnectionType] = useState('loading');
  const [cargoVolume, setCargoVolume] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('vessels');

  // Set initial selected values based on props
  useEffect(() => {
    if (refineryId) setSelectedRefinery(refineryId);
    if (vesselId) setSelectedVessel(vesselId);
  }, [refineryId, vesselId]);

  // Query vessels
  const { data: vessels = [] } = useQuery<Vessel[]>({
    queryKey: ['/api/vessels'],
    enabled: mode === 'refinery' || isDialogOpen
  });

  // Query refineries
  const { data: refineries = [] } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
    enabled: mode === 'vessel' || isDialogOpen
  });

  // Query all vessel-refinery connections first to ensure we're getting data
  const { data: allConnections = [], isLoading: allConnectionsLoading } = useQuery<VesselRefineryConnection[]>({
    queryKey: ['/api/vessel-refinery'],
    enabled: true,
    staleTime: 0, // Don't cache this data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window gets focus
  });
  
  // Filter connections locally based on the mode and ID
  const connections = allConnections.filter(conn => {
    if (mode === 'refinery' && refineryId) {
      return conn.refineryId === refineryId;
    } else if (mode === 'vessel' && vesselId) {
      return conn.vesselId === vesselId;
    }
    return false;
  });
  
  const connectionsLoading = allConnectionsLoading;

  // Query to get detailed vessel and refinery data for each connection
  // Get refinery details by id for vessel mode
  const { data: refineryList = [] } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
    enabled: mode === 'vessel' && connections.length > 0
  });
  
  // Create a safe reference object for refinery details
  const refineryDetails: Record<number, Refinery> = {};
  
  // Populate refinery details only if we have data
  if (refineryList && refineryList.length > 0) {
    refineryList.forEach(refinery => {
      if (refinery && refinery.id) {
        refineryDetails[refinery.id] = refinery;
      }
    });
  }

  // Get vessel details by id for refinery mode
  const { data: vesselList = [] } = useQuery<Vessel[]>({
    queryKey: ['/api/vessels'],
    enabled: mode === 'refinery' // Always fetch vessels in refinery mode
  });
  
  // Create lookup object for vessels
  // Create a safe reference object for vessel details
  const vesselDetails: Record<number, Vessel> = {};
  
  // Populate vessel details only if we have data
  if (vesselList && vesselList.length > 0) {
    vesselList.forEach(vessel => {
      if (vessel && vessel.id) {
        vesselDetails[vessel.id] = vessel;
      }
    });
  }

  // Create connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: async (newConnection: any) => {
      return apiRequest('/api/vessel-refinery', {
        method: 'POST',
        body: JSON.stringify(newConnection),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Connection created',
        description: 'The vessel-refinery connection has been created successfully.',
      });
      setIsDialogOpen(false);
      resetForm();
      // Invalidate ALL vessel-refinery queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['/api/vessel-refinery'] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating connection',
        description: error.message || 'Failed to create vessel-refinery connection',
        variant: 'destructive',
      });
    },
  });

  // Delete connection mutation
  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      return apiRequest(`/api/vessel-refinery/${connectionId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Connection deleted',
        description: 'The vessel-refinery connection has been removed.',
      });
      // Invalidate ALL vessel-refinery queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['/api/vessel-refinery'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting connection',
        description: error.message || 'Failed to delete connection',
        variant: 'destructive',
      });
    },
  });

  // Form submission
  const handleSubmit = () => {
    const newConnection = {
      vesselId: selectedVessel,
      refineryId: selectedRefinery,
      connectionType,
      status: 'active',
      cargoVolume: cargoVolume ? parseFloat(cargoVolume) : null,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    };

    createConnectionMutation.mutate(newConnection);
  };

  // Reset form after submission
  const resetForm = () => {
    if (mode !== 'refinery') setSelectedRefinery(null);
    if (mode !== 'vessel') setSelectedVessel(null);
    setConnectionType('loading');
    setCargoVolume('');
    setStartDate(new Date());
    setEndDate(undefined);
  };

  // Delete connection handler
  const handleDelete = (connectionId: number) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      deleteConnectionMutation.mutate(connectionId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {mode === 'refinery' 
            ? 'Vessels Connected to This Refinery' 
            : 'Refineries Connected to This Vessel'}
        </h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Connection
        </Button>
      </div>

      {/* Connection list */}
      <div className="space-y-2">
        {connections.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            No connections found. Create a new connection to link 
            {mode === 'refinery' ? ' vessels to this refinery.' : ' this vessel to refineries.'}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((connection) => (
              <Card key={connection.id} className="p-4 relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(connection.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {mode === 'refinery' && (
                  <div className="flex items-start space-x-3">
                    <Ship className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h4 className="font-medium">
                        {(vesselDetails[connection.vesselId]?.name) || 
                         (vesselList.find(v => v.id === connection.vesselId)?.name) || 
                         `Vessel ID: ${connection.vesselId}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Type: {(vesselDetails[connection.vesselId]?.vesselType) || 
                               (vesselList.find(v => v.id === connection.vesselId)?.vesselType) || 'N/A'}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant={connection.connectionType === 'loading' ? 'default' : 'secondary'}>
                          {connection.connectionType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {connection.startDate ? format(new Date(connection.startDate), 'PP') : 'No date'}
                        </span>
                      </div>
                      {connection.cargoVolume && (
                        <p className="text-sm mt-1">Cargo: {connection.cargoVolume.toLocaleString()} MT</p>
                      )}
                    </div>
                  </div>
                )}

                {mode === 'vessel' && (
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h4 className="font-medium">
                        {(refineryDetails[connection.refineryId]?.name) || 
                         (refineryList.find(r => r.id === connection.refineryId)?.name) || 
                         `Refinery ID: ${connection.refineryId}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {(refineryDetails[connection.refineryId]?.country || 
                          refineryList.find(r => r.id === connection.refineryId)?.country || 
                          'Unknown Country')}{', '}
                        {(refineryDetails[connection.refineryId]?.region || 
                          refineryList.find(r => r.id === connection.refineryId)?.region || 
                          'Unknown Region')}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant={connection.connectionType === 'loading' ? 'default' : 'secondary'}>
                          {connection.connectionType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {connection.startDate ? format(new Date(connection.startDate), 'PP') : 'No date'}
                        </span>
                      </div>
                      {connection.cargoVolume && (
                        <p className="text-sm mt-1">Cargo: {connection.cargoVolume.toLocaleString()} MT</p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Connection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Connect {mode === 'refinery' ? 'Vessel to Refinery' : 'Refinery to Vessel'}</DialogTitle>
            <DialogDescription>
              Create a connection between a vessel and a refinery to track cargo transfers and operations.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vessels">Select Vessel</TabsTrigger>
              <TabsTrigger value="refineries">Select Refinery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vessels" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vessel">Vessel</Label>
                <Select
                  value={selectedVessel?.toString() || ''}
                  onValueChange={(value) => setSelectedVessel(parseInt(value))}
                  disabled={mode === 'vessel' && vesselId !== undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vessel" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {vessels.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id.toString()}>
                        {vessel.name} - {vessel.vesselType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="refineries" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refinery">Refinery</Label>
                <Select
                  value={selectedRefinery?.toString() || ''}
                  onValueChange={(value) => setSelectedRefinery(parseInt(value))}
                  disabled={mode === 'refinery' && refineryId !== undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a refinery" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {refineries.map((refinery) => (
                      <SelectItem key={refinery.id} value={refinery.id.toString()}>
                        {refinery.name} - {refinery.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="connectionType">Connection Type</Label>
              <Select
                value={connectionType}
                onValueChange={setConnectionType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loading">Loading</SelectItem>
                  <SelectItem value="unloading">Unloading</SelectItem>
                  <SelectItem value="docked">Docked</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargoVolume">Cargo Volume (MT)</Label>
              <Input
                id="cargoVolume"
                placeholder="Cargo volume in metric tons"
                value={cargoVolume}
                onChange={(e) => {
                  // Validate input to prevent numeric overflow
                  const value = e.target.value;
                  const numValue = parseFloat(value);
                  
                  // Only allow valid numbers within safe range
                  if (value === "" || (
                    !isNaN(numValue) && 
                    numValue >= 0 && 
                    numValue < 9999999999
                  )) {
                    setCargoVolume(value);
                  }
                }}
                type="number"
                min="0"
                max="9999999999"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedVessel || !selectedRefinery || createConnectionMutation.isPending}
            >
              {createConnectionMutation.isPending ? 'Creating...' : 'Create Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefineryConnectionManager;