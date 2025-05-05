import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { openaiService } from '../services/openaiService';
import { storage } from '../storage';

export const aiRouter = Router();

// Validation schema for port description generation request
const portDescriptionRequestSchema = z.object({
  portId: z.number().int().positive()
});

// Validation schema for refinery description generation request
const refineryDescriptionRequestSchema = z.object({
  refineryId: z.number().int().positive()
});

// Validation schema for vessel document generation request
const documentGenerationRequestSchema = z.object({
  vesselId: z.number().int().positive(),
  documentType: z.string().min(3)
});

// Validation schema for route optimization request
const routeOptimizationRequestSchema = z.object({
  vesselId: z.number().int().positive()
});

// Validation schema for seller name generation request
const sellerNameGenerationRequestSchema = z.object({
  vesselId: z.number().int().positive()
});

// Validation schema for updating vessel route and company info request
const updateVesselInfoRequestSchema = z.object({
  vesselId: z.number().int().positive()
});

/**
 * @route POST /api/ai/generate-port-description
 * @description Generate and update a port description using OpenAI
 * @access Public
 */
aiRouter.post('/generate-port-description', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validationResult = portDescriptionRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    const { portId } = validationResult.data;
    
    // Get port from database
    const port = await storage.getPortById(portId);
    
    if (!port) {
      return res.status(404).json({ 
        success: false, 
        error: `Port with ID ${portId} not found` 
      });
    }
    
    // Generate description
    const description = await openaiService.generatePortDescription(port);
    
    // Return success response
    return res.json({
      success: true,
      portId,
      description
    });
  } catch (error) {
    console.error('Error generating port description:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

/**
 * @route POST /api/ai/generate-refinery-description
 * @description Generate and update a refinery description using OpenAI
 * @access Public
 */
aiRouter.post('/generate-refinery-description', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validationResult = refineryDescriptionRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    const { refineryId } = validationResult.data;
    
    // Get refinery from database
    const refinery = await storage.getRefineryById(refineryId);
    
    if (!refinery) {
      return res.status(404).json({ 
        success: false, 
        error: `Refinery with ID ${refineryId} not found` 
      });
    }
    
    // Generate description
    const description = await openaiService.generateRefineryDescription(refinery);
    
    // Return success response
    return res.json({
      success: true,
      refineryId,
      description
    });
  } catch (error) {
    console.error('Error generating refinery description:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

/**
 * @route POST /api/ai/generate-document
 * @description Generate a shipping document for a vessel using OpenAI
 * @access Public
 */
aiRouter.post('/generate-document', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validationResult = documentGenerationRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    const { vesselId, documentType } = validationResult.data;
    
    // Get vessel from database
    const vessel = await storage.getVesselById(vesselId);
    
    if (!vessel) {
      return res.status(404).json({ 
        success: false, 
        error: `Vessel with ID ${vesselId} not found` 
      });
    }
    
    // Generate document
    const document = await openaiService.generateShippingDocument(vessel, documentType);
    
    // Store the document in the database
    const newDocument = await storage.createDocument({
      vesselId,
      title: document.title,
      content: document.content,
      type: documentType,  // in our schema, it's 'type' not 'documentType'
      status: 'generated'
      // The createdAt and lastUpdated fields are handled by the database
    });
    
    // Return success response
    return res.json({
      success: true,
      vesselId,
      documentId: newDocument.id,
      document
    });
  } catch (error) {
    console.error('Error generating document:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

/**
 * @route POST /api/ai/route-optimization
 * @description Generate route optimization suggestions for a vessel
 * @access Public
 */
aiRouter.post('/route-optimization', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validationResult = routeOptimizationRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    const { vesselId } = validationResult.data;
    
    // Get vessel from database
    const vessel = await storage.getVesselById(vesselId);
    
    if (!vessel) {
      return res.status(404).json({ 
        success: false, 
        error: `Vessel with ID ${vesselId} not found` 
      });
    }
    
    // Generate route optimization
    const optimization = await openaiService.generateRouteOptimization(vessel);
    
    // Return success response
    return res.json({
      success: true,
      vesselId,
      optimization
    });
  } catch (error) {
    console.error('Error generating route optimization:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

/**
 * @route POST /api/ai/generate-connections-descriptions
 * @description Generate descriptions for all refinery-port connections
 * @access Public
 */
aiRouter.post('/generate-all-port-descriptions', async (req: Request, res: Response) => {
  try {
    // Get all ports from database
    const ports = await storage.getPorts();
    
    // Track progress
    const results = {
      total: ports.length,
      success: 0,
      failed: 0,
      skipped: 0
    };
    
    // Only process ports without descriptions
    const portsWithoutDescriptions = ports.filter(port => !port.description);
    
    // If all ports have descriptions, return success
    if (portsWithoutDescriptions.length === 0) {
      return res.json({
        success: true,
        message: 'All ports already have descriptions',
        results: {
          ...results,
          skipped: ports.length
        }
      });
    }
    
    // Process ports in batches to avoid rate limiting
    const batchSize = 5;
    const batches = Math.ceil(portsWithoutDescriptions.length / batchSize);
    
    // Track failed ports
    const failedPorts: { id: number; name: string; error: string }[] = [];
    
    // Process ports in batches
    for (let i = 0; i < batches; i++) {
      const batchStart = i * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, portsWithoutDescriptions.length);
      const batch = portsWithoutDescriptions.slice(batchStart, batchEnd);
      
      console.log(`Processing port batch ${i + 1}/${batches} (${batch.length} ports)`);
      
      // Generate descriptions for batch
      const batchPromises = batch.map(async (port) => {
        try {
          await openaiService.generatePortDescription(port);
          results.success++;
          return { success: true, port };
        } catch (error) {
          results.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          failedPorts.push({ id: port.id, name: port.name, error: errorMessage });
          return { success: false, port, error: errorMessage };
        }
      });
      
      await Promise.all(batchPromises);
      
      // Add a small delay between batches to avoid rate limiting
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Return success response
    return res.json({
      success: true,
      message: `Generated descriptions for ${results.success} ports`,
      results,
      failedPorts: failedPorts.length > 0 ? failedPorts : undefined
    });
  } catch (error) {
    console.error('Error generating port descriptions:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

/**
 * @route POST /api/ai/generate-seller-name
 * @description Generate a seller company name for a vessel using OpenAI
 * @access Public
 */
aiRouter.post('/generate-seller-name', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validationResult = sellerNameGenerationRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    const { vesselId } = validationResult.data;
    
    // Get vessel from database
    const vessel = await storage.getVesselById(vesselId);
    
    if (!vessel) {
      return res.status(404).json({ 
        success: false, 
        error: `Vessel with ID ${vesselId} not found` 
      });
    }
    
    // Generate seller name
    const sellerName = await openaiService.generateSellerCompanyName(vessel);
    
    // Update vessel with seller name
    await storage.updateVessel(vesselId, { sellerName });
    
    // Return success response
    return res.json({
      success: true,
      vesselId,
      sellerName
    });
  } catch (error) {
    console.error('Error generating seller name:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

/**
 * @route POST /api/ai/update-vessel-info
 * @description Update vessel with route tracking coordinates and company info
 * @access Public
 */
aiRouter.post('/update-vessel-info', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validationResult = updateVesselInfoRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    const { vesselId } = validationResult.data;
    
    // Get vessel from database
    const vessel = await storage.getVesselById(vesselId);
    
    if (!vessel) {
      return res.status(404).json({ 
        success: false, 
        error: `Vessel with ID ${vesselId} not found` 
      });
    }
    
    // Update vessel route and company info
    const updatedVessel = await openaiService.updateVesselRouteAndCompanyInfo(vessel);
    
    // Return success response
    return res.json({
      success: true,
      vesselId,
      updatedInfo: {
        departureLat: updatedVessel.departureLat,
        departureLng: updatedVessel.departureLng,
        destinationLat: updatedVessel.destinationLat,
        destinationLng: updatedVessel.destinationLng,
        buyerName: updatedVessel.buyerName,
        sellerName: updatedVessel.sellerName
      }
    });
  } catch (error) {
    console.error('Error updating vessel info:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

/**
 * @route POST /api/ai/generate-all-refinery-descriptions
 * @description Generate descriptions for all refineries
 * @access Public
 */
aiRouter.post('/generate-all-refinery-descriptions', async (req: Request, res: Response) => {
  try {
    // Get all refineries from database
    const refineries = await storage.getRefineries();
    
    // Track progress
    const results = {
      total: refineries.length,
      success: 0,
      failed: 0,
      skipped: 0
    };
    
    // Only process refineries without descriptions
    const refineriesWithoutDescriptions = refineries.filter(refinery => !refinery.description);
    
    // If all refineries have descriptions, return success
    if (refineriesWithoutDescriptions.length === 0) {
      return res.json({
        success: true,
        message: 'All refineries already have descriptions',
        results: {
          ...results,
          skipped: refineries.length
        }
      });
    }
    
    // Process refineries in batches to avoid rate limiting
    const batchSize = 5;
    const batches = Math.ceil(refineriesWithoutDescriptions.length / batchSize);
    
    // Track failed refineries
    const failedRefineries: { id: number; name: string; error: string }[] = [];
    
    // Process refineries in batches
    for (let i = 0; i < batches; i++) {
      const batchStart = i * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, refineriesWithoutDescriptions.length);
      const batch = refineriesWithoutDescriptions.slice(batchStart, batchEnd);
      
      console.log(`Processing refinery batch ${i + 1}/${batches} (${batch.length} refineries)`);
      
      // Generate descriptions for batch
      const batchPromises = batch.map(async (refinery) => {
        try {
          await openaiService.generateRefineryDescription(refinery);
          results.success++;
          return { success: true, refinery };
        } catch (error) {
          results.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          failedRefineries.push({ id: refinery.id, name: refinery.name, error: errorMessage });
          return { success: false, refinery, error: errorMessage };
        }
      });
      
      await Promise.all(batchPromises);
      
      // Add a small delay between batches to avoid rate limiting
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Return success response
    return res.json({
      success: true,
      message: `Generated descriptions for ${results.success} refineries`,
      results,
      failedRefineries: failedRefineries.length > 0 ? failedRefineries : undefined
    });
  } catch (error) {
    console.error('Error generating refinery descriptions:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});