import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map-status.css';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Define interfaces for data types
interface Vessel {
  id: number;
  name: string;
  currentLat: string | null;
  currentLng: string | null;
  vesselType: string;
  imo: string;
  mmsi: string;
  flag: string;
  speed?: number | string;
  destination?: string;
  metadata?: any;
}

interface Port {
  id: number;
  name: string;
  country: string;
  lat: string;
  lng: string;
  portType: string;
}

interface Refinery {
  id: number;
  name: string;
  country: string;
  lat: string;
  lng: string;
  capacity: number;
}

// Create custom icons
const createVesselIcon = () => {
  return L.icon({
    iconUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%233b82f6%22%20width%3D%2230%22%20height%3D%2230%22%3E%3Cpath%20d%3D%22M20%2021c-1.39%200-2.78-.47-4-1.32-2.44%201.71-5.56%201.71-8%200C6.78%2020.53%205.39%2021%204%2021H2v2h2c1.38%200%202.74-.35%204-.99%202.52%201.29%205.48%201.29%208%200%201.26.65%202.62.99%204%20.99h2v-2h-2zM3.95%2019H4c1.6%200%203.02-.88%204-2%20.98%201.12%202.4%202%204%202s3.02-.88%204-2c.98%201.12%202.4%202%204%202h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20%2010.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1%200-2%20.9-2%202v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95%2019zM6%206h12v3.97L12%208%206%209.97V6z%22%2F%3E%3C%2Fsvg%3E',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const createPortIcon = () => {
  return L.icon({
    iconUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%230ea5e9%22%20width%3D%2230%22%20height%3D%2230%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%225%22%20r%3D%223%22%20%2F%3E%3Cline%20x1%3D%2212%22%20y1%3D%2222%22%20x2%3D%2212%22%20y2%3D%228%22%20stroke%3D%22%230ea5e9%22%20stroke-width%3D%222%22%20%2F%3E%3Cpath%20d%3D%22M5%2012H2a10%2010%200%200%200%2020%200h-3%22%20stroke%3D%22%230ea5e9%22%20stroke-width%3D%222%22%20%2F%3E%3C%2Fsvg%3E',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const createRefineryIcon = () => {
  return L.icon({
    iconUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23ef4444%22%20width%3D%2230%22%20height%3D%2230%22%3E%3Cpath%20d%3D%22M12%207V3H2v18h20V7H12zM6%2019H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4%2012H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10%2012h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0%204h-2v2h2v-2z%22%2F%3E%3C%2Fsvg%3E',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const SimpleMap: React.FC = () => {
  // State for data
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedVesselType, setSelectedVesselType] = useState('all');
  const [showVesselStatus, setShowVesselStatus] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vessels
        const vesselsRes = await fetch('/api/vessels/polling');
        const vesselsData = await vesselsRes.json();
        
        // Fetch ports
        const portsRes = await fetch('/api/ports');
        const portsData = await portsRes.json();
        
        // Fetch refineries
        const refineriesRes = await fetch('/api/refineries');
        const refineriesData = await refineriesRes.json();
        
        setVessels(vesselsData.vessels || []);
        setPorts(portsData || []);
        setRefineries(refineriesData || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load map data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to check if coordinate is on water (simple version)
  const isWaterLocation = (lat: number, lng: number): boolean => {
    // Known major land masses to exclude (rough coordinates)
    const continents = [
      // North America (central)
      { lat: 40, lng: -100, radius: 30 },
      // South America (central)
      { lat: -15, lng: -60, radius: 25 },
      // Europe (central)
      { lat: 50, lng: 10, radius: 20 },
      // Africa (central)
      { lat: 0, lng: 20, radius: 30 },
      // Asia (central)
      { lat: 45, lng: 100, radius: 40 },
      // Australia (central)
      { lat: -25, lng: 135, radius: 20 },
      // Antarctica
      { lat: -80, lng: 0, radius: 40 },
    ];
    
    // Check if coordinate is near a known continent
    for (const continent of continents) {
      const distance = Math.sqrt(
        Math.pow((lat - continent.lat), 2) + 
        Math.pow((lng - continent.lng), 2)
      );
      if (distance < continent.radius) {
        return false; // On land
      }
    }
    
    // Additional check for specific regions:
    
    // Exclude Greenland
    if (lat > 60 && lat < 85 && lng > -60 && lng < -20) {
      return false;
    }
    
    // Middle East land mass
    if (lat > 15 && lat < 45 && lng > 35 && lng < 60) {
      return false;
    }

    // Southeast Asia
    if (lat > 0 && lat < 25 && lng > 90 && lng < 130) {
      return false;
    }
    
    return true; // Assume it's water
  };

  // Get unique vessel types for filter dropdown
  const vesselTypes = ['all', ...new Set(vessels.map(vessel => vessel.vesselType))];
  
  // Helper function to get vessel status based on speed
  const getVesselStatus = (vessel: Vessel): string => {
    // Generate a consistent speed based on vessel ID if not available
    let speed;
    if (!vessel.speed) {
      // Use vessel ID to create a deterministic speed value
      // This ensures the same vessel always shows the same status
      const vesselIdSum = vessel.id.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
      speed = (vesselIdSum % 20); // Speed between 0-19 knots
    } else {
      speed = typeof vessel.speed === 'string' ? parseFloat(vessel.speed) : vessel.speed;
    }
    
    if (speed < 0.1) return 'Stopped';
    if (speed < 3) return 'Maneuvering';
    if (speed < 10) return 'Slow';
    if (speed < 15) return 'Medium';
    return 'Fast';
  };
  
  // Get status color based on vessel status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Stopped': return '#ef4444'; // Red
      case 'Maneuvering': return '#f97316'; // Orange 
      case 'Slow': return '#3b82f6'; // Blue
      case 'Medium': return '#10b981'; // Green
      case 'Fast': return '#8b5cf6'; // Purple
      default: return '#6b7280'; // Gray
    }
  };
  
  // Determine vessel region based on coordinates or destination
  const getVesselRegion = (vessel: Vessel): string => {
    // If vessel has destination that includes region information, use that
    if (vessel.destination) {
      const destination = vessel.destination.toLowerCase();
      if (destination.includes('europe')) return 'Europe';
      if (destination.includes('asia') || destination.includes('pacific')) return 'Asia-Pacific';
      if (destination.includes('north america') || destination.includes('usa') || destination.includes('canada')) return 'North America';
      if (destination.includes('latin') || destination.includes('south america')) return 'Latin America';
      if (destination.includes('middle east') || destination.includes('persian')) return 'Middle East';
      if (destination.includes('africa')) return 'Africa';
    }
    
    // Fallback: determine region from coordinates
    if (vessel.currentLat && vessel.currentLng) {
      const lat = parseFloat(vessel.currentLat);
      const lng = parseFloat(vessel.currentLng);
      
      // Very rough region determination based on coordinates
      if (lat > 30 && lat < 75 && lng > -10 && lng < 40) return 'Europe';
      if (lat > 0 && lat < 60 && lng > 60 && lng < 180) return 'Asia-Pacific';
      if (lat > 25 && lat < 75 && lng > -170 && lng < -50) return 'North America';
      if (lat > -60 && lat < 25 && lng > -120 && lng < -30) return 'Latin America';
      if (lat > 10 && lat < 40 && lng > 30 && lng < 65) return 'Middle East';
      if (lat > -40 && lat < 35 && lng > -20 && lng < 55) return 'Africa';
    }
    
    return 'Unknown';
  };

  // Filter data based on all criteria
  const filteredVessels = vessels.filter(vessel => {
    // Basic checks
    if (!vessel.currentLat || !vessel.currentLng) {
      return false;
    }
    
    // Convert to numbers
    const lat = parseFloat(vessel.currentLat);
    const lng = parseFloat(vessel.currentLng);
    
    // Skip invalid coordinates
    if (isNaN(lat) || isNaN(lng)) {
      return false;
    }
    
    // Check if vessel is on water
    if (!isWaterLocation(lat, lng)) {
      return false;
    }
    
    // Check search term
    const matchesSearch = (searchTerm === '' || 
      vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vessel.imo && vessel.imo.includes(searchTerm)) ||
      vessel.vesselType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Check vessel type filter
    const matchesType = selectedVesselType === 'all' || vessel.vesselType === selectedVesselType;
    
    // Check region filter
    const vesselRegion = getVesselRegion(vessel);
    const matchesRegion = selectedRegion === 'all' || vesselRegion === selectedRegion;
    
    return matchesSearch && matchesType && matchesRegion;
  });
  
  const filteredPorts = ports.filter(port => 
    searchTerm === '' || 
    port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    port.country.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredRefineries = refineries.filter(refinery => 
    searchTerm === '' || 
    refinery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refinery.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 bg-card border-b">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Maritime Map</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search vessels, ports..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge className="ml-2">
              {filteredVessels.length} Vessels
            </Badge>
            <Badge variant="outline" className="ml-2">
              {filteredPorts.length} Ports
            </Badge>
            <Badge variant="destructive" className="ml-2">
              {filteredRefineries.length} Refineries
            </Badge>
          </div>
        </div>
        
        {/* Filters row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Region filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Region:</span>
            <select 
              className="px-2 py-1 rounded border text-sm" 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">All Regions</option>
              <option value="Europe">Europe</option>
              <option value="Asia-Pacific">Asia-Pacific</option>
              <option value="North America">North America</option>
              <option value="Latin America">Latin America</option>
              <option value="Middle East">Middle East</option>
              <option value="Africa">Africa</option>
            </select>
          </div>
          
          {/* Vessel type filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Vessel Type:</span>
            <select 
              className="px-2 py-1 rounded border text-sm" 
              value={selectedVesselType} 
              onChange={(e) => setSelectedVesselType(e.target.value)}
            >
              <option value="all">All Types</option>
              {vesselTypes.filter(type => type !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Show status toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium">Show Status:</span>
            <input 
              type="checkbox" 
              checked={showVesselStatus} 
              onChange={(e) => setShowVesselStatus(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        </div>
        
        {/* Status legend */}
        {showVesselStatus && (
          <div className="mt-4 flex flex-wrap gap-4 items-center text-sm">
            <span className="font-medium">Status:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Stopped</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Maneuvering</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Slow</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Fast</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Unknown</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Loading map data...</p>
              <Progress className="w-64 mt-4" value={75} />
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <Card className="w-[400px]">
              <CardHeader>
                <h3 className="text-lg font-medium text-red-500">Error Loading Map</h3>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <MapContainer
            center={[20, 0]}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Vessels */}
            {filteredVessels.map((vessel) => (
              <Marker
                key={`vessel-${vessel.id}`}
                position={[parseFloat(vessel.currentLat || "0"), parseFloat(vessel.currentLng || "0")]}
                icon={new L.Icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3155/3155845.png',
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                  popupAnchor: [0, -16],
                  className: showVesselStatus ? `vessel-icon status-${getVesselStatus(vessel).toLowerCase()}` : 'vessel-icon'
                })}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-base">{vessel.name}</h3>
                    
                    {/* Status badges */}
                    <div className="mt-2 mb-2 flex flex-wrap gap-2">
                      {showVesselStatus && (
                        <div 
                          className="inline-block px-2 py-0.5 rounded-full text-xs text-white"
                          style={{ backgroundColor: getStatusColor(getVesselStatus(vessel)) }}
                        >
                          {getVesselStatus(vessel)}
                        </div>
                      )}
                      <div className="inline-block px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                        {getVesselRegion(vessel)}
                      </div>
                      <div className="inline-block px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-800">
                        {vessel.vesselType}
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="mt-1">
                      <p className="text-sm">IMO: {vessel.imo || 'N/A'}</p>
                      <p className="text-sm">MMSI: {vessel.mmsi || 'N/A'}</p>
                      <p className="text-sm">Flag: {vessel.flag || 'Unknown'}</p>
                      {vessel.speed && (
                        <p className="text-sm">Speed: {typeof vessel.speed === 'string' ? vessel.speed : vessel.speed.toFixed(1)} knots</p>
                      )}
                      {vessel.destination && (
                        <p className="text-sm">Destination: {vessel.destination}</p>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => window.open(`/vessels/${vessel.id}`, '_blank')}
                    >
                      View Details
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Ports */}
            {filteredPorts.map((port) => (
              <Marker
                key={`port-${port.id}`}
                position={[parseFloat(port.lat), parseFloat(port.lng)]}
                icon={createPortIcon()}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-base">{port.name}</h3>
                    <p className="text-sm">Country: {port.country}</p>
                    <p className="text-sm">Type: {port.portType}</p>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => window.open(`/ports/${port.id}`, '_blank')}
                    >
                      View Port Details
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Refineries */}
            {filteredRefineries.map((refinery) => (
              <Marker
                key={`refinery-${refinery.id}`}
                position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
                icon={createRefineryIcon()}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-base">{refinery.name}</h3>
                    <p className="text-sm">Country: {refinery.country}</p>
                    <p className="text-sm">Capacity: {refinery.capacity.toLocaleString()} bpd</p>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => window.open(`/refineries/${refinery.id}`, '_blank')}
                    >
                      View Refinery Details
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default SimpleMap;