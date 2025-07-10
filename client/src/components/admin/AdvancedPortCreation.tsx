import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Building2, Phone, Globe, Anchor, Truck, Factory } from 'lucide-react';
import MapSelector from './MapSelector';

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
  [key: string]: any; // For additional port fields
}

interface AdvancedPortCreationProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPort?: Port | null;
}

export default function AdvancedPortCreation({ open, onClose, onSuccess, editingPort }: AdvancedPortCreationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Comprehensive form state matching database schema
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    country: '',
    region: 'Asia-Pacific',
    city: '',
    timezone: '',
    
    // Geographic Coordinates
    lat: '25.2048',
    lng: '55.2708',
    
    // Port Classification
    type: 'commercial',
    status: 'operational',
    
    // Operational Information
    capacity: '',
    annualThroughput: '',
    operatingHours: '24/7',
    description: '',
    
    // Port Authority & Management
    portAuthority: '',
    operator: '',
    owner: '',
    
    // Contact Information
    email: '',
    phone: '',
    website: '',
    address: '',
    postalCode: '',
    
    // Technical Specifications
    maxVesselLength: '',
    maxVesselBeam: '',
    maxDraught: '',
    channelDepth: '',
    berthCount: '',
    totalBerthLength: '',
    
    // Safety & Security
    securityLevel: 'ISPS Level 1',
    pilotageRequired: false,
    tugAssistance: false,
    customsFacilities: true,
    quarantineFacilities: false,
    safetyRecord: 'Excellent',
    
    // Infrastructure & Connectivity
    railConnections: false,
    roadConnections: true,
    airportDistance: '',
    warehouseArea: '',
    storageCapacity: '',
    
    // Weather & Conditions
    averageWaitTime: '',
    weatherRestrictions: '',
    tidalRange: '',
    
    // Economic Information
    portCharges: '',
    currency: 'USD',
    
    // Statistics
    connectedRefineries: '0',
    nearbyPorts: '',
    
    // Metadata
    established: '',
    photo: ''
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (editingPort) {
      setFormData({
        name: editingPort.name || '',
        country: editingPort.country || '',
        region: editingPort.region || 'Asia-Pacific',
        city: editingPort.city || '',
        timezone: editingPort.timezone || '',
        lat: editingPort.lat || '25.2048',
        lng: editingPort.lng || '55.2708',
        type: editingPort.type || 'commercial',
        status: editingPort.status || 'operational',
        capacity: editingPort.capacity?.toString() || '',
        annualThroughput: editingPort.annualThroughput?.toString() || '',
        operatingHours: editingPort.operatingHours || '24/7',
        description: editingPort.description || '',
        portAuthority: editingPort.portAuthority || '',
        operator: editingPort.operator || '',
        owner: editingPort.owner || '',
        email: editingPort.email || '',
        phone: editingPort.phone || '',
        website: editingPort.website || '',
        address: editingPort.address || '',
        postalCode: editingPort.postalCode || '',
        maxVesselLength: editingPort.maxVesselLength?.toString() || '',
        maxVesselBeam: editingPort.maxVesselBeam?.toString() || '',
        maxDraught: editingPort.maxDraught?.toString() || '',
        channelDepth: editingPort.channelDepth?.toString() || '',
        berthCount: editingPort.berthCount?.toString() || '',
        totalBerthLength: editingPort.totalBerthLength?.toString() || '',
        securityLevel: editingPort.securityLevel || 'ISPS Level 1',
        pilotageRequired: editingPort.pilotageRequired || false,
        tugAssistance: editingPort.tugAssistance || false,
        customsFacilities: editingPort.customsFacilities || true,
        quarantineFacilities: editingPort.quarantineFacilities || false,
        safetyRecord: editingPort.safetyRecord || 'Excellent',
        railConnections: editingPort.railConnections || false,
        roadConnections: editingPort.roadConnections || true,
        airportDistance: editingPort.airportDistance?.toString() || '',
        warehouseArea: editingPort.warehouseArea?.toString() || '',
        storageCapacity: editingPort.storageCapacity?.toString() || '',
        averageWaitTime: editingPort.averageWaitTime?.toString() || '',
        weatherRestrictions: editingPort.weatherRestrictions || '',
        tidalRange: editingPort.tidalRange?.toString() || '',
        portCharges: editingPort.portCharges || '',
        currency: editingPort.currency || 'USD',
        connectedRefineries: editingPort.connectedRefineries?.toString() || '0',
        nearbyPorts: editingPort.nearbyPorts || '',
        established: editingPort.established || '',
        photo: editingPort.photo || ''
      });
    } else {
      // Reset form for new port creation
      setFormData({
        name: '',
        country: '',
        region: 'Asia-Pacific',
        city: '',
        timezone: '',
        lat: '25.2048',
        lng: '55.2708',
        type: 'commercial',
        status: 'operational',
        capacity: '',
        annualThroughput: '',
        operatingHours: '24/7',
        description: '',
        portAuthority: '',
        operator: '',
        owner: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        postalCode: '',
        maxVesselLength: '',
        maxVesselBeam: '',
        maxDraught: '',
        channelDepth: '',
        berthCount: '',
        totalBerthLength: '',
        securityLevel: 'ISPS Level 1',
        pilotageRequired: false,
        tugAssistance: false,
        customsFacilities: true,
        quarantineFacilities: false,
        safetyRecord: 'Excellent',
        railConnections: false,
        roadConnections: true,
        airportDistance: '',
        warehouseArea: '',
        storageCapacity: '',
        averageWaitTime: '',
        weatherRestrictions: '',
        tidalRange: '',
        portCharges: '',
        currency: 'USD',
        connectedRefineries: '0',
        nearbyPorts: '',
        established: '',
        photo: ''
      });
    }
  }, [editingPort]);

  const regions = [
    'Asia-Pacific', 'Europe', 'North America', 'Latin America', 'Middle East', 'Africa'
  ];

  const portTypes = [
    'commercial', 'oil_terminal', 'container', 'bulk', 'fishing', 'naval', 'cruise', 'industrial'
  ];

  const portStatuses = [
    'operational', 'maintenance', 'limited', 'closed', 'under_construction'
  ];

  const securityLevels = [
    'ISPS Level 1', 'ISPS Level 2', 'ISPS Level 3'
  ];

  const safetyRecords = [
    'Excellent', 'Good', 'Average', 'Poor'
  ];

  const currencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AED', 'SAR', 'KWD'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.country || !formData.lat || !formData.lng) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log(editingPort ? 'Updating' : 'Creating', 'comprehensive port data:', formData);
      
      const token = localStorage.getItem('authToken');
      let response;
      
      if (editingPort) {
        // Try admin endpoint first for updates, then fallback to public endpoint
        try {
          response = await fetch(`/api/admin/ports/${editingPort.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { "Authorization": `Bearer ${token}` }),
            },
            body: JSON.stringify(formData)
          });
          
          if (!response.ok) {
            // Fallback to public endpoint
            console.log('Admin update endpoint failed, trying public endpoint...');
            response = await fetch(`/api/ports/${editingPort.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
          }
        } catch (error) {
          // Final fallback to public endpoint
          console.log('Using public endpoint for port update');
          response = await fetch(`/api/ports/${editingPort.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
        }
      } else {
        // Try admin endpoint first for creation, then fallback to public endpoint
        try {
          response = await fetch('/api/admin/ports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { "Authorization": `Bearer ${token}` }),
            },
            body: JSON.stringify(formData)
          });
          
          if (!response.ok) {
            // Fallback to public endpoint
            console.log('Admin create endpoint failed, trying public endpoint...');
            response = await fetch('/api/ports', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
          }
        } catch (error) {
          // Final fallback to public endpoint
          console.log('Using public endpoint for port creation');
          response = await fetch('/api/ports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
        }
      }

      console.log(`Response status: ${response.status}`);
      
      const result = await response.json();
      console.log('Response data:', result);
      
      if (!response.ok) {
        console.error('Port operation failed:', result);
        throw new Error(result.message || `Failed to ${editingPort ? 'update' : 'create'} port`);
      }

      toast({
        title: "Success",
        description: `Advanced port ${editingPort ? 'updated' : 'created'} successfully with all details`
      });
      
      // Reset form
      setFormData({
        name: '', country: '', region: 'Asia-Pacific', city: '', timezone: '',
        lat: '25.2048', lng: '55.2708', type: 'commercial', status: 'operational',
        capacity: '', annualThroughput: '', operatingHours: '24/7', description: '',
        portAuthority: '', operator: '', owner: '', email: '', phone: '', website: '',
        address: '', postalCode: '', maxVesselLength: '', maxVesselBeam: '', maxDraught: '',
        channelDepth: '', berthCount: '', totalBerthLength: '', securityLevel: 'ISPS Level 1',
        pilotageRequired: false, tugAssistance: false, customsFacilities: true,
        quarantineFacilities: false, safetyRecord: 'Excellent', railConnections: false,
        roadConnections: true, airportDistance: '', warehouseArea: '', storageCapacity: '',
        averageWaitTime: '', weatherRestrictions: '', tidalRange: '', portCharges: '',
        currency: 'USD', connectedRefineries: '0', nearbyPorts: '', established: '', photo: ''
      });
      
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Port creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create port",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            {editingPort ? 'Edit Port' : 'Create Advanced Port'}
          </DialogTitle>
          <DialogDescription>
            {editingPort ? 'Update port information with comprehensive maritime data' : 'Create a new port with detailed specifications and operational parameters'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
              <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              <TabsTrigger value="economic">Economic</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Port Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter port name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="Enter country"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select value={formData.region} onValueChange={(value) => updateField('region', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>

              </div>

              {/* Interactive Map Selector */}
              <MapSelector
                lat={formData.lat}
                lng={formData.lng}
                onCoordinatesChange={(lat, lng) => {
                  updateField('lat', lat);
                  updateField('lng', lng);
                }}
                className="col-span-full mt-4"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude *</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.000001"
                    value={formData.lat}
                    onChange={(e) => updateField('lat', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude *</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.000001"
                    value={formData.lng}
                    onChange={(e) => updateField('lng', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Port Type</Label>
                  <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {portTypes.map(type => (
                        <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {portStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter port description"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Technical Specifications Tab */}
            <TabsContent value="technical" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Technical Specifications</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (TEU/day)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => updateField('capacity', e.target.value)}
                    placeholder="Daily handling capacity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualThroughput">Annual Throughput (TEU)</Label>
                  <Input
                    id="annualThroughput"
                    type="number"
                    value={formData.annualThroughput}
                    onChange={(e) => updateField('annualThroughput', e.target.value)}
                    placeholder="Annual cargo throughput"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxVesselLength">Max Vessel Length (m)</Label>
                  <Input
                    id="maxVesselLength"
                    type="number"
                    step="0.01"
                    value={formData.maxVesselLength}
                    onChange={(e) => updateField('maxVesselLength', e.target.value)}
                    placeholder="Maximum vessel length"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxVesselBeam">Max Vessel Beam (m)</Label>
                  <Input
                    id="maxVesselBeam"
                    type="number"
                    step="0.01"
                    value={formData.maxVesselBeam}
                    onChange={(e) => updateField('maxVesselBeam', e.target.value)}
                    placeholder="Maximum vessel beam"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDraught">Max Draught (m)</Label>
                  <Input
                    id="maxDraught"
                    type="number"
                    step="0.01"
                    value={formData.maxDraught}
                    onChange={(e) => updateField('maxDraught', e.target.value)}
                    placeholder="Maximum draught"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channelDepth">Channel Depth (m)</Label>
                  <Input
                    id="channelDepth"
                    type="number"
                    step="0.01"
                    value={formData.channelDepth}
                    onChange={(e) => updateField('channelDepth', e.target.value)}
                    placeholder="Channel depth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="berthCount">Berth Count</Label>
                  <Input
                    id="berthCount"
                    type="number"
                    value={formData.berthCount}
                    onChange={(e) => updateField('berthCount', e.target.value)}
                    placeholder="Number of berths"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalBerthLength">Total Berth Length (m)</Label>
                  <Input
                    id="totalBerthLength"
                    type="number"
                    step="0.01"
                    value={formData.totalBerthLength}
                    onChange={(e) => updateField('totalBerthLength', e.target.value)}
                    placeholder="Total berth length"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <Input
                    id="operatingHours"
                    value={formData.operatingHours}
                    onChange={(e) => updateField('operatingHours', e.target.value)}
                    placeholder="e.g., 24/7 or 06:00-22:00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    placeholder="e.g., GMT+4"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Contact & Management</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portAuthority">Port Authority</Label>
                  <Input
                    id="portAuthority"
                    value={formData.portAuthority}
                    onChange={(e) => updateField('portAuthority', e.target.value)}
                    placeholder="Port authority name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operator">Operator</Label>
                  <Input
                    id="operator"
                    value={formData.operator}
                    onChange={(e) => updateField('operator', e.target.value)}
                    placeholder="Port operator"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => updateField('owner', e.target.value)}
                    placeholder="Port owner"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="contact@port.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+1-234-567-8900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://www.port.com"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Full address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    placeholder="Postal code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="established">Year Established</Label>
                  <Input
                    id="established"
                    type="number"
                    value={formData.established}
                    onChange={(e) => updateField('established', e.target.value)}
                    placeholder="1995"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Safety & Security Tab */}
            <TabsContent value="safety" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Safety & Security</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="securityLevel">Security Level</Label>
                  <Select value={formData.securityLevel} onValueChange={(value) => updateField('securityLevel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {securityLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="safetyRecord">Safety Record</Label>
                  <Select value={formData.safetyRecord} onValueChange={(value) => updateField('safetyRecord', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {safetyRecords.map(record => (
                        <SelectItem key={record} value={record}>{record}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="pilotageRequired"
                    checked={formData.pilotageRequired}
                    onCheckedChange={(checked) => updateField('pilotageRequired', checked)}
                  />
                  <Label htmlFor="pilotageRequired">Pilotage Required</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="tugAssistance"
                    checked={formData.tugAssistance}
                    onCheckedChange={(checked) => updateField('tugAssistance', checked)}
                  />
                  <Label htmlFor="tugAssistance">Tug Assistance Available</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="customsFacilities"
                    checked={formData.customsFacilities}
                    onCheckedChange={(checked) => updateField('customsFacilities', checked)}
                  />
                  <Label htmlFor="customsFacilities">Customs Facilities</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="quarantineFacilities"
                    checked={formData.quarantineFacilities}
                    onCheckedChange={(checked) => updateField('quarantineFacilities', checked)}
                  />
                  <Label htmlFor="quarantineFacilities">Quarantine Facilities</Label>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="weatherRestrictions">Weather Restrictions</Label>
                  <Textarea
                    id="weatherRestrictions"
                    value={formData.weatherRestrictions}
                    onChange={(e) => updateField('weatherRestrictions', e.target.value)}
                    placeholder="Describe weather-related operational restrictions"
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Infrastructure Tab */}
            <TabsContent value="infrastructure" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Infrastructure & Connectivity</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="railConnections"
                    checked={formData.railConnections}
                    onCheckedChange={(checked) => updateField('railConnections', checked)}
                  />
                  <Label htmlFor="railConnections">Rail Connections</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="roadConnections"
                    checked={formData.roadConnections}
                    onCheckedChange={(checked) => updateField('roadConnections', checked)}
                  />
                  <Label htmlFor="roadConnections">Road Connections</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="airportDistance">Airport Distance (km)</Label>
                  <Input
                    id="airportDistance"
                    type="number"
                    step="0.1"
                    value={formData.airportDistance}
                    onChange={(e) => updateField('airportDistance', e.target.value)}
                    placeholder="Distance to nearest airport"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouseArea">Warehouse Area (m²)</Label>
                  <Input
                    id="warehouseArea"
                    type="number"
                    value={formData.warehouseArea}
                    onChange={(e) => updateField('warehouseArea', e.target.value)}
                    placeholder="Total warehouse area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storageCapacity">Storage Capacity (TEU)</Label>
                  <Input
                    id="storageCapacity"
                    type="number"
                    value={formData.storageCapacity}
                    onChange={(e) => updateField('storageCapacity', e.target.value)}
                    placeholder="Container storage capacity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="averageWaitTime">Average Wait Time (hours)</Label>
                  <Input
                    id="averageWaitTime"
                    type="number"
                    step="0.1"
                    value={formData.averageWaitTime}
                    onChange={(e) => updateField('averageWaitTime', e.target.value)}
                    placeholder="Average vessel wait time"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tidalRange">Tidal Range (m)</Label>
                  <Input
                    id="tidalRange"
                    type="number"
                    step="0.1"
                    value={formData.tidalRange}
                    onChange={(e) => updateField('tidalRange', e.target.value)}
                    placeholder="Tidal range"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="connectedRefineries">Connected Refineries</Label>
                  <Input
                    id="connectedRefineries"
                    type="number"
                    value={formData.connectedRefineries}
                    onChange={(e) => updateField('connectedRefineries', e.target.value)}
                    placeholder="Number of connected refineries"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Economic Information Tab */}
            <TabsContent value="economic" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Factory className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Economic Information</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => updateField('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nearbyPorts">Nearby Ports</Label>
                  <Input
                    id="nearbyPorts"
                    value={formData.nearbyPorts}
                    onChange={(e) => updateField('nearbyPorts', e.target.value)}
                    placeholder="Comma-separated list of nearby port IDs"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="portCharges">Port Charges & Fee Structure</Label>
                  <Textarea
                    id="portCharges"
                    value={formData.portCharges}
                    onChange={(e) => updateField('portCharges', e.target.value)}
                    placeholder="Describe port charges and fee structure"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="photo">Port Photo URL</Label>
                  <Input
                    id="photo"
                    value={formData.photo}
                    onChange={(e) => updateField('photo', e.target.value)}
                    placeholder="https://example.com/port-photo.jpg"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (editingPort ? 'Updating Port...' : 'Creating Advanced Port...')
                : (editingPort ? 'Update Port' : 'Create Advanced Port')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}