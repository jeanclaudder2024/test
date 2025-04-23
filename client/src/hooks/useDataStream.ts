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
        const vesselsResponse = await fetch('/api/vessels');
        const vessels = await vesselsResponse.json();
        
        // Fetch refineries
        const refineriesResponse = await fetch('/api/refineries');
        const refineries = await refineriesResponse.json();
        
        // Fetch stats
        const statsResponse = await fetch('/api/stats');
        const stats = await statsResponse.json();

        console.log('Data loaded:', { 
          vessels: vessels?.length || 0, 
          refineries: refineries?.length || 0,
          stats: stats ? 'stats loaded' : 'no stats'
        });

        // Update state with all data
        setData({
          vessels: vessels || [],
          refineries: refineries || [],
          stats: stats || null,
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

    console.log('useDataStream hook initialized, loading data...');
    
    // Load data initially
    loadAllData();

    // Set up polling interval (every 15 seconds)
    const interval = setInterval(loadAllData, 15000);

    // Clean up on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return data;
}