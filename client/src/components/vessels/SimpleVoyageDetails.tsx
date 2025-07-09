import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Ship, 
  Calendar, 
  Clock,
  Navigation
} from 'lucide-react';
import { format } from 'date-fns';

interface SimpleVoyageDetailsProps {
  vessel: any;
  enhancedVesselData?: any;
  voyageProgress?: any;
}

export function SimpleVoyageDetails({ vessel, enhancedVesselData, voyageProgress }: SimpleVoyageDetailsProps) {
  const [ports, setPorts] = useState<any[]>([]);

  // Fetch ports data
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const response = await fetch('/api/ports');
        if (response.ok) {
          const data = await response.json();
          setPorts(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch ports:', error);
      }
    };
    fetchPorts();
  }, []);

  // Helper function to get port name
  const getPortName = (portIdOrName: number | string | null | undefined): string => {
    if (!portIdOrName) return 'Unknown Port';
    
    // If it's already a port name (string that doesn't look like an ID)
    if (typeof portIdOrName === 'string' && isNaN(Number(portIdOrName))) {
      return portIdOrName;
    }
    
    // If we have ports data, try to find the port by ID
    if (ports.length > 0) {
      const port = ports.find(p => p.id === Number(portIdOrName) || p.name === portIdOrName);
      if (port) {
        return `${port.name}, ${port.country}`;
      }
    }
    
    // If it's a number but we can't find the port, show it as is
    return typeof portIdOrName === 'string' ? portIdOrName : `Port ID: ${portIdOrName}`;
  };

  // Calculate basic progress based on departure date and ETA
  const calculateBasicProgress = (): number => {
    if (!vessel.departureDate || !vessel.eta) return 0;
    
    const now = new Date();
    const departure = new Date(vessel.departureDate);
    const arrival = new Date(vessel.eta);
    
    if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) return 0;
    if (departure > now) return 0;
    if (arrival < now) return 100;
    
    const totalTime = arrival.getTime() - departure.getTime();
    const elapsedTime = now.getTime() - departure.getTime();
    
    if (totalTime <= 0) return 0;
    
    return Math.min(Math.max(Math.round((elapsedTime / totalTime) * 100), 0), 100);
  };

  const basicProgress = calculateBasicProgress();
  const effectiveProgress = voyageProgress?.percentComplete ?? basicProgress;

  // Format date helper
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not specified';
    try {
      const d = new Date(date);
      return format(d, 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Ship className="h-5 w-5 mr-2 text-primary" />
              Journey Progress
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {effectiveProgress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Route Overview */}
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <div className="flex flex-col items-center">
                <MapPin className="h-3 w-3 text-primary mb-1" />
                <span className="text-center">{getPortName(vessel.departurePort)}</span>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="h-3 w-3 text-primary mb-1" />
                <span className="text-center">{getPortName(vessel.destinationPort)}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <Progress value={effectiveProgress} className="h-2 mb-4" />
            
            {/* Journey Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Departure</p>
                <p className="font-medium">{formatDate(vessel.departureDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expected Arrival</p>
                <p className="font-medium">{formatDate(vessel.eta)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voyage Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Navigation className="h-5 w-5 mr-2 text-primary" />
            Destination Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Vessel Type</p>
                <p className="font-medium">{vessel.vesselType || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Flag</p>
                <p className="font-medium">{vessel.flag || "Not specified"}</p>
              </div>
              
              {vessel.built && (
                <div>
                  <p className="text-xs text-gray-500">Built</p>
                  <p className="font-medium">{vessel.built}</p>
                </div>
              )}
              
              {vessel.deadweight && (
                <div>
                  <p className="text-xs text-gray-500">Deadweight</p>
                  <p className="font-medium">{vessel.deadweight.toLocaleString()} DWT</p>
                </div>
              )}
              
              {vessel.oilType && (
                <div>
                  <p className="text-xs text-gray-500">Cargo Type</p>
                  <p className="font-medium">{vessel.oilType}</p>
                </div>
              )}
              
              {vessel.status && (
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium capitalize">{vessel.status}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Position */}
      {(vessel.currentLat && vessel.currentLng) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Current Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Latitude:</span>
                <span className="font-medium">{Number(vessel.currentLat).toFixed(4)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Longitude:</span>
                <span className="font-medium">{Number(vessel.currentLng).toFixed(4)}°</span>
              </div>
              {vessel.lastUpdated && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium">{formatDate(vessel.lastUpdated)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}