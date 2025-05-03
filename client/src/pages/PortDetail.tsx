import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  MapPin, 
  Ship,
  Anchor, 
  Building2, 
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Port, Vessel } from '../../../shared/schema';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define columns for nearby vessels table
const vesselColumns: ColumnDef<Vessel>[] = [
  {
    accessorKey: "name",
    header: "Vessel Name",
    cell: ({ row }) => {
      const vessel = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Ship className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{vessel.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "vesselType",
    header: "Type",
  },
  {
    accessorKey: "flag",
    header: "Flag",
  },
  {
    accessorKey: "eta",
    header: "ETA",
    cell: ({ row }) => {
      const eta = row.getValue("eta") as string;
      if (!eta) return "N/A";
      return new Date(eta).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vessel = row.original;
      const [, navigate] = useLocation();
      
      return (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/vessels/${vessel.id}`)}
        >
          Details
        </Button>
      );
    },
  },
];

export default function PortDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/ports/:id');
  const portId = params?.id;
  
  // Fetch port data
  const { 
    data: port, 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['/api/ports', portId],
    queryFn: async () => {
      const response = await fetch(`/api/ports/${portId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching port data: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!portId,
  });

  // Fetch nearby vessels (in a real implementation, this would be a dedicated endpoint)
  const { 
    data: nearbyVessels, 
    isLoading: isLoadingVessels
  } = useQuery({
    queryKey: ['/api/ports/nearby-vessels', portId],
    queryFn: async () => {
      // For now, we'll simulate this by getting some general vessels
      const response = await fetch('/api/vessels?limit=5');
      
      if (!response.ok) {
        throw new Error(`Error fetching nearby vessels: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!portId && !!port,
  });

  // If we're loading, return a loading state
  if (isLoading) {
    return <PortDetailLoadingSkeleton />;
  }

  // If there's an error, show an error message
  if (isError || !port) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/ports')}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Ports
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error 
              ? error.message 
              : "Could not load port details. The port may not exist or there was a server error."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/ports')}
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Ports
      </Button>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{port.name}</h1>
            <Badge variant={port.status === 'active' ? 'default' : 'secondary'} className={port.status === "active" ? "bg-green-500 text-white" : ""}>
              {port.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {port.country} • {port.region}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/ports/${port.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Port
          </Button>
          <Button variant="destructive" onClick={() => {}}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Port Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Location</dt>
                <dd className="font-medium">
                  {port.lat}, {port.lng}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Type</dt>
                <dd className="font-medium capitalize">{port.type}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Capacity</dt>
                <dd className="font-medium">
                  {port.capacity ? port.capacity.toLocaleString() : 'N/A'} TEU/tons
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Last Updated</dt>
                <dd className="font-medium">
                  {new Date(port.lastUpdated).toLocaleString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Map Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted/30 rounded-md flex items-center justify-center border">
              <div className="text-center">
                <MapPin className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Map View Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  {port.lat}, {port.lng}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          {port.description ? (
            <p>{port.description}</p>
          ) : (
            <p className="text-muted-foreground italic">No description available for this port.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nearby Vessels</CardTitle>
          <CardDescription>
            Vessels currently in or approaching {port.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingVessels ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : nearbyVessels && nearbyVessels.length > 0 ? (
            <DataTable columns={vesselColumns} data={nearbyVessels} />
          ) : (
            <div className="text-center py-12">
              <Ship className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No Vessels Nearby</p>
              <p className="text-sm text-muted-foreground">
                There are currently no vessels in proximity to this port.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton
function PortDetailLoadingSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        disabled
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Ports
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}