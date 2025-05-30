import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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

interface BatchTranslationRequest {
  texts: string[];
  targetLanguage: string;
  sourceLanguage?: string;
}

interface BatchTranslationResponse {
  success: boolean;
  originalTexts: string[];
  translatedTexts: string[];
  targetLanguage: string;
  sourceLanguage: string;
  error?: string;
}

interface LanguageDetectionRequest {
  text: string;
}

interface LanguageDetectionResponse {
  success: boolean;
  text: string;
  languageCode: string;
  error?: string;
}

/**
 * Hook for using the OpenAI-powered translation service
 */
export function useTranslation() {
  const { toast } = useToast();
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Single text translation mutation
  const translateMutation = useMutation({
    mutationFn: async (request: TranslationRequest): Promise<TranslationResponse> => {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }
      
      return response.json();
    },
    onError: (error) => {
      toast({
        title: 'Translation Error',
        description: error instanceof Error ? error.message : 'Failed to translate text',
        variant: 'destructive',
      });
    },
  });

  // Batch translation mutation
  const batchTranslateMutation = useMutation({
    mutationFn: async (request: BatchTranslationRequest): Promise<BatchTranslationResponse> => {
      const response = await fetch('/api/translate/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Batch translation failed');
      }
      
      return response.json();
    },
    onError: (error) => {
      toast({
        title: 'Batch Translation Error',
        description: error instanceof Error ? error.message : 'Failed to translate texts',
        variant: 'destructive',
      });
    },
  });

  // Language detection mutation
  const detectLanguageMutation = useMutation({
    mutationFn: async (request: LanguageDetectionRequest): Promise<LanguageDetectionResponse> => {
      const response = await fetch('/api/translate/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Language detection failed');
      }
      
      return response.json();
    },
    onError: (error) => {
      toast({
        title: 'Language Detection Error',
        description: error instanceof Error ? error.message : 'Failed to detect language',
        variant: 'destructive',
      });
    },
  });

  // Simplified function to translate text
  const translateText = async (
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<string> => {
    if (!text || !targetLanguage) {
      return text;
    }

    setIsTranslating(true);
    
    try {
      const result = await translateMutation.mutateAsync({
        text,
        targetLanguage,
        sourceLanguage,
      });
      
      return result.success ? result.translatedText : text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  // Simplified function to translate multiple texts
  const translateBatch = async (
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> => {
    if (!texts.length || !targetLanguage) {
      return texts;
    }

    setIsTranslating(true);
    
    try {
      const result = await batchTranslateMutation.mutateAsync({
        texts,
        targetLanguage,
        sourceLanguage,
      });
      
      return result.success ? result.translatedTexts : texts;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    } finally {
      setIsTranslating(false);
    }
  };

  // Simplified function to detect language
  const detectLanguage = async (text: string): Promise<string> => {
    if (!text) {
      return 'unknown';
    }

    try {
      const result = await detectLanguageMutation.mutateAsync({ text });
      return result.success ? result.languageCode : 'unknown';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'unknown';
    }
  };

  return {
    translateText,
    translateBatch,
    detectLanguage,
    isTranslating,
    isError: translateMutation.isError || batchTranslateMutation.isError || detectLanguageMutation.isError,
    error: translateMutation.error || batchTranslateMutation.error || detectLanguageMutation.error,
  };
}