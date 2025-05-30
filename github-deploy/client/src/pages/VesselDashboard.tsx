import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Anchor, Ship, Package, FileText, User, Building, MapPin, Filter, Info, MoreHorizontal, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Vessel } from "@shared/schema";
import { Link } from "wouter";

// Define types for our data
interface VesselJob {
  id: number;
  vesselId: number;
  jobType: string;
  status: string;
  gateId: number;
  brokerId: number;
  startTime: string;
  estimatedEndTime: string;
  actualEndTime?: string;
  cargoDetails: string;
  unloadingProgress: number;
  createdAt: string;
  lastUpdated: string;
  notes?: string;
  gate?: Gate;
  broker?: Broker;
}

interface Gate {
  id: number;
  portId: number;
  name: string;
  number: string;
  status: string;
  type: string;
  capacity?: number;
  currentOccupancy?: number;
  description?: string;
  port?: {
    id: number;
    name: string;
    country: string;
  };
}

interface Broker {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  country?: string;
}

interface VesselWithJob extends Vessel {
  currentJob?: VesselJob;
  extraInfo?: {
    loadingStatus: string;
    colorCode: string;
    currentGateId?: number;
  };
  documents?: Document[];
}

interface Document {
  id: number;
  vesselId: number;
  type: string;
  title: string;
  content: string;
  status: string;
  issueDate: string;
  expiryDate?: string;
  reference?: string;
  issuer?: string;
  recipientName?: string;
  recipientOrg?: string;
}

const VesselDashboard: React.FC = () => {
  const [vessels, setVessels] = useState<VesselWithJob[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<VesselWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch vessel data with jobs and status
  useEffect(() => {
    const fetchVesselData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/vessel-dashboard');
        setVessels(response.data);
        setFilteredVessels(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load vessel dashboard data",
          variant: "destructive",
        });
        console.error("Error fetching vessel data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVesselData();
  }, [toast]);

  // Filter vessels based on search term and status
  useEffect(() => {
    let result = vessels;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        vessel => 
          vessel.name.toLowerCase().includes(term) || 
          vessel.imo.toLowerCase().includes(term) ||
          vessel.mmsi.toLowerCase().includes(term) ||
          vessel.vesselType?.toLowerCase().includes(term) ||
          vessel.currentJob?.gate?.name.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (statusFilter) {
      result = result.filter(vessel => vessel.extraInfo?.loadingStatus === statusFilter);
    }
    
    setFilteredVessels(result);
  }, [searchTerm, statusFilter, vessels]);

  // Status badge component with color coding
  const StatusBadge = ({ status }: { status: string }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let icon = null;
    
    switch (status) {
      case 'unloading':
        variant = "destructive";
        icon = <Package className="h-3 w-3 mr-1" />;
        break;
      case 'completed':
        variant = "default";
        icon = <Ship className="h-3 w-3 mr-1" />;
        break;
      case 'waiting':
        variant = "secondary";
        icon = <Anchor className="h-3 w-3 mr-1" />;
        break;
      case 'loading':
        variant = "outline";
        icon = <Package className="h-3 w-3 mr-1" />;
        break;
      default:
        variant = "outline";
    }
    
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get color based on vessel status for the list
  const getVesselRowClass = (vessel: VesselWithJob) => {
    if (!vessel.extraInfo) return "";
    
    switch (vessel.extraInfo.colorCode) {
      case 'red':
        return "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30";
      case 'green':
        return "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30";
      case 'blue':
        return "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30";
      default:
        return "";
    }
  };

  // Arabic translations for status
  const getArabicStatus = (status: string) => {
    switch (status) {
      case 'unloading':
        return 'قيد التفريغ';
      case 'completed':
        return 'تم التفريغ';
      case 'waiting':
        return 'في الانتظار';
      case 'loading':
        return 'قيد التحميل';
      default:
        return status;
    }
  };

  // Statistics for the dashboard
  const getStatistics = () => {
    if (!vessels.length) return { total: 0, unloading: 0, completed: 0, waiting: 0, loading: 0 };
    
    return {
      total: vessels.length,
      unloading: vessels.filter(v => v.extraInfo?.loadingStatus === 'unloading').length,
      completed: vessels.filter(v => v.extraInfo?.loadingStatus === 'completed').length,
      waiting: vessels.filter(v => v.extraInfo?.loadingStatus === 'waiting').length,
      loading: vessels.filter(v => v.extraInfo?.loadingStatus === 'loading').length,
    };
  };

  const stats = getStatistics();
  
  // Parse cargo details JSON
  const parseCargoDetails = (cargoDetailsJson?: string) => {
    if (!cargoDetailsJson) return { type: 'Unknown', quantity: 0, unit: '' };
    
    try {
      return JSON.parse(cargoDetailsJson);
    } catch (e) {
      return { type: 'Unknown', quantity: 0, unit: '' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vessel Dashboard</h1>
            <p className="text-muted-foreground">
              <span className="mr-2">لوحة معلومات السفن</span>
              Manage and track vessels, gates, and operations
            </p>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Vessels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <span className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                  Unloading
                  <span className="text-xs text-muted-foreground mr-2 ml-auto">قيد التفريغ</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unloading}</div>
              <div className="h-2 mt-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all" 
                  style={{ width: `${(stats.unloading / stats.total) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <span className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Completed
                  <span className="text-xs text-muted-foreground mr-2 ml-auto">تم التفريغ</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="h-2 mt-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all" 
                  style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <span className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  Waiting
                  <span className="text-xs text-muted-foreground mr-2 ml-auto">في الانتظار</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.waiting}</div>
              <div className="h-2 mt-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all" 
                  style={{ width: `${(stats.waiting / stats.total) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <span className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                  Loading
                  <span className="text-xs text-muted-foreground mr-2 ml-auto">قيد التحميل</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.loading}</div>
              <div className="h-2 mt-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all" 
                  style={{ width: `${(stats.loading || 0) / stats.total * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search vessels, IMO, gates..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter ? (
                  <span>Status: {statusFilter}</span>
                ) : (
                  <span>Filter Status</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('unloading')}>
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                Unloading (قيد التفريغ)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                Completed (تم التفريغ)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('waiting')}>
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                Waiting (في الانتظار)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('loading')}>
                <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                Loading (قيد التحميل)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Vessels Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vessels Dashboard</CardTitle>
            <CardDescription>
              All vessels with current status, assignments and documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredVessels.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Ship className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No vessels found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn't find any vessels matching your criteria.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px]">Vessel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gate Assignment</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Oil Company</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVessels.map((vessel) => {
                    const cargoDetails = parseCargoDetails(vessel.currentJob?.cargoDetails);
                    
                    return (
                      <TableRow 
                        key={vessel.id}
                        className={getVesselRowClass(vessel)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <Link to={`/vessels/${vessel.id}`} className="font-semibold hover:underline">
                              {vessel.name}
                            </Link>
                            <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                              <span>IMO: {vessel.imo}</span>
                              <span className="text-muted-foreground/50">|</span>
                              <span>{vessel.vesselType}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={vessel.extraInfo?.loadingStatus || 'unknown'} />
                            <span className="text-xs text-muted-foreground">
                              {getArabicStatus(vessel.extraInfo?.loadingStatus || 'unknown')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {vessel.currentJob?.gate ? (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {vessel.currentJob.gate.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {vessel.currentJob.gate.number}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{cargoDetails.type}</span>
                            <span className="text-xs text-muted-foreground">
                              {cargoDetails.quantity && `${cargoDetails.quantity.toLocaleString()} ${cargoDetails.unit}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {vessel.ownerName || vessel.operatorName || 'Not assigned'}
                            </span>
                            {vessel.ownerName && vessel.operatorName && vessel.ownerName !== vessel.operatorName && (
                              <span className="text-xs text-muted-foreground">
                                Operator: {vessel.operatorName}
                              </span>
                            )}
                            {vessel.oilSource && (
                              <span className="text-xs text-muted-foreground">
                                Source: {vessel.oilSource}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {vessel.currentJob?.broker ? (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {vessel.currentJob.broker.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {vessel.currentJob.broker.company}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {vessel.currentJob?.unloadingProgress !== undefined ? (
                            <div className="flex flex-col gap-1 w-[100px]">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${
                                    vessel.extraInfo?.colorCode === 'red' ? 'bg-red-500' : 
                                    vessel.extraInfo?.colorCode === 'green' ? 'bg-green-500' : 
                                    'bg-blue-500'
                                  }`}
                                  style={{ width: `${vessel.currentJob.unloadingProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-right">
                                {vessel.currentJob.unloadingProgress}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Link to={`/vessels/${vessel.id}`} className="flex w-full">
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link to={`/vessels/${vessel.id}/documents`} className="flex w-full">
                                  View documents
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Mark as completed</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VesselDashboard;