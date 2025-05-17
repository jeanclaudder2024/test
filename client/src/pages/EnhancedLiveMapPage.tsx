import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { Vessel, Refinery, Port } from '@shared/schema';
import { 
  MapContainer, 
  TileLayer, 
  useMap, 
  Marker, 
  Popup,
  ZoomControl,
  Tooltip
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Ship, 
  Factory, 
  Anchor, 
  Info, 
  Loader2, 
  Navigation, 
  Flag, 
  Calendar, 
  ArrowRight
} from 'lucide-react';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Ensure Leaflet CSS is imported
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Custom vessel marker icons based on vessel type
const getVesselIcon = (vesselType: string = '') => {
  const type = vesselType.toLowerCase();
  let color = '#3388ff'; // Default blue
  
  if (type.includes('crude')) {
    color = '#e53935'; // Red for crude oil tankers
  } else if (type.includes('product')) {
    color = '#1e88e5'; // Blue for product tankers
  } else if (type.includes('lng')) {
    color = '#43a047'; // Green for LNG tankers
  } else if (type.includes('lpg')) {
    color = '#ffb300'; // Amber for LPG
  } else if (type.includes('chemical')) {
    color = '#8e24aa'; // Purple for chemical tankers
  }
  
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.8" stroke="#fff" stroke-width="1.5"/>
      <path d="M7,13 L17,13 L17,16 L7,16 Z M12,6 L16,11 L8,11 Z" fill="#fff"/>
    </svg>
  `;
  
  const svgUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
  
  return new L.Icon({
    iconUrl: svgUrl,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

// Refinery icon
const refineryIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
      <circle cx="12" cy="12" r="10" fill="#d32f2f" fill-opacity="0.8" stroke="#fff" stroke-width="1.5"/>
      <path d="M8,8 L10,8 L10,16 L8,16 Z M11,11 L13,11 L13,16 L11,16 Z M14,8 L16,8 L16,16 L14,16 Z M10,4 L14,8 L12,8 L12,6 L10,6 Z" fill="#fff"/>
    </svg>
  `)}`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

// Port icon
const portIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <circle cx="12" cy="12" r="10" fill="#1976d2" fill-opacity="0.8" stroke="#fff" stroke-width="1.5"/>
      <path d="M12,4 L12,6 A 6,6 0 1,1 6,12 A 6,6 0 1,1 18,12 A 6,6 0 1,1 12,18 L12,20 M12,12 L12,18" stroke="#fff" stroke-width="2" fill="none"/>
    </svg>
  `)}`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

// MapEvents component to handle map events
function MapEvents() {
  const map = useMap();
  
  React.useEffect(() => {
    if (map) {
      // Enable proper map wrapping around the globe
      map.options.worldCopyJump = true;
      
      // Handle resize
      const handleResize = () => {
        map.invalidateSize();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [map]);
  
  return null;
}

// Main component
export default function EnhancedLiveMapPage() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite' | 'nautical'>('dark');
  const [showVesselDetail, setShowVesselDetail] = useState(false);
  const [showRefineryDetail, setShowRefineryDetail] = useState(false);
  const [showPortDetail, setShowPortDetail] = useState(false);
  const { toast } = useToast();
  
  // Get vessels from WebSocket
  const { 
    vessels, 
    connected: wsConnected, 
    loading: vesselsLoading, 
    error: vesselError,
    lastUpdated,
    connectionType
  } = useVesselWebSocket({ 
    loadAllVessels: true,
    page: 1,
    pageSize: 1000,
    trackPortProximity: true,
    proximityRadius: 50
  });
  
  // Get refineries and ports
  const { 
    refineries, 
    ports, 
    loading: infrastructureLoading, 
    error: infrastructureError 
  } = useMaritimeData();
  
  // Handle selection of maritime entities
  const handleVesselClick = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setSelectedRefinery(null);
    setSelectedPort(null);
    setShowVesselDetail(true);
  };
  
  const handleRefineryClick = (refinery: Refinery) => {
    setSelectedRefinery(refinery);
    setSelectedVessel(null);
    setSelectedPort(null);
    setShowRefineryDetail(true);
  };
  
  const handlePortClick = (port: Port) => {
    setSelectedPort(port);
    setSelectedVessel(null);
    setSelectedRefinery(null);
    setShowPortDetail(true);
  };
  
  // Handle map style change
  const toggleMapStyle = () => {
    const styles: Array<'dark' | 'light' | 'satellite' | 'nautical'> = ['dark', 'light', 'satellite', 'nautical'];
    const currentIndex = styles.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setMapStyle(styles[nextIndex]);
  };
  
  // Show connection status
  const connectionStatus = wsConnected 
    ? { label: 'Live', color: 'bg-green-500' }
    : { label: 'Polling', color: 'bg-amber-500' };
  
  // Show loading state
  const isLoading = vesselsLoading || infrastructureLoading;

  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>Live Maritime Tracking | Enhanced Map View</title>
      </Helmet>
      
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Live Maritime Intelligence</h1>
            <p className="text-muted-foreground">Track vessels, refineries and ports in real-time</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className={`h-2.5 w-2.5 rounded-full ${connectionStatus.color}`}></div>
              <span className="text-sm font-medium">{connectionStatus.label} Data</span>
            </div>
            
            <Badge variant="outline" className="ml-2">
              {vessels.length} Vessels
            </Badge>
            
            <Badge variant="outline">
              {refineries.length} Refineries
            </Badge>
            
            <Badge variant="outline">
              {ports.length} Ports
            </Badge>
            
            <Button
              onClick={toggleMapStyle}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              Change Map Style
            </Button>
          </div>
        </div>
        
        {/* Main content area with map and detail card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Map container - takes up 3/4 of the width on large screens */}
          <div className="lg:col-span-3 h-[80vh] rounded-lg overflow-hidden border">
            {/* Show loading overlay if loading data */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-background rounded-lg p-4 flex items-center space-x-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="font-medium">Loading maritime data...</span>
                </div>
              </div>
            )}
            
            {/* The map itself */}
            <MapContainer
              center={[20, 0]}
              zoom={3}
              className="w-full h-full"
              zoomControl={false}
              worldCopyJump={true}
            >
              {/* Map style layers */}
              {mapStyle === 'dark' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
              )}
              
              {mapStyle === 'light' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
              )}
              
              {mapStyle === 'satellite' && (
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              )}
              
              {mapStyle === 'nautical' && (
                <TileLayer
                  attribution='Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
                  url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                />
              )}
              
              <ZoomControl position="bottomright" />
              
              <MapEvents />

              {/* Vessel Markers */}
              {vessels.length > 0 && (
                <MarkerClusterGroup
                  chunkedLoading
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={false}
                  disableClusteringAtZoom={8}
                  maxClusterRadius={50}
                >
                  {vessels.map(vessel => (
                    <Marker
                      key={vessel.id}
                      position={[
                        parseFloat(String(vessel.currentLat)), 
                        parseFloat(String(vessel.currentLng))
                      ]}
                      icon={getVesselIcon(vessel.vesselType)}
                      eventHandlers={{
                        click: () => handleVesselClick(vessel),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                        <div>
                          <div className="font-semibold">{vessel.name}</div>
                          <div className="text-xs text-muted-foreground">{vessel.vesselType}</div>
                        </div>
                      </Tooltip>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              )}
              
              {/* Refinery Markers */}
              {refineries.length > 0 && (
                <MarkerClusterGroup
                  chunkedLoading
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={false}
                  disableClusteringAtZoom={7}
                  maxClusterRadius={80}
                >
                  {refineries.map(refinery => (
                    refinery.lat && refinery.lng && (
                      <Marker
                        key={refinery.id}
                        position={[
                          parseFloat(String(refinery.lat)), 
                          parseFloat(String(refinery.lng))
                        ]}
                        icon={refineryIcon}
                        eventHandlers={{
                          click: () => handleRefineryClick(refinery),
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                          <div>
                            <div className="font-semibold">{refinery.name}</div>
                            <div className="text-xs text-muted-foreground">{refinery.country}</div>
                          </div>
                        </Tooltip>
                      </Marker>
                    )
                  ))}
                </MarkerClusterGroup>
              )}
              
              {/* Port Markers */}
              {ports.length > 0 && (
                <MarkerClusterGroup
                  chunkedLoading
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={false}
                  disableClusteringAtZoom={7}
                  maxClusterRadius={80}
                >
                  {ports.map(port => (
                    port.lat && port.lng && (
                      <Marker
                        key={port.id}
                        position={[
                          parseFloat(String(port.lat)), 
                          parseFloat(String(port.lng))
                        ]}
                        icon={portIcon}
                        eventHandlers={{
                          click: () => handlePortClick(port),
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                          <div>
                            <div className="font-semibold">{port.name}</div>
                            <div className="text-xs text-muted-foreground">{port.country}</div>
                          </div>
                        </Tooltip>
                      </Marker>
                    )
                  ))}
                </MarkerClusterGroup>
              )}
            </MapContainer>
          </div>
          
          {/* Detail information panel */}
          <div className="lg:col-span-1">
            {/* Connection stats and info */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Maritime Intelligence</span>
                  <div className={`flex items-center space-x-2 text-sm ${wsConnected ? 'text-green-500' : 'text-amber-500'}`}>
                    <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <span>{wsConnected ? 'Live' : 'Polling'}</span>
                  </div>
                </CardTitle>
                <CardDescription>
                  {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}` : 'Connecting...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 border rounded-md">
                    <Ship className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-lg font-bold">{vessels.length}</div>
                    <div className="text-xs">Vessels</div>
                  </div>
                  <div className="text-center p-2 border rounded-md">
                    <Factory className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-lg font-bold">{refineries.length}</div>
                    <div className="text-xs">Refineries</div>
                  </div>
                  <div className="text-center p-2 border rounded-md">
                    <Anchor className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-lg font-bold">{ports.length}</div>
                    <div className="text-xs">Ports</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Selected item detail card */}
            {showVesselDetail && selectedVessel && (
              <Card className="border-blue-200 shadow-lg animate-in fade-in">
                <CardHeader className="pb-2 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-blue-900">{selectedVessel.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowVesselDetail(false)}>×</Button>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Ship className="h-4 w-4" />
                    <span>{selectedVessel.vesselType || 'Vessel'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Vessel properties */}
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">IMO:</div>
                      <div className="font-medium">{selectedVessel.imo || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">MMSI:</div>
                      <div className="font-medium">{selectedVessel.mmsi || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Flag:</div>
                      <div className="font-medium flex items-center">
                        <Flag className="h-3 w-3 mr-1" />
                        {selectedVessel.flag || 'N/A'}
                      </div>
                      
                      <div className="text-muted-foreground">Current Region:</div>
                      <div className="font-medium">{selectedVessel.currentRegion || 'N/A'}</div>
                    </div>
                    
                    {/* Voyage info */}
                    {(selectedVessel.departureLat && selectedVessel.departureLng && 
                     selectedVessel.destinationLat && selectedVessel.destinationLng) && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-1">Voyage Information</h4>
                        <div className="p-2 rounded-md bg-blue-50 text-xs">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                            <div>
                              <div className="font-medium">{selectedVessel.departurePort || 'Unknown Port'}</div>
                              <div className="text-muted-foreground">Departure</div>
                            </div>
                          </div>
                          
                          <div className="h-6 border-l border-dashed border-blue-300 ml-1"></div>
                          
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-800 mr-2"></div>
                            <div>
                              <div className="font-medium">{selectedVessel.destinationPort || 'Unknown Destination'}</div>
                              <div className="text-muted-foreground">Destination</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Cargo info if available */}
                    {selectedVessel.cargoType && (
                      <div className="p-2 border rounded-md mt-2">
                        <div className="text-xs font-medium mb-1">Cargo</div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{selectedVessel.cargoType}</span>
                          <Badge variant="secondary">
                            {selectedVessel.deadweight
                              ? `${selectedVessel.deadweight.toLocaleString()} DWT`
                              : 'Unknown quantity'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Refinery details card */}
            {showRefineryDetail && selectedRefinery && (
              <Card className="border-red-200 shadow-lg animate-in fade-in">
                <CardHeader className="pb-2 bg-gradient-to-b from-red-50 to-white border-b border-red-100">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-red-900">{selectedRefinery.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowRefineryDetail(false)}>×</Button>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    <span>{selectedRefinery.country}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Refinery properties */}
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Operator:</div>
                      <div className="font-medium">{selectedRefinery.operator || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Region:</div>
                      <div className="font-medium">{selectedRefinery.region || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Capacity:</div>
                      <div className="font-medium">
                        {selectedRefinery.capacity 
                          ? `${selectedRefinery.capacity.toLocaleString()} bpd` 
                          : 'N/A'}
                      </div>
                      
                      <div className="text-muted-foreground">Status:</div>
                      <div className="font-medium">
                        <Badge variant={selectedRefinery.status === 'Active' ? 'default' : 'secondary'}>
                          {selectedRefinery.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Products section if available */}
                    {selectedRefinery.products && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-1">Products</h4>
                        <div className="text-sm">{selectedRefinery.products}</div>
                      </div>
                    )}
                    
                    {/* Description if available */}
                    {selectedRefinery.description && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-1">Description</h4>
                        <div className="text-sm text-muted-foreground">{selectedRefinery.description}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Port details card */}
            {showPortDetail && selectedPort && (
              <Card className="border-blue-200 shadow-lg animate-in fade-in">
                <CardHeader className="pb-2 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-blue-900">{selectedPort.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowPortDetail(false)}>×</Button>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Anchor className="h-4 w-4" />
                    <span>{selectedPort.country}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Port properties */}
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Type:</div>
                      <div className="font-medium">{selectedPort.type || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Region:</div>
                      <div className="font-medium">{selectedPort.region || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Type:</div>
                      <div className="font-medium">{selectedPort.type || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Status:</div>
                      <div className="font-medium">
                        <Badge variant={selectedPort.status === 'Open' ? 'default' : 'secondary'}>
                          {selectedPort.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Capacity information */}
                    {selectedPort.capacity && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-1">Capacity</h4>
                        <div className="text-sm">
                          {typeof selectedPort.capacity === 'number' 
                            ? `${selectedPort.capacity.toLocaleString()} tons`
                            : selectedPort.capacity}
                        </div>
                      </div>
                    )}
                    
                    {/* Description if available */}
                    {selectedPort.description && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-1">Description</h4>
                        <div className="text-sm text-muted-foreground">{selectedPort.description}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show connection error if applicable */}
            {(vesselError || infrastructureError) && (
              <Card className="bg-destructive/10 border-destructive/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-destructive text-lg">Connection Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive">
                    {vesselError?.message || infrastructureError?.message || 'Failed to connect to server'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-2 w-full"
                    onClick={() => window.location.reload()}
                  >
                    Reconnect
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Show status when no entity is selected */}
            {!showVesselDetail && !showRefineryDetail && !showPortDetail && !vesselError && !infrastructureError && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Map Legend</CardTitle>
                  <CardDescription>Click on markers to see details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white"></div>
                      <div className="text-sm">Crude Oil Tankers</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white"></div>
                      <div className="text-sm">Product Tankers</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white"></div>
                      <div className="text-sm">LNG Tankers</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white"></div>
                      <div className="text-sm">Chemical Tankers</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center">
                        <Factory className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-sm">Refineries</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center">
                        <Anchor className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-sm">Ports</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}