import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Anchor, Ship, RefreshCw, CheckCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const PortProximityControls = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vesselDensity, setVesselDensity] = useState(10);

  const enhanceVesselDistribution = async () => {
    setLoading(true);
    setSuccess(false);
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/port-proximity/enhance-vessel-distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          vesselDensity,
          enhanceAll: true 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to enhance vessel distribution');
      }
      
      const data = await response.json();
      console.log('Enhanced vessel distribution:', data);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error enhancing vessel distribution:', error);
      setErrorMessage('Failed to enhance vessel distribution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-80 shadow-lg border-blue-200 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Anchor className="w-5 h-5 mr-2 text-blue-600" />
          Port Proximity Controls
        </CardTitle>
        <CardDescription>
          Enhance vessel distribution around ports and refineries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Vessel Density</span>
            <span className="text-sm text-gray-500">{vesselDensity} vessels per facility</span>
          </div>
          <Slider
            defaultValue={[10]}
            min={1}
            max={25}
            step={1}
            value={[vesselDensity]}
            onValueChange={(value) => setVesselDensity(value[0])}
            className="my-2"
          />
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            className="flex-1 mr-2"
            size="sm"
            onClick={() => setVesselDensity(10)}
          >
            Reset
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            size="sm"
            onClick={enhanceVesselDistribution}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <Ship className="w-4 h-4 mr-2" />
                Apply
              </span>
            )}
          </Button>
        </div>
        
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Vessels have been repositioned for a more realistic map.
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PortProximityControls;