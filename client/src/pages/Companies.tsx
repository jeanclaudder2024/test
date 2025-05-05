import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Building, Ship, Users, Search, Filter, X } from 'lucide-react';
import { REGIONS } from '@shared/constants';
import { useToast } from '@/hooks/use-toast';
import ExcelUploader from '../components/companies/ExcelUploader';
import { Company } from '@shared/schema';

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch companies data
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['/api/companies'],
    staleTime: 60000, // 1 minute
  });
  
  // Handle import success
  const handleImportSuccess = (count: number) => {
    // Invalidate the companies query to refresh the data
    queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    
    // Hide the importer after successful import
    setTimeout(() => {
      setShowImporter(false);
    }, 2000);
  };
  
  // Filter companies based on search term and selected region
  const filteredCompanies = companies ? 
    (companies as Company[]).filter((company: Company) => {
      const matchesSearch = searchTerm === '' || 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.specialization && company.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.country && company.country.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRegion = !selectedRegion || company.region === selectedRegion;
      
      return matchesSearch && matchesRegion;
    }) : [];
  
  // Generate statistics for the dashboard
  const stats = {
    totalCompanies: companies ? (companies as Company[]).length : 0,
    totalFleetSize: companies ? 
      (companies as Company[]).reduce((total, company) => total + (company.fleetSize || 0), 0) : 0,
    regionsCount: companies ? 
      new Set((companies as Company[]).map(company => company.region).filter(Boolean)).size : 0,
    specializations: companies ? 
      [...new Set((companies as Company[]).map(company => company.specialization).filter(Boolean))] : []
  };
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md text-red-800 dark:text-red-300">
          <h3 className="text-lg font-medium">Error loading companies</h3>
          <p>There was a problem loading the companies data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            Shipping Companies
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and browse oil shipping companies worldwide
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant={showImporter ? "outline" : "default"}
            onClick={() => setShowImporter(!showImporter)}
          >
            {showImporter ? "Cancel Import" : "Import Companies"}
          </Button>
        </div>
      </div>
      
      {showImporter && (
        <div className="mb-8 animate-in fade-in-50 slide-in-from-top-3 duration-300">
          <ExcelUploader onImportSuccess={handleImportSuccess} />
        </div>
      )}
      
      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-20" /> : stats.totalCompanies}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fleet Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-20" /> : stats.totalFleetSize}
            </div>
            <p className="text-xs text-muted-foreground">vessels worldwide</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-20" /> : stats.regionsCount}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Specializations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-20" /> : stats.specializations.length}
            </div>
            <p className="text-xs text-muted-foreground">unique types</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:col-span-2">
          <Badge 
            variant={selectedRegion === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedRegion(null)}
          >
            All Regions
          </Badge>
          
          {REGIONS.map((region) => (
            <Badge
              key={region}
              variant={selectedRegion === region ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedRegion(region)}
            >
              {region}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Company List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
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
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))
        ) : filteredCompanies.length === 0 ? (
          <div className="col-span-3 py-10 text-center">
            <Building className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedRegion
                ? "Try adjusting your search or filter criteria"
                : "No shipping companies have been added yet"}
            </p>
            {!showImporter && (
              <Button onClick={() => setShowImporter(true)}>
                Import Companies
              </Button>
            )}
          </div>
        ) : (
          filteredCompanies.map((company: Company) => (
            <CompanyCard key={company.id} company={company} />
          ))
        )}
      </div>
    </div>
  );
}

const CompanyCard = ({ company }: { company: Company }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{company.name}</CardTitle>
          {company.country && (
            <Badge variant="outline" className="ml-2">
              {company.country}
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          {company.region || "Unknown Region"}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="space-y-2 text-sm">
          {company.specialization && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Specialization:</span>
              <span className="font-medium">{company.specialization}</span>
            </div>
          )}
          
          {company.fleetSize !== null && company.fleetSize !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fleet Size:</span>
              <span className="font-medium">{company.fleetSize} vessels</span>
            </div>
          )}
          
          {company.headquarters && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Headquarters:</span>
              <span className="font-medium">{company.headquarters}</span>
            </div>
          )}
          
          {company.foundedYear && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Founded:</span>
              <span className="font-medium">{company.foundedYear}</span>
            </div>
          )}
          
          {company.ceo && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">CEO:</span>
              <span className="font-medium">{company.ceo}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {company.website ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => window.open(company.website, '_blank')}
          >
            <Globe className="h-3.5 w-3.5 mr-1" />
            Website
          </Button>
        ) : (
          <span></span>
        )}
        
        <Button 
          variant="default" 
          size="sm" 
          className="text-xs"
        >
          <Ship className="h-3.5 w-3.5 mr-1" />
          View Fleet
        </Button>
      </CardFooter>
    </Card>
  );
};