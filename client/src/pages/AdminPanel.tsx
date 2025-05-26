import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemStats } from "@/components/admin/SystemStats";
import { FixedDataManagement } from "@/components/admin/FixedDataManagement";
import { AdminProtection } from "@/components/security/AdminProtection";

import { RefineryManagement } from "@/components/admin/RefineryManagement";
import { PortManagement } from "@/components/admin/PortManagement";
import { VesselManagementNew } from "@/components/admin/VesselManagementNew";
import { Settings } from "@/components/admin/AdminSettings";
import { Button } from "@/components/ui/button";
import { Shield, Database, Users, Settings as SettingsIcon, ChevronLeft, Factory, Anchor, Ship, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import SubscriptionAdmin from "@/pages/SubscriptionAdmin";

function AdminPanelContent() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch system stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="mb-2"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          <p className="text-muted-foreground">
            Manage users, view system statistics, and control platform settings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-8 w-full max-w-6xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">System Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">User Management</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Subscriptions</span>
            <span className="sm:hidden">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="vessels" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            <span className="hidden sm:inline">Vessel Management</span>
            <span className="sm:hidden">Vessels</span>
          </TabsTrigger>
          <TabsTrigger value="ports" className="flex items-center gap-2">
            <Anchor className="h-4 w-4" />
            <span className="hidden sm:inline">Port Management</span>
            <span className="sm:hidden">Ports</span>
          </TabsTrigger>
          <TabsTrigger value="refineries" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            <span className="hidden sm:inline">Refinery Management</span>
            <span className="sm:hidden">Refineries</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data Management</span>
            <span className="sm:hidden">Data</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                View key statistics and system performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemStats loading={statsLoading} stats={stats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionAdmin />
        </TabsContent>
        
        <TabsContent value="vessels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vessel Management</CardTitle>
              <CardDescription>
                Complete CRUD operations for vessel fleet management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VesselManagementNew />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Port Management</CardTitle>
              <CardDescription>
                Add, edit, and manage global ports with interactive map positioning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refineries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refinery Management</CardTitle>
              <CardDescription>
                Add, edit, and manage global refineries with interactive map positioning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RefineryManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage ports, refineries and system data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FixedDataManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system settings and API integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Settings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// تطبيق نظام الحماية على صفحة الإدارة
export default function AdminPanel() {
  return (
    <AdminProtection>
      <AdminPanelContent />
    </AdminProtection>
  );
}