import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";
import 'leaflet/dist/leaflet.css';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

// Fix Leaflet default marker icons
const L = typeof window !== 'undefined' ? (window as any).L : null;
if (L) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Map click handler component
function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function LocationSelector({
  isOpen,
  onClose,
  onLocationSelect,
  initialLat = 25.2048,
  initialLng = 55.2708
}: LocationSelectorProps) {
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);
  const [searchQuery, setSearchQuery] = useState('');

  // Update coordinates when initial values change
  useEffect(() => {
    setSelectedLat(initialLat);
    setSelectedLng(initialLng);
  }, [initialLat, initialLng]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Use Nominatim (OpenStreetMap's geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        setSelectedLat(lat);
        setSelectedLng(lng);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLat, selectedLng);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[650px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Location
          </DialogTitle>
          <DialogDescription>
            Click on the map to select coordinates for the refinery location
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 p-4 border-b">
          <div className="flex-1">
            <Label htmlFor="search">Search Location</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="search"
                placeholder="Enter city, country, or refinery name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <Label>Latitude</Label>
              <Input
                value={selectedLat.toFixed(6)}
                onChange={(e) => setSelectedLat(parseFloat(e.target.value) || 0)}
                className="w-32 font-mono"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                value={selectedLng.toFixed(6)}
                onChange={(e) => setSelectedLng(parseFloat(e.target.value) || 0)}
                className="w-32 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="w-full h-full rounded-lg border overflow-hidden" style={{ height: '350px' }}>
            {isOpen && (
              <MapContainer
                center={[selectedLat, selectedLng]}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                zoomControl={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker 
                  position={[selectedLat, selectedLng]}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const position = marker.getLatLng();
                      setSelectedLat(position.lat);
                      setSelectedLng(position.lng);
                    }
                  }}
                />
                <MapClickHandler onLocationChange={(lat, lng) => {
                  setSelectedLat(lat);
                  setSelectedLng(lng);
                }} />
              </MapContainer>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t bg-muted/30">
          <div className="text-sm text-muted-foreground">
            <div>Click on the map or drag the marker to select a location</div>
            <div className="font-medium text-foreground mt-1">
              Selected: {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
              <MapPin className="h-4 w-4 mr-2" />
              Confirm & Use Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}