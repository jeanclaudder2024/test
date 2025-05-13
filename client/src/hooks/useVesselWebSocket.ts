import { useState, useEffect, useRef } from 'react';
import { Vessel } from '@shared/schema';

interface UseVesselWebSocketProps {
  region?: string;
  pageSize?: number;
  page?: number;
  loadAllVessels?: boolean;
  trackPortProximity?: boolean;
  proximityRadius?: number;
}

export function useVesselWebSocket({
  region = 'global',
  pageSize = 100,
  page = 1,
  loadAllVessels = false,
  trackPortProximity = false,
  proximityRadius = 50
}: UseVesselWebSocketProps = {}) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Get the host from the current window location
        const hostname = window.location.hostname;
        const port = window.location.port ? window.location.port : '';
        
        // Determine whether to use secure WebSocket or not
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        // Build the WebSocket URL with the current host and correct path
        const wsUrl = `${protocol}//${hostname}${port ? ':' + port : ''}/ws`;
        console.log('Connecting to WebSocket at:', wsUrl);
        
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;
        
        socket.onopen = () => {
          console.log('WebSocket connected');
          setConnected(true);
          
          // Send configuration to the server
          const config = {
            type: 'config',
            region,
            page,
            pageSize,
            sendAllVessels: loadAllVessels,
            trackPortProximity,
            proximityRadius
          };
          
          socket.send(JSON.stringify(config));
        };
        
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'vessels') {
              setVessels(data.vessels);
              setLastUpdated(Date.now());
              setLoading(false);
            } else if (data.type === 'error') {
              console.error('WebSocket error:', data.message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        socket.onclose = () => {
          console.log('WebSocket disconnected');
          setConnected(false);
          
          // Attempt to reconnect after a delay
          if (reconnectTimerRef.current === null) {
            reconnectTimerRef.current = window.setTimeout(() => {
              reconnectTimerRef.current = null;
              connectWebSocket();
            }, 3000);
          }
        };
        
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          socket.close();
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnected(false);
      }
    };
    
    // Initial connection
    connectWebSocket();
    
    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [region, pageSize, page, loadAllVessels, trackPortProximity, proximityRadius]);
  
  // Send updated configuration when props change
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const config = {
        type: 'config',
        region,
        page,
        pageSize,
        sendAllVessels: loadAllVessels,
        trackPortProximity,
        proximityRadius
      };
      
      wsRef.current.send(JSON.stringify(config));
    }
  }, [region, pageSize, page, loadAllVessels, trackPortProximity, proximityRadius]);
  
  return { vessels, connected, lastUpdated, loading };
}