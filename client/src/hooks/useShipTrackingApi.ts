import { useEffect, useState } from 'react';
import { getVesselDetails, VesselDetails } from '@/api/vesselTracking';
import { useToast } from './use-toast';

interface UseShipTrackingApiOptions {
  autoFetch?: boolean;
  refreshInterval?: number | null;
}

export function useShipTrackingApi(mmsi: string, options: UseShipTrackingApiOptions = {}) {
  const [vessel, setVessel] = useState<VesselDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const { autoFetch = false, refreshInterval = null } = options;

  // Function to fetch the vessel data
  const fetchVesselData = async () => {
    if (!mmsi || mmsi.length !== 9) {
      setError('Invalid MMSI number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // We don't need to pass an API key because the server will use the one from environment variables
      const data = await getVesselDetails(mmsi);
      setVessel(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && mmsi) {
      fetchVesselData();
    }
  }, [mmsi, autoFetch]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && mmsi) {
      const intervalId = setInterval(fetchVesselData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [mmsi, refreshInterval]);

  return {
    vessel,
    loading,
    error,
    lastUpdated,
    fetchVesselData,
  };
}