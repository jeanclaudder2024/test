import React, { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PortImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ added: number; skipped: number; total: number } | null>(null);
  const { toast } = useToast();

  const importPorts = async () => {
    try {
      setIsLoading(true);
      setProgress(10);
      
      // Start the import process
      toast({
        title: "Import Started",
        description: "Beginning import of 7,183 ports. This may take a few minutes.",
      });
      
      // Simulate progress while waiting for the actual response
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 5;
          return newProgress < 90 ? newProgress : 90;
        });
      }, 500);
      
      // Call the API to import ports
      const response = await apiRequest('POST', '/api/ports/import-large-scale');
      const data = await response.json();
      
      // Clear the interval and set the final progress
      clearInterval(interval);
      setProgress(100);
      
      if (data.success) {
        setResult(data.data);
        toast({
          title: "Import Successful",
          description: `Added ${data.data.added} ports, skipped ${data.data.skipped}, total now: ${data.data.total}`,
        });
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: `Error: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      setProgress(0);
    } finally {
      setIsLoading(false);
      setIsComplete(true);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Port Data Import Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import 7,183 World Ports</CardTitle>
            <CardDescription>
              This will import a comprehensive dataset of 7,183 ports distributed across all global regions.
              The process may take several minutes to complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
              </div>
            )}
            
            {isComplete && result && (
              <div className="space-y-2 p-4 bg-muted rounded-md">
                <h3 className="font-semibold">Import Results:</h3>
                <p>Added: <span className="font-mono">{result.added}</span> ports</p>
                <p>Skipped: <span className="font-mono">{result.skipped}</span> ports</p>
                <p>Total Ports: <span className="font-mono">{result.total}</span></p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              size="lg" 
              onClick={importPorts} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Import All Ports
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About Port Data Import</CardTitle>
            <CardDescription>
              Information about the comprehensive port dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Port Distribution By Region:</h3>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Asia-Pacific: ~30% of ports (2,154 ports)</li>
                  <li>Europe: ~25% of ports (1,796 ports)</li>
                  <li>North America: ~15% of ports (1,077 ports)</li>
                  <li>Latin America: ~10% of ports (718 ports)</li>
                  <li>Africa: ~15% of ports (1,077 ports)</li>
                  <li>Middle East: ~5% of ports (359 ports)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">Port Types:</h3>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Commercial Ports: ~80% (5,746 ports)</li>
                  <li>Oil Shipping Ports: ~20% (1,437 ports)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">Data Points Per Port:</h3>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Name & Country</li>
                  <li>Regional Classification</li>
                  <li>Geographic Coordinates</li>
                  <li>Port Type & Status</li>
                  <li>Estimated Capacity</li>
                  <li>Detailed Description</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}