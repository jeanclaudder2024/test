import { Router } from 'express';
import { openAiService } from '../services/openAiService';

export const aiRouter = Router();

/**
 * @route POST /api/ai/analyze-query
 * @description Process a natural language query using OpenAI and provide intelligent responses
 * @access Public
 */
aiRouter.post('/analyze-query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const response = await openAiService.generateResponse(query);
    
    // Simple detection for vessel tracking requests
    let vesselToTrack = null;
    let refineryToShow = null;
    
    if (response.toLowerCase().includes('track the vessel') || 
        response.toLowerCase().includes('track vessel')) {
      const vesselMatch = response.match(/track the vessel ([A-Za-z0-9\s]+)/i) || 
                          response.match(/track vessel ([A-Za-z0-9\s]+)/i);
      if (vesselMatch && vesselMatch[1]) {
        vesselToTrack = vesselMatch[1].trim();
      }
    }
    
    // Simple detection for refinery recommendations
    if (response.toLowerCase().includes('refinery called') || 
        response.toLowerCase().includes('refinery named')) {
      const refineryMatch = response.match(/refinery called ([A-Za-z0-9\s]+)/i) || 
                            response.match(/refinery named ([A-Za-z0-9\s]+)/i);
      if (refineryMatch && refineryMatch[1]) {
        refineryToShow = refineryMatch[1].trim();
      }
    }
    
    return res.json({
      response,
      vesselToTrack,
      refineryToShow
    });
  } catch (error: any) {
    console.error('Error processing AI query:', error);
    return res.status(500).json({ 
      error: 'Failed to process query',
      details: error.message 
    });
  }
});