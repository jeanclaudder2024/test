import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Fuel, 
  Globe, 
  AlertCircle,
  Check,
  Filter,
  Settings
} from 'lucide-react';

interface OilType {
  id: number;
  name: string;
  description: string;
  apiGravity?: number;
  sulfurContent?: string;
  viscosity?: string;
  color?: string;
  origin?: string;
  isActive: boolean;
  createdAt: string;
}

interface Region {
  id: number;
  name: string;
  description: string;
  code: string;
  continent?: string;
  isActive: boolean;
  createdAt: string;
}

export function FilterManagement() {
  const [editingOilType, setEditingOilType] = useState<number | null>(null);
  const [editingRegion, setEditingRegion] = useState<number | null>(null);
  const [newOilType, setNewOilType] = useState({
    name: '',
    description: '',
    apiGravity: '',
    sulfurContent: '',
    viscosity: '',
    color: '',
    origin: ''
  });
  const [newRegion, setNewRegion] = useState({
    name: '',
    description: '',
    code: '',
    continent: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch oil types
  const { data: oilTypes = [], isLoading: oilTypesLoading } = useQuery({
    queryKey: ['/api/oil-types'],
    retry: false,
  });

  // Fetch regions
  const { data: regions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ['/api/regions'],
    retry: false,
  });

  // Create oil type mutation
  const createOilTypeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/oil-types', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          apiGravity: data.apiGravity ? parseFloat(data.apiGravity) : null,
          isActive: true
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oil-types'] });
      setNewOilType({
        name: '',
        description: '',
        apiGravity: '',
        sulfurContent: '',
        viscosity: '',
        color: '',
        origin: ''
      });
      toast({
        title: "Success",
        description: "Oil type created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create oil type",
        variant: "destructive",
      });
    },
  });

  // Create region mutation
  const createRegionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/regions', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          isActive: true
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/regions'] });
      setNewRegion({
        name: '',
        description: '',
        code: '',
        continent: ''
      });
      toast({
        title: "Success",
        description: "Region created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create region",
        variant: "destructive",
      });
    },
  });

  // Delete oil type mutation
  const deleteOilTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/oil-types/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oil-types'] });
      toast({
        title: "Success",
        description: "Oil type deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete oil type",
        variant: "destructive",
      });
    },
  });

  // Delete region mutation
  const deleteRegionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/regions/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/regions'] });
      toast({
        title: "Success",
        description: "Region deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete region",
        variant: "destructive",
      });
    },
  });

  const handleCreateOilType = () => {
    if (!newOilType.name || !newOilType.description) {
      toast({
        title: "Error",
        description: "Name and description are required",
        variant: "destructive",
      });
      return;
    }
    createOilTypeMutation.mutate(newOilType);
  };

  const handleCreateRegion = () => {
    if (!newRegion.name || !newRegion.description || !newRegion.code) {
      toast({
        title: "Error",
        description: "Name, description, and code are required",
        variant: "destructive",
      });
      return;
    }
    createRegionMutation.mutate(newRegion);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Filter Management
          </h2>
          <p className="text-slate-600 mt-1">
            Manage oil types and regions for filtering across the platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-blue-500" />
          <Settings className="h-5 w-5 text-purple-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Oil Types Management */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Fuel className="h-5 w-5" />
              Oil Types Management
            </CardTitle>
            <CardDescription>
              Manage oil types used for filtering vessels and deals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Oil Type */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Oil Type
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Oil type name"
                  value={newOilType.name}
                  onChange={(e) => setNewOilType({ ...newOilType, name: e.target.value })}
                />
                <Input
                  placeholder="API Gravity (°API)"
                  type="number"
                  value={newOilType.apiGravity}
                  onChange={(e) => setNewOilType({ ...newOilType, apiGravity: e.target.value })}
                />
                <Input
                  placeholder="Sulfur Content"
                  value={newOilType.sulfurContent}
                  onChange={(e) => setNewOilType({ ...newOilType, sulfurContent: e.target.value })}
                />
                <Input
                  placeholder="Viscosity"
                  value={newOilType.viscosity}
                  onChange={(e) => setNewOilType({ ...newOilType, viscosity: e.target.value })}
                />
                <Input
                  placeholder="Color"
                  value={newOilType.color}
                  onChange={(e) => setNewOilType({ ...newOilType, color: e.target.value })}
                />
                <Input
                  placeholder="Origin"
                  value={newOilType.origin}
                  onChange={(e) => setNewOilType({ ...newOilType, origin: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Description"
                value={newOilType.description}
                onChange={(e) => setNewOilType({ ...newOilType, description: e.target.value })}
                rows={3}
              />
              <Button
                onClick={handleCreateOilType}
                disabled={createOilTypeMutation.isPending}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {createOilTypeMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Oil Type
                  </div>
                )}
              </Button>
            </div>

            {/* Oil Types List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Existing Oil Types</h4>
              {oilTypesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : oilTypes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  No oil types found. Create your first oil type above.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {oilTypes.map((oilType: OilType) => (
                    <div
                      key={oilType.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{oilType.name}</span>
                          <Badge variant={oilType.isActive ? "default" : "secondary"}>
                            {oilType.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{oilType.description}</p>
                        {oilType.apiGravity && (
                          <p className="text-xs text-slate-500">API: {oilType.apiGravity}°</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingOilType(oilType.id)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteOilTypeMutation.mutate(oilType.id)}
                          disabled={deleteOilTypeMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Regions Management */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Globe className="h-5 w-5" />
              Regions Management
            </CardTitle>
            <CardDescription>
              Manage geographical regions for filtering and organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Region */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Region
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Region name"
                  value={newRegion.name}
                  onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                />
                <Input
                  placeholder="Region code (e.g., ME, EU)"
                  value={newRegion.code}
                  onChange={(e) => setNewRegion({ ...newRegion, code: e.target.value.toUpperCase() })}
                />
                <Input
                  placeholder="Continent"
                  value={newRegion.continent}
                  onChange={(e) => setNewRegion({ ...newRegion, continent: e.target.value })}
                  className="md:col-span-2"
                />
              </div>
              <Textarea
                placeholder="Region description"
                value={newRegion.description}
                onChange={(e) => setNewRegion({ ...newRegion, description: e.target.value })}
                rows={3}
              />
              <Button
                onClick={handleCreateRegion}
                disabled={createRegionMutation.isPending}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {createRegionMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Region
                  </div>
                )}
              </Button>
            </div>

            {/* Regions List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Existing Regions</h4>
              {regionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : regions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  No regions found. Create your first region above.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {regions.map((region: Region) => (
                    <div
                      key={region.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{region.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {region.code}
                          </Badge>
                          <Badge variant={region.isActive ? "default" : "secondary"}>
                            {region.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{region.description}</p>
                        {region.continent && (
                          <p className="text-xs text-slate-500">Continent: {region.continent}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRegion(region.id)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRegionMutation.mutate(region.id)}
                          disabled={deleteRegionMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}