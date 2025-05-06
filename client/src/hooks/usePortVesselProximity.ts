import { useState, useEffect, useRef, useCallback } from 'react';
import { Vessel, Port } from '@shared/schema';

// Type for port-vessel connection data received from WebSocket
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

// Props for the hook
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
  pollingInterval = 10000
}: UsePortVesselProximityProps = {}) {
  const [connections, setConnections] = useState<PortVesselConnection[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs to store WebSocket and timer
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to connect to WebSocket
  const connectWebSocket = useCallback(() => {
    // Close existing socket if any
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    try {
      // Determine WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket server at:', wsUrl);
      
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Connection opened handler
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
        
        // Send configuration to server
        socket.send(JSON.stringify({
          type: 'track_port_proximity',
          enabled: true,
          radius: proximityRadius
        }));
        
        // Also request all vessels
        socket.send(JSON.stringify({
          type: 'request_vessels',
          allVessels: true
        }));
      });
      
      // Message handler
      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle vessel data updates with port connections
          if (data.type === 'vessel_update') {
            // Update vessels
            if (data.vessels && Array.isArray(data.vessels)) {
              setVessels(data.vessels);
            }
            
            // Update connections if present
            if (data.portConnections && Array.isArray(data.portConnections)) {
              setConnections(data.portConnections);
              console.log(`Received ${data.portConnections.length} vessel-port connections`);
            }
            
            // Update lastUpdated timestamp
            if (data.timestamp) {
              setLastUpdated(new Date(data.timestamp));
            }
            
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      // Error handler
      socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        setIsConnected(false);
        
        // Schedule reconnection
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            connectWebSocket();
          }, 5000);
        }
      });
      
      // Close handler
      socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        
        // Schedule reconnection
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            connectWebSocket();
          }, 5000);
        }
      });
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Failed to create WebSocket connection');
      setIsConnected(false);
      
      // Schedule reconnection
      if (!reconnectTimerRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          connectWebSocket();
        }, 5000);
      }
    }
  }, [proximityRadius]);
  
  // Function to manually refresh data
  const refreshData = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'request_vessels',
        allVessels: true
      }));
    } else {
      // Fallback to reconnect
      connectWebSocket();
    }
  }, [connectWebSocket]);
  
  // Function to cleanup resources
  const cleanup = useCallback(() => {
    // Close WebSocket
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    // Clear timers
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    
    setIsConnected(false);
  }, []);
  
  // Effect to connect on mount and clean up on unmount
  useEffect(() => {
    if (autoConnect) {
      connectWebSocket();
    }
    
    return cleanup;
  }, [autoConnect, connectWebSocket, cleanup]);
  
  // Effect to handle proximity radius changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'track_port_proximity',
        enabled: true,
        radius: proximityRadius
      }));
    }
  }, [proximityRadius]);
  
  return {
    connections,
    vessels,
    isConnected,
    error,
    isLoading,
    lastUpdated,
    refreshData,
    connect: connectWebSocket,
    disconnect: cleanup
  };
}