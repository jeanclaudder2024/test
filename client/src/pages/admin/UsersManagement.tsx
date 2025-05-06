import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, MoreHorizontal, Edit, Mail, Eye, RotateCw, UserPlus, Lock, Ban, Download } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Simulate backend data
type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  subscriptionTier: string;
  lastLogin?: string;
  createdAt: string;
}

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState<User | null>(null);
  
  // Simulated API call with query params
  const usersQuery = useQuery({
    queryKey: ['/api/admin/users', searchQuery, currentPage, selectedRole, selectedStatus],
    // Replace with actual API call when ready
    queryFn: async () => {
      // For now, return mock data
      return {
        users: mockUsers,
        totalCount: mockUsers.length,
        totalPages: Math.ceil(mockUsers.length / 10)
      };
    }
  });

  const users = usersQuery.data?.users || [];
  const totalPages = usersQuery.data?.totalPages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit search - will automatically trigger re-query based on searchQuery state
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role === "all" ? null : role);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status === "all" ? null : status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleEditUser = (user: User) => {
    setCurrentEditUser(user);
    setIsEditUserOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge variant="outline">Free</Badge>;
      case 'basic':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Basic</Badge>;
      case 'pro':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  return (
    <AdminLayout
      title="User Management"
      description="View and manage all users in the system"
      actions={
        <Button onClick={() => setIsAddUserOpen(true)} className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      }
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {usersQuery.isLoading 
                  ? "Loading users..." 
                  : `Total ${users.length} users in the system`}
              </CardDescription>
            </div>
            
            <div className="flex gap-2 items-center">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="w-[200px] sm:w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleRoleFilter("all")}>
                    All Roles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleFilter("admin")}>
                    Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleFilter("user")}>
                    User
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter("inactive")}>
                    Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilter("suspended")}>
                    Suspended
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-3.5 w-3.5" />
                Export
              </Button>
              
              {selectedUsers.length > 0 && (
                <Button variant="outline" size="sm" className="h-9">
                  {selectedUsers.length} Selected
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onCheckedChange={handleSelectAllUsers}
                      aria-label="Select all users"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <RotateCw className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                          aria-label={`Select user ${user.username}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.username}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        {getSubscriptionBadge(user.subscriptionTier)}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Email user
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Lock className="mr-2 h-4 w-4" />
                              Reset password
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. They'll receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="First name" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Last name" />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Email address" type="email" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Username" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account information.
            </DialogDescription>
          </DialogHeader>
          {currentEditUser && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="edit-username">Username</Label>
                <Input 
                  id="edit-username" 
                  defaultValue={currentEditUser.username} 
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  defaultValue={currentEditUser.email} 
                  type="email" 
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="edit-role">Role</Label>
                <Select defaultValue={currentEditUser.role}>
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={currentEditUser.status}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="edit-subscription">Subscription</Label>
                <Select defaultValue={currentEditUser.subscriptionTier}>
                  <SelectTrigger id="edit-subscription">
                    <SelectValue placeholder="Select a subscription" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Mock data for development
const mockUsers: User[] = [
  {
    id: 1,
    username: "johndoe",
    email: "john.doe@example.com",
    role: "admin",
    status: "active",
    subscriptionTier: "enterprise",
    lastLogin: "2023-05-02T14:30:00Z",
    createdAt: "2022-01-15T10:00:00Z"
  },
  {
    id: 2,
    username: "janesmith",
    email: "jane.smith@example.com",
    role: "user",
    status: "active",
    subscriptionTier: "pro",
    lastLogin: "2023-05-01T09:15:00Z",
    createdAt: "2022-02-08T11:30:00Z"
  },
  {
    id: 3,
    username: "markwilson",
    email: "mark.wilson@example.com",
    role: "user",
    status: "inactive",
    subscriptionTier: "basic",
    lastLogin: "2023-04-15T16:20:00Z",
    createdAt: "2022-03-12T08:45:00Z"
  },
  {
    id: 4,
    username: "sarahlee",
    email: "sarah.lee@example.com",
    role: "user",
    status: "active",
    subscriptionTier: "pro",
    lastLogin: "2023-05-03T11:10:00Z",
    createdAt: "2022-04-05T13:20:00Z"
  },
  {
    id: 5,
    username: "michaelbrown",
    email: "michael.brown@example.com",
    role: "user",
    status: "suspended",
    subscriptionTier: "free",
    lastLogin: "2023-03-20T08:30:00Z",
    createdAt: "2022-05-18T09:00:00Z"
  },
  {
    id: 6,
    username: "emilyjones",
    email: "emily.jones@example.com",
    role: "user",
    status: "active",
    subscriptionTier: "basic",
    lastLogin: "2023-05-02T15:45:00Z",
    createdAt: "2022-06-22T14:10:00Z"
  },
  {
    id: 7,
    username: "davidmiller",
    email: "david.miller@example.com",
    role: "admin",
    status: "active",
    subscriptionTier: "enterprise",
    lastLogin: "2023-05-03T10:00:00Z",
    createdAt: "2022-07-10T16:30:00Z"
  },
  {
    id: 8,
    username: "amandawhite",
    email: "amanda.white@example.com",
    role: "user",
    status: "active",
    subscriptionTier: "pro",
    lastLogin: "2023-05-01T13:20:00Z",
    createdAt: "2022-08-15T10:45:00Z"
  }
];