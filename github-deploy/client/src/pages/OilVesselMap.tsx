import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ship, Anchor, RefreshCw, MapIcon, Factory } from 'lucide-react';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useQuery } from '@tanstack/react-query';

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

  // Filter for oil vessels only
  const oilVessels = vessels.filter(vessel => {
    const vesselType = vessel.vesselType?.toLowerCase() || '';
    return vesselType.includes('tanker') || 
           vesselType.includes('oil') || 
           vesselType.includes('crude') || 
           vesselType.includes('lng') || 
           vesselType.includes('lpg') || 
           vesselType.includes('chemical');
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
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          maxZoom={18}
          minZoom={2}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
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
                    
                    <div className="mt-3 pt-2 border-t">
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