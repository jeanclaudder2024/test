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
            console.log('WebSocket message received, length:', event.data.length);
            const data = JSON.parse(event.data);
            
            // Handle different message types
            if (data.type === 'vessels') {
              console.log(`WebSocket vessels message contains ${data.vessels?.length || 0} vessels`);
              
              // Check if vessels have all the needed properties
              if (data.vessels && data.vessels.length > 0) {
                console.log('Sample vessel from WebSocket:', data.vessels[0]);
                
                // Make sure vessels have proper coordinates
                const vesselsWithCoordinates = data.vessels.filter(v => 
                  v.currentLat != null && v.currentLng != null &&
                  !isNaN(parseFloat(v.currentLat.toString())) &&
                  !isNaN(parseFloat(v.currentLng.toString()))
                );
                
                if (vesselsWithCoordinates.length > 0) {
                  console.log(`${vesselsWithCoordinates.length} vessels have valid coordinates`);
                  setVessels(vesselsWithCoordinates);
                } else {
                  console.warn('No vessels have valid coordinates, using original data');
                  setVessels(data.vessels || []);
                }
                
                setLastUpdated(new Date().toISOString());
                setLoading(false);
              } else {
                console.warn('Received empty vessels data from WebSocket');
                setVessels([]);
                setLoading(false);
              }
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
        
        // Try several endpoints in sequence

        // 1. Try the vessels/polling endpoint (optimized for real-time)
        console.log('Trying polling endpoint first...');
        try {
          const pollingResponse = await fetch(`/api/vessels/polling?${params.toString()}`);
          console.log('Polling endpoint status:', pollingResponse.status);
          
          if (pollingResponse.ok) {
            const pollingData = await pollingResponse.json();
            console.log(`Polling endpoint returned vessels object with ${pollingData.vessels?.length || 0} vessels`);
            
            if (pollingData.vessels && pollingData.vessels.length > 0) {
              console.log('Sample vessel from polling:', pollingData.vessels[0]);
              setVessels(pollingData.vessels);
              setLastUpdated(pollingData.timestamp || new Date().toISOString());
              setLoading(false);
              return;
            } else {
              console.log('Polling endpoint returned empty vessels array, trying next option');
            }
          }
        } catch (pollingError) {
          console.warn('Polling endpoint failed:', pollingError);
        }
        
        // 2. Try the static backup endpoint
        console.log('Trying static endpoint...');
        try {
          const staticResponse = await fetch('/api/vessels/static');
          console.log('Static endpoint status:', staticResponse.status);
          
          if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            console.log(`Static endpoint returned ${staticData?.length || 0} vessels`);
            
            if (staticData && staticData.length > 0) {
              console.log('Sample vessel from static endpoint:', staticData[0]);
              setVessels(staticData);
              setLastUpdated(new Date().toISOString());
              setLoading(false);
              return;
            } else {
              console.log('Static endpoint returned empty array, trying regular endpoint');
            }
          }
        } catch (staticError) {
          console.warn('Static endpoint failed:', staticError);
        }
        
        // 3. Try the regular vessels endpoint
        console.log('Trying regular vessels endpoint...');
        const response = await fetch(`/api/vessels?${params.toString()}`);
        console.log('Regular API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vessels: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Regular API returned ${data?.length || 0} vessels`);
        
        if (data && data.length > 0) {
          console.log('Sample vessel from regular endpoint:', data[0]);
          
          // Filter out vessels with invalid coordinates
          const vesselsWithCoordinates = data.filter((v: any) => 
            v.currentLat != null && v.currentLng != null &&
            !isNaN(parseFloat(v.currentLat.toString())) &&
            !isNaN(parseFloat(v.currentLng.toString()))
          );
          
          if (vesselsWithCoordinates.length > 0) {
            console.log(`${vesselsWithCoordinates.length} vessels have valid coordinates`);
            setVessels(vesselsWithCoordinates);
          } else {
            console.warn('No vessels have valid coordinates, using original data');
            setVessels(data);
          }
        } else {
          console.warn('Regular endpoint returned empty array, using empty vessel array');
          setVessels([]);
        }
        
        setLastUpdated(new Date().toISOString());
        setLoading(false);
      } catch (err) {
        console.error('All REST API fallbacks failed:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch vessel data from all sources'));
        setLoading(false);
        setVessels([]); // Set empty array to avoid undefined issues
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