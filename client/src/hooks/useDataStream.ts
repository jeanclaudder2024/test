import { useState, useEffect } from 'react';
import { Vessel, Refinery } from '@/types';

import { Stats } from '@/types';

interface StreamData {
  vessels: Vessel[];
  refineries: Refinery[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook to connect to the server-sent events stream for vessel and refinery data
 */
export function useDataStream() {
  const [data, setData] = useState<StreamData>({
    vessels: [],
    refineries: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  useEffect(() => {
    const eventSource = new EventSource('/api/stream/data');
    
    // Handle vessel data updates
    eventSource.addEventListener('vessels', (event: MessageEvent) => {
      try {
        const vessels = JSON.parse(event.data);
        setData(prev => ({
          ...prev,
          vessels,
          loading: false,
          lastUpdated: new Date()
        }));
        console.log('Received vessel data:', vessels.length, 'vessels');
      } catch (error) {
        console.error('Error parsing vessel data:', error);
        setData(prev => ({
          ...prev,
          error: 'Failed to parse vessel data',
          loading: false
        }));
      }
    });
    
    // Handle refinery data updates
    eventSource.addEventListener('refineries', (event: MessageEvent) => {
      try {
        const refineries = JSON.parse(event.data);
        setData(prev => ({
          ...prev,
          refineries,
          loading: false,
          lastUpdated: new Date()
        }));
        console.log('Received refinery data:', refineries.length, 'refineries');
      } catch (error) {
        console.error('Error parsing refinery data:', error);
        setData(prev => ({
          ...prev,
          error: 'Failed to parse refinery data',
          loading: false
        }));
      }
    });
    
    // Handle heartbeat to track connection status
    eventSource.addEventListener('heartbeat', (event: MessageEvent) => {
      setData(prev => ({
        ...prev,
        lastUpdated: new Date()
      }));
    });
    
    // Handle errors from the stream
    eventSource.addEventListener('error', (event: MessageEvent) => {
      try {
        if (event.data) {
          const errorData = JSON.parse(event.data);
          setData(prev => ({
            ...prev,
            error: errorData.message || 'Unknown stream error',
            loading: false
          }));
        } else {
          setData(prev => ({
            ...prev,
            error: 'Connection error',
            loading: false
          }));
        }
      } catch (error) {
        setData(prev => ({
          ...prev,
          error: 'Connection error',
          loading: false
        }));
      }
    });
    
    // Handle general connection errors
    eventSource.onerror = () => {
      setData(prev => ({
        ...prev,
        error: 'Connection to data stream lost',
        loading: false
      }));
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        eventSource.close();
        window.location.reload(); // Simple reconnection strategy
      }, 5000);
    };
    
    // Clean up on unmount
    return () => {
      eventSource.close();
    };
  }, []);
  
  return data;
}