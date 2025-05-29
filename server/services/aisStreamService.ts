/**
 * AIS Stream Service - Fetch real-time vessel data
 * Provides authentic maritime tracking data from AIS Stream API
 */

import { db } from '../db';
import { vessels } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface AISVessel {
  mmsi: number;
  lat: number;
  lng: number;
  sog: number; // Speed over ground
  cog: number; // Course over ground
  heading: number;
  vessel_name: string;
  ship_type: number;
  destination: string;
  eta: string;
  draught: number;
  length: number;
  width: number;
  timestamp: number;
}

export class AISStreamService {
  private baseUrl = 'https://api.aisstream.io/v0';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.AIS_STREAM_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('AIS_STREAM_API_KEY is required');
    }
  }

  /**
   * Fetch vessels from AIS Stream API
   */
  async fetchVessels(limit: number = 100): Promise<AISVessel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vessels`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`AIS Stream API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.vessels || [];
    } catch (error) {
      console.error('Error fetching from AIS Stream:', error);
      return [];
    }
  }

  /**
   * Fetch vessels in a specific geographic area
   */
  async fetchVesselsByArea(bbox: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<AISVessel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vessels/area`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bbox: [bbox.west, bbox.south, bbox.east, bbox.north]
        })
      });

      if (!response.ok) {
        throw new Error(`AIS Stream API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.vessels || [];
    } catch (error) {
      console.error('Error fetching vessels by area from AIS Stream:', error);
      return [];
    }
  }

  /**
   * Convert AIS ship type to oil vessel type
   */
  private getVesselType(shipType: number): string {
    const oilVesselTypes: { [key: number]: string } = {
      80: 'Oil Tanker',
      81: 'Chemical Tanker',
      82: 'LNG Carrier',
      83: 'LPG Carrier',
      84: 'Crude Oil Tanker',
      85: 'Products Tanker'
    };

    return oilVesselTypes[shipType] || 'Oil Tanker';
  }

  /**
   * Filter vessels to only include oil-related vessels
   */
  private isOilVessel(vessel: AISVessel): boolean {
    const oilShipTypes = [80, 81, 82, 83, 84, 85];
    const oilKeywords = ['oil', 'crude', 'lng', 'lpg', 'tanker', 'petroleum', 'gasoline', 'diesel'];
    
    // Check ship type
    if (oilShipTypes.includes(vessel.ship_type)) {
      return true;
    }

    // Check vessel name for oil-related keywords
    const name = vessel.vessel_name?.toLowerCase() || '';
    return oilKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Convert AIS vessel to database format and save
   */
  async saveVesselToDatabase(aisVessel: AISVessel): Promise<void> {
    try {
      const vesselData = {
        name: aisVessel.vessel_name || `Vessel ${aisVessel.mmsi}`,
        imo: '', // AIS Stream may not provide IMO
        mmsi: aisVessel.mmsi.toString(),
        vesselType: this.getVesselType(aisVessel.ship_type),
        flag: '', // Would need additional lookup
        currentLat: aisVessel.lat.toString(),
        currentLng: aisVessel.lng.toString(),
        speed: aisVessel.sog.toString(),
        status: aisVessel.sog > 1 ? 'underway' : 'at anchor',
        destinationPort: aisVessel.destination || null,
        eta: aisVessel.eta ? new Date(aisVessel.eta) : null,
        cargoType: 'Crude Oil', // Default for oil vessels
        metadata: JSON.stringify({
          heading: aisVessel.heading,
          course: aisVessel.cog,
          draught: aisVessel.draught,
          length: aisVessel.length,
          width: aisVessel.width,
          timestamp: aisVessel.timestamp
        })
      };

      // Check if vessel already exists by MMSI
      const existing = await db.query.vessels.findFirst({
        where: (vessels, { eq }) => eq(vessels.mmsi, vesselData.mmsi)
      });

      if (existing) {
        // Update existing vessel
        await db.update(vessels)
          .set({
            currentLat: vesselData.currentLat,
            currentLng: vesselData.currentLng,
            speed: vesselData.speed,
            status: vesselData.status,
            metadata: vesselData.metadata,
            lastUpdated: new Date()
          })
          .where(eq(vessels.mmsi, vesselData.mmsi));
      } else {
        // Insert new vessel
        await db.insert(vessels).values(vesselData);
      }

    } catch (error) {
      console.error('Error saving vessel to database:', error);
    }
  }

  /**
   * Fetch and save oil vessels to database
   */
  async updateOilVesselsFromAIS(): Promise<{ processed: number; saved: number }> {
    try {
      console.log('Fetching vessels from AIS Stream...');
      
      // Fetch vessels from major oil shipping areas
      const gulfOfMexico = await this.fetchVesselsByArea({
        north: 30.0,
        south: 18.0,
        east: -80.0,
        west: -98.0
      });

      const persianGulf = await this.fetchVesselsByArea({
        north: 30.0,
        south: 24.0,
        east: 56.0,
        west: 46.0
      });

      const northSea = await this.fetchVesselsByArea({
        north: 62.0,
        south: 51.0,
        east: 10.0,
        west: -4.0
      });

      const allVessels = [...gulfOfMexico, ...persianGulf, ...northSea];
      const oilVessels = allVessels.filter(vessel => this.isOilVessel(vessel));

      console.log(`Found ${oilVessels.length} oil vessels from ${allVessels.length} total vessels`);

      let saved = 0;
      for (const vessel of oilVessels) {
        await this.saveVesselToDatabase(vessel);
        saved++;
      }

      return { processed: allVessels.length, saved };

    } catch (error) {
      console.error('Error updating vessels from AIS:', error);
      return { processed: 0, saved: 0 };
    }
  }
}

export const aisStreamService = new AISStreamService();