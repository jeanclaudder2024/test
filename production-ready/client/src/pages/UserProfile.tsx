/**
 * Professional User Profile Page - Oil Vessel Tracking
 * Complete profile management for maritime professionals
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Camera,
  Settings,
  Activity,
  Award,
  Ship,
  FileText
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Form schema for profile updates
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
  isActive: boolean;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      phone: "",
    },
  });

  // Fetch user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        form.reset({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          company: data.user.company || "",
          phone: data.user.phone || "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        setProfile(prev => prev ? { ...prev, ...data } : null);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    form.reset({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      company: profile?.company || "",
      phone: profile?.phone || "",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile not found</h3>
              <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = () => {
    const first = profile.firstName?.[0] || profile.username[0] || 'U';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xl font-bold bg-blue-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.firstName && profile.lastName 
                        ? `${profile.firstName} ${profile.lastName}`
                        : profile.username
                      }
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
                    {profile.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {profile.company}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={profile.emailVerified ? "default" : "secondary"}>
                      {profile.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge variant="outline">
                      <Ship className="h-3 w-3 mr-1" />
                      Maritime Professional
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </div>
                  {profile.lastLogin && (
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      Last active {new Date(profile.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Manage your personal information and maritime trading details
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Your shipping/trading company" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center space-x-4">
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</label>
                          <div className="flex items-center mt-1">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900 dark:text-white">{profile.username}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                          <div className="flex items-center mt-1">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900 dark:text-white">{profile.email}</span>
                            {profile.emailVerified && (
                              <Shield className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                          <div className="flex items-center mt-1">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900 dark:text-white">
                              {profile.phone || "Not provided"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                          <div className="flex items-center mt-1">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900 dark:text-white">
                              {profile.firstName && profile.lastName 
                                ? `${profile.firstName} ${profile.lastName}`
                                : "Not provided"
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</label>
                          <div className="flex items-center mt-1">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900 dark:text-white">
                              {profile.company || "Not provided"}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</label>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900 dark:text-white">
                              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent actions on the maritime trading platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <Ship className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Viewed vessel tracking dashboard</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Generated trading document</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                      <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Updated profile information</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your platform experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive updates about vessel movements and trades
                      </p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Real-time Alerts</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get instant notifications for important events
                      </p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Dark Mode</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Use dark theme for better viewing experience
                      </p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated 30 days ago
                      </p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage devices where you're logged in
                      </p>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}