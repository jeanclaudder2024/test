import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Ship, 
  Calendar, 
  Anchor, 
  Flag, 
  Building,
  MapPin
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Vessel } from '@shared/schema';

export default function CompanyFleet() {
  const { name } = useParams<{ name: string }>();
  const decodedCompanyName = decodeURIComponent(name);
  const { toast } = useToast();
  
  // Fetch company vessels
  const { 
    data: vessels = [], 
    isLoading, 
    error 
  } = useQuery<Vessel[]>({
    queryKey: ['/api/companies', decodedCompanyName, 'vessels'],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/companies/${encodeURIComponent(decodedCompanyName)}/vessels`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching company fleet:', error);
        toast({
          title: 'Error',
          description: 'Failed to load company fleet data.',
          variant: 'destructive',
        });
        return [];
      }
    }
  });
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md text-red-800 dark:text-red-300">
          <h3 className="text-lg font-medium">Error loading fleet data</h3>
          <p>There was a problem loading the fleet data. Please try again later.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/companies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Companies
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-2"
            asChild
          >
            <Link to="/companies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Companies
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            {decodedCompanyName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Fleet management and vessel tracking
          </p>
        </div>
      </div>
      
      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fleet Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-20" /> : vessels.length}
            </div>
            <p className="text-xs text-muted-foreground">vessels</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                vessels.reduce((acc, vessel) => acc + (vessel.cargoCapacity ? Number(vessel.cargoCapacity) : 0), 0).toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">mt</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vessel Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                new Set(vessels.map(v => v.vesselType)).size
              )}
            </div>
            <p className="text-xs text-muted-foreground">different types</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Fleet List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Vessel Fleet</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between py-2">
                  <Skeleton className="h-9 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : vessels.length === 0 ? (
          <div className="py-12 text-center">
            <Ship className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No vessels found</h3>
            <p className="text-muted-foreground mb-4">
              No vessels associated with {decodedCompanyName} were found in the database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vessels.map((vessel) => (
              <VesselCard key={vessel.id} vessel={vessel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const VesselCard = ({ vessel }: { vessel: Vessel }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{vessel.name}</CardTitle>
          <Badge variant="outline" className="ml-2">
            {vessel.vesselType || 'Unknown Type'}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Anchor className="h-3.5 w-3.5" />
          IMO: {vessel.imo || 'N/A'} | MMSI: {vessel.mmsi || 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="space-y-2 text-sm">
          {vessel.flag && (
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center">
                <Flag className="h-3.5 w-3.5 mr-1" />
                Flag:
              </span>
              <span className="font-medium">{vessel.flag}</span>
            </div>
          )}
          
          {vessel.built && (
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Built:
              </span>
              <span className="font-medium">{vessel.built}</span>
            </div>
          )}
          
          {vessel.cargoCapacity && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacity:</span>
              <span className="font-medium">{Number(vessel.cargoCapacity).toLocaleString()} mt</span>
            </div>
          )}
          
          {vessel.cargoType && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cargo:</span>
              <span className="font-medium">{vessel.cargoType}</span>
            </div>
          )}
          
          {vessel.currentRegion && (
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                Region:
              </span>
              <span className="font-medium">
                {vessel.currentRegion.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs w-full"
          asChild
        >
          <Link to={`/vessels/${vessel.id}`}>
            <Ship className="h-3.5 w-3.5 mr-1" />
            View Vessel Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};