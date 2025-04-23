import { Router } from 'express';
import { storage } from '../storage';
import { cohereService } from '../services/cohereService';
import { aiService } from '../services/aiService';
import { z } from 'zod';
import { insertDocumentSchema } from '@shared/schema';

export const documentRouter = Router();

/**
 * @route POST /api/documents/generate
 * @description Generate a shipping document based on vessel data
 * @access Public
 */
documentRouter.post('/generate', async (req, res) => {
  try {
    const { vesselId, documentType } = req.body;

    if (!vesselId || !documentType) {
      return res.status(400).json({ error: 'Vessel ID and document type are required' });
    }

    // Get vessel data for document generation
    const vessel = await storage.getVesselById(Number(vesselId));
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    // Generate document content using Cohere AI
    const docContent = await cohereService.generateShippingDocument(vessel, documentType);
    
    // Create document record in database
    const document = await storage.createDocument({
      vesselId: vessel.id,
      title: `${documentType} - ${vessel.name}`,
      type: documentType,
      content: docContent,
      status: 'draft',
      createdAt: new Date(),
    });
    
    return res.status(201).json({
      success: true,
      document
    });
  } catch (error: any) {
    console.error('Error generating document:', error);
    return res.status(500).json({
      error: 'Failed to generate document',
      details: error.message
    });
  }
});