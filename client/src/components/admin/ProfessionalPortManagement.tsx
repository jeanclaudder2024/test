import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Ship, Anchor, MapPin, Settings, DollarSign, Shield, 
  Truck, Plane, Train, Building, Phone, Mail, Globe,
  Clock, Gauge, AlertTriangle, CheckCircle, Info,
  Waves, Fuel, Container, Wrench, Users, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced port creation schema with comprehensive fields
const portFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Port name is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Region is required'),
  city: z.string().optional(),
  lat: z.string().min(1, 'Latitude is required').refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -90 && num <= 90;
  }, { message: 'Latitude must be between -90 and 90' }),
  lng: z.string().min(1, 'Longitude is required').refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -180 && num <= 180;
  }, { message: 'Longitude must be between -180 and 180' }),
  timezone: z.string().optional(),
  
  // Port Classification & Status
  type: z.string().min(1, 'Port type is required'),
  status: z.string().min(1, 'Status is required'),
  classification: z.string().optional(),
  
  // Technical Specifications
  capacity: z.number().optional(),
  annualThroughput: z.number().optional(),
  maxVesselLength: z.string().optional(),
  maxVesselBeam: z.string().optional(),
  maxDraught: z.string().optional(),
  channelDepth: z.string().optional(),
  berthCount: z.number().optional(),
  totalBerthLength: z.string().optional(),
  
  // Operations & Management
  portAuthority: z.string().optional(),
  operator: z.string().optional(),
  operatingHours: z.string().optional(),
  pilotageRequired: z.boolean().default(false),
  tugAssistance: z.boolean().default(false),
  
  // Infrastructure & Connectivity
  railConnections: z.boolean().default(false),
  roadConnections: z.boolean().default(false),
  airportDistance: z.string().optional(),
  warehouseArea: z.string().optional(),
  storageCapacity: z.string().optional(),
  
  // Safety & Compliance
  securityLevel: z.string().optional(),
  customsFacilities: z.boolean().default(false),
  quarantineFacilities: z.boolean().default(false),
  safetyRecord: z.string().optional(),
  
  // Services & Financial
  availableServices: z.string().optional(),
  cargoTypes: z.string().optional(),
  currency: z.string().optional(),
  averageHandlingCost: z.string().optional(),
  
  // Contact & Additional Information
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  
  // Advanced Features
  generateDetails: z.boolean().default(false)
});

type PortFormData = z.infer<typeof portFormSchema>;

interface ProfessionalPortManagementProps {
  onClose?: () => void;
  onSuccess?: (port: any) => void;
  editingPort?: any;
  open?: boolean;
}

export default function ProfessionalPortManagement({ 
  onClose, 
  onSuccess, 
  editingPort,
  open = false
}: ProfessionalPortManagementProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PortFormData>({
    resolver: zodResolver(portFormSchema),
    defaultValues: {
      name: editingPort?.name || '',
      country: editingPort?.country || '',
      region: editingPort?.region || '',
      city: editingPort?.city || '',
      lat: editingPort?.lat || '25.0000',
      lng: editingPort?.lng || '55.0000',
      timezone: editingPort?.timezone || '',
      
      type: editingPort?.type || 'Commercial',
      status: editingPort?.status || 'Operational',
      classification: editingPort?.classification || '',
      
      capacity: editingPort?.capacity || undefined,
      annualThroughput: editingPort?.annualThroughput || undefined,
      maxVesselLength: editingPort?.maxVesselLength || '',
      maxVesselBeam: editingPort?.maxVesselBeam || '',
      maxDraught: editingPort?.maxDraught || '',
      channelDepth: editingPort?.channelDepth || '',
      berthCount: editingPort?.berthCount || undefined,
      totalBerthLength: editingPort?.totalBerthLength || '',
      
      portAuthority: editingPort?.portAuthority || '',
      operator: editingPort?.operator || '',
      operatingHours: editingPort?.operatingHours || '24/7',
      pilotageRequired: editingPort?.pilotageRequired || false,
      tugAssistance: editingPort?.tugAssistance || false,
      
      railConnections: editingPort?.railConnections || false,
      roadConnections: editingPort?.roadConnections || true,
      airportDistance: editingPort?.airportDistance || '',
      warehouseArea: editingPort?.warehouseArea || '',
      storageCapacity: editingPort?.storageCapacity || '',
      
      securityLevel: editingPort?.securityLevel || 'ISPS Level 1',
      customsFacilities: editingPort?.customsFacilities || true,
      quarantineFacilities: editingPort?.quarantineFacilities || false,
      safetyRecord: editingPort?.safetyRecord || 'Excellent',
      
      availableServices: editingPort?.availableServices || '',
      cargoTypes: editingPort?.cargoTypes || '',
      currency: editingPort?.currency || 'USD',
      averageHandlingCost: editingPort?.averageHandlingCost || '',
      
      address: editingPort?.address || '',
      email: editingPort?.email || '',
      phone: editingPort?.phone || '',
      website: editingPort?.website || '',
      description: editingPort?.description || '',
      
      generateDetails: false
    }
  });

  const resetForm = () => {
    form.reset({
      name: '',
      country: '',
      region: '',
      city: '',
      lat: '25.0000',
      lng: '55.0000',
      timezone: '',
      type: 'Commercial',
      status: 'Operational',
      classification: '',
      capacity: undefined,
      annualThroughput: undefined,
      maxVesselLength: '',
      maxVesselBeam: '',
      maxDraught: '',
      channelDepth: '',
      berthCount: undefined,
      totalBerthLength: '',
      portAuthority: '',
      operator: '',
      operatingHours: '24/7',
      pilotageRequired: false,
      tugAssistance: false,
      railConnections: false,
      roadConnections: true,
      airportDistance: '',
      warehouseArea: '',
      storageCapacity: '',
      securityLevel: 'ISPS Level 1',
      customsFacilities: true,
      quarantineFacilities: false,
      safetyRecord: 'Excellent',
      availableServices: '',
      cargoTypes: '',
      currency: 'USD',
      averageHandlingCost: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      description: '',
      generateDetails: false
    });
  };

  const onSubmit = async (data: PortFormData) => {
    setIsSubmitting(true);
    try {
      // Debug: Log the data being sent
      console.log('Form data being submitted:', data);
      console.log('Lat value:', data.lat, 'Type:', typeof data.lat);
      console.log('Lng value:', data.lng, 'Type:', typeof data.lng);
      
      const endpoint = editingPort ? `/api/admin/ports/${editingPort.id}` : '/api/admin/ports';
      const method = editingPort ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingPort ? 'update' : 'create'} port`);
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: `Port ${editingPort ? 'updated' : 'created'} successfully`,
      });
      
      if (!editingPort) {
        resetForm();
      }
      
      onSuccess?.(result);
    } catch (error) {
      console.error('Port submission error:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingPort ? 'update' : 'create'} port. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg p-6 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Anchor className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl text-white">
                {editingPort ? 'Edit Port' : 'Create Professional Port'}
              </DialogTitle>
              <DialogDescription className="text-blue-100">
                Comprehensive port management with advanced technical specifications
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="operations" className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Operations
              </TabsTrigger>
              <TabsTrigger value="infrastructure" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Infrastructure
              </TabsTrigger>
              <TabsTrigger value="safety" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Safety
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Services
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Port Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Port of Rotterdam"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    {...form.register('country')}
                    placeholder="Netherlands"
                  />
                  {form.formState.errors.country && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.country.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Select value={form.watch('region')} onValueChange={(value) => form.setValue('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Latin America">Latin America</SelectItem>
                      <SelectItem value="Middle East">Middle East</SelectItem>
                      <SelectItem value="Africa">Africa</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.region && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.region.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...form.register('city')}
                    placeholder="Rotterdam"
                  />
                </div>

                <div>
                  <Label htmlFor="lat">Latitude *</Label>
                  <Input
                    id="lat"
                    {...form.register('lat')}
                    placeholder="51.9225"
                  />
                  {form.formState.errors.lat && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.lat.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lng">Longitude *</Label>
                  <Input
                    id="lng"
                    {...form.register('lng')}
                    placeholder="4.4792"
                  />
                  {form.formState.errors.lng && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.lng.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    {...form.register('timezone')}
                    placeholder="CET"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Port Type *</Label>
                  <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select port type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Container Terminal">Container Terminal</SelectItem>
                      <SelectItem value="Oil Terminal">Oil Terminal</SelectItem>
                      <SelectItem value="LNG Terminal">LNG Terminal</SelectItem>
                      <SelectItem value="Bulk Cargo">Bulk Cargo</SelectItem>
                      <SelectItem value="Ferry Terminal">Ferry Terminal</SelectItem>
                      <SelectItem value="Fishing Port">Fishing Port</SelectItem>
                      <SelectItem value="Naval Base">Naval Base</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.type.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operational">Operational</SelectItem>
                      <SelectItem value="Under Construction">Under Construction</SelectItem>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.status.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Brief description of the port's capabilities and specializations..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Technical Specifications Tab */}
            <TabsContent value="technical" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="capacity">Port Capacity (TEU)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    {...form.register('capacity', { valueAsNumber: true })}
                    placeholder="15000000"
                  />
                </div>

                <div>
                  <Label htmlFor="annualThroughput">Annual Throughput (TEU)</Label>
                  <Input
                    id="annualThroughput"
                    type="number"
                    {...form.register('annualThroughput', { valueAsNumber: true })}
                    placeholder="12000000"
                  />
                </div>

                <div>
                  <Label htmlFor="maxVesselLength">Max Vessel Length (m)</Label>
                  <Input
                    id="maxVesselLength"
                    {...form.register('maxVesselLength')}
                    placeholder="400"
                  />
                </div>

                <div>
                  <Label htmlFor="maxVesselBeam">Max Vessel Beam (m)</Label>
                  <Input
                    id="maxVesselBeam"
                    {...form.register('maxVesselBeam')}
                    placeholder="65"
                  />
                </div>

                <div>
                  <Label htmlFor="maxDraught">Max Draught (m)</Label>
                  <Input
                    id="maxDraught"
                    {...form.register('maxDraught')}
                    placeholder="24"
                  />
                </div>

                <div>
                  <Label htmlFor="channelDepth">Channel Depth (m)</Label>
                  <Input
                    id="channelDepth"
                    {...form.register('channelDepth')}
                    placeholder="25"
                  />
                </div>

                <div>
                  <Label htmlFor="berthCount">Number of Berths</Label>
                  <Input
                    id="berthCount"
                    type="number"
                    {...form.register('berthCount', { valueAsNumber: true })}
                    placeholder="45"
                  />
                </div>

                <div>
                  <Label htmlFor="totalBerthLength">Total Berth Length (m)</Label>
                  <Input
                    id="totalBerthLength"
                    {...form.register('totalBerthLength')}
                    placeholder="15000"
                  />
                </div>

                <div>
                  <Label htmlFor="warehouseArea">Warehouse Area (sqm)</Label>
                  <Input
                    id="warehouseArea"
                    {...form.register('warehouseArea')}
                    placeholder="2500000"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Operations & Management Tab */}
            <TabsContent value="operations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="portAuthority">Port Authority</Label>
                  <Input
                    id="portAuthority"
                    {...form.register('portAuthority')}
                    placeholder="Port of Rotterdam Authority"
                  />
                </div>

                <div>
                  <Label htmlFor="operator">Port Operator</Label>
                  <Input
                    id="operator"
                    {...form.register('operator')}
                    placeholder="Rotterdam World Gateway"
                  />
                </div>

                <div>
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <Input
                    id="operatingHours"
                    {...form.register('operatingHours')}
                    placeholder="24/7"
                  />
                </div>

                <div>
                  <Label htmlFor="storageCapacity">Storage Capacity</Label>
                  <Input
                    id="storageCapacity"
                    {...form.register('storageCapacity')}
                    placeholder="5,000,000 TEU"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Pilotage Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Vessels must use pilot services
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('pilotageRequired')}
                    onCheckedChange={(checked) => form.setValue('pilotageRequired', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Tug Assistance</Label>
                    <p className="text-sm text-muted-foreground">
                      Tugboat assistance available
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('tugAssistance')}
                    onCheckedChange={(checked) => form.setValue('tugAssistance', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Infrastructure & Connectivity Tab */}
            <TabsContent value="infrastructure" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="airportDistance">Airport Distance (km)</Label>
                  <Input
                    id="airportDistance"
                    {...form.register('airportDistance')}
                    placeholder="15"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...form.register('address')}
                    placeholder="Wilhelminakade 909, Rotterdam"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...form.register('website')}
                    placeholder="https://www.portofrotterdam.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Train className="h-4 w-4" />
                      Rail Connections
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Direct rail connectivity available
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('railConnections')}
                    onCheckedChange={(checked) => form.setValue('railConnections', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Road Connections
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Highway and road connectivity
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('roadConnections')}
                    onCheckedChange={(checked) => form.setValue('roadConnections', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Safety & Compliance Tab */}
            <TabsContent value="safety" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="securityLevel">Security Level</Label>
                  <Select value={form.watch('securityLevel')} onValueChange={(value) => form.setValue('securityLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select security level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ISPS Level 1">ISPS Level 1</SelectItem>
                      <SelectItem value="ISPS Level 2">ISPS Level 2</SelectItem>
                      <SelectItem value="ISPS Level 3">ISPS Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="safetyRecord">Safety Record</Label>
                  <Select value={form.watch('safetyRecord')} onValueChange={(value) => form.setValue('safetyRecord', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select safety record" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Average">Average</SelectItem>
                      <SelectItem value="Below Average">Below Average</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Customs Facilities</Label>
                    <p className="text-sm text-muted-foreground">
                      On-site customs and immigration
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('customsFacilities')}
                    onCheckedChange={(checked) => form.setValue('customsFacilities', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Quarantine Facilities</Label>
                    <p className="text-sm text-muted-foreground">
                      Quarantine and health inspection
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('quarantineFacilities')}
                    onCheckedChange={(checked) => form.setValue('quarantineFacilities', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Services & Financial Tab */}
            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={form.watch('currency')} onValueChange={(value) => form.setValue('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="averageHandlingCost">Average Handling Cost</Label>
                  <Input
                    id="averageHandlingCost"
                    {...form.register('averageHandlingCost')}
                    placeholder="$250/TEU"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="info@portofrotterdam.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="+31 10 252 1010"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="availableServices">Available Services</Label>
                <Textarea
                  id="availableServices"
                  {...form.register('availableServices')}
                  placeholder="Container handling, bulk cargo, liquid bulk, bunker services, ship repair..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cargoTypes">Cargo Types Handled</Label>
                <Textarea
                  id="cargoTypes"
                  {...form.register('cargoTypes')}
                  placeholder="Containers, crude oil, petroleum products, chemicals, LNG, coal, iron ore..."
                  rows={2}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="generateDetails"
                checked={form.watch('generateDetails')}
                onCheckedChange={(checked) => form.setValue('generateDetails', checked)}
              />
              <Label htmlFor="generateDetails" className="text-sm">
                Generate AI-enhanced details
              </Label>
            </div>

            <div className="flex gap-2">
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {editingPort ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  editingPort ? 'Update Port' : 'Create Port'
                )}
              </Button>
            </div>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}