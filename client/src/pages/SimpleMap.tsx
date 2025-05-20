import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

  // Filter data based on search term
  const filteredVessels = vessels.filter(vessel => 
    vessel.currentLat && 
    vessel.currentLng && 
    (searchTerm === '' || 
     vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (vessel.imo && vessel.imo.includes(searchTerm)) ||
     vessel.vesselType.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
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
                icon={createVesselIcon()}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-base">{vessel.name}</h3>
                    <p className="text-sm">Type: {vessel.vesselType}</p>
                    <p className="text-sm">IMO: {vessel.imo}</p>
                    <p className="text-sm">Flag: {vessel.flag}</p>
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