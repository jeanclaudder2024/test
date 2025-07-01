import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Target
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
}

export default function RefineryDetailView({ refinery }: RefineryDetailViewProps) {
  const formatCapacity = (capacity: number | null) => {
    if (!capacity) return 'N/A';
    return `${capacity.toLocaleString()} bpd`;
  };

  const formatProducts = (products: string | null) => {
    if (!products) return [];
    return products.split(',').map(p => p.trim()).filter(p => p.length > 0);
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'under maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shut down':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Basic Information */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5 text-blue-600" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Region</p>
              <p className="font-medium">{refinery.region}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Capacity</p>
              <p className="font-medium">{formatCapacity(refinery.capacity)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Operator</p>
              <p className="font-medium">{refinery.operator || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="font-medium">{refinery.type || 'N/A'}</p>
            </div>
          </div>

          {refinery.description && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-sm text-gray-800 leading-relaxed">{refinery.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Latitude</p>
              <p className="font-medium font-mono text-sm">{refinery.latitude}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Longitude</p>
              <p className="font-medium font-mono text-sm">{refinery.longitude}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Full Address</p>
            <p className="font-medium">
              {refinery.address || `${refinery.city || 'Unknown City'}, ${refinery.country}`}
            </p>
          </div>

          {(refinery.email || refinery.phone || refinery.website) && (
            <div className="space-y-2 pt-2 border-t">
              {refinery.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-blue-600">{refinery.email}</span>
                </div>
              )}
              {refinery.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{refinery.phone}</span>
                </div>
              )}
              {refinery.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-blue-600">{refinery.website}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-blue-600" />
            Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {formatProducts(refinery.products).length > 0 ? (
              formatProducts(refinery.products).map((product, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {product}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No products specified</p>
            )}
          </div>
          
          {refinery.technical_specs && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Technical Specifications</p>
              <p className="text-sm text-gray-800 leading-relaxed">{refinery.technical_specs}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operations */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-blue-600" />
            Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Owner</p>
            <p className="font-medium">{refinery.owner || refinery.operator || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <Badge className={getStatusColor(refinery.status)}>
              {refinery.status || 'Unknown'}
            </Badge>
          </div>

          {(refinery.utilization || refinery.complexity || refinery.year_built) && (
            <div className="space-y-3 pt-3 border-t">
              {refinery.utilization && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Utilization</span>
                  </div>
                  <span className="font-medium">{refinery.utilization}%</span>
                </div>
              )}
              
              {refinery.complexity && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Complexity Index</span>
                  </div>
                  <span className="font-medium">{refinery.complexity}</span>
                </div>
              )}
              
              {refinery.year_built && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Year Built</span>
                  </div>
                  <span className="font-medium">{refinery.year_built}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}