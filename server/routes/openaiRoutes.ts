import { Router } from 'express';
import { openaiService } from '../services/openaiService';

export const openaiRouter = Router();

/**
 * @route POST /api/openai/generate-text
 * @description Generate text using OpenAI
 * @access Public
 */
openaiRouter.post('/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prompt is required' 
      });
    }
    
    const generatedText = await openaiService.generateText(prompt);
    
    res.json({ 
      success: true, 
      data: generatedText 
    });
  } catch (error) {
    console.error('Error in generate-text endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to generate text: ${error.message}` 
    });
  }
});

/**
 * @route POST /api/openai/generate-document
 * @description Generate shipping document using OpenAI
 * @access Public
 */
openaiRouter.post('/generate-document', async (req, res) => {
  try {
    const { vesselData, documentType } = req.body;
    
    if (!vesselData || !documentType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vessel data and document type are required' 
      });
    }
    
    const document = await openaiService.generateShippingDocument(vesselData, documentType);
    
    res.json({ 
      success: true, 
      data: document 
    });
  } catch (error) {
    console.error('Error in generate-document endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to generate document: ${error.message}` 
    });
  }
});

/**
 * @route POST /api/openai/analyze-trading
 * @description Generate trading analysis and suggestions
 * @access Public
 */
openaiRouter.post('/analyze-trading', async (req, res) => {
  try {
    const { marketData } = req.body;
    
    if (!marketData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Market data is required' 
      });
    }
    
    const analysis = await openaiService.generateTradingAnalysis(marketData);
    
    res.json({ 
      success: true, 
      data: analysis 
    });
  } catch (error) {
    console.error('Error in analyze-trading endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to analyze trading data: ${error.message}` 
    });
  }
});

/**
 * @route POST /api/openai/analyze-route
 * @description Analyze vessel route and suggest optimizations
 * @access Public
 */
openaiRouter.post('/analyze-route', async (req, res) => {
  try {
    const { vesselData } = req.body;
    
    if (!vesselData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vessel data is required' 
      });
    }
    
    const routeAnalysis = await openaiService.analyzeVesselRoute(vesselData);
    
    res.json({ 
      success: true, 
      data: routeAnalysis 
    });
  } catch (error) {
    console.error('Error in analyze-route endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to analyze vessel route: ${error.message}` 
    });
  }
});

/**
 * @route POST /api/openai/structured-data
 * @description Generate structured data using OpenAI
 * @access Public
 */
openaiRouter.post('/structured-data', async (req, res) => {
  try {
    const { prompt, schema } = req.body;
    
    if (!prompt || !schema) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prompt and schema are required' 
      });
    }
    
    const data = await openaiService.generateStructuredData(prompt, schema);
    
    res.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Error in structured-data endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to generate structured data: ${error.message}` 
    });
  }
});