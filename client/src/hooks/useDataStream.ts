import { useState, useEffect } from 'react';
import { Vessel, Refinery } from '@/types';
import { Stats } from '@/types';
import { apiRequest } from '@/lib/queryClient';

interface StreamData {
  vessels: Vessel[];
  refineries: Refinery[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook to fetch and periodically update vessel and refinery data
 * 
 * Instead of using SSE (Server-Sent Events) that might be causing WebSocket conflicts,
 * this implementation uses regular polling with React Query.
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

  useEffect(() => {
    // Function to load all data
    const loadAllData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true }));

        // Fetch vessels
        const vesselsPromise = apiRequest('/api/vessels')
          .then(res => res.json())
          .catch(error => {
            console.error('Error fetching vessels:', error);
            return [];
          });

        // Fetch refineries
        const refineriesPromise = apiRequest('/api/refineries')
          .then(res => res.json())
          .catch(error => {
            console.error('Error fetching refineries:', error);
            return [];
          });

        // Fetch stats
        const statsPromise = apiRequest('/api/stats')
          .then(res => res.json())
          .catch(error => {
            console.error('Error fetching stats:', error);
            return null;
          });

        // Wait for all requests to complete
        const [vessels, refineries, stats] = await Promise.all([
          vesselsPromise,
          refineriesPromise,
          statsPromise
        ]);

        // Update state with all data
        setData({
          vessels,
          refineries,
          stats,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });

        console.log('Data refreshed successfully');
      } catch (error) {
        console.error('Error loading data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load data'
        }));
      }
    };

    // Load data initially
    loadAllData();

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(loadAllData, 30000);

    // Clean up on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return data;
}