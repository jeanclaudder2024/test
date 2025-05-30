import { useState, useEffect, useRef } from 'react';

export interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built?: number | null;
  deadweight?: number | null;
  currentLat?: string | null;
  currentLng?: string | null;
  departurePort?: number | null;
  departureDate?: string | null;
  departureLat?: string | null;
  departureLng?: string | null;
  destinationPort?: number | null;
  destinationLat?: string | null;
  destinationLng?: string | null;
  eta?: string | null;
  cargoType?: string | null;
  cargoCapacity?: number | null;
  currentRegion?: string | null;
  status?: string | null;
  speed?: string | null;
  buyerName?: string | null;
  sellerName?: string | null;
  ownerName?: string | null;
  operatorName?: string | null;
  oilSource?: string | null;
  metadata?: any;
  lastUpdated?: string | null;
  oilCategory?: string;
  voyageProgress?: number | null;
}

interface UseVesselWebSocketOptions {
  region?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
  loadAllVessels?: boolean;
  trackPortProximity?: boolean;
  proximityRadius?: number;
  refreshInterval?: number;
}

export function useVesselWebSocket(options: UseVesselWebSocketOptions = {}) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const {
    region = 'global',
    limit = 500,
    page = 1,
    pageSize = 500,
    loadAllVessels = false,
    refreshInterval = 30000
  } = options;

  const fetchVessels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Only fetch from your authentic Supabase database
      console.log('Fetching authentic vessels from your Supabase database...');
      
      const params = new URLSearchParams();
      if (region && region !== 'global') params.append('region', region);
      if (limit) params.append('limit', limit.toString());
      if (page) params.append('page', page.toString());
      if (pageSize) params.append('pageSize', pageSize.toString());
      if (loadAllVessels) params.append('all', 'true');
      
      const response = await fetch(`/api/vessels?${params.toString()}`);
      console.log('Database API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vessels: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Database returned ${data?.length || 0} authentic vessels`);
      
      if (data && data.length > 0) {
        console.log('Sample authentic vessel:', data[0]);
        
        // Filter out vessels with invalid coordinates
        const vesselsWithCoordinates = data.filter((v: any) => 
          v.currentLat != null && v.currentLng != null &&
          !isNaN(parseFloat(v.currentLat.toString())) &&
          !isNaN(parseFloat(v.currentLng.toString()))
        );
        
        if (vesselsWithCoordinates.length > 0) {
          console.log(`${vesselsWithCoordinates.length} vessels have valid coordinates`);
          setVessels(vesselsWithCoordinates);
        } else {
          console.warn('No vessels have valid coordinates, using original data');
          setVessels(data);
        }
        
        setLastUpdated(new Date().toISOString());
        setConnectionStatus('connected');
      } else {
        console.log('No vessels found in database');
        setVessels([]);
      }
      
    } catch (err) {
      console.error('Error fetching vessels:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vessels');
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, [region, limit, page, pageSize, loadAllVessels]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchVessels, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval]);

  const refetch = () => {
    fetchVessels();
  };

  return {
    vessels,
    loading,
    error,
    lastUpdated,
    connectionStatus,
    refetch,
    isConnected: connectionStatus === 'connected'
  };
}