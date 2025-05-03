import { useState, useEffect, useRef } from 'react';
import { Vessel } from '@shared/schema';

interface UseVesselWebSocketProps {
  region?: string;
}

interface WebSocketMessage {
  type: string;
  vessels?: Vessel[];
  timestamp?: string;
  count?: number;
  error?: string;
}

/**
 * Hook for connecting to the vessel tracking WebSocket to receive real-time vessel updates
 */
export function useVesselWebSocket({ region }: UseVesselWebSocketProps = {}) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up WebSocket connection
  useEffect(() => {
    // Clean up function for closing the socket and clearing timers
    const cleanup = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
    
    // Function to connect to WebSocket
    const connectWebSocket = () => {
      cleanup();
      
      try {
        setIsLoading(true);
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        // Create new WebSocket connection
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        
        // Set up event handlers
        socket.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          
          // If region is specified, subscribe to region-specific updates
          if (region) {
            socket.send(JSON.stringify({ 
              type: 'subscribe_region',
              region 
            }));
          }
          
          // Request initial data
          socket.send(JSON.stringify({ type: 'request_vessels' }));
        };
        
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            
            if (message.type === 'vessel_update' && message.vessels) {
              setVessels(message.vessels);
              setLastUpdated(message.timestamp || new Date().toISOString());
              setIsLoading(false);
            } else if (message.type === 'error') {
              setError(message.error || 'Unknown error occurred');
              setIsLoading(false);
            }
          } catch (parseError) {
            console.error('Error parsing WebSocket message:', parseError);
            setError('Error processing data from server');
            setIsLoading(false);
          }
        };
        
        socket.onclose = () => {
          console.log('WebSocket disconnected, will reconnect in 5 seconds');
          setIsConnected(false);
          
          // Schedule reconnection
          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        };
        
        socket.onerror = (err) => {
          console.error('WebSocket error:', err);
          setError('Connection error');
          
          // Close the socket - onclose will trigger reconnection
          socket.close();
        };
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
        setError('Failed to connect to vessel tracking service');
        setIsLoading(false);
        
        // Schedule reconnection
        reconnectTimerRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      }
    };
    
    // Initial connection
    connectWebSocket();
    
    // Clean up when component unmounts
    return cleanup;
  }, [region]);
  
  // Request updated data for a specific region when the region changes
  useEffect(() => {
    if (isConnected && socketRef.current && region) {
      socketRef.current.send(JSON.stringify({ 
        type: 'subscribe_region',
        region 
      }));
      
      // Also request immediate update with the new region filter
      socketRef.current.send(JSON.stringify({ type: 'request_vessels' }));
    }
  }, [region, isConnected]);
  
  // Function to manually request vessel data
  const refreshData = () => {
    if (isConnected && socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: 'request_vessels' }));
      setIsLoading(true);
    }
  };
  
  return {
    vessels,
    isConnected,
    lastUpdated,
    error,
    isLoading,
    refreshData
  };
}