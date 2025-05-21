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

export default function SimpleBrokerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
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
            <p className="text-3xl font-bold mt-2">24</p>
            <p className="text-sm text-muted-foreground mt-1">+3 since last month</p>
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
                      {/* Company connections */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Saudi Aramco</p>
                            <p className="text-sm text-muted-foreground">Saudi Arabia • Crude Oil</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Shell Trading</p>
                            <p className="text-sm text-muted-foreground">Netherlands • Mixed Products</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">ADNOC Distribution</p>
                            <p className="text-sm text-muted-foreground">UAE • Refined Products</p>
                          </div>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4" variant="outline">
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      View All Connections
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
                    
                    <Button className="w-full mt-4" variant="outline">
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
                  {/* Company 1 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Saudi Aramco</CardTitle>
                      <CardDescription>Saudi Arabia</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Fleet Size</span>
                          <span className="font-medium">42 vessels</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Products</span>
                          <span className="font-medium">Crude Oil, LNG</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge className="bg-green-500">Connected</Badge>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" variant="outline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Company 2 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Shell Trading</CardTitle>
                      <CardDescription>Netherlands</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Fleet Size</span>
                          <span className="font-medium">67 vessels</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Products</span>
                          <span className="font-medium">Mixed Products</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge className="bg-green-500">Connected</Badge>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" variant="outline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Company 3 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">ADNOC Distribution</CardTitle>
                      <CardDescription>UAE</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Fleet Size</span>
                          <span className="font-medium">29 vessels</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Products</span>
                          <span className="font-medium">Refined Products</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" variant="outline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Company 4 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">BP Trading</CardTitle>
                      <CardDescription>United Kingdom</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Fleet Size</span>
                          <span className="font-medium">51 vessels</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Products</span>
                          <span className="font-medium">Crude, Refined</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge className="bg-green-500">Connected</Badge>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" variant="outline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Company 5 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Kuwait Petroleum</CardTitle>
                      <CardDescription>Kuwait</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Fleet Size</span>
                          <span className="font-medium">33 vessels</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Products</span>
                          <span className="font-medium">Crude Oil, LNG</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge className="bg-green-500">Connected</Badge>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" variant="outline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Company 6 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Energies</CardTitle>
                      <CardDescription>France</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Fleet Size</span>
                          <span className="font-medium">59 vessels</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Products</span>
                          <span className="font-medium">All Products</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant="outline">Not Connected</Badge>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Connect Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}