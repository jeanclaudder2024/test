import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Save, 
  Edit3, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Anchor, 
  Settings, 
  Clock, 
  Gauge,
  Truck,
  Ship,
  Fuel,
  Trash2,
  Calendar,
  FileText,
  X
} from "lucide-react";

// Form validation schema
const portFormSchema = z.object({
  name: z.string().min(1, "Port name is required"),
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  type: z.string().min(1, "Port type is required"),
  status: z.string().min(1, "Status is required"),
  lat: z.string().min(1, "Latitude is required"),
  lng: z.string().min(1, "Longitude is required"),
  capacity: z.string().optional(),
  description: z.string().optional(),
  
  // Contact Information
  portAuthority: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  
  // Technical Specifications
  maxVesselLength: z.string().optional(),
  maxVesselBeam: z.string().optional(),
  maxDraught: z.string().optional(),
  berthCount: z.string().optional(),
  
  // Operations
  operatingHours: z.string().optional(),
  timezone: z.string().optional(),
  pilotageRequired: z.boolean().optional(),
  tugAssistance: z.boolean().optional(),
  
  // Additional Features
  wasteReception: z.boolean().optional(),
  bunkeringAvailable: z.boolean().optional(),
  storageCapacity: z.string().optional(),
  craneCapacity: z.string().optional(),
  iceClass: z.string().optional(),
  yearEstablished: z.string().optional(),
  notes: z.string().optional(),
});

type PortFormData = z.infer<typeof portFormSchema>;

interface PortDetailFormProps {
  port: any;
  onCancel: () => void;
}

export function PortDetailForm({ port, onCancel }: PortDetailFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");

  // Initialize form with port data
  const form = useForm<PortFormData>({
    resolver: zodResolver(portFormSchema),
    defaultValues: {
      name: port.name || "",
      country: port.country || "",
      region: port.region || "",
      type: port.type || "commercial",
      status: port.status || "active",
      lat: port.lat || "",
      lng: port.lng || "",
      capacity: port.capacity?.toString() || "",
      description: port.description || "",
      portAuthority: port.portAuthority || "",
      email: port.email || "",
      phone: port.phone || "",
      website: port.website || "",
      address: port.address || "",
      maxVesselLength: port.maxVesselLength || "",
      maxVesselBeam: port.maxVesselBeam || "",
      maxDraught: port.maxDraught || "",
      berthCount: port.berthCount || "",
      operatingHours: port.operatingHours || "",
      timezone: port.timezone || "",
      pilotageRequired: port.pilotageRequired || false,
      tugAssistance: port.tugAssistance || false,
      wasteReception: port.wasteReception || false,
      bunkeringAvailable: port.bunkeringAvailable || false,
      storageCapacity: port.storageCapacity || "",
      craneCapacity: port.craneCapacity || "",
      iceClass: port.iceClass || "",
      yearEstablished: port.yearEstablished || "",
      notes: port.notes || "",
    },
  });

  // Update port mutation
  const updatePortMutation = useMutation({
    mutationFn: (data: PortFormData) => 
      apiRequest(`/api/ports/${port.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ports'] });
      toast({
        title: "Success",
        description: "Port details updated successfully",
      });
      onCancel();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update port details",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PortFormData) => {
    updatePortMutation.mutate(data);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Edit3 className="h-5 w-5 mr-2 text-primary" />
              Edit Port Details
            </CardTitle>
            <CardDescription>
              Update comprehensive port information and specifications
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="text-xs">
                  <Anchor className="h-4 w-4 mr-1" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs">
                  <Phone className="h-4 w-4 mr-1" />
                  Contact
                </TabsTrigger>
                <TabsTrigger value="technical" className="text-xs">
                  <Settings className="h-4 w-4 mr-1" />
                  Technical
                </TabsTrigger>
                <TabsTrigger value="operations" className="text-xs">
                  <Clock className="h-4 w-4 mr-1" />
                  Operations
                </TabsTrigger>
                <TabsTrigger value="additional" className="text-xs">
                  <FileText className="h-4 w-4 mr-1" />
                  Additional
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter port name" {...field} />
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
                          <Input placeholder="Enter country" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Europe">Europe</SelectItem>
                            <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                            <SelectItem value="North America">North America</SelectItem>
                            <SelectItem value="Latin America">Latin America</SelectItem>
                            <SelectItem value="Middle East">Middle East</SelectItem>
                            <SelectItem value="Africa">Africa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select port type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="oil">Oil Terminal</SelectItem>
                            <SelectItem value="container">Container Port</SelectItem>
                            <SelectItem value="bulk">Bulk Cargo</SelectItem>
                            <SelectItem value="fishing">Fishing Port</SelectItem>
                            <SelectItem value="military">Military</SelectItem>
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
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="operational">Operational</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="construction">Under Construction</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
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
                        <FormLabel>Capacity (TEU/year)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 15000000" {...field} />
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
                          <Input type="number" step="any" placeholder="e.g., 51.505" {...field} />
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
                          <Input type="number" step="any" placeholder="e.g., -0.09" {...field} />
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
                          placeholder="Enter port description..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Contact Information Tab */}
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="portAuthority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port Authority</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Rotterdam Port Authority" {...field} />
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
                          <Input placeholder="+31-10-252-1010" {...field} />
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
                          <Input type="url" placeholder="https://www.port.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Full postal address..." 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Technical Specifications Tab */}
              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxVesselLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Vessel Length (m)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 400" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxVesselBeam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Vessel Beam (m)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 59" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxDraught"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Draught (m)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 16.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="berthCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Berths</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storageCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Capacity (m³)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 180000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="craneCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crane Capacity (tonnes)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 85" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="iceClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ice Class</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ice class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="IA">IA</SelectItem>
                            <SelectItem value="IB">IB</SelectItem>
                            <SelectItem value="IC">IC</SelectItem>
                            <SelectItem value="II">II</SelectItem>
                            <SelectItem value="III">III</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearEstablished"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Established</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1960" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Operations Tab */}
              <TabsContent value="operations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., UTC+1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="pilotageRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Pilotage Required</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Mandatory pilotage service
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tugAssistance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Tug Assistance</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Tugboat assistance available
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Additional Features Tab */}
              <TabsContent value="additional" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="wasteReception"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Waste Reception</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Waste disposal facilities
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bunkeringAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Bunkering Available</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Fuel supply services
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional operational notes or special requirements..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updatePortMutation.isPending}
                className="min-w-[120px]"
              >
                {updatePortMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}