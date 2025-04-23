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
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Format a prompt for the AI with the context
    const prompt = `
User query: "${query}"

Context:
- Available vessels: ${context.vesselsCount || 0}
- Available refineries: ${context.refineriesCount || 0}
${context.trackedVessel ? `- Currently tracking vessel: ${context.trackedVessel.name} (IMO: ${context.trackedVessel.imo})
  - Current location: ${context.trackedVessel.location}
  - Destination: ${context.trackedVessel.destination}` : '- No vessel is currently being tracked'}

Your task is to respond to the query in a helpful and informative way. If the query is about:
1. Vessels: Provide information about vessels, their tracking status, or vessel-related data.
2. Refineries: Provide information about refineries, their regions, or refinery-related data.
3. Route analysis: Provide advice on optimal routes, weather considerations, or journey time estimates.
4. Market analysis: Provide information about oil prices, market trends, or cargo values.

Please respond directly, in a conversational tone, and mention if you need more specific information.
`;

    const response = await openAiService.generateResponse(prompt);
    
    // Parse the response to extract vessel or refinery recommendations
    let vesselToTrack = null;
    let refineryToShow = null;
    
    // Simple detection for vessel recommendations (could be improved with more robust parsing)
    if (response.toLowerCase().includes('tracking vessel') || 
        response.toLowerCase().includes('track the vessel')) {
      // Extract vessel name mentioned in the response
      const vesselMatch = response.match(/tracking vessel ([A-Za-z0-9\s]+)/i) || 
                          response.match(/track the vessel ([A-Za-z0-9\s]+)/i);
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
  } catch (error) {
    console.error('Error processing AI query:', error);
    return res.status(500).json({ 
      error: 'Failed to process query',
      details: error.message 
    });
  }
});

/**
 * @route POST /api/ai/analyze-vessel
 * @description Analyze a vessel's data and provide insights
 * @access Public
 */
aiRouter.post('/analyze-vessel', async (req, res) => {
  try {
    const { vesselId } = req.body;
    
    if (!vesselId) {
      return res.status(400).json({ error: 'Vessel ID is required' });
    }
    
    // This would typically fetch the vessel data from storage
    // Then pass it to the OpenAI service
    
    const response = {
      analysis: "AI-powered vessel analysis would be displayed here. This would include insights about the vessel's journey, cargo status, and performance metrics.",
      recommendations: "Route optimization recommendations would be displayed here, including weather forecasts, optimal shipping lanes, and estimated arrival times.",
      risks: "Risk assessment would be displayed here, highlighting potential issues with the current route, weather hazards, or congestion at destination ports."
    };
    
    return res.json(response);
  } catch (error) {
    console.error('Error analyzing vessel:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze vessel',
      details: error.message 
    });
  }
});

/**
 * @route POST /api/ai/route-recommendations
 * @description Generate route recommendations for a vessel
 * @access Public
 */
aiRouter.post('/route-recommendations', async (req, res) => {
  try {
    const { vesselId, includeWeather } = req.body;
    
    if (!vesselId) {
      return res.status(400).json({ error: 'Vessel ID is required' });
    }
    
    // In a real implementation, this would fetch the vessel from the database
    // Then call the service to generate recommendations
    
    const recommendations = "OpenAI would generate specific route recommendations here, based on the vessel's current position, destination, cargo, and (if requested) weather conditions.";
    
    return res.json({ recommendations });
  } catch (error) {
    console.error('Error generating route recommendations:', error);
    return res.status(500).json({ 
      error: 'Failed to generate route recommendations',
      details: error.message 
    });
  }
});