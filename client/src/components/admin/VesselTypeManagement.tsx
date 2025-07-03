import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Ship } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface VesselType {
  id: number;
  name: string;
  description: string;
  category: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface VesselTypeForm {
  name: string;
  description: string;
  category: string;
}

const VesselTypeManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingVesselType, setEditingVesselType] = useState<VesselType | null>(null);
  const [formData, setFormData] = useState<VesselTypeForm>({
    name: '',
    description: '',
    category: 'General'
  });

  // Fetch vessel types
  const { data: vesselTypes = [], isLoading } = useQuery({
    queryKey: ['/api/admin/vessel-types'],
    staleTime: 0
  });

  // Create vessel type mutation
  const createMutation = useMutation({
    mutationFn: async (data: VesselTypeForm) => {
      const response = await apiRequest('POST', '/api/admin/vessel-types', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vessel-types'] });
      resetForm();
      toast({
        title: "Success",
        description: "Vessel type created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create vessel type: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update vessel type mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VesselTypeForm }) => {
      const response = await apiRequest('PUT', `/api/admin/vessel-types/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vessel-types'] });
      resetForm();
      toast({
        title: "Success",
        description: "Vessel type updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update vessel type: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete vessel type mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/vessel-types/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vessel-types'] });
      toast({
        title: "Success",
        description: "Vessel type deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete vessel type: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Name and description are required",
        variant: "destructive",
      });
      return;
    }

    if (editingVesselType) {
      updateMutation.mutate({ id: editingVesselType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (vesselType: VesselType) => {
    setEditingVesselType(vesselType);
    setFormData({
      name: vesselType.name,
      description: vesselType.description,
      category: vesselType.category
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this vessel type?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingVesselType(null);
    setFormData({ name: '', description: '', category: 'General' });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'General': 'bg-gray-100 text-gray-800',
      'Tanker': 'bg-blue-100 text-blue-800',
      'Cargo': 'bg-green-100 text-green-800',
      'Container': 'bg-purple-100 text-purple-800',
      'Specialized': 'bg-orange-100 text-orange-800',
      'Passenger': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || colors['General'];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Ship className="h-5 w-5 text-blue-600" />
            <CardTitle>Vessel Type Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Vessel Type Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Oil Tanker, Container Ship"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Tanker">Tanker</SelectItem>
                    <SelectItem value="Cargo">Cargo</SelectItem>
                    <SelectItem value="Container">Container</SelectItem>
                    <SelectItem value="Specialized">Specialized</SelectItem>
                    <SelectItem value="Passenger">Passenger</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {editingVesselType ? 'Update' : 'Add'} Vessel Type
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this vessel type and its characteristics..."
                rows={3}
                required
              />
            </div>

            {editingVesselType && (
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              </div>
            )}
          </form>

          <Separator className="my-6" />

          <div>
            <h3 className="text-lg font-medium mb-4">
              Current Vessel Types ({vesselTypes.length})
            </h3>
            
            {vesselTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Ship className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No vessel types found. Add your first vessel type above.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vesselTypes.map((vesselType: VesselType) => (
                  <Card key={vesselType.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{vesselType.name}</h4>
                          <Badge className={getCategoryColor(vesselType.category)}>
                            {vesselType.category}
                          </Badge>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(vesselType)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(vesselType.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{vesselType.description}</p>
                      {vesselType.createdAt && (
                        <p className="text-xs text-gray-400">
                          Added {new Date(vesselType.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VesselTypeManagement;