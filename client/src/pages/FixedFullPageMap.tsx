import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship, Anchor, Factory, MapIcon, RefreshCw } from 'lucide-react';

// Define basic interface for map items
interface MapItem {
  id: number;
  name: string;
  lat: string;
  lng: string;
}

// Basic vessel interface with only essential properties
interface Vessel extends MapItem {
  vesselType: string;
  imo: string;
  mmsi: string;
  flag: string;
}

export default function FixedFullPageMap() {
  // State for vessels data
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load data when component mounts
  useEffect(() => {
    const fetchVessels = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/vessels/polling');
        const data = await response.json();
        
        // Process vessels data to ensure it has required properties
        const processedVessels = (data.vessels || []).filter((v: any) => {
          return v && v.id && v.name && v.currentLat && v.currentLng && 
                 v.vesselType && v.imo && v.mmsi && v.flag;
        }).map((v: any) => ({
          id: v.id,
          name: v.name,
          lat: v.currentLat,
          lng: v.currentLng,
          vesselType: v.vesselType,
          imo: v.imo,
          mmsi: v.mmsi,
          flag: v.flag
        }));
        
        setVessels(processedVessels);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vessel data:', err);
        setError('Failed to load map data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchVessels();
    
    // Set up polling for vessel updates
    const intervalId = setInterval(fetchVessels, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Generate vessel icon
  const getVesselIcon = () => {
    return L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1085/1085482.png', // Using a static ship icon
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };
  
  return (
    <div className="h-screen w-full flex flex-col">
      <div className="bg-background p-4 shadow-md border-b">
        <div className="flex items-center space-x-2">
          <MapIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Maritime Intelligence Map</h1>
        </div>
      </div>
      
      <div className="flex-grow relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Loading map data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <Card className="p-6">
              <p className="text-red-500">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          </div>
        ) : (
          <MapContainer
            center={[20, 0]} 
            zoom={3}
            style={{ height: '100%', width: '100%' }}
          >
            {/* Base map layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Vessels Layer */}
            <LayerGroup>
              {vessels.map((vessel) => (
                <Marker
                  key={vessel.id}
                  position={[parseFloat(vessel.lat), parseFloat(vessel.lng)]}
                  icon={getVesselIcon()}
                >
                  <Popup>
                    <div className="text-sm">
                      <h3 className="font-bold">{vessel.name}</h3>
                      <p><strong>IMO:</strong> {vessel.imo}</p>
                      <p><strong>MMSI:</strong> {vessel.mmsi}</p>
                      <p><strong>Type:</strong> {vessel.vesselType}</p>
                      <p><strong>Flag:</strong> {vessel.flag}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </MapContainer>
        )}
      </div>
      
      {/* Map info panel */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            <span>Vessels: {vessels.length}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}