import { Router, Request, Response } from 'express';
import { translationService } from '../services/translationService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Translate text from one language to another
 * POST /api/translate
 * 
 * Request body:
 * {
 *   text: string,           // The text to translate
 *   targetLanguage: string, // The target language code (e.g., 'en', 'es', 'fr')
 *   sourceLanguage?: string // Optional source language code
 * }
 */
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text to translate is required'
      });
    }
    
    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Target language is required'
      });
    }
    
    const result = await translationService.translateText({
      text,
      targetLanguage,
      sourceLanguage
    });
    
    return res.json(result);
  } catch (error) {
    logger.error('Translation endpoint error', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      error: 'Translation service error'
    });
  }
});

/**
 * Batch translate multiple texts
 * POST /api/translate/batch
 * 
 * Request body:
 * {
 *   texts: string[],        // Array of texts to translate
 *   targetLanguage: string, // The target language code
 *   sourceLanguage?: string // Optional source language code
 * }
 */
router.post('/translate/batch', async (req: Request, res: Response) => {
  try {
    const { texts, targetLanguage, sourceLanguage } = req.body;
    
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one text to translate is required'
      });
    }
    
    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Target language is required'
      });
    }
    
    const translatedTexts = await translationService.batchTranslate(
      texts,
      targetLanguage,
      sourceLanguage
    );
    
    return res.json({
      success: true,
      originalTexts: texts,
      translatedTexts,
      targetLanguage,
      sourceLanguage: sourceLanguage || 'auto-detected'
    });
  } catch (error) {
    logger.error('Batch translation endpoint error', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      error: 'Batch translation service error'
    });
  }
});

/**
 * Detect the language of a text
 * POST /api/translate/detect
 * 
 * Request body:
 * {
 *   text: string // The text to analyze
 * }
 */
router.post('/translate/detect', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text to analyze is required'
      });
    }
    
    const languageCode = await translationService.detectLanguage(text);
    
    return res.json({
      success: true,
      text,
      languageCode
    });
  } catch (error) {
    logger.error('Language detection endpoint error', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      error: 'Language detection service error'
    });
  }
});

export default router;