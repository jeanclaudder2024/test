import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ship, Bot, Zap, MapPin, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const vesselGenerationSchema = z.object({
  portId: z.string().min(1, 'Port selection is required'),
  vesselCount: z.number().min(1).max(50),
  radiusKm: z.number().min(5).max(200),
  vesselTypes: z.array(z.string()).optional(),
});

type VesselGenerationFormData = z.infer<typeof vesselGenerationSchema>;

const VESSEL_TYPES = [
  'Crude Oil Tanker',
  'Product Tanker',
  'LNG Carrier',
  'Chemical Tanker',
  'LPG Carrier'
];

export function VesselGeneratorDialog() {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VesselGenerationFormData>({
    resolver: zodResolver(vesselGenerationSchema),
    defaultValues: {
      vesselCount: 10,
      radiusKm: 50,
      vesselTypes: [],
    },
  });

  // Fetch available ports
  const { data: ports = [] } = useQuery({
    queryKey: ['/api/admin/ports'],
    enabled: true
  });

  // Generate vessels around specific port
  const generateVesselsMutation = useMutation({
    mutationFn: async (data: VesselGenerationFormData) => {
      return apiRequest('/api/admin/generate-vessels-around-port', {
        method: 'POST',
        body: JSON.stringify({
          portId: data.portId,
          vesselCount: data.vesselCount,
          radiusKm: data.radiusKm,
          vesselTypes: data.vesselTypes,
        }),
      });
    },
    onSuccess: (response) => {
      toast({
        title: 'Vessels Generated Successfully',
        description: `Generated ${response.vesselsGenerated} vessels using ML algorithms`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vessels'] });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // Generate vessels around all ports
  const generateAllPortsMutation = useMutation({
    mutationFn: async (vesselsPerPort: number) => {
      return apiRequest('/api/admin/generate-vessels-all-ports', {
        method: 'POST',
        body: JSON.stringify({ vesselsPerPort }),
      });
    },
    onSuccess: (response) => {
      toast({
        title: 'Bulk Generation Complete',
        description: `Generated ${response.totalGenerated} vessels across all ports`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vessels'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bulk Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Clean up generated vessels
  const cleanupVesselsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/cleanup-generated-vessels', {
        method: 'DELETE',
      });
    },
    onSuccess: (response) => {
      toast({
        title: 'Cleanup Complete',
        description: `Removed ${response.deletedCount} generated vessels`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vessels'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cleanup Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: VesselGenerationFormData) => {
    setIsGenerating(true);
    generateVesselsMutation.mutate(data);
  };

  const handleBulkGenerate = () => {
    generateAllPortsMutation.mutate(5);
  };

  const handleCleanup = () => {
    cleanupVesselsMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          ML Vessel Generator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            AI-Powered Vessel Generation System
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-blue-500" />
                Machine Learning Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Smart Positioning</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Realistic vessel distribution patterns</li>
                    <li>• Port proximity-based positioning</li>
                    <li>• Shipping lane considerations</li>
                    <li>• Anchor zone placement</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Vessel Characteristics</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Industry-standard vessel types</li>
                    <li>• Realistic cargo specifications</li>
                    <li>• Authentic flag state distribution</li>
                    <li>• Dynamic speed and course data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="portId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Port *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a port" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(ports as any[]).map((port: any) => (
                            <SelectItem key={port.id} value={port.id.toString()}>
                              {port.name} - {port.country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vesselCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Vessels</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="radiusKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generation Radius (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="5"
                          max="200"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vessel Type Selection */}
              <FormField
                control={form.control}
                name="vesselTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Vessel Types (Optional)</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {VESSEL_TYPES.map((type) => (
                        <FormField
                          key={type}
                          control={form.control}
                          name="vesselTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={type}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(type)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), type])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== type
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {type}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBulkGenerate}
                    disabled={generateAllPortsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Generate All Ports
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCleanup}
                    disabled={cleanupVesselsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Cleanup Generated
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    Generate Vessels
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              ML-Powered
            </Badge>
            <Badge variant="outline">Realistic Positioning</Badge>
            <Badge variant="outline">No API Required</Badge>
            <Badge variant="outline">Industry Standards</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}