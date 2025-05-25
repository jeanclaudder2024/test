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
import { useQuery } from '@tanstack/react-query';

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
  const [refineryMarkers, setRefineryMarkers] = useState<any[]>([]);
  const [portMarkers, setPortMarkers] = useState<any[]>([]);

  // Fetch refineries and ports to display on map
  const { data: refineries } = useQuery({
    queryKey: ['/api/refineries'],
    enabled: isOpen
  });

  const { data: ports } = useQuery({
    queryKey: ['/api/ports'],
    enabled: isOpen
  });

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

      // Force map to resize properly in modal
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

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
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        loadLeaflet();
      }, 100);
      
      return () => clearTimeout(timer);
    }

    // Cleanup
    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
  }, [isOpen]);

  // Add refineries and ports to map when data is loaded
  useEffect(() => {
    if (!mapInstance || !isOpen) return;

    const L = (window as any).L;
    if (!L) return;

    // Clear existing markers
    refineryMarkers.forEach(marker => mapInstance.removeLayer(marker));
    portMarkers.forEach(marker => mapInstance.removeLayer(marker));
    setRefineryMarkers([]);
    setPortMarkers([]);

    // Add refinery markers
    if (refineries?.length > 0) {
      const newRefineryMarkers = refineries.map((refinery: any) => {
        if (!refinery.lat || !refinery.lng) return null;
        
        const refineryIcon = L.divIcon({
          className: 'refinery-marker',
          html: `<div style="
            background: #ef4444;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const marker = L.marker([parseFloat(refinery.lat), parseFloat(refinery.lng)], { 
          icon: refineryIcon 
        }).addTo(mapInstance);

        marker.bindPopup(`
          <div class="text-sm">
            <strong class="text-red-600">🏭 ${refinery.name}</strong><br/>
            <span class="text-gray-600">${refinery.country}</span><br/>
            <span class="text-xs text-gray-500">${refinery.lat}, ${refinery.lng}</span>
          </div>
        `);

        return marker;
      }).filter(Boolean);

      setRefineryMarkers(newRefineryMarkers);
    }

    // Add port markers
    if (ports?.length > 0) {
      const newPortMarkers = ports.map((port: any) => {
        if (!port.lat || !port.lng) return null;
        
        const portIcon = L.divIcon({
          className: 'port-marker',
          html: `<div style="
            background: #3b82f6;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const marker = L.marker([parseFloat(port.lat), parseFloat(port.lng)], { 
          icon: portIcon 
        }).addTo(mapInstance);

        marker.bindPopup(`
          <div class="text-sm">
            <strong class="text-blue-600">⚓ ${port.name}</strong><br/>
            <span class="text-gray-600">${port.country}</span><br/>
            <span class="text-xs text-gray-500">${port.lat}, ${port.lng}</span>
          </div>
        `);

        return marker;
      }).filter(Boolean);

      setPortMarkers(newPortMarkers);
    }
  }, [mapInstance, refineries, ports, isOpen]);

  // Additional effect to resize map when modal is opened
  useEffect(() => {
    if (isOpen && mapInstance) {
      // Small delay to let modal finish opening animation
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 200);
    }
  }, [isOpen, mapInstance]);

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
              className="w-full h-96 rounded-lg border border-border bg-gray-100"
              style={{ minHeight: '384px' }}
              onClick={(e) => {
                // Fallback click handler if map doesn't load
                if (!mapInstance) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  // Convert pixel coordinates to approximate lat/lng
                  const lat = initialLat + (rect.height / 2 - y) * 0.001;
                  const lng = initialLng + (x - rect.width / 2) * 0.001;
                  
                  setSelectedCoords({ lat, lng });
                }
              }}
            >
              {!mapInstance && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-50 rounded-lg">
                  <div className="text-center p-4">
                    <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-700 text-sm">Loading interactive map...</p>
                    <p className="text-blue-600 text-xs mt-1">Click anywhere to select coordinates</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Map Legend */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
              <div className="text-xs font-medium text-gray-700 mb-2">Map Legend</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                  <span className="text-gray-600">🏭 Refineries ({refineries?.length || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                  <span className="text-gray-600">⚓ Ports ({ports?.length || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                  <span className="text-gray-600">📍 Selected Location</span>
                </div>
              </div>
            </div>
            
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