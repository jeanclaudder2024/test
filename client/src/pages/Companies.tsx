import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { REGIONS } from '@shared/constants';
import { Loader2, Globe, Building2, Users, BarChart, Ship, ExternalLink } from 'lucide-react';
import { Company } from '@shared/schema';
import ExcelUploader from '../components/companies/ExcelUploader';

// Helper component for displaying company cards
const CompanyCard: React.FC<{ company: Company }> = ({ company }) => {
  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{company.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Globe className="h-4 w-4" />
              <span>{company.country}, {company.region}</span>
            </CardDescription>
          </div>
          {company.logo && (
            <div className="w-12 h-12 rounded overflow-hidden bg-white p-1">
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4 opacity-70" />
            <span className="font-medium">Headquarters:</span>
          </div>
          <div>{company.headquarters || "N/A"}</div>
          
          <div className="flex items-center gap-1">
            <Ship className="h-4 w-4 opacity-70" />
            <span className="font-medium">Fleet Size:</span>
          </div>
          <div>{company.fleetSize || "N/A"}</div>
          
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 opacity-70" />
            <span className="font-medium">Employees:</span>
          </div>
          <div>{company.employees?.toLocaleString() || "N/A"}</div>
          
          <div className="flex items-center gap-1">
            <BarChart className="h-4 w-4 opacity-70" />
            <span className="font-medium">Revenue:</span>
          </div>
          <div>{company.revenue ? `$${(company.revenue / 1000000000).toFixed(1)}B` : "N/A"}</div>
        </div>

        {company.description && (
          <>
            <Separator className="my-3" />
            <p className="text-sm leading-relaxed">{company.description}</p>
          </>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 flex justify-between items-center">
        <div>
          <Badge variant={company.publiclyTraded ? "default" : "outline"}>
            {company.publiclyTraded ? "Publicly Traded" : "Private Company"}
          </Badge>
          {company.publiclyTraded && company.stockSymbol && (
            <Badge variant="secondary" className="ml-2">
              {company.stockSymbol}
            </Badge>
          )}
        </div>
        
        {company.website && (
          <a 
            href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm flex items-center gap-1 hover:underline text-primary"
          >
            <span>Website</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

// Main component for the Companies page
const Companies: React.FC = () => {
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("companies");

  // Query to fetch companies data from API
  const {
    data: companies = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: [selectedRegion === "all" ? "/api/companies" : `/api/companies/region/${selectedRegion}`],
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Handle Excel import success
  const handleImportSuccess = (count: number) => {
    toast({
      title: "Import Successful",
      description: `${count} companies have been imported successfully.`,
      duration: 5000,
    });
    refetch();
  };

  // Filter companies based on search term
  const filteredCompanies = searchTerm
    ? companies.filter((company: Company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : companies;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Oil Shipping Companies</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="companies" className="mt-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="w-full sm:w-[300px]">
                <Label htmlFor="search">Search Companies</Label>
                <Input
                  id="search"
                  placeholder="Search by name, country, etc."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="w-full sm:w-[200px]">
                <Label htmlFor="region-select">Filter by Region</Label>
                <Select
                  value={selectedRegion}
                  onValueChange={setSelectedRegion}
                >
                  <SelectTrigger id="region-select" className="mt-1">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {REGIONS.map(region => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-end h-full">
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="mt-1"
              >
                Refresh Data
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading companies...</span>
            </div>
          ) : isError ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <p>Failed to load companies data. Please try again.</p>
              <Button variant="outline" className="mt-2" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-muted p-8 rounded-md text-center">
              <p className="text-lg mb-4">No companies found</p>
              {searchTerm ? (
                <p>No results match your search criteria. Try adjusting your search.</p>
              ) : (
                <p>There are no companies in the selected region. Try selecting a different region or importing company data.</p>
              )}
            </div>
          ) : (
            <div>
              <p className="mb-4 text-muted-foreground">
                Showing {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
                {selectedRegion !== "all" && ` in ${selectedRegion}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
              
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                  {filteredCompanies.map((company: Company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="import" className="mt-0">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Import Companies from Excel</h2>
            <p className="text-muted-foreground mb-6">
              Upload an Excel file containing company data to import it into the system.
              The file should include columns for company name, country, region, and other details.
            </p>
            
            <ExcelUploader onImportSuccess={handleImportSuccess} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Companies;