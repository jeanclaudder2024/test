import { OpenAI } from 'openai';
import { db } from '../db.js';
import { vessels } from '../../shared/schema.js';
import { eq, and, isNotNull } from 'drizzle-orm';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VoyageProgressData {
  percentComplete: number;
  currentStatus: string;
  estimatedArrival: string;
  nextMilestone: string;
  weatherConditions?: string;
  fuelConsumption?: number;
  averageSpeed?: number;
}

export class VoyageProgressService {
  
  /**
   * Calculate voyage progress based on departure and arrival dates
   */
  static calculateTimeBasedProgress(departureDate: Date, estimatedArrival: Date): number {
    const now = new Date();
    const totalDuration = estimatedArrival.getTime() - departureDate.getTime();
    const elapsed = now.getTime() - departureDate.getTime();
    
    if (elapsed <= 0) return 0; // Haven't started yet
    if (elapsed >= totalDuration) return 100; // Should have arrived
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  }

  /**
   * Generate intelligent voyage progress using OpenAI
   */
  static async generateVoyageProgress(vessel: any): Promise<VoyageProgressData> {
    try {
      const timeBasedProgress = vessel.departureDate && vessel.eta 
        ? this.calculateTimeBasedProgress(new Date(vessel.departureDate), new Date(vessel.eta))
        : 0;

      const prompt = `
You are a maritime logistics expert tracking vessel voyage progress. Generate realistic voyage progress data for this vessel:

Vessel Information:
- Name: ${vessel.name}
- Type: ${vessel.vesselType}
- Departure Port: ${vessel.departurePort}
- Destination Port: ${vessel.destinationPort}
- Departure Date: ${vessel.departureDate}
- ETA: ${vessel.eta}
- Current Time-based Progress: ${timeBasedProgress.toFixed(1)}%
- Cargo: ${vessel.oilType || 'Oil cargo'}
- Deadweight: ${vessel.deadweight || 'Unknown'} tons

Based on typical maritime voyage patterns, current date, and the calculated time-based progress, provide:

1. Realistic percentage complete (should be close to time-based progress but can vary ±5% for realistic conditions)
2. Current voyage status (e.g., "En route", "Approaching destination", "Loading cargo", "Anchored - weather delay")
3. Updated estimated arrival time (can be adjusted based on conditions)
4. Next milestone in the journey
5. Current weather conditions affecting the voyage
6. Daily fuel consumption rate (tons/day)
7. Average speed over the last 24 hours (knots)

Respond in JSON format:
{
  "percentComplete": number,
  "currentStatus": "string",
  "estimatedArrival": "ISO date string",
  "nextMilestone": "string",
  "weatherConditions": "string",
  "fuelConsumption": number,
  "averageSpeed": number
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a maritime logistics expert. Provide realistic and accurate voyage progress data in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const progressData = JSON.parse(content);
      
      // Validate the response
      if (typeof progressData.percentComplete !== 'number' || 
          progressData.percentComplete < 0 || 
          progressData.percentComplete > 100) {
        progressData.percentComplete = timeBasedProgress;
      }

      return progressData;

    } catch (error) {
      console.error('Error generating voyage progress:', error);
      
      // Fallback to time-based calculation
      const timeBasedProgress = vessel.departureDate && vessel.eta 
        ? this.calculateTimeBasedProgress(new Date(vessel.departureDate), new Date(vessel.eta))
        : 0;

      return {
        percentComplete: timeBasedProgress,
        currentStatus: timeBasedProgress < 10 ? "Departed" : 
                      timeBasedProgress < 90 ? "En route" : "Approaching destination",
        estimatedArrival: vessel.eta || new Date().toISOString(),
        nextMilestone: timeBasedProgress < 50 ? "Halfway point" : "Final approach",
        weatherConditions: "Moderate seas",
        fuelConsumption: 25,
        averageSpeed: 12
      };
    }
  }

  /**
   * Update voyage progress for all active vessels
   */
  static async updateAllVoyageProgress(): Promise<void> {
    try {
      console.log('Starting voyage progress update for all vessels...');
      
      // Get all vessels with departure dates and ETAs
      const activeVessels = await db
        .select()
        .from(vessels)
        .where(
          and(
            isNotNull(vessels.departureDate),
            isNotNull(vessels.eta)
          )
        );

      console.log(`Found ${activeVessels.length} vessels with voyage data`);

      for (const vessel of activeVessels) {
        try {
          const progressData = await this.generateVoyageProgress(vessel);
          
          // Update vessel metadata with new progress
          const existingMetadata = vessel.metadata ? 
            (typeof vessel.metadata === 'string' ? JSON.parse(vessel.metadata) : vessel.metadata) : {};
          
          const updatedMetadata = {
            ...existingMetadata,
            voyageProgress: progressData,
            lastProgressUpdate: new Date().toISOString(),
            generatedData: true
          };

          await db
            .update(vessels)
            .set({
              metadata: JSON.stringify(updatedMetadata),
              lastUpdated: new Date()
            })
            .where(eq(vessels.id, vessel.id));

          console.log(`Updated voyage progress for vessel: ${vessel.name} - ${progressData.percentComplete}% complete`);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Error updating progress for vessel ${vessel.name}:`, error);
        }
      }

      console.log('Voyage progress update completed');
      
    } catch (error) {
      console.error('Error in updateAllVoyageProgress:', error);
    }
  }

  /**
   * Update progress for a specific vessel
   */
  static async updateVesselProgress(vesselId: number): Promise<VoyageProgressData | null> {
    try {
      const vessel = await db
        .select()
        .from(vessels)
        .where(eq(vessels.id, vesselId))
        .limit(1);

      if (vessel.length === 0) {
        throw new Error('Vessel not found');
      }

      const progressData = await this.generateVoyageProgress(vessel[0]);
      
      // Update vessel metadata
      const existingMetadata = vessel[0].metadata ? 
        (typeof vessel[0].metadata === 'string' ? JSON.parse(vessel[0].metadata) : vessel[0].metadata) : {};
      
      const updatedMetadata = {
        ...existingMetadata,
        voyageProgress: progressData,
        lastProgressUpdate: new Date().toISOString(),
        generatedData: true
      };

      await db
        .update(vessels)
        .set({
          metadata: JSON.stringify(updatedMetadata),
          lastUpdated: new Date()
        })
        .where(eq(vessels.id, vesselId));

      return progressData;
      
    } catch (error) {
      console.error(`Error updating progress for vessel ${vesselId}:`, error);
      return null;
    }
  }

  /**
   * Check if voyage progress needs updating (every 2 days)
   */
  static shouldUpdateProgress(lastUpdate: string | null): boolean {
    if (!lastUpdate) return true;
    
    const lastUpdateDate = new Date(lastUpdate);
    const twoDaysAgo = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));
    
    return lastUpdateDate < twoDaysAgo;
  }

  /**
   * Schedule automatic progress updates
   */
  static startProgressUpdateScheduler(): void {
    // Update every 2 days (48 hours)
    const updateInterval = 2 * 24 * 60 * 60 * 1000; // 48 hours in milliseconds
    
    console.log('Starting voyage progress scheduler - updates every 2 days');
    
    // Run immediately on startup
    this.updateAllVoyageProgress();
    
    // Schedule recurring updates
    setInterval(() => {
      this.updateAllVoyageProgress();
    }, updateInterval);
  }
}