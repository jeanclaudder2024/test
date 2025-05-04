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
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
          AI Description Generation
        </CardTitle>
        <CardDescription>
          {currentDescription 
            ? 'Update the existing description with AI-generated content' 
            : 'Generate a detailed description using AI'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {generatedDescription && (
          <div className="mb-4 p-3 border rounded bg-blue-50 text-sm">
            <p className="font-semibold mb-1">Generated description:</p>
            <p>{generatedDescription}</p>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mb-2">
          This will use OpenAI to generate a detailed description for 
          {entityType === 'port' ? ' this port' : ' this refinery'} based on its metadata.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateDescription} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isGenerating 
            ? 'Generating...' 
            : currentDescription 
              ? 'Regenerate Description' 
              : 'Generate Description'}
        </Button>
      </CardFooter>
    </Card>
  );
}