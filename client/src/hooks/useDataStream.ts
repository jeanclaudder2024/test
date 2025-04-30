import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Vessel, Refinery } from '@shared/schema';

/**
 * Custom hook to stream vessel and refinery data from the API
 */
export const useDataStream = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Fetch vessels
  const vesselsQuery = useQuery({
    queryKey: ['/api/vessels'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/vessels');
        return response.data as Vessel[];
      } catch (error) {
        console.error('Error fetching vessels:', error);
        return [];
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch refineries
  const refineriesQuery = useQuery({
    queryKey: ['/api/refineries'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/refineries');
        return response.data as Refinery[];
      } catch (error) {
        console.error('Error fetching refineries:', error);
        return [];
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Update last updated timestamp when data refreshes
  useEffect(() => {
    if (vesselsQuery.isSuccess || refineriesQuery.isSuccess) {
      setLastUpdated(new Date());
    }
  }, [vesselsQuery.dataUpdatedAt, refineriesQuery.dataUpdatedAt]);
  
  // Refetch both queries
  const refetch = useCallback(() => {
    vesselsQuery.refetch();
    refineriesQuery.refetch();
  }, [vesselsQuery, refineriesQuery]);
  
  // Loading state based on both queries
  const loading = vesselsQuery.isLoading || refineriesQuery.isLoading || 
                  vesselsQuery.isFetching || refineriesQuery.isFetching;
  
  // Error state based on both queries
  const error = vesselsQuery.error || refineriesQuery.error;
  
  return {
    vessels: vesselsQuery.data || [],
    refineries: refineriesQuery.data || [],
    loading,
    error,
    refetch,
    lastUpdated,
  };
};