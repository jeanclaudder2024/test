import { Router } from "express";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { db } from "../db";
import { vessels, vesselJobs, gates, brokers, vesselExtraInfo } from "@shared/schema";

const router = Router();

// Get all vessels with their current jobs, gates, and brokers
router.get("/api/vessel-dashboard", async (req, res) => {
  try {
    // Fetch vessels with related job information
    const vesselsWithJobs = await db.query.vessels.findMany({
      with: {
        currentJobs: {
          // Get the latest job for each vessel
          limit: 1,
          orderBy: [desc(vesselJobs.lastUpdated)],
          with: {
            gate: true,
            broker: true,
          },
        },
        extraInfo: true,
      },
    });

    // Transform the data to match the client's expected format
    const formattedVessels = vesselsWithJobs.map(vessel => {
      return {
        ...vessel,
        currentJob: vessel.currentJobs[0] || null,
        currentJobs: undefined, // Remove the array to clean up the response
        extraInfo: vessel.extraInfo || {
          loadingStatus: 'waiting',
          colorCode: 'blue',
        }
      };
    });

    res.json(formattedVessels);
  } catch (error) {
    console.error("Error fetching vessel dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch vessel dashboard data" });
  }
});

// Update vessel status
router.post("/api/vessel-dashboard/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!id || !status) {
    return res.status(400).json({ error: "Vessel ID and status are required" });
  }
  
  try {
    // Determine color code based on status
    let colorCode = 'blue';
    
    switch (status) {
      case 'unloading':
        colorCode = 'red';
        break;
      case 'completed':
        colorCode = 'green';
        break;
      case 'waiting':
        colorCode = 'blue';
        break;
      case 'loading':
        colorCode = 'purple';
        break;
    }
    
    // Check if vessel has extra info already
    const existingInfo = await db.query.vesselExtraInfo.findFirst({
      where: eq(vesselExtraInfo.vesselId, parseInt(id))
    });
    
    if (existingInfo) {
      // Update existing record
      await db
        .update(vesselExtraInfo)
        .set({
          loadingStatus: status,
          colorCode,
          lastUpdated: new Date(),
        })
        .where(eq(vesselExtraInfo.vesselId, parseInt(id)));
    } else {
      // Create new record
      await db.insert(vesselExtraInfo).values({
        vesselId: parseInt(id),
        loadingStatus: status,
        colorCode,
        lastUpdated: new Date(),
      } as any);
    }
    
    // If status is completed, update the vessel job as well
    if (status === 'completed') {
      // Get the latest job for this vessel
      const latestJob = await db.query.vesselJobs.findFirst({
        where: eq(vesselJobs.vesselId, parseInt(id)),
        orderBy: [desc(vesselJobs.lastUpdated)],
      });
      
      if (latestJob) {
        await db
          .update(vesselJobs)
          .set({
            status: 'completed',
            actualEndTime: new Date(),
            unloadingProgress: 100,
            lastUpdated: new Date(),
          })
          .where(eq(vesselJobs.id, latestJob.id));
      }
    }
    
    res.json({ success: true, message: "Vessel status updated successfully" });
  } catch (error) {
    console.error("Error updating vessel status:", error);
    res.status(500).json({ error: "Failed to update vessel status" });
  }
});

export default router;