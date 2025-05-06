import { storage } from '../storage';
import { Port, Vessel } from '@shared/schema';
import { calculateDistance } from '../utils/geoUtils';
import { openaiService } from './openaiService';

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
  async getPortWithNearbyVessels(portId: number, maxDistanceKm: number = 20, useAI: boolean = true) {
    try {
      // Get the port
      const port = await storage.getPortById(portId);
      if (!port) {
        throw new Error(`Port with ID ${portId} not found`);
      }
      
      // Get all vessels
      const vessels = await storage.getVessels();
      
      // Calculate distances and find nearby vessels based on geographical proximity
      const nearbyVessels = this.calculateVesselDistancesFromPort(port, vessels, maxDistanceKm);
      
      // If AI analysis is enabled and we have vessels, use OpenAI to prioritize the most relevant ones
      if (useAI && nearbyVessels.length > 0 && port.type === 'oil') {
        try {
          console.log(`Using OpenAI to analyze vessel relevance for port ${port.name} (ID: ${portId})`);
          
          // Get the maximum of vessels (9) but prioritize by relevance score
          const analyzedVessels = await openaiService.analyzePortVesselRelationships(port, nearbyVessels);
          
          // Sort by relevance score (highest first)
          const sortedVessels = analyzedVessels
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .map(({ vessels, distance }) => ({ vessels, distance })); // Remove the score from the response
          
          return {
            port,
            vessels: sortedVessels
          };
        } catch (error) {
          console.error(`Error using OpenAI for vessel analysis for port ${portId}:`, error);
          // Fall back to distance-based sorting if AI analysis fails
          console.log(`Falling back to distance-based vessel selection for port ${portId}`);
          return {
            port,
            vessels: nearbyVessels
          };
        }
      }
      
      // Return standard distance-based results if AI is not used
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
      portType?: string;
      useAI?: boolean;
    }
  ) {
    try {
      const { 
        region, 
        page = 1, 
        limit = 10, 
        sortBy = 'name', 
        sortOrder = 'asc',
        portType,
        useAI = true
      } = options;
      
      // Get ports with optional region and type filters
      let ports: Port[] = [];
      
      if (portType === 'oil') {
        // For oil ports page, specifically get oil ports
        const allPorts = await storage.getPorts();
        ports = allPorts.filter(p => p.type === 'oil');
        
        // Apply region filter if provided
        if (region && region !== 'all') {
          ports = ports.filter(p => p.region === region);
        }
      } else if (region && region !== 'all') {
        ports = await storage.getPortsByRegion(region);
      } else {
        ports = await storage.getPorts();
      }
      
      // Get all vessels for proximity calculation
      const vessels = await storage.getVessels();
      
      // For each port, get nearby vessels and analyze if needed
      const portsWithVesselCounts = await Promise.all(ports.map(async (port) => {
        const nearbyVessels = this.calculateVesselDistancesFromPort(port, vessels, 50); // Increased radius for oil ports
        
        // For oil ports with AI enabled, use OpenAI to find the most relevant vessels
        let portVessels = nearbyVessels;
        
        if (port.type === 'oil' && useAI && nearbyVessels.length > 0) {
          try {
            console.log(`Using OpenAI to analyze vessel relevance for oil port ${port.name} (ID: ${port.id})`);
            
            // Get a prioritized list of vessels for this oil port
            const analyzedVessels = await openaiService.analyzePortVesselRelationships(port, nearbyVessels);
            
            // Sort by relevance score (highest first)
            portVessels = analyzedVessels
              .sort((a, b) => b.relevanceScore - a.relevanceScore)
              .map(({ vessels, distance }) => ({ vessels, distance })); // Remove the score
              
            console.log(`Successfully scored vessels for port ${port.name} using AI`);
          } catch (error) {
            console.error(`Error scoring vessels with OpenAI for port ${port.id}:`, error);
            // Fall back to distance-based selection
            portVessels = nearbyVessels;
          }
        }
        
        return {
          ...port,
          vesselCount: nearbyVessels.length,
          nearbyVessels: portVessels.slice(0, 9), // Include a subset of the nearby vessels, already ranked by relevance
          // Sample vessel is the highest ranked vessel
          sampleVessel: portVessels.length > 0 ? {
            name: portVessels[0].vessels.name,
            type: portVessels[0].vessels.vesselType,
            flag: portVessels[0].vessels.flag
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