import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  X
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
  const formatCapacity = (capacity: number | null) => {
    if (!capacity) return 'N/A';
    return `${capacity.toLocaleString()}`;
  };

  const formatProducts = (products: string | null) => {
    if (!products) return ['Gasoline', 'Diesel', 'Jet Fuel'];
    return products.split(',').map(p => p.trim()).filter(p => p.length > 0);
  };

  // Generate realistic operational data
  const getOperationalData = () => {
    const seed = refinery.id || 1;
    const utilization = refinery.utilization ? parseFloat(refinery.utilization) : 70 + (seed % 25);
    
    return {
      storage: {
        valid: Math.floor(1200 + (seed * 35) % 800),
        incoming: Math.floor(400 + (seed * 15) % 300)
      },
      shipments: {
        capacity: Math.floor(1500 + (seed * 45) % 600),
        pending: Math.floor(3 + seed % 8)
      },
      tanks: [
        { name: 'Diesel', percentage: Math.floor(65 + (seed * 7) % 25), color: 'emerald' },
        { name: 'Jet Fuel', percentage: Math.floor(45 + (seed * 11) % 30), color: 'blue' },
        { name: 'Crude Oil', percentage: Math.floor(25 + (seed * 13) % 40), color: 'slate' }
      ],
      connected: seed % 3 === 0
    };
  };

  const data = getOperationalData();

  const TankVisualization = ({ tank, index }: { tank: any, index: number }) => {
    const getColorClasses = (color: string) => {
      switch(color) {
        case 'emerald':
          return {
            border: 'border-emerald-400',
            bg: 'bg-emerald-400/20',
            fill: 'bg-emerald-400/40',
            text: 'text-emerald-400',
            borderFull: 'border-emerald-400'
          };
        case 'blue':
          return {
            border: 'border-blue-400',
            bg: 'bg-blue-400/20',
            fill: 'bg-blue-400/40',
            text: 'text-blue-400',
            borderFull: 'border-blue-400'
          };
        case 'slate':
          return {
            border: 'border-slate-400',
            bg: 'bg-slate-400/20',
            fill: 'bg-slate-400/40',
            text: 'text-slate-400',
            borderFull: 'border-slate-400'
          };
        default:
          return {
            border: 'border-slate-400',
            bg: 'bg-slate-400/20',
            fill: 'bg-slate-400/40',
            text: 'text-slate-400',
            borderFull: 'border-slate-400'
          };
      }
    };

    const colors = getColorClasses(tank.color);

    return (
      <div className="flex flex-col items-center space-y-4">
        {/* Tank Visualization */}
        <div className="relative">
          <div className={`w-24 h-32 rounded-xl border-2 ${colors.border} ${colors.bg} relative overflow-hidden`}>
            <div 
              className={`absolute bottom-0 w-full ${colors.fill} transition-all duration-1000`}
              style={{ height: `${tank.percentage}%` }}
            />
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-6 h-2 bg-slate-600 rounded-full"></div>
            </div>
          </div>
          
          {/* Percentage Display */}
          <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg border-2 bg-slate-800 ${colors.borderFull}`}>
            <span className={`${colors.text} font-bold text-lg`}>{tank.percentage}%</span>
          </div>
        </div>
        
        {/* Tank Label */}
        <div className="text-center">
          <p className="text-slate-300 font-medium">{tank.name}</p>
          <p className="text-slate-500 text-sm">TANK {index + 1}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 min-h-screen p-6 text-white relative">
      {/* Close Button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 z-10"
        >
          <X className="h-6 w-6" />
        </Button>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">REFINERY DASHBOARD</h1>
        <p className="text-slate-400 text-lg">{refinery.name} - {refinery.country}</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Storage Stats */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-slate-400 text-lg font-semibold mb-4 tracking-wider">STORAGE</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{data.storage.valid.toLocaleString()}</span>
                <span className="text-slate-400 text-lg">Valid</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{data.storage.incoming}</span>
                <span className="text-slate-400 text-lg">Incoming</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-slate-400 text-lg font-semibold mb-4 tracking-wider">SHIPMENTS</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{data.shipments.capacity.toLocaleString()}</span>
              </div>
              <span className="text-slate-400 text-lg">Capacity</span>
            </div>
          </div>
        </div>

        {/* Priority Shipment */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-slate-400 text-lg font-semibold mb-4 tracking-wider">SHIPMENTS</h3>
          <div className="inline-block bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold">
            <div className="text-xl font-bold">JET FUEL</div>
            <div className="text-sm opacity-90">Due in {data.shipments.pending} h</div>
          </div>
        </div>
      </div>

      {/* Tanks Section */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
        <h3 className="text-slate-400 text-2xl font-semibold mb-8 tracking-wider">TANKS</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {data.tanks.map((tank, index) => (
            <TankVisualization key={index} tank={tank} index={index} />
          ))}
        </div>

        {/* Vessel Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-3">
              <Ship className="h-8 w-8 text-emerald-400" />
              <div>
                <p className="text-white font-semibold">Vessel A</p>
                <p className={`text-sm ${data.connected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {data.connected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <p className="text-slate-400 text-sm mb-2">TANK 2</p>
            <p className="text-slate-300 font-semibold">Diesel</p>
            <div className="mt-2 px-4 py-2 border-2 border-emerald-400 rounded-lg">
              <span className="text-emerald-400 font-bold text-xl">{data.tanks[0].percentage}%</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <p className="text-slate-400 text-sm mb-2">TANK 3</p>
            <p className="text-slate-300 font-semibold">Crude oil</p>
            <div className="mt-2 px-4 py-2 border-2 border-slate-400 rounded-lg">
              <span className="text-slate-400 font-bold text-xl">{data.tanks[2].percentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-slate-400 text-lg font-semibold mb-4 tracking-wider flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            LOCATION
          </h3>
          <div className="space-y-2">
            <p className="text-white">{refinery.city}, {refinery.country}</p>
            <p className="text-slate-400 text-sm">{refinery.latitude}, {refinery.longitude}</p>
            <p className="text-slate-400 text-sm">{refinery.region}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-slate-400 text-lg font-semibold mb-4 tracking-wider flex items-center gap-2">
            <Activity className="h-5 w-5" />
            OPERATIONS
          </h3>
          <div className="space-y-2">
            <p className="text-white">Operator: {refinery.operator || 'N/A'}</p>
            <p className="text-white">Capacity: {formatCapacity(refinery.capacity)} bpd</p>
            <div className="flex items-center gap-2">
              <span className="text-white">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                refinery.status === 'Operational' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
              }`}>
                {refinery.status || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}