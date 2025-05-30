import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Globe } from 'lucide-react';

interface RefineryLocationMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function RefineryLocationMap({ 
  onLocationSelect, 
  initialLat = 25.2048, 
  initialLng = 55.2708 
}: RefineryLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({
    lat: initialLat,
    lng: initialLng,
    address: ''
  });
  const [isSearching, setIsSearching] = useState(false);

  // Simulate map functionality with region-based coordinates
  const quickLocations = [
    { name: 'Saudi Arabia (Riyadh)', lat: 24.7136, lng: 46.6753 },
    { name: 'UAE (Abu Dhabi)', lat: 24.4539, lng: 54.3773 },
    { name: 'Qatar (Doha)', lat: 25.2854, lng: 51.5310 },
    { name: 'Kuwait (Kuwait City)', lat: 29.3759, lng: 47.9774 },
    { name: 'Oman (Muscat)', lat: 23.5880, lng: 58.3829 },
    { name: 'Bahrain (Manama)', lat: 26.0667, lng: 50.5577 },
    { name: 'Iraq (Baghdad)', lat: 33.3152, lng: 44.3661 },
    { name: 'Iran (Tehran)', lat: 35.6892, lng: 51.3890 },
    { name: 'Norway (Oslo)', lat: 59.9139, lng: 10.7522 },
    { name: 'UK (London)', lat: 51.5074, lng: -0.1278 },
    { name: 'USA (Houston)', lat: 29.7604, lng: -95.3698 },
    { name: 'Russia (Moscow)', lat: 55.7558, lng: 37.6173 }
  ];

  const handleLocationClick = (lat: number, lng: number, locationName?: string) => {
    setSelectedLocation({
      lat,
      lng,
      address: locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    });
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate geocoding search
    setTimeout(() => {
      // Simple location matching for common places
      const lowerQuery = searchQuery.toLowerCase();
      let foundLocation = quickLocations.find(loc => 
        loc.name.toLowerCase().includes(lowerQuery) ||
        lowerQuery.includes(loc.name.toLowerCase().split('(')[0].toLowerCase().trim())
      );
      
      if (foundLocation) {
        handleLocationClick(foundLocation.lat, foundLocation.lng, foundLocation.name);
      } else {
        // Generate random coordinates in oil-producing regions
        const randomLat = 20 + Math.random() * 40; // Between 20-60 degrees
        const randomLng = -10 + Math.random() * 80; // Between -10 to 70 degrees
        handleLocationClick(randomLat, randomLng, `Search result: ${searchQuery}`);
      }
      setIsSearching(false);
    }, 1000);
  };

  const handleConfirmLocation = () => {
    onLocationSelect(selectedLocation.lat, selectedLocation.lng, selectedLocation.address);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search">Search Location</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="search"
                placeholder="Enter city, country, or refinery name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
              />
              <Button 
                onClick={handleSearchLocation}
                disabled={isSearching}
                variant="outline"
                size="sm"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-slate-100 border-2 border-dashed border-slate-300">
        {/* Interactive Map Simulation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <Globe className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Interactive World Map</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a quick location or search for a specific area
            </p>
            
            {/* Quick Location Buttons */}
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {quickLocations.slice(0, 8).map((location) => (
                <Button
                  key={location.name}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleLocationClick(location.lat, location.lng, location.name)}
                >
                  {location.name.split('(')[0]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Location Indicator */}
        {selectedLocation && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="font-semibold text-sm">Selected Location</span>
            </div>
            <div className="text-xs space-y-1">
              <div><strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}</div>
              <div><strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}</div>
              {selectedLocation.address && (
                <div><strong>Address:</strong> {selectedLocation.address}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manual Coordinates Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="0.000001"
              value={selectedLocation.lat}
              onChange={(e) => handleLocationClick(parseFloat(e.target.value) || 0, selectedLocation.lng)}
              placeholder="25.2048"
            />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              step="0.000001"
              value={selectedLocation.lng}
              onChange={(e) => handleLocationClick(selectedLocation.lat, parseFloat(e.target.value) || 0)}
              placeholder="55.2708"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleConfirmLocation}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Confirm Location
        </Button>
      </div>
    </div>
  );
}