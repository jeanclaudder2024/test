import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, LayersControl, FeatureGroup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map-status.css';
import '../styles/vessel-popup.css';
import tankerIcon from '../assets/tanker-icon.svg';
import cargoIcon from '../assets/cargo-icon.svg';
import passengerIcon from '../assets/passenger-icon.svg';
import vesselIcon from '../assets/vessel-icon.svg';
import { getEnhancedVesselData } from '../services/vesselDataEnhancer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import VesselPopup from '../components/VesselPopup';
import PortProximityControls from '../components/map/PortProximityControls';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Anchor, Layers, Navigation, Map, Target, AlertCircle, BarChart2, Info, List, Maximize, Minimize } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  
  // Map display controls
  const [showVessels, setShowVessels] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showRefineries, setShowRefineries] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [mapStyle, setMapStyle] = useState('standard');
  
  // UI control states
  const [showMapLayers, setShowMapLayers] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showLocationFinder, setShowLocationFinder] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedVesselType, setSelectedVesselType] = useState('all');
  const [showVesselStatus, setShowVesselStatus] = useState(true);
  const [showPortProximityControls, setShowPortProximityControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Function to fetch data
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
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchData();
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Map reference for controlling the map
  const mapRef = useRef<any>(null);
  
  // Handle fullscreen toggle
  const toggleFullScreen = () => {
    const mapElement = document.getElementById('maritime-map-container');
    
    if (!isFullScreen) {
      if (mapElement?.requestFullscreen) {
        mapElement.requestFullscreen()
          .then(() => setIsFullScreen(true))
          .catch(err => console.error("Fullscreen error:", err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullScreen(false))
          .catch(err => console.error("Exit fullscreen error:", err));
      }
    }
  };
  
  // Handle location search
  const handleLocationSearch = () => {
    if (!locationSearch.trim()) return;
    
    // Search in ports and refineries
    const portResults = ports.filter(port => 
      port.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      port.country.toLowerCase().includes(locationSearch.toLowerCase())
    ).map(port => ({
      id: port.id,
      name: port.name,
      country: port.country,
      lat: parseFloat(port.lat),
      lng: parseFloat(port.lng),
      type: 'port'
    }));
    
    const refineryResults = refineries.filter(refinery => 
      refinery.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      refinery.country.toLowerCase().includes(locationSearch.toLowerCase())
    ).map(refinery => ({
      id: refinery.id,
      name: refinery.name,
      country: refinery.country,
      lat: parseFloat(refinery.lat),
      lng: parseFloat(refinery.lng),
      type: 'refinery'
    }));
    
    setLocationResults([...portResults, ...refineryResults]);
  };
  
  // Handle flying to a location
  const handleFlyToLocation = (location: any) => {
    if (mapRef.current) {
      // Access the Leaflet map instance and fly to location
      const leafletMap = mapRef.current;
      leafletMap.flyTo([location.lat, location.lng], 10, {
        animate: true,
        duration: 1.5
      });
      
      setShowLocationFinder(false);
      setLocationResults([]);
      setLocationSearch('');
    }
  };
  
  // Map component to handle map reference
  const MapController = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

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
  
  // Get appropriate vessel icon based on vessel type
  const getVesselIconUrl = (vessel: Vessel): string => {
    const type = vessel.vesselType?.toLowerCase() || '';
    
    if (type.includes('tanker') || type.includes('oil') || type.includes('lng')) {
      return tankerIcon;
    } else if (type.includes('cargo') || type.includes('container') || type.includes('bulk')) {
      return cargoIcon;
    } else if (type.includes('passenger') || type.includes('cruise') || type.includes('ferry')) {
      return passengerIcon;
    } else {
      return vesselIcon;
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
            minZoom={2}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%', background: '#a4cae1' }}
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
                  iconUrl: getVesselIconUrl(vessel),
                  iconSize: [36, 36],
                  iconAnchor: [18, 18],
                  popupAnchor: [0, -18],
                  className: showVesselStatus ? `vessel-icon status-${getVesselStatus(vessel).toLowerCase()}` : 'vessel-icon'
                })}
              >
                <Popup maxWidth={400} minWidth={350}>
                  <div className="vessel-popup-container">
                    <VesselPopup 
                      vessel={vessel} 
                      getVesselStatus={getVesselStatus}
                      getVesselRegion={getVesselRegion}
                    />
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
                <Popup maxWidth={350} minWidth={300}>
                  <div className="port-popup-container">
                    <div className="popup-header" style={{ 
                      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                      padding: '12px 16px',
                      borderRadius: '6px 6px 0 0',
                      marginBottom: '12px',
                      marginLeft: '-10px',
                      marginRight: '-10px',
                      marginTop: '-10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h3 className="font-bold text-lg text-white m-0">{port.name}</h3>
                        <p className="text-blue-100 text-sm m-0">{port.country}</p>
                      </div>
                      <div className="rounded-full bg-white p-2 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="popup-content px-2 py-1">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-blue-500 font-medium m-0">Port Type</p>
                          <p className="text-sm font-semibold m-0">{port.portType || 'Commercial'}</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-blue-500 font-medium m-0">Country</p>
                          <p className="text-sm font-semibold m-0">{port.country}</p>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Port Information</h4>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                            <path d="M17 2l-5 5-5-5"></path>
                          </svg>
                          <span className="text-gray-600">Facility Type: {port.facilityType || 'Cargo Terminal'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span className="text-gray-600">Operating Hours: 24/7</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                          </svg>
                          <span className="text-gray-600">Current Status: Active</span>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                        onClick={() => window.open(`/ports/${port.id}`, '_blank')}
                      >
                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        View Port Details
                      </Button>
                    </div>
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
                <Popup maxWidth={350} minWidth={300}>
                  <div className="refinery-popup-container">
                    <div className="popup-header" style={{ 
                      background: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
                      padding: '12px 16px',
                      borderRadius: '6px 6px 0 0',
                      marginBottom: '12px',
                      marginLeft: '-10px',
                      marginRight: '-10px',
                      marginTop: '-10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h3 className="font-bold text-lg text-white m-0">{refinery.name}</h3>
                        <p className="text-red-100 text-sm m-0">{refinery.country}</p>
                      </div>
                      <div className="rounded-full bg-white p-2 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.5 21.5l-5-5"></path>
                          <path d="M18.5 12.5v4h4"></path>
                          <path d="M4.5 21.5l5-5"></path>
                          <path d="M6.5 12.5v4h-4"></path>
                          <path d="M12.5 2.5v10l2 2"></path>
                          <path d="M12.5 2.5v10l-2 2"></path>
                          <path d="M4.5 10.5h16"></path>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="popup-content px-2 py-1">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-red-50 p-2 rounded">
                          <p className="text-xs text-red-500 font-medium m-0">Capacity</p>
                          <p className="text-sm font-semibold m-0">{refinery.capacity?.toLocaleString() || 'N/A'} bpd</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded">
                          <p className="text-xs text-red-500 font-medium m-0">Region</p>
                          <p className="text-sm font-semibold m-0">{refinery.region || 'International'}</p>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Refinery Information</h4>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                          <span className="text-gray-600">Operator: {refinery.operator || 'National Oil Company'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                          </svg>
                          <span className="text-gray-600">Complexity: {refinery.complexity || 'Medium'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                          </svg>
                          <span className="text-gray-600">Status: {refinery.status || 'Active'}</span>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                        onClick={() => window.open(`/refineries/${refinery.id}`, '_blank')}
                      >
                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        View Refinery Details
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            {/* Enhanced Map Controls */}
            <div className="fixed bottom-10 right-6 z-50 space-y-3">
              {/* Map Layers Control */}
              <Card className="w-14 h-14 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors shadow-xl bg-white border-2 border-blue-200 rounded-xl">
                <button
                  className="p-3 relative"
                  onClick={() => setShowMapLayers(!showMapLayers)}
                  title="Map Layers"
                >
                  <Layers className="w-7 h-7 text-blue-500" />
                  {showMapLayers && (
                    <div className="absolute bottom-12 right-0 bg-white p-3 rounded-lg shadow-lg w-64">
                      <h3 className="text-sm font-bold mb-2 flex items-center"><Map className="w-4 h-4 mr-1" /> Map Style</h3>
                      <Select
                        value={mapStyle}
                        onValueChange={(value) => setMapStyle(value)}
                      >
                        <SelectTrigger className="mb-2">
                          <SelectValue placeholder="Select map style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="satellite">Satellite</SelectItem>
                          <SelectItem value="dark">Dark Mode</SelectItem>
                          <SelectItem value="terrain">Terrain</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <h3 className="text-sm font-bold mt-3 mb-2 flex items-center"><Layers className="w-4 h-4 mr-1" /> Display Layers</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="showVessels" 
                            checked={showVessels} 
                            onChange={() => setShowVessels(!showVessels)} 
                            className="mr-2"
                          />
                          <label htmlFor="showVessels" className="text-sm">Vessels</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="showPorts" 
                            checked={showPorts} 
                            onChange={() => setShowPorts(!showPorts)} 
                            className="mr-2"
                          />
                          <label htmlFor="showPorts" className="text-sm">Ports</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="showRefineries" 
                            checked={showRefineries} 
                            onChange={() => setShowRefineries(!showRefineries)} 
                            className="mr-2"
                          />
                          <label htmlFor="showRefineries" className="text-sm">Refineries</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="showVesselStatus" 
                            checked={showVesselStatus} 
                            onChange={() => setShowVesselStatus(!showVesselStatus)} 
                            className="mr-2"
                          />
                          <label htmlFor="showVesselStatus" className="text-sm">Vessel Status</label>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              </Card>

              {/* Location Finder Button */}
              <Card className="w-14 h-14 flex items-center justify-center cursor-pointer hover:bg-green-50 transition-colors shadow-xl bg-white border-2 border-green-200 rounded-xl">
                <button
                  className="p-3 relative"
                  onClick={() => setShowLocationFinder(!showLocationFinder)}
                  title="Find Location"
                >
                  <Target className="w-7 h-7 text-green-500" />
                  {showLocationFinder && (
                    <div className="absolute bottom-12 right-0 bg-white p-3 rounded-lg shadow-lg w-64">
                      <h3 className="text-sm font-bold mb-2 flex items-center"><Target className="w-4 h-4 mr-1" /> Find Location</h3>
                      <div className="space-y-2">
                        <Input 
                          placeholder="Search for a port or refinery..."
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                        />
                        <Button 
                          size="sm" 
                          className="w-full" 
                          onClick={handleLocationSearch}
                        >
                          Find
                        </Button>
                        
                        {locationResults.length > 0 && (
                          <div className="mt-2 max-h-40 overflow-y-auto">
                            <p className="text-xs text-gray-500 mb-1">Search Results:</p>
                            {locationResults.map((item, index) => (
                              <div 
                                key={index} 
                                className="text-sm p-1 hover:bg-gray-100 cursor-pointer rounded"
                                onClick={() => handleFlyToLocation(item)}
                              >
                                {item.name} ({item.type})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              </Card>

              {/* Full Screen Button */}
              <Card className="w-14 h-14 flex items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors shadow-xl bg-white border-2 border-purple-200 rounded-xl">
                <button
                  className="p-3"
                  onClick={toggleFullScreen}
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? <Minimize className="w-7 h-7 text-purple-500" /> : <Maximize className="w-7 h-7 text-purple-500" />}
                </button>
              </Card>
              
              {/* Settings button */}
              <Card className="w-14 h-14 flex items-center justify-center cursor-pointer hover:bg-orange-50 transition-colors shadow-xl bg-white border-2 border-orange-200 rounded-xl">
                <button
                  className="p-3"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ec4899" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </Card>
              
              {/* Refresh button */}
              <Card className="w-14 h-14 flex items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors shadow-xl bg-white border-2 border-indigo-200 rounded-xl">
                <button
                  className="p-3"
                  onClick={handleRefresh}
                  disabled={loading}
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-7 h-7 ${loading ? 'animate-spin text-gray-400' : 'text-indigo-500'}`} />
                </button>
              </Card>
              
              {/* Port Proximity button */}
              <Card className="w-14 h-14 flex items-center justify-center cursor-pointer hover:bg-cyan-50 transition-colors shadow-xl bg-white border-2 border-cyan-200 rounded-xl">
                <button
                  className="p-3"
                  onClick={() => setShowPortProximityControls(!showPortProximityControls)}
                  title="Enhance vessel distribution near ports and refineries"
                >
                  <Anchor className="w-7 h-7 text-cyan-600" />
                </button>
              </Card>
            </div>
            
            {/* Port Proximity Controls Panel */}
            {showPortProximityControls && (
              <div className="absolute bottom-4 left-4 z-10">
                <PortProximityControls />
              </div>
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default SimpleMap;