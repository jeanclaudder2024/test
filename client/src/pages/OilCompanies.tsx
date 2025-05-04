import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { OilCompany } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { REGIONS } from "@shared/constants";
import { BuildingIcon, MapIcon, ShipIcon, Filter, Globe2Icon } from "lucide-react";

export function OilCompanies() {
  const { toast } = useToast();
  const [region, setRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch all oil companies
  const { data: oilCompanies, isLoading, error } = useQuery({
    queryKey: ['/api/oil-companies'],
    enabled: true,
  });

  // Filter oil companies based on selected region and search term
  const filteredCompanies = React.useMemo(() => {
    if (!oilCompanies) return [];
    
    let filtered = [...oilCompanies];
    
    // Filter by region
    if (region && region !== 'all') {
      filtered = filtered.filter(company => company.region === region);
    }
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        company => 
          company.name.toLowerCase().includes(search) ||
          company.country.toLowerCase().includes(search) ||
          (company.specialization && company.specialization.toLowerCase().includes(search))
      );
    }
    
    return filtered;
  }, [oilCompanies, region, searchTerm]);

  // Handle region change
  const handleRegionChange = (value: string) => {
    setRegion(value);
  };

  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader
          title="Oil Companies"
          description="View and manage oil shipping companies"
          icon={<BuildingIcon className="w-10 h-10" />}
        />
        <div className="bg-destructive/20 border border-destructive text-destructive p-4 rounded-md mt-4">
          <p>Error loading oil companies: {(error as Error).message}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Oil Companies"
        description="View and manage oil shipping companies across different regions"
        icon={<BuildingIcon className="w-10 h-10" />}
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, country, or specialization..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={region} onValueChange={handleRegionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Globe2Icon className="h-4 w-4" />
                  <span>All Regions</span>
                </div>
              </SelectItem>
              {REGIONS.map((regionOption) => (
                <SelectItem key={regionOption} value={regionOption}>
                  {regionOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
          <p className="ml-2">Loading oil companies...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-muted/50 border rounded-lg p-8 text-center">
          <BuildingIcon className="mx-auto h-12 w-12 text-muted-foreground/80" />
          <h3 className="mt-4 text-lg font-medium">No oil companies found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || region !== 'all' 
              ? "Try adjusting your filters or search term" 
              : "There are no oil companies in the system yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <OilCompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}

interface OilCompanyCardProps {
  company: OilCompany;
}

function OilCompanyCard({ company }: OilCompanyCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{company.name}</CardTitle>
          <Badge variant="outline">{company.region}</Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <MapIcon className="h-4 w-4" />
          {company.country}
          {company.headquarters && ` • ${company.headquarters}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="fleet" className="flex-1">Fleet</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-4">
            <dl className="grid grid-cols-1 gap-2 text-sm">
              {company.foundedYear && (
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Founded</dt>
                  <dd>{company.foundedYear}</dd>
                </div>
              )}
              {company.ceo && (
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">CEO</dt>
                  <dd>{company.ceo}</dd>
                </div>
              )}
              {company.revenue && (
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Revenue</dt>
                  <dd>{company.revenue}</dd>
                </div>
              )}
              {company.specialization && (
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Specialization</dt>
                  <dd>{company.specialization}</dd>
                </div>
              )}
              {company.website && (
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            {company.description && (
              <div className="mt-4 text-sm">
                <p>{company.description}</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="fleet" className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ShipIcon className="h-5 w-5 text-primary" />
              <span className="font-medium">Fleet Size: {company.fleetSize || 'Unknown'}</span>
            </div>
            {company.majorRoutes ? (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Major Routes:</p>
                <p>{company.majorRoutes}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No major routes information available</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 pt-4">
        <div className="w-full flex justify-end">
          <Button variant="outline" size="sm">View Details</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default OilCompanies;