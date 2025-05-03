import { useState, useEffect } from 'react';
import { type Vessel, type Refinery } from '@shared/schema';
import { useVesselStream } from './useVesselStream';

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
 * Uses the more robust useVesselStream hook as the data source
 */
export function useDataStream() {
  // Use our more robust vessel stream hook that handles both WebSocket and SSE
  const streamData = useVesselStream();
  
  // If needed, we'll filter the data here to only show relevant vessels
  const [data, setData] = useState<StreamData>({
    vessels: [],
    refineries: [],
    stats: null,
    loading: true,
    error: null,
    lastUpdated: null
  });
  
  // Update our filtered data whenever the stream data changes
  useEffect(() => {
    // Filter to only include cargo vessels
    const cargoVessels = streamData.vessels.filter((vessel: Vessel) => 
      vessel.vesselType?.toLowerCase().includes('cargo')
    );
    
    setData({
      vessels: cargoVessels,
      refineries: streamData.refineries,
      stats: streamData.stats,
      loading: streamData.loading,
      error: streamData.error,
      lastUpdated: streamData.lastUpdated
    });
    
    if (cargoVessels.length > 0) {
      console.log('Filtered data to', cargoVessels.length, 'cargo vessels out of', 
                 streamData.vessels.length, 'total vessels');
    }
  }, [streamData]);
  
  return data;
}