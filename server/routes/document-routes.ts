import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { documents, vessels } from "@shared/schema";

const router = Router();

// Get all documents with optional vessel filter
router.get("/api/documents", async (req, res) => {
  try {
    const { vesselId } = req.query;
    
    let result;
    if (vesselId) {
      // Filter documents by vessel ID
      result = await db
        .select()
        .from(documents)
        .where(eq(documents.vesselId, parseInt(vesselId as string)))
        .orderBy(desc(documents.issueDate));
    } else {
      // Get all documents
      result = await db
        .select()
        .from(documents)
        .orderBy(desc(documents.issueDate));
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Get documents for a specific vessel
router.get("/api/vessels/:id/documents", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.id);
    
    // Verify vessel exists
    const vessel = await db
      .select()
      .from(vessels)
      .where(eq(vessels.id, vesselId))
      .limit(1);
      
    if (!vessel || vessel.length === 0) {
      return res.status(404).json({ error: "Vessel not found" });
    }
    
    // Get vessel documents
    const result = await db
      .select()
      .from(documents)
      .where(eq(documents.vesselId, vesselId))
      .orderBy(desc(documents.issueDate));
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching vessel documents:", error);
    res.status(500).json({ error: "Failed to fetch vessel documents" });
  }
});

// Get a specific document by ID
router.get("/api/documents/:id", async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    
    const result = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);
      
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

export default router;