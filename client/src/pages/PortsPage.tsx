import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, Filter, Globe, Building, Anchor, Star, Activity, BarChart3, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FlagIcon } from "react-flag-kit";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  type?: string;
  lat: number | string;
  lng: number | string;
  capacity?: number | null;
  description?: string | null;
  status?: string | null;
  lastUpdated?: string;
}

function getCountryCode(country: string): string {
  const countryMap: { [key: string]: string } = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'Saudi Arabia': 'SA',
    'United Arab Emirates': 'AE',
    'South Korea': 'KR',
    'Netherlands': 'NL',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Canada': 'CA',
    'Australia': 'AU',
    'Japan': 'JP',
    'China': 'CN',
    'India': 'IN',
    'Russia': 'RU',
    'Norway': 'NO',
    'Sweden': 'SE',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Belgium': 'BE',
    'Portugal': 'PT',
    'Greece': 'GR',
    'Turkey': 'TR',
    'Egypt': 'EG',
    'Nigeria': 'NG',
    'South Africa': 'ZA',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Peru': 'PE',
    'Colombia': 'CO',
    'Venezuela': 'VE',
    'Iran': 'IR',
    'Iraq': 'IQ',
    'Kuwait': 'KW',
    'Qatar': 'QA',
    'Oman': 'OM',
    'Bahrain': 'BH',
    'Libya': 'LY',
    'Algeria': 'DZ',
    'Morocco': 'MA',
    'Tunisia': 'TN',
    'Angola': 'AO',
    'Ghana': 'GH',
    'Cameroon': 'CM',
    'Gabon': 'GA',
    'Congo': 'CG',
    'Equatorial Guinea': 'GQ',
    'Chad': 'TD',
    'Sudan': 'SD',
    'Ethiopia': 'ET',
    'Kenya': 'KE',
    'Tanzania': 'TZ',
    'Mozambique': 'MZ',
    'Madagascar': 'MG',
    'Mauritius': 'MU',
    'Seychelles': 'SC',
    'Djibouti': 'DJ',
    'Somalia': 'SO',
    'Yemen': 'YE',
    'Jordan': 'JO',
    'Lebanon': 'LB',
    'Syria': 'SY',
    'Cyprus': 'CY',
    'Malta': 'MT',
    'Israel': 'IL',
    'Palestine': 'PS',
    'Pakistan': 'PK',
    'Bangladesh': 'BD',
    'Sri Lanka': 'LK',
    'Myanmar': 'MM',
    'Thailand': 'TH',
    'Vietnam': 'VN',
    'Cambodia': 'KH',
    'Laos': 'LA',
    'Malaysia': 'MY',
    'Singapore': 'SG',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'Brunei': 'BN',
    'Papua New Guinea': 'PG',
    'New Zealand': 'NZ',
    'Fiji': 'FJ',
    'Samoa': 'WS',
    'Tonga': 'TO',
    'Vanuatu': 'VU',
    'Solomon Islands': 'SB',
    'Palau': 'PW',
    'Marshall Islands': 'MH',
    'Kiribati': 'KI',
    'Tuvalu': 'TV',
    'Nauru': 'NR',
    'Iceland': 'IS',
    'Ireland': 'IE',
    'Poland': 'PL',
    'Czech Republic': 'CZ',
    'Slovakia': 'SK',
    'Hungary': 'HU',
    'Romania': 'RO',
    'Bulgaria': 'BG',
    'Serbia': 'RS',
    'Montenegro': 'ME',
    'Bosnia and Herzegovina': 'BA',
    'Croatia': 'HR',
    'Slovenia': 'SI',
    'North Macedonia': 'MK',
    'Albania': 'AL',
    'Moldova': 'MD',
    'Ukraine': 'UA',
    'Belarus': 'BY',
    'Lithuania': 'LT',
    'Latvia': 'LV',
    'Estonia': 'EE',
    'Georgia': 'GE',
    'Armenia': 'AM',
    'Azerbaijan': 'AZ',
    'Kazakhstan': 'KZ',
    'Uzbekistan': 'UZ',
    'Turkmenistan': 'TM',
    'Kyrgyzstan': 'KG',
    'Tajikistan': 'TJ',
    'Afghanistan': 'AF',
    'Mongolia': 'MN',
    'North Korea': 'KP'
  };
  return countryMap[country] || country.slice(0, 2).toUpperCase();
}

function getPortStatusColor(status?: string | null): string {
  if (!status) return 'bg-gray-100 text-gray-700';
  
  switch (status.toLowerCase()) {
    case 'active':
    case 'operational':
      return 'bg-green-100 text-green-700';
    case 'busy':
    case 'congested':
      return 'bg-yellow-100 text-yellow-700';
    case 'maintenance':
    case 'limited':
      return 'bg-orange-100 text-orange-700';
    case 'closed':
    case 'inactive':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

function getPortTypeIcon(type?: string | null) {
  if (!type) return <Anchor className="h-4 w-4" />;
  
  switch (type.toLowerCase()) {
    case 'commercial':
    case 'container':
      return <Building className="h-4 w-4" />;
    case 'oil':
    case 'petroleum':
    case 'refinery':
      return <Activity className="h-4 w-4" />;
    case 'cargo':
    case 'bulk':
      return <BarChart3 className="h-4 w-4" />;
    default:
      return <Anchor className="h-4 w-4" />;
  }
}

// Custom port icon for map
const portIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="24" height="24">
      <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
      <circle cx="12" cy="18" r="3" fill="#1d4ed8"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export default function PortsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('grid');

  // Fetch ports data
  const { data: ports = [], isLoading, error } = useQuery<Port[]>({
    queryKey: ['/api/ports'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Process and filter ports
  const filteredPorts = useMemo(() => {
    return ports.filter(port => {
      const matchesSearch = port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           port.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           port.region.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRegion = selectedRegion === 'all' || port.region === selectedRegion;
      const matchesCountry = selectedCountry === 'all' || port.country === selectedCountry;
      const matchesType = selectedType === 'all' || 
                         (port.type && port.type.toLowerCase().includes(selectedType.toLowerCase()));
      const matchesStatus = selectedStatus === 'all' || 
                           (port.status && port.status.toLowerCase() === selectedStatus.toLowerCase());

      return matchesSearch && matchesRegion && matchesCountry && matchesType && matchesStatus;
    });
  }, [ports, searchTerm, selectedRegion, selectedCountry, selectedType, selectedStatus]);

  // Get unique values for filters
  const regions = useMemo(() => Array.from(new Set(ports.map(p => p.region))), [ports]);
  const countries = useMemo(() => Array.from(new Set(ports.map(p => p.country))), [ports]);
  const types = useMemo(() => Array.from(new Set(ports.map(p => p.type).filter(Boolean))), [ports]);
  const statuses = useMemo(() => Array.from(new Set(ports.map(p => p.status).filter(Boolean))), [ports]);

  // Statistics
  const stats = useMemo(() => {
    const totalPorts = ports.length;
    const activePorts = ports.filter(p => p.status?.toLowerCase() === 'active' || p.status?.toLowerCase() === 'operational').length;
    const oilPorts = ports.filter(p => p.type?.toLowerCase().includes('oil') || p.type?.toLowerCase().includes('petroleum')).length;
    const totalCapacity = ports.reduce((sum, p) => sum + (p.capacity || 0), 0);

    return {
      totalPorts,
      activePorts,
      oilPorts,
      totalCapacity: totalCapacity > 0 ? totalCapacity : null,
      avgCapacity: totalCapacity > 0 ? Math.round(totalCapacity / ports.filter(p => p.capacity).length) : null
    };
  }, [ports]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load ports data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Anchor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Global Ports Directory</h1>
              <p className="text-gray-600">Comprehensive database of maritime oil terminals and ports</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalPorts}</p>
                    <p className="text-sm text-gray-600">Total Ports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.activePorts}</p>
                    <p className="text-sm text-gray-600">Active Ports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.oilPorts}</p>
                    <p className="text-sm text-gray-600">Oil Terminals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{regions.length}</p>
                    <p className="text-sm text-gray-600">Regions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search ports, countries, regions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">
                {filteredPorts.length} of {ports.length} ports shown
              </Badge>
              {searchTerm && (
                <Badge variant="secondary">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {selectedRegion !== 'all' && (
                <Badge variant="secondary">
                  Region: {selectedRegion}
                </Badge>
              )}
              {selectedCountry !== 'all' && (
                <Badge variant="secondary">
                  Country: {selectedCountry}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPorts.map((port) => (
                <Card key={port.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPortTypeIcon(port.type)}
                        <CardTitle className="text-lg">{port.name}</CardTitle>
                      </div>
                      {port.status && (
                        <Badge className={getPortStatusColor(port.status)}>
                          {port.status}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <FlagIcon code={getCountryCode(port.country)} size={16} />
                      {port.country}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <span>{port.region}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {typeof port.lat === 'number' ? port.lat.toFixed(3) : parseFloat(port.lat).toFixed(3)}, {typeof port.lng === 'number' ? port.lng.toFixed(3) : parseFloat(port.lng).toFixed(3)}
                        </span>
                      </div>

                      {port.type && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getPortTypeIcon(port.type)}
                          <span>{port.type}</span>
                        </div>
                      )}

                      {port.capacity && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BarChart3 className="h-4 w-4" />
                          <span>{port.capacity.toLocaleString()} MT</span>
                        </div>
                      )}

                      {port.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {port.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Map View */}
          <TabsContent value="map">
            <Card>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <MapContainer
                    center={[30, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredPorts.map((port) => {
                      const lat = typeof port.lat === 'number' ? port.lat : parseFloat(port.lat);
                      const lng = typeof port.lng === 'number' ? port.lng : parseFloat(port.lng);
                      
                      if (isNaN(lat) || isNaN(lng)) return null;
                      
                      return (
                        <Marker key={port.id} position={[lat, lng]} icon={portIcon}>
                          <Popup>
                            <div className="min-w-[200px]">
                              <h3 className="font-semibold text-lg mb-2">{port.name}</h3>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <FlagIcon code={getCountryCode(port.country)} size={16} />
                                  <span>{port.country}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Globe className="h-3 w-3" />
                                  <span>{port.region}</span>
                                </div>
                                {port.type && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    {getPortTypeIcon(port.type)}
                                    <span>{port.type}</span>
                                  </div>
                                )}
                                {port.status && (
                                  <Badge className={getPortStatusColor(port.status)}>
                                    {port.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-semibold">Port Name</th>
                        <th className="text-left p-4 font-semibold">Country</th>
                        <th className="text-left p-4 font-semibold">Region</th>
                        <th className="text-left p-4 font-semibold">Type</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Coordinates</th>
                        <th className="text-left p-4 font-semibold">Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPorts.map((port) => (
                        <tr key={port.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getPortTypeIcon(port.type)}
                              <span className="font-medium">{port.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FlagIcon code={getCountryCode(port.country)} size={16} />
                              <span>{port.country}</span>
                            </div>
                          </td>
                          <td className="p-4">{port.region}</td>
                          <td className="p-4">
                            {port.type ? (
                              <Badge variant="outline">{port.type}</Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            {port.status ? (
                              <Badge className={getPortStatusColor(port.status)}>
                                {port.status}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {typeof port.lat === 'number' ? port.lat.toFixed(3) : parseFloat(port.lat).toFixed(3)}, {typeof port.lng === 'number' ? port.lng.toFixed(3) : parseFloat(port.lng).toFixed(3)}
                          </td>
                          <td className="p-4">
                            {port.capacity ? `${port.capacity.toLocaleString()} MT` : <span className="text-gray-400">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredPorts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No ports found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}