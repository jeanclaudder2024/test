import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  MapPin, 
  Users, 
  Globe, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  User,
  Search,
  ExternalLink,
  Factory,
  Handshake
} from 'lucide-react';

interface CompanyWithRealData {
  id: number;
  generatedName: string;
  realCompany: {
    id: number;
    name: string;
    industry: string;
    address: string;
    logo?: string;
    description: string;
    website?: string;
    phone?: string;
    email?: string;
    founded?: number;
    employees?: number;
    revenue?: string;
    headquarters?: string;
    ceo?: string;
  };
}

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch fake companies with real company data
  const { data: response, isLoading } = useQuery({
    queryKey: ['/api/companies'],
    retry: false,
  });

  const companies = Array.isArray(response) ? response : [];

  const filteredCompanies = companies.filter((company: CompanyWithRealData) =>
    company.generatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.realCompany.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.realCompany.headquarters?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestDeal = (companyName: string) => {
    toast({
      title: "Deal Request Initiated",
      description: `Your deal request with ${companyName} has been submitted. We'll contact you soon.`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Oil Trading Companies
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Connect with leading oil trading companies worldwide. Discover partnerships, 
            explore opportunities, and initiate deals with industry professionals.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies, industries, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Active Companies</p>
                  <p className="text-2xl font-bold text-white">{companies.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Industries</p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(companies.map((c: CompanyWithRealData) => c.realCompany.industry)).size}
                  </p>
                </div>
                <Factory className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Countries</p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(companies.map((c: CompanyWithRealData) => 
                      c.realCompany.headquarters?.split(',').pop()?.trim() || 'Global'
                    )).size}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company: CompanyWithRealData) => (
            <Card key={company.id} className="group hover:shadow-xl transition-all duration-300 bg-gray-800/90 backdrop-blur-sm border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {company.realCompany.logo ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center">
                        <img 
                          src={company.realCompany.logo} 
                          alt={`${company.realCompany.name} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center"><svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg group-hover:text-orange-400 transition-colors text-white">
                        {company.realCompany.name}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1 text-gray-400">
                        <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded-full border border-orange-600/30">
                          {company.realCompany.industry}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Company Description */}
                <p className="text-sm text-gray-300 line-clamp-3">
                  {company.realCompany.description}
                </p>

                {/* Company Details */}
                <div className="space-y-2">
                  {company.realCompany.headquarters && (
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                      {company.realCompany.headquarters}
                    </div>
                  )}

                  {company.realCompany.ceo && (
                    <div className="flex items-center text-sm text-gray-300">
                      <User className="h-4 w-4 mr-2 text-orange-500" />
                      CEO: {company.realCompany.ceo}
                    </div>
                  )}

                  {company.realCompany.founded && (
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                      Founded {company.realCompany.founded}
                    </div>
                  )}

                  {company.realCompany.employees && (
                    <div className="flex items-center text-sm text-gray-300">
                      <Users className="h-4 w-4 mr-2 text-orange-500" />
                      {company.realCompany.employees.toLocaleString()} employees
                    </div>
                  )}

                  {company.realCompany.revenue && (
                    <div className="flex items-center text-sm text-gray-300">
                      <DollarSign className="h-4 w-4 mr-2 text-orange-500" />
                      Revenue: {company.realCompany.revenue}
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {company.realCompany.website && (
                        <Button variant="outline" size="sm" asChild className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          <a 
                            href={company.realCompany.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            Website
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}

                      {company.realCompany.email && (
                        <Button variant="outline" size="sm" asChild className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          <a href={`mailto:${company.realCompany.email}`} className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Request Deal Button */}
                <div className="pt-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                    onClick={() => handleRequestDeal(company.realCompany.name)}
                  >
                    <Handshake className="h-4 w-4 mr-2" />
                    Request Deal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-orange-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No companies found</h3>
            <p className="text-gray-300">
              {searchTerm 
                ? "Try adjusting your search terms to find what you're looking for."
                : "No companies are currently available."}
            </p>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-2">Ready to Start Trading?</h2>
              <p className="text-orange-100 mb-6">
                Join thousands of oil trading professionals and start building valuable partnerships today.
              </p>
              <Button variant="secondary" size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}