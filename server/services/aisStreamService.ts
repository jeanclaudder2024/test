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
      throw new Error('AIS_STREAM_API_KEY environment variable is required');
    }
  }

  /**
   * Fetch real-time oil tanker vessels from AIS Stream
   */
  async fetchOilVessels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vessels`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`AIS Stream API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.vessels || [];
    } catch (error) {
      console.error('Error fetching vessels from AIS Stream:', error);
      return [];
    }
  }

  /**
   * Convert AIS vessel data to your database format
   */
  convertToVesselFormat(aisVessel: AISVessel) {
    return {
      name: aisVessel.vessel_name || `Vessel ${aisVessel.mmsi}`,
      imo: `IMO${aisVessel.mmsi}`, // Generate IMO from MMSI
      mmsi: aisVessel.mmsi.toString(),
      vesselType: this.getVesselType(aisVessel.ship_type),
      flag: 'Unknown',
      built: null,
      deadweight: null,
      currentLat: aisVessel.lat.toString(),
      currentLng: aisVessel.lng.toString(),
      departurePort: null,
      departureDate: null,
      destinationPort: aisVessel.destination || null,
      destinationLat: null,
      destinationLng: null,
      eta: aisVessel.eta ? new Date(aisVessel.eta) : null,
      cargoType: 'Crude Oil',
      cargoCapacity: null,
      currentRegion: this.getRegionFromCoordinates(aisVessel.lat, aisVessel.lng),
      status: 'underway',
      speed: aisVessel.sog.toString(),
      buyerName: 'NA',
      sellerName: null,
      metadata: JSON.stringify({
        heading: aisVessel.heading,
        course: aisVessel.cog,
        draught: aisVessel.draught,
        length: aisVessel.length,
        width: aisVessel.width,
        timestamp: aisVessel.timestamp
      })
    };
  }

  /**
   * Get vessel type from AIS ship type code
   */
  private getVesselType(shipType: number): string {
    // AIS ship type codes for oil tankers
    if (shipType >= 80 && shipType <= 89) {
      return 'Oil Tanker';
    }
    if (shipType >= 70 && shipType <= 79) {
      return 'Cargo Vessel';
    }
    return 'Oil Tanker'; // Default to oil tanker for our application
  }

  /**
   * Determine region from coordinates
   */
  private getRegionFromCoordinates(lat: number, lng: number): string {
    if (lat >= 25 && lat <= 71 && lng >= -25 && lng <= 40) {
      return 'europe';
    }
    if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 55) {
      return 'africa';
    }
    if (lat >= 5 && lat <= 55 && lng >= 25 && lng <= 180) {
      return 'asia-pacific';
    }
    if (lat >= 15 && lat <= 50 && lng >= 35 && lng <= 75) {
      return 'middle-east';
    }
    if (lat >= -60 && lat <= 85 && lng >= -180 && lng <= -30) {
      return 'americas';
    }
    return 'global';
  }

  /**
   * Update oil vessels from AIS Stream and save to database
   */
  async updateOilVesselsFromAIS(): Promise<{ imported: number; errors: number }> {
    try {
      const aisVessels = await this.fetchOilVessels();
      let imported = 0;
      let errors = 0;

      for (const aisVessel of aisVessels.slice(0, 50)) { // Limit to 50 vessels
        try {
          const vesselData = this.convertToVesselFormat(aisVessel);
          
          // Check if vessel already exists by MMSI
          const existingVessel = await db.select()
            .from(vessels)
            .where(eq(vessels.mmsi, vesselData.mmsi))
            .limit(1);

          if (existingVessel.length === 0) {
            await db.insert(vessels).values(vesselData);
            imported++;
          } else {
            // Update existing vessel position
            await db.update(vessels)
              .set({
                currentLat: vesselData.currentLat,
                currentLng: vesselData.currentLng,
                speed: vesselData.speed,
                metadata: vesselData.metadata,
                lastUpdated: new Date()
              })
              .where(eq(vessels.mmsi, vesselData.mmsi));
            imported++;
          }
        } catch (error) {
          errors++;
          console.error(`Error processing vessel ${aisVessel.mmsi}:`, error);
        }
      }

      return { imported, errors };
    } catch (error) {
      console.error('Error updating vessels from AIS Stream:', error);
      return { imported: 0, errors: 1 };
    }
  }
}

export const aisStreamService = new AISStreamService();