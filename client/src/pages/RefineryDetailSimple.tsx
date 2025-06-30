import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Factory, MapPin, Users, Zap } from "lucide-react";
import { Link } from "wouter";

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  city: string;
  capacity: number | null;
  lat: string;
  lng: string;
  status: string;
  description: string | null;
  operator: string | null;
  owner: string | null;
  type: string | null;
  products: string | null;
}

export default function RefineryDetailSimple() {
  const params = useParams<{ id: string }>();
  const refineryId = params?.id ? parseInt(params.id) : null;

  // Fetch refineries data with no caching for fresh data
  const { data: refineries = [], isLoading } = useQuery<Refinery[]>({
    queryKey: ['/api/admin/refineries'],
    staleTime: 0, // No caching - always fresh data
    refetchOnWindowFocus: true, // Refresh when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Find the specific refinery
  const refinery = refineries.find(r => r.id === refineryId);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!refinery) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="py-12">
          <Factory className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Refinery not found</h3>
          <p className="text-muted-foreground mb-8">
            The refinery with ID {refineryId} does not exist.
          </p>
          <Link href="/refineries">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Refineries
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/refineries">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{refinery.name}</h1>
            <p className="text-muted-foreground">
              {refinery.city}, {refinery.country}
            </p>
          </div>
        </div>
        <Badge variant={refinery.status === 'active' ? 'default' : 'secondary'}>
          {refinery.status}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Factory className="mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="font-medium">{refinery.region}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-medium">
                  {refinery.capacity ? `${refinery.capacity.toLocaleString()} bpd` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Operator</p>
                <p className="font-medium">{refinery.operator || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{refinery.type || 'N/A'}</p>
              </div>
            </div>
            {refinery.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{refinery.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Latitude</p>
                <p className="font-medium">{refinery.lat}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longitude</p>
                <p className="font-medium">{refinery.lng}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Full Address</p>
              <p className="font-medium">
                {refinery.city}, {refinery.country}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        {refinery.products && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {refinery.products.split(',').map((product, index) => (
                  <Badge key={index} variant="outline">
                    {product.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">{refinery.owner || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={refinery.status === 'active' ? 'default' : 'secondary'}>
                {refinery.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}