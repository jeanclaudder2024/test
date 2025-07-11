import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Globe, 
  Edit3, 
  Save, 
  CheckCircle,
  Crown,
  Settings,
  Bell,
  Shield,
  Calendar,
  Award,
  Star,
  ExternalLink,
  Camera
} from 'lucide-react';

interface ProfileData {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  country?: string;
  timezone?: string;
  bio?: string;
  website?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  avatarUrl?: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
  smsNotifications: boolean;
  profileCompleteness: number;
  onboardingCompleted: boolean;
  role: string;
  createdAt: string;
}

const countries = [
  "United States", "United Kingdom", "Canada", "Germany", "France", "Italy", "Spain", 
  "Netherlands", "Norway", "Denmark", "Sweden", "Finland", "Japan", "South Korea", 
  "China", "Singapore", "Hong Kong", "Australia", "New Zealand", "Brazil", "Mexico",
  "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Oman", "Egypt", "Nigeria", "South Africa"
];

const timezones = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00", "UTC-07:00",
  "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:00", "UTC-02:00", "UTC-01:00",
  "UTC+00:00", "UTC+01:00", "UTC+02:00", "UTC+03:00", "UTC+04:00", "UTC+05:00",
  "UTC+06:00", "UTC+07:00", "UTC+08:00", "UTC+09:00", "UTC+10:00", "UTC+11:00", "UTC+12:00"
];

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  
  console.log('UserProfile component rendering, user:', user);

  // Fetch user profile
  const { data: profile, isLoading, refetch } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    staleTime: 0,
  });

  // Fetch profile completeness
  const { data: completenessData } = useQuery({
    queryKey: ['/api/profile/completeness'],
    staleTime: 30000,
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileData>) => {
      const response = await apiRequest('PUT', '/api/profile', data);
      return response.json();
    },
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/completeness'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancelEdit = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'broker': return <Award className="h-5 w-5 text-blue-500" />;
      default: return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-96 text-center">
          <CardContent className="p-6">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600">Unable to load your profile information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-white/90 border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={profile.avatarUrl} alt={profile.firstName} />
                      <AvatarFallback className="bg-blue-500 text-white text-xl">
                        {getInitials(profile.firstName, profile.lastName, profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {profile.firstName && profile.lastName 
                        ? `${profile.firstName} ${profile.lastName}` 
                        : profile.username || profile.email}
                    </h1>
                    <p className="text-blue-100 text-lg mb-2">{profile.email}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(profile.role)}
                        <span className="capitalize font-medium">{profile.role}</span>
                      </div>
                      {profile.company && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>{profile.company}</span>
                        </div>
                      )}
                      {profile.country && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.country}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <p className="text-blue-100 text-sm mb-1">Profile Completion</p>
                    <div className="flex items-center space-x-3">
                      <Progress 
                        value={completenessData?.completeness || profile.profileCompleteness || 0} 
                        className="w-32 h-3 bg-blue-400"
                      />
                      <span className={`font-bold text-lg ${getCompletionColor(completenessData?.completeness || profile.profileCompleteness || 0)}`}>
                        {completenessData?.completeness || profile.profileCompleteness || 0}%
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    <Calendar className="h-3 w-3 mr-1" />
                    Member since {formatDate(profile.createdAt)}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white/90 border border-gray-200 shadow-sm">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <User className="h-4 w-4 mr-2" />
              Profile Details
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Star className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Profile Details Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/90 border-gray-200 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details and contact information</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={updateProfileMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle || ''}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={formData.country || ''} 
                      onValueChange={(value) => handleInputChange('country', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={formData.timezone || ''} 
                      onValueChange={(value) => handleInputChange('timezone', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="https://your-website.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl || ''}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitterHandle">Twitter Handle</Label>
                    <Input
                      id="twitterHandle"
                      value={formData.twitterHandle || ''}
                      onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="@yourusername"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-white/90 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive updates and communications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive important updates via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={formData.emailNotifications || false}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails" className="text-base font-medium">Marketing Emails</Label>
                      <p className="text-sm text-gray-600">Receive news, updates, and promotional content</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={formData.marketingEmails || false}
                      onCheckedChange={(checked) => handleInputChange('marketingEmails', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyReports" className="text-base font-medium">Weekly Reports</Label>
                      <p className="text-sm text-gray-600">Get weekly summaries of your activity</p>
                    </div>
                    <Switch
                      id="weeklyReports"
                      checked={formData.weeklyReports || false}
                      onCheckedChange={(checked) => handleInputChange('weeklyReports', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications" className="text-base font-medium">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={formData.smsNotifications || false}
                      onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={updateProfileMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/90 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Email Verified</p>
                        <p className="text-sm text-green-600">Your email address has been verified</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Password</Label>
                        <p className="text-sm text-gray-600">Last changed: {formatDate(profile.createdAt)}</p>
                      </div>
                      <Button variant="outline">
                        Change Password
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/90 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
                <CardDescription>Review your recent account activity and statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{profile.profileCompleteness}%</p>
                    <p className="text-sm text-gray-600">Profile Complete</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-gray-600">Days Active</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 capitalize">{profile.role}</p>
                    <p className="text-sm text-gray-600">Account Type</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Profile created</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(profile.createdAt)}</span>
                    </div>
                    {profile.onboardingCompleted && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Onboarding completed</span>
                        </div>
                        <span className="text-xs text-gray-500">Recently</span>
                      </div>
                    )}
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