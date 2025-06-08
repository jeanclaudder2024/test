import { db } from '../db';
import { vessels, ports } from '../../shared/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export interface VoyageData {
  vesselId: number;
  startPort: { lat: number; lng: number; name: string };
  endPort: { lat: number; lng: number; name: string };
  startDate: Date;
  endDate: Date;
  currentPosition: { lat: number; lng: number };
  status: 'Not Started' | 'Sailing' | 'Arrived' | 'Complete';
  progressPercent: number;
}

export interface VesselPosition {
  lat: number;
  lng: number;
  timestamp: Date;
}

export class VesselTrackingService {
  private static instance: VesselTrackingService;
  private activeVoyages: Map<number, VoyageData> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startTrackingSystem();
  }

  public static getInstance(): VesselTrackingService {
    if (!VesselTrackingService.instance) {
      VesselTrackingService.instance = new VesselTrackingService();
    }
    return VesselTrackingService.instance;
  }

  /**
   * Start the vessel tracking system with 30-minute updates
   */
  private startTrackingSystem(): void {
    // Update every 30 minutes (1800000 ms)
    this.updateInterval = setInterval(() => {
      this.updateAllVesselPositions();
    }, 30 * 60 * 1000);

    // Initial update
    this.initializeActiveVoyages();
    console.log('Vessel Tracking System started - updating every 30 minutes');
  }

  /**
   * Initialize voyages for all vessels with start/end ports and dates
   */
  private async initializeActiveVoyages(): Promise<void> {
    try {
      // Get all vessels with voyage data
      const vesselsWithVoyages = await db
        .select()
        .from(vessels)
        .where(
          and(
            isNotNull(vessels.departurePort),
            isNotNull(vessels.destinationPort),
            isNotNull(vessels.departureDate),
            isNotNull(vessels.eta)
          )
        );

      // Get all ports for coordinate lookup
      const allPorts = await db.select().from(ports);

      for (const vessel of vesselsWithVoyages) {
        try {
          const startPort = allPorts.find(p => p.id === Number(vessel.departurePort));
          const endPort = allPorts.find(p => p.id === Number(vessel.destinationPort));

          if (startPort && endPort && vessel.departureDate && vessel.eta) {
            const voyageData: VoyageData = {
              vesselId: vessel.id,
              startPort: {
                lat: parseFloat(startPort.lat || '0'),
                lng: parseFloat(startPort.lng || '0'),
                name: startPort.name
              },
              endPort: {
                lat: parseFloat(endPort.lat || '0'),
                lng: parseFloat(endPort.lng || '0'),
                name: endPort.name
              },
              startDate: new Date(vessel.departureDate),
              endDate: new Date(vessel.eta),
              currentPosition: { lat: 0, lng: 0 }, // Will be calculated
              status: 'Not Started',
              progressPercent: 0
            };

            // Calculate initial position and status
            this.updateVoyageProgress(voyageData);
            this.activeVoyages.set(vessel.id, voyageData);
          }
        } catch (error) {
          console.error(`Error initializing voyage for vessel ${vessel.id}:`, error);
        }
      }

      console.log(`Initialized ${this.activeVoyages.size} active voyages`);
    } catch (error) {
      console.error('Error initializing active voyages:', error);
    }
  }

  /**
   * Update progress for a specific voyage based on current time
   */
  private updateVoyageProgress(voyage: VoyageData): void {
    const now = new Date();
    const totalDuration = voyage.endDate.getTime() - voyage.startDate.getTime();
    const elapsed = now.getTime() - voyage.startDate.getTime();

    // Determine status and progress
    if (now < voyage.startDate) {
      voyage.status = 'Not Started';
      voyage.progressPercent = 0;
      voyage.currentPosition = { ...voyage.startPort };
    } else if (now > voyage.endDate) {
      voyage.status = 'Complete';
      voyage.progressPercent = 100;
      voyage.currentPosition = { ...voyage.endPort };
    } else {
      voyage.status = 'Sailing';
      voyage.progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
      
      // Calculate current position using linear interpolation
      voyage.currentPosition = this.calculateCurrentPosition(
        voyage.startPort,
        voyage.endPort,
        voyage.progressPercent / 100
      );
    }
  }

  /**
   * Calculate current position between two points with basic land avoidance
   */
  private calculateCurrentPosition(
    startPort: { lat: number; lng: number },
    endPort: { lat: number; lng: number },
    progress: number
  ): { lat: number; lng: number } {
    // Simple linear interpolation with basic curve for ocean routes
    const latDiff = endPort.lat - startPort.lat;
    const lngDiff = endPort.lng - startPort.lng;

    // Add slight curve to avoid straight lines over land
    const curveFactor = Math.sin(progress * Math.PI) * 0.1;
    
    const currentLat = startPort.lat + (latDiff * progress) + (curveFactor * Math.abs(latDiff));
    const currentLng = startPort.lng + (lngDiff * progress) + (curveFactor * Math.abs(lngDiff));

    return {
      lat: Math.round(currentLat * 100000) / 100000, // 5 decimal precision
      lng: Math.round(currentLng * 100000) / 100000
    };
  }

  /**
   * Update all vessel positions and save to database
   */
  private async updateAllVesselPositions(): Promise<void> {
    console.log('Updating vessel positions...');
    
    for (const [vesselId, voyage] of Array.from(this.activeVoyages.entries())) {
      try {
        // Update voyage progress
        this.updateVoyageProgress(voyage);

        // Update vessel in database
        await db
          .update(vessels)
          .set({
            currentLat: voyage.currentPosition.lat.toString(),
            currentLng: voyage.currentPosition.lng.toString(),
            status: voyage.status,
            lastUpdated: new Date(),
            metadata: JSON.stringify({
              voyageProgress: voyage.progressPercent,
              voyageStatus: voyage.status,
              lastPositionUpdate: new Date().toISOString()
            })
          })
          .where(eq(vessels.id, vesselId));

        console.log(`Updated vessel ${vesselId}: ${voyage.progressPercent.toFixed(1)}% - ${voyage.status}`);
      } catch (error) {
        console.error(`Error updating vessel ${vesselId}:`, error);
      }
    }
  }

  /**
   * Get voyage information for a specific vessel
   */
  public getVoyageData(vesselId: number): VoyageData | null {
    return this.activeVoyages.get(vesselId) || null;
  }

  /**
   * Get all active voyages
   */
  public getAllActiveVoyages(): VoyageData[] {
    return Array.from(this.activeVoyages.values());
  }

  /**
   * Add a new voyage for tracking
   */
  public async addVoyage(
    vesselId: number,
    startPortId: number,
    endPortId: number,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    try {
      // Get port data
      const startPort = await db.select().from(ports).where(eq(ports.id, startPortId)).limit(1);
      const endPort = await db.select().from(ports).where(eq(ports.id, endPortId)).limit(1);

      if (startPort.length === 0 || endPort.length === 0) {
        throw new Error('Invalid port IDs');
      }

      const voyageData: VoyageData = {
        vesselId,
        startPort: {
          lat: parseFloat(startPort[0].lat || '0'),
          lng: parseFloat(startPort[0].lng || '0'),
          name: startPort[0].name
        },
        endPort: {
          lat: parseFloat(endPort[0].lat || '0'),
          lng: parseFloat(endPort[0].lng || '0'),
          name: endPort[0].name
        },
        startDate,
        endDate,
        currentPosition: { lat: 0, lng: 0 },
        status: 'Not Started',
        progressPercent: 0
      };

      // Calculate initial position
      this.updateVoyageProgress(voyageData);
      this.activeVoyages.set(vesselId, voyageData);

      // Update vessel in database
      await db
        .update(vessels)
        .set({
          departurePort: startPortId.toString(),
          destinationPort: endPortId.toString(),
          departureDate: startDate,
          eta: endDate,
          currentLat: voyageData.currentPosition.lat.toString(),
          currentLng: voyageData.currentPosition.lng.toString(),
          status: voyageData.status
        })
        .where(eq(vessels.id, vesselId));

      console.log(`Added new voyage for vessel ${vesselId}`);
      return true;
    } catch (error) {
      console.error(`Error adding voyage for vessel ${vesselId}:`, error);
      return false;
    }
  }

  /**
   * Remove a voyage from tracking
   */
  public removeVoyage(vesselId: number): boolean {
    return this.activeVoyages.delete(vesselId);
  }

  /**
   * Stop the tracking system
   */
  public stopTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('Vessel Tracking System stopped');
  }

  /**
   * Force update all positions now
   */
  public async forceUpdate(): Promise<void> {
    await this.updateAllVesselPositions();
  }

  /**
   * Get voyage progress for a specific vessel
   */
  public getVoyageProgress(vesselId: number): {
    percentComplete: number;
    currentStatus: string;
    estimatedArrival: string | null;
    nextMilestone: string;
  } | null {
    const voyage = this.activeVoyages.get(vesselId);
    if (!voyage) return null;

    let nextMilestone = '';
    if (voyage.progressPercent < 25) {
      nextMilestone = 'Quarter progress';
    } else if (voyage.progressPercent < 50) {
      nextMilestone = 'Halfway point';
    } else if (voyage.progressPercent < 75) {
      nextMilestone = 'Three-quarter progress';
    } else if (voyage.progressPercent < 100) {
      nextMilestone = 'Final approach';
    } else {
      nextMilestone = 'Voyage complete';
    }

    return {
      percentComplete: Math.round(voyage.progressPercent),
      currentStatus: voyage.status,
      estimatedArrival: voyage.endDate.toISOString(),
      nextMilestone
    };
  }
}

// Export singleton instance
export const vesselTrackingService = VesselTrackingService.getInstance();