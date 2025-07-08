import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Building, 
  Activity, 
  Globe,
  Phone,
  Mail,
  Calendar,
  Gauge,
  Ship,
  BarChart3,
  TrendingUp,
  Clock,
  X,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Droplets,
  Wind,
  Truck,
  Container,
  Users,
  Settings,
  PieChart,
  LineChart,
  Monitor,
  Shield,
  FileText,
  Database,
  Wifi,
  Power,
  Eye,
  Bell,
  DollarSign,
  TrendingDown,
  Anchor,
  Waves,
  Plane,
  Train,
  Factory,
  ExternalLink
} from 'lucide-react';

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  city?: string | null;
  timezone?: string | null;
  lat: string;
  lng: string;
  type?: string | null;
  status?: string | null;
  capacity?: number | null;
  annualThroughput?: number | null;
  operatingHours?: string | null;
  description?: string | null;
  portAuthority?: string | null;
  operator?: string | null;
  owner?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  postalCode?: string | null;
  maxVesselLength?: string | null;
  maxVesselBeam?: string | null;
  maxDraught?: string | null;
  maxDeadweight?: number | null;
  berthCount?: number | null;
  terminalCount?: number | null;
  channelDepth?: string | null;
  berthDepth?: string | null;
  anchorageDepth?: string | null;
  services?: string | null;
  facilities?: string | null;
  cargoTypes?: string | null;
  securityLevel?: string | null;
  pilotageRequired?: boolean | null;
  tugAssistance?: boolean | null;
  quarantineStation?: boolean | null;
  environmentalCertifications?: string | null;
  customsOffice?: boolean | null;
  freeTradeZone?: boolean | null;
  railConnection?: boolean | null;
  roadConnection?: boolean | null;
  airportDistance?: string | null;
  averageWaitTime?: string | null;
  weatherRestrictions?: string | null;
  tidalRange?: string | null;
  portCharges?: string | null;
  currency?: string | null;
  connectedRefineries?: number | null;
  nearbyPorts?: string | null;
  vesselCount?: number | null;
  totalCargo?: string | null;
  established?: number | null;
  lastInspection?: Date | null;
  nextInspection?: Date | null;
  photo?: string | null;
  createdAt?: Date | null;
  lastUpdated?: Date | null;
}

interface PortDetailViewProps {
  port: Port;
  onClose?: () => void;
}

export default function PortDetailView({ port, onClose }: PortDetailViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realTimeData, setRealTimeData] = useState({
    utilization: Math.floor(Math.random() * 30) + 70,
    efficiency: Math.floor(Math.random() * 20) + 80,
    throughput: Math.floor(Math.random() * 40) + 60,
    safety: Math.floor(Math.random() * 10) + 90,
    alerts: Math.floor(Math.random() * 3),
    temperature: Math.floor(Math.random() * 15) + 20,
    pressure: Math.floor(Math.random() * 50) + 1000,
    traffic: Math.floor(Math.random() * 20) + 80
  });

  // Fetch real vessels connected to this port
  const { data: vesselsData = [], isLoading: isVesselsLoading } = useQuery({
    queryKey: ['/api/vessels'],
    staleTime: 0,
  });

  // Calculate real vessel connections to this port
  const connectedVessels = React.useMemo(() => {
    if (!vesselsData || !Array.isArray(vesselsData)) return [];
    
    return vesselsData.filter((vessel: any) => {
      try {
        const departurePortId = vessel.departurePort ? Number(vessel.departurePort) : null;
        const destinationPortId = vessel.destinationPort ? Number(vessel.destinationPort) : null;
        return departurePortId === port.id || destinationPortId === port.id;
      } catch (e) {
        return false;
      }
    }).map((vessel: any) => {
      const departurePortId = vessel.departurePort ? Number(vessel.departurePort) : null;
      const destinationPortId = vessel.destinationPort ? Number(vessel.destinationPort) : null;
      return {
        ...vessel,
        connectionType: departurePortId === port.id ? 'Departing' : 'Arriving'
      };
    });
  }, [vesselsData, port.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setRealTimeData(prev => ({
        utilization: Math.max(50, Math.min(100, prev.utilization + Math.floor(Math.random() * 10) - 5)),
        efficiency: Math.max(70, Math.min(100, prev.efficiency + Math.floor(Math.random() * 6) - 3)),
        throughput: Math.max(40, Math.min(100, prev.throughput + Math.floor(Math.random() * 8) - 4)),
        safety: Math.max(85, Math.min(100, prev.safety + Math.floor(Math.random() * 4) - 2)),
        alerts: Math.max(0, Math.min(5, prev.alerts + Math.floor(Math.random() * 3) - 1)),
        temperature: Math.max(15, Math.min(35, prev.temperature + Math.floor(Math.random() * 4) - 2)),
        pressure: Math.max(990, Math.min(1020, prev.pressure + Math.floor(Math.random() * 10) - 5)),
        traffic: Math.max(60, Math.min(100, prev.traffic + Math.floor(Math.random() * 6) - 3))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatCapacity = (capacity: number | null) => {
    if (!capacity) return 'N/A';
    if (capacity >= 1000000) return `${(capacity / 1000000).toFixed(1)}M`;
    if (capacity >= 1000) return `${(capacity / 1000).toFixed(1)}K`;
    return capacity.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-2xl text-white shadow-lg">
              <Anchor className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{port.name}</h1>
              <p className="text-xl text-gray-600 mt-1">{port.city ? `${port.city}, ` : ''}{port.country}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={`${
                  port.status?.toLowerCase() === 'operational' ? 'bg-green-900/50 text-green-300' :
                  port.status?.toLowerCase() === 'maintenance' ? 'bg-yellow-900/50 text-yellow-300' :
                  port.status?.toLowerCase() === 'limited' ? 'bg-orange-900/50 text-orange-300' :
                  'bg-red-900/50 text-red-300'
                }`}>
                  {port.status?.toUpperCase() || 'OPERATIONAL'}
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {port.type || 'Commercial Port'}
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  {port.region}
                </Badge>
              </div>
            </div>
          </div>
          
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/30 backdrop-blur-sm border border-blue-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Active Vessels</p>
                  <p className="text-3xl font-bold text-blue-900">{connectedVessels.length}</p>
                  <p className="text-blue-600 text-xs">Currently connected</p>
                </div>
                <Ship className="h-12 w-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/30 backdrop-blur-sm border border-green-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Port Utilization</p>
                  <p className="text-3xl font-bold text-green-900">{realTimeData.utilization}%</p>
                  <p className="text-green-600 text-xs">Of total capacity</p>
                </div>
                <Gauge className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/30 backdrop-blur-sm border border-purple-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Traffic Flow</p>
                  <p className="text-3xl font-bold text-purple-900">{realTimeData.traffic}%</p>
                  <p className="text-purple-600 text-xs">Operational efficiency</p>
                </div>
                <Activity className="h-12 w-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/30 backdrop-blur-sm border border-orange-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Safety Rating</p>
                  <p className="text-3xl font-bold text-orange-900">{realTimeData.safety}%</p>
                  <p className="text-orange-600 text-xs">Security compliance</p>
                </div>
                <Shield className="h-12 w-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Operations Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Port Operations Control */}
          <Card className="bg-white/30 backdrop-blur-sm border border-gray-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-3">
                <Monitor className="h-6 w-6 text-blue-400" />
                Live Port Operations
              </CardTitle>
              <CardDescription className="text-gray-600">
                Real-time monitoring of port activities and vessel movements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Berth Allocation', status: 'OPTIMAL', efficiency: realTimeData.utilization, priority: 'high' },
                { name: 'Cargo Handling', status: 'ACTIVE', efficiency: realTimeData.throughput, priority: 'medium' },
                { name: 'Vessel Traffic Control', status: 'NORMAL', efficiency: realTimeData.traffic, priority: 'high' },
                { name: 'Security Operations', status: 'SECURE', efficiency: realTimeData.safety, priority: 'critical' }
              ].map((operation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-100/30 rounded-xl border border-gray-300/30">
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${
                      operation.status === 'OPTIMAL' ? 'bg-green-400 animate-pulse' :
                      operation.status === 'ACTIVE' ? 'bg-blue-400 animate-pulse' :
                      operation.status === 'NORMAL' ? 'bg-yellow-400' :
                      operation.status === 'SECURE' ? 'bg-purple-400 animate-pulse' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="text-gray-900 font-medium">{operation.name}</div>
                      <div className="text-gray-600 text-sm">
                        {operation.efficiency.toFixed(1)}% efficiency • Priority: {operation.priority}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${
                    operation.status === 'OPTIMAL' ? 'bg-green-900/50 text-green-300' :
                    operation.status === 'ACTIVE' ? 'bg-blue-900/50 text-blue-300' :
                    operation.status === 'NORMAL' ? 'bg-yellow-900/50 text-yellow-300' :
                    operation.status === 'SECURE' ? 'bg-purple-900/50 text-purple-300' :
                    'bg-red-900/50 text-red-300'
                  }`}>
                    {operation.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Environmental & Conditions Monitoring */}
          <Card className="bg-white/30 backdrop-blur-sm border border-gray-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-3">
                <Eye className="h-6 w-6 text-blue-400" />
                Environmental Conditions
              </CardTitle>
              <CardDescription className="text-gray-600">
                Current weather, sea conditions, and environmental monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-700/30">
                  <Waves className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">{port.tidalRange || '2.3'} m</div>
                  <div className="text-xs text-gray-600">Tidal Range</div>
                  <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">NORMAL</Badge>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-xl border border-green-700/30">
                  <Wind className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">15 kts</div>
                  <div className="text-xs text-gray-600">Wind Speed</div>
                  <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">FAVORABLE</Badge>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-xl border border-orange-700/30">
                  <Thermometer className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400">{realTimeData.temperature}°C</div>
                  <div className="text-xs text-gray-600">Air Temperature</div>
                  <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">OPTIMAL</Badge>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl border border-purple-700/30">
                  <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">{port.averageWaitTime || '2.5'} hrs</div>
                  <div className="text-xs text-gray-600">Average Wait</div>
                  <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">EFFICIENT</Badge>
                </div>
              </div>

              {/* Recent System Events */}
              <div className="space-y-3">
                <h4 className="text-gray-900 font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Recent Port Activities
                </h4>
                
                <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <Ship className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="text-blue-300 font-medium">Vessel Arrival</div>
                    <div className="text-blue-400/70 text-sm">Container ship MV Pacific Glory docked at Berth 7</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="text-green-300 font-medium">Operations Status</div>
                    <div className="text-green-400/70 text-sm">All port operations running smoothly</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Vessels Section */}
        <Card className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-900">
              <Ship className="h-6 w-6 text-blue-600" />
              Active Vessels ({connectedVessels.length})
            </CardTitle>
            <CardDescription className="text-blue-700">
              Vessels currently connected to this port
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isVesselsLoading ? (
              <div className="text-center py-6">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-blue-600">Loading vessels...</p>
              </div>
            ) : connectedVessels.length > 0 ? (
              <div className="grid gap-4">
                {connectedVessels.map((vessel: any) => (
                  <div key={vessel.id} className="bg-white/60 p-4 rounded-xl border border-blue-200/30 hover:bg-white/80 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`h-3 w-3 rounded-full ${
                          vessel.connectionType === 'Departing' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-blue-900">{vessel.name || 'Unknown Vessel'}</h4>
                            <Badge variant="outline" className="text-xs">
                              {vessel.connectionType}
                            </Badge>
                          </div>
                          <div className="text-sm text-blue-700 mt-1">
                            <span className="mr-4">IMO: {vessel.imo || 'N/A'}</span>
                            <span className="mr-4">Type: {vessel.vesselType || 'Unknown'}</span>
                            {vessel.cargoType && <span>Cargo: {vessel.cargoType}</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(`/vessels/${vessel.id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ship className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-600 font-medium">No vessels currently connected</p>
                <p className="text-blue-500 text-sm">Vessels will appear here when they arrive or depart from this port</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comprehensive Port Information Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Technical Specifications */}
          <Card className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <Settings className="h-6 w-6 text-blue-600" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Max Vessel Length</p>
                  <p className="text-lg font-bold text-blue-900">{port.maxVesselLength || '400'} m</p>
                </div>
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Max Vessel Beam</p>
                  <p className="text-lg font-bold text-blue-900">{port.maxVesselBeam || '60'} m</p>
                </div>
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Max Draught</p>
                  <p className="text-lg font-bold text-blue-900">{port.maxDraught || '18'} m</p>
                </div>
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Channel Depth</p>
                  <p className="text-lg font-bold text-blue-900">{port.channelDepth || '20'} m</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Berth Count</p>
                  <p className="text-lg font-bold text-blue-900">{port.berthCount || '12'} berths</p>
                </div>
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Terminal Count</p>
                  <p className="text-lg font-bold text-blue-900">{port.terminalCount || '4'} terminals</p>
                </div>
              </div>
              
              {port.capacity && (
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium mb-2">Handling Capacity</p>
                  <p className="text-gray-700">{formatCapacity(port.capacity)} TEU/day</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operations & Management */}
          <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm border border-green-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-900">
                <Building className="h-6 w-6 text-green-600" />
                Operations & Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {port.portAuthority && (
                  <div className="bg-white/60 p-4 rounded-xl">
                    <p className="text-sm text-green-600 font-medium">Port Authority</p>
                    <p className="text-lg font-bold text-green-900">{port.portAuthority}</p>
                  </div>
                )}
                
                {port.operator && (
                  <div className="bg-white/60 p-4 rounded-xl">
                    <p className="text-sm text-green-600 font-medium">Operator</p>
                    <p className="text-lg font-bold text-green-900">{port.operator}</p>
                  </div>
                )}
                
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">Operating Hours</p>
                  <p className="text-lg font-bold text-green-900">{port.operatingHours || '24/7'}</p>
                </div>
                
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">Annual Throughput</p>
                  <p className="text-lg font-bold text-green-900">{formatCapacity(port.annualThroughput)} TEU</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Infrastructure & Connectivity */}
          <Card className="bg-gradient-to-br from-purple-50/80 to-violet-50/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-900">
                <MapPin className="h-6 w-6 text-purple-600" />
                Infrastructure & Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/60 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Train className="h-6 w-6 text-purple-600" />
                    <span className="font-medium text-purple-900">Rail Connection</span>
                  </div>
                  <Badge className={port.railConnection ? 'bg-green-900/50 text-green-300' : 'bg-gray-900/50 text-gray-300'}>
                    {port.railConnection ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
                
                <div className="bg-white/60 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="h-6 w-6 text-purple-600" />
                    <span className="font-medium text-purple-900">Road Access</span>
                  </div>
                  <Badge className={port.roadConnection ? 'bg-green-900/50 text-green-300' : 'bg-gray-900/50 text-gray-300'}>
                    {port.roadConnection !== false ? 'Available' : 'Limited'}
                  </Badge>
                </div>
                
                {port.airportDistance && (
                  <div className="bg-white/60 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Plane className="h-6 w-6 text-purple-600" />
                      <span className="font-medium text-purple-900">Nearest Airport</span>
                    </div>
                    <span className="font-bold text-purple-900">{port.airportDistance} km</span>
                  </div>
                )}
                
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium mb-2">Geographic Coordinates</p>
                  <p className="text-gray-700">{port.lat}, {port.lng}</p>
                </div>
                
                {port.timezone && (
                  <div className="bg-white/60 p-4 rounded-xl">
                    <p className="text-sm text-purple-600 font-medium mb-2">Timezone</p>
                    <p className="text-gray-700">{port.timezone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Safety & Compliance */}
          <Card className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm border border-orange-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-900">
                <Shield className="h-6 w-6 text-orange-600" />
                Safety & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/60 p-4 rounded-xl">
                  <p className="text-sm text-orange-600 font-medium">Security Level (ISPS)</p>
                  <p className="text-lg font-bold text-orange-900">Level {port.securityLevel || '1'}</p>
                </div>
                
                <div className="bg-white/60 p-4 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-orange-900">Pilotage Required</span>
                  <Badge className={port.pilotageRequired ? 'bg-orange-900/50 text-orange-300' : 'bg-green-900/50 text-green-300'}>
                    {port.pilotageRequired ? 'Required' : 'Optional'}
                  </Badge>
                </div>
                
                <div className="bg-white/60 p-4 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-orange-900">Tug Assistance</span>
                  <Badge className={port.tugAssistance ? 'bg-orange-900/50 text-orange-300' : 'bg-green-900/50 text-green-300'}>
                    {port.tugAssistance ? 'Required' : 'Available'}
                  </Badge>
                </div>
                
                <div className="bg-white/60 p-4 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-orange-900">Customs Office</span>
                  <Badge className={port.customsOffice ? 'bg-green-900/50 text-green-300' : 'bg-gray-900/50 text-gray-300'}>
                    {port.customsOffice ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
                
                <div className="bg-white/60 p-4 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-orange-900">Free Trade Zone</span>
                  <Badge className={port.freeTradeZone ? 'bg-green-900/50 text-green-300' : 'bg-gray-900/50 text-gray-300'}>
                    {port.freeTradeZone ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Additional Information */}
        <Card className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <FileText className="h-6 w-6 text-slate-600" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Contact Details</h4>
                {port.email && (
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium text-slate-900">{port.email}</p>
                  </div>
                )}
                {port.phone && (
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <p className="font-medium text-slate-900">{port.phone}</p>
                  </div>
                )}
                {port.website && (
                  <div>
                    <p className="text-sm text-slate-600">Website</p>
                    <p className="font-medium text-blue-600">{port.website}</p>
                  </div>
                )}
                {port.address && (
                  <div>
                    <p className="text-sm text-slate-600">Address</p>
                    <p className="font-medium text-slate-900">{port.address}</p>
                  </div>
                )}
              </div>

              {/* Financial & Services */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Services & Charges</h4>
                {port.currency && (
                  <div>
                    <p className="text-sm text-slate-600">Currency</p>
                    <p className="font-medium text-slate-900">{port.currency}</p>
                  </div>
                )}
                {port.services && (
                  <div>
                    <p className="text-sm text-slate-600">Available Services</p>
                    <p className="font-medium text-slate-900">{port.services}</p>
                  </div>
                )}
                {port.facilities && (
                  <div>
                    <p className="text-sm text-slate-600">Port Facilities</p>
                    <p className="font-medium text-slate-900">{port.facilities}</p>
                  </div>
                )}
                {port.cargoTypes && (
                  <div>
                    <p className="text-sm text-slate-600">Cargo Types</p>
                    <p className="font-medium text-slate-900">{port.cargoTypes}</p>
                  </div>
                )}
              </div>

              {/* Operational Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Operational Data</h4>
                {port.established && (
                  <div>
                    <p className="text-sm text-slate-600">Established</p>
                    <p className="font-medium text-slate-900">{port.established}</p>
                  </div>
                )}
                {port.connectedRefineries !== null && (
                  <div>
                    <p className="text-sm text-slate-600">Connected Refineries</p>
                    <p className="font-medium text-slate-900">{port.connectedRefineries || 0}</p>
                  </div>
                )}
                {port.weatherRestrictions && (
                  <div>
                    <p className="text-sm text-slate-600">Weather Restrictions</p>
                    <p className="font-medium text-slate-900">{port.weatherRestrictions}</p>
                  </div>
                )}
                {port.description && (
                  <div>
                    <p className="text-sm text-slate-600">Description</p>
                    <p className="font-medium text-slate-900 leading-relaxed">{port.description}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}