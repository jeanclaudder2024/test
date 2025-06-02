import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  MapPin, 
  Ship, 
  Anchor, 
  Building2,
  Fuel,
  Package,
  Shield,
  Zap,
  Waves,
  Clock,
  DollarSign
} from 'lucide-react';

interface AdvancedSearchFilters {
  name: string;
  region: string[];
  country: string[];
  portType: string[];
  vesselCapability: {
    minLength: number;
    maxLength: number;
    minDraught: number;
    maxDraught: number;
  };
  services: string[];
  facilities: string[];
  cargoTypes: string[];
  operationalStatus: string[];
  capacityRange: [number, number];
  distanceFromCoords: {
    lat: number;
    lng: number;
    radius: number;
  } | null;
}

interface SearchResult {
  port: any;
  matchScore: number;
  matchReasons: string[];
  recommendationTags: string[];
}

export function AdvancedPortSearch({ onResults }: { onResults: (results: SearchResult[]) => void }) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    name: '',
    region: [],
    country: [],
    portType: [],
    vesselCapability: {
      minLength: 0,
      maxLength: 400,
      minDraught: 0,
      maxDraught: 25
    },
    services: [],
    facilities: [],
    cargoTypes: [],
    operationalStatus: [],
    capacityRange: [0, 10000000],
    distanceFromCoords: null
  });

  const [isSearching, setIsSearching] = useState(false);

  // Available options from the database
  const { data: searchOptions } = useQuery({
    queryKey: ['/api/ports/search-options'],
    queryFn: async () => {
      const response = await fetch('/api/ports/search-options');
      return response.json();
    }
  });

  const availableServices = [
    'Bunkering', 'Waste Reception', 'Ship Repair', 'Pilotage', 'Tugboat Assistance',
    'Container Handling', 'Bulk Cargo', 'Break Bulk', 'Roll-on/Roll-off', 'Cruise Terminal',
    'Dry Dock', 'Fresh Water Supply', 'Provisions Supply', 'Crew Change', 'Medical Services'
  ];

  const availableFacilities = [
    'Container Terminal', 'Oil Terminal', 'LNG Terminal', 'Bulk Terminal', 'General Cargo Terminal',
    'Passenger Terminal', 'Ferry Terminal', 'Yacht Marina', 'Shipyard', 'Dry Dock',
    'Storage Warehouses', 'Cold Storage', 'Tank Farm', 'Rail Connection', 'Road Access'
  ];

  const availableCargoTypes = [
    'Crude Oil', 'Refined Petroleum', 'LNG', 'LPG', 'Chemicals', 'Containers',
    'Dry Bulk', 'Liquid Bulk', 'Break Bulk', 'Project Cargo', 'Automobiles',
    'Grain', 'Coal', 'Iron Ore', 'General Cargo'
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/ports/advanced-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      const results = await response.json();
      onResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const updateFilter = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof AdvancedSearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(v => v !== value)
        : [...(prev[key] as string[]), value]
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Advanced Port Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="space-y-2">
          <Label>Port Name</Label>
          <Input
            placeholder="Search by port name..."
            value={filters.name}
            onChange={(e) => updateFilter('name', e.target.value)}
          />
        </div>

        {/* Geographic Filters */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Geographic Filters
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Region</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {searchOptions?.regions?.map((region: string) => (
                  <div key={region} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.region.includes(region)}
                      onCheckedChange={() => toggleArrayFilter('region', region)}
                    />
                    <Label className="text-sm">{region}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Country</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {searchOptions?.countries?.slice(0, 10).map((country: string) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.country.includes(country)}
                      onCheckedChange={() => toggleArrayFilter('country', country)}
                    />
                    <Label className="text-sm">{country}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Vessel Capability Requirements */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Ship className="h-4 w-4 mr-2" />
            Vessel Capability Requirements
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vessel Length Range (m)</Label>
              <div className="px-2">
                <Slider
                  value={[filters.vesselCapability.minLength, filters.vesselCapability.maxLength]}
                  onValueChange={([min, max]) => 
                    updateFilter('vesselCapability', { 
                      ...filters.vesselCapability, 
                      minLength: min, 
                      maxLength: max 
                    })
                  }
                  max={400}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{filters.vesselCapability.minLength}m</span>
                  <span>{filters.vesselCapability.maxLength}m</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Maximum Draught (m)</Label>
              <div className="px-2">
                <Slider
                  value={[filters.vesselCapability.minDraught, filters.vesselCapability.maxDraught]}
                  onValueChange={([min, max]) => 
                    updateFilter('vesselCapability', { 
                      ...filters.vesselCapability, 
                      minDraught: min, 
                      maxDraught: max 
                    })
                  }
                  max={25}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{filters.vesselCapability.minDraught}m</span>
                  <span>{filters.vesselCapability.maxDraught}m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Services & Facilities */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Required Services & Facilities
          </h4>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium">Services</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {availableServices.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.services.includes(service)}
                      onCheckedChange={() => toggleArrayFilter('services', service)}
                    />
                    <Label className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Facilities</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {availableFacilities.map((facility) => (
                  <div key={facility} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.facilities.includes(facility)}
                      onCheckedChange={() => toggleArrayFilter('facilities', facility)}
                    />
                    <Label className="text-sm">{facility}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Cargo Types */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Cargo Handling Capability
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            {availableCargoTypes.map((cargoType) => (
              <div key={cargoType} className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.cargoTypes.includes(cargoType)}
                  onCheckedChange={() => toggleArrayFilter('cargoTypes', cargoType)}
                />
                <Label className="text-sm">{cargoType}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Port Capacity */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Anchor className="h-4 w-4 mr-2" />
            Port Capacity Range (TEU)
          </h4>
          
          <div className="px-2">
            <Slider
              value={filters.capacityRange}
              onValueChange={(value) => updateFilter('capacityRange', value as [number, number])}
              max={10000000}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{(filters.capacityRange[0] / 1000000).toFixed(1)}M TEU</span>
              <span>{(filters.capacityRange[1] / 1000000).toFixed(1)}M TEU</span>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="w-full"
          size="lg"
        >
          {isSearching ? 'Searching...' : 'Search Ports'}
          <Search className="h-4 w-4 ml-2" />
        </Button>

        {/* Active Filters Summary */}
        {Object.values(filters).some(v => 
          (Array.isArray(v) && v.length > 0) || 
          (typeof v === 'string' && v.length > 0) ||
          (typeof v === 'object' && v !== null && !Array.isArray(v))
        ) && (
          <div className="pt-4 border-t">
            <h5 className="text-sm font-medium mb-2">Active Filters:</h5>
            <div className="flex flex-wrap gap-1">
              {filters.name && (
                <Badge variant="secondary" className="text-xs">
                  Name: {filters.name}
                </Badge>
              )}
              {filters.region.map(region => (
                <Badge key={region} variant="secondary" className="text-xs">
                  {region}
                </Badge>
              ))}
              {filters.services.map(service => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {filters.cargoTypes.map(cargo => (
                <Badge key={cargo} variant="outline" className="text-xs">
                  {cargo}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}