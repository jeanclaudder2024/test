import { Router, Request, Response } from 'express';
import { openaiService } from '../services/openaiService';
import { storage } from '../storage';
import { Document, RefineryPortConnection, insertDocumentSchema } from '@shared/schema';

export const aiRouter = Router();

/**
 * @route POST /api/ai/generate-port-description
 * @description Generate and update a port description using OpenAI
 * @access Public
 */
aiRouter.post('/generate-port-description', async (req: Request, res: Response) => {
  try {
    const { portId } = req.body;
    
    if (!portId) {
      return res.status(400).json({ error: 'Port ID is required' });
    }
    
    // Get port data
    const port = await storage.getPortById(Number(portId));
    
    if (!port) {
      return res.status(404).json({ error: 'Port not found' });
    }
    
    // Generate description using OpenAI
    const description = await openaiService.generatePortDescription(port);
    
    // Update port with new description
    const updatedPort = await storage.updatePort(port.id, { 
      description 
    });
    
    res.json({ 
      success: true, 
      port: updatedPort,
      description 
    });
  } catch (error) {
    console.error('Error generating port description:', error);
    res.status(500).json({ error: 'Failed to generate port description' });
  }
});

/**
 * @route POST /api/ai/generate-refinery-description
 * @description Generate and update a refinery description using OpenAI
 * @access Public
 */
aiRouter.post('/generate-refinery-description', async (req: Request, res: Response) => {
  try {
    const { refineryId } = req.body;
    
    if (!refineryId) {
      return res.status(400).json({ error: 'Refinery ID is required' });
    }
    
    // Get refinery data
    const refinery = await storage.getRefineryById(Number(refineryId));
    
    if (!refinery) {
      return res.status(404).json({ error: 'Refinery not found' });
    }
    
    // Generate description using OpenAI
    const description = await openaiService.generateRefineryDescription(refinery);
    
    // Update refinery with new description
    const updatedRefinery = await storage.updateRefinery(refinery.id, { 
      description 
    });
    
    res.json({ 
      success: true, 
      refinery: updatedRefinery,
      description 
    });
  } catch (error) {
    console.error('Error generating refinery description:', error);
    res.status(500).json({ error: 'Failed to generate refinery description' });
  }
});

/**
 * @route POST /api/ai/generate-document
 * @description Generate a shipping document for a vessel using OpenAI
 * @access Public
 */
aiRouter.post('/generate-document', async (req: Request, res: Response) => {
  try {
    const { vesselId, documentType } = req.body;
    
    if (!vesselId) {
      return res.status(400).json({ error: 'Vessel ID is required' });
    }
    
    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }
    
    // Get vessel data
    const vessel = await storage.getVesselById(Number(vesselId));
    
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    
    // Generate document using OpenAI
    const { title, content } = await openaiService.generateShippingDocument(vessel, documentType);
    
    // Create document in database
    const documentData = insertDocumentSchema.parse({
      vesselId: vessel.id,
      title,
      content,
      type: documentType,
      status: 'active',
      issuedDate: new Date(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days expiry
      issuer: 'AI Generated',
      fileUrl: null,
      metadata: JSON.stringify({
        generated: true,
        generationDate: new Date().toISOString(),
        model: 'gpt-4o'
      })
    });
    
    const document = await storage.createDocument(documentData);
    
    res.json({ 
      success: true, 
      document
    });
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

/**
 * @route POST /api/ai/route-optimization
 * @description Generate route optimization suggestions for a vessel
 * @access Public
 */
aiRouter.post('/route-optimization', async (req: Request, res: Response) => {
  try {
    const { vesselId } = req.body;
    
    if (!vesselId) {
      return res.status(400).json({ error: 'Vessel ID is required' });
    }
    
    // Get vessel data
    const vessel = await storage.getVesselById(Number(vesselId));
    
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    
    // Generate route optimization using OpenAI
    const optimization = await openaiService.generateRouteOptimization(vessel);
    
    res.json({ 
      success: true, 
      vesselId: vessel.id,
      vesselName: vessel.name,
      optimization
    });
  } catch (error) {
    console.error('Error generating route optimization:', error);
    res.status(500).json({ error: 'Failed to generate route optimization' });
  }
});

/**
 * @route POST /api/ai/generate-connections-descriptions
 * @description Generate descriptions for all refinery-port connections
 * @access Public
 */
aiRouter.post('/generate-all-port-descriptions', async (req: Request, res: Response) => {
  try {
    const { region } = req.body;
    
    // Get all ports, optionally filtering by region
    const ports = region 
      ? await storage.getPortsByRegion(region)
      : await storage.getPorts();
    
    // Filter ports that don't have descriptions
    const portsWithoutDescriptions = ports.filter(port => !port.description);
    
    if (portsWithoutDescriptions.length === 0) {
      return res.json({
        success: true,
        message: 'All ports already have descriptions',
        portsUpdated: 0,
        totalPorts: ports.length
      });
    }
    
    // Limit to first 5 ports to avoid long-running requests
    const portsToUpdate = portsWithoutDescriptions.slice(0, 5);
    
    // Generate and update descriptions
    const updatePromises = portsToUpdate.map(async (port) => {
      const description = await openaiService.generatePortDescription(port);
      return storage.updatePort(port.id, { description });
    });
    
    const updatedPorts = await Promise.all(updatePromises);
    
    res.json({
      success: true,
      portsUpdated: updatedPorts.length,
      totalPorts: ports.length,
      remainingPorts: portsWithoutDescriptions.length - updatedPorts.length,
      updatedPorts
    });
  } catch (error) {
    console.error('Error generating port descriptions:', error);
    res.status(500).json({ error: 'Failed to generate port descriptions' });
  }
});

/**
 * @route POST /api/ai/generate-all-refinery-descriptions
 * @description Generate descriptions for all refineries
 * @access Public
 */
aiRouter.post('/generate-all-refinery-descriptions', async (req: Request, res: Response) => {
  try {
    const { region } = req.body;
    
    // Get all refineries, optionally filtering by region
    const refineries = region 
      ? await storage.getRefineryByRegion(region)
      : await storage.getRefineries();
    
    // Filter refineries that don't have descriptions
    const refineriesWithoutDescriptions = refineries.filter(refinery => !refinery.description);
    
    if (refineriesWithoutDescriptions.length === 0) {
      return res.json({
        success: true,
        message: 'All refineries already have descriptions',
        refineriesUpdated: 0,
        totalRefineries: refineries.length
      });
    }
    
    // Limit to first 5 refineries to avoid long-running requests
    const refineriesToUpdate = refineriesWithoutDescriptions.slice(0, 5);
    
    // Generate and update descriptions
    const updatePromises = refineriesToUpdate.map(async (refinery) => {
      const description = await openaiService.generateRefineryDescription(refinery);
      return storage.updateRefinery(refinery.id, { description });
    });
    
    const updatedRefineries = await Promise.all(updatePromises);
    
    res.json({
      success: true,
      refineriesUpdated: updatedRefineries.length,
      totalRefineries: refineries.length,
      remainingRefineries: refineriesWithoutDescriptions.length - updatedRefineries.length,
      updatedRefineries
    });
  } catch (error) {
    console.error('Error generating refinery descriptions:', error);
    res.status(500).json({ error: 'Failed to generate refinery descriptions' });
  }
});