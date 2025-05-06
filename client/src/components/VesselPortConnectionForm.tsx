import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, X, Loader2 } from 'lucide-react';
import { useVesselPortConnection } from '../hooks/useVesselPortConnection';

/**
 * Component for connecting vessels to ports
 */
export function VesselPortConnectionForm() {
  const [vesselId, setVesselId] = useState<string>('');
  const [portId, setPortId] = useState<string>('');
  const [moveToPort, setMoveToPort] = useState<boolean>(true);
  
  const { 
    connectVesselToPort, 
    isConnecting, 
    connectionError, 
    lastConnection,
    clearLastConnection
  } = useVesselPortConnection();
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vesselId || !portId) {
      return;
    }
    
    // Clear previous results
    clearLastConnection();
    
    // Connect vessel to port
    await connectVesselToPort({
      vesselId: parseInt(vesselId),
      portId: parseInt(portId),
      moveToPort
    });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Vessel to Port</CardTitle>
        <CardDescription>
          Update a vessel's destination and optionally move it near the port
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vesselId">Vessel ID</Label>
            <Input
              id="vesselId"
              type="number"
              placeholder="Enter vessel ID"
              value={vesselId}
              onChange={(e) => setVesselId(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portId">Port ID</Label>
            <Input
              id="portId"
              type="number"
              placeholder="Enter port ID"
              value={portId}
              onChange={(e) => setPortId(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="moveToPort"
              checked={moveToPort}
              onCheckedChange={(checked) => setMoveToPort(checked === true)}
            />
            <Label htmlFor="moveToPort" className="cursor-pointer">
              Move vessel near port (update position)
            </Label>
          </div>
          
          {connectionError && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
          
          {lastConnection?.success && (
            <Alert variant="default" className="border-green-600 bg-green-50 text-green-800">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{lastConnection.message}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isConnecting || !vesselId || !portId}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Vessel to Port'
            )}
          </Button>
        </form>
      </CardContent>
      
      {lastConnection?.success && lastConnection.data && (
        <CardFooter className="flex flex-col items-start border-t p-4">
          <h4 className="text-sm font-medium">Connected:</h4>
          <p className="text-sm mt-1">
            Vessel: <span className="font-semibold">{lastConnection.data.vessel.name}</span> (ID: {lastConnection.data.vessel.id})
          </p>
          <p className="text-sm">
            Port: <span className="font-semibold">{lastConnection.data.port.name}</span> (ID: {lastConnection.data.port.id})
          </p>
          {moveToPort && (
            <p className="text-sm mt-2">
              Vessel is now positioned {(parseFloat(lastConnection.data.vessel.currentLat) - parseFloat(lastConnection.data.port.lat)).toFixed(6)} km away from the port.
            </p>
          )}
        </CardFooter>
      )}
    </Card>
  );
}