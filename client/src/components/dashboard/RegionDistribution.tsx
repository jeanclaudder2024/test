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

// Datos por defecto para cuando no hay datos disponibles
const defaultData: RegionDistributionData = {
  totalVessels: 0,
  totalOilVessels: 0,
  regions: []
};

export default function RegionDistribution() {
  const [data, setData] = useState<RegionDistributionData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("/api/stats/vessels-by-region");
        
        // Validar y procesar los datos recibidos
        if (response && Array.isArray(response)) {
          // Transformar los datos de la API al formato que espera el componente
          const processedData: RegionDistributionData = {
            totalVessels: response.reduce((sum, item) => sum + (item.count || 0), 0),
            totalOilVessels: response.reduce((sum, item) => sum + (item.oilVesselCount || 0), 0),
            regions: response.map(item => ({
              region: item.region || 'Unknown',
              regionName: item.regionName || item.region || 'Unknown',
              count: item.count || 0,
              percentage: ((item.count || 0) / response.reduce((sum, r) => sum + (r.count || 0), 0) * 100).toFixed(1),
              oilVesselCount: item.oilVesselCount || 0
            }))
          };
          setData(processedData);
        } else {
          // Si la respuesta no es un array, usar datos por defecto
          console.warn("API response is not an array:", response);
          setData(defaultData);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching region distribution:", err);
        setError("Failed to load vessel distribution data");
        // En caso de error, usar datos por defecto
        setData(defaultData);
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
          Geographic analysis of {data.totalVessels ? data.totalVessels.toLocaleString() : '0'} vessels
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
            {data.regions && data.regions.length > 0 ? data.regions.map((region) => (
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
            )) : (
              <div className="text-center text-muted-foreground py-8">
                No hay datos de regiones disponibles
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="oil" className="space-y-4 h-[320px] overflow-y-auto pr-2">
            {data.regions && data.regions.length > 0 ? data.regions.map((region) => {
              // Evitar división por cero
              const oilPercentage = data.totalOilVessels > 0 
                ? ((region.oilVesselCount / data.totalOilVessels) * 100).toFixed(1) 
                : '0.0';
              
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
            }) : (
              <div className="text-center text-muted-foreground py-8">
                No hay datos de buques petroleros disponibles
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Globe className="mr-1 h-3.5 w-3.5" />
            <span>Total: {data.totalVessels ? data.totalVessels.toLocaleString() : '0'}</span>
          </div>
          <div className="flex items-center">
            <Droplet className="mr-1 h-3.5 w-3.5" />
            <span>Oil Vessels: {data.totalOilVessels ? data.totalOilVessels.toLocaleString() : '0'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}