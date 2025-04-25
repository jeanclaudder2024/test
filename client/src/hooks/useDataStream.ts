import { useState, useEffect, useCallback } from 'react';
import { Vessel, Refinery } from '@shared/schema';
import { useWebSocket } from './useWebSocket';

interface StreamData {
  vessels: Vessel[];
  refineries: Refinery[];
  stats: any | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook to connect to the server-sent events stream for vessel and refinery data
 * Prioritizes WebSocket connection with fallback to SSE
 */
export function useDataStream() {
  const [data, setData] = useState<StreamData>({
    vessels: [],
    refineries: [],
    stats: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Process incoming vessel data to filter for cargo vessels
  const processVesselData = useCallback((vessels: Vessel[]) => {
    // Filter to only include cargo vessels
    const cargoVessels = vessels.filter((vessel: Vessel) => 
      vessel.vesselType?.toLowerCase().includes('cargo')
    );
    
    setData(prev => ({
      ...prev,
      vessels: cargoVessels,
      loading: false,
      lastUpdated: new Date()
    }));
    console.log('Received vessel data:', cargoVessels.length, 'cargo vessels out of', vessels.length, 'total vessels');
  }, []);

  // Process refinery data
  const processRefineryData = useCallback((refineries: Refinery[]) => {
    setData(prev => ({
      ...prev,
      refineries,
      loading: false,
      lastUpdated: new Date()
    }));
    console.log('Received refinery data:', refineries.length, 'refineries');
  }, []);

  // Process stats data
  const processStatsData = useCallback((stats: any) => {
    setData(prev => ({
      ...prev,
      stats,
      loading: false,
      lastUpdated: new Date()
    }));
    console.log('Received stats data');
  }, []);

  // Handle errors
  const handleError = useCallback((errorMessage: string) => {
    console.error('Data stream error:', errorMessage);
    setData(prev => ({
      ...prev,
      error: errorMessage,
      loading: false
    }));
  }, []);

  // Process WebSocket messages
  const handleWSMessage = useCallback((message: any) => {
    try {
      if (!message || !message.type) return;

      switch (message.type) {
        case 'vessels':
          processVesselData(message.data);
          break;
        case 'refineries':
          processRefineryData(message.data);
          break;
        case 'stats':
          processStatsData(message.data);
          break;
        case 'error':
          handleError(message.error || 'Unknown error');
          break;
        case 'heartbeat':
          setData(prev => ({ ...prev, lastUpdated: new Date() }));
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
      handleError('Failed to process data from WebSocket');
    }
  }, [processVesselData, processRefineryData, processStatsData, handleError]);

  // Set up WebSocket connection with automatic reconnection
  const { isConnected } = useWebSocket({
    onMessage: handleWSMessage,
    reconnectOnClose: true,
    reconnectInterval: 3000,
    onOpen: () => {
      console.log('WebSocket connection opened');
      setData(prev => ({ ...prev, error: null }));
    },
    onError: () => handleError('WebSocket connection error'),
    onClose: () => {
      console.log('WebSocket connection closed');
      setData(prev => ({
        ...prev,
        error: 'Connection to WebSocket lost, attempting to use SSE fallback',
        loading: true
      }));
    }
  });
  
  // Use SSE as a fallback if WebSocket connection fails
  useEffect(() => {
    // Only use SSE if WebSocket is not connected
    if (isConnected) return;
    
    // Add delay before using SSE fallback to give WebSocket time to connect
    const fallbackTimer = setTimeout(() => {
      console.log('Using Server-Sent Events (SSE) for data streaming...');
      const eventSource = new EventSource('/api/stream/data');
      
      // Handle vessel data updates
      eventSource.addEventListener('vessels', (event: MessageEvent) => {
        try {
          const vessels = JSON.parse(event.data);
          processVesselData(vessels);
        } catch (error) {
          console.error('Error parsing SSE vessel data:', error);
          handleError('Failed to parse vessel data');
        }
      });
      
      // Handle refinery data updates
      eventSource.addEventListener('refineries', (event: MessageEvent) => {
        try {
          const refineries = JSON.parse(event.data);
          processRefineryData(refineries);
        } catch (error) {
          console.error('Error parsing SSE refinery data:', error);
          handleError('Failed to parse refinery data');
        }
      });
      
      // Handle stats data updates
      eventSource.addEventListener('stats', (event: MessageEvent) => {
        try {
          const stats = JSON.parse(event.data);
          processStatsData(stats);
        } catch (error) {
          console.error('Error parsing SSE stats data:', error);
          handleError('Failed to parse stats data');
        }
      });
      
      // Handle heartbeat to track connection status
      eventSource.addEventListener('heartbeat', () => {
        setData(prev => ({ ...prev, lastUpdated: new Date() }));
      });
      
      // Handle errors from the stream
      eventSource.addEventListener('error', (event: MessageEvent) => {
        try {
          if (event.data) {
            const errorData = JSON.parse(event.data);
            handleError(errorData.message || 'Unknown stream error');
          } else {
            handleError('SSE connection error');
          }
        } catch (error) {
          handleError('SSE connection error');
        }
      });
      
      // Handle general connection errors
      eventSource.onerror = () => {
        handleError('Connection to SSE stream lost');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          eventSource.close();
          window.location.reload(); // Simple reconnection strategy
        }, 5000);
      };
      
      // Clean up on unmount or if WebSocket connects
      return () => {
        console.log('Closing SSE connection');
        eventSource.close();
      };
    }, 3000); // Wait 3 seconds before trying the SSE fallback
    
    return () => clearTimeout(fallbackTimer);
  }, [isConnected, processVesselData, processRefineryData, processStatsData, handleError]);
  
  return data;
}