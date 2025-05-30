import { useState, useEffect, useCallback, useRef } from 'react';

export interface PortVesselConnection {
  portId: number;
  portName: string;
  portType: string;
  vesselId: number;
  vesselName: string;
  vesselType: string;
  distance: number;
  coordinates: {
    port: { lat: number; lng: number };
    vessel: { lat: number; lng: number };
  };
}

interface UsePortVesselProximityProps {
  proximityRadius?: number;
  autoConnect?: boolean;
  pollingInterval?: number;
}

/**
 * Hook for connecting to the WebSocket server to get real-time vessel-port proximity data.
 * Falls back to REST API polling if WebSocket connection fails.
 */
export function usePortVesselProximity({
  proximityRadius = 10,
  autoConnect = true,
  pollingInterval = 15000,
}: UsePortVesselProximityProps = {}) {
  const [connections, setConnections] = useState<PortVesselConnection[]>([]);
  const [vessels, setVessels] = useState<{ id: number; name: string; type: string }[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearPollTimer = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };
  
  // Function to connect to the WebSocket server
  const connect = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Determine the correct WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const socketUrl = `${protocol}//${host}/ws`;
      
      // Close any existing connection
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Create a new WebSocket connection
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
        
        // Send a message to subscribe to port proximity events
        socket.send(JSON.stringify({
          type: 'subscribePortProximity',
          proximityRadius,
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'portVesselConnections') {
            setConnections(data.connections);
            
            // Extract unique vessels from connections
            const uniqueVessels = new Map();
            data.connections.forEach((conn: PortVesselConnection) => {
              if (!uniqueVessels.has(conn.vesselId)) {
                uniqueVessels.set(conn.vesselId, {
                  id: conn.vesselId,
                  name: conn.vesselName,
                  type: conn.vesselType,
                });
              }
            });
            
            setVessels(Array.from(uniqueVessels.values()));
            setLastUpdated(new Date());
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      socket.onclose = (event) => {
        setIsConnected(false);
        
        if (event.code !== 1000) {
          setError(`WebSocket connection closed unexpectedly (${event.code})`);
          
          // If polling is enabled, start polling as a fallback
          if (pollingInterval > 0) {
            startPolling();
          }
        }
      };
      
      socket.onerror = () => {
        setError('WebSocket error occurred. Falling back to REST API polling.');
        setIsConnected(false);
        
        // If polling is enabled, start polling as a fallback
        if (pollingInterval > 0) {
          startPolling();
        }
      };
      
      return socket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to connect to WebSocket: ${errorMessage}`);
      setIsConnected(false);
      setIsLoading(false);
      
      // If polling is enabled, start polling as a fallback
      if (pollingInterval > 0) {
        startPolling();
      }
      
      return null;
    }
  }, [proximityRadius, pollingInterval]);
  
  // Function to fetch data via REST API (fallback)
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/port-vessel-connections?radius=${proximityRadius}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      setConnections(data.connections || []);
      
      // Extract unique vessels from connections
      const uniqueVessels = new Map();
      (data.connections || []).forEach((conn: PortVesselConnection) => {
        if (!uniqueVessels.has(conn.vesselId)) {
          uniqueVessels.set(conn.vesselId, {
            id: conn.vesselId,
            name: conn.vesselName,
            type: conn.vesselType,
          });
        }
      });
      
      setVessels(Array.from(uniqueVessels.values()));
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to fetch data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [proximityRadius]);
  
  // Start polling function (used as WebSocket fallback)
  const startPolling = useCallback(() => {
    clearPollTimer();
    
    if (pollingInterval > 0) {
      // Immediately fetch data
      fetchData();
      
      // Set up recurring polling
      pollTimerRef.current = setInterval(fetchData, pollingInterval);
    }
  }, [fetchData, pollingInterval]);
  
  // Function to update WebSocket proximity radius
  const updateProximityRadius = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'updateProximityRadius',
        proximityRadius,
      }));
    }
  }, [proximityRadius]);
  
  // Manual refresh function
  const refreshData = useCallback(() => {
    if (isConnected && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'requestPortVesselConnections',
      }));
    } else {
      fetchData();
    }
  }, [isConnected, fetchData]);
  
  // Effect to connect or disconnect based on autoConnect
  useEffect(() => {
    if (autoConnect) {
      const socket = connect();
      
      return () => {
        if (socket) {
          socket.close();
        }
        clearPollTimer();
      };
    } else {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      clearPollTimer();
    }
  }, [autoConnect, connect]);
  
  // Effect to update proximity radius when it changes
  useEffect(() => {
    updateProximityRadius();
  }, [proximityRadius, updateProximityRadius]);
  
  return {
    connections,
    vessels,
    isConnected,
    error,
    isLoading,
    lastUpdated,
    refreshData,
  };
}