import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simple schema for port creation
const addPortSchema = z.object({
  name: z.string().min(1, 'Port name is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  lat: z.string().min(1, 'Latitude is required'),
  lng: z.string().min(1, 'Longitude is required'),
  city: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  capacity: z.string().optional(),
  operatingHours: z.string().optional(),
  portAuthority: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
});

type AddPortFormData = z.infer<typeof addPortSchema>;

export function AddPortDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddPortFormData>({
    resolver: zodResolver(addPortSchema),
    defaultValues: {
      name: '',
      country: '',
      region: '',
      lat: '',
      lng: '',
      city: '',
      type: 'commercial',
      status: 'operational',
      description: '',
      capacity: '',
      operatingHours: '',
      portAuthority: '',
      email: '',
      phone: '',
      website: '',
    },
  });

  const addPortMutation = useMutation({
    mutationFn: async (data: AddPortFormData) => {
      // Convert data to proper types
      const portData = {
        ...data,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        lat: data.lat,
        lng: data.lng,
      };

      const response = await fetch('/api/admin/ports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create port');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/port-stats'] });
      toast({
        title: 'Success',
        description: 'Port has been created successfully.',
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create port. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AddPortFormData) => {
    addPortMutation.mutate(data);
  };

  const fillSampleData = () => {
    form.setValue('name', 'Port of Barcelona');
    form.setValue('country', 'Spain');
    form.setValue('region', 'Europe');
    form.setValue('city', 'Barcelona');
    form.setValue('lat', '41.3851');
    form.setValue('lng', '2.1734');
    form.setValue('type', 'commercial');
    form.setValue('status', 'operational');
    form.setValue('description', 'Major Mediterranean port serving cargo and cruise ships');
    form.setValue('capacity', '3000000');
    form.setValue('operatingHours', '24/7');
    form.setValue('portAuthority', 'Port Authority of Barcelona');
    form.setValue('email', 'info@portdebarcelona.cat');
    form.setValue('phone', '+34 93 306 88 00');
    form.setValue('website', 'https://www.portdebarcelona.cat');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Port
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Port</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={fillSampleData}
                className="text-sm"
              >
                Fill Sample Data
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Port of Rotterdam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Netherlands" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Europe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rotterdam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 51.9244" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 4.4777" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select port type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="oil_terminal">Oil Terminal</SelectItem>
                        <SelectItem value="container">Container</SelectItem>
                        <SelectItem value="bulk">Bulk</SelectItem>
                        <SelectItem value="fishing">Fishing</SelectItem>
                        <SelectItem value="naval">Naval</SelectItem>
                        <SelectItem value="cruise">Cruise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="under_construction">Under Construction</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (TEU/day)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operatingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 24/7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portAuthority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port Authority</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Port Authority of Rotterdam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="info@port.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+31 10 252 1010" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.port.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the port's capabilities, services, and facilities..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addPortMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {addPortMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Create Port
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}