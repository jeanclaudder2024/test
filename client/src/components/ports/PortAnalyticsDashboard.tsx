import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  MapPin,
  Ship,
  Anchor,
  Gauge,
  Clock,
  DollarSign,
  Users,
  Package,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface PortAnalytics {
  portId: number;
  portName: string;
  vesselTraffic: {
    current: number;
    capacity: number;
    utilization: number;
    trend: number;
  };
  cargoVolume: {
    total: number;
    byType: Array<{ type: string; volume: number; percentage: number }>;
    monthlyGrowth: number;
  };
  efficiency: {
    averageTurnaroundTime: number;
    berthUtilization: number;
    craneProductivity: number;
    waitingTime: number;
  };
  financial: {
    revenue: number;
    costs: number;
    profit: number;
    revenuePerTeu: number;
  };
  environmental: {
    emissionsReduction: number;
    energyEfficiency: number;
    wasteRecycling: number;
  };
}

interface PortPerformanceMetrics {
  overall: {
    efficiency: number;
    reliability: number;
    sustainability: number;
    connectivity: number;
  };
  benchmarks: {
    industry: number;
    region: number;
    global: number;
  };
  recommendations: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
  }>;
}

// Real-time Port Traffic Component
function PortTrafficMonitor({ portId }: { portId: number }) {
  const { data: traffic, isLoading } = useQuery({
    queryKey: ['/api/ports', portId, 'traffic'],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}/traffic`);
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded"></div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Real-time Traffic</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ship className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Vessels in Port</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{traffic?.current || 0}</div>
              <div className="text-xs text-muted-foreground">/ {traffic?.capacity || 0}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Capacity Utilization</span>
              <span>{traffic?.utilization || 0}%</span>
            </div>
            <Progress value={traffic?.utilization || 0} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{traffic?.arriving || 0}</div>
              <div className="text-xs text-muted-foreground">Arriving</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{traffic?.docked || 0}</div>
              <div className="text-xs text-muted-foreground">Docked</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">{traffic?.departing || 0}</div>
              <div className="text-xs text-muted-foreground">Departing</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Port Performance Benchmarking
function PortPerformanceBenchmark({ portId }: { portId: number }) {
  const { data: performance, isLoading } = useQuery({
    queryKey: ['/api/ports', portId, 'performance'],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}/performance`);
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded"></div>;
  }

  const metrics = [
    { label: 'Efficiency', value: performance?.overall?.efficiency || 0, color: 'blue' },
    { label: 'Reliability', value: performance?.overall?.reliability || 0, color: 'green' },
    { label: 'Sustainability', value: performance?.overall?.sustainability || 0, color: 'emerald' },
    { label: 'Connectivity', value: performance?.overall?.connectivity || 0, color: 'purple' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Benchmarks</CardTitle>
        <CardDescription>
          Compare against industry standards and regional averages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{metric.label}</span>
                <span className="text-sm text-muted-foreground">{metric.value}%</span>
              </div>
              <div className="space-y-1">
                <Progress value={metric.value} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Industry: {performance?.benchmarks?.industry || 0}%</span>
                  <span>Region: {performance?.benchmarks?.region || 0}%</span>
                  <span>Global: {performance?.benchmarks?.global || 0}%</span>
                </div>
              </div>
            </div>
          ))}

          {/* Recommendations */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Improvement Recommendations</h4>
            <div className="space-y-2">
              {performance?.recommendations?.slice(0, 3).map((rec: any, index: number) => (
                <div key={index} className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Badge 
                    variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {rec.priority}
                  </Badge>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{rec.description}</div>
                    <div className="text-xs text-muted-foreground">{rec.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Port Route Planning Component
function PortRoutePlanner({ portId }: { portId: number }) {
  const [destinationPort, setDestinationPort] = useState('');
  const [vesselType, setVesselType] = useState('');

  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['/api/ports', portId, 'routes', destinationPort, vesselType],
    queryFn: async () => {
      if (!destinationPort) return null;
      const response = await fetch(`/api/ports/${portId}/routes?destination=${destinationPort}&vesselType=${vesselType}`);
      return response.json();
    },
    enabled: !!destinationPort
  });

  const { data: nearbyPorts } = useQuery({
    queryKey: ['/api/ports', 'nearby', portId],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}/nearby`);
      return response.json();
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Planning</CardTitle>
        <CardDescription>
          AI-powered optimal route suggestions between ports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Destination Port</label>
              <Select value={destinationPort} onValueChange={setDestinationPort}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {nearbyPorts?.map((port: any) => (
                    <SelectItem key={port.id} value={port.id.toString()}>
                      {port.name} - {port.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Vessel Type</label>
              <Select value={vesselType} onValueChange={setVesselType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vessel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tanker">Oil Tanker</SelectItem>
                  <SelectItem value="container">Container Ship</SelectItem>
                  <SelectItem value="bulk">Bulk Carrier</SelectItem>
                  <SelectItem value="general">General Cargo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {routes && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recommended Routes</h4>
              {routes.map((route: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{route.name}</div>
                    <Badge variant={route.priority === 'optimal' ? 'default' : 'secondary'}>
                      {route.priority}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Distance</div>
                      <div className="font-medium">{route.distance} nm</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Est. Time</div>
                      <div className="font-medium">{route.estimatedTime}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Fuel Cost</div>
                      <div className="font-medium">${route.fuelCost?.toLocaleString()}</div>
                    </div>
                  </div>
                  {route.waypoints && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Via: {route.waypoints.join(' → ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Port Analytics Dashboard
export function PortAnalyticsDashboard({ portId }: { portId: number }) {
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/ports', portId, 'analytics'],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}/analytics`);
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{analytics?.portName || 'Port Analytics'}</h2>
          <p className="text-muted-foreground">Real-time insights and performance metrics</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PortTrafficMonitor portId={portId} />
            <PortPerformanceBenchmark portId={portId} />
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <PortTrafficMonitor portId={portId} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PortPerformanceBenchmark portId={portId} />
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <PortRoutePlanner portId={portId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}