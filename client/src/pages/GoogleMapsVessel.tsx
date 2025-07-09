import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, Anchor, RefreshCw, MapIcon, Factory, MapPin, Search, Filter, Layers, ArrowRight, Info } from 'lucide-react';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

// Extend the Window interface to include google
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function GoogleMapsVessel() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vesselFilter, setVesselFilter] = useState('all');
  const { toast } = useToast();

  const { vessels, loading, error, connectionStatus, refetch } = useVesselWebSocket({
    region: 'global',
    loadAllVessels: true,
    refreshInterval: 30000
  });

  // Fetch ports data
  const { data: ports = [] } = useQuery({
    queryKey: ['/api/ports'],
    enabled: true,
    staleTime: 0
  });

  // Fetch refineries data
  const { data: refineries = [] } = useQuery({
    queryKey: ['/api/refineries'],
    enabled: true,
    staleTime: 0
  });

  // Fetch oil types
  const { data: oilTypes = [] } = useQuery({
    queryKey: ['/api/admin/oil-types'],
    enabled: true,
    staleTime: 0
  });

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAVyB_LKIVJwkcUIPcgKeioPWH71ulpays&callback=initMap&libraries=maps,marker&v=beta';
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        initializeMap();
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 25.0, lng: 55.0 }, // Arabian Gulf center
        zoom: 6,
        mapId: 'DEMO_MAP_ID',
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#193045' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f2' }]
          }
        ]
      });

      setIsMapLoaded(true);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      toast({
        title: 'Map Loading Error',
        description: 'Failed to load Google Maps. Please refresh the page.',
        variant: 'destructive'
      });
    }
  };

  // Update markers when data changes
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const newMarkers: any[] = [];

    // Filter vessels based on search and filter criteria
    const filteredVessels = vessels.filter(vessel => {
      const matchesSearch = !searchTerm || 
        vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.cargoType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.vesselType?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = vesselFilter === 'all' || 
        vessel.oilType === vesselFilter ||
        vessel.cargoType === vesselFilter ||
        vessel.vesselType === vesselFilter;

      return matchesSearch && matchesFilter;
    });

    // Add vessel markers
    filteredVessels.forEach(vessel => {
      if (vessel.latitude && vessel.longitude) {
        try {
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapInstance.current,
            position: { lat: vessel.latitude, lng: vessel.longitude },
            title: vessel.name,
            content: createVesselMarkerContent(vessel)
          });

          // Add click listener
          marker.addListener('click', () => {
            const infoWindow = new window.google.maps.InfoWindow({
              content: createVesselInfoContent(vessel)
            });
            infoWindow.open(mapInstance.current, marker);
          });

          newMarkers.push(marker);
        } catch (error) {
          console.error('Error creating vessel marker:', error);
        }
      }
    });

    // Add port markers
    ports.forEach(port => {
      if (port.latitude && port.longitude) {
        try {
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapInstance.current,
            position: { lat: port.latitude, lng: port.longitude },
            title: port.name,
            content: createPortMarkerContent()
          });

          // Add click listener
          marker.addListener('click', () => {
            const infoWindow = new window.google.maps.InfoWindow({
              content: createPortInfoContent(port)
            });
            infoWindow.open(mapInstance.current, marker);
          });

          newMarkers.push(marker);
        } catch (error) {
          console.error('Error creating port marker:', error);
        }
      }
    });

    // Add refinery markers
    refineries.forEach(refinery => {
      if (refinery.latitude && refinery.longitude) {
        try {
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapInstance.current,
            position: { lat: refinery.latitude, lng: refinery.longitude },
            title: refinery.name,
            content: createRefineryMarkerContent()
          });

          // Add click listener
          marker.addListener('click', () => {
            const infoWindow = new window.google.maps.InfoWindow({
              content: createRefineryInfoContent(refinery)
            });
            infoWindow.open(mapInstance.current, marker);
          });

          newMarkers.push(marker);
        } catch (error) {
          console.error('Error creating refinery marker:', error);
        }
      }
    });

    markersRef.current = newMarkers;
  }, [isMapLoaded, vessels, ports, refineries, searchTerm, vesselFilter]);

  const createVesselMarkerContent = (vessel: any) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #ef4444, #dc2626);
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        cursor: pointer;
      ">🚢</div>
    `;
    return div;
  };

  const createPortMarkerContent = () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #10b981, #059669);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        cursor: pointer;
      ">⚓</div>
    `;
    return div;
  };

  const createRefineryMarkerContent = () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #f59e0b, #d97706);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        cursor: pointer;
      ">🏭</div>
    `;
    return div;
  };

  const createVesselInfoContent = (vessel: any) => {
    return `
      <div style="padding: 10px; max-width: 300px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">${vessel.name}</h3>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Type:</strong> ${vessel.vesselType || 'Oil Tanker'}</p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Cargo:</strong> ${vessel.cargoType || 'N/A'}</p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Capacity:</strong> ${vessel.cargoCapacity ? vessel.cargoCapacity.toLocaleString() + ' barrels' : 'N/A'}</p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Status:</strong> ${vessel.status || 'Active'}</p>
        <div style="margin-top: 10px;">
          <a href="/vessels/${vessel.id}" style="
            background: #3b82f6;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
          ">View Details</a>
        </div>
      </div>
    `;
  };

  const createPortInfoContent = (port: any) => {
    return `
      <div style="padding: 10px; max-width: 300px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">${port.name}</h3>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Country:</strong> ${port.country || 'N/A'}</p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Type:</strong> ${port.portType || 'Commercial Port'}</p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Capacity:</strong> ${port.capacity || 'N/A'}</p>
        <div style="margin-top: 10px;">
          <a href="/ports/${port.id}" style="
            background: #10b981;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
          ">View Details</a>
        </div>
      </div>
    `;
  };

  const createRefineryInfoContent = (refinery: any) => {
    return `
      <div style="padding: 10px; max-width: 300px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">${refinery.name}</h3>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Country:</strong> ${refinery.country || 'N/A'}</p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Capacity:</strong> ${refinery.processingCapacity ? refinery.processingCapacity.toLocaleString() + ' bpd' : 'N/A'}</p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Type:</strong> ${refinery.refineryType || 'Oil Refinery'}</p>
        <div style="margin-top: 10px;">
          <a href="/refineries/${refinery.id}" style="
            background: #f59e0b;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
          ">View Details</a>
        </div>
      </div>
    `;
  };

  const filteredVessels = vessels.filter(vessel => {
    const matchesSearch = !searchTerm || 
      vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.cargoType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.vesselType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = vesselFilter === 'all' || 
      vessel.oilType === vesselFilter ||
      vessel.cargoType === vesselFilter ||
      vessel.vesselType === vesselFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MapIcon className="h-6 w-6 mr-2 text-blue-600" />
                Maritime Tracking Map
              </h1>
              <Badge variant="outline" className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{connectionStatus === 'connected' ? 'Live Data' : 'Disconnected'}</span>
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vessels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={vesselFilter} onValueChange={setVesselFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  {oilTypes.map((type: any) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Crude Oil">Crude Oil</SelectItem>
                  <SelectItem value="Refined Products">Refined Products</SelectItem>
                  <SelectItem value="LNG">LNG</SelectItem>
                  <SelectItem value="LPG">LPG</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={refetch}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          
          {!isMapLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Google Maps...</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <Card className="absolute bottom-4 left-4 w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Layers className="h-4 w-4 mr-2" />
                Map Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white mr-2 flex items-center justify-center text-white text-[8px]">🚢</div>
                  <span>Oil Vessels ({filteredVessels.length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white mr-2 flex items-center justify-center text-white text-[8px]">⚓</div>
                  <span>Ports ({ports.length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white mr-2 flex items-center justify-center text-white text-[8px]">🏭</div>
                  <span>Refineries ({refineries.length})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="absolute top-4 right-4 w-64">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{filteredVessels.length}</div>
                  <div className="text-xs text-gray-500">Vessels</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{ports.length}</div>
                  <div className="text-xs text-gray-500">Ports</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{refineries.length}</div>
                  <div className="text-xs text-gray-500">Refineries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {connectionStatus === 'connected' ? 'LIVE' : 'OFF'}
                  </div>
                  <div className="text-xs text-gray-500">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}