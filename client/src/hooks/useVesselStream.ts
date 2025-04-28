import { useState, useEffect } from 'react';
import { Vessel, Refinery } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { ACCURATE_REFINERIES, convertToRefineries, generateConnectedPorts } from '@/data/refineryData';

interface VesselStreamData {
  vessels: Vessel[];
  refineries: Refinery[];
  stats: any | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook to handle vessel and refinery data using hardcoded refinery locations
 * instead of database calls
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
    // Function to prepare data from static sources
    const fetchData = async () => {
      try {
        console.log('Fetching vessel and refinery data...');
        
        // Convert static refinery data to app format
        const refineriesData = convertToRefineries(ACCURATE_REFINERIES);
        
        // Generate ports connected to refineries
        const portsData = generateConnectedPorts(refineriesData);
        
        console.log(`Loaded ${refineriesData.length} refineries and ${portsData.length} connected ports`);
        
        // Update state with the prepared data
        setData({
          vessels: portsData,
          refineries: refineriesData,
          stats: null, // We can add stats later if needed
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Error preparing data:', error);
        setData(prev => ({
          ...prev,
          error: 'Failed to prepare refinery data',
          loading: false
        }));
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up interval for polling
    const intervalId = setInterval(fetchData, 30000); // Update every 30 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return data;
}