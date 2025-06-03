import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, Anchor, RefreshCw, MapIcon, Factory, Map, Search, Filter, Layers, ArrowRight } from 'lucide-react';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom vessel icon
const createVesselIcon = (vesselType: string) => {
  const isOilVessel = vesselType?.toLowerCase().includes('tanker') || 
                     vesselType?.toLowerCase().includes('oil') || 
                     vesselType?.toLowerCase().includes('crude');
  
  const bgColor = isOilVessel ? '#ef4444' : '#3b82f6';
  const shadowColor = isOilVessel ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
  
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, ${bgColor}, ${bgColor}dd);
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 8px ${shadowColor}, 0 2px 4px rgba(0,0,0,0.2);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">🚢</div>
    </div>`,
    className: 'vessel-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createPortIcon = () => {
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #10b981, #059669);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0,0,0,0.2);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 8px;
        font-weight: bold;
      ">⚓</div>
    </div>`,
    className: 'port-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const createRefineryIcon = () => {
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #f59e0b, #d97706);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4), 0 2px 4px rgba(0,0,0,0.2);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 8px;
        font-weight: bold;
      ">🏭</div>
    </div>`,
    className: 'refinery-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

export default function OilVesselMap() {
  const [mapStyle, setMapStyle] = useState('street');
  const [searchTerm, setSearchTerm] = useState('');
  const [vesselFilter, setVesselFilter] = useState('all');
  const [showTrafficDensity, setShowTrafficDensity] = useState(false);
  const [showPortZones, setShowPortZones] = useState(false);
  const [showDestinationLines, setShowDestinationLines] = useState(false);
  const [selectedVesselLines, setSelectedVesselLines] = useState<Set<number>>(new Set());
  const [portRadius, setPortRadius] = useState(20);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.0, 55.0]);
  const { toast } = useToast();

  const { vessels, loading, error, connectionStatus, refetch } = useVesselWebSocket({
    region: 'global',
    loadAllVessels: true,
    refreshInterval: 30000
  });

  // Fetch ports data
  const { data: ports = [] } = useQuery({
    queryKey: ['/api/ports'],
    enabled: true
  });

  // Fetch refineries data
  const { data: refineries = [] } = useQuery({
    queryKey: ['/api/refineries'],
    enabled: true
  });

  // Location search function
  const searchForLocation = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        toast({
          title: 'Location Found',
          description: `Found: ${data[0].display_name}`,
        });
      } else {
        toast({
          title: 'Location Not Found',
          description: 'Try searching for a port, city, or landmark',
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

  // Filter for oil vessels only
  const oilVessels = vessels.filter(vessel => {
    const vesselType = vessel.vesselType?.toLowerCase() || '';
    const isOilVessel = vesselType.includes('tanker') || 
           vesselType.includes('oil') || 
           vesselType.includes('crude') || 
           vesselType.includes('lng') || 
           vesselType.includes('lpg') || 
           vesselType.includes('chemical');
    
    // Apply vessel filter
    if (vesselFilter !== 'all') {
      if (vesselFilter === 'tanker' && !vesselType.includes('tanker')) return false;
      if (vesselFilter === 'crude' && !vesselType.includes('crude')) return false;
      if (vesselFilter === 'lng' && !vesselType.includes('lng')) return false;
      if (vesselFilter === 'lpg' && !vesselType.includes('lpg')) return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = vessel.name?.toLowerCase().includes(searchLower) ||
                           vessel.flag?.toLowerCase().includes(searchLower) ||
                           vessel.destination?.toLowerCase().includes(searchLower);
      return isOilVessel && matchesSearch;
    }
    
    return isOilVessel;
  });

  // Filter vessels with valid coordinates
  const mappableVessels = oilVessels.filter(vessel => 
    vessel.currentLat && 
    vessel.currentLng && 
    !isNaN(parseFloat(vessel.currentLat.toString())) && 
    !isNaN(parseFloat(vessel.currentLng.toString()))
  );

  const defaultCenter: [number, number] = [25.0, 55.0]; // Dubai area
  const defaultZoom = 4;

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Ship className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Map</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapIcon className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Oil Vessel Map</h1>
            <p className="text-sm text-gray-600">
              Showing {mappableVessels.length} oil vessels on map
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus === 'connected' ? 'Live Data' : 'Disconnected'}
          </Badge>
          
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {mappableVessels.length} Vessels
          </Badge>
          
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {ports.length} Ports
          </Badge>
          
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            {refineries.length} Refineries
          </Badge>
          
          <Button
            onClick={refetch}
            disabled={loading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Map Controls */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Location Search */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Search Location</label>
            <div className="flex gap-2">
              <Input
                placeholder="Search vessels, ports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchForLocation()}
                className="text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={searchForLocation}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Vessel Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Vessel Type</label>
            <Select value={vesselFilter} onValueChange={setVesselFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Oil Vessels</SelectItem>
                <SelectItem value="tanker">Oil Tankers</SelectItem>
                <SelectItem value="crude">Crude Carriers</SelectItem>
                <SelectItem value="lng">LNG Carriers</SelectItem>
                <SelectItem value="lpg">LPG Carriers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Map Style */}
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

          {/* Map Features */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Map Features</label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPortZones(!showPortZones)}
                className="justify-start"
              >
                <Anchor className="h-4 w-4 mr-2" />
                {showPortZones ? 'Hide' : 'Show'} Port Zones
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTrafficDensity(!showTrafficDensity)}
                className="justify-start"
              >
                <Layers className="h-4 w-4 mr-2" />
                {showTrafficDensity ? 'Hide' : 'Show'} Traffic
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDestinationLines(!showDestinationLines)}
                className="justify-start"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {showDestinationLines ? 'Hide' : 'Show'} Destinations
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading vessel data...</span>
            </div>
          </div>
        )}
        
        <MapContainer
          center={mapCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          maxZoom={18}
          minZoom={2}
          key={`${mapCenter[0]}-${mapCenter[1]}`}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked={mapStyle === 'street'} name="Street Map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer checked={mapStyle === 'maritime'} name="Maritime">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
              />
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {/* Vessel Markers */}
          {mappableVessels.map((vessel) => {
            const lat = parseFloat(vessel.currentLat?.toString() || '0');
            const lng = parseFloat(vessel.currentLng?.toString() || '0');
            
            if (isNaN(lat) || isNaN(lng)) return null;
            
            return (
              <Marker
                key={vessel.id}
                position={[lat, lng]}
                icon={createVesselIcon(vessel.vesselType || '')}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-lg mb-2">{vessel.name}</div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="secondary" className="text-xs">
                          {vessel.vesselType || 'Unknown'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">IMO:</span>
                        <span className="font-mono">{vessel.imo || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">MMSI:</span>
                        <span className="font-mono">{vessel.mmsi || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flag:</span>
                        <span>{vessel.flag || 'Unknown'}</span>
                      </div>
                      
                      {vessel.status && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge variant={vessel.status === 'active' ? 'default' : 'secondary'}>
                            {vessel.status}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-mono text-xs">
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t space-y-2">
                      {/* Show route button for all vessels - will add destination if missing */}
                      <Button 
                        size="sm" 
                        variant={selectedVesselLines.has(vessel.id) ? "default" : "outline"}
                        className="w-full"
                        onClick={() => {
                          const newSelected = new Set(selectedVesselLines);
                          if (selectedVesselLines.has(vessel.id)) {
                            newSelected.delete(vessel.id);
                          } else {
                            newSelected.add(vessel.id);
                          }
                          setSelectedVesselLines(newSelected);
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {selectedVesselLines.has(vessel.id) ? 'Hide Route' : 'Show Route'}
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.open(`/vessels/${vessel.id}`, '_blank')}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Port Markers */}
          {ports.map((port: any) => {
            const lat = parseFloat(port.lat?.toString() || '0');
            const lng = parseFloat(port.lng?.toString() || '0');
            
            if (isNaN(lat) || isNaN(lng)) return null;
            
            return (
              <Marker
                key={`port-${port.id}`}
                position={[lat, lng]}
                icon={createPortIcon()}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-lg mb-2">{port.name}</div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">Port</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{port.country}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Region:</span>
                        <span className="font-medium">{port.region}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-mono text-xs">
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Vessel Destination Lines */}
          {(showDestinationLines || selectedVesselLines.size > 0) && vessels.map((vessel: any) => {
            // Show line if global toggle is on OR if this specific vessel is selected
            const shouldShowLine = showDestinationLines || selectedVesselLines.has(vessel.id);
            const vesselLat = parseFloat(vessel.currentLat?.toString() || '0');
            const vesselLng = parseFloat(vessel.currentLng?.toString() || '0');
            const destLat = parseFloat(vessel.destinationLat?.toString() || '0');
            const destLng = parseFloat(vessel.destinationLng?.toString() || '0');
            
            // Only show line if both vessel and destination positions are valid AND should be shown
            if (!shouldShowLine || isNaN(vesselLat) || isNaN(vesselLng) || isNaN(destLat) || isNaN(destLng) || 
                (destLat === 0 && destLng === 0)) {
              return null;
            }
            
            // Different colors for different vessel types
            const getLineColor = (type: string) => {
              switch (type.toLowerCase()) {
                case 'crude oil tanker': return '#ef4444'; // red
                case 'product tanker': return '#3b82f6'; // blue  
                case 'lng tanker': return '#10b981'; // green
                case 'lpg tanker': return '#f59e0b'; // amber
                default: return '#6b7280'; // gray
              }
            };
            
            return (
              <Polyline
                key={`route-${vessel.id}`}
                positions={[[vesselLat, vesselLng], [destLat, destLng]]}
                color={getLineColor(vessel.vesselType)}
                weight={2}
                opacity={0.7}
                dashArray="5, 10"
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-lg mb-2">Route: {vessel.name}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium">{vessel.departurePort || 'Current Position'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium">{vessel.destinationPort || 'Destination'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{vessel.vesselType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium capitalize">{vessel.status}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* Refinery Markers */}
          {refineries.map((refinery: any) => {
            const lat = parseFloat(refinery.latitude?.toString() || '0');
            const lng = parseFloat(refinery.longitude?.toString() || '0');
            
            if (isNaN(lat) || isNaN(lng)) return null;
            
            return (
              <Marker
                key={`refinery-${refinery.id}`}
                position={[lat, lng]}
                icon={createRefineryIcon()}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-lg mb-2">{refinery.name}</div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">Refinery</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{refinery.country}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{refinery.capacity || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-mono text-xs">
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Port Zones */}
          {showPortZones && (ports as any[]).map((port: any) => {
            const lat = parseFloat(port.latitude?.toString() || port.lat?.toString() || '0');
            const lng = parseFloat(port.longitude?.toString() || port.lng?.toString() || '0');
            
            if (isNaN(lat) || isNaN(lng)) return null;
            
            return (
              <Circle
                key={`port-zone-${port.id}`}
                center={[lat, lng]}
                radius={portRadius * 1000}
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: '5,5'
                }}
              >
                <Popup>
                  <div className="text-center">
                    <strong>{port.name}</strong><br />
                    Port operational zone: {portRadius} km
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* Traffic Density Visualization */}
          {showTrafficDensity && mappableVessels.length > 0 && (() => {
            const clusters = new Map();
            const gridSize = 2; // degrees
            
            mappableVessels.forEach(vessel => {
              const lat = parseFloat(vessel.currentLat?.toString() || '0');
              const lng = parseFloat(vessel.currentLng?.toString() || '0');
              const gridLat = Math.floor(lat / gridSize) * gridSize;
              const gridLng = Math.floor(lng / gridSize) * gridSize;
              const key = `${gridLat}-${gridLng}`;
              
              if (!clusters.has(key)) {
                clusters.set(key, { lat: gridLat + gridSize/2, lng: gridLng + gridSize/2, count: 0 });
              }
              clusters.get(key).count++;
            });
            
            return Array.from(clusters.values())
              .filter(cluster => cluster.count >= 3)
              .map((cluster, index) => (
                <Circle
                  key={`traffic-${index}`}
                  center={[cluster.lat, cluster.lng]}
                  radius={Math.min(cluster.count * 5000, 50000)}
                  pathOptions={{
                    color: cluster.count > 10 ? '#dc2626' : cluster.count > 5 ? '#f59e0b' : '#10b981',
                    fillColor: cluster.count > 10 ? '#dc2626' : cluster.count > 5 ? '#f59e0b' : '#10b981',
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Traffic Density</strong><br />
                      {cluster.count} vessels in area<br />
                      Density: {cluster.count > 10 ? 'High' : cluster.count > 5 ? 'Medium' : 'Low'}
                    </div>
                  </Popup>
                </Circle>
              ));
          })()}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <div className="text-sm font-semibold mb-2">Map Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full border border-white shadow"></div>
              <span>{mappableVessels.length} Oil Vessels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow"></div>
              <span>{(ports as any[]).length} Ports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full border border-white shadow"></div>
              <span>{(refineries as any[]).length} Refineries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}