import { useState, useEffect } from 'react';
import { Vessel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import EnhancedVesselMap from '@/components/map/EnhancedVesselMap';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from '@/lib/utils';
import { Link, useRoute } from 'wouter';
import {
  ArrowLeft, Ship, Calendar, Map, Navigation, Anchor,
  Flag, Droplet, Package, Truck, Gauge, BarChart,
  Users, Clock, Compass, ArrowRight, FileText, Globe,
  Fuel, Activity, MapPin, Factory, DollarSign, TrendingUp
} from 'lucide-react';

export default function VesselDetail() {
  const [match, params] = useRoute('/vessel/:id');
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const vesselId = params?.id;

  useEffect(() => {
    if (!vesselId) return;

    const fetchVessel = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/vessels/${vesselId}`);
        setVessel(response.data);
      } catch (err) {
        setError('Failed to load vessel details');
        toast({
          title: "Error",
          description: "Failed to load vessel details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVessel();
  }, [vesselId, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vessel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vessel) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Ship className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vessel Not Found</h2>
          <p className="text-gray-600 mb-6">The vessel you're looking for doesn't exist or has been removed.</p>
          <Link href="/vessels">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vessels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'underway': return 'bg-green-500';
      case 'at anchor': return 'bg-yellow-500';
      case 'moored': return 'bg-blue-500';
      case 'not under command': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getVesselTypeIcon = (type: string) => {
    if (type?.toLowerCase().includes('tanker')) return <Droplet className="h-5 w-5" />;
    if (type?.toLowerCase().includes('cargo')) return <Package className="h-5 w-5" />;
    if (type?.toLowerCase().includes('container')) return <Package className="h-5 w-5" />;
    return <Ship className="h-5 w-5" />;
  };

  const calculateProgress = () => {
    if (!vessel.departureDate || !vessel.eta) return 0;
    
    const departure = new Date(vessel.departureDate).getTime();
    const arrival = new Date(vessel.eta).getTime();
    const now = new Date().getTime();
    
    if (now < departure) return 0;
    if (now > arrival) return 100;
    
    const total = arrival - departure;
    const elapsed = now - departure;
    return Math.round((elapsed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/vessels">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                {getVesselTypeIcon(vessel.vesselType)}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{vessel.name}</h1>
                  <p className="text-sm text-gray-500">IMO: {vessel.imo} • MMSI: {vessel.mmsi}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(vessel.status)} text-white`}>
                {vessel.status || 'Unknown'}
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                <Flag className="h-3 w-3 mr-1" />
                {vessel.flag}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Position & Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Current Position & Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Coordinates</span>
                      <span className="text-sm font-mono">
                        {vessel.currentLat && vessel.currentLng 
                          ? `${parseFloat(vessel.currentLat).toFixed(4)}°, ${parseFloat(vessel.currentLng).toFixed(4)}°`
                          : 'Not available'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Speed</span>
                      <span className="text-sm font-semibold">{vessel.speed || 'N/A'} knots</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Region</span>
                      <span className="text-sm">{vessel.currentRegion || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {vessel.departurePort && vessel.destinationPort && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Route</span>
                          <span className="text-sm">{vessel.departurePort} → {vessel.destinationPort}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Progress</span>
                            <span className="text-sm font-semibold">{calculateProgress()}%</span>
                          </div>
                          <Progress value={calculateProgress()} className="h-2" />
                        </div>
                      </>
                    )}
                    {vessel.eta && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">ETA</span>
                        <span className="text-sm">{formatDate(vessel.eta)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="specifications" className="w-full">
                  <div className="border-b border-gray-200">
                    <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
                      <TabsTrigger value="specifications" className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                        <Ship className="h-4 w-4 mr-2" />
                        Specifications
                      </TabsTrigger>
                      <TabsTrigger value="cargo" className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                        <Package className="h-4 w-4 mr-2" />
                        Cargo
                      </TabsTrigger>
                      <TabsTrigger value="commercial" className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Commercial
                      </TabsTrigger>
                      <TabsTrigger value="technical" className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                        <Activity className="h-4 w-4 mr-2" />
                        Technical
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="specifications" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Vessel Type</span>
                            <span className="text-sm font-medium">{vessel.vesselType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Built Year</span>
                            <span className="text-sm font-medium">{vessel.built || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Flag State</span>
                            <span className="text-sm font-medium">{vessel.flag}</span>
                          </div>
                          {(vessel as any).callsign && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Call Sign</span>
                              <span className="text-sm font-medium font-mono">{(vessel as any).callsign}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Dimensions & Capacity</h3>
                        <div className="space-y-3">
                          {(vessel as any).length && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Length</span>
                              <span className="text-sm font-medium">{(vessel as any).length} m</span>
                            </div>
                          )}
                          {(vessel as any).width && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Beam</span>
                              <span className="text-sm font-medium">{(vessel as any).width} m</span>
                            </div>
                          )}
                          {vessel.deadweight && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Deadweight</span>
                              <span className="text-sm font-medium">{vessel.deadweight.toLocaleString()} tons</span>
                            </div>
                          )}
                          {(vessel as any).grossTonnage && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Gross Tonnage</span>
                              <span className="text-sm font-medium">{(vessel as any).grossTonnage.toLocaleString()} GT</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cargo" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Cargo Information</h3>
                        <div className="space-y-3">
                          {vessel.cargoType && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Cargo Type</span>
                              <span className="text-sm font-medium">{vessel.cargoType}</span>
                            </div>
                          )}
                          {vessel.cargoCapacity && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Cargo Capacity</span>
                              <span className="text-sm font-medium">{vessel.cargoCapacity.toLocaleString()} barrels</span>
                            </div>
                          )}
                          {(vessel as any).quantity && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Current Load</span>
                              <span className="text-sm font-medium">{parseFloat((vessel as any).quantity).toLocaleString()} barrels</span>
                            </div>
                          )}
                          {(vessel as any).loadingPort && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Loading Port</span>
                              <span className="text-sm font-medium">{(vessel as any).loadingPort}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Route Details</h3>
                        <div className="space-y-3">
                          {vessel.departurePort && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Departure</span>
                              <span className="text-sm font-medium">{vessel.departurePort}</span>
                            </div>
                          )}
                          {vessel.destinationPort && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Destination</span>
                              <span className="text-sm font-medium">{vessel.destinationPort}</span>
                            </div>
                          )}
                          {(vessel as any).routeDistance && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Distance</span>
                              <span className="text-sm font-medium">{parseFloat((vessel as any).routeDistance).toLocaleString()} nm</span>
                            </div>
                          )}
                          {(vessel as any).shippingType && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Shipping Terms</span>
                              <span className="text-sm font-medium">{(vessel as any).shippingType}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="commercial" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Deal Information</h3>
                        <div className="space-y-3">
                          {(vessel as any).dealValue && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Deal Value</span>
                              <span className="text-sm font-medium">${parseFloat((vessel as any).dealValue).toLocaleString()}</span>
                            </div>
                          )}
                          {(vessel as any).price && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Unit Price</span>
                              <span className="text-sm font-medium">${parseFloat((vessel as any).price).toFixed(2)}/barrel</span>
                            </div>
                          )}
                          {(vessel as any).marketPrice && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Market Price</span>
                              <span className="text-sm font-medium">${parseFloat((vessel as any).marketPrice).toFixed(2)}/barrel</span>
                            </div>
                          )}
                          {vessel.buyerName && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Buyer</span>
                              <span className="text-sm font-medium">{vessel.buyerName}</span>
                            </div>
                          )}
                          {vessel.sellerName && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Seller</span>
                              <span className="text-sm font-medium">{vessel.sellerName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Operators</h3>
                        <div className="space-y-3">
                          {vessel.ownerName && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Owner</span>
                              <span className="text-sm font-medium">{vessel.ownerName}</span>
                            </div>
                          )}
                          {vessel.operatorName && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Operator</span>
                              <span className="text-sm font-medium">{vessel.operatorName}</span>
                            </div>
                          )}
                          {(vessel as any).sourceCompany && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Source Company</span>
                              <span className="text-sm font-medium">{(vessel as any).sourceCompany}</span>
                            </div>
                          )}
                          {(vessel as any).targetRefinery && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Target Refinery</span>
                              <span className="text-sm font-medium">{(vessel as any).targetRefinery}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Navigation</h3>
                        <div className="space-y-3">
                          {(vessel as any).course && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Course</span>
                              <span className="text-sm font-medium">{(vessel as any).course}°</span>
                            </div>
                          )}
                          {(vessel as any).navStatus && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Navigation Status</span>
                              <span className="text-sm font-medium">{(vessel as any).navStatus}</span>
                            </div>
                          )}
                          {(vessel as any).draught && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Draught</span>
                              <span className="text-sm font-medium">{(vessel as any).draught} m</span>
                            </div>
                          )}
                          {(vessel as any).crewSize && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Crew Size</span>
                              <span className="text-sm font-medium">{(vessel as any).crewSize} persons</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
                        <div className="space-y-3">
                          {(vessel as any).enginePower && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Engine Power</span>
                              <span className="text-sm font-medium">{parseInt((vessel as any).enginePower).toLocaleString()} HP</span>
                            </div>
                          )}
                          {(vessel as any).fuelConsumption && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Fuel Consumption</span>
                              <span className="text-sm font-medium">{(vessel as any).fuelConsumption} tons/day</span>
                            </div>
                          )}
                          {vessel.lastUpdated && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Last Updated</span>
                              <span className="text-sm font-medium">{formatDate(vessel.lastUpdated)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Live Position
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-80 rounded-b-lg overflow-hidden">
                  <EnhancedVesselMap 
                    vessels={[vessel]} 
                    height="320px"
                    showControls={false}
                    focusVessel={vessel.id}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{vessel.built ? new Date().getFullYear() - vessel.built : 'N/A'}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Years Old</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{vessel.speed || '0'}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Knots</div>
                  </div>
                </div>
                
                {vessel.departureDate && vessel.eta && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Voyage Progress</div>
                    <Progress value={calculateProgress()} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Departed {formatDate(vessel.departureDate)}</span>
                      <span>ETA {formatDate(vessel.eta)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}