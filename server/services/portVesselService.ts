import { storage } from '../storage';
import { Port, Vessel } from '@shared/schema';
import { calculateDistance } from '../utils/geoUtils';

/**
 * Service to handle port-vessel proximity calculations and provide port details with nearby vessels
 */
export class PortVesselService {
  /**
   * Get a specific port by ID with vessels in proximity
   * @param portId The port ID to fetch
   * @param maxDistanceKm Maximum distance in kilometers to consider a vessel "nearby" (default: 20km)
   * @returns Port data with nearby vessels and their distances
   */
  async getPortWithNearbyVessels(portId: number, maxDistanceKm: number = 20) {
    try {
      // Get the port
      const port = await storage.getPort(portId);
      if (!port) {
        throw new Error(`Port with ID ${portId} not found`);
      }
      
      // Get all vessels
      const vessels = await storage.getVessels();
      
      // Calculate distances and find nearby vessels
      const nearbyVessels = this.calculateVesselDistancesFromPort(port, vessels, maxDistanceKm);
      
      return {
        port,
        vessels: nearbyVessels
      };
    } catch (error) {
      console.error(`Error fetching port ${portId} with nearby vessels:`, error);
      throw error;
    }
  }
  
  /**
   * Get all ports with a summary of vessels in proximity
   * Supports pagination and filtering by region
   */
  async getPortsWithVesselsSummary(
    options: {
      region?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    try {
      const { 
        region, 
        page = 1, 
        limit = 10, 
        sortBy = 'name', 
        sortOrder = 'asc' 
      } = options;
      
      // Get ports with optional region filter
      let ports: Port[] = [];
      if (region && region !== 'all') {
        ports = await storage.getPortsByRegion(region);
      } else {
        ports = await storage.getPorts();
      }
      
      // Get all vessels for proximity calculation
      const vessels = await storage.getVessels();
      
      // For each port, count nearby vessels (within 20km)
      const portsWithVesselCounts = await Promise.all(ports.map(async (port) => {
        const nearbyVessels = this.calculateVesselDistancesFromPort(port, vessels, 20);
        
        return {
          ...port,
          vesselCount: nearbyVessels.length,
          // Optionally include a sample vessel if available
          sampleVessel: nearbyVessels.length > 0 ? {
            name: nearbyVessels[0].vessels.name,
            type: nearbyVessels[0].vessels.vesselType,
            flag: nearbyVessels[0].vessels.flag
          } : null
        };
      }));
      
      // Apply sorting
      const sortedPorts = this.sortPorts(portsWithVesselCounts, sortBy, sortOrder);
      
      // Apply pagination
      const totalItems = sortedPorts.length;
      const totalPages = Math.ceil(totalItems / limit);
      const skip = (page - 1) * limit;
      const paginatedPorts = sortedPorts.slice(skip, skip + limit);
      
      return {
        data: paginatedPorts,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching ports with vessel summaries:', error);
      throw error;
    }
  }
  
  /**
   * Calculate distances between a port and all vessels, returning only those within maxDistance
   */
  private calculateVesselDistancesFromPort(port: Port, vessels: Vessel[], maxDistanceKm: number): {vessels: Vessel, distance: number}[] {
    const portLat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
    const portLng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
    
    if (isNaN(portLat) || isNaN(portLng)) {
      console.error(`Invalid port coordinates for port ${port.id}: lat=${port.lat}, lng=${port.lng}`);
      return [];
    }
    
    const nearbyVessels: {vessels: Vessel, distance: number}[] = [];
    
    for (const vessel of vessels) {
      // Skip vessels without valid coordinates
      if (!vessel.currentLat || !vessel.currentLng) continue;
      
      const vesselLat = typeof vessel.currentLat === 'string' ? parseFloat(vessel.currentLat) : vessel.currentLat;
      const vesselLng = typeof vessel.currentLng === 'string' ? parseFloat(vessel.currentLng) : vessel.currentLng;
      
      if (isNaN(vesselLat) || isNaN(vesselLng)) continue;
      
      // Calculate distance in kilometers
      const distance = calculateDistance(portLat, portLng, vesselLat, vesselLng);
      
      // Only include vessels within the max distance
      if (distance <= maxDistanceKm) {
        nearbyVessels.push({
          vessels: vessel,
          distance
        });
      }
    }
    
    // Sort by distance (closest first)
    return nearbyVessels.sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Sort ports based on the provided criteria
   */
  private sortPorts(ports: any[], sortBy: string, sortOrder: 'asc' | 'desc') {
    return [...ports].sort((a, b) => {
      let comparison = 0;
      
      // Handle numeric fields
      if (sortBy === 'vesselCount' || sortBy === 'capacity') {
        const aValue = a[sortBy] || 0;
        const bValue = b[sortBy] || 0;
        comparison = aValue - bValue;
      } 
      // Handle string fields
      else {
        const aValue = a[sortBy]?.toString().toLowerCase() || '';
        const bValue = b[sortBy]?.toString().toLowerCase() || '';
        comparison = aValue.localeCompare(bValue);
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }
}

export const portVesselService = new PortVesselService();