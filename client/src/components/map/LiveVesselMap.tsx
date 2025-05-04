import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Vessel, Refinery, Port } from '@shared/schema';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Anchor, Info, Navigation, Flag, Calendar, Ship, 
  Factory, Warehouse, Anchor as AnchorIcon, Sparkles
} from 'lucide-react';
import { AIGenerationPanel } from '@/components/AIGenerationPanel';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Import removed - using hardcoded regions instead

// Ensure Leaflet CSS is imported
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Define marker icons for different vessel types
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Create custom vessel icon
const vesselIcon = (heading: number = 0, speed: number = 0, vesselType: string = 'oil products tanker') => {
  // Different colors based on vessel type
  let color = '#3388ff'; // default blue
  
  if (vesselType.includes('crude')) {
    color = '#e53935'; // red for crude oil tankers
  } else if (vesselType.includes('lng')) {
    color = '#43a047'; // green for LNG
  } else if (vesselType.includes('lpg')) {
    color = '#ffb300'; // amber for LPG
  }
  
  // Different sizes based on vessel speed to indicate movement
  const size = 8 + Math.min(speed, 15); // Base size + speed factor
  
  // Create an SVG ship icon with rotation based on heading
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size * 2}" height="${size * 2}">
      <path fill="${color}" transform="rotate(${heading}, 12, 12)" d="M21 17H3V15H21V17M21 11H3V9H21V11M21 5H3V3H21V5Z" />
    </svg>
  `;
  
  // Convert SVG to data URL
  const svgBase64 = btoa(svgIcon);
  const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
  
  return L.icon({
    iconUrl: dataUrl,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size]
  });
};

// Create custom refinery icon
const refineryIcon = () => {
  // Create an SVG factory icon
  const size = 24;
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
      <circle cx="12" cy="12" r="10" fill="#f44336" fill-opacity="0.8" stroke="#000" stroke-width="1"/>
      <path fill="#fff" d="M7 12h2v5H7v-5zm8 0h2v5h-2v-5zm-4-8h2v3h-2V4zm0 4h2v2h-2V8zm0 3h2v8h-2v-8z"/>
    </svg>
  `;
  
  // Convert SVG to data URL
  const svgBase64 = btoa(svgIcon);
  const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
  
  return L.icon({
    iconUrl: dataUrl,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// Create custom port icon
const portIcon = () => {
  // Create an SVG anchor icon
  const size = 22;
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
      <circle cx="12" cy="12" r="10" fill="#2196f3" fill-opacity="0.8" stroke="#000" stroke-width="1"/>
      <path fill="#fff" d="M16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8A4,4 0 0,1 16,12M13,4.26C13,4.1 12.9,4 12.74,4C12.59,4 12.5,4.1 12.5,4.26V6.34C12.16,6.42 11.84,6.54 11.53,6.69L9.93,5.83C9.78,5.76 9.66,5.81 9.58,5.94C9.5,6.08 9.53,6.24 9.67,6.34L11.29,7.23C10.87,7.58 10.5,8 10.23,8.5H8C7.86,8.5 7.75,8.61 7.75,8.76C7.75,8.91 7.86,9 8,9H10.07C10.03,9.17 10,9.33 10,9.5C10,9.67 10.03,9.83 10.07,10H8C7.86,10 7.75,10.1 7.75,10.24C7.75,10.38 7.86,10.5 8,10.5H10.23C10.5,10.99 10.87,11.42 11.29,11.77L9.67,12.66C9.53,12.76 9.5,12.92 9.58,13.06C9.66,13.19 9.78,13.24 9.93,13.17L11.53,12.31C11.84,12.46 12.16,12.58 12.5,12.66V14.74C12.5,14.9 12.59,15 12.74,15C12.89,15 13,14.9 13,14.74V12.67C13.33,12.58 13.64,12.46 13.94,12.31L15.57,13.17C15.7,13.25 15.82,13.2 15.9,13.07C15.97,12.94 15.96,12.77 15.82,12.67L14.21,11.77C14.63,11.42 15,10.99 15.26,10.5H17.5C17.64,10.5 17.75,10.4 17.75,10.26C17.75,10.11 17.64,10 17.5,10H15.42C15.46,9.83 15.5,9.67 15.5,9.5C15.5,9.33 15.46,9.17 15.42,9H17.5C17.64,9 17.75,8.9 17.75,8.74C17.75,8.59 17.64,8.5 17.5,8.5H15.26C15,8 14.63,7.58 14.21,7.23L15.82,6.34C15.96,6.24 15.97,6.07 15.9,5.94C15.82,5.81 15.7,5.76 15.57,5.83L13.94,6.69C13.64,6.54 13.33,6.42 13,6.34V4.26Z" />
    </svg>
  `;
  
  // Convert SVG to data URL
  const svgBase64 = btoa(svgIcon);
  const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
  
  return L.icon({
    iconUrl: dataUrl,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// MapUpdateComponent - handles updating the map when vessels change
interface MapUpdateProps {
  vessels: Vessel[];
}

function MapUpdate({ vessels }: MapUpdateProps) {
  const map = useMap();

  useEffect(() => {
    if (vessels.length > 0) {
      // If we have vessels, fit bounds to include all vessels
      const points = vessels.map(vessel => 
        [parseFloat(vessel.currentLat || '0'), parseFloat(vessel.currentLng || '0')] as [number, number]
      );
      
      // Only include valid coordinates
      const validPoints = points.filter(p => !isNaN(p[0]) && !isNaN(p[1]));
      
      if (validPoints.length > 0) {
        map.fitBounds(validPoints);
      }
    }
  }, [vessels, map]);

  return null;
}

interface LiveVesselMapProps {
  initialRegion?: string;
  height?: string;
}

export default function LiveVesselMap({ initialRegion, height = '600px' }: LiveVesselMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion || 'global');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(3);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showConnections, setShowConnections] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<string>("all");
  
  // Use our WebSocket hook for real-time vessel data with fallback to REST API polling
  const { 
    vessels, 
    isConnected, 
    lastUpdated, 
    error: vesselError, 
    isLoading: vesselsLoading, 
    refreshData: refreshVesselData,
    usingFallback
  } = useVesselWebSocket({ 
    region: selectedRegion,
    pollingInterval: 30000 // 30 seconds polling interval for REST API fallback
  });
  
  // Use maritime data hook for refineries and ports with their connections
  const {
    refineries,
    ports,
    connections,
    isLoading: infrastructureLoading,
    error: infrastructureError,
    refreshData: refreshInfrastructureData
  } = useMaritimeData({
    region: selectedRegion,
    includeVessels: false, // Already getting vessels from WebSocket
    includeRefineries: showRefineries,
    includePorts: showPorts,
    includeConnections: showConnections,
    pollingInterval: 60000 // 1 minute polling interval
  });

  // Combine errors and loading states
  const error = vesselError || infrastructureError;
  const isLoading = vesselsLoading || infrastructureLoading;

  // Handle region selection change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    // Reset selections when changing regions
    setSelectedVessel(null);
    setSelectedRefinery(null);
    setSelectedPort(null);
  };
  
  // Function to refresh all data
  const refreshData = () => {
    refreshVesselData();
    refreshInfrastructureData();
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap justify-between items-center mb-4 p-2 bg-card rounded-md">
        <div className="flex items-center space-x-2">
          <Ship className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Maritime Tracking</h2>
          
          {isConnected ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected {usingFallback ? "(REST API)" : "(WebSocket)"}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Reconnecting...
            </Badge>
          )}
          
          {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="middle_east">Middle East</SelectItem>
              <SelectItem value="north_america">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="africa">Africa</SelectItem>
              <SelectItem value="southeast_asia">Southeast Asia</SelectItem>
              <SelectItem value="east_asia">East Asia</SelectItem>
              <SelectItem value="oceania">Oceania</SelectItem>
              <SelectItem value="south_america">South America</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={displayMode} onValueChange={setDisplayMode}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Display Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Maritime Assets</SelectItem>
              <SelectItem value="vessels">Vessels Only</SelectItem>
              <SelectItem value="infrastructure">Infrastructure Only</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={(usingFallback ? false : !isConnected) || isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="mb-4 p-2 bg-card rounded-md">
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showVessels"
              className="rounded border-gray-300"
              checked={true}
              disabled={true} // Always show vessels
              onChange={() => {}} // No-op
            />
            <label htmlFor="showVessels" className="text-sm flex items-center">
              <Ship className="h-4 w-4 mr-1 text-blue-500" />
              Vessels {vessels.length > 0 && `(${vessels.length})`}
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showRefineries"
              className="rounded border-gray-300"
              checked={showRefineries}
              onChange={() => setShowRefineries(!showRefineries)}
            />
            <label htmlFor="showRefineries" className="text-sm flex items-center">
              <Factory className="h-4 w-4 mr-1 text-red-500" />
              Refineries {refineries.length > 0 && `(${refineries.length})`}
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPorts"
              className="rounded border-gray-300"
              checked={showPorts}
              onChange={() => setShowPorts(!showPorts)}
            />
            <label htmlFor="showPorts" className="text-sm flex items-center">
              <AnchorIcon className="h-4 w-4 mr-1 text-blue-600" />
              Ports {ports.length > 0 && `(${ports.length})`}
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showConnections"
              className="rounded border-gray-300"
              checked={showConnections}
              onChange={() => setShowConnections(!showConnections)}
            />
            <label htmlFor="showConnections" className="text-sm flex items-center">
              <Warehouse className="h-4 w-4 mr-1 text-purple-500" />
              Connections {connections.length > 0 && `(${connections.length})`}
            </label>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`col-span-1 md:col-span-2 rounded-lg overflow-hidden`} style={{ height }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Display vessels */}
            {(displayMode === 'all' || displayMode === 'vessels') && vessels.map(vessel => {
              // Parse vessel metadata if available
              let metadata = {
                heading: 0,
                course: 0,
                speed: 0,
                status: 'Unknown',
                lastPositionTime: new Date().toISOString()
              };
              
              try {
                if (vessel.metadata) {
                  metadata = JSON.parse(vessel.metadata);
                }
              } catch (e) {
                console.error('Failed to parse vessel metadata:', e);
              }
              
              // Only render if we have valid coordinates
              if (vessel.currentLat && vessel.currentLng) {
                const lat = parseFloat(vessel.currentLat);
                const lng = parseFloat(vessel.currentLng);
                
                if (isNaN(lat) || isNaN(lng)) return null;
                
                return (
                  <Marker
                    key={`vessel-${vessel.id}`}
                    position={[lat, lng]}
                    icon={vesselIcon(metadata.heading, metadata.speed, vessel.vesselType)}
                    eventHandlers={{
                      click: () => {
                        setSelectedVessel(vessel);
                        setSelectedRefinery(null);
                        setSelectedPort(null);
                      }
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{vessel.name}</p>
                        <p>IMO: {vessel.imo}</p>
                        <p>Type: {vessel.vesselType}</p>
                        <p>Speed: {metadata.speed} knots</p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-xs"
                          onClick={() => setSelectedVessel(vessel)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              
              return null;
            })}
            
            {/* Display refineries */}
            {showRefineries && (displayMode === 'all' || displayMode === 'infrastructure') && refineries.map(refinery => {
              // Only render if we have valid coordinates
              if (refinery.lat && refinery.lng) {
                const lat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat;
                const lng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng;
                
                if (isNaN(lat) || isNaN(lng)) return null;
                
                return (
                  <Marker
                    key={`refinery-${refinery.id}`}
                    position={[lat, lng]}
                    icon={refineryIcon()}
                    eventHandlers={{
                      click: () => {
                        setSelectedRefinery(refinery);
                        setSelectedVessel(null);
                        setSelectedPort(null);
                      }
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{refinery.name}</p>
                        <p>Country: {refinery.country}</p>
                        <p>Region: {refinery.region}</p>
                        {refinery.capacity && <p>Capacity: {refinery.capacity.toLocaleString()} bpd</p>}
                        {refinery.status && <p>Status: {refinery.status}</p>}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              
              return null;
            })}
            
            {/* Display ports */}
            {showPorts && (displayMode === 'all' || displayMode === 'infrastructure') && ports.map(port => {
              // Only render if we have valid coordinates
              if (port.lat && port.lng) {
                const lat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
                const lng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
                
                if (isNaN(lat) || isNaN(lng)) return null;
                
                return (
                  <Marker
                    key={`port-${port.id}`}
                    position={[lat, lng]}
                    icon={portIcon()}
                    eventHandlers={{
                      click: () => {
                        setSelectedPort(port);
                        setSelectedVessel(null);
                        setSelectedRefinery(null);
                      }
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{port.name}</p>
                        <p>Country: {port.country}</p>
                        <p>Region: {port.region}</p>
                        {port.capacity && <p>Capacity: {port.capacity.toLocaleString()} tons/year</p>}
                        {port.description && <p>{port.description}</p>}
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              
              return null;
            })}
            
            {/* Display connections between refineries and ports */}
            {showConnections && (displayMode === 'all' || displayMode === 'infrastructure') && connections.map(conn => {
              const refinery = refineries.find(r => r.id === conn.refineryId);
              const port = ports.find(p => p.id === conn.portId);
              
              if (!refinery || !port || !refinery.lat || !refinery.lng || !port.lat || !port.lng) {
                return null;
              }
              
              const refineryLat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat;
              const refineryLng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng;
              const portLat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
              const portLng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
              
              if (isNaN(refineryLat) || isNaN(refineryLng) || isNaN(portLat) || isNaN(portLng)) {
                return null;
              }
              
              // Generate a slightly curved line for better visualization
              // Calculate midpoint
              const midLat = (refineryLat + portLat) / 2;
              const midLng = (refineryLng + portLng) / 2;
              
              // Add a slight offset to create a curve
              const latOffset = (refineryLng - portLng) * 0.1;
              const lngOffset = (portLat - refineryLat) * 0.1;
              const curvedMidLat = midLat + latOffset;
              const curvedMidLng = midLng + lngOffset;
              
              // Create positions array with the midpoint
              const positions = [
                [refineryLat, refineryLng],
                [curvedMidLat, curvedMidLng],
                [portLat, portLng]
              ];
              
              return (
                <Polyline
                  key={`connection-${conn.id}`}
                  positions={positions}
                  color="#9c27b0"
                  weight={2}
                  opacity={0.7}
                  dashArray="5,5"
                />
              );
            })}
            
            <MapUpdate vessels={vessels} />
          </MapContainer>
        </div>
        
        <div className="col-span-1 flex flex-col space-y-4" style={{ maxHeight: height, overflowY: 'auto' }}>
          {/* Vessel Details */}
          {selectedVessel ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{selectedVessel.name}</h3>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Vessel</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                  <div className="flex items-center">
                    <Ship className="h-4 w-4 mr-2" />
                    <span className="text-muted-foreground">Type:</span>
                  </div>
                  <div>{selectedVessel.vesselType}</div>
                  
                  <div className="flex items-center">
                    <Anchor className="h-4 w-4 mr-2" />
                    <span className="text-muted-foreground">IMO:</span>
                  </div>
                  <div>{selectedVessel.imo}</div>
                  
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    <span className="text-muted-foreground">MMSI:</span>
                  </div>
                  <div>{selectedVessel.mmsi}</div>
                  
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 mr-2" />
                    <span className="text-muted-foreground">Flag:</span>
                  </div>
                  <div>{selectedVessel.flag}</div>
                </div>
                
                <Separator className="my-4" />
                
                <h4 className="font-semibold mb-2">Navigation Details</h4>
                
                {selectedVessel.metadata ? (
                  (() => {
                    try {
                      const metadata = JSON.parse(selectedVessel.metadata);
                      return (
                        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                          <div className="flex items-center">
                            <Navigation className="h-4 w-4 mr-2" />
                            <span className="text-muted-foreground">Heading:</span>
                          </div>
                          <div>{metadata.heading}°</div>
                          
                          <div className="flex items-center">
                            <span className="text-muted-foreground">Course:</span>
                          </div>
                          <div>{metadata.course}°</div>
                          
                          <div className="flex items-center">
                            <span className="text-muted-foreground">Speed:</span>
                          </div>
                          <div>{metadata.speed} knots</div>
                          
                          <div className="flex items-center">
                            <span className="text-muted-foreground">Status:</span>
                          </div>
                          <div>{metadata.status}</div>
                          
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-muted-foreground">Last Position:</span>
                          </div>
                          <div>{new Date(metadata.lastPositionTime).toLocaleString()}</div>
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-sm text-muted-foreground">Navigation data unavailable</p>;
                    }
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">Navigation data unavailable</p>
                )}
                
                <Separator className="my-4" />
                
                <h4 className="font-semibold mb-2">Voyage Information</h4>
                <div className="grid grid-cols-1 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">From:</span>{' '}
                    {selectedVessel.departurePort || 'Unknown'}
                    {selectedVessel.departureDate && (
                      <span className="text-xs block text-muted-foreground">
                        {new Date(selectedVessel.departureDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">To:</span>{' '}
                    {selectedVessel.destinationPort || 'Unknown'}
                    {selectedVessel.eta && (
                      <span className="text-xs block text-muted-foreground">
                        ETA: {new Date(selectedVessel.eta).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Cargo:</span>{' '}
                    {selectedVessel.cargoType || 'Unknown'}
                    {selectedVessel.cargoCapacity && (
                      <span className="text-xs block text-muted-foreground">
                        Capacity: {selectedVessel.cargoCapacity.toLocaleString()} tons
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedRefinery ? (
            /* Refinery Details */
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{selectedRefinery.name}</h3>
                  <Badge className="bg-red-100 text-red-800 border-red-200">Refinery</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                  <div className="flex items-center">
                    <Factory className="h-4 w-4 mr-2" />
                    <span className="text-muted-foreground">Country:</span>
                  </div>
                  <div>{selectedRefinery.country}</div>
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Region:</span>
                  </div>
                  <div>{selectedRefinery.region}</div>
                  
                  {selectedRefinery.capacity && (
                    <>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">Capacity:</span>
                      </div>
                      <div>{selectedRefinery.capacity.toLocaleString()} bpd</div>
                    </>
                  )}
                  
                  {selectedRefinery.status && (
                    <>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">Status:</span>
                      </div>
                      <div>{selectedRefinery.status}</div>
                    </>
                  )}
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Location:</span>
                  </div>
                  <div>
                    {typeof selectedRefinery.lat === 'string' 
                      ? parseFloat(selectedRefinery.lat).toFixed(4) 
                      : selectedRefinery.lat.toFixed(4)}, 
                    {typeof selectedRefinery.lng === 'string'
                      ? parseFloat(selectedRefinery.lng).toFixed(4)
                      : selectedRefinery.lng.toFixed(4)}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h4 className="font-semibold mb-2">Connected Ports</h4>
                
                {connections
                  .filter(conn => conn.refineryId === selectedRefinery.id)
                  .map(conn => {
                    const port = ports.find(p => p.id === conn.portId);
                    if (!port) return null;
                    
                    return (
                      <div 
                        key={`conn-${conn.id}`} 
                        className="p-2 mb-2 rounded border border-purple-200 bg-purple-50"
                        onClick={() => setSelectedPort(port)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="font-medium text-sm flex items-center">
                          <AnchorIcon className="h-3 w-3 mr-1 text-blue-600" />
                          {port.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{port.country}</div>
                      </div>
                    );
                  })
                }
                
                {connections.filter(conn => conn.refineryId === selectedRefinery.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">No connected ports found</p>
                )}
                
                <Separator className="my-4" />
                
                {/* AI Description Generation Panel */}
                <AIGenerationPanel
                  entityType="refinery"
                  entityId={selectedRefinery.id}
                  entityName={selectedRefinery.name}
                  currentDescription={selectedRefinery.description}
                  onDescriptionGenerated={(description) => {
                    // Update the selected refinery with the new description
                    setSelectedRefinery({
                      ...selectedRefinery,
                      description: description
                    });
                    refreshInfrastructureData();
                  }}
                />
              </CardContent>
            </Card>
          ) : selectedPort ? (
            /* Port Details */
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{selectedPort.name}</h3>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Port</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                  <div className="flex items-center">
                    <AnchorIcon className="h-4 w-4 mr-2" />
                    <span className="text-muted-foreground">Country:</span>
                  </div>
                  <div>{selectedPort.country}</div>
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Region:</span>
                  </div>
                  <div>{selectedPort.region}</div>
                  
                  {selectedPort.capacity && (
                    <>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">Capacity:</span>
                      </div>
                      <div>{selectedPort.capacity.toLocaleString()} tons/year</div>
                    </>
                  )}
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Location:</span>
                  </div>
                  <div>
                    {typeof selectedPort.lat === 'string' 
                      ? parseFloat(selectedPort.lat).toFixed(4) 
                      : selectedPort.lat.toFixed(4)}, 
                    {typeof selectedPort.lng === 'string'
                      ? parseFloat(selectedPort.lng).toFixed(4)
                      : selectedPort.lng.toFixed(4)}
                  </div>
                </div>
                
                {selectedPort.description && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm">{selectedPort.description}</p>
                  </>
                )}
                
                <Separator className="my-4" />
                
                <h4 className="font-semibold mb-2">Connected Refineries</h4>
                
                {connections
                  .filter(conn => conn.portId === selectedPort.id)
                  .map(conn => {
                    const refinery = refineries.find(r => r.id === conn.refineryId);
                    if (!refinery) return null;
                    
                    return (
                      <div 
                        key={`conn-${conn.id}`} 
                        className="p-2 mb-2 rounded border border-red-200 bg-red-50"
                        onClick={() => setSelectedRefinery(refinery)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="font-medium text-sm flex items-center">
                          <Factory className="h-3 w-3 mr-1 text-red-600" />
                          {refinery.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{refinery.country}</div>
                      </div>
                    );
                  })
                }
                
                {connections.filter(conn => conn.portId === selectedPort.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">No connected refineries found</p>
                )}
                
                <Separator className="my-4" />
                
                {/* AI Description Generation Panel */}
                <AIGenerationPanel
                  entityType="port"
                  entityId={selectedPort.id}
                  entityName={selectedPort.name}
                  currentDescription={selectedPort.description}
                  onDescriptionGenerated={(description) => {
                    // Update the selected port with the new description
                    setSelectedPort({
                      ...selectedPort,
                      description: description
                    });
                    refreshInfrastructureData();
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            /* No Selection - Summary Card */
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Maritime Assets</h3>
                <p className="text-muted-foreground mb-4">Select an item on the map to view details</p>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-2 text-center">
                    <div className="text-lg font-semibold text-blue-700">{vessels.length}</div>
                    <div className="text-xs text-blue-600">Vessels</div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-100 rounded-md p-2 text-center">
                    <div className="text-lg font-semibold text-red-700">{refineries.length}</div>
                    <div className="text-xs text-red-600">Refineries</div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-2 text-center">
                    <div className="text-lg font-semibold text-blue-700">{ports.length}</div>
                    <div className="text-xs text-blue-600">Ports</div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  {lastUpdated 
                    ? `Last updated: ${new Date(lastUpdated).toLocaleString()}`
                    : 'Waiting for data...'}
                </p>
                
                {/* Connection status indicator */}
                <div className="mt-2 flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <p className="text-xs text-muted-foreground">
                    {isConnected 
                      ? `Using ${usingFallback ? 'REST API' : 'WebSocket'} ${usingFallback ? '(fallback)' : '(real-time)'}`
                      : 'Reconnecting...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tabs for Lists */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="vessels">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="vessels" className="flex-1">
                    <Ship className="h-4 w-4 mr-1" />
                    Vessels
                  </TabsTrigger>
                  <TabsTrigger value="refineries" className="flex-1">
                    <Factory className="h-4 w-4 mr-1" />
                    Refineries
                  </TabsTrigger>
                  <TabsTrigger value="ports" className="flex-1">
                    <AnchorIcon className="h-4 w-4 mr-1" />
                    Ports
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="vessels">
                  <h3 className="text-lg font-semibold mb-2">Vessels List</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Showing {vessels.length} vessels in {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1).replace('_', ' ')}
                  </p>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {vessels.slice(0, 20).map((vessel) => (
                      <div 
                        key={vessel.id}
                        className={`p-2 rounded-md cursor-pointer hover:bg-accent ${
                          selectedVessel?.id === vessel.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedVessel(vessel);
                          setSelectedRefinery(null);
                          setSelectedPort(null);
                        }}
                      >
                        <div className="font-medium">{vessel.name}</div>
                        <div className="text-xs flex justify-between">
                          <span>{vessel.vesselType}</span>
                          <span>IMO: {vessel.imo}</span>
                        </div>
                      </div>
                    ))}
                    
                    {vessels.length > 20 && (
                      <p className="text-xs text-center text-muted-foreground pt-2">
                        + {vessels.length - 20} more vessels
                      </p>
                    )}
                    
                    {vessels.length === 0 && !isLoading && (
                      <p className="text-sm text-muted-foreground">
                        No vessels found in this region
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="refineries">
                  <h3 className="text-lg font-semibold mb-2">Refineries List</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Showing {refineries.length} refineries in {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1).replace('_', ' ')}
                  </p>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {refineries.map((refinery) => (
                      <div 
                        key={refinery.id}
                        className={`p-2 rounded-md cursor-pointer hover:bg-accent ${
                          selectedRefinery?.id === refinery.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedRefinery(refinery);
                          setSelectedVessel(null);
                          setSelectedPort(null);
                        }}
                      >
                        <div className="font-medium">{refinery.name}</div>
                        <div className="text-xs flex justify-between">
                          <span>{refinery.country}</span>
                          {refinery.capacity && <span>{refinery.capacity.toLocaleString()} bpd</span>}
                        </div>
                      </div>
                    ))}
                    
                    {refineries.length === 0 && !infrastructureLoading && (
                      <p className="text-sm text-muted-foreground">
                        No refineries found in this region
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="ports">
                  <h3 className="text-lg font-semibold mb-2">Ports List</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Showing {ports.length} ports in {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1).replace('_', ' ')}
                  </p>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ports.map((port) => (
                      <div 
                        key={port.id}
                        className={`p-2 rounded-md cursor-pointer hover:bg-accent ${
                          selectedPort?.id === port.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedPort(port);
                          setSelectedVessel(null);
                          setSelectedRefinery(null);
                        }}
                      >
                        <div className="font-medium">{port.name}</div>
                        <div className="text-xs flex justify-between">
                          <span>{port.country}</span>
                        </div>
                      </div>
                    ))}
                    
                    {ports.length === 0 && !infrastructureLoading && (
                      <p className="text-sm text-muted-foreground">
                        No ports found in this region
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}