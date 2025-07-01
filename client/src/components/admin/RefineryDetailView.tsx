import React, { useState, useEffect } from 'react';
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
  Zap,
  Globe,
  Phone,
  Mail,
  Calendar,
  Gauge,
  Target,
  Fuel,
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
  Bell
} from 'lucide-react';

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  city?: string | null;
  capacity: number | null;
  latitude: string;
  longitude: string;
  type: string | null;
  status: string | null;
  description: string | null;
  lastUpdated: Date | null;
  operator?: string | null;
  owner?: string | null;
  products?: string | null;
  year_built?: number | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  technical_specs?: string | null;
  utilization?: string | null;
  complexity?: string | null;
}

interface RefineryDetailViewProps {
  refinery: Refinery;
  onClose?: () => void;
}

export default function RefineryDetailView({ refinery, onClose }: RefineryDetailViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realTimeData, setRealTimeData] = useState({
    production: Math.floor(Math.random() * 20) + 80,
    temperature: Math.floor(Math.random() * 50) + 150,
    pressure: Math.floor(Math.random() * 30) + 70,
    efficiency: Math.floor(Math.random() * 15) + 85,
    safety: Math.floor(Math.random() * 10) + 90,
    alerts: Math.floor(Math.random() * 5),
    vessels: Math.floor(Math.random() * 8) + 3,
    throughput: Math.floor(Math.random() * 500) + 1500
  });

  // Simulate real-time updates
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const dataInterval = setInterval(() => {
      setRealTimeData(prev => ({
        production: Math.max(50, Math.min(100, prev.production + (Math.random() - 0.5) * 5)),
        temperature: Math.max(120, Math.min(200, prev.temperature + (Math.random() - 0.5) * 10)),
        pressure: Math.max(50, Math.min(100, prev.pressure + (Math.random() - 0.5) * 8)),
        efficiency: Math.max(70, Math.min(100, prev.efficiency + (Math.random() - 0.5) * 3)),
        safety: Math.max(80, Math.min(100, prev.safety + (Math.random() - 0.5) * 2)),
        alerts: Math.max(0, Math.min(10, Math.floor(prev.alerts + (Math.random() - 0.7) * 2))),
        vessels: Math.max(1, Math.min(15, Math.floor(prev.vessels + (Math.random() - 0.5) * 2))),
        throughput: Math.max(1000, Math.min(3000, prev.throughput + (Math.random() - 0.5) * 100))
      }));
    }, 3000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, []);

  // Helper functions
  const formatCapacity = (capacity: number | null) => {
    if (!capacity) return 'N/A';
    return `${capacity.toLocaleString()}`;
  };

  const getStatusColor = (value: number, type: 'production' | 'safety' | 'efficiency') => {
    if (type === 'safety') return value > 95 ? 'text-green-400' : value > 85 ? 'text-yellow-400' : 'text-red-400';
    return value > 90 ? 'text-green-400' : value > 75 ? 'text-yellow-400' : 'text-red-400';
  };

  const getProgressColor = (value: number) => {
    if (value > 90) return 'bg-green-400';
    if (value > 75) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Advanced tank component with animations
  const AdvancedTank = ({ level, label, color, capacity, product }: { 
    level: number; 
    label: string; 
    color: string; 
    capacity: string; 
    product: string; 
  }) => {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/70 transition-all duration-300">
        <div className="flex flex-col items-center space-y-3">
          {/* Tank visualization */}
          <div className="relative w-20 h-40 bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl border-2 border-slate-600 overflow-hidden shadow-2xl">
            {/* Liquid with gradient effect */}
            <div 
              className={`absolute bottom-0 left-0 right-0 transition-all duration-2000 ease-out ${color} opacity-90 animate-liquid`}
              style={{ height: `${level}%` }}
            />
            
            {/* Percentage display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md">
                <span className="text-white text-sm font-bold">{level}%</span>
              </div>
            </div>
            
            {/* Tank measurement lines */}
            {[20, 40, 60, 80].map(line => (
              <div 
                key={line}
                className="absolute left-0 right-0 border-t border-slate-500/50"
                style={{ top: `${100 - line}%` }}
              />
            ))}
            
            {/* Pipe connection */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-4 bg-slate-600 rounded-b-sm" />
          </div>
          
          {/* Tank information */}
          <div className="text-center space-y-1">
            <h4 className="text-white font-semibold text-sm">{label}</h4>
            <p className="text-slate-400 text-xs">{product}</p>
            <p className="text-slate-500 text-xs">{capacity}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-auto">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes liquidFlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-liquid {
          animation: liquidFlow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Close Button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="fixed top-6 right-6 z-50 bg-slate-800/80 backdrop-blur-sm border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        {/* Advanced Header */}
        <div className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                ADVANCED REFINERY COMMAND CENTER
              </h1>
              <p className="text-slate-300 text-lg font-medium">{refinery.name} • {refinery.country}</p>
              <p className="text-slate-400 text-sm">
                Live monitoring • {currentTime.toLocaleTimeString()} • ID: {refinery.id}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">OPERATIONAL</span>
              </div>
              <p className="text-slate-400 text-sm">Capacity: {formatCapacity(refinery.capacity)} bbl/day</p>
            </div>
          </div>
        </div>

        {/* Real-time KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Activity className="h-8 w-8 text-green-400" />
                <Badge className="bg-green-900/50 text-green-300 border-green-700">
                  {realTimeData.production > 85 ? 'OPTIMAL' : 'NORMAL'}
                </Badge>
              </div>
              <div className={`text-3xl font-bold mb-1 ${getStatusColor(realTimeData.production, 'production')}`}>
                {realTimeData.production.toFixed(1)}%
              </div>
              <p className="text-slate-400 text-sm mb-3">Production Rate</p>
              <Progress value={realTimeData.production} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Shield className="h-8 w-8 text-blue-400" />
                <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">
                  SECURE
                </Badge>
              </div>
              <div className={`text-3xl font-bold mb-1 ${getStatusColor(realTimeData.safety, 'safety')}`}>
                {realTimeData.safety.toFixed(1)}%
              </div>
              <p className="text-slate-400 text-sm mb-3">Safety Index</p>
              <Progress value={realTimeData.safety} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border border-cyan-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Ship className="h-8 w-8 text-cyan-400" />
                <Badge className="bg-cyan-900/50 text-cyan-300 border-cyan-700">
                  LIVE
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1 text-cyan-400">
                {realTimeData.vessels}
              </div>
              <p className="text-slate-400 text-sm mb-3">Connected Vessels</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-cyan-400">Real-time tracking</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border border-orange-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Thermometer className="h-8 w-8 text-orange-400" />
                <Badge className="bg-orange-900/50 text-orange-300 border-orange-700">
                  {realTimeData.temperature > 180 ? 'HIGH' : 'NORMAL'}
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1 text-orange-400">
                {realTimeData.temperature}°C
              </div>
              <p className="text-slate-400 text-sm mb-3">Process Temperature</p>
              <div className="text-xs text-slate-400">
                Range: 120-200°C
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Storage Tank Monitoring */}
        <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Container className="h-8 w-8 text-amber-400" />
                  Advanced Storage Management
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  Real-time monitoring of all storage tanks with predictive analytics
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Total Capacity</div>
                <div className="text-2xl font-bold text-white">172K bbl</div>
                <div className="text-xs text-green-400">89% utilized</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tanks" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
                <TabsTrigger value="tanks" className="data-[state=active]:bg-slate-600">Storage Tanks</TabsTrigger>
                <TabsTrigger value="flow" className="data-[state=active]:bg-slate-600">Flow Rates</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-600">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="tanks" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  <AdvancedTank 
                    level={Math.floor(realTimeData.production * 0.8)} 
                    label="Tank A1" 
                    color="bg-gradient-to-t from-amber-600 to-amber-400" 
                    capacity="50K bbl" 
                    product="Crude Oil"
                  />
                  <AdvancedTank 
                    level={Math.floor(realTimeData.efficiency * 0.9)} 
                    label="Tank B2" 
                    color="bg-gradient-to-t from-red-600 to-red-400" 
                    capacity="30K bbl" 
                    product="Gasoline"
                  />
                  <AdvancedTank 
                    level={Math.floor(realTimeData.throughput / 30)} 
                    label="Tank C3" 
                    color="bg-gradient-to-t from-blue-600 to-blue-400" 
                    capacity="25K bbl" 
                    product="Diesel"
                  />
                  <AdvancedTank 
                    level={Math.floor(realTimeData.pressure)} 
                    label="Tank D4" 
                    color="bg-gradient-to-t from-purple-600 to-purple-400" 
                    capacity="15K bbl" 
                    product="Kerosene"
                  />
                  <AdvancedTank 
                    level={Math.floor(realTimeData.safety * 0.7)} 
                    label="Tank E5" 
                    color="bg-gradient-to-t from-gray-600 to-gray-400" 
                    capacity="40K bbl" 
                    product="Fuel Oil"
                  />
                  <AdvancedTank 
                    level={Math.floor(realTimeData.vessels * 6)} 
                    label="Tank F6" 
                    color="bg-gradient-to-t from-green-600 to-green-400" 
                    capacity="12K bbl" 
                    product="LPG"
                  />
                </div>
              </TabsContent>

              <TabsContent value="flow" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/30 border-slate-600/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        Inflow Rates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Crude Oil</span>
                        <span className="text-green-400 font-bold">{realTimeData.throughput} bbl/hr</span>
                      </div>
                      <Progress value={realTimeData.throughput / 30} className="h-3" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Natural Gas</span>
                        <span className="text-blue-400 font-bold">{Math.floor(realTimeData.pressure * 10)} mcf/hr</span>
                      </div>
                      <Progress value={realTimeData.pressure} className="h-3" />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/30 border-slate-600/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Truck className="h-5 w-5 text-orange-400" />
                        Outflow Rates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Refined Products</span>
                        <span className="text-orange-400 font-bold">{Math.floor(realTimeData.efficiency * 15)} bbl/hr</span>
                      </div>
                      <Progress value={realTimeData.efficiency} className="h-3" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Petrochemicals</span>
                        <span className="text-purple-400 font-bold">{Math.floor(realTimeData.production * 8)} bbl/hr</span>
                      </div>
                      <Progress value={realTimeData.production} className="h-3" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/30 border-slate-600/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-cyan-400" />
                        Efficiency Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Overall Equipment Effectiveness</span>
                        <span className="text-cyan-400 font-bold">{realTimeData.efficiency}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Energy Efficiency Ratio</span>
                        <span className="text-green-400 font-bold">{(realTimeData.production * 0.95).toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Yield Optimization</span>
                        <span className="text-blue-400 font-bold">{(realTimeData.safety * 0.92).toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/30 border-slate-600/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-purple-400" />
                        Predictive Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                        <div className="text-green-400 font-medium">Optimal Performance</div>
                        <div className="text-green-300 text-sm">Systems running within ideal parameters</div>
                      </div>
                      
                      <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                        <div className="text-yellow-400 font-medium">Maintenance Due</div>
                        <div className="text-yellow-300 text-sm">Tank C3 requires inspection in 72 hours</div>
                      </div>
                      
                      <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                        <div className="text-blue-400 font-medium">Capacity Forecast</div>
                        <div className="text-blue-300 text-sm">Expected 95% utilization by next week</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Advanced Operations and Environmental Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Process Units Status */}
          <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Settings className="h-6 w-6 text-green-400" />
                Advanced Process Control
              </CardTitle>
              <CardDescription className="text-slate-400">
                Real-time monitoring of all process units with AI-driven optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Atmospheric Distillation', status: 'OPTIMAL', efficiency: realTimeData.production, temp: realTimeData.temperature },
                { name: 'Catalytic Cracking', status: 'ACTIVE', efficiency: realTimeData.efficiency, temp: realTimeData.temperature + 20 },
                { name: 'Hydroprocessing', status: 'NORMAL', efficiency: realTimeData.safety, temp: realTimeData.temperature - 10 },
                { name: 'Reforming Unit', status: 'MAINTENANCE', efficiency: 0, temp: 0 }
              ].map((unit, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${
                      unit.status === 'OPTIMAL' ? 'bg-green-400 animate-pulse' :
                      unit.status === 'ACTIVE' ? 'bg-blue-400 animate-pulse' :
                      unit.status === 'NORMAL' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="text-white font-medium">{unit.name}</div>
                      <div className="text-slate-400 text-sm">
                        {unit.status !== 'MAINTENANCE' ? `${unit.efficiency.toFixed(1)}% • ${unit.temp}°C` : 'Scheduled maintenance'}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${
                    unit.status === 'OPTIMAL' ? 'bg-green-900/50 text-green-300' :
                    unit.status === 'ACTIVE' ? 'bg-blue-900/50 text-blue-300' :
                    unit.status === 'NORMAL' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-red-900/50 text-red-300'
                  }`}>
                    {unit.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Environmental & Safety Monitoring */}
          <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Eye className="h-6 w-6 text-blue-400" />
                Environmental & Safety Systems
              </CardTitle>
              <CardDescription className="text-slate-400">
                Comprehensive monitoring with regulatory compliance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-700/30">
                  <Droplets className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">{(realTimeData.alerts + 1.5).toFixed(1)} ppm</div>
                  <div className="text-xs text-slate-400">SO₂ Emissions</div>
                  <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">COMPLIANT</Badge>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-xl border border-green-700/30">
                  <Wind className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">Good</div>
                  <div className="text-xs text-slate-400">Air Quality Index</div>
                  <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">EXCELLENT</Badge>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-xl border border-orange-700/30">
                  <Thermometer className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400">{(realTimeData.temperature / 6).toFixed(0)}°C</div>
                  <div className="text-xs text-slate-400">Ambient Temp</div>
                  <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">NORMAL</Badge>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl border border-purple-700/30">
                  <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">{(realTimeData.pressure / 10).toFixed(1)} db</div>
                  <div className="text-xs text-slate-400">Noise Level</div>
                  <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">SAFE</Badge>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Recent System Events
                </h4>
                
                {realTimeData.alerts > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <div className="text-yellow-300 font-medium">Scheduled Maintenance Alert</div>
                      <div className="text-yellow-400/70 text-sm">Unit maintenance window in 48 hours</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="text-green-300 font-medium">All Systems Operational</div>
                    <div className="text-green-400/70 text-sm">Performance within optimal parameters</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <Database className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="text-blue-300 font-medium">Data Synchronization</div>
                    <div className="text-blue-400/70 text-sm">Real-time data updated {Math.floor(Math.random() * 30 + 10)}s ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Facility Information */}
        <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Building className="h-6 w-6 text-blue-400" />
              Advanced Facility Intelligence
            </CardTitle>
            <CardDescription className="text-slate-400">
              Comprehensive facility information with operational insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold border-b border-slate-700 pb-2">Facility Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location</span>
                    <span className="text-white font-medium">{refinery.city || 'N/A'}, {refinery.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Capacity</span>
                    <span className="text-white font-medium">{formatCapacity(refinery.capacity)} bbl</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Refinery Type</span>
                    <span className="text-white font-medium">{refinery.type || 'Integrated Complex'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Year Built</span>
                    <span className="text-white font-medium">{refinery.year_built || '1985'}</span>
                  </div>
                </div>
              </div>

              {/* Operational Metrics */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold border-b border-slate-700 pb-2">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Utilization</span>
                    <span className="text-green-400 font-medium">{realTimeData.production.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Energy Efficiency</span>
                    <span className="text-blue-400 font-medium">{realTimeData.efficiency.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Complexity Index</span>
                    <span className="text-purple-400 font-medium">{(realTimeData.pressure / 10).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Vessels</span>
                    <span className="text-cyan-400 font-medium">{realTimeData.vessels} ships</span>
                  </div>
                </div>
              </div>

              {/* Contact & Status */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold border-b border-slate-700 pb-2">Operations Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operator</span>
                    <span className="text-white font-medium">{refinery.operator || 'PetroDeal Corp'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Status</span>
                    <Badge className="bg-green-900/50 text-green-300 border-green-700">
                      {refinery.status?.toUpperCase() || 'OPERATIONAL'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Safety Rating</span>
                    <span className="text-green-400 font-medium">{realTimeData.safety.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Update</span>
                    <span className="text-slate-300 text-sm">{currentTime.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}