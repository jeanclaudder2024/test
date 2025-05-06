import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, BadgeDollarSign, BarChart3, CreditCard, LineChart, Users, Ship, Building, FileText, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type MetricCardProps = {
  title: string;
  value: string;
  description?: string;
  trend?: number;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, description, trend, icon }: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend !== undefined && (
          <div className="flex items-center pt-1">
            <span className={`text-xs ${trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-gray-500"}`}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("month");

  // This would be replaced with actual API calls
  const usersQuery = useQuery({
    queryKey: ['/api/admin/metrics/users'],
    enabled: false, // Disabled for now 
  });

  const subscriptionsQuery = useQuery({
    queryKey: ['/api/admin/metrics/subscriptions'],
    enabled: false, // Disabled for now
  });

  // Use mock data for now
  const stats = {
    users: {
      total: 328,
      active: 275,
      trend: 5.2
    },
    revenue: {
      total: "$12,543",
      trend: 8.1
    },
    subscriptions: {
      active: 142,
      trial: 48,
      expired: 24,
      trend: 3.4
    },
    vessels: {
      total: 2499,
      active: 1876,
      trend: 2.1
    }
  };

  // Data for charts could be loaded from API
  const recentActivityData = [
    { user: "john_doe", action: "Subscribed to Premium Plan", time: "23 minutes ago" },
    { user: "jane_smith", action: "Updated user profile", time: "1 hour ago" },
    { user: "marine_tracker", action: "Added new vessel", time: "2 hours ago" },
    { user: "oil_companies", action: "Exported vessel report", time: "3 hours ago" },
    { user: "gulf_shipper", action: "Cancelled subscription", time: "5 hours ago" },
  ];

  return (
    <AdminLayout 
      title="Admin Dashboard" 
      description="Monitor the platform's key metrics and performance insights."
    >
      <Tabs defaultValue={timeRange} className="w-full" onValueChange={(value) => setTimeRange(value)}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-4">Metrics Overview</h2>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="day" className="space-y-4">
          <MetricCards stats={stats} />
        </TabsContent>
        
        <TabsContent value="week" className="space-y-4">
          <MetricCards stats={stats} />
        </TabsContent>
        
        <TabsContent value="month" className="space-y-4">
          <MetricCards stats={stats} />
        </TabsContent>
        
        <TabsContent value="year" className="space-y-4">
          <MetricCards stats={stats} />
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Subscription and one-time payment revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <LineChart className="h-16 w-16 opacity-50" />
              <span className="ml-4 text-lg">Chart visualization will appear here</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivityData.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-2 bg-primary/10 p-1 rounded-full">
                    <AlertCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.action}</p>
                    <div className="flex text-xs text-muted-foreground">
                      <span className="font-medium text-primary">{item.user}</span>
                      <span className="mx-1">•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Activity</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>By plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <BarChart3 className="h-16 w-16 opacity-50" />
              <span className="ml-4 text-lg">Chart visualization will appear here</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <AreaChart className="h-16 w-16 opacity-50" />
              <span className="ml-4 text-lg">Chart visualization will appear here</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function MetricCards({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard 
        title="Total Users" 
        value={stats.users.total.toString()}
        trend={stats.users.trend}
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard 
        title="Monthly Revenue" 
        value={stats.revenue.total}
        trend={stats.revenue.trend}
        icon={<BadgeDollarSign className="h-4 w-4" />}
      />
      <MetricCard 
        title="Active Subscriptions" 
        value={stats.subscriptions.active.toString()}
        description={`${stats.subscriptions.trial} in trial, ${stats.subscriptions.expired} expired`}
        trend={stats.subscriptions.trend}
        icon={<CreditCard className="h-4 w-4" />}
      />
      <MetricCard 
        title="Vessels Tracked" 
        value={stats.vessels.total.toString()}
        description={`${stats.vessels.active} currently active`}
        trend={stats.vessels.trend}
        icon={<Ship className="h-4 w-4" />}
      />
    </div>
  );
}