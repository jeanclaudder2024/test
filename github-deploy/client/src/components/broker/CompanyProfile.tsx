import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Using local types instead of importing from a separate file
type Company = {
  id: number;
  name: string;
  country?: string;
  region?: string;
  headquarters?: string;
  foundedYear?: number;
  ceo?: string;
  fleetSize?: number;
  specialization?: string;
  website?: string;
  logo?: string;
  description?: string;
  revenue?: number;
  employees?: number;
  publiclyTraded?: boolean;
  stockSymbol?: string;
  status?: string;
  lastUpdated?: string;
};

type Vessel = {
  id: number;
  name: string;
  mmsi?: number;
  imo?: number;
  type?: string;
  flag?: string;
  status?: string;
  lat?: number;
  lng?: number;
};
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Building,
  Ship,
  Globe,
  User,
  Calendar,
  Users,
  BarChart3,
  ExternalLink,
  DollarSign,
  Briefcase,
  Clock,
  ArrowUpRight,
  Navigation,
  Check,
  Anchor,
  Flag,
  Map,
  ShieldCheck
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface CompanyProfileProps {
  companyId: number;
  onClose: () => void;
}

export function CompanyProfile({ companyId, onClose }: CompanyProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Query to get company details
  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['/api/companies', companyId],
    enabled: !!companyId,
  });
  
  // Query to get vessels owned by the company
  const { data: vessels = [] } = useQuery<Vessel[]>({
    queryKey: ['/api/companies', companyId, 'vessels'],
    enabled: !!companyId,
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!company) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Company not found</h3>
        <p className="text-muted-foreground">
          The requested company information could not be loaded.
        </p>
        <Button className="mt-4" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }
  
  // Format revenue if available
  const formatRevenue = (revenue?: number) => {
    if (!revenue) return 'N/A';
    if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(1)} billion`;
    }
    return `$${revenue} million`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {company.logo ? (
            <Avatar className="h-16 w-16 rounded-md border">
              <AvatarImage src={company.logo} alt={company.name} />
              <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                {company.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-16 w-16 rounded-md bg-primary/10 flex items-center justify-center">
              <Building className="h-8 w-8 text-primary" />
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-bold">{company.name}</h2>
            <div className="flex items-center text-muted-foreground mt-1 text-sm gap-3">
              {company.country && (
                <span className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {company.country}
                </span>
              )}
              {company.foundedYear && (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Est. {company.foundedYear}
                </span>
              )}
              {company.fleetSize && (
                <span className="flex items-center">
                  <Ship className="h-4 w-4 mr-1" />
                  {company.fleetSize} vessels
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {company.publiclyTraded && company.stockSymbol && (
            <Badge className="bg-blue-500">
              <BarChart3 className="h-3 w-3 mr-1" />
              {company.stockSymbol}
            </Badge>
          )}
          {company.status === 'verified' && (
            <Badge className="bg-green-500">
              <Check className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          {company.website && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" asChild>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visit Company Website</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">
            <Building className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="fleet">
            <Ship className="h-4 w-4 mr-2" />
            Fleet
          </TabsTrigger>
          <TabsTrigger value="operations">
            <Map className="h-4 w-4 mr-2" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Company Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Company Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {company.description || 
                  `${company.name} is a prominent player in the global oil shipping industry, specializing in ${company.specialization || 'oil transportation'}. With operations spanning multiple regions, the company has established a robust presence in the maritime sector.`
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Company Details</h4>
                  <div className="space-y-2">
                    {company.headquarters && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Headquarters
                        </span>
                        <span>{company.headquarters}</span>
                      </div>
                    )}
                    
                    {company.region && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Primary Region
                        </span>
                        <span>{company.region}</span>
                      </div>
                    )}
                    
                    {company.foundedYear && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Founded
                        </span>
                        <span>{company.foundedYear}</span>
                      </div>
                    )}
                    
                    {company.ceo && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          CEO
                        </span>
                        <span>{company.ceo}</span>
                      </div>
                    )}
                    
                    {company.employees && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Employees
                        </span>
                        <span>{company.employees.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Maritime Operations</h4>
                  <div className="space-y-2">
                    {company.fleetSize && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Ship className="h-4 w-4 mr-2" />
                          Fleet Size
                        </span>
                        <span>{company.fleetSize} vessels</span>
                      </div>
                    )}
                    
                    {company.specialization && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          Specialization
                        </span>
                        <span>{company.specialization}</span>
                      </div>
                    )}
                    
                    {vessels.length > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Navigation className="h-4 w-4 mr-2" />
                          Active Vessels
                        </span>
                        <span>{vessels.filter(v => v.status === 'active').length}</span>
                      </div>
                    )}
                    
                    {company.revenue && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Annual Revenue
                        </span>
                        <span>{formatRevenue(company.revenue)}</span>
                      </div>
                    )}
                    
                    {company.createdAt && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Last Updated
                        </span>
                        <span>{new Date(company.lastUpdated || company.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fleet Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{company.fleetSize || 'N/A'}</div>
                  <Ship className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total vessels in company fleet
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Global Presence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{company.region || 'Global'}</div>
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Primary operational region
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Operational Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {company.status === 'active' ? 'Active' : company.status || 'Active'}
                  </div>
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current operational status
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Fleet Tab */}
        <TabsContent value="fleet" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Company Fleet</CardTitle>
              <CardDescription>
                Vessels operated by {company.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vessels.length === 0 ? (
                <div className="text-center py-8">
                  <Ship className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No vessels available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    Fleet information for this company is not yet available.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vessels.map(vessel => (
                    <div key={vessel.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Ship className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{vessel.name}</div>
                          <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4">
                            {vessel.type && (
                              <span className="flex items-center">
                                <Anchor className="h-3.5 w-3.5 mr-1" />
                                {vessel.type}
                              </span>
                            )}
                            {vessel.flag && (
                              <span className="flex items-center">
                                <Flag className="h-3.5 w-3.5 mr-1" />
                                {vessel.flag}
                              </span>
                            )}
                            {vessel.imo && (
                              <span>IMO: {vessel.imo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {vessel.status && (
                          <Badge 
                            variant={vessel.status.toLowerCase() === 'active' ? 'default' : 'outline'}
                            className={vessel.status.toLowerCase() === 'active' ? 'bg-green-500' : ''}
                          >
                            {vessel.status}
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Operational Regions</CardTitle>
              <CardDescription>
                Global shipping routes and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Map className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  Detailed operational data for {company.name} will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Financial Overview</CardTitle>
              <CardDescription>
                Company financial performance and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Annual Revenue</div>
                    <div className="text-2xl font-bold">{formatRevenue(company.revenue)}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Public Status</div>
                    <div className="text-2xl font-bold flex items-center">
                      {company.publiclyTraded ? (
                        <>
                          <span className="mr-2">Listed</span> 
                          {company.stockSymbol && <Badge>{company.stockSymbol}</Badge>}
                        </>
                      ) : (
                        'Private'
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Employees</div>
                    <div className="text-2xl font-bold">{company.employees?.toLocaleString() || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="pt-4 text-center">
                  <BarChart3 className="h-32 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-6">
                    Detailed financial data for {company.name} will be available in a future update.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <DialogFooter className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </div>
  );
}