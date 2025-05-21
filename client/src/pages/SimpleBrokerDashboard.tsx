import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Users, 
  BarChart3, 
  FileText, 
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';

// Company type definition
type Company = {
  id: number;
  name: string;
  country: string;
  products: string;
  fleetSize: number;
  status: 'connected' | 'pending' | 'none';
};

export default function SimpleBrokerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [companies, setCompanies] = useState<Company[]>([
    { id: 1, name: 'Saudi Aramco', country: 'Saudi Arabia', products: 'Crude Oil, LNG', fleetSize: 42, status: 'connected' },
    { id: 2, name: 'Shell Trading', country: 'Netherlands', products: 'Mixed Products', fleetSize: 67, status: 'connected' },
    { id: 3, name: 'ADNOC Distribution', country: 'UAE', products: 'Refined Products', fleetSize: 29, status: 'pending' },
    { id: 4, name: 'BP Trading', country: 'United Kingdom', products: 'Crude, Refined', fleetSize: 51, status: 'connected' },
    { id: 5, name: 'Kuwait Petroleum', country: 'Kuwait', products: 'Crude Oil, LNG', fleetSize: 33, status: 'connected' },
    { id: 6, name: 'Total Energies', country: 'France', products: 'All Products', fleetSize: 59, status: 'none' },
  ]);
  
  // Function to handle viewing company details
  const handleViewDetails = (companyId: number) => {
    alert(`Opening detailed profile for ${companies.find(c => c.id === companyId)?.name}`);
    // In a real app, this would navigate to a company profile page
  };
  
  // Function to handle connecting with a company
  const handleConnect = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      alert(`Initiating connection with ${company.name}`);
      
      // Update the company status
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, status: 'pending' } : c
      ));
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Building className="h-8 w-8 mr-2 text-primary" />
              Oil Broker Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect oil shipping companies with clients and manage deals
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'overview' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('overview')}
              className="flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button 
              variant={activeTab === 'companies' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('companies')}
              className="flex items-center"
            >
              <Building className="h-4 w-4 mr-2" />
              Companies
            </Button>
          </div>
        </div>

        {/* Broker metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground">Active Connections</h3>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">
              {companies.filter(c => c.status === 'connected').length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              +{companies.filter(c => c.status === 'pending').length} pending
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground">Active Deals</h3>
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">7</p>
            <p className="text-sm text-muted-foreground mt-1">+2 in progress</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground">Commission (Month)</h3>
              <div className="p-2 bg-primary/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">$143,250</p>
            <p className="text-sm text-muted-foreground mt-1">+12% from last month</p>
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company connections list */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Connections</CardTitle>
                    <CardDescription>
                      Your active connections with oil shipping companies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Company connections - Active only */}
                      {companies
                        .filter(company => company.status !== 'none')
                        .map(company => (
                          <div key={company.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                                <Building className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{company.name}</p>
                                <p className="text-sm text-muted-foreground">{company.country} • {company.products}</p>
                              </div>
                            </div>
                            <Badge className={company.status === 'connected' ? "bg-green-500" : "bg-yellow-500"}>
                              {company.status === 'connected' ? 'Active' : 'Pending'}
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => setActiveTab('companies')}
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      View All Companies
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Deal stats */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Recent Deals</CardTitle>
                    <CardDescription>Your latest brokered oil deals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div>
                          <p className="font-medium">Saudi Aramco → Shell Trading</p>
                          <p className="text-sm text-muted-foreground">Crude Oil - 500,000 bbl</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">$38.5M</p>
                          <p className="text-sm text-green-600">$385K comm.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div>
                          <p className="font-medium">ADNOC → BP Trading</p>
                          <p className="text-sm text-muted-foreground">Jet Fuel - 250,000 bbl</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">$24.2M</p>
                          <p className="text-sm text-green-600">$242K comm.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div>
                          <p className="font-medium">Kuwait Petro. → Total</p>
                          <p className="text-sm text-muted-foreground">LNG - 150,000 cu.m</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">$18.7M</p>
                          <p className="text-sm text-green-600">$187K comm.</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => alert("Opening deal management interface")}
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Manage All Deals
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Oil Shipping Companies</CardTitle>
                <CardDescription>
                  Browse and connect with major oil shipping companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map(company => (
                    <Card key={company.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <CardDescription>{company.country}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Fleet Size</span>
                            <span className="font-medium">{company.fleetSize} vessels</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Products</span>
                            <span className="font-medium">{company.products}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge className={
                              company.status === 'connected' ? "bg-green-500" : 
                              company.status === 'pending' ? "bg-yellow-500" : "bg-gray-200 text-gray-700"
                            }>
                              {company.status === 'connected' ? 'Connected' : 
                              company.status === 'pending' ? 'Pending' : 'Not Connected'}
                            </Badge>
                          </div>
                        </div>
                        
                        {company.status === 'connected' ? (
                          <Button 
                            className="w-full mt-4" 
                            variant="outline"
                            onClick={() => handleViewDetails(company.id)}
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        ) : company.status === 'pending' ? (
                          <Button 
                            className="w-full mt-4" 
                            variant="outline"
                            disabled={true}
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Connection Pending
                          </Button>
                        ) : (
                          <Button 
                            className="w-full mt-4"
                            onClick={() => handleConnect(company.id)}
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Connect Now
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}