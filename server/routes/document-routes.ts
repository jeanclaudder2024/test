import { Router } from 'express';
import { db } from '../db';
import { vesselDocuments, vessels } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const documentRouter = Router();

/**
 * Get all documents in the database
 */
documentRouter.get('/api/documents', async (req, res) => {
  try {
    const allDocs = await db.select().from(vesselDocuments);
    res.json(allDocs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * Get a document by its ID
 */
documentRouter.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.select().from(vesselDocuments).where(eq(vesselDocuments.id, parseInt(id)));
    
    if (doc.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(doc[0]);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

/**
 * Get all documents for a specific vessel
 */
documentRouter.get('/api/vessels/:vesselId/documents', async (req, res) => {
  try {
    const { vesselId } = req.params;
    
    // First check if the vessel exists
    const vessel = await db.select().from(vessels).where(eq(vessels.id, parseInt(vesselId)));
    
    if (vessel.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    
    // Fetch all documents for this vessel
    const vesselDocs = await db.select().from(vesselDocuments).where(eq(vesselDocuments.vesselId, parseInt(vesselId)));
    
    res.json(vesselDocs);
  } catch (error) {
    console.error('Error fetching vessel documents:', error);
    res.status(500).json({ error: 'Failed to fetch vessel documents' });
  }
});

/**
 * Create a new document for a vessel
 */
documentRouter.post('/api/vessels/:vesselId/documents', async (req, res) => {
  try {
    const { vesselId } = req.params;
    const documentData = req.body;
    
    // Validate required fields
    if (!documentData.type || !documentData.title || !documentData.content) {
      return res.status(400).json({ error: 'Missing required fields: type, title, and content are required' });
    }
    
    // Check if vessel exists
    const vessel = await db.select().from(vessels).where(eq(vessels.id, parseInt(vesselId)));
    
    if (vessel.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    
    // Create new document
    const newDocument = {
      ...documentData,
      vesselId: parseInt(vesselId),
      issueDate: documentData.issueDate ? new Date(documentData.issueDate) : new Date(),
      expiryDate: documentData.expiryDate ? new Date(documentData.expiryDate) : null,
      status: documentData.status || 'active',
      language: documentData.language || 'en'
    };
    
    const [createdDoc] = await db.insert(vesselDocuments).values(newDocument).returning();
    
    res.status(201).json(createdDoc);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

/**
 * Update a document
 */
documentRouter.put('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
    
    // First check if the document exists
    const document = await db.select().from(vesselDocuments).where(eq(vesselDocuments.id, parseInt(id)));
    
    if (document.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Process dates if provided
    if (documentData.issueDate) {
      documentData.issueDate = new Date(documentData.issueDate);
    }
    
    if (documentData.expiryDate) {
      documentData.expiryDate = new Date(documentData.expiryDate);
    }
    
    // Update document
    const [updatedDoc] = await db.update(vesselDocuments)
      .set(documentData)
      .where(eq(vesselDocuments.id, parseInt(id)))
      .returning();
    
    res.json(updatedDoc);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});