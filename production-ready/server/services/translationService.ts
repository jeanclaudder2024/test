import OpenAI from 'openai';
import { logger } from '../utils/logger';

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

interface TranslationResponse {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  success: boolean;
  error?: string;
}

/**
 * A service for translating text using OpenAI
 */
class TranslationService {
  /**
   * Translate text to the specified language
   * @param request - The translation request object
   * @returns A translation response object
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, targetLanguage, sourceLanguage } = request;
    
    if (!text || !targetLanguage) {
      return {
        originalText: text || '',
        translatedText: '',
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
        success: false,
        error: 'Text and target language are required'
      };
    }
    
    try {
      logger.info(`Translating text to ${targetLanguage}`, { 
        textLength: text.length, 
        sourceLanguage: sourceLanguage || 'auto-detect' 
      });
      
      // Format the translation prompt
      const prompt = sourceLanguage
        ? `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n${text}`
        : `Translate the following text to ${targetLanguage}:\n\n${text}`;
        
      // Make the translation request to OpenAI
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a professional translator with expertise in maritime and shipping terminology.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 1500
      });
      
      // Extract the translated text from response
      const translatedText = response.choices[0].message.content?.trim() || '';
      
      logger.info('Translation successful', { targetLanguage, chars: translatedText.length });
      
      // Return translation response
      return {
        originalText: text,
        translatedText,
        sourceLanguage: sourceLanguage || 'auto-detected',
        targetLanguage,
        success: true
      };
      
    } catch (error) {
      logger.error('Translation error', { error: (error as Error).message });
      
      return {
        originalText: text,
        translatedText: '',
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
        success: false,
        error: `Translation failed: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * Translate multiple texts to the specified language
   * @param texts - Array of text strings to translate
   * @param targetLanguage - Target language code
   * @param sourceLanguage - Optional source language code
   * @returns Array of translated texts
   */
  async batchTranslate(texts: string[], targetLanguage: string, sourceLanguage?: string): Promise<string[]> {
    try {
      logger.info(`Batch translating ${texts.length} items to ${targetLanguage}`);
      
      // Format the batch translation prompt
      const textList = texts.map((text, i) => `[${i+1}] ${text}`).join('\n');
      const prompt = sourceLanguage
        ? `Translate each of the following texts from ${sourceLanguage} to ${targetLanguage}. Maintain the numbering format [n] in your response:\n\n${textList}`
        : `Translate each of the following texts to ${targetLanguage}. Maintain the numbering format [n] in your response:\n\n${textList}`;
      
      // Make the translation request
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a professional translator with expertise in maritime and shipping terminology.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
      
      const translatedContent = response.choices[0].message.content?.trim() || '';
      
      // Parse the translated response into individual items
      const translatedItems: string[] = [];
      
      // Extract individual translations by looking for the [n] pattern
      const regex = /\[(\d+)\](.*?)(?=\[\d+\]|$)/gs;
      let match;
      
      while ((match = regex.exec(translatedContent + '\n[999]')) !== null) {
        const index = parseInt(match[1], 10) - 1;
        const translation = match[2].trim();
        
        if (index >= 0 && index < texts.length) {
          translatedItems[index] = translation;
        }
      }
      
      // Fill in any missing translations with original text
      const result = texts.map((original, i) => translatedItems[i] || original);
      
      logger.info('Batch translation successful', { count: texts.length });
      
      return result;
      
    } catch (error) {
      logger.error('Batch translation error', { error: (error as Error).message });
      // Return original texts on error
      return texts;
    }
  }
  
  /**
   * Detect the language of a text
   * @param text - The text to analyze
   * @returns Promise with the detected language code
   */
  async detectLanguage(text: string): Promise<string> {
    if (!text) return 'unknown';
    
    try {
      logger.info('Detecting language', { textLength: text.length });
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a language detection expert. Respond only with the ISO 639-1 language code.' },
          { role: 'user', content: `Detect the language of this text and respond only with the ISO 639-1 language code (e.g., "en" for English, "fr" for French):\n\n${text}` }
        ],
        temperature: 0.1,
        max_tokens: 10,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      if (!content) return 'unknown';
      
      try {
        const result = JSON.parse(content);
        return result.language_code || 'unknown';
      } catch (e) {
        // If not valid JSON, try to extract code directly
        const match = content.match(/["']?([a-z]{2})["']?/i);
        return match ? match[1].toLowerCase() : 'unknown';
      }
      
    } catch (error) {
      logger.error('Language detection error', { error: (error as Error).message });
      return 'unknown';
    }
  }
}

export const translationService = new TranslationService();