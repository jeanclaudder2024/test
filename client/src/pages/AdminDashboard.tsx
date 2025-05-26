import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Ship,
  Building,
  Database,
  Settings,
  BarChart3,
  MapPin,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  Activity,
  DollarSign,
  Globe,
  Factory,
  Anchor
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  isSubscribed: boolean;
  subscriptionTier: string;
  createdAt: string;
}

interface Vessel {
  id: number;
  name: string;
  imo: string;
  vesselType: string;
  flag: string;
  status: string;
  lat: number;
  lng: number;
}

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  type: string;
  status: string;
}

interface Company {
  id: number;
  name: string;
  country: string;
  type: string;
  status: string;
}

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  capacity: number;
  status: string;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

  // Fetch all data
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: vessels = [] } = useQuery<Vessel[]>({
    queryKey: ['/api/vessels'],
  });

  const { data: ports = [] } = useQuery<Port[]>({
    queryKey: ['/api/ports'],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  const { data: refineries = [] } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  // Statistics calculations
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isSubscribed).length;
  const totalVessels = vessels.length;
  const activeVessels = vessels.filter(v => v.status === 'active').length;
  const totalPorts = ports.length;
  const totalCompanies = companies.length;
  const totalRefineries = refineries.length;

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => apiRequest(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  // Update user role mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: number; updates: Partial<User> }) =>
      apiRequest(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowUserDialog(false);
    },
  });

  const handleUpdateUser = (updates: Partial<User>) => {
    if (selectedUser) {
      updateUserMutation.mutate({ userId: selectedUser.id, updates });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Complete platform management and control</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {activeUsers} active subscribers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vessels</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVessels}</div>
              <p className="text-xs text-muted-foreground">
                {activeVessels} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ports & Refineries</CardTitle>
              <Anchor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPorts + totalRefineries}</div>
              <p className="text-xs text-muted-foreground">
                {totalPorts} ports, {totalRefineries} refineries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                Registered entities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vessels">Vessels</TabsTrigger>
            <TabsTrigger value="ports">Ports</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New user registered</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vessel status updated</span>
                      <span className="text-xs text-muted-foreground">4 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New company added</span>
                      <span className="text-xs text-muted-foreground">1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Platform Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Database Health</span>
                      <Badge variant="default">Excellent</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>System Load</span>
                      <Badge variant="secondary">Normal</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>API Response Time</span>
                      <Badge variant="default">Fast</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Management
                  </span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role || 'User'}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.isSubscribed ? (
                            <Badge variant="default">{user.subscriptionTier}</Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vessels Tab */}
          <TabsContent value="vessels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Ship className="h-5 w-5 mr-2" />
                    Vessel Management
                  </span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vessel
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>IMO</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Flag</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vessels.slice(0, 10).map((vessel) => (
                      <TableRow key={vessel.id}>
                        <TableCell className="font-medium">{vessel.name}</TableCell>
                        <TableCell>{vessel.imo}</TableCell>
                        <TableCell>{vessel.vesselType}</TableCell>
                        <TableCell>{vessel.flag}</TableCell>
                        <TableCell>{getStatusBadge(vessel.status)}</TableCell>
                        <TableCell>
                          {vessel.lat?.toFixed(2)}, {vessel.lng?.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ports Tab */}
          <TabsContent value="ports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Anchor className="h-5 w-5 mr-2" />
                    Port Management
                  </span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Port
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ports.slice(0, 10).map((port) => (
                      <TableRow key={port.id}>
                        <TableCell className="font-medium">{port.name}</TableCell>
                        <TableCell>{port.country}</TableCell>
                        <TableCell>{port.region}</TableCell>
                        <TableCell>{port.type}</TableCell>
                        <TableCell>{getStatusBadge(port.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Company Management
                  </span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.slice(0, 10).map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.country}</TableCell>
                        <TableCell>{company.type}</TableCell>
                        <TableCell>{getStatusBadge(company.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Database Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Backup Database
                  </Button>
                  <Button variant="outline" className="w-full">
                    Restore Database
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Database Stats
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Platform Configuration
                  </Button>
                  <Button variant="outline" className="w-full">
                    API Settings
                  </Button>
                  <Button variant="outline" className="w-full">
                    Security Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Edit Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    defaultValue={selectedUser.username}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={selectedUser.email}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue={selectedUser.role || 'user'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateUser({ role: 'admin' })}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}