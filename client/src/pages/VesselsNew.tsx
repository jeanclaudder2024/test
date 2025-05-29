import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { Ship, Search, Plus, MapPin, Calendar, Anchor, Edit, Trash2 } from 'lucide-react';
import { FlagIcon } from "react-flag-kit";

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

// Flag code mapping for common countries
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
  return countryToFlagCode[flagName] || "UN"; // Default to UN flag if not found
}

export default function VesselsNew() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch vessels from admin API
  const { data: vessels = [], isLoading, error } = useQuery<Vessel[]>({
    queryKey: ["/api/admin/vessels"],
    queryFn: async () => {
      const response = await fetch("/api/admin/vessels");
      if (!response.ok) throw new Error("Failed to fetch vessels");
      return response.json();
    }
  });

  // Filter vessels based on search and filters
  const filteredVessels = vessels.filter((vessel) => {
    const matchesSearch = !searchTerm || 
      vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.imo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.mmsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.flag.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vessel.status === statusFilter;
    const matchesType = typeFilter === 'all' || vessel.vesselType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
    return new Date(dateString).toLocaleDateString();
  };

  const formatCoordinate = (coord: string | null) => {
    if (!coord) return "—";
    return parseFloat(coord).toFixed(4);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center text-gray-900">
                <Ship className="h-7 w-7 mr-3 text-blue-600" />
                Vessel Fleet
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl text-sm">
                Real-time vessel tracking and fleet monitoring
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center gap-3">
              <Link href="/admin">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Vessels
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">Total Vessels</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {vessels.length}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">Oil Tankers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {vessels.filter(v => v.vesselType?.toLowerCase().includes('oil') || 
                v.vesselType?.toLowerCase().includes('tanker')).length}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">Active Vessels</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {vessels.filter(v => v.status === 'underway' || v.status === 'loading' || v.status === 'discharging').length}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-medium text-gray-500">At Port</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {vessels.filter(v => v.status === 'at port' || v.status === 'moored').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search vessels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="underway">Underway</option>
              <option value="at port">At Port</option>
              <option value="loading">Loading</option>
              <option value="discharging">Discharging</option>
              <option value="at anchor">At Anchor</option>
              <option value="moored">Moored</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              <option value="Oil Tanker">Oil Tanker</option>
              <option value="Chemical Tanker">Chemical Tanker</option>
              <option value="Product Tanker">Product Tanker</option>
              <option value="Crude Oil Tanker">Crude Oil Tanker</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vessels Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vessels ({filteredVessels.length})</span>
            {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-600">
              Error loading vessels: {error.message}
            </div>
          ) : filteredVessels.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {vessels.length === 0 ? "No vessels found" : "No vessels match your search criteria"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vessel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Flag</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVessels.map((vessel) => (
                    <TableRow key={vessel.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vessel.name}</div>
                          <div className="text-sm text-gray-500">
                            IMO: {vessel.imo} • MMSI: {vessel.mmsi}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vessel.vesselType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FlagIcon 
                            code={getFlagCode(vessel.flag)} 
                            size={16}
                          />
                          <span className="text-sm">{vessel.flag}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {vessel.currentLat && vessel.currentLng ? (
                            <>
                              <div>{formatCoordinate(vessel.currentLat)}°</div>
                              <div>{formatCoordinate(vessel.currentLng)}°</div>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(vessel.status)}>
                          {vessel.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{vessel.cargoType || "—"}</div>
                          {vessel.cargoCapacity && (
                            <div className="text-gray-500">
                              {vessel.cargoCapacity.toLocaleString()} MT
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/vessels/${vessel.id}`}>
                            <Button variant="ghost" size="sm">
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}