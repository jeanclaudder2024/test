import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ship, Anchor, RefreshCw, MapIcon } from 'lucide-react';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';

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
  
  return L.divIcon({
    html: `<div style="
      background-color: ${isOilVessel ? '#FF6B6B' : '#4ECDC4'};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: 'vessel-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export default function OilVesselMap() {
  const { vessels, loading, error, connectionStatus, refetch } = useVesselWebSocket({
    region: 'global',
    loadAllVessels: true,
    refreshInterval: 30000
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
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <div className="text-sm font-semibold mb-2">Oil Vessels</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-red-400 rounded-full border border-white shadow"></div>
            <span>{mappableVessels.length} vessels shown</span>
          </div>
        </div>
      </div>
    </div>
  );
}