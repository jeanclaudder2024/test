import { useState, useEffect, useRef } from 'react';
import { Vessel } from '@shared/schema';
import axios from 'axios';

// Accept string for simple usage or object for advanced options
type UseVesselWebSocketProps = string | {
  region: string;
  pollingInterval?: number; // Polling interval in milliseconds (for REST fallback)
  page?: number;
  pageSize?: number;
  loadAllVessels?: boolean; // Flag to load all vessels at once (no pagination)
};

interface WebSocketMessage {
  type: string;
  vessels?: Vessel[];
  timestamp?: string;
  count?: number;
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  error?: string;
}

/**
 * Hook for connecting to the vessel tracking WebSocket to receive real-time vessel updates
 * Falls back to REST API polling if WebSocket connection fails
 * Supports pagination for larger datasets
 */
export function useVesselWebSocket(props: UseVesselWebSocketProps = 'global') {
  // Handle both string and object props
  const region = typeof props === 'string' ? props : props.region;
  const pollingInterval = typeof props === 'object' ? props.pollingInterval || 30000 : 30000;
  const initialPage = typeof props === 'object' && props.page ? props.page : 1;
  const initialPageSize = typeof props === 'object' && props.pageSize ? props.pageSize : 500;
  const loadAllVessels = typeof props === 'object' ? props.loadAllVessels || false : false;
  
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usePolling, setUsePolling] = useState(false); // Track if we're using polling as fallback
  
  // Pagination state
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        
        // Use the current host (includes port if needed) rather than trying to specify port 5000
        const host = window.location.host;
        // Use the proper protocol based on the current connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        // Create the WebSocket URL with the current host and the /ws path
        const wsUrl = `${protocol}//${host}/ws`;
        
        console.log('Connecting to WebSocket URL:', wsUrl);
        
        // Create new WebSocket connection
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        
        // Set up event handlers
        socket.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          
          // Only send messages if socket is fully open
          setTimeout(() => {
            if (socket.readyState === WebSocket.OPEN) {
              // If region is specified, subscribe to region-specific updates
              if (region) {
                socket.send(JSON.stringify({ 
                  type: 'subscribe_region',
                  region 
                }));
              }
              
              // Request initial data with all vessels if specified
              socket.send(JSON.stringify({ 
                type: 'request_vessels',
                allVessels: loadAllVessels 
              }));
            }
          }, 500); // Add a small delay to ensure socket is ready
        };
        
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            console.log('Received WebSocket message:', message);
            
            if (message.type === 'vessel_update' && message.vessels) {
              console.log(`Received ${message.vessels.length} vessels from server (page ${message.currentPage || 1}/${message.totalPages || 1})`);
              
              // Update pagination information
              if (message.totalCount) setTotalCount(message.totalCount);
              if (message.totalPages) setTotalPages(message.totalPages);
              if (message.currentPage) setPage(message.currentPage);
              if (message.pageSize) setPageSize(message.pageSize);
              
              // Check if vessels have valid coordinates
              const vesselsWithCoordinates = message.vessels.filter(
                v => v.currentLat && v.currentLng && 
                parseFloat(v.currentLat) && parseFloat(v.currentLng)
              );
              
              console.log(`${vesselsWithCoordinates.length} of ${message.vessels.length} vessels have valid coordinates`);
              
              if (vesselsWithCoordinates.length > 0) {
                // Log some sample coordinates
                console.log('Sample vessel coordinates:', 
                  vesselsWithCoordinates.slice(0, 3).map(v => 
                    `${v.name}: (${v.currentLat}, ${v.currentLng})`).join(', ')
                );
              }
              
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
        
        // Switch to REST API polling fallback after a few failed attempts
        if (!usePolling) {
          console.log('Switching to REST API polling as fallback');
          setUsePolling(true);
          startPolling();
        } else {
          // If already using polling, schedule a websocket reconnection attempt
          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket();
          }, 30000); // Try websocket again after 30 seconds
        }
      }
    };
    
    // Function to poll the REST API for vessel data
    const startPolling = () => {
      // Clear any existing polling interval
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
      
      // Function to fetch data via REST API
      const pollVesselData = async () => {
        try {
          setIsLoading(true);
          console.log('Polling REST API for vessel data...');
          
          // Build URL with optional region parameter and pagination
          const url = `/api/vessels/polling?${region && region !== 'global' ? `region=${region}&` : ''}page=${page}&pageSize=${pageSize}`;
          
          const response = await axios.get(url);
          const data = response.data;
          
          if (data.vessels) {
            console.log(`Received ${data.vessels.length} vessels from REST API (page ${data.currentPage || 1}/${data.totalPages || 1})`);
            
            // Update pagination information from API response
            if (data.totalCount) setTotalCount(data.totalCount);
            if (data.totalPages) setTotalPages(data.totalPages);
            if (data.currentPage) setPage(data.currentPage);
            if (data.pageSize) setPageSize(data.pageSize);
            
            setVessels(data.vessels);
            setLastUpdated(data.timestamp || new Date().toISOString());
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error polling REST API:', error);
          setError('Failed to fetch vessel data');
          setIsLoading(false);
          
          // Try to reconnect to WebSocket if REST API fails
          if (usePolling) {
            console.log('REST API failed, attempting WebSocket reconnection');
            connectWebSocket();
          }
        }
      };
      
      // Execute immediately
      pollVesselData();
      
      // Then set up interval
      pollingTimerRef.current = setInterval(pollVesselData, pollingInterval);
    };
    
    // Initial connection
    connectWebSocket();
    
    // Clean up function when component unmounts
    return () => {
      cleanup();
      
      // Also clear polling interval if it exists
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [region, pollingInterval, usePolling, loadAllVessels]);
  
  // Request updated data for a specific region when the region changes
  useEffect(() => {
    if (isConnected && socketRef.current && region && socketRef.current.readyState === WebSocket.OPEN) {
      // Add a slight delay to ensure the socket is ready
      setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          // Subscribe to region-specific updates
          socketRef.current.send(JSON.stringify({ 
            type: 'subscribe_region',
            region 
          }));
          
          // Also request immediate update with the new region filter and all vessels if specified
          socketRef.current.send(JSON.stringify({ 
            type: 'request_vessels',
            allVessels: loadAllVessels 
          }));
        }
      }, 100);
    }
  }, [region, isConnected, loadAllVessels]);
  
  // Function to manually request vessel data
  const refreshData = (newPage?: number, newPageSize?: number) => {
    setIsLoading(true);
    
    // Update pagination parameters if provided
    if (newPage !== undefined) {
      setPage(newPage);
    }
    
    if (newPageSize !== undefined) {
      setPageSize(newPageSize);
    }
    
    const currentPage = newPage !== undefined ? newPage : page;
    const currentPageSize = newPageSize !== undefined ? newPageSize : pageSize;
    
    if (usePolling) {
      // If using REST API polling, manually trigger a poll
      const pollVesselData = async () => {
        try {
          console.log(`Manual refresh: Polling REST API for vessel data (page ${currentPage}, pageSize ${currentPageSize})...`);
          
          // Build URL with optional region parameter and pagination
          const url = `/api/vessels/polling?${region && region !== 'global' ? `region=${region}&` : ''}page=${currentPage}&pageSize=${currentPageSize}`;
          
          const response = await axios.get(url);
          const data = response.data;
          
          if (data.vessels) {
            console.log(`Received ${data.vessels.length} vessels from REST API (page ${data.currentPage || 1}/${data.totalPages || 1})`);
            
            // Update pagination information from API response
            if (data.totalCount) setTotalCount(data.totalCount);
            if (data.totalPages) setTotalPages(data.totalPages);
            if (data.currentPage) setPage(data.currentPage);
            if (data.pageSize) setPageSize(data.pageSize);
            
            setVessels(data.vessels);
            setLastUpdated(data.timestamp || new Date().toISOString());
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error polling REST API:', error);
          setError('Failed to fetch vessel data');
          setIsLoading(false);
        }
      };
      
      pollVesselData();
    } else if (isConnected && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // If using WebSocket, send a request for vessels with pagination parameters
      socketRef.current.send(JSON.stringify({ 
        type: 'request_vessels',
        page: currentPage,
        pageSize: currentPageSize,
        allVessels: loadAllVessels
      }));
    } else {
      // If not connected, set an error - the main WebSocket effect will handle reconnection
      console.log('Not connected to WebSocket, attempting to reconnect');
      setError('Not connected. Attempting to reconnect...');
      
      // Just trigger loading state and wait for reconnection attempts
      setIsLoading(true);
    }
  };
  
  // Determine connection type for UI display
  const connectionType = usePolling 
    ? "REST API" 
    : (isConnected ? "WebSocket" : "Disconnected");

  // Function to change page
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      refreshData(newPage, pageSize);
    }
  };
  
  // Function to change page size
  const changePageSize = (newPageSize: number) => {
    if (newPageSize > 0 && newPageSize <= 500) {
      // Reset to page 1 when changing page size
      refreshData(1, newPageSize);
    }
  };
  
  return {
    // Data
    vessels,
    loading: isLoading,
    connected: isConnected,
    lastUpdated,
    error,
    
    // Connection info
    usingFallback: usePolling,
    connectionType,
    
    // Pagination info
    page,
    pageSize,
    totalPages,
    totalCount,
    
    // Functions
    refreshData,
    goToPage,
    changePageSize
  };
}