import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, CheckCircle, RotateCcw } from 'lucide-react';

interface CoordinateMapSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCoordinateSelect: (lat: number, lng: number) => void;
  title?: string;
  description?: string;
  initialLat?: number;
  initialLng?: number;
}

export function CoordinateMapSelector({ 
  isOpen,
  onClose,
  onCoordinateSelect, 
  title = "Select Location",
  description = "Click on the map to select coordinates",
  initialLat = 25.276987, 
  initialLng = 55.296249
}: CoordinateMapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);

  useEffect(() => {
    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      // Check if Leaflet is already loaded
      if (!(window as any).L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initializeMap();
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || mapInstance) return;

      const L = (window as any).L;
      
      // Initialize map
      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      // Add click handler
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker
        if (markerInstance) {
          map.removeLayer(markerInstance);
        }

        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: #3b82f6;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              background: white;
              width: 8px;
              height: 8px;
              border-radius: 50%;
            "></div>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // Add new marker
        const newMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        setMarkerInstance(newMarker);
        setSelectedCoords({ lat, lng });
      });

      setMapInstance(map);
    };

    if (isOpen) {
      loadLeaflet();
    }

    // Cleanup
    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
  }, [isOpen]);

  const handleConfirmSelection = () => {
    if (selectedCoords) {
      onCoordinateSelect(selectedCoords.lat, selectedCoords.lng);
      onClose();
    }
  };

  const handleResetMap = () => {
    if (mapInstance && markerInstance) {
      mapInstance.removeLayer(markerInstance);
      setMarkerInstance(null);
      setSelectedCoords(null);
    }
  };

  const quickLocations = [
    { name: "Dubai, UAE", lat: 25.276987, lng: 55.296249 },
    { name: "Singapore", lat: 1.3521, lng: 103.8198 },
    { name: "Rotterdam, Netherlands", lat: 51.9244, lng: 4.4777 },
    { name: "Hong Kong", lat: 22.3193, lng: 114.1694 },
    { name: "Hamburg, Germany", lat: 53.5511, lng: 9.9937 },
    { name: "Los Angeles, USA", lat: 34.0522, lng: -118.2437 }
  ];

  const handleQuickLocation = (lat: number, lng: number) => {
    if (mapInstance) {
      mapInstance.setView([lat, lng], 8);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">{title}</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {description}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Location Buttons */}
          <div>
            <h5 className="text-sm font-medium mb-2">Quick Locations:</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickLocations.map((location) => (
                <Button
                  key={location.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLocation(location.lat, location.lng)}
                  className="text-xs"
                >
                  {location.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border border-border"
              style={{ minHeight: '384px' }}
            />
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetMap}
                className="bg-white/90 backdrop-blur-sm"
                disabled={!selectedCoords}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Coordinates Display */}
          {selectedCoords && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Coordinates Selected</h4>
                    <p className="text-sm text-green-700">
                      Latitude: {selectedCoords.lat.toFixed(6)}, Longitude: {selectedCoords.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSelection}
              disabled={!selectedCoords}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Use These Coordinates
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}