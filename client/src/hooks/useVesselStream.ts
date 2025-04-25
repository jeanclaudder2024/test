import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { Vessel, Refinery } from '@shared/schema';

interface VesselStreamData {
  vessels: Vessel[];
  refineries: Refinery[];
  stats: any | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook to handle real-time vessel and refinery data using WebSocket
 */
export function useVesselStream() {
  const [data, setData] = useState<VesselStreamData>({
    vessels: [],
    refineries: [],
    stats: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Handle incoming messages from WebSocket
  const handleMessage = useCallback((message: any) => {
    try {
      // Legacy format support - handle arrays directly
      if (Array.isArray(message)) {
        // If first item has vesselType, it's vessel data
        if (message.length > 0 && 'vesselType' in message[0]) {
          console.log(`Received vessel data (legacy format): ${message.length} vessels`);
          setData(prev => ({
            ...prev,
            vessels: message as Vessel[],
            loading: false,
            lastUpdated: new Date()
          }));
          return;
        }
        
        // If first item has country, it's refinery data
        if (message.length > 0 && 'country' in message[0]) {
          console.log(`Received refinery data (legacy format): ${message.length} refineries`);
          setData(prev => ({
            ...prev,
            refineries: message as Refinery[],
            loading: false,
            lastUpdated: new Date()
          }));
          return;
        }
        
        console.log('Received unknown array data:', message.length, 'items');
        return;
      }
      
      // New formatted message handling
      if (message && typeof message === 'object' && 'type' in message) {
        // Update state based on message type
        switch (message.type) {
          case 'vessels':
            if (Array.isArray(message.data)) {
              console.log(`Received vessel data: ${message.data.length} vessels`);
              setData(prev => ({
                ...prev,
                vessels: message.data,
                loading: false,
                lastUpdated: new Date()
              }));
            }
            break;
            
          case 'refineries':
            if (Array.isArray(message.data)) {
              console.log(`Received refinery data: ${message.data.length} refineries`);
              setData(prev => ({
                ...prev,
                refineries: message.data,
                loading: false,
                lastUpdated: new Date()
              }));
            }
            break;
            
          case 'stats':
            console.log('Received stats data');
            setData(prev => ({
              ...prev,
              stats: message.data,
              loading: false,
              lastUpdated: new Date()
            }));
            break;
            
          case 'error':
            console.error('Received error from server:', message.data?.message || 'Unknown error');
            setData(prev => ({
              ...prev,
              error: message.data?.message || 'Unknown error',
              loading: false
            }));
            break;
            
          default:
            console.log('Received unknown message type:', message.type);
        }
        return;
      }
      
      // Unknown message format
      console.warn('Received unknown message format:', message);
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
      setData(prev => ({
        ...prev,
        error: 'Failed to process data from server',
        loading: false
      }));
    }
  }, []);

  // Set up WebSocket connection with automatic reconnection
  const { isConnected, error: wsError } = useWebSocket({
    onMessage: handleMessage,
    reconnectOnClose: true,
    reconnectInterval: 3000,
    onOpen: () => {
      console.log('WebSocket connection opened, waiting for data...');
      setData(prev => ({
        ...prev,
        error: null
      }));
    },
    onError: () => {
      setData(prev => ({
        ...prev,
        error: 'Connection error',
        loading: false
      }));
    },
    onClose: () => {
      console.log('WebSocket connection closed');
      setData(prev => ({
        ...prev,
        error: 'Connection to data stream lost',
        loading: true
      }));
    }
  });

  // Update error state if WebSocket connection fails
  useEffect(() => {
    if (wsError) {
      setData(prev => ({
        ...prev,
        error: 'WebSocket connection error',
        loading: false
      }));
    }
  }, [wsError]);

  // Use SSE as a fallback mechanism if WebSocket isn't connected after a timeout
  useEffect(() => {
    if (!isConnected) {
      const fallbackTimer = setTimeout(() => {
        console.log('WebSocket connection not established, using SSE fallback');
        
        // Use EventSource (SSE) as fallback
        const eventSource = new EventSource('/api/stream/data');
        
        eventSource.addEventListener('vessels', (event: MessageEvent) => {
          try {
            const vessels = JSON.parse(event.data);
            setData(prev => ({
              ...prev,
              vessels,
              loading: false,
              lastUpdated: new Date()
            }));
            console.log('SSE: Received vessel data:', vessels.length, 'vessels');
          } catch (error) {
            console.error('SSE: Error parsing vessel data:', error);
          }
        });
        
        eventSource.addEventListener('refineries', (event: MessageEvent) => {
          try {
            const refineries = JSON.parse(event.data);
            setData(prev => ({
              ...prev,
              refineries,
              loading: false,
              lastUpdated: new Date()
            }));
            console.log('SSE: Received refinery data:', refineries.length, 'refineries');
          } catch (error) {
            console.error('SSE: Error parsing refinery data:', error);
          }
        });
        
        eventSource.addEventListener('stats', (event: MessageEvent) => {
          try {
            const stats = JSON.parse(event.data);
            setData(prev => ({
              ...prev,
              stats,
              loading: false,
              lastUpdated: new Date()
            }));
            console.log('SSE: Received stats data');
          } catch (error) {
            console.error('SSE: Error parsing stats data:', error);
          }
        });
        
        eventSource.addEventListener('error', () => {
          console.error('SSE: Connection error');
          setData(prev => ({
            ...prev,
            error: 'SSE connection error',
            loading: false
          }));
        });
        
        return () => {
          console.log('Closing SSE connection');
          eventSource.close();
        };
      }, 5000); // Wait 5 seconds before trying the fallback
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isConnected]);

  return data;
}