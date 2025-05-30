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
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-800 flex items-center mb-1">
            <Anchor className="w-4 h-4 mr-1.5 text-blue-600" />
            Vessel Distribution Enhancement
          </h3>
          <p className="text-xs text-gray-500">
            Configure realistic vessel positioning around maritime facilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-700">{vesselDensity} vessels per facility</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Density Configuration</h4>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Port Proximity</span>
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {vesselDensity}
                </span>
              </div>
              <Slider
                defaultValue={[10]}
                min={1}
                max={25}
                step={1}
                value={[vesselDensity]}
                onValueChange={(value) => setVesselDensity(value[0])}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Higher values create busier ports</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Spread is calculated based on facility importance</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Distribution Options</h4>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-xs text-gray-700">Major Ports</span>
              </div>
              <span className="text-xs font-medium text-gray-600">{vesselDensity + 5} vessels</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-xs text-gray-700">Refineries</span>
              </div>
              <span className="text-xs font-medium text-gray-600">{vesselDensity} vessels</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                <span className="text-xs text-gray-700">Secondary Ports</span>
              </div>
              <span className="text-xs font-medium text-gray-600">{Math.max(1, vesselDensity - 5)} vessels</span>
            </div>
          </div>
          
          <div className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              className="flex-1 border-gray-300 text-gray-600 h-8"
              size="sm"
              onClick={() => setVesselDensity(10)}
            >
              Reset
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 h-8"
              size="sm"
              onClick={enhanceVesselDistribution}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <Ship className="w-3.5 h-3.5 mr-1.5" />
                  Apply Distribution
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
        
      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800 mt-3">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-sm font-medium">Success!</AlertTitle>
          <AlertDescription className="text-xs">
            Vessels have been repositioned for a more realistic map view. Refresh to see the updated distribution.
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="destructive" className="mt-3">
          <AlertTitle className="text-sm font-medium">Distribution Error</AlertTitle>
          <AlertDescription className="text-xs">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PortProximityControls;