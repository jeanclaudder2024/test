import { storage } from '../storage';
import { InsertPort, Port } from '@shared/schema';
import { openaiService } from './openaiService';

export const portService = {
  /**
   * Seed the database with initial port data if none exists
   */
  async seedPortData(): Promise<{ ports: number; seeded: boolean; }> {
    // Check if we already have ports in the database
    const existingPorts = await storage.getPorts();
    
    // If we already have ports, don't seed again
    if (existingPorts.length > 0) {
      console.log(`Database already contains ${existingPorts.length} ports.`);
      return {
        ports: existingPorts.length,
        seeded: false
      };
    }
    
    console.log('No ports found in database. Seeding initial port data...');
    
    // Define some major ports for different regions
    const initialPorts: InsertPort[] = [
      // Just a few examples - more would be added in the real implementation
      {
        name: 'Port of Rotterdam',
        country: 'Netherlands',
        region: 'Europe',
        lat: 51.9496,
        lng: 4.1451,
        type: 'oil',
        status: 'active',
        capacity: 14800000,
        description: 'The Port of Rotterdam is the largest seaport in Europe, handling millions of barrels of oil and petroleum products annually.',
        lastUpdated: new Date()
      },
      {
        name: 'Singapore Port',
        country: 'Singapore',
        region: 'Asia-Pacific',
        lat: 1.256,
        lng: 103.83,
        type: 'oil',
        status: 'active',
        capacity: 12500000,
        description: 'Singapore Port is one of the busiest container ports and oil terminals in the world, strategically located in Southeast Asia.',
        lastUpdated: new Date()
      }
    ];
    
    // Bulk insert the ports
    if (typeof storage.createPortsBulk === 'function') {
      await storage.createPortsBulk(initialPorts);
    } else {
      for (const port of initialPorts) {
        await storage.createPort(port);
      }
    }
    
    console.log(`Seeded database with ${initialPorts.length} initial ports.`);
    
    return {
      ports: initialPorts.length,
      seeded: true
    };
  },

  /**
   * Update ports with 2025 data (newer coordinates, capacities, etc)
   */
  async updatePortsWith2025Data(): Promise<{ updated: number; added: number; }> {
    // This would typically fetch from an API or data source with updated info
    // For now, we'll update a few existing ports and add some new ones
    
    console.log('Updating ports with 2025 data...');
    
    // Get existing ports
    const existingPorts = await storage.getPorts();
    console.log(`Found ${existingPorts.length} existing ports to check for updates.`);
    
    // Port updates: names to look for and updates to apply
    const portUpdates: Record<string, Partial<InsertPort>> = {
      'Port of Rotterdam': {
        capacity: 16500000, // Increased capacity
        description: 'The Port of Rotterdam continues to be Europe\'s largest port, now with expanded capacity for cleaner fuels and enhanced monitoring systems installed in 2024.',
        lastUpdated: new Date()
      },
      'Singapore Port': {
        capacity: 14000000, // Increased capacity
        description: 'Singapore Port has undergone major upgrades with enhanced digital twin technology and automated vessel docking systems deployed in early 2025.',
        lastUpdated: new Date()
      }
    };
    
    // Update existing ports
    let updatedCount = 0;
    for (const port of existingPorts) {
      if (portUpdates[port.name]) {
        const updates = portUpdates[port.name];
        await storage.updatePort(port.id, updates);
        updatedCount++;
      }
    }
    
    // New ports to add for 2025
    const newPorts: InsertPort[] = [
      {
        name: 'Red Sea Green Terminal',
        country: 'Saudi Arabia',
        region: 'Middle East',
        lat: 22.2,
        lng: 39.1,
        type: 'oil',
        status: 'active',
        capacity: 8500000,
        description: 'Opened in 2024, the Red Sea Green Terminal is Saudi Arabia\'s newest low-emission port facility specializing in clean fuel exports.',
        lastUpdated: new Date()
      },
      {
        name: 'Port of New Orleans Expansion',
        country: 'United States',
        region: 'North America',
        lat: 29.9511,
        lng: -90.0715,
        type: 'commercial',
        status: 'active',
        capacity: 5800000,
        description: 'The expanded Port of New Orleans facility completed in 2024 features state-of-the-art automation systems and dedicated petroleum export facilities.',
        lastUpdated: new Date()
      }
    ];
    
    // Add new ports
    let addedCount = 0;
    if (typeof storage.createPortsBulk === 'function' && newPorts.length > 0) {
      await storage.createPortsBulk(newPorts);
      addedCount = newPorts.length;
    } else {
      for (const port of newPorts) {
        await storage.createPort(port);
        addedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} existing ports and added ${addedCount} new ports with 2025 data.`);
    
    return {
      updated: updatedCount,
      added: addedCount
    };
  },

  /**
   * Add comprehensive world ports data to the database
   */
  async addAllWorldPorts(): Promise<{ added: number; total: number; }> {
    console.log('Starting to add all world ports data...');
    
    // First, check how many ports we already have
    const existingPorts = await storage.getPorts();
    console.log(`Database already contains ${existingPorts.length} ports.`);
    
    // Create a set of existing port names for quick lookup
    const existingPortNames = new Set(existingPorts.map(port => port.name.toLowerCase()));
    
    // Define major port entries for each region - this would be expanded in a real implementation
    const worldPorts: InsertPort[] = [
      // North America
      {
        name: 'Port of Houston',
        country: 'United States',
        region: 'North America',
        lat: 29.7372,
        lng: -95.2905,
        type: 'oil',
        status: 'active',
        capacity: 10500000,
        description: 'The Port of Houston is one of the busiest ports in the United States and a major center for petroleum shipping.',
        lastUpdated: new Date()
      },
      // Europe
      {
        name: 'Port of Antwerp',
        country: 'Belgium',
        region: 'Europe',
        lat: 51.2311,
        lng: 4.4042,
        type: 'oil',
        status: 'active',
        capacity: 9500000,
        description: 'The Port of Antwerp is a major European port with extensive petrochemical facilities and oil shipping terminals.',
        lastUpdated: new Date()
      },
      // Asia-Pacific
      {
        name: 'Port of Shanghai',
        country: 'China',
        region: 'Asia-Pacific',
        lat: 31.2304,
        lng: 121.4737,
        type: 'commercial',
        status: 'active',
        capacity: 15000000,
        description: 'The Port of Shanghai is the world\'s busiest container port and a key hub for commercial shipping in Asia.',
        lastUpdated: new Date()
      }
    ];
    
    // Filter out ports that already exist
    const portsToAdd = worldPorts.filter(port => 
      !existingPortNames.has(port.name.toLowerCase())
    );
    
    console.log(`Adding ${portsToAdd.length} new world ports...`);
    
    // Add the ports
    let addedCount = 0;
    if (typeof storage.createPortsBulk === 'function' && portsToAdd.length > 0) {
      await storage.createPortsBulk(portsToAdd);
      addedCount = portsToAdd.length;
    } else {
      for (const port of portsToAdd) {
        await storage.createPort(port);
        addedCount++;
      }
    }
    
    // Get updated total count
    const updatedPortCount = await storage.getPorts();
    
    console.log(`Successfully added ${addedCount} new world ports. Database now contains ${updatedPortCount.length} ports.`);
    
    return {
      added: addedCount,
      total: updatedPortCount.length
    };
  }
};