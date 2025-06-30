import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationSelector({
  isOpen,
  onClose,
  onLocationSelect,
  initialLat = 25.2048,
  initialLng = 55.2708
}: LocationSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    // Load Leaflet dynamically if not already loaded
    const loadLeaflet = async () => {
      if (!window.L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // Initialize map
      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      mapInstance.current = window.L.map(mapRef.current).setView([selectedLat, selectedLng], 8);

      // Add tile layer (using OpenStreetMap)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstance.current);

      // Add initial marker
      markerRef.current = window.L.marker([selectedLat, selectedLng], {
        draggable: true
      }).addTo(mapInstance.current);

      // Handle map clicks
      mapInstance.current.on('click', function(e: any) {
        const { lat, lng } = e.latlng;
        setSelectedLat(lat);
        setSelectedLng(lng);
        
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
      });

      // Handle marker drag
      markerRef.current.on('dragend', function(e: any) {
        const { lat, lng } = e.target.getLatLng();
        setSelectedLat(lat);
        setSelectedLng(lng);
      });
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isOpen, initialLat, initialLng]);

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

        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 12);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
        }
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
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Location
          </DialogTitle>
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
                className="w-24"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                value={selectedLng.toFixed(6)}
                onChange={(e) => setSelectedLng(parseFloat(e.target.value) || 0)}
                className="w-24"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div 
            ref={mapRef} 
            className="w-full h-full rounded-lg"
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className="flex justify-between items-center p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Click on the map or drag the marker to select a location
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}