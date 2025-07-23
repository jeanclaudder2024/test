import { Router } from "express";
import { db } from "../db";
import { vessels, ports } from "@shared/schema";
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
    
    // Convert port IDs to port names for all vessels
    const vesselsWithPortNames = await Promise.all(
      allVessels.map(async (vessel) => {
        const vesselData = { ...vessel };
        
        // Look up departure port name
        if (vesselData.departurePort && typeof vesselData.departurePort === 'number') {
          try {
            const departurePortData = await db.select().from(ports).where(eq(ports.id, vesselData.departurePort)).limit(1);
            if (departurePortData.length > 0) {
              vesselData.departurePort = departurePortData[0].name;
            }
          } catch (error) {
            console.log("Failed to lookup departure port name for vessel", vessel.id);
          }
        }
        
        // Look up destination port name
        if (vesselData.destinationPort && typeof vesselData.destinationPort === 'number') {
          try {
            const destinationPortData = await db.select().from(ports).where(eq(ports.id, vesselData.destinationPort)).limit(1);
            if (destinationPortData.length > 0) {
              vesselData.destinationPort = destinationPortData[0].name;
            }
          } catch (error) {
            console.log("Failed to lookup destination port name for vessel", vessel.id);
          }
        }
        
        return vesselData;
      })
    );
    
    res.json(vesselsWithPortNames);
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
    
    const vesselData = vessel[0];
    
    // Look up port names if the ports are stored as IDs
    if (vesselData.departurePort && typeof vesselData.departurePort === 'number') {
      try {
        const departurePortData = await db.select().from(ports).where(eq(ports.id, vesselData.departurePort)).limit(1);
        if (departurePortData.length > 0) {
          vesselData.departurePort = departurePortData[0].name;
        }
      } catch (error) {
        console.log("Failed to lookup departure port name");
      }
    }
    
    if (vesselData.destinationPort && typeof vesselData.destinationPort === 'number') {
      try {
        const destinationPortData = await db.select().from(ports).where(eq(ports.id, vesselData.destinationPort)).limit(1);
        if (destinationPortData.length > 0) {
          vesselData.destinationPort = destinationPortData[0].name;
        }
      } catch (error) {
        console.log("Failed to lookup destination port name");
      }
    }
    
    res.json(vesselData);
  } catch (error) {
    console.error("Error fetching vessel:", error);
    res.status(500).json({ error: "Failed to fetch vessel" });
  }
});

// Create new vessel
router.post("/", async (req, res) => {
  try {
    console.log("Received request to create vessel:", req.body);
    
    let vesselData = { ...req.body };
    
    // Ensure required fields
    if (!vesselData.name || !vesselData.imo || !vesselData.mmsi || !vesselData.vesselType || !vesselData.flag) {
      return res.status(400).json({ 
        error: "Missing required fields: name, imo, mmsi, vesselType, flag" 
      });
    }

    // Helper function to look up port ID by name
    const getPortId = async (portName) => {
      if (!portName || portName === "") return null;
      try {
        const port = await db.select().from(ports).where(eq(ports.name, portName)).limit(1);
        return port.length > 0 ? port[0].id : null;
      } catch (error) {
        console.log("Port lookup failed for:", portName);
        return null;
      }
    };

    // Convert empty strings to null for optional fields
    const toNullIfEmpty = (value) => {
      if (value === "" || value === undefined || value === "undefined") return null;
      return value;
    };

    const toIntOrNull = (value) => {
      if (value === "" || value === undefined || value === "undefined" || value === null) return null;
      const parsed = parseInt(value);
      return isNaN(parsed) ? null : parsed;
    };

    const toDateOrNull = (value) => {
      if (!value || value === "" || value === "undefined") return null;
      try {
        return new Date(value);
      } catch {
        return null;
      }
    };

    // Look up port IDs if the database expects them
    const departurePortId = await getPortId(vesselData.departurePort);
    const destinationPortId = await getPortId(vesselData.destinationPort);
    
    // Clean and validate data - try with port IDs first, fallback to names
    const cleanedData = {
      name: vesselData.name.toString().trim(),
      imo: vesselData.imo.toString().trim(),
      mmsi: vesselData.mmsi.toString().trim(),
      vesselType: vesselData.vesselType.toString().trim(),
      flag: vesselData.flag.toString().trim(),
      built: toIntOrNull(vesselData.built),
      deadweight: toIntOrNull(vesselData.deadweight),
      currentLat: toNullIfEmpty(vesselData.currentLat),
      currentLng: toNullIfEmpty(vesselData.currentLng),
      departurePort: departurePortId || toNullIfEmpty(vesselData.departurePort),
      departureDate: toDateOrNull(vesselData.departureDate),
      departureLat: toNullIfEmpty(vesselData.departureLat),
      departureLng: toNullIfEmpty(vesselData.departureLng),
      destinationPort: destinationPortId || toNullIfEmpty(vesselData.destinationPort),
      destinationLat: toNullIfEmpty(vesselData.destinationLat),
      destinationLng: toNullIfEmpty(vesselData.destinationLng),
      eta: toDateOrNull(vesselData.eta),
      cargoType: toNullIfEmpty(vesselData.cargoType),
      cargoCapacity: toIntOrNull(vesselData.cargoCapacity),
      currentRegion: toNullIfEmpty(vesselData.currentRegion),
      status: vesselData.status ? vesselData.status.toString().trim() : "underway",
      speed: toNullIfEmpty(vesselData.speed),
      buyerName: toNullIfEmpty(vesselData.buyerName),
      sellerName: toNullIfEmpty(vesselData.sellerName),
      ownerName: toNullIfEmpty(vesselData.ownerName),
      operatorName: toNullIfEmpty(vesselData.operatorName),
      oilSource: toNullIfEmpty(vesselData.oilSource),
      lastUpdated: new Date()
    };
    
    console.log("Cleaned vessel data with port IDs:", cleanedData);
    
    const newVessel = await db.insert(vessels).values(cleanedData).returning();
    console.log("Vessel created successfully:", newVessel[0]);
    res.status(201).json(newVessel[0]);
  } catch (error) {
    console.error("Error creating vessel:", error);
    if (error.code === '23505') {
      res.status(400).json({ error: "Vessel with this IMO number already exists" });
    } else {
      res.status(500).json({ error: "Failed to create vessel: " + error.message });
    }
  }
});

// Update vessel
router.put("/:id", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.id);
    let vesselData = { ...req.body };
    
    console.log("VESSEL UPDATE - Raw data received:", vesselData);
    
    // Clean and validate data with proper port ID handling
    const cleanedData = {
      name: vesselData.name ? vesselData.name.toString().trim() : undefined,
      imo: vesselData.imo ? vesselData.imo.toString().trim() : undefined,
      mmsi: vesselData.mmsi ? vesselData.mmsi.toString().trim() : undefined,
      vesselType: vesselData.vesselType ? vesselData.vesselType.toString().trim() : undefined,
      flag: vesselData.flag ? vesselData.flag.toString().trim() : undefined,
      built: vesselData.built ? parseInt(vesselData.built) : null,
      deadweight: vesselData.deadweight ? parseInt(vesselData.deadweight) : null,
      currentLat: vesselData.currentLat ? vesselData.currentLat.toString() : null,
      currentLng: vesselData.currentLng ? vesselData.currentLng.toString() : null,
      // Fix: Convert port IDs to integers instead of strings
      departurePort: vesselData.departurePort ? parseInt(vesselData.departurePort) : null,
      departureDate: vesselData.departureDate ? new Date(vesselData.departureDate) : null,
      departureLat: vesselData.departureLat ? vesselData.departureLat.toString() : null,
      departureLng: vesselData.departureLng ? vesselData.departureLng.toString() : null,
      // Fix: Convert destination port ID to integer
      destinationPort: vesselData.destinationPort ? parseInt(vesselData.destinationPort) : null,
      destinationLat: vesselData.destinationLat ? vesselData.destinationLat.toString() : null,
      destinationLng: vesselData.destinationLng ? vesselData.destinationLng.toString() : null,
      eta: vesselData.eta ? new Date(vesselData.eta) : null,
      cargoType: vesselData.cargoType ? vesselData.cargoType.toString().trim() : null,
      cargoCapacity: vesselData.cargoCapacity ? parseInt(vesselData.cargoCapacity) : null,
      currentRegion: vesselData.currentRegion ? vesselData.currentRegion.toString().trim() : null,
      status: vesselData.status ? vesselData.status.toString().trim() : null,
      speed: vesselData.speed ? vesselData.speed.toString().trim() : null,
      buyerName: vesselData.buyerName ? vesselData.buyerName.toString().trim() : null,
      sellerName: vesselData.sellerName ? vesselData.sellerName.toString().trim() : null,
      ownerName: vesselData.ownerName ? vesselData.ownerName.toString().trim() : null,
      operatorName: vesselData.operatorName ? vesselData.operatorName.toString().trim() : null,
      oilSource: vesselData.oilSource ? vesselData.oilSource.toString().trim() : null,
      lastUpdated: new Date()
    };
    
    console.log("VESSEL UPDATE - Cleaned data:", cleanedData);
    
    // Remove undefined values
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === undefined) {
        delete cleanedData[key];
      }
    });
    
    console.log("VESSEL UPDATE - Final data for database:", cleanedData);
    
    const updatedVessel = await db
      .update(vessels)
      .set(cleanedData)
      .where(eq(vessels.id, vesselId))
      .returning();
    
    if (updatedVessel.length === 0) {
      return res.status(404).json({ error: "Vessel not found" });
    }
    
    console.log("VESSEL UPDATE - Successfully updated vessel:", updatedVessel[0]);
    res.json(updatedVessel[0]);
  } catch (error) {
    console.error("VESSEL UPDATE - Error updating vessel:", error);
    res.status(500).json({ error: "Failed to update vessel: " + error.message });
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

// Generate AI vessel data
router.post("/generate-ai", async (req, res) => {
  try {
    const { generateRealisticVesselData } = await import("../services/aiVesselGenerator");
    const vesselData = await generateRealisticVesselData();
    res.json(vesselData);
  } catch (error) {
    console.error("Error generating AI vessel data:", error);
    res.status(500).json({ 
      error: "Failed to generate vessel data. Please ensure OpenAI API access is configured." 
    });
  }
});

export default router;