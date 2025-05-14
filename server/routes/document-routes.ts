import { Request, Response, Router } from "express";
import { db } from "../db";
import { vessels, documents } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { generateVesselDocuments } from "../scripts/generate-vessel-documents";

/**
 * API routes for vessel document management
 */
const documentRouter = Router();

/**
 * Get documents for a specific vessel
 */
documentRouter.get("/api/vessels/:vesselId/documents", async (req: Request, res: Response) => {
  try {
    const vesselId = parseInt(req.params.vesselId);
    
    if (isNaN(vesselId)) {
      return res.status(400).json({ error: "Invalid vessel ID" });
    }
    
    // Check if vessel exists
    const vessel = await db.select().from(vessels).where(eq(vessels.id, vesselId)).limit(1);
    
    if (vessel.length === 0) {
      return res.status(404).json({ error: "Vessel not found" });
    }
    
    // Get all documents for this vessel
    const vesselDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.vesselId, vesselId))
      .orderBy(desc(documents.issueDate));
    
    res.json(vesselDocuments);
  } catch (error) {
    console.error("Error fetching vessel documents:", error);
    res.status(500).json({ error: "Failed to fetch vessel documents" });
  }
});

/**
 * Get a specific document by ID
 */
documentRouter.get("/api/documents/:documentId", async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.documentId);
    
    if (isNaN(documentId)) {
      return res.status(400).json({ error: "Invalid document ID" });
    }
    
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);
    
    if (document.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    res.json(document[0]);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Failed to fetch document details" });
  }
});

/**
 * Generate documents for testing - only available in development environment
 */
documentRouter.post("/api/generate-documents", async (req: Request, res: Response) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({ error: "This endpoint is only available in development mode" });
    }
    
    const count = req.query.count ? parseInt(req.query.count as string) : 20;
    
    if (isNaN(count) || count <= 0 || count > 100) {
      return res.status(400).json({ error: "Count must be a number between 1 and 100" });
    }
    
    const result = await generateVesselDocuments(count);
    
    res.json({
      message: `Document generation completed successfully`,
      generated: result.generated,
      total: result.count
    });
  } catch (error) {
    console.error("Error generating documents:", error);
    res.status(500).json({ error: "Failed to generate documents" });
  }
});

/**
 * Get all documents (with pagination)
 */
documentRouter.get("/api/documents", async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
    const vesselId = req.query.vesselId ? parseInt(req.query.vesselId as string) : undefined;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ error: "Page size must be between 1 and 100" });
    }
    
    // Build conditions based on filters
    let conditions = [];
    
    if (vesselId !== undefined && !isNaN(vesselId)) {
      conditions.push(eq(documents.vesselId, vesselId));
    }
    
    if (status) {
      conditions.push(eq(documents.status, status));
    }
    
    if (type) {
      conditions.push(eq(documents.type, type));
    }
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(${documents.id})` })
      .from(documents)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const totalCount = countResult[0].count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Get documents with pagination
    const documentsList = await db
      .select()
      .from(documents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(documents.issueDate))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    
    res.json({
      documents: documentsList,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

/**
 * Get document types (for filtering)
 */
documentRouter.get("/api/document-types", async (req: Request, res: Response) => {
  try {
    const types = await db
      .select({ type: documents.type })
      .from(documents)
      .groupBy(documents.type);
    
    res.json(types.map(t => t.type));
  } catch (error) {
    console.error("Error fetching document types:", error);
    res.status(500).json({ error: "Failed to fetch document types" });
  }
});

export { documentRouter };