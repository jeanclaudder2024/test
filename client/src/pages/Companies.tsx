import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Building, Users, Search, MapPin, Factory } from 'lucide-react';
import { REGIONS } from '@shared/constants';
import { Company } from '@shared/schema';

interface Region {
  id: string;
  name: string;
  nameAr: string;
}

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Fetch companies data
  const { data: companiesResponse, isLoading, error } = useQuery({
    queryKey: ['/api/companies'],
    staleTime: 60000, // 1 minute
  });

  // Extract companies array from backend response
  const companies = (companiesResponse as any)?.companies || [];

  // Filter companies based on search term and selected region
  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = searchTerm === '' || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.specialization && company.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.country && company.country.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRegion = !selectedRegion || company.region === selectedRegion;
    
    return matchesSearch && matchesRegion;
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Companies</h1>
          <p className="text-gray-600">Unable to load company data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Oil Companies Directory</h1>
        <p className="text-lg text-gray-600">
          Discover leading oil companies worldwide, from major corporations to specialized operators.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search companies by name, specialization, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Region Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedRegion === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion(null)}
            >
              All Regions
            </Button>
            {REGIONS.map((region: Region) => (
              <Button
                key={region.id}
                variant={selectedRegion === region.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRegion(region.id)}
              >
                {region.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          {isLoading ? (
            <span>Loading companies...</span>
          ) : (
            <span>
              Showing {filteredCompanies.length} of {companies.length} companies
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedRegion && ` in ${REGIONS.find(r => r.id === selectedRegion)?.name}`}
            </span>
          )}
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCompanies.length === 0 ? (
          // No results
          <div className="col-span-full text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find more companies.
            </p>
          </div>
        ) : (
          // Company cards
          filteredCompanies.map((company: Company) => (
            <CompanyCard key={company.id} company={company} />
          ))
        )}
      </div>
    </div>
  );
}

// Company Card Component
const CompanyCard = ({ company }: { company: Company }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {company.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {company.country}
              {company.region && ` • ${company.region}`}
            </CardDescription>
          </div>
          <Badge 
            variant={company.companyType === 'real' ? 'default' : 'secondary'}
            className="ml-2"
          >
            {company.companyType === 'real' ? 'Verified' : 'Listed'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Description */}
          {company.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {company.description}
            </p>
          )}

          {/* Specialization */}
          {company.specialization && (
            <div className="flex items-center gap-2 text-sm">
              <Factory className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{company.specialization}</span>
            </div>
          )}

          {/* Company Details */}
          <div className="flex flex-wrap gap-2 text-xs">
            {company.foundedYear && (
              <Badge variant="outline">Est. {company.foundedYear}</Badge>
            )}
            {company.fleetSize && (
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {company.fleetSize} vessels
              </Badge>
            )}
            {company.publiclyTraded && (
              <Badge variant="outline">
                {company.stockSymbol || 'Public'}
              </Badge>
            )}
          </div>

          {/* Website Link */}
          {company.website && (
            <div className="pt-2 border-t">
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Globe className="h-3 w-3" />
                Visit Website
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};