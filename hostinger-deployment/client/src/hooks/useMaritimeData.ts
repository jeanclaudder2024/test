import { useState, useEffect } from 'react';
import { Refinery, Port } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

interface UseMaritimeDataProps {
  region?: string;
}

export function useMaritimeData({ region = 'global' }: UseMaritimeDataProps = {}) {
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);

  // Fetch refineries with region filter
  const { 
    data: refineriesData, 
    isLoading: refineriesLoading,
    error: refineriesError
  } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries', region !== 'global' ? region : undefined],
    queryFn: async () => {
      const queryParams = region && region !== 'global' ? `?region=${encodeURIComponent(region)}` : '';
      const response = await fetch(`/api/refineries${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch refineries');
      }
      
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });

  // Fetch ports with region filter
  const { 
    data: portsData, 
    isLoading: portsLoading,
    error: portsError
  } = useQuery<Port[]>({
    queryKey: ['/api/ports', region !== 'global' ? region : undefined],
    queryFn: async () => {
      const queryParams = region && region !== 'global' ? `?region=${encodeURIComponent(region)}` : '';
      const response = await fetch(`/api/ports${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ports');
      }
      
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });

  // Update state when data changes
  useEffect(() => {
    if (refineriesData) {
      setRefineries(refineriesData);
    }
  }, [refineriesData]);

  useEffect(() => {
    if (portsData) {
      setPorts(portsData);
    }
  }, [portsData]);

  return {
    refineries,
    ports,
    loading: refineriesLoading || portsLoading,
    error: refineriesError || portsError,
  };
}