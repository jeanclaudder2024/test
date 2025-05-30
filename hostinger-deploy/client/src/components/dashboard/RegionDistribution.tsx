import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Globe, Droplet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RegionCount {
  region: string;
  regionName: string;
  count: number;
  percentage: string;
  oilVesselCount: number;
}

interface RegionDistributionData {
  totalVessels: number;
  totalOilVessels: number;
  regions: RegionCount[];
}

export default function RegionDistribution() {
  const [data, setData] = useState<RegionDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/api/stats/vessels-by-region");
        setData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching region distribution:", err);
        setError("Failed to load vessel distribution data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Card className="col-span-12 md:col-span-6 h-[400px] animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded-md w-3/4"></div>
          <div className="h-4 bg-muted rounded-md w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded-md w-1/3"></div>
                <div className="h-2 bg-muted rounded-md w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-12 md:col-span-6 h-[400px]">
        <CardHeader>
          <CardTitle>Vessel Distribution</CardTitle>
          <CardDescription>By Geographic Region</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>{error}</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="col-span-12 md:col-span-6 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          Vessel Distribution
        </CardTitle>
        <CardDescription>
          Geographic analysis of {data.totalVessels.toLocaleString()} vessels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Vessels</TabsTrigger>
            <TabsTrigger value="oil">
              <Droplet className="mr-1 h-3.5 w-3.5" />
              Oil Vessels
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 h-[320px] overflow-y-auto pr-2">
            {data.regions.map((region) => (
              <div key={region.region} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">
                    {region.regionName}
                    <Badge 
                      variant="outline" 
                      className="ml-2 text-xs font-normal"
                    >
                      {region.count.toLocaleString()}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{region.percentage}%</span>
                </div>
                <Progress value={parseFloat(region.percentage)} className="h-2" />
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="oil" className="space-y-4 h-[320px] overflow-y-auto pr-2">
            {data.regions.map((region) => {
              const oilPercentage = (region.oilVesselCount / data.totalOilVessels * 100).toFixed(1);
              return (
                <div key={region.region} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">
                      {region.regionName}
                      <Badge 
                        variant="outline" 
                        className="ml-2 text-xs font-normal"
                      >
                        {region.oilVesselCount.toLocaleString()}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{oilPercentage}%</span>
                  </div>
                  <Progress value={parseFloat(oilPercentage)} className="h-2" />
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Globe className="mr-1 h-3.5 w-3.5" />
            <span>Total: {data.totalVessels.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <Droplet className="mr-1 h-3.5 w-3.5" />
            <span>Oil Vessels: {data.totalOilVessels.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}