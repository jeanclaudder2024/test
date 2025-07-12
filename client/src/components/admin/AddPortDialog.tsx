import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, MapPin, Navigation, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom port marker icon
const portIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'port-marker'
});

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

// Map click handler component
function LocationSelector({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export function AddPortDialog() {
  const [open, setOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.2854, 51.5310]); // Default to Qatar
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [showDepthCircle, setShowDepthCircle] = useState(false);
  const [portRadius, setPortRadius] = useState(10); // km
  const [mapStyle, setMapStyle] = useState('street');
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

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    form.setValue('lat', lat.toFixed(6));
    form.setValue('lng', lng.toFixed(6));
    toast({
      title: 'Location Selected',
      description: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
  };

  const searchForLocation = async () => {
    if (!searchLocation.trim()) return;
    
    try {
      // Using Nominatim (OpenStreetMap) free geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        setSelectedPosition(newCenter);
        form.setValue('lat', parseFloat(lat).toFixed(6));
        form.setValue('lng', parseFloat(lon).toFixed(6));
        toast({
          title: 'Location Found',
          description: `Found: ${data[0].display_name}`,
        });
      } else {
        toast({
          title: 'Location Not Found',
          description: 'Try searching for a city, country, or landmark',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Search Error',
        description: 'Unable to search for location',
        variant: 'destructive',
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter([lat, lng]);
          setSelectedPosition([lat, lng]);
          form.setValue('lat', lat.toFixed(6));
          form.setValue('lng', lng.toFixed(6));
          toast({
            title: 'Current Location',
            description: `Using your current location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Unable to get your current location',
            variant: 'destructive',
          });
        }
      );
    }
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add New Port with Map Selection
          </DialogTitle>
          <DialogDescription>
            Create a new port entry by filling in the details and selecting the location on the interactive map
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="text-sm"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Use Current Location
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className="text-sm"
                >
                  <Map className="h-4 w-4 mr-2" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillSampleData}
                  className="text-sm"
                >
                  Fill Sample Data
                </Button>
              </div>
            </div>

            {showMap && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Advanced Map Tools - Click to Select Location
                </h3>
                
                {/* Map Controls */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Location Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Search Location</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search city, port, or landmark..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchForLocation()}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={searchForLocation}
                      >
                        Search
                      </Button>
                    </div>
                  </div>

                  {/* Map Style Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Map Style</label>
                    <Select value={mapStyle} onValueChange={setMapStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="street">Street Map</SelectItem>
                        <SelectItem value="satellite">Satellite</SelectItem>
                        <SelectItem value="terrain">Terrain</SelectItem>
                        <SelectItem value="maritime">Maritime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Port Radius Controls */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Port Radius (km)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={portRadius}
                        onChange={(e) => setPortRadius(Number(e.target.value))}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDepthCircle(!showDepthCircle)}
                      >
                        {showDepthCircle ? 'Hide' : 'Show'} Area
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="h-[500px] w-full rounded-lg overflow-hidden border">
                      <MapContainer
                        center={mapCenter}
                        zoom={6}
                        style={{ height: '100%', width: '100%' }}
                        key={`${mapCenter[0]}-${mapCenter[1]}`}
                      >
                        <LayersControl position="topright">
                          <LayersControl.BaseLayer checked={mapStyle === 'street'} name="Street Map">
                            <TileLayer
                              attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                          </LayersControl.BaseLayer>
                          
                          <LayersControl.BaseLayer checked={mapStyle === 'satellite'} name="Satellite">
                            <TileLayer
                              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                          </LayersControl.BaseLayer>
                          
                          <LayersControl.BaseLayer checked={mapStyle === 'terrain'} name="Terrain">
                            <TileLayer
                              attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
                            />
                          </LayersControl.BaseLayer>
                          
                          <LayersControl.BaseLayer checked={mapStyle === 'maritime'} name="Maritime">
                            <TileLayer
                              attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                            />
                          </LayersControl.BaseLayer>
                        </LayersControl>

                        <LocationSelector onLocationSelect={handleLocationSelect} />
                        
                        {selectedPosition && (
                          <>
                            <Marker position={selectedPosition} icon={portIcon}>
                              <Popup>
                                <div className="text-center">
                                  <strong>Selected Port Location</strong><br />
                                  Lat: {selectedPosition[0].toFixed(6)}<br />
                                  Lng: {selectedPosition[1].toFixed(6)}<br />
                                  <small>Click elsewhere to change</small>
                                </div>
                              </Popup>
                            </Marker>
                            
                            {showDepthCircle && (
                              <Circle
                                center={selectedPosition}
                                radius={portRadius * 1000} // Convert km to meters
                                pathOptions={{
                                  color: 'blue',
                                  fillColor: 'lightblue',
                                  fillOpacity: 0.3,
                                  weight: 2
                                }}
                              >
                                <Popup>
                                  Port operational area: {portRadius} km radius
                                </Popup>
                              </Circle>
                            )}
                          </>
                        )}
                      </MapContainer>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* Coordinate Display */}
                    <div className="grid grid-cols-1 gap-3">
                      <FormField
                        control={form.control}
                        name="lat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Click map to select" 
                                {...field}
                                readOnly
                                className="bg-gray-50"
                              />
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
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Click map to select" 
                                {...field}
                                readOnly
                                className="bg-gray-50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Quick Location Buttons */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Quick Locations</label>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMapCenter([25.2854, 51.5310]); // Qatar
                            setSelectedPosition([25.2854, 51.5310]);
                            form.setValue('lat', '25.285400');
                            form.setValue('lng', '51.531000');
                          }}
                        >
                          Qatar Ports
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMapCenter([26.2041, 50.0933]); // Bahrain
                            setSelectedPosition([26.2041, 50.0933]);
                            form.setValue('lat', '26.204100');
                            form.setValue('lng', '50.093300');
                          }}
                        >
                          Bahrain Ports
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMapCenter([24.4539, 54.3773]); // UAE
                            setSelectedPosition([24.4539, 54.3773]);
                            form.setValue('lat', '24.453900');
                            form.setValue('lng', '54.377300');
                          }}
                        >
                          UAE Ports
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMapCenter([29.3117, 47.4818]); // Kuwait
                            setSelectedPosition([29.3117, 47.4818]);
                            form.setValue('lat', '29.311700');
                            form.setValue('lng', '47.481800');
                          }}
                        >
                          Kuwait Ports
                        </Button>
                      </div>
                    </div>

                    {/* Selected Location Info */}
                    {selectedPosition && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>Selected Location:</strong><br />
                          Lat: {selectedPosition[0].toFixed(6)}<br />
                          Lng: {selectedPosition[1].toFixed(6)}<br />
                          {showDepthCircle && (
                            <>Operational Radius: {portRadius} km</>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Map Features Info */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Map Features:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Click map to select coordinates</li>
                        <li>• Search for locations by name</li>
                        <li>• Switch between map styles</li>
                        <li>• Show port operational area</li>
                        <li>• Use layer controls (top-right)</li>
                        <li>• Zoom and pan for precision</li>
                      </ul>
                    </div>

                    {/* Distance Calculator */}
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-2">Distance Info:</h4>
                      {selectedPosition && (
                        <div className="text-sm text-yellow-800 space-y-1">
                          <p>From Qatar (Doha):</p>
                          <p>~{Math.round(
                            Math.sqrt(
                              Math.pow((selectedPosition[0] - 25.2854) * 111.32, 2) +
                              Math.pow((selectedPosition[1] - 51.5310) * 111.32 * Math.cos(selectedPosition[0] * Math.PI / 180), 2)
                            )
                          )} km</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="details">Port Details</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
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
                </div>
              </TabsContent>


            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
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