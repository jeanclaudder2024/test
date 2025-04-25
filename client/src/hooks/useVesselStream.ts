import { useState, useEffect } from 'react';
import { Vessel, Refinery } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface VesselStreamData {
  vessels: Vessel[];
  refineries: Refinery[];
  stats: any | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook to handle vessel and refinery data using regular fetch requests
 * instead of WebSockets or SSE
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

  useEffect(() => {
    // Function to fetch data from the API
    const fetchData = async () => {
      try {
        console.log('Fetching vessel and refinery data...');
        
        // Fetch vessels
        const vesselsResponse = await apiRequest('GET', '/api/vessels?limit=500');
        const vesselsData = await vesselsResponse.json();
        
        // Fetch refineries
        const refineriesResponse = await apiRequest('GET', '/api/refineries');
        const refineriesData = await refineriesResponse.json();
        
        console.log(`Received ${vesselsData.length} vessels and ${refineriesData.length} refineries`);
        
        // Update state with the fetched data
        setData({
          vessels: vesselsData,
          refineries: refineriesData,
          stats: null, // We can add stats later if needed
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setData(prev => ({
          ...prev,
          error: 'Failed to fetch data from server',
          loading: false
        }));
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up interval for polling
    const intervalId = setInterval(fetchData, 10000); // Fetch every 10 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return data;
}