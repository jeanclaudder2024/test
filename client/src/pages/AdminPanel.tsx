import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemStats } from "@/components/admin/SystemStats";
import { FixedDataManagement } from "@/components/admin/FixedDataManagement";


import { PortManagement } from "@/components/admin/PortManagement";

import VesselManagement from "@/components/admin/VesselManagement";

import { Settings } from "@/components/admin/AdminSettings";
import { DatabaseMigration } from "@/components/admin/DatabaseMigration";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Database, Users, Settings as SettingsIcon, ChevronLeft, Factory, Anchor, Ship, CreditCard, HardDrive, Globe, Building2, BarChart3, Activity, Droplets, FileText } from "lucide-react";

import { useLocation } from "wouter";
import SubscriptionAdmin from "@/pages/SubscriptionAdmin";
import ProfessionalRefineryManagement from "@/components/admin/ProfessionalRefineryManagement";
import { CompanyManagement } from "@/components/admin/CompanyManagement";


import { BrokerManagement } from "@/components/admin/BrokerManagement";
import DocumentManagement from "@/components/admin/DocumentManagement";
import SimpleOilTypeManagement from "@/components/admin/SimpleOilTypeManagement";
import LandingPageManager from "@/components/admin/LandingPageManager";

export default function AdminPanel() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch system stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="hover:bg-blue-50 text-slate-600 hover:text-blue-700"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-slate-800 bg-clip-text text-transparent">
                  Admin Control Panel
                </h1>
                <p className="text-sm text-slate-600">
                  Manage your oil trading platform
                </p>
              </div>
            </div>
            {stats && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {(stats as any)?.totalUsers || 0} Users
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <Ship className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {(stats as any)?.totalVessels || 0} Vessels
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="overview">📊 System Overview</option>
              <option value="users">👥 User Management</option>
              <option value="subscriptions">💳 Subscriptions</option>
              <option value="companies">🏢 Company Management</option>
              <option value="vessels">🚢 Vessel Management</option>
              <option value="ports">⚓ Ports Management</option>
              <option value="refineries">🏭 Refinery Management</option>
              <option value="documents">📄 Professional Articles</option>
              <option value="brokers">🤝 Broker Management</option>
              <option value="oil-types">⛽ Oil Types</option>
              <option value="filters">🔧 Filter Management</option>
              <option value="data">💾 Data Management</option>
              <option value="migration">🔄 Database Migration</option>
              <option value="landing">🌐 Landing Page</option>
              <option value="settings">⚙️ Settings</option>
            </select>
          </div>

          {/* Desktop Tab Navigation */}
          <TabsList className="hidden lg:grid lg:grid-cols-12 w-full bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-md border border-slate-200/60 p-1.5 rounded-xl shadow-lg">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-blue-50 rounded-lg"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">System Overview</span>
              <span className="xl:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-blue-50 rounded-lg"
            >
              <Users className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Users</span>
              <span className="xl:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="subscriptions" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-green-50 rounded-lg"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Billing</span>
              <span className="xl:hidden">Bills</span>
            </TabsTrigger>
            <TabsTrigger 
              value="companies" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-purple-50 rounded-lg"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Companies</span>
              <span className="xl:hidden">Cos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="vessels" 
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-cyan-50 rounded-lg"
            >
              <Ship className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Vessels</span>
              <span className="xl:hidden">Ships</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ports" 
              className="flex items-center gap-2 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-teal-50 rounded-lg"
            >
              <Anchor className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Ports</span>
              <span className="xl:hidden">Ports</span>
            </TabsTrigger>

            <TabsTrigger 
              value="refineries" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-amber-50 rounded-lg"
            >
              <Factory className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Refineries</span>
              <span className="xl:hidden">Plants</span>
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-indigo-50 rounded-lg"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Documents</span>
              <span className="xl:hidden">Docs</span>
            </TabsTrigger>



            <TabsTrigger 
              value="brokers" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-purple-50 rounded-lg"
            >
              <Users className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Brokers</span>
              <span className="xl:hidden">Brokers</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="oil-types" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-amber-50 rounded-lg"
            >
              <Droplets className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Oil Types</span>
              <span className="xl:hidden">Oil</span>
            </TabsTrigger>
            


            <TabsTrigger 
              value="data" 
              className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-indigo-50 rounded-lg"
            >
              <Database className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Data</span>
              <span className="xl:hidden">Data</span>
            </TabsTrigger>
            <TabsTrigger 
              value="migration" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-gray-50 rounded-lg"
            >
              <HardDrive className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Migration</span>
              <span className="xl:hidden">Migrate</span>
            </TabsTrigger>
            <TabsTrigger 
              value="landing-page" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-purple-50 rounded-lg"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Landing Page</span>
              <span className="xl:hidden">Landing</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-slate-50 rounded-lg"
            >
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Settings</span>
              <span className="xl:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{(stats as any)?.totalUsers || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-100 text-sm font-medium">Total Vessels</p>
                      <p className="text-3xl font-bold">{(stats as any)?.totalVessels || 0}</p>
                    </div>
                    <Ship className="h-8 w-8 text-cyan-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Refineries</p>
                      <p className="text-3xl font-bold">{(stats as any)?.totalRefineries || 0}</p>
                    </div>
                    <Factory className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">System Status</p>
                      <p className="text-3xl font-bold">Online</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Detailed Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  System Overview
                </CardTitle>
                <CardDescription className="text-slate-600">
                  View detailed statistics and system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemStats loading={statsLoading} stats={stats} />
              </CardContent>
            </Card>
            
            {/* Quick Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => navigate("/admin/landing-page")}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Landing Page Content</h3>
                      <p className="text-sm text-slate-600">Manage all landing page content, images, and sections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              

              
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => navigate("/admin/subscriptions")}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Subscription Management</h3>
                      <p className="text-sm text-slate-600">Manage user subscriptions and billing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

        <TabsContent value="companies" className="space-y-4">
          <CompanyManagement />
        </TabsContent>

        <TabsContent value="vessels" className="space-y-4">
          <VesselManagement />
        </TabsContent>

        <TabsContent value="ports" className="space-y-4">
          <PortManagement />
        </TabsContent>

        <TabsContent value="refineries" className="space-y-4">
          <ProfessionalRefineryManagement />
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

        <TabsContent value="migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Migration to MySQL</CardTitle>
              <CardDescription>
                Migrate all 18 tables and authentic data from PostgreSQL to MySQL backup database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatabaseMigration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentManagement />
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <DatabaseMigration />
        </TabsContent>

        <TabsContent value="brokers" className="space-y-4">
          <BrokerManagement />
        </TabsContent>

        <TabsContent value="oil-types" className="space-y-4">
          <SimpleOilTypeManagement />
        </TabsContent>



        <TabsContent value="landing-page" className="space-y-4">
          <LandingPageManager />
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
              <div className="text-center py-8 text-slate-500">
                System settings configuration coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}