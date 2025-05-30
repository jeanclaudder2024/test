import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Ship, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Anchor, 
  Globe, 
  Users, 
  Fuel,
  Navigation,
  Clock,
  Building,
  TrendingUp
} from 'lucide-react';
import { FlagIcon } from "react-flag-kit";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: number | null;
  deadweight: number | null;
  currentLat: string | null;
  currentLng: string | null;
  departurePort: string | null;
  departureDate: string | null;
  destinationPort: string | null;
  eta: string | null;
  cargoType: string | null;
  cargoCapacity: number | null;
  currentRegion: string | null;
  status: string | null;
  speed: string | null;
  buyerName: string | null;
  sellerName: string | null;
  ownerName: string | null;
  operatorName: string | null;
  oilSource: string | null;
  lastUpdated: string | null;
}

// Flag code mapping
const countryToFlagCode: { [key: string]: string } = {
  "Panama": "PA",
  "Liberia": "LR", 
  "Marshall Islands": "MH",
  "Singapore": "SG",
  "Malta": "MT",
  "Cyprus": "CY",
  "Bahamas": "BS",
  "Greece": "GR",
  "Norway": "NO",
  "United Kingdom": "GB",
  "Denmark": "DK",
  "Netherlands": "NL",
  "Germany": "DE",
  "Italy": "IT",
  "France": "FR",
  "Spain": "ES",
  "United States": "US",
  "Japan": "JP",
  "South Korea": "KR",
  "China": "CN",
  "India": "IN",
  "Brazil": "BR",
  "Turkey": "TR",
  "Russia": "RU",
  "United Arab Emirates": "AE",
  "Saudi Arabia": "SA",
  "Qatar": "QA",
  "Kuwait": "KW",
  "Oman": "OM",
  "Bahrain": "BH"
};

function getFlagCode(flagName: string): string {
  return countryToFlagCode[flagName] || "UN";
}

export default function VesselDetailNew() {
  const { id } = useParams<{ id: string }>();
  
  // Fetch vessel details
  const { data: vessel, isLoading, error } = useQuery<Vessel>({
    queryKey: ["/api/admin/vessels", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/vessels/${id}`);
      if (!response.ok) throw new Error("Failed to fetch vessel details");
      return response.json();
    },
    enabled: !!id
  });

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "underway": return "default";
      case "at port": return "secondary";
      case "loading": return "destructive";
      case "discharging": return "destructive";
      case "at anchor": return "outline";
      case "moored": return "outline";
      default: return "secondary";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCoordinate = (coord: string | null) => {
    if (!coord) return "—";
    return parseFloat(coord).toFixed(6);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vessel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vessel) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Ship className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vessel Not Found</h2>
          <p className="text-gray-600 mb-6">The vessel you're looking for doesn't exist or has been removed.</p>
          <Link href="/vessels">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vessels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasCoordinates = vessel.currentLat && vessel.currentLng;
  const lat = hasCoordinates ? parseFloat(vessel.currentLat!) : 0;
  const lng = hasCoordinates ? parseFloat(vessel.currentLng!) : 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/vessels">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vessels
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <FlagIcon code={getFlagCode(vessel.flag)} size={24} />
            <Badge variant={getStatusBadgeVariant(vessel.status)}>
              {vessel.status || "Unknown"}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Ship className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vessel.name}</h1>
            <p className="text-gray-600">
              {vessel.vesselType} • Flag: {vessel.flag}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="voyage">Voyage</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Vessel Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">IMO Number</p>
                    <p className="text-lg font-mono">{vessel.imo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">MMSI</p>
                    <p className="text-lg font-mono">{vessel.mmsi}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vessel Type</p>
                    <p className="text-lg">{vessel.vesselType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Built</p>
                    <p className="text-lg">{vessel.built || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Position */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Current Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Latitude</p>
                    <p className="text-lg font-mono">{formatCoordinate(vessel.currentLat)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Longitude</p>
                    <p className="text-lg font-mono">{formatCoordinate(vessel.currentLng)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Region</p>
                    <p className="text-lg">{vessel.currentRegion || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Speed</p>
                    <p className="text-lg">{vessel.speed ? `${vessel.speed} knots` : "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          {hasCoordinates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Location Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapContainer
                    center={[lat, lng]}
                    zoom={8}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[lat, lng]}>
                      <Popup>
                        <div className="text-center">
                          <strong>{vessel.name}</strong><br/>
                          {vessel.vesselType}<br/>
                          Status: {vessel.status}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Deadweight</p>
                  <p className="text-lg">{vessel.deadweight ? `${vessel.deadweight.toLocaleString()} MT` : "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Year Built</p>
                  <p className="text-lg">{vessel.built || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Flag State</p>
                  <div className="flex items-center gap-2">
                    <FlagIcon code={getFlagCode(vessel.flag)} size={20} />
                    <span className="text-lg">{vessel.flag}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Cargo Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Cargo Type</p>
                  <p className="text-lg">{vessel.cargoType || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cargo Capacity</p>
                  <p className="text-lg">{vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} MT` : "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Oil Source</p>
                  <p className="text-lg">{vessel.oilSource || "—"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voyage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Departure Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Departure Port</p>
                  <p className="text-lg">{vessel.departurePort || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Departure Date</p>
                  <p className="text-lg">{formatDate(vessel.departureDate)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5" />
                  Destination Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Destination Port</p>
                  <p className="text-lg">{vessel.destinationPort || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ETA</p>
                  <p className="text-lg">{formatDate(vessel.eta)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status & Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Status</p>
                  <Badge variant={getStatusBadgeVariant(vessel.status)} className="mt-1">
                    {vessel.status || "Unknown"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-lg">{formatDate(vessel.lastUpdated)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Ownership & Operation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Owner</p>
                  <p className="text-lg">{vessel.ownerName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Operator</p>
                  <p className="text-lg">{vessel.operatorName || "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Trading Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Buyer</p>
                  <p className="text-lg">{vessel.buyerName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Seller</p>
                  <p className="text-lg">{vessel.sellerName || "—"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}