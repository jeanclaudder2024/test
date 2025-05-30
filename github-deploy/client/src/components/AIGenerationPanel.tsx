import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { Port, Refinery } from '@shared/schema';

interface AIGenerationPanelProps {
  entityType: 'port' | 'refinery';
  entityId: number;
  entityName: string;
  currentDescription?: string | null;
  onDescriptionGenerated: (description: string) => void;
}

export function AIGenerationPanel({
  entityType,
  entityId,
  entityName,
  currentDescription,
  onDescriptionGenerated
}: AIGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);

  const generateDescription = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedDescription(null);

    try {
      const endpoint = entityType === 'port' 
        ? '/api/ai/generate-port-description'
        : '/api/ai/generate-refinery-description';
      
      const paramName = entityType === 'port' ? 'portId' : 'refineryId';
      
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ [paramName]: entityId })
      });

      if (response.success) {
        setGeneratedDescription(response.description);
        onDescriptionGenerated(response.description);
      } else {
        setError(response.error || 'Failed to generate description');
      }
    } catch (err) {
      console.error('Error generating description:', err);
      setError('Failed to connect to AI service. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mt-4 border-2 border-amber-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 pb-3">
        <CardTitle className="flex items-center text-lg text-amber-800">
          <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
          AI-Powered Description Generator
        </CardTitle>
        <CardDescription className="text-amber-700">
          {currentDescription 
            ? 'Update the existing description with enhanced AI-generated content' 
            : 'Generate a detailed professional description using AI'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {generatedDescription && (
          <div className="mb-4 p-4 border rounded-md bg-blue-50 text-sm border-blue-200 shadow-sm">
            <p className="font-semibold mb-2 text-blue-800">Generated description:</p>
            <p className="text-blue-700">{generatedDescription}</p>
          </div>
        )}
        
        <div className="bg-amber-50 rounded-md p-3 border border-amber-100 mb-4">
          <p className="text-sm text-amber-800 mb-2 font-medium">
            How does this work?
          </p>
          <p className="text-xs text-amber-700">
            This feature uses OpenAI GPT-4o to create a professional, accurate description for 
            {entityType === 'port' ? ' this port' : ' this refinery'} based on its location, size, 
            and other available metadata. The AI-generated description will help users better understand 
            the {entityType}'s role in the global maritime ecosystem.
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-amber-50 pt-3 pb-4 px-6">
        <Button 
          onClick={generateDescription} 
          disabled={isGenerating}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 py-5"
        >
          {isGenerating ? 
            <Loader2 className="h-4 w-4 animate-spin" /> : 
            <Sparkles className="h-4 w-4" />
          }
          {isGenerating 
            ? 'Generating Intelligence...' 
            : currentDescription 
              ? 'Regenerate Enhanced Description' 
              : 'Generate Professional Description'}
        </Button>
      </CardFooter>
    </Card>
  );
}