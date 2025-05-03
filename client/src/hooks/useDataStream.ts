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
  
  // Update our data whenever the stream data changes
  useEffect(() => {
    // Include all vessels - don't filter by type to ensure vessel detail page works
    setData({
      vessels: streamData.vessels,
      refineries: streamData.refineries,
      stats: streamData.stats,
      loading: streamData.loading,
      error: streamData.error,
      lastUpdated: streamData.lastUpdated
    });
    
    if (streamData.vessels.length > 0) {
      console.log('Using all', streamData.vessels.length, 'vessels from data stream');
    }
  }, [streamData]);
  
  return data;
}