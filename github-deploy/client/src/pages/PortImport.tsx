import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

export default function PortImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<null | {
    success: boolean;
    message: string;
    data?: {
      added: number;
      errors?: number;
      skipped?: number;
      total: number;
    };
  }>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const startImport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-all-ports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setImportResults(data);
      
      if (data.success) {
        toast({
          title: 'Port Import Complete',
          description: `Successfully imported ${data.data?.added || 0} new ports.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Port Import Failed',
          description: data.message || 'There was an error importing ports.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error importing ports:', error);
      setImportResults({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred during port import',
      });
      toast({
        title: 'Import Error',
        description: 'Failed to import port data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Port Data Import</h1>
          <p className="text-muted-foreground mt-1">
            Import comprehensive global port data into your database
          </p>
        </div>
        <Button onClick={() => navigate('/ports')}>
          View All Ports
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" /> Large-Scale Port Import
            </CardTitle>
            <CardDescription>
              Import all 7,183 ports from our comprehensive global port database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This operation will add all missing ports from our comprehensive global port database. Existing ports will be preserved.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              The import process may take a few minutes to complete. Do not navigate away from this page during the import.
            </p>

            {importResults && (
              <Alert className={importResults.success ? "bg-green-50 border-green-300 mb-4" : "bg-red-50 border-red-300 mb-4"}>
                {importResults.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>
                  {importResults.success ? 'Import Successful' : 'Import Failed'}
                </AlertTitle>
                <AlertDescription>
                  {importResults.message}
                  {importResults.success && importResults.data && (
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Added:</span> {importResults.data.added}
                      </div>
                      {importResults.data.skipped !== undefined && (
                        <div>
                          <span className="font-medium">Skipped:</span> {importResults.data.skipped}
                        </div>
                      )}
                      {importResults.data.errors !== undefined && (
                        <div>
                          <span className="font-medium">Errors:</span> {importResults.data.errors}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Total Ports:</span> {importResults.data.total}
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/ports')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={startImport}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Start Import
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}