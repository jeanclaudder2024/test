import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker for selected location
const selectedLocationIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RefineryLocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (lat: number, lng: number, locationName?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

interface LocationInfo {
  lat: number;
  lng: number;
  name?: string;
  country?: string;
  region?: string;
}

// Major oil regions with coordinates
const OIL_REGIONS = [
  { name: 'Persian Gulf', lat: 26.5, lng: 51.5, region: 'Middle East' },
  { name: 'North Sea', lat: 58.0, lng: 1.0, region: 'Europe' },
  { name: 'Gulf of Mexico', lat: 25.0, lng: -90.0, region: 'North America' },
  { name: 'Caspian Sea', lat: 42.0, lng: 50.0, region: 'Central Asia' },
  { name: 'West Africa Coast', lat: 5.0, lng: 2.0, region: 'Africa' },
  { name: 'Southeast Asia', lat: 3.0, lng: 110.0, region: 'Asia Pacific' },
];

function LocationSelector({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function RefineryLocationSelector({ 
  isOpen, 
  onClose, 
  onLocationSelected, 
  initialLat = 25.0, 
  initialLng = 50.0 
}: RefineryLocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [locationDetails, setLocationDetails] = useState<string>('');

  // Get location details using reverse geocoding
  const getLocationDetails = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const { country, state, city, town, village } = data.address;
        const locationName = city || town || village || 'Unknown Location';
        const fullDetails = `${locationName}, ${country}`;
        
        setLocationDetails(fullDetails);
        return { name: locationName, country, region: determineRegion(country) };
      }
    } catch (error) {
      console.error('Error getting location details:', error);
    }
    return null;
  };

  // Determine region based on country
  const determineRegion = (country: string): string => {
    const regionMap: { [key: string]: string } = {
      'Saudi Arabia': 'Middle East', 'UAE': 'Middle East', 'Kuwait': 'Middle East',
      'Qatar': 'Middle East', 'Iran': 'Middle East', 'Iraq': 'Middle East',
      'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
      'Norway': 'Europe', 'United Kingdom': 'Europe', 'Netherlands': 'Europe',
      'Russia': 'Europe', 'China': 'Asia Pacific', 'India': 'Asia Pacific',
      'Japan': 'Asia Pacific', 'South Korea': 'Asia Pacific', 'Singapore': 'Asia Pacific',
      'Nigeria': 'Africa', 'Angola': 'Africa', 'Libya': 'Africa',
      'Algeria': 'Africa', 'Egypt': 'Africa', 'Brazil': 'South America',
      'Venezuela': 'South America', 'Colombia': 'South America'
    };
    return regionMap[country] || 'Other';
  };

  // Handle location selection
  const handleLocationSelect = async (lat: number, lng: number) => {
    const location: LocationInfo = { lat, lng };
    setSelectedLocation(location);
    
    // Get location details
    const details = await getLocationDetails(lat, lng);
    if (details) {
      location.name = details.name;
      location.country = details.country;
      location.region = details.region;
      setSelectedLocation({ ...location });
    }
  };

  // Search for location
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        await handleLocationSelect(lat, lng);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Quick region selection
  const handleRegionSelect = (region: typeof OIL_REGIONS[0]) => {
    handleLocationSelect(region.lat, region.lng);
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelected(
        selectedLocation.lat, 
        selectedLocation.lng,
        locationDetails || selectedLocation.name
      );
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Select Refinery Location
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search and Quick Regions */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <Input
                placeholder="Search for a location (e.g., Ras Tanura, Saudi Arabia)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Region Selection */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Quick regions:</span>
              {OIL_REGIONS.map((region) => (
                <Badge
                  key={region.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleRegionSelect(region)}
                >
                  {region.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Map Container */}
          <div className="flex-1 rounded-lg overflow-hidden border">
            <MapContainer
              center={[selectedLocation?.lat || 25.0, selectedLocation?.lng || 50.0]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              key={`${selectedLocation?.lat || 25.0}-${selectedLocation?.lng || 50.0}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <LocationSelector onLocationSelect={handleLocationSelect} />
              
              {selectedLocation && (
                <Marker
                  position={[selectedLocation.lat, selectedLocation.lng]}
                  icon={selectedLocationIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Selected Location</strong><br />
                      {locationDetails && <span>{locationDetails}<br /></span>}
                      <span className="text-sm text-muted-foreground">
                        {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          
          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Coordinates</p>
                  <p className="text-sm text-muted-foreground">
                    Latitude: {selectedLocation.lat.toFixed(6)}, Longitude: {selectedLocation.lng.toFixed(6)}
                  </p>
                  {locationDetails && (
                    <p className="text-sm text-muted-foreground mt-1">{locationDetails}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedLocation(null)}>
                    Clear
                  </Button>
                  <Button onClick={handleConfirm}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Use Location
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {!selectedLocation && (
            <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
              Click anywhere on the map to select a location, search for a specific place, or use the quick region buttons above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}