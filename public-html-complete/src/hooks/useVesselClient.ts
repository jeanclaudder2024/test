import { useState, useEffect, useCallback } from 'react';
import { Vessel } from '@/types';
import { vesselClient, ConnectionStatus, VesselTrackingConfig } from '@/api/vesselWebSocketClient';

interface UseVesselClientProps {
  region?: string;
  page?: number;
  pageSize?: number;
  vesselType?: string;
  trackPortProximity?: boolean;
  proximityRadius?: number;
}

export function useVesselClient({
  region = 'global',
  page = 1,
  pageSize = 500,
  vesselType = 'oil',
  trackPortProximity = false,
  proximityRadius = 50
}: UseVesselClientProps = {}) {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  
  // Connect to vessel client on mount
  useEffect(() => {
    // Listen for vessel data
    const handleVessels = (data: any) => {
      console.log(`Received ${data.vessels.length} vessels from ${data.source || 'websocket'}`);
      setVessels(data.vessels);
      setTotalCount(data.totalCount || data.vessels.length);
      setLastUpdated(new Date().toISOString());
      setLoading(false);
    };
    
    // Listen for status changes
    const handleStatus = (data: any) => {
      setConnectionStatus(data.status);
      // Set loading state based on connection status
      if (data.status === 'connecting') {
        setLoading(true);
      }
    };
    
    // Listen for errors
    const handleError = (data: any) => {
      console.error('Vessel client error:', data.message);
      setError(new Error(data.message));
      setLoading(false);
    };
    
    // Register event handlers
    vesselClient.on('vessels', handleVessels);
    vesselClient.on('status', handleStatus);
    vesselClient.on('error', handleError);
    
    // Set initial config and connect
    vesselClient.updateConfig({
      region,
      page,
      pageSize,
      vesselType,
      trackPortProximity,
      proximityRadius,
      maxOilVessels: 1540 // Limit to exactly 1,540 oil vessels
    });
    
    // Connect if not already connected
    if (vesselClient.getStatus() === 'disconnected') {
      vesselClient.connect();
    }
    
    // Clean up event handlers on unmount
    return () => {
      vesselClient.off('vessels', handleVessels);
      vesselClient.off('status', handleStatus);
      vesselClient.off('error', handleError);
    };
  }, [region, trackPortProximity, proximityRadius]);
  
  // Update configuration when pagination changes
  useEffect(() => {
    if (currentPage !== page || currentPageSize !== pageSize) {
      vesselClient.updateConfig({
        page: currentPage,
        pageSize: currentPageSize
      });
    }
  }, [currentPage, currentPageSize, page, pageSize]);
  
  // Function to go to a specific page
  const goToPage = useCallback((newPage: number) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / currentPageSize));
    
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      vesselClient.updateConfig({ page: newPage });
    }
  }, [totalCount, currentPageSize]);
  
  // Function to change page size
  const changePageSize = useCallback((newPageSize: number) => {
    if (newPageSize > 0) {
      setCurrentPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page
      vesselClient.updateConfig({ 
        pageSize: newPageSize,
        page: 1
      });
    }
  }, []);
  
  // Function to manually refresh data
  const refreshData = useCallback(() => {
    setLoading(true);
    vesselClient.refresh();
    return true;
  }, []);
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / currentPageSize));
  
  // Determine connection type for compatibility with existing code
  const connectionType = connectionStatus === 'connected' ? 'websocket' : 'rest';
  
  return {
    vessels,
    connected: connectionStatus === 'connected' || connectionStatus === 'using-rest',
    error,
    loading,
    lastUpdated,
    totalCount,
    totalPages,
    page: currentPage,
    pageSize: currentPageSize,
    goToPage,
    changePageSize,
    connectionType,
    connectionStatus,
    refreshData
  };
}