import { useState, useEffect } from 'react';
import { Vessel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from '@/lib/utils';
import { Link, useRoute } from 'wouter';
import {
  ArrowLeft, Ship, Calendar, MapPin, Navigation, 
  Clock, Fuel, Gauge, RefreshCw, Globe, Flag
} from 'lucide-react';

interface VesselDetailProps {
  params: { id: string };
}

export default function VesselDetail({ params }: VesselDetailProps) {
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [voyageProgress, setVoyageProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const { toast } = useToast();

  // Fetch vessel data
  useEffect(() => {
    const fetchVessel = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/vessels/${params.id}`);
        setVessel(response.data);
        
        // Fetch voyage progress
        const progressResponse = await axios.get(`/api/vessels/${params.id}/progress`);
        if (progressResponse.data.success) {
          setVoyageProgress(progressResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch vessel:', error);
        toast({
          title: "Error",
          description: "Failed to load vessel details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchVessel();
    }
  }, [params.id, toast]);

  // Update voyage progress
  const updateVoyageProgress = async () => {
    setIsUpdatingProgress(true);
    try {
      const response = await axios.post(`/api/vessels/${params.id}/update-progress`);
      if (response.data.success) {
        setVoyageProgress(response.data.data);
        toast({
          title: "Success",
          description: "Voyage progress updated successfully"
        });
      }
    } catch (error) {
      console.error('Failed to update voyage progress:', error);
      toast({
        title: "Error",
        description: "Failed to update voyage progress",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Ship className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading vessel details...</span>
        </div>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vessel Not Found</h1>
          <Link href="/vessels">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vessels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/vessels">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vessel.name}</h1>
              <p className="text-gray-600 flex items-center mt-1">
                <Flag className="h-4 w-4 mr-2" />
                {vessel.flag} • {vessel.vesselType}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              IMO: {vessel.imo}
            </Badge>
            <Badge variant="outline" className="text-sm">
              MMSI: {vessel.mmsi}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Voyage Progress Card */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center">
                    <Ship className="h-5 w-5 mr-2 text-blue-600" />
                    Voyage Progress
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {voyageProgress && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        AI Generated
                      </Badge>
                    )}
                    <Button
                      onClick={updateVoyageProgress}
                      disabled={isUpdatingProgress}
                      size="sm"
                      variant="outline"
                    >
                      {isUpdatingProgress ? (
                        <>
                          <Ship className="h-3 w-3 mr-1 animate-spin" />
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
              <CardContent>
                {voyageProgress ? (
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Journey Complete</span>
                        <span className="text-lg font-bold text-blue-600">
                          {voyageProgress.percentComplete}%
                        </span>
                      </div>
                      <Progress 
                        value={voyageProgress.percentComplete} 
                        className="h-3"
                      />
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Navigation className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">Current Status</span>
                        </div>
                        <p className="text-blue-900 font-semibold">
                          {voyageProgress.currentStatus || "En route"}
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <MapPin className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">Next Milestone</span>
                        </div>
                        <p className="text-green-900 font-semibold">
                          {voyageProgress.nextMilestone || "Destination approach"}
                        </p>
                      </div>
                    </div>

                    {/* Weather & Conditions */}
                    {voyageProgress.weatherConditions && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Globe className="h-4 w-4 text-orange-600 mr-2" />
                          <span className="text-sm font-medium text-orange-800">Weather Conditions</span>
                        </div>
                        <p className="text-orange-900">{voyageProgress.weatherConditions}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Ship className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No voyage progress data available</p>
                    <Button 
                      onClick={updateVoyageProgress}
                      className="mt-4"
                      size="sm"
                    >
                      Generate Progress Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Information */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  Route Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Departure */}
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-600 font-medium">DEPARTURE</p>
                      <p className="font-semibold text-blue-900">
                        {vessel.departurePort || "Not specified"}
                      </p>
                      {vessel.departureDate && (
                        <p className="text-sm text-blue-700">
                          {formatDate(new Date(vessel.departureDate))}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-green-600 font-medium">DESTINATION</p>
                      <p className="font-semibold text-green-900">
                        {vessel.destinationPort || "Not specified"}
                      </p>
                      {vessel.eta && (
                        <p className="text-sm text-green-700">
                          ETA: {formatDate(new Date(vessel.eta))}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            
            {/* Vessel Specifications */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Ship className="h-4 w-4 mr-2 text-purple-600" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadweight</span>
                  <span className="font-semibold">
                    {vessel.deadweight ? `${vessel.deadweight.toLocaleString()} tons` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cargo Capacity</span>
                  <span className="font-semibold">
                    {vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} tons` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Built</span>
                  <span className="font-semibold">{vessel.built || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Speed</span>
                  <span className="font-semibold flex items-center">
                    <Gauge className="h-3 w-3 mr-1" />
                    {vessel.speed ? `${vessel.speed} knots` : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Cargo Information */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Fuel className="h-4 w-4 mr-2 text-orange-600" />
                  Cargo Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cargo Type</span>
                  <span className="font-semibold">{vessel.cargoType || "N/A"}</span>
                </div>
                {vessel.quantity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold">
                      {typeof vessel.quantity === 'number' 
                        ? vessel.quantity.toLocaleString() 
                        : vessel.quantity} barrels
                    </span>
                  </div>
                )}
                {vessel.dealValue && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deal Value</span>
                    <span className="font-semibold text-green-600">
                      $
                      {typeof vessel.dealValue === 'number' 
                        ? vessel.dealValue.toLocaleString() 
                        : vessel.dealValue}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Position */}
            {vessel.currentLat && vessel.currentLng && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Navigation className="h-4 w-4 mr-2 text-red-600" />
                    Current Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg font-mono font-semibold text-gray-800">
                      {typeof vessel.currentLat === 'number' 
                        ? vessel.currentLat.toFixed(4) 
                        : parseFloat(vessel.currentLat).toFixed(4)}°,{' '}
                      {typeof vessel.currentLng === 'number' 
                        ? vessel.currentLng.toFixed(4) 
                        : parseFloat(vessel.currentLng).toFixed(4)}°
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {vessel.currentRegion || "International Waters"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics */}
            {voyageProgress && (voyageProgress.fuelConsumption || voyageProgress.averageSpeed) && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Gauge className="h-4 w-4 mr-2 text-indigo-600" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {voyageProgress.averageSpeed && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Speed</span>
                      <span className="font-semibold">
                        {voyageProgress.averageSpeed.toFixed(1)} knots
                      </span>
                    </div>
                  )}
                  {voyageProgress.fuelConsumption && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Consumption</span>
                      <span className="font-semibold">
                        {voyageProgress.fuelConsumption.toFixed(1)} tons/day
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}