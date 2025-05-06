import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

interface ConnectVesselToPortParams {
  vesselId: number;
  portId: number;
  moveToPort?: boolean;
}

interface ConnectionResult {
  success: boolean;
  message: string;
  data?: {
    vessel: any;
    port: any;
  };
  error?: string;
}

/**
 * Hook for connecting vessels to ports
 * @returns Functions and state for connecting vessels to ports
 */
export function useVesselPortConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastConnection, setLastConnection] = useState<ConnectionResult | null>(null);
  const queryClient = useQueryClient();

  /**
   * Connect a vessel to a port
   * @param params - Connection parameters: vesselId, portId, moveToPort
   * @returns Promise that resolves with the connection result
   */
  const connectVesselToPort = async (params: ConnectVesselToPortParams): Promise<ConnectionResult> => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const { vesselId, portId, moveToPort = true } = params;
      
      const response = await apiRequest('/api/port-vessels/connect', {
        method: 'POST',
        body: JSON.stringify({
          vesselId,
          portId,
          moveToPort
        })
      });
      
      // apiRequest already returns parsed JSON, no need to call .json() again
      const result = response;
      setLastConnection(result);
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/vessels', vesselId] });
      queryClient.invalidateQueries({ queryKey: ['/api/vessels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/port-vessels', portId] });
      queryClient.invalidateQueries({ queryKey: ['/api/port-vessels'] });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error connecting vessel to port';
      setConnectionError(errorMessage);
      setLastConnection({
        success: false,
        message: 'Failed to connect vessel to port',
        error: errorMessage
      });
      
      return {
        success: false,
        message: 'Failed to connect vessel to port',
        error: errorMessage
      };
    } finally {
      setIsConnecting(false);
    }
  };
  
  /**
   * Clear the last connection result
   */
  const clearLastConnection = () => {
    setLastConnection(null);
    setConnectionError(null);
  };
  
  return {
    connectVesselToPort,
    clearLastConnection,
    isConnecting,
    connectionError,
    lastConnection
  };
}