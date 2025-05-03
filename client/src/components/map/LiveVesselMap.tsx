import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Vessel } from '@shared/schema';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Anchor, Info, Navigation, Flag, Calendar, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(3);
  
  // Use our WebSocket hook for real-time vessel data with fallback to REST API polling
  const { 
    vessels, 
    isConnected, 
    lastUpdated, 
    error, 
    isLoading, 
    refreshData,
    usingFallback
  } = useVesselWebSocket({ 
    region: selectedRegion,
    pollingInterval: 30000 // 30 seconds polling interval for REST API fallback
  });

  // Handle region selection change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    // Reset selected vessel when changing regions
    setSelectedVessel(null);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap justify-between items-center mb-4 p-2 bg-card rounded-md">
        <div className="flex items-center space-x-2">
          <Ship className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Live Vessel Tracking</h2>
          
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
        
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-[180px]">
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
          
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={(usingFallback ? false : !isConnected) || isLoading}
          >
            Refresh
          </Button>
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
            
            {vessels.map(vessel => {
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
                    key={vessel.id}
                    position={[lat, lng]}
                    icon={vesselIcon(metadata.heading, metadata.speed, vessel.vesselType)}
                    eventHandlers={{
                      click: () => {
                        setSelectedVessel(vessel);
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
            
            <MapUpdate vessels={vessels} />
          </MapContainer>
        </div>
        
        <div className="col-span-1 flex flex-col space-y-4" style={{ maxHeight: height, overflowY: 'auto' }}>
          {selectedVessel ? (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">{selectedVessel.name}</h3>
                
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
          ) : (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Vessel Information</h3>
                <p className="text-muted-foreground">Select a vessel on the map to view details</p>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Vessel Count</h4>
                  <Badge variant="secondary" className="text-lg font-bold py-2 px-4">
                    {vessels.length}
                  </Badge>
                  
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
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardContent className="pt-6">
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
                    onClick={() => setSelectedVessel(vessel)}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}