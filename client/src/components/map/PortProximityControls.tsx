import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const PortProximityControls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [stats, setStats] = useState<{
    ports: number;
    refineries: number;
    totalVessels: number;
  } | null>(null);
  const { toast } = useToast();

  const enhanceVesselDistribution = async () => {
    try {
      setIsLoading(true);
      
      // Call the port proximity API to enhance vessel distribution
      const response = await axios.post('/api/maritime/enhance-vessel-distribution');
      
      if (response.data.success) {
        setStats(response.data.stats);
        setLastRun(new Date());
        
        toast({
          title: "Vessel distribution enhanced",
          description: `Placed vessels near ${response.data.stats.ports} ports and ${response.data.stats.refineries} refineries`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to enhance vessel distribution:", error);
      toast({
        title: "Enhancement failed",
        description: "Could not enhance vessel distribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-md shadow-lg border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Vessel Distribution Controls</CardTitle>
        <CardDescription>
          Enhance realism by placing vessels near ports and refineries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={enhanceVesselDistribution} 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Enhancing vessel distribution...
              </>
            ) : (
              "Enhance Vessel Distribution"
            )}
          </Button>
          
          {stats && (
            <div className="pt-2 text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Vessels distributed:</span>
                <Badge variant="outline" className="bg-blue-50">{stats.totalVessels}</Badge>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Ports enhanced:</span>
                <Badge variant="outline" className="bg-green-50">{stats.ports}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Refineries enhanced:</span>
                <Badge variant="outline" className="bg-amber-50">{stats.refineries}</Badge>
              </div>
            </div>
          )}
          
          {lastRun && (
            <div className="text-xs text-gray-500 mt-2 text-right">
              Last enhanced: {lastRun.toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortProximityControls;