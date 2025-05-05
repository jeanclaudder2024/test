import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft, 
  Building, 
  Ship,
  Globe, 
  Users,
  Calendar,
  BarChartHorizontal,
  MapPin,
  User,
  ExternalLink,
  Edit
} from 'lucide-react';
import { Company, Vessel } from '@shared/schema';
import LiveVesselMap from '@/components/map/LiveVesselMap';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { REGIONS } from '@shared/constants';

// Helper function to get region display name
const getRegionDisplayName = (regionId: string | null | undefined): string => {
  if (!regionId) return 'Unknown Region';
  
  const region = REGIONS.find((r: any) => r.id && r.id.toLowerCase() === regionId.toLowerCase());
  
  if (region) {
    return region.name;
  } else {
    return regionId.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};

// Helper component for company information
const InfoItem = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
  <div className="flex justify-between py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value || 'N/A'}</span>
  </div>
);

export default function CompanyDetail() {
  const [, params] = useRoute('/companies/:id');
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch company details
  const { data: company, error, isLoading } = useQuery({
    queryKey: [`/api/companies/${params?.id}`],
  });

  // Fetch company vessels
  const { data: companyVessels, isLoading: vesselsLoading } = useQuery({
    queryKey: [`/api/vessels/by-company/${params?.id}`],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => setLocation('/companies')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(6).fill(0).map((_, i) => (
                  <div className="flex justify-between py-2" key={i}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !company) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => setLocation('/companies')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load company details. The company may not exist or there was a server error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => setLocation('/companies')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building className="h-8 w-8 text-primary" />
              {company.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <Globe className="h-4 w-4" />
              {getRegionDisplayName(company.region)} · {company.country || 'Unknown Country'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Company
          </Button>
          {company.website && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(company.website, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Website
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vessels">
            Fleet
            {companyVessels && companyVessels.length > 0 && (
              <Badge className="ml-2" variant="secondary">{companyVessels.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="map">Live Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoItem 
                  label={<span className="flex items-center gap-1"><Globe className="h-4 w-4" /> Region</span>} 
                  value={getRegionDisplayName(company.region)} 
                />
                <InfoItem 
                  label={<span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Headquarters</span>} 
                  value={company.headquarters} 
                />
                <InfoItem 
                  label={<span className="flex items-center gap-1"><User className="h-4 w-4" /> CEO</span>} 
                  value={company.ceo} 
                />
                <InfoItem 
                  label={<span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Founded</span>} 
                  value={company.foundedYear} 
                />
                <InfoItem 
                  label={<span className="flex items-center gap-1"><Ship className="h-4 w-4" /> Fleet Size</span>} 
                  value={company.fleetSize ? `${company.fleetSize} vessels` : 'Unknown'} 
                />
                <InfoItem 
                  label={<span className="flex items-center gap-1"><BarChartHorizontal className="h-4 w-4" /> Revenue</span>} 
                  value={company.revenue ? `$${(company.revenue / 1000000000).toFixed(2)}B` : 'Not disclosed'} 
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Specialization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge className="text-sm" variant="secondary">
                    {company.specialization || 'General Maritime Transport'}
                  </Badge>
                  
                  <div className="text-sm text-muted-foreground mt-2">
                    {company.description || 
                     `${company.name} is a shipping company operating in the ${getRegionDisplayName(company.region)} region.`}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm">Fleet Size</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="text-2xl font-bold">{company.fleetSize || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">vessels worldwide</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm">Operations Status</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <Badge variant={company.status === 'active' ? 'success' : 'secondary'}>
                          {company.status || 'Unknown'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Fleet summary in overview tab */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg">Fleet Summary</CardTitle>
                <CardDescription>
                  Summary of vessels operated by {company.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vesselsLoading ? (
                  <div className="space-y-2">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : companyVessels && companyVessels.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Total Vessels</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="text-2xl font-bold">{companyVessels.length}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Average Capacity</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="text-2xl font-bold">
                            {companyVessels.reduce((acc, v) => acc + (v.capacity || 0), 0) / companyVessels.length > 0 
                              ? Math.round(companyVessels.reduce((acc, v) => acc + (v.capacity || 0), 0) / companyVessels.length).toLocaleString() 
                              : 'N/A'}
                          </div>
                          <p className="text-xs text-muted-foreground">deadweight tons</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Active Vessels</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="text-2xl font-bold">
                            {companyVessels.filter(v => v.status === 'operational').length}
                          </div>
                          <p className="text-xs text-muted-foreground">currently operational</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">In Transit</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="text-2xl font-bold">
                            {companyVessels.filter(v => 
                              v.originPort && v.destinationPort && v.status === 'operational'
                            ).length}
                          </div>
                          <p className="text-xs text-muted-foreground">with active routes</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ship className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No vessels found</h3>
                    <p className="text-muted-foreground mb-4">
                      There are no vessels associated with this company in our database.
                    </p>
                  </div>
                )}
              </CardContent>
              {companyVessels && companyVessels.length > 0 && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('vessels')}
                  >
                    View Full Fleet
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="vessels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                {company.name} Fleet
              </CardTitle>
              <CardDescription>
                All vessels operated by {company.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vesselsLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : companyVessels && companyVessels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyVessels.map((vessel) => (
                    <Card key={vessel.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">{vessel.name}</CardTitle>
                          <Badge variant={vessel.status === 'operational' ? 'success' : 'secondary'}>
                            {vessel.status || 'Unknown'}
                          </Badge>
                        </div>
                        <CardDescription>
                          {vessel.vesselType || 'Unknown vessel type'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">IMO:</span>{' '}
                            <span className="font-medium">{vessel.imo || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Capacity:</span>{' '}
                            <span className="font-medium">{vessel.capacity ? vessel.capacity.toLocaleString() : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Built:</span>{' '}
                            <span className="font-medium">{vessel.yearBuilt || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Flag:</span>{' '}
                            <span className="font-medium">{vessel.flag || 'N/A'}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setLocation(`/vessels/${vessel.id}`)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ship className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No vessels found</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no vessels associated with this company in our database.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Live Vessel Tracking - {company.name}
              </CardTitle>
              <CardDescription>
                Real-time location of vessels operated by {company.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="h-[600px] w-full">
                <LiveVesselMap 
                  height="600px"
                  initialRegion="global"
                  showRoutes={true}
                  mapStyle="standard"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}