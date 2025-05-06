import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowUpRight, ArrowDownRight, Users, Ship, Building2, FileText, BarChart3, LineChart, PieChart, Download, RotateCw } from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Simulate API calls
  const overviewQuery = useQuery({
    queryKey: ['/api/admin/analytics/overview', timeRange],
    queryFn: async () => {
      // Return mock data
      return overviewData;
    }
  });
  
  const usersQuery = useQuery({
    queryKey: ['/api/admin/analytics/users', timeRange],
    queryFn: async () => {
      // Return mock data
      return userData;
    },
    enabled: activeTab === "users"
  });
  
  const contentQuery = useQuery({
    queryKey: ['/api/admin/analytics/content', timeRange],
    queryFn: async () => {
      // Return mock data
      return contentData;
    },
    enabled: activeTab === "content"
  });
  
  const overview = overviewQuery.data;
  const users = usersQuery.data;
  const content = contentQuery.data;

  function handleTimeRangeChange(value: string) {
    setTimeRange(value);
  }

  function getTrendBadge(trend: number) {
    if (trend > 0) {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          {trend}%
        </Badge>
      );
    } else if (trend < 0) {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center">
          <ArrowDownRight className="h-3 w-3 mr-1" />
          {Math.abs(trend)}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          0%
        </Badge>
      );
    }
  }

  return (
    <AdminLayout
      title="Analytics Dashboard"
      description="View comprehensive analytics and insights about your platform"
      actions={
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {overviewQuery.isLoading ? (
            <div className="flex justify-center items-center h-60">
              <RotateCw className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
              <span className="text-lg">Loading overview data...</span>
            </div>
          ) : overview ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.totalUsers.toLocaleString()}</div>
                    <div className="flex items-center pt-1">
                      {getTrendBadge(overview.usersTrend)}
                      <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Vessels
                    </CardTitle>
                    <Ship className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.activeVessels.toLocaleString()}</div>
                    <div className="flex items-center pt-1">
                      {getTrendBadge(overview.vesselsTrend)}
                      <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Tracked Facilities
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.facilities.toLocaleString()}</div>
                    <div className="flex items-center pt-1">
                      {getTrendBadge(overview.facilitiesTrend)}
                      <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Documents Generated
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.documents.toLocaleString()}</div>
                    <div className="flex items-center pt-1">
                      {getTrendBadge(overview.documentsTrend)}
                      <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Platform Usage</CardTitle>
                    <CardDescription>Total visits, interactions, and activity over time</CardDescription>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px] flex items-center justify-center">
                      <LineChart className="h-16 w-16 text-muted-foreground opacity-50" />
                      <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Top Features</CardTitle>
                    <CardDescription>Most used features by engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {overview.topFeatures.map((feature) => (
                        <div key={feature.name} className="flex items-center">
                          <div className="w-[180px] min-w-[180px]">{feature.name}</div>
                          <div className="w-full">
                            <div className="flex items-center">
                              <div className="w-full mr-4">
                                <Progress value={feature.usage} className="h-2" />
                              </div>
                              <div className="min-w-[40px] text-right text-sm text-muted-foreground">
                                {feature.usage}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Usage by Region</CardTitle>
                    <CardDescription>Activity distribution by geographic location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[240px] flex items-center justify-center">
                      <PieChart className="h-16 w-16 text-muted-foreground opacity-50" />
                      <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-60">
              <p>No analytics data available</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          {usersQuery.isLoading ? (
            <div className="flex justify-center items-center h-60">
              <RotateCw className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
              <span className="text-lg">Loading user analytics...</span>
            </div>
          ) : users ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      New Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.newUsers}</div>
                    <div className="flex items-center pt-1">
                      {getTrendBadge(users.newUsersTrend)}
                      <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.activeUsers}</div>
                    <div className="flex items-center pt-1">
                      {getTrendBadge(users.activeUsersTrend)}
                      <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Retention Rate
                    </CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.retentionRate}%</div>
                    <div className="flex items-center pt-1">
                      {getTrendBadge(users.retentionRateTrend)}
                      <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Session Time
                    </CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.avgSessionTime} min</div>
                    <div className="flex items-center pt-1">
                      {getTrendBadge(users.avgSessionTimeTrend)}
                      <span className="text-xs text-muted-foreground ml-2">from previous period</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>New user registrations over time</CardDescription>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px] flex items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
                      <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Retention</CardTitle>
                    <CardDescription>Weekly cohort analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="px-2">
                    <div className="h-[300px] flex items-center justify-center">
                      <LineChart className="h-16 w-16 text-muted-foreground opacity-50" />
                      <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>User Roles</CardTitle>
                    <CardDescription>Distribution by role type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center">
                      <PieChart className="h-16 w-16 text-muted-foreground opacity-50" />
                      <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Tiers</CardTitle>
                    <CardDescription>Users by subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center">
                      <PieChart className="h-16 w-16 text-muted-foreground opacity-50" />
                      <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Active Devices</CardTitle>
                    <CardDescription>Platform usage by device type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
                      <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-60">
              <p>No user analytics data available</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          {contentQuery.isLoading ? (
            <div className="flex justify-center items-center h-60">
              <RotateCw className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
              <span className="text-lg">Loading content analytics...</span>
            </div>
          ) : content ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Vessels
                    </CardTitle>
                    <Ship className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{content.vessels.total}</div>
                    <div className="text-xs text-muted-foreground">
                      {content.vessels.active} active tracking
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Refineries
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{content.refineries.total}</div>
                    <div className="text-xs text-muted-foreground">
                      {content.refineries.active} active operations
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Documents Created
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{content.documents.total}</div>
                    <div className="text-xs text-muted-foreground">
                      {content.documents.types.length} different document types
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Translations
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{content.translations.total}</div>
                    <div className="text-xs text-muted-foreground">
                      {content.translations.languages} languages supported
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Viewed Vessels</CardTitle>
                    <CardDescription>Vessels with highest view count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {content.vessels.mostViewed.map((vessel) => (
                        <div key={vessel.id} className="flex items-center">
                          <div className="w-[180px] min-w-[180px]">{vessel.name}</div>
                          <div className="w-full">
                            <div className="flex items-center">
                              <div className="w-full mr-4">
                                <Progress value={vessel.views / 10} className="h-2" />
                              </div>
                              <div className="min-w-[50px] text-right text-sm text-muted-foreground">
                                {vessel.views} views
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Most Generated Documents</CardTitle>
                    <CardDescription>Document types by generation frequency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {content.documents.mostGenerated.map((doc) => (
                        <div key={doc.type} className="flex items-center">
                          <div className="w-[180px] min-w-[180px]">{doc.type}</div>
                          <div className="w-full">
                            <div className="flex items-center">
                              <div className="w-full mr-4">
                                <Progress value={doc.count / 5} className="h-2" />
                              </div>
                              <div className="min-w-[50px] text-right text-sm text-muted-foreground">
                                {doc.count} 
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-60">
              <p>No content analytics data available</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8,546</div>
                <div className="flex items-center pt-1">
                  {getTrendBadge(12.4)}
                  <span className="text-xs text-muted-foreground ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Annual Revenue
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$98,354</div>
                <div className="flex items-center pt-1">
                  {getTrendBadge(8.2)}
                  <span className="text-xs text-muted-foreground ml-2">projected growth</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Subscriptions
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <div className="flex items-center pt-1">
                  {getTrendBadge(5.7)}
                  <span className="text-xs text-muted-foreground ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Revenue per User
                </CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$58.23</div>
                <div className="flex items-center pt-1">
                  {getTrendBadge(2.1)}
                  <span className="text-xs text-muted-foreground ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly revenue by subscription tiers</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px] flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Churn Rate</CardTitle>
                <CardDescription>Monthly subscription cancellations</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[220px] flex items-center justify-center">
                  <LineChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Country</CardTitle>
                <CardDescription>Geographic distribution</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[220px] flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trial Conversion</CardTitle>
                <CardDescription>Trial to paid subscription rate</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[220px] flex items-center justify-center">
                  <LineChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="ml-4 text-lg text-muted-foreground">Chart visualization will appear here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

// Mock data for development
const overviewData = {
  totalUsers: 328,
  usersTrend: 5.2,
  activeVessels: 2499,
  vesselsTrend: 2.1,
  facilities: 253,
  facilitiesTrend: 1.5,
  documents: 1842,
  documentsTrend: 12.3,
  topFeatures: [
    { name: "Vessel Tracking", usage: 92 },
    { name: "Document Generation", usage: 78 },
    { name: "Analytics Dashboard", usage: 65 },
    { name: "Translation Service", usage: 53 },
    { name: "API Integration", usage: 42 }
  ],
  regionUsage: [
    { name: "North America", percentage: 35 },
    { name: "Europe", percentage: 30 },
    { name: "Asia-Pacific", percentage: 25 },
    { name: "Middle East", percentage: 5 },
    { name: "Other", percentage: 5 }
  ]
};

const userData = {
  newUsers: 42,
  newUsersTrend: 8.7,
  activeUsers: 275,
  activeUsersTrend: 4.3,
  retentionRate: 78,
  retentionRateTrend: -2.5,
  avgSessionTime: 18.5,
  avgSessionTimeTrend: 3.2,
  userRoles: [
    { role: "Admin", count: 8 },
    { role: "Regular", count: 320 }
  ],
  subscriptions: [
    { plan: "Free", count: 186 },
    { plan: "Basic", count: 84 },
    { plan: "Pro", count: 46 },
    { plan: "Enterprise", count: 12 }
  ],
  devices: [
    { type: "Desktop", percentage: 72 },
    { type: "Mobile", percentage: 18 },
    { type: "Tablet", percentage: 10 }
  ]
};

const contentData = {
  vessels: {
    total: 2499,
    active: 1876,
    mostViewed: [
      { id: 1, name: "Oceanic Voyager", views: 834 },
      { id: 2, name: "Western Commander", views: 720 },
      { id: 3, name: "Royal Commander", views: 593 },
      { id: 4, name: "Pacific Mariner", views: 481 },
      { id: 5, name: "Eastern Pioneer", views: 378 }
    ]
  },
  refineries: {
    total: 30,
    active: 27
  },
  documents: {
    total: 1842,
    types: ["Bill of Lading", "Quality Certificate", "Loading Report", "Cargo Manifest", "Charter Party"],
    mostGenerated: [
      { type: "Bill of Lading", count: 468 },
      { type: "Quality Certificate", count: 352 },
      { type: "Cargo Manifest", count: 294 },
      { type: "Loading Report", count: 198 },
      { type: "Charter Party", count: 127 }
    ]
  },
  translations: {
    total: 583, 
    languages: 8
  }
};