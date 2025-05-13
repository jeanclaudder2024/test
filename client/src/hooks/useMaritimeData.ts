import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Refinery, Port } from '@shared/schema';

interface MaritimeDataProps {
  region?: string;
}

interface MaritimeDataResult {
  refineries: Refinery[];
  ports: Port[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMaritimeData({ region = 'global' }: MaritimeDataProps): MaritimeDataResult {
  // Fetch refineries
  const {
    data: refineries = [],
    error: refineriesError,
    isLoading: refineriesLoading,
    refetch: refetchRefineries
  } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries', region],
    queryFn: async () => {
      const url = region === 'global' 
        ? '/api/refineries' 
        : `/api/refineries?region=${encodeURIComponent(region)}`;
      const response = await fetch(url);
      return response.json();
    },
  });

  // Fetch ports
  const {
    data: ports = [],
    error: portsError,
    isLoading: portsLoading,
    refetch: refetchPorts
  } = useQuery<Port[]>({
    queryKey: ['/api/ports', region],
    queryFn: async () => {
      const url = region === 'global' 
        ? '/api/ports' 
        : `/api/ports?region=${encodeURIComponent(region)}`;
      const response = await fetch(url);
      return response.json();
    },
  });

  // Combine loading states and errors
  const loading = refineriesLoading || portsLoading;
  const error = refineriesError || portsError;

  // Combined refetch function
  const refetch = () => {
    refetchRefineries();
    refetchPorts();
  };

  return {
    refineries,
    ports,
    loading,
    error: error as Error | null,
    refetch
  };
}