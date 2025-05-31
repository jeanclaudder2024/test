import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Ship, 
  MapPin, 
  Clock, 
  Navigation,
  RefreshCw,
  Anchor,
  Calendar,
  Route,
  BarChart3,
  Wind,
  Fuel
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Vessel {
  id: number;
  name: string;
  departurePort: string | number | null;
  destinationPort: string | number | null;
  departureDate: string | null;
  eta: string | null;
  currentLat: string | null;
  currentLng: string | null;
  vesselStatus: string | null;
}

interface VoyageDetailsProps {
  vessel: Vessel;
}

export const VoyageDetailsClean: React.FC<VoyageDetailsProps> = ({ vessel }) => {
  const [ports, setPorts] = useState<any[]>([]);
  const [voyageProgress, setVoyageProgress] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch ports for name resolution
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const response = await axios.get('/api/ports');
        if (response.data) {
          setPorts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch ports:', error);
      }
    };
    fetchPorts();
  }, []);

  // Fetch voyage progress
  useEffect(() => {
    const fetchVoyageProgress = async () => {
      try {
        const response = await axios.get(`/api/vessels/${vessel.id}/progress`);
        if (response.data?.success) {
          setVoyageProgress(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch voyage progress:', error);
      }
    };

    if (vessel.id) {
      fetchVoyageProgress();
    }
  }, [vessel.id]);

  // Update voyage progress manually
  const updateProgress = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.post(`/api/vessels/${vessel.id}/update-progress`);
      if (response.data?.success) {
        setVoyageProgress(response.data.data);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get port name helper
  const getPortName = (portIdOrName: string | number | null): string => {
    if (!portIdOrName) return 'Not specified';
    
    // If it's a string, return as is
    if (typeof portIdOrName === 'string') {
      // Check if it's a numeric string that should be looked up
      const numericId = parseInt(portIdOrName);
      if (!isNaN(numericId)) {
        const port = ports.find(p => p.id === numericId);
        return port?.name || portIdOrName;
      }
      return portIdOrName;
    }
    
    // If it's a number, look up in ports
    const port = ports.find(p => p.id === portIdOrName);
    return port?.name || `Port ${portIdOrName}`;
  };

  // Format date helper
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Calculate basic progress if no AI data
  const getBasicProgress = (): number => {
    if (!vessel.departureDate || !vessel.eta) return 0;
    
    const start = new Date(vessel.departureDate);
    const end = new Date(vessel.eta);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    if (totalDuration <= 0) return 0;
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    return Math.round(progress);
  };

  const progressPercentage = voyageProgress?.percentComplete ?? getBasicProgress();

  return (
    <div className="space-y-6">
      {/* Voyage Progress Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-600" />
              Voyage Progress
            </CardTitle>
            <div className="flex items-center gap-2">
              {voyageProgress && (
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  AI Generated
                </Badge>
              )}
              <Button
                onClick={updateProgress}
                disabled={isUpdating}
                size="sm"
                variant="outline"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{getPortName(vessel.departurePort)}</span>
              <span className="text-blue-600 font-semibold">{progressPercentage}%</span>
              <span className="font-medium">{getPortName(vessel.destinationPort)}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* AI Voyage Details */}
          {voyageProgress && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-blue-900">Voyage Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {voyageProgress.currentStatus && (
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{voyageProgress.currentStatus}</span>
                  </div>
                )}
                {voyageProgress.nextMilestone && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Next: {voyageProgress.nextMilestone}</span>
                  </div>
                )}
                {voyageProgress.weatherConditions && (
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{voyageProgress.weatherConditions}</span>
                  </div>
                )}
                {voyageProgress.averageSpeed && (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Speed: {voyageProgress.averageSpeed.toFixed(1)} knots</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voyage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Route className="h-5 w-5 text-green-600" />
            Voyage Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Departure */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <Anchor className="h-4 w-4" />
                <span className="font-semibold">Departure</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="font-medium">{getPortName(vessel.departurePort)}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(vessel.departureDate)}
                </p>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <MapPin className="h-4 w-4" />
                <span className="font-semibold">Destination</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="font-medium">{getPortName(vessel.destinationPort)}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ETA: {formatDate(vessel.eta)}
                </p>
              </div>
            </div>

            {/* Current Position */}
            {vessel.currentLat && vessel.currentLng && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-purple-600">
                  <Navigation className="h-4 w-4" />
                  <span className="font-semibold">Current Position</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm">
                    {parseFloat(vessel.currentLat).toFixed(4)}°N, {parseFloat(vessel.currentLng).toFixed(4)}°E
                  </p>
                </div>
              </div>
            )}

            {/* Status */}
            {vessel.vesselStatus && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-orange-600">
                  <Ship className="h-4 w-4" />
                  <span className="font-semibold">Status</span>
                </div>
                <div className="pl-6">
                  <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                    {vessel.vesselStatus}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};