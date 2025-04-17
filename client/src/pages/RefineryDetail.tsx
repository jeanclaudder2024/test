import { useState, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { Refinery } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Link, useRoute } from 'wouter';
import { 
  ArrowLeft, Factory, Map, Edit, PieChart, Droplet, 
  CalendarClock, MapPin, Building, Phone, Globe, BriefcaseBusiness,
  Flame, Activity, Clock, Calendar, AlertTriangle
} from 'lucide-react';

// Helper components for refinery details
const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value || 'N/A'}</span>
  </div>
);

// Function to render status badge with appropriate color
const StatusBadge = ({ status }: { status: string }) => {
  let variant = "default";
  
  switch(status.toLowerCase()) {
    case 'operational':
      variant = "success";
      break;
    case 'maintenance':
      variant = "warning";
      break;
    case 'offline':
      variant = "destructive";
      break;
    default:
      variant = "secondary";
  }
  
  return <Badge variant={variant as any}>{status}</Badge>;
};

export default function RefineryDetail() {
  const [, params] = useRoute('/refineries/:id');
  const refineryId = params?.id ? parseInt(params.id) : null;
  const { refineries, loading } = useDataStream();
  const { toast } = useToast();
  
  // Find the refinery from our stream data
  const refinery = refineries.find(r => r.id === refineryId);
  
  // Redirect to refineries page if refinery not found and not loading
  if (!loading && !refinery) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="py-12">
          <Factory className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Refinery not found</h3>
          <p className="text-muted-foreground mb-8">
            The refinery with ID {refineryId} does not exist or was deleted.
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
    <div className="container mx-auto p-4">
      <Link href="/refineries">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Refineries
        </Button>
      </Link>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : refinery ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Factory className="h-8 w-8 mr-2 text-primary" />
                {refinery.name}
              </h1>
              <p className="text-muted-foreground">
                {refinery.country}, {refinery.region}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <StatusBadge status={refinery.status || 'Unknown'} />
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Refinery
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Factory className="h-5 w-5 mr-2 text-primary" />
                  Refinery Information
                </CardTitle>
                <CardDescription>
                  Details and specifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InfoItem 
                  label={<div className="flex items-center"><Building className="h-4 w-4 mr-1" /> Name</div>} 
                  value={refinery.name} 
                />
                <InfoItem 
                  label={<div className="flex items-center"><Globe className="h-4 w-4 mr-1" /> Country</div>} 
                  value={refinery.country} 
                />
                <InfoItem 
                  label={<div className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> Region</div>} 
                  value={refinery.region} 
                />
                <InfoItem 
                  label={<div className="flex items-center"><Flame className="h-4 w-4 mr-1" /> Capacity</div>} 
                  value={refinery.capacity ? `${refinery.capacity.toLocaleString()} barrels/day` : 'Unknown'} 
                />
                <InfoItem 
                  label={<div className="flex items-center"><Activity className="h-4 w-4 mr-1" /> Status</div>} 
                  value={<StatusBadge status={refinery.status || 'Unknown'} />} 
                />
                <Separator className="my-3" />
                <InfoItem 
                  label={<div className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> Coordinates</div>} 
                  value={`${refinery.lat}, ${refinery.lng}`} 
                />
                <InfoItem 
                  label={<div className="flex items-center"><Phone className="h-4 w-4 mr-1" /> Contact</div>} 
                  value={"+1 (555) 123-4567"} 
                />
                <InfoItem 
                  label={<div className="flex items-center"><CalendarClock className="h-4 w-4 mr-1" /> Last Inspection</div>} 
                  value={"March 15, 2023"} 
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Map className="h-5 w-5 mr-2 text-primary" />
                  Location
                </CardTitle>
                <CardDescription>
                  Geographical location of the refinery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-12 w-12 text-primary mx-auto mb-2" />
                    <div>Interactive Map View</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Coordinates: {refinery.lat}, {refinery.lng}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Building className="h-4 w-4 mr-2 text-primary" />
                      Facility Information
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>Full Conversion</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Year Built:</span>
                        <span>1985</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Last Expansion:</span>
                        <span>2018</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Area:</span>
                        <span>12.5 sq km</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <BriefcaseBusiness className="h-4 w-4 mr-2 text-primary" />
                      Operator Information
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Operator:</span>
                        <span>Acme Oil & Gas Co.</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Ownership:</span>
                        <span>100% Owned</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Employees:</span>
                        <span>~1,200</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Operating Since:</span>
                        <span>1987</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Capacity Utilization
                </CardTitle>
                <CardDescription>
                  Current operational capacity
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm flex items-center">
                        <Flame className="h-4 w-4 mr-1 text-orange-500" />
                        Production
                      </span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm flex items-center">
                        <Droplet className="h-4 w-4 mr-1 text-blue-500" />
                        Storage
                      </span>
                      <span className="text-sm font-medium">42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-green-500" />
                        Processing Time
                      </span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-purple-500" />
                        Uptime
                      </span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Values based on current operations
                </p>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Production Overview
                </CardTitle>
                <CardDescription>
                  Monthly output by product type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2">
                      <Droplet className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">4.2M</h3>
                    <p className="text-sm text-muted-foreground">Crude Oil (barrels)</p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                      <Droplet className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">2.8M</h3>
                    <p className="text-sm text-muted-foreground">Gasoline (barrels)</p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-2">
                      <Droplet className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">1.5M</h3>
                    <p className="text-sm text-muted-foreground">Diesel (barrels)</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Processing Units</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Crude Distillation Unit</span>
                        <span className="text-sm font-medium">350,000 bbl/d</span>
                      </div>
                      <Progress value={95} className="h-1.5" />
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Vacuum Distillation</span>
                        <span className="text-sm font-medium">175,000 bbl/d</span>
                      </div>
                      <Progress value={85} className="h-1.5" />
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Catalytic Reformer</span>
                        <span className="text-sm font-medium">120,000 bbl/d</span>
                      </div>
                      <Progress value={70} className="h-1.5" />
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Hydrocracker</span>
                        <span className="text-sm font-medium">80,000 bbl/d</span>
                      </div>
                      <Progress value={65} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Last updated: April 16, 2023
                </p>
              </CardFooter>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}