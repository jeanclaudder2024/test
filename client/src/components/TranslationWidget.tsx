import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Language options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish' },
];

interface TranslationWidgetProps {
  initialText?: string;
  initialSourceLanguage?: string;
  initialTargetLanguage?: string;
  initialAutoDetect?: boolean;
  className?: string;
}

export function TranslationWidget({ 
  initialText = '', 
  initialSourceLanguage = 'en',
  initialTargetLanguage = 'ar',
  initialAutoDetect = true,
  className = '' 
}: TranslationWidgetProps) {
  const [sourceText, setSourceText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(initialTargetLanguage); // Default from props
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [autoDetect, setAutoDetect] = useState(initialAutoDetect);
  const [sourceLanguage, setSourceLanguage] = useState(initialSourceLanguage);
  
  const { translateText, detectLanguage, isTranslating } = useTranslation();

  // When sourceText changes, clear the translation
  useEffect(() => {
    setTranslatedText('');
  }, [sourceText]);

  // Handle text translation
  const handleTranslate = async () => {
    if (!sourceText || !targetLanguage) return;
    
    // Detect language if auto-detect is on
    if (autoDetect) {
      const detected = await detectLanguage(sourceText);
      setDetectedLanguage(detected);
      
      const result = await translateText(sourceText, targetLanguage);
      setTranslatedText(result);
    } else {
      const result = await translateText(sourceText, targetLanguage, sourceLanguage);
      setTranslatedText(result);
    }
  };

  // Get language name from code
  const getLanguageName = (code: string) => {
    return languages.find(lang => lang.code === code)?.name || code;
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl">Maritime Translation Tool</CardTitle>
        <CardDescription>
          Translate any maritime or shipping text between languages
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Source language selection */}
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            {autoDetect ? (
              <div className="text-sm text-muted-foreground">
                Source language: {detectedLanguage ? getLanguageName(detectedLanguage) : 'Auto-detect'}
              </div>
            ) : (
              <Select 
                value={sourceLanguage} 
                onValueChange={setSourceLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAutoDetect(!autoDetect)}
          >
            {autoDetect ? 'Select language' : 'Auto-detect'}
          </Button>
        </div>
        
        {/* Source text input */}
        <Textarea
          placeholder="Enter text to translate"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="min-h-[100px]"
        />
        
        {/* Target language selection */}
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Select 
              value={targetLanguage} 
              onValueChange={setTargetLanguage}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText}
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Translating...
              </>
            ) : (
              'Translate'
            )}
          </Button>
        </div>
        
        {/* Translation result */}
        {translatedText && (
          <div className="mt-4 p-4 border rounded-md bg-muted">
            <div className="text-sm font-medium mb-1">
              Translation ({getLanguageName(targetLanguage)}):
            </div>
            <div className="whitespace-pre-wrap">{translatedText}</div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Powered by OpenAI language models - Specialized for maritime terminology
      </CardFooter>
    </Card>
  );
}