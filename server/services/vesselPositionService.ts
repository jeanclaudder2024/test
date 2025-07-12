import { storage } from '../storage';
import { Vessel, Port } from '@shared/schema';
import { calculateDistance } from '../utils/geoUtils';

/**
 * Service to handle vessel position updates and port proximity calculations
 */
export class VesselPositionService {
  private ports: Port[] = [];
  private vessels: Vessel[] = [];
  private lastUpdate: Date = new Date();
  private isInitialized: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize the service by loading ports and vessels
   */
  async initialize() {
    try {
      // Load all ports
      this.ports = await storage.getPorts();
      console.log(`Loaded ${this.ports.length} ports for vessel position tracking`);
      
      // Load all vessels
      this.vessels = await storage.getVessels();
      console.log(`Loaded ${this.vessels.length} vessels for position tracking`);
      
      this.isInitialized = true;
      this.lastUpdate = new Date();
      
      // Vessel movement simulation disabled
      // if (!this.updateInterval) {
      //   this.startPositionUpdates();
      // }
    } catch (error) {
      console.error('Error initializing vessel position service:', error);
      this.isInitialized = false;
    }
  }
  
  /**
   * Start the simulation of vessel position updates
   * This runs every 15 minutes to update vessel positions
   */
  startPositionUpdates() {
    this.updateInterval = setInterval(async () => {
      if (!this.isInitialized) {
        await this.initialize();
        return;
      }
      
      // Simulate movement for each vessel
      await this.updateVesselPositions();
      
      this.lastUpdate = new Date();
    }, 15 * 60 * 1000); // Update every 15 minutes
  }
  
  /**
   * Stop the position update simulation
   */
  stopPositionUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  /**
   * Update vessel positions with simulated movement - DISABLED
   */
  async updateVesselPositions() {
    // Vessel movement simulation disabled to prevent performance issues
    console.log('Vessel movement simulation disabled');
    return [];
    
    /* COMMENTED OUT - Original movement code
  async updateVesselPositions_DISABLED() {
    try {
      // Update about 10% of vessels each time to simulate staggered movement
      const vesselCount = this.vessels.length;
      const updateCount = Math.ceil(vesselCount * 0.1);
      const startIndex = Math.floor(Math.random() * (vesselCount - updateCount));
      
      const vesselsToUpdate = this.vessels.slice(startIndex, startIndex + updateCount);
      
      // Track vessels that have been updated
      const updatedVessels: Vessel[] = [];
      
      for (const vessel of vesselsToUpdate) {
        if (!vessel.currentLat || !vessel.currentLng) continue;
        
        // Parse current coordinates
        let lat = typeof vessel.currentLat === 'string' ? parseFloat(vessel.currentLat) : vessel.currentLat;
        let lng = typeof vessel.currentLng === 'string' ? parseFloat(vessel.currentLng) : vessel.currentLng;
        
        if (isNaN(lat) || isNaN(lng)) continue;
        
        // Generate small random movement (about 1-3 km in random direction)
        // Convert km to approximate degrees (very rough approximation)
        // 1 degree latitude ≈ 111 km, 1 degree longitude varies with latitude
        const latChange = (Math.random() * 0.03 - 0.015) / 111; // +/- ~1.5km in latitude
        
        // For longitude, we adjust based on latitude (higher latitudes = smaller longitude changes)
        const lngFactor = Math.cos(lat * Math.PI / 180);
        const lngChange = (Math.random() * 0.03 - 0.015) / (111 * lngFactor); // +/- ~1.5km in longitude
        
        // Update coordinates
        lat += latChange;
        lng += lngChange;
        
        // Prepare update object
        const update = {
          currentLat: lat.toString(),
          currentLng: lng.toString()
        };
        
        // Update in local array
        vessel.currentLat = lat.toString();
        vessel.currentLng = lng.toString();
        
        // Update in database
        await storage.updateVessel(vessel.id, update);
        
        // Add to updated vessels
        updatedVessels.push({
          ...vessel,
          ...update
        });
      }
      
      // Return the vessels that were updated
      return updatedVessels;
    } catch (error) {
      console.error('Error updating vessel positions:', error);
      return [];
    }
    */ // END OF COMMENTED OUT CODE
  }
  
  /**
   * Get all vessels that are within proximity (10km) of any port
   * This is used to show vessel-port connections
   */
  getVesselsNearPorts(maxDistanceKm: number = 10) {
    if (!this.isInitialized) {
      return { lastUpdate: this.lastUpdate, connections: [] };
    }
    
    // Object to hold connections between vessels and ports
    const connections: {
      vessel: Vessel;
      port: Port;
      distance: number;
    }[] = [];
    
    // Check each vessel against each port for proximity
    for (const vessel of this.vessels) {
      if (!vessel.currentLat || !vessel.currentLng) continue;
      
      const vesselLat = typeof vessel.currentLat === 'string' ? parseFloat(vessel.currentLat) : vessel.currentLat;
      const vesselLng = typeof vessel.currentLng === 'string' ? parseFloat(vessel.currentLng) : vessel.currentLng;
      
      if (isNaN(vesselLat) || isNaN(vesselLng)) continue;
      
      for (const port of this.ports) {
        const portLat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
        const portLng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
        
        if (isNaN(portLat) || isNaN(portLng)) continue;
        
        // Calculate distance
        const distance = calculateDistance(vesselLat, vesselLng, portLat, portLng);
        
        // If vessel is within the specified distance of the port, add to connections
        if (distance <= maxDistanceKm) {
          connections.push({
            vessel,
            port,
            distance
          });
        }
      }
    }
    
    return {
      lastUpdate: this.lastUpdate,
      connections
    };
  }
  
  /**
   * Get all vessels with their latest positions
   */
  getAllVesselPositions() {
    return {
      lastUpdate: this.lastUpdate,
      vessels: this.vessels
    };
  }
  
  /**
   * Get all ports with their positions
   */
  getAllPortPositions() {
    return {
      lastUpdate: this.lastUpdate,
      ports: this.ports
    };
  }
  
  /**
   * Force refresh of vessel and port data from database
   */
  async refreshData() {
    try {
      this.ports = await storage.getPorts();
      this.vessels = await storage.getVessels();
      this.lastUpdate = new Date();
      return true;
    } catch (error) {
      console.error('Error refreshing position data:', error);
      return false;
    }
  }
}

// Export as singleton
export const vesselPositionService = new VesselPositionService();