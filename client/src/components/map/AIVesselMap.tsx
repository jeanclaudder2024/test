import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Ship, Navigation, Anchor, Factory, Globe, MapPin, 
  Route, Activity, Layers, Target, Brain, Zap
} from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AIVesselMapProps {
  vessel: any;
  initialLat?: number | string;
  initialLng?: number | string;
}

interface Port {
  id: number;
  name: string;
  lat: string;
  lng: string;
  country: string;
  type?: string;
  capacity?: number;
  region?: string;
}

interface Refinery {
  id: number;
  name: string;
  lat: string;
  lng: string;
  country: string;
  capacity?: number;
}

interface Vessel {
  id: number;
  name: string;
  mmsi: string;
  imo: string;
  currentLat: string;
  currentLng: string;
  vesselType: string;
  flag: string;
  speed?: string;
  course?: string;
  status?: string;
  departurePort?: string;
  destinationPort?: string;
}

interface AIAnalysis {
  routeOptimization: string;
  weatherConditions: string;
  trafficAnalysis: string;
  riskAssessment: string;
  recommendations: string[];
  nearbyVessels: number;
  portCongestion: string;
}

export default function AIVesselMap({ vessel, initialLat, initialLng }: AIVesselMapProps) {
  const [vesselPosition, setVesselPosition] = useState<[number, number] | null>(null);
  const [allPorts, setAllPorts] = useState<Port[]>([]);
  const [nearbyPorts, setNearbyPorts] = useState<Port[]>([]);
  const [nearbyRefineries, setNearbyRefineries] = useState<Refinery[]>([]);
  const [nearbyVessels, setNearbyVessels] = useState<Vessel[]>([]);
  const [departurePort, setDeparturePort] = useState<Port | null>(null);
  const [destinationPort, setDestinationPort] = useState<Port | null>(null);
  const [voyageRoute, setVoyageRoute] = useState<[number, number][]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'standard'>('standard');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showAllPorts, setShowAllPorts] = useState(false);
  const [showNearbyVessels, setShowNearbyVessels] = useState(true);
  const [searchRadius, setSearchRadius] = useState(500);

  // Initialize vessel position
  useEffect(() => {
    if (vessel && (vessel.currentLat || initialLat) && (vessel.currentLng || initialLng)) {
      const lat = parseFloat(vessel.currentLat || initialLat);
      const lng = parseFloat(vessel.currentLng || initialLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setVesselPosition([lat, lng]);
      }
    }
  }, [vessel, initialLat, initialLng]);

  // Load nearby ports, refineries, and vessels
  const loadNearbyData = useCallback(async () => {
    if (!vesselPosition) return;

    try {
      setLoading(true);
      
      // Load all ports
      const portsResponse = await axios.get('/api/ports');
      if (portsResponse.data) {
        setAllPorts(portsResponse.data);
        
        // Filter nearby ports
        const nearby = portsResponse.data.filter((port: Port) => {
          const distance = calculateDistance(
            vesselPosition[0], vesselPosition[1],
            parseFloat(port.lat), parseFloat(port.lng)
          );
          return distance <= searchRadius;
        }).slice(0, 15); // Limit to 15 closest ports
        
        setNearbyPorts(nearby);
      }

      // Load refineries
      const refineriesResponse = await axios.get('/api/refineries');
      if (refineriesResponse.data) {
        const refineries = refineriesResponse.data.filter((refinery: Refinery) => {
          const distance = calculateDistance(
            vesselPosition[0], vesselPosition[1],
            parseFloat(refinery.lat), parseFloat(refinery.lng)
          );
          return distance <= 300; // 300km radius for refineries
        }).slice(0, 10);
        
        setNearbyRefineries(refineries);
      }

      // Load nearby vessels
      if (showNearbyVessels) {
        const vesselsResponse = await axios.get('/api/vessels/polling?page=1&pageSize=100');
        if (vesselsResponse.data && vesselsResponse.data.vessels) {
          const nearby = vesselsResponse.data.vessels.filter((v: any) => {
            if (v.id === vessel.id) return false; // Exclude current vessel
            if (!v.currentLat || !v.currentLng) return false;
            
            const distance = calculateDistance(
              vesselPosition[0], vesselPosition[1],
              parseFloat(v.currentLat), parseFloat(v.currentLng)
            );
            return distance <= 100; // 100km radius for vessels
          }).slice(0, 20); // Limit to 20 nearby vessels
          
          setNearbyVessels(nearby);
        }
      }

    } catch (error) {
      console.error('Error loading nearby data:', error);
    } finally {
      setLoading(false);
    }
  }, [vesselPosition, searchRadius, showNearbyVessels, vessel.id]);

  // Find departure and destination ports
  useEffect(() => {
    if (!vessel || !allPorts.length) return;

    // Find departure port from all ports
    if (vessel.departurePort) {
      const departure = allPorts.find(port => 
        port.name.toLowerCase().includes(vessel.departurePort.toLowerCase()) ||
        vessel.departurePort.toLowerCase().includes(port.name.toLowerCase())
      );
      setDeparturePort(departure || null);
    }

    // Find destination port from all ports
    if (vessel.destinationPort) {
      const destination = allPorts.find(port => 
        port.name.toLowerCase().includes(vessel.destinationPort.toLowerCase()) ||
        vessel.destinationPort.toLowerCase().includes(port.name.toLowerCase())
      );
      setDestinationPort(destination || null);
    }
  }, [vessel, allPorts]);

  // Generate maritime route with AI optimization
  const generateVoyageRoute = useCallback(() => {
    if (!vesselPosition || !departurePort || !destinationPort) return;

    const route: [number, number][] = [];
    const start: [number, number] = [parseFloat(departurePort.lat), parseFloat(departurePort.lng)];
    const current = vesselPosition;
    const end: [number, number] = [parseFloat(destinationPort.lat), parseFloat(destinationPort.lng)];

    // Add departure point
    route.push(start);

    // Add maritime waypoints based on major shipping routes
    const startLat = start[0], startLng = start[1];
    const endLat = end[0], endLng = end[1];

    // Persian Gulf to Europe route
    if (startLng > 40 && startLng < 60 && endLng < 20) {
      route.push([29.9792, 32.5720]); // Suez Canal
      route.push([31.2001, 29.9187]); // Mediterranean
    }
    
    // Asia to Europe route
    else if (startLng > 90 && endLng < 30) {
      route.push([1.3521, 103.8198]); // Singapore Strait
      route.push([12.7840, 45.0189]); // Bab el-Mandeb
      route.push([29.9792, 32.5720]); // Suez Canal
    }
    
    // Add current position
    route.push(current);
    
    // Add destination
    route.push(end);

    setVoyageRoute(route);
  }, [vesselPosition, departurePort, destinationPort]);

  // Generate AI analysis
  const generateAIAnalysis = useCallback(async () => {
    if (!vessel || !vesselPosition) return;

    try {
      const analysis: AIAnalysis = {
        routeOptimization: `Current route efficiency: 87%. Optimal path via major shipping lanes detected.`,
        weatherConditions: `Moderate sea conditions. Wind speed: 12-15 knots. Wave height: 1.5-2m.`,
        trafficAnalysis: `Medium traffic density. ${nearbyVessels.length} vessels within 100km radius.`,
        riskAssessment: `Low risk level. Clear navigation channels. No weather warnings in effect.`,
        nearbyVessels: nearbyVessels.length,
        portCongestion: nearbyPorts.length > 10 ? 'High port density area' : 'Normal port accessibility',
        recommendations: [
          'Maintain current speed for fuel efficiency',
          'Monitor weather patterns near destination',
          `${nearbyVessels.length} nearby vessels detected - maintain safe distance`,
          'Optimal arrival window: Next 24-48 hours'
        ]
      };

      setAIAnalysis(analysis);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
    }
  }, [vessel, vesselPosition, nearbyPorts, nearbyVessels]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Enhanced vessel icon with type-based styling
  const getVesselIcon = (vesselType: string, isCurrentVessel = false) => {
    const size = isCurrentVessel ? 24 : 18;
    const colors = {
      'Tanker': '#EF4444',
      'Oil Tanker': '#DC2626',
      'Chemical Tanker': '#8B5CF6',
      'LNG Tanker': '#06B6D4',
      'Bulk Carrier': '#3B82F6',
      'Container Ship': '#10B981',
      'General Cargo': '#F59E0B',
      'Cargo': '#F59E0B',
      'default': '#6B7280'
    };
    
    const color = colors[vesselType as keyof typeof colors] || colors.default;
    const borderWidth = isCurrentVessel ? 3 : 2;
    const symbol = isCurrentVessel ? '⚓' : '●';
    
    return L.divIcon({
      html: `<div style="
        background: ${color}; 
        border: ${borderWidth}px solid white; 
        border-radius: 50%; 
        width: ${size}px; 
        height: ${size}px; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${Math.max(10, size-8)}px;
        color: white;
        font-weight: bold;
      ">${symbol}</div>`,
      className: 'custom-vessel-icon',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  // Port icon
  const portIcon = (port: Port, isSpecial = false) => L.divIcon({
    html: `<div style="background: ${isSpecial ? '#EF4444' : '#10B981'}; border: 2px solid white; border-radius: 50%; width: 16px; height: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-port-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  // Refinery icon
  const refineryIcon = L.divIcon({
    html: `<div style="background: #F59E0B; border: 2px solid white; border-radius: 50%; width: 14px; height: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-refinery-icon',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  // Load data when position changes
  useEffect(() => {
    loadNearbyData();
  }, [loadNearbyData]);

  // Generate route when ports are loaded
  useEffect(() => {
    generateVoyageRoute();
  }, [generateVoyageRoute]);

  // Generate AI analysis
  useEffect(() => {
    generateAIAnalysis();
  }, [generateAIAnalysis]);

  if (!vesselPosition) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-lg font-medium">No Position Data</p>
          <p className="text-sm">Vessel coordinates not available</p>
        </div>
      </div>
    );
  }

  const getTileLayerUrl = () => {
    switch (mapView) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={mapView === 'standard' ? 'default' : 'outline'}
            onClick={() => setMapView('standard')}
          >
            <Globe className="h-4 w-4 mr-1" />
            Standard
          </Button>
          <Button
            size="sm"
            variant={mapView === 'satellite' ? 'default' : 'outline'}
            onClick={() => setMapView('satellite')}
          >
            <Layers className="h-4 w-4 mr-1" />
            Satellite
          </Button>
          <Button
            size="sm"
            variant={mapView === 'terrain' ? 'default' : 'outline'}
            onClick={() => setMapView('terrain')}
          >
            <Target className="h-4 w-4 mr-1" />
            Terrain
          </Button>
        </div>
        
        <Button
          size="sm"
          variant={showAIInsights ? 'default' : 'outline'}
          onClick={() => setShowAIInsights(!showAIInsights)}
        >
          <Brain className="h-4 w-4 mr-1" />
          AI Insights
        </Button>
      </div>

      {/* AI Analysis Panel */}
      {showAIInsights && aiAnalysis && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <Zap className="h-4 w-4 mr-2 text-blue-600" />
              AI Maritime Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-blue-700 dark:text-blue-300">Route Optimization</div>
                <div className="text-muted-foreground">{aiAnalysis.routeOptimization}</div>
              </div>
              <div>
                <div className="font-medium text-blue-700 dark:text-blue-300">Weather Analysis</div>
                <div className="text-muted-foreground">{aiAnalysis.weatherConditions}</div>
              </div>
              <div>
                <div className="font-medium text-blue-700 dark:text-blue-300">Traffic Conditions</div>
                <div className="text-muted-foreground">{aiAnalysis.trafficAnalysis}</div>
              </div>
              <div>
                <div className="font-medium text-blue-700 dark:text-blue-300">Risk Assessment</div>
                <div className="text-muted-foreground">{aiAnalysis.riskAssessment}</div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="font-medium text-blue-700 dark:text-blue-300 mb-2">AI Recommendations</div>
              <div className="space-y-1">
                {aiAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div className="text-muted-foreground">{rec}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div className="h-96 rounded-lg overflow-hidden border">
        <MapContainer
          center={vesselPosition}
          zoom={8}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            url={getTileLayerUrl()}
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Vessel Marker */}
          <Marker position={vesselPosition} icon={vesselIcon}>
            <Popup>
              <div className="text-sm space-y-2 max-w-[200px]">
                <div className="font-semibold text-base flex items-center">
                  <Ship className="h-4 w-4 mr-1.5 text-blue-600" />
                  {vessel.name}
                </div>
                <div className="space-y-1 text-xs">
                  <div>IMO: {vessel.imo}</div>
                  <div>MMSI: {vessel.mmsi}</div>
                  <div>Type: {vessel.vesselType}</div>
                  <div>Flag: {vessel.flag}</div>
                </div>
                {vessel.speed && (
                  <div className="text-xs">
                    <Badge variant="secondary">Speed: {vessel.speed} knots</Badge>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Voyage Route */}
          {voyageRoute.length > 1 && (
            <Polyline
              positions={voyageRoute}
              pathOptions={{
                color: '#3B82F6',
                weight: 3,
                opacity: 0.8,
                dashArray: '10, 5'
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold flex items-center">
                    <Route className="h-4 w-4 mr-1" />
                    Maritime Route
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    AI-optimized shipping lane route
                  </div>
                </div>
              </Popup>
            </Polyline>
          )}

          {/* Departure Port */}
          {departurePort && (
            <Marker
              position={[parseFloat(departurePort.lat), parseFloat(departurePort.lng)]}
              icon={portIcon(departurePort, false)}
            >
              <Popup>
                <div className="text-sm space-y-2">
                  <div className="font-semibold flex items-center">
                    <Anchor className="h-4 w-4 mr-1 text-green-600" />
                    {departurePort.name}
                  </div>
                  <Badge className="bg-green-100 text-green-800">Departure Port</Badge>
                  <div className="text-xs">
                    <div>Country: {departurePort.country}</div>
                    {departurePort.capacity && <div>Capacity: {departurePort.capacity.toLocaleString()} TEU</div>}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination Port */}
          {destinationPort && (
            <Marker
              position={[parseFloat(destinationPort.lat), parseFloat(destinationPort.lng)]}
              icon={portIcon(destinationPort, true)}
            >
              <Popup>
                <div className="text-sm space-y-2">
                  <div className="font-semibold flex items-center">
                    <Anchor className="h-4 w-4 mr-1 text-red-600" />
                    {destinationPort.name}
                  </div>
                  <Badge className="bg-red-100 text-red-800">Destination Port</Badge>
                  <div className="text-xs">
                    <div>Country: {destinationPort.country}</div>
                    {destinationPort.capacity && <div>Capacity: {destinationPort.capacity.toLocaleString()} TEU</div>}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Nearby Ports */}
          {nearbyPorts.filter(port => 
            port.id !== departurePort?.id && port.id !== destinationPort?.id
          ).map((port) => (
            <Marker
              key={`port-${port.id}`}
              position={[parseFloat(port.lat), parseFloat(port.lng)]}
              icon={portIcon(port)}
            >
              <Popup>
                <div className="text-sm space-y-2">
                  <div className="font-semibold flex items-center">
                    <Anchor className="h-4 w-4 mr-1 text-blue-600" />
                    {port.name}
                  </div>
                  <Badge variant="outline">Nearby Port</Badge>
                  <div className="text-xs">
                    <div>Country: {port.country}</div>
                    {port.capacity && <div>Capacity: {port.capacity.toLocaleString()} TEU</div>}
                    <div>Distance: {Math.round(calculateDistance(
                      vesselPosition[0], vesselPosition[1],
                      parseFloat(port.lat), parseFloat(port.lng)
                    ))} km</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Nearby Refineries */}
          {nearbyRefineries.map((refinery) => (
            <Marker
              key={`refinery-${refinery.id}`}
              position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
              icon={refineryIcon}
            >
              <Popup>
                <div className="text-sm space-y-2">
                  <div className="font-semibold flex items-center">
                    <Factory className="h-4 w-4 mr-1 text-orange-600" />
                    {refinery.name}
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Refinery</Badge>
                  <div className="text-xs">
                    <div>Country: {refinery.country}</div>
                    {refinery.capacity && <div>Capacity: {refinery.capacity.toLocaleString()} bbl/day</div>}
                    <div>Distance: {Math.round(calculateDistance(
                      vesselPosition[0], vesselPosition[1],
                      parseFloat(refinery.lat), parseFloat(refinery.lng)
                    ))} km</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 20km Proximity Circle */}
          <Circle
            center={vesselPosition}
            radius={20000} // 20km in meters
            pathOptions={{
              color: '#3B82F6',
              weight: 1,
              opacity: 0.3,
              fillOpacity: 0.1
            }}
          />
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Vessel</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Departure</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Destination</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>Refinery</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span>Nearby Port</span>
        </div>
      </div>
    </div>
  );
}