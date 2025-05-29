import { Router } from "express";
import { db } from "../db";
import { vessels } from "@shared/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to convert string dates to Date objects
function convertDates(data: any) {
  const converted = { ...data };
  
  if (converted.departureDate && converted.departureDate !== "") {
    converted.departureDate = new Date(converted.departureDate);
  } else {
    converted.departureDate = null;
  }
  
  if (converted.eta && converted.eta !== "") {
    converted.eta = new Date(converted.eta);
  } else {
    converted.eta = null;
  }
  
  return converted;
}

// Helper function to convert string numbers
function convertNumbers(data: any) {
  const converted = { ...data };
  
  if (converted.built && converted.built !== "") {
    converted.built = parseInt(converted.built) || null;
  } else {
    converted.built = null;
  }
  
  if (converted.deadweight && converted.deadweight !== "") {
    converted.deadweight = parseInt(converted.deadweight) || null;
  } else {
    converted.deadweight = null;
  }
  
  if (converted.cargoCapacity && converted.cargoCapacity !== "") {
    converted.cargoCapacity = parseInt(converted.cargoCapacity) || null;
  } else {
    converted.cargoCapacity = null;
  }
  
  return converted;
}

// Generate AI vessel data
router.post("/generate-ai", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        error: "OpenAI API key not configured. Please provide your OpenAI API key." 
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert maritime vessel data generator. Generate realistic oil tanker vessel data with authentic details. Respond only with valid JSON format."
        },
        {
          role: "user",
          content: `Generate realistic data for an oil tanker vessel. Include:
          - name: A realistic vessel name (like "Atlantic Pioneer" or "Gulf Excellence")
          - imo: A valid 7-digit IMO number (format: 1234567)
          - mmsi: A valid 9-digit MMSI number (format: 123456789)
          - vesselType: Should be "Oil Tanker"
          - flag: A real country flag state
          - built: A realistic year between 1990-2023
          - deadweight: Realistic deadweight tonnage for oil tankers (30000-300000)
          - cargoCapacity: Realistic cargo capacity (slightly less than deadweight)
          - cargoType: Type of oil cargo (Crude Oil, Fuel Oil, etc.)
          - speed: Current speed in knots (0.0-18.5)
          - currentRegion: A real maritime region (Persian Gulf, North Sea, etc.)
          - ownerName: A realistic oil company name
          - operatorName: A realistic shipping company name
          - buyerName: A realistic oil trading company
          - sellerName: A realistic oil producer company
          - oilSource: Source of the oil cargo
          
          Respond with only a JSON object containing these fields.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const aiData = JSON.parse(completion.choices[0].message.content || "{}");
    
    // Add some randomized coordinates for current position (global oil shipping routes)
    const marinRegions = [
      { name: "Persian Gulf", lat: 26.5, lng: 51.5 },
      { name: "North Sea", lat: 56.0, lng: 3.0 },
      { name: "Gulf of Mexico", lat: 27.0, lng: -90.0 },
      { name: "Mediterranean", lat: 35.0, lng: 18.0 },
      { name: "Red Sea", lat: 20.0, lng: 38.0 },
      { name: "South China Sea", lat: 16.0, lng: 112.0 }
    ];
    
    const region = marinRegions[Math.floor(Math.random() * marinRegions.length)];
    const latOffset = (Math.random() - 0.5) * 10; // ±5 degrees
    const lngOffset = (Math.random() - 0.5) * 10; // ±5 degrees
    
    aiData.currentLat = (region.lat + latOffset).toFixed(6);
    aiData.currentLng = (region.lng + lngOffset).toFixed(6);
    aiData.currentRegion = region.name;
    
    res.json(aiData);
  } catch (error) {
    console.error("Error generating AI vessel data:", error);
    res.status(500).json({ 
      error: "Failed to generate AI vessel data. Please check your OpenAI API key configuration." 
    });
  }
});

// Get all vessels
router.get("/", async (req, res) => {
  try {
    const allVessels = await db.select().from(vessels);
    res.json(allVessels);
  } catch (error) {
    console.error("Error fetching vessels:", error);
    res.status(500).json({ error: "Failed to fetch vessels" });
  }
});

// Get vessel by ID
router.get("/:id", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.id);
    const vessel = await db.select().from(vessels).where(eq(vessels.id, vesselId));
    
    if (vessel.length === 0) {
      return res.status(404).json({ error: "Vessel not found" });
    }
    
    res.json(vessel[0]);
  } catch (error) {
    console.error("Error fetching vessel:", error);
    res.status(500).json({ error: "Failed to fetch vessel" });
  }
});

// Create new vessel
router.post("/", async (req, res) => {
  try {
    let vesselData = { ...req.body };
    
    // Convert dates and numbers
    vesselData = convertDates(vesselData);
    vesselData = convertNumbers(vesselData);
    
    // Ensure required fields
    if (!vesselData.name || !vesselData.imo || !vesselData.mmsi || !vesselData.vesselType || !vesselData.flag) {
      return res.status(400).json({ 
        error: "Missing required fields: name, imo, mmsi, vesselType, flag" 
      });
    }
    
    // Set default values for empty strings
    Object.keys(vesselData).forEach(key => {
      if (vesselData[key] === "") {
        vesselData[key] = null;
      }
    });
    
    const newVessel = await db.insert(vessels).values(vesselData).returning();
    res.status(201).json(newVessel[0]);
  } catch (error) {
    console.error("Error creating vessel:", error);
    if (error.code === '23505') {
      res.status(400).json({ error: "Vessel with this IMO number already exists" });
    } else {
      res.status(500).json({ error: "Failed to create vessel" });
    }
  }
});

// Update vessel
router.put("/:id", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.id);
    let vesselData = { ...req.body };
    
    // Convert dates and numbers
    vesselData = convertDates(vesselData);
    vesselData = convertNumbers(vesselData);
    
    // Set default values for empty strings
    Object.keys(vesselData).forEach(key => {
      if (vesselData[key] === "") {
        vesselData[key] = null;
      }
    });
    
    // Add lastUpdated timestamp
    vesselData.lastUpdated = new Date();
    
    const updatedVessel = await db
      .update(vessels)
      .set(vesselData)
      .where(eq(vessels.id, vesselId))
      .returning();
    
    if (updatedVessel.length === 0) {
      return res.status(404).json({ error: "Vessel not found" });
    }
    
    res.json(updatedVessel[0]);
  } catch (error) {
    console.error("Error updating vessel:", error);
    res.status(500).json({ error: "Failed to update vessel" });
  }
});

// Delete vessel
router.delete("/:id", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.id);
    
    const deletedVessel = await db
      .delete(vessels)
      .where(eq(vessels.id, vesselId))
      .returning();
    
    if (deletedVessel.length === 0) {
      return res.status(404).json({ error: "Vessel not found" });
    }
    
    res.json({ message: "Vessel deleted successfully" });
  } catch (error) {
    console.error("Error deleting vessel:", error);
    res.status(500).json({ error: "Failed to delete vessel" });
  }
});

export default router;