import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Building2, Search, Globe, Building, Globe2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { REGIONS } from "@shared/constants";

type OilCompany = {
  id: number;
  name: string;
  country: string;
  region: string;
  fleetSize: number | null;
  foundedYear: number | null;
  headquarters: string | null;
  ceo: string | null;
  revenue: string | null;
  specialization: string | null;
  website: string | null;
  description: string | null;
  majorRoutes: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function OilCompanies() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [view, setView] = useState("grid");

  // Fetch oil companies data
  const { data: oilCompanies, isLoading, isError } = useQuery({
    queryKey: ["/api/oil-companies"],
    retry: 1,
  });

  // Filter companies based on search term and region
  const filteredCompanies = React.useMemo(() => {
    if (!oilCompanies) return [];

    return oilCompanies.filter((company: OilCompany) => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRegion = selectedRegion === "all" || company.region === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });
  }, [oilCompanies, searchTerm, selectedRegion]);

  // Handler for seed button
  const handleSeedData = async () => {
    try {
      const response = await apiRequest("/api/oil-companies/seed", {
        method: "POST",
      });
      console.log("Seed response:", response);
      // Refresh the data after seeding
      window.location.reload();
    } catch (error) {
      console.error("Error seeding oil company data:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-xl font-semibold">Error loading oil companies</h2>
        <p className="text-muted-foreground">
          There was an error loading the oil companies data. Please try again later.
        </p>
        <Button onClick={handleSeedData} variant="default">
          Seed Oil Company Data
        </Button>
      </div>
    );
  }

  if (!oilCompanies || oilCompanies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-xl font-semibold">No oil companies found</h2>
        <p className="text-muted-foreground">
          No oil companies are currently in the database. Click the button below to seed some sample data.
        </p>
        <Button onClick={handleSeedData} variant="default">
          Seed Oil Company Data
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Oil Companies"
        description="View and manage global oil shipping companies"
        actions={
          <div className="flex space-x-2">
            <Button onClick={handleSeedData} variant="outline" size="sm">
              <Building className="mr-2 h-4 w-4" />
              Seed Data
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, country or description..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedRegion}
            onValueChange={setSelectedRegion}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {REGIONS.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              className="rounded-none px-3"
              onClick={() => setView("grid")}
            >
              <Building2 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              className="rounded-none px-3"
              onClick={() => setView("table")}
            >
              <Building className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-muted-foreground">No oil companies match your search criteria.</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company: OilCompany) => (
              <Card key={company.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl truncate">{company.name}</CardTitle>
                    <Badge variant="outline">{company.region}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{company.country}</div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span>{company.headquarters || company.country}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {company.foundedYear && (
                      <div>
                        <span className="text-muted-foreground block">Founded</span>
                        <span>{company.foundedYear}</span>
                      </div>
                    )}
                    {company.fleetSize && (
                      <div>
                        <span className="text-muted-foreground block">Fleet Size</span>
                        <span>{company.fleetSize} vessels</span>
                      </div>
                    )}
                    {company.specialization && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground block">Specialization</span>
                        <span>{company.specialization}</span>
                      </div>
                    )}
                  </div>
                  
                  {company.description && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground line-clamp-3">{company.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Fleet Size</TableHead>
                  <TableHead>Founded</TableHead>
                  <TableHead>Specialization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company: OilCompany) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.country}</TableCell>
                    <TableCell>{company.region}</TableCell>
                    <TableCell>{company.fleetSize || 'N/A'}</TableCell>
                    <TableCell>{company.foundedYear || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{company.specialization || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCompanies.length} of {oilCompanies.length} oil companies
          </p>
        </div>
      </div>
    </div>
  );
}