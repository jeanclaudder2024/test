import { Request, Response } from 'express';
import { db } from '../db';
import { vessels } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

// Initialize OpenAI API client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate realistic vessel position and voyage data using OpenAI
export const generateVesselPositionData = async (req: Request, res: Response) => {
  try {
    const vesselId = parseInt(req.params.id);
    if (isNaN(vesselId)) {
      return res.status(400).json({ success: false, message: 'Invalid vessel ID' });
    }

    // Extract vessel information from request body
    const {
      vesselName,
      vesselType,
      cargoType,
      currentLat,
      currentLng,
      destination,
      previousPort
    } = req.body;

    // Generate realistic vessel movement data using OpenAI
    try {
      const prompt = `
      Generate realistic maritime vessel tracking data for "${vesselName}" (ID: ${vesselId}) 
      which is a ${vesselType} carrying ${cargoType}.
      
      The vessel is currently located at coordinates ${currentLat}, ${currentLng}.
      
      ${previousPort ? `It departed from ${previousPort}.` : ''}
      ${destination ? `It is headed to ${destination}.` : ''}
      
      Please generate the following realistic vessel data:
      - Current speed in knots (typical speeds: oil tanker: 10-15, LNG carrier: 15-20, cargo vessel: 12-18)
      - Current heading in degrees (0-359)
      - Voyage progress percentage (1-100)
      - Estimated time to destination in hours
      - Navigation status (e.g. "underway", "at anchor", "moored")
      - Current vessel draught in meters
      
      Format as JSON with exactly these keys: speed, course, voyageProgress, hoursToDestination, navStatus, draught.
      Use numeric values without units. Example: {"speed": 12.5, "course": 135, "voyageProgress": 65, "hoursToDestination": 48, "navStatus": "underway", "draught": 12.5}
      `;

      const completionResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a maritime navigation expert that provides realistic vessel tracking data in JSON format."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const generatedDataText = completionResponse.choices[0].message.content;
      const generatedData = JSON.parse(generatedDataText || '{}');

      // Update the vessel data in the database to persist these values
      if (vesselId) {
        // Store the additional data in the metadata JSON field
        const metadataObj = {
          currentSpeed: generatedData.speed,
          voyageProgress: generatedData.voyageProgress,
          course: generatedData.course,
          navStatus: generatedData.navStatus,
          draught: generatedData.draught,
          generatedData: true,
          generatedAt: new Date().toISOString()
        };
        
        await db.update(vessels)
          .set({
            metadata: JSON.stringify(metadataObj),
            eta: new Date(Date.now() + (generatedData.hoursToDestination || 72) * 60 * 60 * 1000)
          })
          .where(eq(vessels.id, vesselId));
      }

      // Return the generated data to the client
      return res.status(200).json({
        success: true,
        message: 'Generated vessel tracking data successfully',
        data: generatedData
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      
      // Fallback to rule-based approach
      const isOilTanker = vesselType?.toLowerCase().includes('tanker') || 
                         cargoType?.toLowerCase().includes('oil') ||
                         cargoType?.toLowerCase().includes('crude');
      
      const isLNG = cargoType?.toLowerCase().includes('lng') || 
                   cargoType?.toLowerCase().includes('gas');
      
      // Generate realistic values using rules
      let speed = 0;
      if (isOilTanker) {
        speed = 10 + (Math.random() * 5);
      } else if (isLNG) {
        speed = 15 + (Math.random() * 5);
      } else {
        speed = 12 + (Math.random() * 6);
      }
      
      const course = Math.floor(Math.random() * 360);
      const voyageProgress = Math.floor(25 + (Math.random() * 70));
      const hoursToDestination = Math.floor(36 + (Math.random() * 120)); // 36 to 156 hours
      const navStatus = "underway";
      const draught = Math.floor(8 + (Math.random() * 14)); // 8 to 22 meters
      
      const fallbackData = {
        speed: parseFloat(speed.toFixed(1)),
        course,
        voyageProgress,
        hoursToDestination,
        navStatus,
        draught
      };
      
      // Update the vessel in the database
      if (vesselId) {
        // Store the additional data in the metadata JSON field
        const metadataObj = {
          currentSpeed: fallbackData.speed,
          voyageProgress: fallbackData.voyageProgress,
          course: fallbackData.course,
          navStatus: fallbackData.navStatus,
          draught: fallbackData.draught,
          generatedData: true,
          fallbackGeneration: true,
          generatedAt: new Date().toISOString()
        };
        
        await db.update(vessels)
          .set({
            metadata: JSON.stringify(metadataObj),
            eta: new Date(Date.now() + fallbackData.hoursToDestination * 60 * 60 * 1000)
          })
          .where(eq(vessels.id, vesselId));
      }
      
      return res.status(200).json({
        success: true,
        message: 'Generated vessel tracking data with fallback method',
        data: fallbackData
      });
    }
  } catch (error) {
    console.error('Error generating vessel position data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating vessel position data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};