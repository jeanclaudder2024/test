import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Vessel, Refinery } from '@shared/schema';
import { fetchVesselsFromAPI, fetchRefineries } from '@/services/marineTrafficService';

/**
 * Custom hook to stream vessel and refinery data directly from the Marine Traffic API
 */
export const useDataStream = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Fetch vessels directly from Marine Traffic API
  const vesselsQuery = useQuery({
    queryKey: ['marine-traffic-vessels'],
    queryFn: async () => {
      try {
        return await fetchVesselsFromAPI();
      } catch (error) {
        console.error('Error fetching vessels from Marine Traffic API:', error);
        return [];
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch refineries from our fallback data
  const refineriesQuery = useQuery({
    queryKey: ['refineries'],
    queryFn: async () => {
      try {
        return await fetchRefineries();
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