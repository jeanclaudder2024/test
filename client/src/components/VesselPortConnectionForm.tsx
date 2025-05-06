import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Ship, Anchor, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useVesselPortConnection } from '@/hooks/useVesselPortConnection';

interface VesselPortConnectionFormProps {
  initialPortId?: number;
  initialVesselId?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  hideTitle?: boolean;
  minimal?: boolean; // For minimal/compact UI
  className?: string;
}

const VesselPortConnectionForm: React.FC<VesselPortConnectionFormProps> = ({
  initialPortId,
  initialVesselId,
  onSuccess,
  onError,
  hideTitle = false,
  minimal = false,
  className = ''
}) => {
  const [vesselId, setVesselId] = useState<string>(initialVesselId?.toString() || '');
  const [portId, setPortId] = useState<string>(initialPortId?.toString() || '');
  const [moveToPort, setMoveToPort] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vesselSearchQuery, setVesselSearchQuery] = useState<string>('');
  
  const { 
    connectVesselToPort, 
    isConnecting, 
    lastConnection, 
    connectionError,
    clearLastConnection
  } = useVesselPortConnection();

  // Reset form when initialPortId changes
  useEffect(() => {
    if (initialPortId) {
      setPortId(initialPortId.toString());
    }
  }, [initialPortId]);

  // Reset form when initialVesselId changes
  useEffect(() => {
    if (initialVesselId) {
      setVesselId(initialVesselId.toString());
    }
  }, [initialVesselId]);

  // Fetch ports for dropdown
  const { 
    data: portsData,
    isLoading: isLoadingPorts
  } = useQuery({
    queryKey: ['/api/ports', searchQuery],
    queryFn: async ({ queryKey }) => {
      const [_, query] = queryKey;
      const url = query 
        ? `/api/ports/search?q=${encodeURIComponent(query as string)}`
        : '/api/ports';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch ports');
      }
      return response.json();
    },
    staleTime: 10000
  });

  // Fetch vessels for dropdown
  const { 
    data: vesselsData,
    isLoading: isLoadingVessels
  } = useQuery({
    queryKey: ['/api/vessels/search', vesselSearchQuery],
    queryFn: async ({ queryKey }) => {
      const [_, query] = queryKey;
      const url = query 
        ? `/api/vessels/search?q=${encodeURIComponent(query as string)}`
        : '/api/vessels';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch vessels');
      }
      return response.json();
    },
    staleTime: 10000
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vesselId || !portId) {
      return;
    }
    
    try {
      const result = await connectVesselToPort({
        vesselId: parseInt(vesselId),
        portId: parseInt(portId),
        moveToPort
      });
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        if (onError) {
          onError(result.error || 'Failed to connect vessel to port');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  // Filter ports based on search query
  const filteredPorts = portsData?.ports || [];
  const filteredVessels = vesselsData?.vessels || [];

  // Check if we have a successful connection
  const isSuccess = lastConnection?.success;

  return (
    <Card className={`${className} ${minimal ? 'border-0 shadow-none' : ''}`}>
      {!hideTitle && (
        <CardHeader className={minimal ? 'px-0 pt-0 pb-2' : 'pb-2'}>
          <CardTitle className="flex items-center text-lg">
            <Ship className="h-5 w-5 mr-2 text-primary" />
            Connect Vessel to Port
          </CardTitle>
          <CardDescription>
            Update vessel destination and optionally move vessel to port
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className={minimal ? 'px-0 py-2' : ''}>
        {/* Success message */}
        {isSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Connection Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              {lastConnection?.message || 'Vessel successfully connected to port.'}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Error message */}
        {connectionError && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
            <AlertDescription className="text-red-700">
              {connectionError}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vessel selection */}
          <div className="space-y-2">
            <Label htmlFor="vessel-select">Vessel</Label>
            <div className="relative">
              <Input
                placeholder="Search vessels..."
                value={vesselSearchQuery}
                onChange={(e) => setVesselSearchQuery(e.target.value)}
                className="mb-2"
              />
              <Select
                value={vesselId}
                onValueChange={setVesselId}
                disabled={isConnecting || isLoadingVessels}
              >
                <SelectTrigger className="w-full" id="vessel-select">
                  <SelectValue placeholder="Select a vessel" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingVessels ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : filteredVessels.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No vessels found
                    </div>
                  ) : (
                    filteredVessels.map((vessel: any) => (
                      <SelectItem key={vessel.id} value={vessel.id.toString()}>
                        {vessel.name} ({vessel.vesselType || 'Unknown'})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Port selection */}
          <div className="space-y-2">
            <Label htmlFor="port-select">Port</Label>
            <div className="relative">
              <Input
                placeholder="Search ports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              <Select
                value={portId}
                onValueChange={setPortId}
                disabled={isConnecting || isLoadingPorts}
              >
                <SelectTrigger className="w-full" id="port-select">
                  <SelectValue placeholder="Select a port" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPorts ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : filteredPorts.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No ports found
                    </div>
                  ) : (
                    filteredPorts.map((port: any) => (
                      <SelectItem key={port.id} value={port.id.toString()}>
                        {port.name} ({port.country})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Move to port option */}
          <div className="flex items-center space-x-2">
            <Switch
              id="move-to-port"
              checked={moveToPort}
              onCheckedChange={setMoveToPort}
              disabled={isConnecting}
            />
            <Label htmlFor="move-to-port" className="cursor-pointer">
              Move vessel near port
            </Label>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className={minimal ? 'px-0 pt-2 pb-0 justify-between' : 'justify-between'}>
        {lastConnection && (
          <Button 
            variant="ghost" 
            onClick={clearLastConnection}
            size="sm"
          >
            Reset
          </Button>
        )}
        <Button 
          onClick={handleSubmit}
          disabled={isConnecting || !vesselId || !portId}
          className="ml-auto"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Anchor className="mr-2 h-4 w-4" />
              Connect Vessel
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VesselPortConnectionForm;