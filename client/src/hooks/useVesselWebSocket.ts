import { useState, useEffect, useRef } from 'react';
import { Vessel } from '@shared/schema';

interface UseVesselWebSocketProps {
  region?: string;
  loadAllVessels?: boolean;
  page?: number;
  pageSize?: number;
  trackPortProximity?: boolean;
  proximityRadius?: number;
}

export function useVesselWebSocket({
  region = 'global',
  loadAllVessels = false,
  page = 1,
  pageSize = 100,
  trackPortProximity = false,
  proximityRadius = 50
}: UseVesselWebSocketProps = {}) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const reconnectInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up existing connection and interval
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
    
    if (reconnectInterval.current) {
      clearInterval(reconnectInterval.current);
      reconnectInterval.current = null;
    }
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      try {
        // Create new WebSocket connection
        socket.current = new WebSocket(wsUrl);
        
        // Connection opened
        socket.current.addEventListener('open', () => {
          console.log('WebSocket connection established');
          setConnected(true);
          setError(null);
          
          // Send configuration message
          if (socket.current?.readyState === WebSocket.OPEN) {
            const configMessage = JSON.stringify({
              type: 'config',
              region,
              loadAllVessels,
              page,
              pageSize,
              trackPortProximity,
              proximityRadius
            });
            
            socket.current.send(configMessage);
          }
        });
        
        // Listen for messages
        socket.current.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle different message types
            if (data.type === 'vessels') {
              setVessels(data.vessels || []);
              setLastUpdated(new Date().toISOString());
              setLoading(false);
            } 
            else if (data.type === 'error') {
              console.error('WebSocket error:', data.message);
              setError(new Error(data.message));
            }
          } catch (err) {
            console.error('Error processing WebSocket message:', err);
            setError(err instanceof Error ? err : new Error('Unknown error processing message'));
          }
        });
        
        // Handle errors
        socket.current.addEventListener('error', (event) => {
          console.error('WebSocket error:', event);
          setConnected(false);
          setError(new Error('WebSocket connection error'));
        });
        
        // Connection closed
        socket.current.addEventListener('close', () => {
          console.log('WebSocket connection closed');
          setConnected(false);
          
          // Try to reconnect if not intentionally closed
          if (!socket.current) return;
          
          // Use fallback to REST API if WebSocket fails
          fetchVesselsViaREST();
          
          // Set up reconnection interval
          if (!reconnectInterval.current) {
            reconnectInterval.current = setInterval(() => {
              if (socket.current?.readyState !== WebSocket.OPEN) {
                connectWebSocket();
              }
            }, 5000); // Try to reconnect every 5 seconds
          }
        });
      } catch (err) {
        console.error('Error creating WebSocket connection:', err);
        setError(err instanceof Error ? err : new Error('Unknown error creating WebSocket'));
        setConnected(false);
        
        // Use fallback to REST API if WebSocket fails
        fetchVesselsViaREST();
      }
    };
    
    // Fallback to REST API
    const fetchVesselsViaREST = async () => {
      try {
        console.log('Falling back to REST API for vessel data');
        
        // Build query parameters
        const params = new URLSearchParams();
        if (region && region !== 'global') params.append('region', region);
        if (page) params.append('page', page.toString());
        if (pageSize) params.append('pageSize', pageSize.toString());
        if (loadAllVessels) params.append('all', 'true');
        
        const response = await fetch(`/api/vessels?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vessels: ${response.status}`);
        }
        
        const data = await response.json();
        setVessels(data || []);
        setLastUpdated(new Date().toISOString());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vessels via REST:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching vessels'));
        setLoading(false);
      }
    };
    
    // Attempt WebSocket connection
    connectWebSocket();
    
    // Clean up when component unmounts or dependencies change
    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
      
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
        reconnectInterval.current = null;
      }
    };
  }, [region, loadAllVessels, page, pageSize, trackPortProximity, proximityRadius]);
  
  // Function to manually send a message to the WebSocket
  const sendMessage = (message: any) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };
  
  return {
    vessels,
    connected,
    error,
    loading,
    lastUpdated,
    sendMessage
  };
}