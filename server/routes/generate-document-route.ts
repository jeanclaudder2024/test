/**
 * API Route to generate OpenAI vessel documents on demand
 */
import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { vessels, vesselDocuments } from '@shared/schema';
import { OpenAIService } from '../services/openaiService';

// Initialize router
export const generateDocumentRouter = Router();

// Create OpenAI service instance
const openaiService = new OpenAIService();

/**
 * Endpoint to generate a vessel document using OpenAI
 * POST /api/generate-document 
 * Body: { vesselId: number, documentType: string }
 */
generateDocumentRouter.post('/api/generate-document', async (req, res) => {
  try {
    const { vesselId, documentType } = req.body;
    
    // Validate required fields
    if (!vesselId || !documentType) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: vesselId and documentType are required" 
      });
    }
    
    // Get the vessel from the database
    const [vessel] = await db.select().from(vessels).where(eq(vessels.id, parseInt(vesselId)));
    
    if (!vessel) {
      return res.status(404).json({ 
        success: false,
        message: "Vessel not found" 
      });
    }
    
    console.log(`Generating ${documentType} for vessel: ${vessel.name} (${vessel.id})`);
    
    // Generate the document using OpenAI
    const generatedDoc = await openaiService.generateShippingDocument(vessel, documentType);
    
    // Save the document to the database
    const [savedDoc] = await db.insert(vesselDocuments).values({
      vesselId: vessel.id,
      documentType: documentType,
      title: generatedDoc.title,
      content: generatedDoc.content,
      status: 'generated'
    }).returning();
    
    // Return success response with document data
    res.json({
      success: true,
      document: {
        id: savedDoc.id,
        vesselId: savedDoc.vesselId,
        documentType: savedDoc.documentType,
        title: savedDoc.title,
        status: savedDoc.status
      }
    });
  } catch (error) {
    console.error("Error generating document:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to generate document", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});