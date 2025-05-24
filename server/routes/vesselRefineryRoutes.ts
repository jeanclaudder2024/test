import { Router } from "express";
import { storage } from "../storage";
import { calculateDistance } from "../utils/distanceCalculator";
import { InsertVesselRefineryConnection } from "@shared/schema";

export const vesselRefineryRouter = Router();

// Get all vessel-refinery connections
vesselRefineryRouter.get("/", async (req, res) => {
  try {
    const connections = await storage.getVesselRefineryConnections();
    res.json(connections);
  } catch (error) {
    console.error("Error fetching vessel-refinery connections:", error);
    res.status(500).json({ message: "Failed to fetch vessel-refinery connections" });
  }
});

// Get connections for a specific vessel
vesselRefineryRouter.get("/vessel/:vesselId", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.vesselId);
    if (isNaN(vesselId)) {
      return res.status(400).json({ message: "Invalid vessel ID" });
    }
    
    const connections = await storage.getVesselRefineryConnectionsByVesselId(vesselId);
    res.json(connections);
  } catch (error) {
    console.error("Error fetching vessel connections:", error);
    res.status(500).json({ message: "Failed to fetch vessel connections" });
  }
});

// Get connections for a specific refinery
vesselRefineryRouter.get("/refinery/:refineryId", async (req, res) => {
  try {
    const refineryId = parseInt(req.params.refineryId);
    if (isNaN(refineryId)) {
      return res.status(400).json({ message: "Invalid refinery ID" });
    }
    
    const connections = await storage.getVesselRefineryConnectionsByRefineryId(refineryId);
    res.json(connections);
  } catch (error) {
    console.error("Error fetching refinery connections:", error);
    res.status(500).json({ message: "Failed to fetch refinery connections" });
  }
});

// Create a new vessel-refinery connection
vesselRefineryRouter.post("/", async (req, res) => {
  try {
    const { vesselId, refineryId, connectionType, status, cargoVolume, startDate, endDate } = req.body;
    
    if (!vesselId || !refineryId) {
      return res.status(400).json({ message: "Vessel ID and Refinery ID are required" });
    }
    
    // Convert IDs to numbers if they're strings
    const vId = typeof vesselId === 'string' ? parseInt(vesselId) : vesselId;
    const rId = typeof refineryId === 'string' ? parseInt(refineryId) : refineryId;
    
    // Validate that vessel and refinery exist
    const vessel = await storage.getVesselById(vId);
    const refinery = await storage.getRefineryById(rId);
    
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found" });
    }
    
    if (!refinery) {
      return res.status(404).json({ message: "Refinery not found" });
    }
    
    // Create the connection
    // Handle cargoVolume to ensure it's within database limits (less than 10^13)
    let processedCargoVolume = null;
    if (cargoVolume) {
      // Parse and validate the cargo volume to ensure it doesn't overflow
      const parsedVolume = parseFloat(cargoVolume);
      if (!isNaN(parsedVolume) && parsedVolume < 9999999999999) { // Less than 10^13
        processedCargoVolume = parsedVolume;
      } else {
        // If the value is too large, cap it at a reasonable maximum
        processedCargoVolume = 9999999999;
      }
    }
    
    const newConnection: InsertVesselRefineryConnection = {
      vesselId: vId,
      refineryId: rId,
      connectionType: connectionType || "loading",
      status: status || "active",
      cargoVolume: processedCargoVolume,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null
    };
    
    const createdConnection = await storage.createVesselRefineryConnection(newConnection);
    res.status(201).json(createdConnection);
  } catch (error) {
    console.error("Error creating vessel-refinery connection:", error);
    res.status(500).json({ message: "Failed to create vessel-refinery connection" });
  }
});

// Update a vessel-refinery connection
vesselRefineryRouter.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid connection ID" });
    }
    
    const connection = await storage.getVesselRefineryConnectionById(id);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }
    
    const { connectionType, status, cargoVolume, startDate, endDate } = req.body;
    
    // Prepare update object
    const updateData: Partial<InsertVesselRefineryConnection> = {};
    
    if (connectionType !== undefined) updateData.connectionType = connectionType;
    if (status !== undefined) updateData.status = status;
    if (cargoVolume !== undefined) updateData.cargoVolume = cargoVolume;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    
    const updatedConnection = await storage.updateVesselRefineryConnection(id, updateData);
    res.json(updatedConnection);
  } catch (error) {
    console.error("Error updating vessel-refinery connection:", error);
    res.status(500).json({ message: "Failed to update vessel-refinery connection" });
  }
});

// Delete a vessel-refinery connection
vesselRefineryRouter.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid connection ID" });
    }
    
    const connection = await storage.getVesselRefineryConnectionById(id);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }
    
    await storage.deleteVesselRefineryConnection(id);
    res.json({ success: true, message: "Connection deleted successfully" });
  } catch (error) {
    console.error("Error deleting vessel-refinery connection:", error);
    res.status(500).json({ message: "Failed to delete vessel-refinery connection" });
  }
});

// Connect vessel to nearby refineries automatically
vesselRefineryRouter.post("/connect-vessel/:vesselId", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.vesselId);
    if (isNaN(vesselId)) {
      return res.status(400).json({ message: "Invalid vessel ID format" });
    }
    
    const vessel = await storage.getVesselById(vesselId);
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found" });
    }
    
    if (!vessel.currentLat || !vessel.currentLng) {
      return res.status(400).json({ message: "Vessel does not have current coordinates" });
    }
    
    // Get all refineries
    const refineries = await storage.getRefineries();
    
    // Calculate distance to each refinery
    const vesselLat = parseFloat(vessel.currentLat);
    const vesselLng = parseFloat(vessel.currentLng);
    
    const nearbyRefineries = refineries
      .filter(refinery => {
        if (!refinery.lat || !refinery.lng) return false;
        
        const refineryLat = parseFloat(refinery.lat);
        const refineryLng = parseFloat(refinery.lng);
        
        // Calculate distance in kilometers
        const distance = calculateDistance(vesselLat, vesselLng, refineryLat, refineryLng);
        
        // Consider refineries within 20km
        return distance <= 20;
      })
      .sort((a, b) => {
        const distA = calculateDistance(
          vesselLat, vesselLng, 
          parseFloat(a.lat || "0"), parseFloat(a.lng || "0")
        );
        const distB = calculateDistance(
          vesselLat, vesselLng, 
          parseFloat(b.lat || "0"), parseFloat(b.lng || "0")
        );
        return distA - distB;
      });
    
    if (nearbyRefineries.length === 0) {
      return res.status(404).json({ 
        message: "No refineries found near the vessel's location",
        vesselCoordinates: { lat: vesselLat, lng: vesselLng }
      });
    }
    
    // Connect vessel to the closest refinery
    const closestRefinery = nearbyRefineries[0];
    
    // Check if connection already exists
    const existingConnections = await storage.getVesselRefineryConnectionsByVesselId(vesselId);
    const alreadyConnected = existingConnections.some(conn => 
      conn.refineryId === closestRefinery.id && conn.status === "active"
    );
    
    if (alreadyConnected) {
      return res.json({
        message: "Vessel is already connected to this refinery",
        refinery: closestRefinery
      });
    }
    
    // Create connection
    const newConnection: InsertVesselRefineryConnection = {
      vesselId,
      refineryId: closestRefinery.id,
      connectionType: "docked",
      status: "active",
      cargoVolume: vessel.cargoCapacity || null,
      startDate: new Date(),
      endDate: null
    };
    
    const createdConnection = await storage.createVesselRefineryConnection(newConnection);
    
    res.status(201).json({
      message: "Vessel connected to nearest refinery successfully",
      connection: createdConnection,
      refinery: closestRefinery
    });
  } catch (error) {
    console.error("Error connecting vessel to refineries:", error);
    res.status(500).json({ message: "Failed to connect vessel to refineries" });
  }
});