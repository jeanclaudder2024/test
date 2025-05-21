import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
import MapControlPanel from '../components/map/MapControlPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Anchor } from 'lucide-react';
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
  const [showPortProximityControls, setShowPortProximityControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [mapMode, setMapMode] = useState('standard');
  const [showVessels, setShowVessels] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showRefineries, setShowRefineries] = useState(true);
  const [trafficDensity, setTrafficDensity] = useState(false);

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
      <div className="bg-white border-b shadow-sm">
        {/* Main Header */}
        <div className="px-5 py-3 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center">
            <svg className="h-7 w-7 text-blue-600 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 12.5C7 8.5 10 8.5 11.5,8.5C13 8.5 16 8.5 20 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 14.5L12 12L16 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Maritime Intelligence Platform</h1>
              <p className="text-xs text-gray-500">Real-time vessel tracking & maritime analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search vessels, ports, refineries..."
                className="pl-10 pr-4 py-2 h-9 text-sm rounded-md border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 mr-1">
                {filteredVessels.length}
              </Badge>
              <span className="text-xs text-blue-700 mr-3">Vessels</span>
              
              <Badge variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent mr-1">
                {filteredPorts.length}
              </Badge>
              <span className="text-xs text-gray-700 mr-3">Ports</span>
              
              <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-transparent mr-1">
                {filteredRefineries.length}
              </Badge>
              <span className="text-xs text-gray-700">Refineries</span>
            </div>
          </div>
        </div>
        
        {/* Filters row with advanced options */}
        <div className="p-3 bg-gray-50 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Region filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Region:</span>
              <select 
                className="text-sm border-gray-200 rounded-md py-1 pl-2 pr-7 bg-white" 
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
              <span className="text-xs font-medium text-gray-500">Vessel Type:</span>
              <select 
                className="text-sm border-gray-200 rounded-md py-1 pl-2 pr-7 bg-white" 
                value={selectedVesselType} 
                onChange={(e) => setSelectedVesselType(e.target.value)}
              >
                <option value="all">All Types</option>
                {vesselTypes.filter(type => type !== 'all').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Map view selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">View:</span>
              <div className="flex rounded-md overflow-hidden border border-gray-200">
                <button 
                  className={`px-2 py-1 text-xs ${mapMode === 'standard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setMapMode('standard')}
                >
                  Standard
                </button>
                <button 
                  className={`px-2 py-1 text-xs ${mapMode === 'satellite' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setMapMode('satellite')}
                >
                  Satellite
                </button>
                <button 
                  className={`px-2 py-1 text-xs ${mapMode === 'dark' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setMapMode('dark')}
                >
                  Dark
                </button>
              </div>
            </div>
            
            {/* Display control */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Display:</span>
              <div className="flex rounded-md overflow-hidden border border-gray-200">
                <button 
                  className={`px-2 py-1 text-xs ${showVessels ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setShowVessels(!showVessels)}
                >
                  Vessels
                </button>
                <button 
                  className={`px-2 py-1 text-xs ${showPorts ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setShowPorts(!showPorts)}
                >
                  Ports
                </button>
                <button 
                  className={`px-2 py-1 text-xs ${showRefineries ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  onClick={() => setShowRefineries(!showRefineries)}
                >
                  Refineries
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="traffic-density"
                checked={trafficDensity}
                onChange={() => setTrafficDensity(!trafficDensity)}
                className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
              />
              <label htmlFor="traffic-density" className="text-xs text-gray-700">Traffic Density</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="show-status"
                checked={showVesselStatus}
                onChange={(e) => setShowVesselStatus(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
              />
              <label htmlFor="show-status" className="text-xs text-gray-700">Vessel Status</label>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLegend(!showLegend)}
              className="text-xs text-gray-600 hover:text-blue-600 px-2 py-1 h-7"
            >
              {showLegend ? 'Hide Legend' : 'Show Legend'}
            </Button>
          </div>
        </div>
        
        {/* Expandable Legend */}
        {showLegend && (
          <div className="bg-white border-b border-gray-200 p-2 px-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-xs mb-2 text-gray-700">Vessel Types</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <img src={tankerIcon} alt="Tanker" className="w-6 h-6 mr-2" />
                  <span className="text-gray-700 text-xs">Tanker</span>
                </div>
                <div className="flex items-center">
                  <img src={cargoIcon} alt="Cargo" className="w-6 h-6 mr-2" />
                  <span className="text-gray-700 text-xs">Cargo</span>
                </div>
                <div className="flex items-center">
                  <img src={passengerIcon} alt="Passenger" className="w-6 h-6 mr-2" />
                  <span className="text-gray-700 text-xs">Passenger</span>
                </div>
                <div className="flex items-center">
                  <img src={vesselIcon} alt="Other" className="w-6 h-6 mr-2" />
                  <span className="text-gray-700 text-xs">Other</span>
                </div>
              </div>
            </div>
            <div>
              <div className="font-medium text-xs mb-2 text-gray-700">Vessel Status</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-700">Stopped</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs text-gray-700">Maneuvering</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-700">Active</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-xs text-gray-700">Unknown</span>
                </div>
              </div>
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
            {/* Map Tile Layer based on selected mode */}
            {mapMode === 'standard' && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}
            
            {mapMode === 'satellite' && (
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}
            
            {mapMode === 'dark' && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            )}
            
            {/* Vessels - only show if toggle is enabled */}
            {showVessels && filteredVessels.map((vessel) => (
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
            
            {/* Ports - only show if toggle is enabled */}
            {showPorts && filteredPorts.map((port) => (
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
            
            {/* Refineries - only show if toggle is enabled */}
            {showRefineries && filteredRefineries.map((refinery) => (
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
            {/* Advanced Map Control Panel */}
            <MapControlPanel 
              showVessels={showVessels}
              setShowVessels={setShowVessels}
              showPorts={showPorts}
              setShowPorts={setShowPorts}
              showRefineries={showRefineries}
              setShowRefineries={setShowRefineries}
              mapMode={mapMode}
              setMapMode={setMapMode}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedVesselType={selectedVesselType}
              setSelectedVesselType={setSelectedVesselType}
              showVesselStatus={showVesselStatus}
              setShowVesselStatus={setShowVesselStatus}
              trafficDensity={trafficDensity}
              setTrafficDensity={setTrafficDensity}
              showLegend={showLegend}
              setShowLegend={setShowLegend}
              vesselTypes={vesselTypes}
              showPortProximityControls={showPortProximityControls}
              setShowPortProximityControls={setShowPortProximityControls}
              handleRefresh={handleRefresh}
            />
            
            {/* Small controls for mobile/quick access */}
            <div className="absolute bottom-4 right-4 z-10 space-y-4">
              <Card className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                <button
                  className="p-2"
                  onClick={handleRefresh}
                  disabled={loading}
                  title="Refresh map data"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-gray-400' : ''}`} />
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