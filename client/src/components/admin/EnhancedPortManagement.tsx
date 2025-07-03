import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Upload,
  Edit,
  Trash2,
  MapPin,
  Ship,
  Building2,
  BarChart3,
  TrendingUp,
  Activity,
  Package,
  Grid3X3,
  List,
} from 'lucide-react';

import AdvancedPortCreation from './AdvancedPortCreation';

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  type: string | null;
  status: string | null;
  capacity: number | null;
  description: string | null;
  lastUpdated: Date | null;
  vesselCount: number;
  connectedRefineries: number;
  totalCargo: number;
}

interface PortStats {
  totalPorts: number;
  operationalPorts: number;
  totalVessels: number;
  totalCapacity: number;
  averageVesselsPerPort: number;
  topRegions: Array<{ region: string; count: number }>;
}

function PortStatusBadge({ status }: { status: string | null }) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'limited':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border-0`}>
      {status || 'Unknown'}
    </Badge>
  );
}

function EnhancedPortCard({ port, onEdit, onDelete }: { 
  port: Port; 
  onEdit: (port: Port) => void; 
  onDelete: (port: Port) => void; 
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              {port.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              {port.country} • {port.region}
            </CardDescription>
          </div>
          <PortStatusBadge status={port.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Ship className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{port.vesselCount} vessels</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">{port.connectedRefineries} refineries</span>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">{port.totalCargo}K cargo</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">{port.capacity?.toLocaleString() || 'N/A'} TEU</span>
          </div>
        </div>
        
        {port.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {port.description}
          </p>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{port.lat}, {port.lng}</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8"
              onClick={() => onEdit(port)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-red-600 hover:text-red-700"
              onClick={() => onDelete(port)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PortStatistics({ stats }: { stats: PortStats | undefined }) {
  if (!stats) return null;

  const statisticsCards = [
    {
      title: 'Total Ports',
      value: stats.totalPorts.toLocaleString(),
      icon: Building2,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Operational Ports',
      value: stats.operationalPorts.toLocaleString(),
      icon: Activity,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Vessels',
      value: stats.totalVessels.toLocaleString(),
      icon: Ship,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total Capacity',
      value: `${(stats.totalCapacity / 1000000).toFixed(1)}M TEU`,
      icon: Package,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Avg Vessels/Port',
      value: stats.averageVesselsPerPort.toFixed(1),
      icon: TrendingUp,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statisticsCards.map((stat, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EnhancedPortManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [showPortForm, setShowPortForm] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ports, isLoading } = useQuery({
    queryKey: ['/api/admin/ports'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/port-stats'],
  });

  // OLD DELETE MUTATION REMOVED - Using new one below

  const handleEditPort = (port: Port) => {
    setEditingPort(port);
    setShowPortForm(true);
    toast({
      title: "Edit Mode",
      description: `Editing ${port.name}`,
    });
  };

  const handleFormClose = () => {
    setShowPortForm(false);
    setEditingPort(null);
  };

  const handleFormSuccess = () => {
    setShowPortForm(false);
    setEditingPort(null);
    
    // Reset filters and sorting to show newly created ports
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterRegion('all');
    setSortBy('id'); // Sort by ID to show newest ports first
    setCurrentPage(1); // Go to first page
    
    queryClient.invalidateQueries({ queryKey: ['/api/admin/ports'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/port-stats'] });
    
    toast({
      title: "Success",
      description: "Port created successfully! Showing newest ports first.",
    });
  };

  const handleDeletePort = (port: Port) => {
    if (window.confirm(`Are you sure you want to delete "${port.name}"? This action cannot be undone.`)) {
      newDeleteMutation.mutate(port.id);
    }
  };

  // New, completely rebuilt delete mutation using public endpoint
  const newDeleteMutation = useMutation({
    mutationFn: async (portId: number) => {
      console.log(`Frontend: Starting delete for port ID: ${portId}`);
      
      const response = await fetch(`/api/ports/${portId}`, {
        method: 'DELETE',
      });
      
      console.log(`Frontend: Delete response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Frontend: Delete failed:`, errorText);
        throw new Error(`Delete failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`Frontend: Delete response:`, result);
      
      return result;
    },
    onSuccess: (data, portId) => {
      console.log(`Frontend: Delete successful for port ${portId}`);
      
      // Force refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/port-stats'] });
      
      // Show success message
      toast({
        title: "Success",
        description: "Port deleted successfully",
      });
    },
    onError: (error, portId) => {
      console.error(`Frontend: Delete failed for port ${portId}:`, error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Filter and search logic
  const filteredPorts = Array.isArray(ports) ? ports.filter((port: Port) => {
    const matchesSearch = port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         port.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         port.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || port.type === filterType;
    const matchesStatus = filterStatus === 'all' || port.status === filterStatus;
    const matchesRegion = filterRegion === 'all' || port.region === filterRegion;

    return matchesSearch && matchesType && matchesStatus && matchesRegion;
  }) : [];

  // Sort logic
  const sortedPorts = [...filteredPorts].sort((a: Port, b: Port) => {
    switch (sortBy) {
      case 'id':
        return b.id - a.id; // Newest first (highest ID first)
      case 'name':
        return a.name.localeCompare(b.name);
      case 'country':
        return a.country.localeCompare(b.country);
      case 'capacity':
        return (b.capacity || 0) - (a.capacity || 0);
      case 'vesselCount':
        return b.vesselCount - a.vesselCount;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPorts.length / pageSize);
  const paginatedPorts = sortedPorts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading port management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Port Management</h1>
          <p className="text-gray-600 mt-2">Manage maritime ports and terminals</p>
        </div>
        <div className="flex space-x-3">
          {/* View Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" className="shadow-sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Bulk
          </Button>
          <Button 
            onClick={() => {
              setEditingPort(null);
              setShowPortForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Port
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <PortStatistics stats={stats as PortStats | undefined} />

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search ports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="oil_terminal">Oil Terminal</SelectItem>
                <SelectItem value="container">Container</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="Asia">Asia</SelectItem>
                <SelectItem value="Americas">Americas</SelectItem>
                <SelectItem value="Middle East">Middle East</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="capacity">Capacity</SelectItem>
                <SelectItem value="vesselCount">Vessel Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Port List - Cards or Table View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedPorts.map((port: Port) => (
            <EnhancedPortCard 
              key={port.id} 
              port={port} 
              onEdit={handleEditPort}
              onDelete={handleDeletePort}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Port Name</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Capacity</TableHead>
                  <TableHead className="font-semibold text-center">Vessels</TableHead>
                  <TableHead className="font-semibold text-center">Refineries</TableHead>
                  <TableHead className="font-semibold text-center">Coordinates</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPorts.map((port: Port) => (
                  <TableRow key={port.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Ship className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{port.name}</div>
                          {port.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {port.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{port.country}</div>
                          <div className="text-sm text-gray-500">{port.region}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {port.type?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <PortStatusBadge status={port.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {port.capacity?.toLocaleString() || 'N/A'}
                        </span>
                        {port.capacity && <span className="text-xs text-gray-500">TEU</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Ship className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-600">
                          {port.vesselCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Building2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">
                          {port.connectedRefineries}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs text-gray-500 font-mono">
                        <div>{parseFloat(port.lat).toFixed(4)}</div>
                        <div>{parseFloat(port.lng).toFixed(4)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPort(port)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePort(port)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} • {filteredPorts.length} total ports
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Port Creation Form */}
      <AdvancedPortCreation
        open={showPortForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editingPort={editingPort}
      />
    </div>
  );
}