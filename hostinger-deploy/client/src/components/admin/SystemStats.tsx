import React from "react";
import { 
  Users, 
  Ship, 
  Database, 
  Map, 
  FileText, 
  Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SystemStatsProps {
  loading: boolean;
  stats?: any;
}

export function SystemStats({ loading, stats }: SystemStatsProps) {
  // Fallback data if actual stats aren't loaded yet
  const statsData = stats || {
    users: {
      total: 0,
      active: 0,
      premium: 0
    },
    vessels: {
      total: 0,
      oilVessels: 0,
      inPort: 0,
      atSea: 0
    },
    ports: {
      total: 0,
    },
    refineries: {
      total: 0,
      active: 0
    },
    documents: {
      total: 0,
      generated: 0
    },
    system: {
      uptime: "0d 0h 0m",
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      apiCalls: 0,
      apiErrors: 0
    }
  };

  const statCards = [
    {
      title: "Vessels",
      value: statsData.vessels.total,
      icon: Ship,
      details: [
        { label: "Oil Vessels", value: statsData.vessels.oilVessels },
        { label: "In Port", value: statsData.vessels.inPort },
        { label: "At Sea", value: statsData.vessels.atSea }
      ],
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Users",
      value: statsData.users.total,
      icon: Users,
      details: [
        { label: "Active Users", value: statsData.users.active },
        { label: "Premium Users", value: statsData.users.premium },
      ],
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Ports",
      value: statsData.ports.total,
      icon: Map,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Refineries",
      value: statsData.refineries.total,
      icon: Database,
      details: [
        { label: "Active", value: statsData.refineries.active },
      ],
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      title: "Documents",
      value: statsData.documents.total,
      icon: FileText,
      details: [
        { label: "Generated", value: statsData.documents.generated },
      ],
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      title: "API Calls",
      value: statsData.system.apiCalls,
      icon: Activity,
      details: [
        { label: "Errors", value: statsData.system.apiErrors },
      ],
      color: "text-cyan-500",
      bgColor: "bg-cyan-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className={loading ? "opacity-60" : ""}>
            <CardHeader className={`flex flex-row items-center justify-between pb-2 ${card.bgColor}`}>
              <CardTitle className="text-lg font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-[100px] mb-2" />
              ) : (
                <div className="text-3xl font-bold">{card.value.toLocaleString()}</div>
              )}
              {card.details && (
                <div className="text-xs text-muted-foreground pt-2 space-y-1">
                  {card.details.map((detail, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span>{detail.label}</span>
                      {loading ? (
                        <Skeleton className="h-3 w-[40px]" />
                      ) : (
                        <Badge variant="outline" className={card.color}>
                          {detail.value.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>Current system health and resource usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">CPU Usage</span>
              <span className="text-sm font-medium">{statsData.system.cpuUsage}%</span>
            </div>
            <Progress value={loading ? 0 : statsData.system.cpuUsage} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Memory Usage</span>
              <span className="text-sm font-medium">{statsData.system.memoryUsage}%</span>
            </div>
            <Progress value={loading ? 0 : statsData.system.memoryUsage} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Disk Usage</span>
              <span className="text-sm font-medium">{statsData.system.diskUsage}%</span>
            </div>
            <Progress value={loading ? 0 : statsData.system.diskUsage} className="h-2" />
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            System Uptime: <span className="font-medium">{statsData.system.uptime}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}