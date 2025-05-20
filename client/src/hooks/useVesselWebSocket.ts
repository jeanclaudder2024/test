import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [totalCount, setTotalCount] = useState<number>(0);
  const socket = useRef<WebSocket | null>(null);
  const reconnectInterval = useRef<NodeJS.Timeout | null>(null);

  // Fallback to REST API when WebSocket fails
  const fetchVesselsViaREST = useCallback(async () => {
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
  }, [region, loadAllVessels, page, pageSize]);

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
    const host = window.location.host;
    const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
    
    // Make sure host is defined before creating the URL
    if (!host) {
      console.warn('WebSocket connection failed: Host is undefined, will use fallback');
      // Use fallback immediately
      fetchVesselsViaREST();
      return;
    }
    
    // Always use the current domain and explicit port for WebSocket connections
    const wsUrl = `${protocol}//${host}/ws`;
    
    // Add a unique token to prevent caching issues
    const uniqueToken = Math.random().toString(36).substring(2, 15);
    const finalWsUrl = `${wsUrl}?token=${uniqueToken}`;
    
    console.log('Attempting to connect WebSocket to URL:', finalWsUrl);
    
    const setupSocketEventListeners = (ws: WebSocket) => {
      // Connection opened
      ws.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setConnected(true);
        setError(null);
        
        // Send configuration message
        if (ws.readyState === WebSocket.OPEN) {
          const configMessage = JSON.stringify({
            type: 'config',
            region,
            loadAllVessels,
            page,
            pageSize,
            trackPortProximity,
            proximityRadius
          });
          
          ws.send(configMessage);
        }
      });
      
      // Listen for messages
      ws.addEventListener('message', (event) => {
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
              const vesselsWithCoordinates = data.vessels.filter((v: any) => 
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
              
              // Update total count if available
              if (data.totalCount !== undefined) {
                setTotalCount(data.totalCount);
              } else {
                setTotalCount(data.vessels?.length || 0);
              }
              
              setLastUpdated(new Date().toISOString());
              setLoading(false);
            } else {
              console.warn('Received empty vessels data from WebSocket');
              setVessels([]);
              setTotalCount(0);
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
      
      // Handle errors with better logging
      ws.addEventListener('error', (event) => {
        // Log the error but don't treat it as critical since we have fallbacks
        console.log('WebSocket connection issue - falling back to REST API');
        setConnected(false);
        setError(new Error('WebSocket connection issue - using fallback'));
      });
      
      // Connection closed
      ws.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        setConnected(false);
        
        // Try to reconnect if not intentionally closed
        if (!socket.current) return;
        
        // Use fallback to REST API if WebSocket fails
        fetchVesselsViaREST();
      });
      
      return ws;
    };
    
    // Connect to WebSocket with additional error handling
    try {
      // Check host availability
      if (!host) {
        console.error('WebSocket connection failed: Host is undefined');
        throw new Error('Host is undefined');
      }
      
      // Create WebSocket connection with error handling
      try {
        socket.current = new WebSocket(finalWsUrl);
        setupSocketEventListeners(socket.current);
      } catch (wsError) {
        console.error('Initial WebSocket connection failed:', wsError);
        // Fallback to REST immediately
        fetchVesselsViaREST();
        throw wsError; // Propagate the error
      }
      
      // Set up reconnection interval
      if (!reconnectInterval.current) {
        reconnectInterval.current = setInterval(() => {
          if (socket.current?.readyState !== WebSocket.OPEN) {
            try {
              console.log('Attempting to reconnect WebSocket...');
              // Ensure we're connecting to the correct WebSocket URL
              const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
              const host = window.location.host;
              
              // Make sure host is not empty
              if (!host) {
                console.error('WebSocket reconnection failed: Host is undefined');
                fetchVesselsViaREST();
                return;
              }
              
              const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
              
              // Add a unique token to prevent caching issues
              const reconnectToken = Math.random().toString(36).substring(2, 15);
              const reconnectUrl = `${protocol}//${host}/ws?token=${reconnectToken}`;
              console.log('WebSocket reconnect URL:', reconnectUrl);
              
              socket.current = new WebSocket(reconnectUrl);
              setupSocketEventListeners(socket.current);
            } catch (reconnectError) {
              console.error('Failed to reconnect WebSocket:', reconnectError);
              fetchVesselsViaREST();
            }
          }
        }, 5000); // Try to reconnect every 5 seconds
      }
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError(err instanceof Error ? err : new Error('Unknown error creating WebSocket'));
      setConnected(false);
      
      // Use fallback to REST API if WebSocket fails
      fetchVesselsViaREST();
    }
    
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
  }, [region, loadAllVessels, page, pageSize, trackPortProximity, proximityRadius, fetchVesselsViaREST]);
  
  // Function to manually send a message to the WebSocket
  const sendMessage = (message: any) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
      
      // If refresh message, update the last updated timestamp
      if (message.type === 'refresh') {
        setLastUpdated(new Date().toISOString());
      }
      return true;
    } else {
      console.warn('WebSocket not connected, cannot send message. Trying fallback...');
      // For refresh messages, fallback to REST API
      if (message.type === 'refresh') {
        fetchVesselsViaREST();
      }
    }
    return false;
  };
  
  // Calculate total pages based on total count and page size
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  // Function to go to a specific page
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // Update configuration via WebSocket if connected
      if (socket.current?.readyState === WebSocket.OPEN) {
        const configMessage = JSON.stringify({
          type: 'config',
          region,
          loadAllVessels,
          page: newPage,
          pageSize,
          trackPortProximity,
          proximityRadius
        });
        
        socket.current.send(configMessage);
      }
    }
  };
  
  // Function to change page size
  const changePageSize = (newPageSize: number) => {
    if (newPageSize > 0) {
      // Update configuration via WebSocket if connected
      if (socket.current?.readyState === WebSocket.OPEN) {
        const configMessage = JSON.stringify({
          type: 'config',
          region,
          loadAllVessels,
          page: 1, // Reset to page 1 when changing page size
          pageSize: newPageSize,
          trackPortProximity,
          proximityRadius
        });
        
        socket.current.send(configMessage);
      }
    }
  };
  
  // Determine connection type
  const connectionType = connected ? 'websocket' : 'rest';
  
  return {
    vessels,
    connected,
    error,
    loading,
    lastUpdated,
    totalCount,
    totalPages,
    page,
    pageSize,
    goToPage,
    changePageSize,
    connectionType,
    sendMessage
  };
}