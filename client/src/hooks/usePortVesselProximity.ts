import { useState, useEffect, useCallback, useRef } from 'react';

// Define types for port-vessel connections
export interface PortVesselConnection {
  vesselId: number;
  portId: number;
  vesselName: string;
  portName: string;
  distance: number;
  vesselType: string;
  portType: string;
  coordinates: {
    vessel: {
      lat: string | number;
      lng: string | number;
    };
    port: {
      lat: string | number;
      lng: string | number;
    };
  };
}

// Messages from the WebSocket server
type WebSocketMessage = {
  type: 'port-connections' | 'error' | 'vessels' | 'info';
  data: any;
  timestamp?: string;
};

// Hook props
interface UsePortVesselProximityProps {
  proximityRadius?: number; // In kilometers
  autoConnect?: boolean;
  pollingInterval?: number; // Fallback polling interval if WebSocket fails
}

/**
 * Hook for connecting to the WebSocket server to receive real-time
 * vessel-port proximity data. Shows connections between vessels and ports
 * when vessels are within a specified radius of a port.
 */
export function usePortVesselProximity({
  proximityRadius = 10,
  autoConnect = true,
  pollingInterval = 15000, // 15 seconds default
}: UsePortVesselProximityProps = {}) {
  // State variables
  const [connections, setConnections] = useState<PortVesselConnection[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // References
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Connect to the WebSocket server
   */
  const connect = useCallback(() => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // If we already have a connection, close it
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    try {
      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Event listeners
      socket.onopen = () => {
        setIsConnected(true);
        setError(null);
        
        // Send configuration to the server
        socket.send(JSON.stringify({
          type: 'config',
          trackPortProximity: true,
          proximityRadius,
        }));
        
        // Clear polling interval if it's active
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          
          if (message.type === 'port-connections') {
            setConnections(message.data);
            setIsLoading(false);
            setLastUpdated(new Date());
          } else if (message.type === 'vessels') {
            setVessels(message.data);
          } else if (message.type === 'error') {
            setError(message.data.message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setError('Failed to parse server message');
        }
      };
      
      socket.onclose = () => {
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (autoConnect) {
            connect();
          }
        }, 5000); // 5 second reconnect delay
        
        // If polling is enabled and socket disconnected, fall back to polling
        if (pollingInterval > 0 && !pollingIntervalRef.current) {
          startPolling();
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setError('Failed to connect to real-time updates');
      setIsConnected(false);
      
      // If polling is enabled and socket failed, fall back to polling
      if (pollingInterval > 0 && !pollingIntervalRef.current) {
        startPolling();
      }
    }
  }, [autoConnect, proximityRadius, pollingInterval]);
  
  /**
   * Disconnect from the WebSocket server
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setIsConnected(false);
  }, []);
  
  /**
   * Start polling for data as a fallback
   */
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Skip polling if interval is set to 0
    if (pollingInterval === 0) return;
    
    // Function to fetch data via API
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch port-vessel connections data
        const url = new URL('/api/port-vessel-proximity', window.location.origin);
        url.searchParams.append('radius', proximityRadius.toString());
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setConnections(data.connections || []);
        setVessels(data.vessels || []);
        setLastUpdated(new Date());
        setError(null);
      } catch (error) {
        console.error('Error polling for data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch immediately
    fetchData();
    
    // Set up the interval
    pollingIntervalRef.current = setInterval(fetchData, pollingInterval);
  }, [proximityRadius, pollingInterval]);
  
  /**
   * Update radius configuration
   */
  useEffect(() => {
    if (socketRef.current && isConnected) {
      // Send updated config to the server
      socketRef.current.send(JSON.stringify({
        type: 'config',
        trackPortProximity: true,
        proximityRadius,
      }));
    }
  }, [proximityRadius, isConnected]);
  
  /**
   * Initial connection setup
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);
  
  /**
   * Manually refresh data
   */
  const refreshData = useCallback(() => {
    if (isConnected && socketRef.current) {
      // Request fresh data
      socketRef.current.send(JSON.stringify({
        type: 'request-data',
        trackPortProximity: true,
        proximityRadius,
      }));
      
      setIsLoading(true);
    } else {
      // Fall back to polling if not connected
      startPolling();
    }
  }, [isConnected, proximityRadius, startPolling]);
  
  // Return the hook state and functions
  return {
    connections,
    vessels,
    isConnected,
    error,
    isLoading,
    lastUpdated,
    connect,
    disconnect,
    refreshData,
  };
}