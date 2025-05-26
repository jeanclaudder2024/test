import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  HardDrive, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Download,
  Upload,
  Server
} from "lucide-react";

interface MigrationProgress {
  table: string;
  status: 'pending' | 'migrating' | 'completed' | 'error';
  recordCount?: number;
  error?: string;
}

export function DatabaseMigration() {
  const { toast } = useToast();
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');

  // Tables to migrate with your authentic data counts
  const tables = [
    { name: 'vessels', description: '2,500 authentic oil tankers', icon: '🚢' },
    { name: 'refineries', description: '111 global refineries', icon: '🏭' },
    { name: 'ports', description: '29 oil terminals', icon: '⚓' },
    { name: 'documents', description: '172 vessel documents', icon: '📄' },
    { name: 'companies', description: '40 oil shipping companies', icon: '🏢' },
    { name: 'vessel_jobs', description: '50 maritime jobs', icon: '💼' },
    { name: 'vessel_refinery_connections', description: 'Active connections', icon: '🔗' },
    { name: 'users', description: 'User accounts', icon: '👥' },
    { name: 'subscriptions', description: 'Subscription data', icon: '💳' },
    { name: 'subscription_plans', description: 'Pricing plans', icon: '📊' },
    { name: 'payment_methods', description: 'Payment info', icon: '💰' },
    { name: 'brokers', description: 'Broker data', icon: '🤝' },
    { name: 'vessel_extra_info', description: 'Extended vessel data', icon: '📋' },
    { name: 'refinery_port_connections', description: 'Port connections', icon: '🌐' },
    { name: 'progress_events', description: 'Event tracking', icon: '📈' },
    { name: 'invoices', description: 'Invoice records', icon: '🧾' },
    { name: 'gates', description: 'Gate management', icon: '🚪' },
    { name: 'stats', description: 'System statistics', icon: '📊' }
  ];

  const migrateMutation = useMutation({
    mutationFn: async () => {
      setMigrationStatus('running');
      setMigrationProgress(tables.map(table => ({ 
        table: table.name, 
        status: 'pending' 
      })));
      
      const response = await apiRequest('/api/admin/migrate-to-mysql', {
        method: 'POST'
      });
      return response;
    },
    onSuccess: (data) => {
      setMigrationStatus('completed');
      setOverallProgress(100);
      toast({
        title: "Migration Completed Successfully!",
        description: `All ${tables.length} tables with authentic data migrated to MySQL backup.`,
      });
    },
    onError: (error: any) => {
      setMigrationStatus('error');
      toast({
        title: "Migration Failed",
        description: error.message || "Failed to migrate database to MySQL",
        variant: "destructive",
      });
    },
  });

  const downloadExportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/admin/download-mysql-export', {
        method: 'GET'
      });
      return response;
    },
    onSuccess: (data) => {
      // Create download link for the SQL export file
      const blob = new Blob([data.sqlContent], { type: 'text/sql' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'complete_database_export.sql';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Downloaded!",
        description: "Complete database export file downloaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download export file",
        variant: "destructive",
      });
    },
  });

  const handleStartMigration = () => {
    migrateMutation.mutate();
  };

  const handleDownloadExport = () => {
    downloadExportMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'migrating':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'migrating':
        return <Badge variant="default" className="bg-blue-500">Migrating</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migration Overview
          </CardTitle>
          <CardDescription>
            Migrate all authentic data from PostgreSQL to MySQL backup database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">18</div>
              <div className="text-sm text-gray-600">Total Tables</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Server className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">2,500+</div>
              <div className="text-sm text-gray-600">Vessels</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <HardDrive className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">MySQL</div>
              <div className="text-sm text-gray-600">Backup Ready</div>
            </div>
          </div>

          {migrationStatus === 'running' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Migration Progress</span>
                <span className="text-sm text-gray-500">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleStartMigration}
              disabled={migrateMutation.isPending || migrationStatus === 'running'}
              className="flex items-center gap-2"
            >
              {migrateMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Start Migration
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleDownloadExport}
              disabled={downloadExportMutation.isPending}
              className="flex items-center gap-2"
            >
              {downloadExportMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download SQL Export
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migration Status */}
      {migrationStatus !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Status</CardTitle>
            <CardDescription>
              Real-time progress of database migration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {migrationStatus === 'completed' && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  🎉 All {tables.length} tables successfully migrated to MySQL! Your authentic data is now safely backed up.
                </AlertDescription>
              </Alert>
            )}

            {migrationStatus === 'error' && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Migration failed. Please check your MySQL connection settings and try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {migrationProgress.map((progress, index) => (
                <div key={progress.table} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(progress.status)}
                    <div>
                      <div className="font-medium">{progress.table}</div>
                      {progress.recordCount && (
                        <div className="text-sm text-gray-500">{progress.recordCount} records</div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(progress.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tables to Migrate</CardTitle>
          <CardDescription>
            All 18 tables containing your authentic oil vessel tracking data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div key={table.name} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <span className="text-2xl">{table.icon}</span>
                <div>
                  <div className="font-medium">{table.name}</div>
                  <div className="text-sm text-gray-500">{table.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MySQL Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle>MySQL Backup Database</CardTitle>
          <CardDescription>
            Target database for your authentic data migration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Database</Badge>
              <span className="font-mono">u150634185_oiltrak</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">User</Badge>
              <span className="font-mono">u150634185_A99wL</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Status</Badge>
              <span className="text-green-600 font-medium">Ready for Migration</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}