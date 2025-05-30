import { useMemo } from 'react';
import { usePortVesselProximity, type PortVesselConnection } from './usePortVesselProximity';

interface UsePortSpecificVesselsProps {
  portId: number;
  proximityRadius?: number;
  autoConnect?: boolean;
  pollingInterval?: number;
}

/**
 * Hook for getting real-time vessel data near a specific port.
 * Uses the usePortVesselProximity hook internally but filters for a specific port.
 */
export function usePortSpecificVessels({
  portId,
  proximityRadius = 10,
  autoConnect = true,
  pollingInterval = 15000,
}: UsePortSpecificVesselsProps) {
  // Use the base hook for vessel-port proximity
  const {
    connections,
    vessels,
    isConnected,
    error,
    isLoading,
    lastUpdated,
    refreshData,
  } = usePortVesselProximity({
    proximityRadius,
    autoConnect,
    pollingInterval,
  });

  // Filter connections for the specific port
  const portConnections = useMemo(() => {
    return connections.filter(conn => conn.portId === portId);
  }, [connections, portId]);

  // Extract just the vessels data
  const nearbyVessels = useMemo(() => {
    return portConnections.map(conn => ({
      id: conn.vesselId,
      name: conn.vesselName,
      type: conn.vesselType,
      distance: conn.distance,
      coordinates: conn.coordinates.vessel,
    }));
  }, [portConnections]);

  // Get port info from connections (if available)
  const portInfo = useMemo(() => {
    const portConnection = connections.find(conn => conn.portId === portId);
    if (!portConnection) return null;
    
    return {
      id: portConnection.portId,
      name: portConnection.portName,
      type: portConnection.portType,
      coordinates: portConnection.coordinates.port,
      vesselCount: portConnections.length,
    };
  }, [connections, portId, portConnections.length]);

  return {
    connections: portConnections,
    vessels: nearbyVessels,
    portInfo,
    isConnected,
    error,
    isLoading,
    lastUpdated,
    refreshData,
  };
}