import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  Ship,
  Anchor,
  ChevronRight,
  MessageCircle,
  Copy
} from 'lucide-react';

interface RealCompany {
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
}

interface Vessel {
  id: number;
  name: string;
  imo?: string;
  vesselType?: string;
  oilType?: string;
  cargoCapacity?: number;
  currentLocation?: string;
}

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);

  // Fetch companies with subscription limits
  const { data: response, isLoading } = useQuery({
    queryKey: ['/api/companies'],
    staleTime: 0, // Always get fresh data
    retry: false,
  });

  const companies = Array.isArray(response) ? response : [];

  // Get company name for expanded company
  const expandedCompanyName = expandedCompany ? 
    companies.find(c => c.id === expandedCompany)?.name : null;

  // Fetch vessels for expanded company
  const { data: companyVessels, isLoading: vesselsLoading } = useQuery({
    queryKey: [`/api/admin/companies/${encodeURIComponent(expandedCompanyName || '')}/vessels`],
    enabled: !!expandedCompanyName,
    retry: false,
  });

  const filteredCompanies = companies.filter((company: RealCompany) =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.headquarters?.toLowerCase().includes(searchTerm.toLowerCase())
  );



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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Oil Trading Companies
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 border-gray-200 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Companies</p>
                  <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Industries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(companies.map((c: RealCompany) => c.industry).filter(Boolean)).size}
                  </p>
                </div>
                <Factory className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Countries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(companies.map((c: RealCompany) => 
                      c.headquarters?.split(',').pop()?.trim() || 'Global'
                    ).filter(Boolean)).size}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCompanies.map((company: RealCompany) => (
            <Card key={company.id} className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-orange-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700" />
              
              <CardHeader className="pb-6 relative z-10">
                <div className="flex items-start space-x-4">
                  {/* Enhanced Logo */}
                  <div className="relative">
                    {company.logo ? (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-lg ring-4 ring-orange-100 group-hover:ring-orange-200 transition-all duration-300">
                        <img 
                          src={company.logo} 
                          alt={`${company.name} logo`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg"><svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-orange-100 group-hover:ring-orange-200 transition-all duration-300">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                    )}
                    {/* Animated pulse ring */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-orange-400/30 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors duration-300 text-gray-900 mb-2 leading-tight">
                      {company.name}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <span className="text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                        {company.industry}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                {/* Company Description */}
                <div className="bg-gradient-to-r from-gray-50 to-orange-50/50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                    {company.description}
                  </p>
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {company.headquarters && (
                    <div className="flex items-center text-sm text-gray-700 bg-white/60 rounded-lg p-3 border border-gray-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-gray-600">{company.headquarters}</p>
                      </div>
                    </div>
                  )}

                  {company.ceo && (
                    <div className="flex items-center text-sm text-gray-700 bg-white/60 rounded-lg p-3 border border-gray-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Chief Executive</p>
                        <p className="text-gray-600">{company.ceo}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {company.founded && (
                      <div className="bg-white/60 rounded-lg p-3 border border-gray-100 text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-md flex items-center justify-center mx-auto mb-2">
                          <Calendar className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-gray-900">Founded</p>
                        <p className="text-sm font-bold text-gray-700">{company.founded}</p>
                      </div>
                    )}

                    {company.employees && (
                      <div className="bg-white/60 rounded-lg p-3 border border-gray-100 text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-md flex items-center justify-center mx-auto mb-2">
                          <Users className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-gray-900">Employees</p>
                        <p className="text-sm font-bold text-gray-700">{company.employees.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {company.revenue && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-emerald-800">Annual Revenue</p>
                          <p className="text-sm font-bold text-emerald-900">{company.revenue}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Contact Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Direct Contact
                  </h4>
                  <div className="space-y-2">
                    {company.email && (
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-2">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-gray-700">{company.email}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-green-100"
                            onClick={() => {
                              navigator.clipboard.writeText(company.email || '');
                              // You could add a toast notification here
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-green-100"
                            onClick={() => window.open(`mailto:${company.email}`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {company.phone && (
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-2">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-gray-700">{company.phone}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-green-100"
                            onClick={() => {
                              navigator.clipboard.writeText(company.phone || '');
                              // You could add a toast notification here
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-green-100"
                            onClick={() => window.open(`tel:${company.phone}`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {!company.email && !company.phone && (
                      <p className="text-sm text-gray-500 italic">Contact information not available</p>
                    )}
                  </div>
                </div>

                {/* Fleet Information */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
                    variant="ghost"
                    className="w-full justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 rounded-lg group/fleet"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                        <Ship className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-blue-900">Fleet Information</p>
                        <p className="text-xs text-blue-600">View company vessels</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-blue-600 transition-transform duration-300 ${
                      expandedCompany === company.id ? 'rotate-90' : ''
                    }`} />
                  </Button>

                  {/* Vessels Display */}
                  {expandedCompany === company.id && (
                    <div className="mt-4 space-y-3">
                      {vesselsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                          <p className="text-sm text-gray-600 mt-2">Loading vessels...</p>
                        </div>
                      ) : companyVessels && companyVessels.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-900 mb-3">
                            🚢 Fleet ({companyVessels.length} vessels)
                          </p>
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {companyVessels.slice(0, 5).map((vessel: Vessel) => (
                              <div
                                key={vessel.id}
                                className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-3 border border-slate-200 hover:border-blue-300 transition-all duration-300 group/vessel"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-gradient-to-br from-slate-500 to-slate-600 rounded-md flex items-center justify-center">
                                      <Anchor className="h-3 w-3 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-900 text-sm group-hover/vessel:text-blue-700 transition-colors">
                                        {vessel.name}
                                      </p>
                                      <div className="flex items-center space-x-2 text-xs text-slate-600">
                                        {vessel.imo && (
                                          <span className="bg-slate-200 px-2 py-0.5 rounded">
                                            IMO: {vessel.imo}
                                          </span>
                                        )}
                                        {vessel.vesselType && (
                                          <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                                            {vessel.vesselType}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right text-xs">
                                    {vessel.oilType && (
                                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                                        {vessel.oilType}
                                      </span>
                                    )}
                                    {vessel.cargoCapacity && (
                                      <p className="text-slate-600 mt-1">
                                        {vessel.cargoCapacity.toLocaleString()} MT
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {companyVessels.length > 5 && (
                              <div className="text-center py-2">
                                <p className="text-xs text-gray-500">
                                  +{companyVessels.length - 5} more vessels
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Ship className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No vessels found for this company</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-gradient-to-r from-gray-200 to-orange-200">
                  <div className="flex flex-wrap gap-2">
                    {company.website && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild 
                        className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 group/btn"
                      >
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <Globe className="h-3 w-3 mr-1 group-hover/btn:rotate-12 transition-transform duration-300" />
                          Website
                          <ExternalLink className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                        </a>
                      </Button>
                    )}

                    {company.email && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild 
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group/btn"
                      >
                        <a href={`mailto:${company.email}`} className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 group-hover/btn:scale-110 transition-transform duration-300" />
                          Contact
                        </a>
                      </Button>
                    )}

                    {company.phone && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild 
                        className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-300 group/btn"
                      >
                        <a href={`tel:${company.phone}`} className="flex items-center">
                          <Phone className="h-3 w-3 mr-1 group-hover/btn:rotate-12 transition-transform duration-300" />
                          Call
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? "Try adjusting your search terms to find what you're looking for."
                : "No companies are currently available."}
            </p>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-2">Ready to Start Trading?</h2>
              <p className="text-blue-100 mb-6">
                Join thousands of oil trading professionals and start building valuable partnerships today.
              </p>
              <Button variant="secondary" size="lg">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}