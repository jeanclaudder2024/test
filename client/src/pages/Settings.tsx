import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Settings as SettingsIcon, Save, Key, Bell, CloudLightning, Database, Globe, Languages, Moon, Sun, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  
  // Handle form submission
  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };
  
  // Handle API key save
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "API Key Updated",
      description: "Your API key has been updated and is now active.",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <div className="bg-primary/10 p-2 rounded-full mr-3">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure application preferences and integrations
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <form onSubmit={handleSaveGeneralSettings}>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Customize the application appearance and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select Time Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="cet">Central European Time (CET)</SelectItem>
                        <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                        <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select defaultValue="light">
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoRefresh">Auto Refresh Data</Label>
                      <div className="text-sm text-muted-foreground">
                        Automatically refresh vessel and refinery data
                      </div>
                    </div>
                    <Switch id="autoRefresh" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="confirmations">Confirmation Dialogs</Label>
                      <div className="text-sm text-muted-foreground">
                        Show confirmation before performing destructive actions
                      </div>
                    </div>
                    <Switch id="confirmations" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Details about your user account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Username:</span>
                    <span className="font-medium">admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <span className="font-medium">Administrator</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Login:</span>
                    <span className="font-medium">Today, 9:42 AM</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </CardFooter>
              </Card>
              
              <Alert>
                <Languages className="h-4 w-4" />
                <AlertTitle>Language Settings</AlertTitle>
                <AlertDescription>
                  Some translations may be incomplete. If you notice any issues, please contact support.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="api">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <form onSubmit={handleSaveApiKey}>
                <CardHeader>
                  <CardTitle>API Integration</CardTitle>
                  <CardDescription>
                    Configure external API connections and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openaiKey">OpenAI API Key</Label>
                    <div className="flex space-x-2">
                      <Input 
                        id="openaiKey" 
                        type="password" 
                        placeholder="sk-..." 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <Button type="submit" disabled={!apiKey}>Save</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Required for AI assistant functionality and document generation
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>API Access Settings</Label>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <div className="font-medium">Enable External API Access</div>
                        <div className="text-sm text-muted-foreground">
                          Allow third-party applications to access this platform's API
                        </div>
                      </div>
                      <Switch id="apiAccess" defaultChecked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <div className="font-medium">Rate Limiting</div>
                        <div className="text-sm text-muted-foreground">
                          Apply rate limits to API requests
                        </div>
                      </div>
                      <Switch id="rateLimiting" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </form>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Status</CardTitle>
                  <CardDescription>
                    Connection status with external services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                      <span>Weather Service</span>
                    </div>
                    <Badge variant="outline">Connected</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div>
                      <span>OpenAI</span>
                    </div>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                      <span>Mapping Service</span>
                    </div>
                    <Badge variant="outline">Connected</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>API Key Required</AlertTitle>
                <AlertDescription>
                  AI features are currently disabled. Please add your OpenAI API key to enable these features.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Email Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Vessel Updates</Label>
                        <div className="text-sm text-muted-foreground">
                          Updates on vessel movements and status changes
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Refinery Reports</Label>
                        <div className="text-sm text-muted-foreground">
                          Weekly summary of refinery activities
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Alerts</Label>
                        <div className="text-sm text-muted-foreground">
                          Critical system notifications and warnings
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">In-App Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Real-time Updates</Label>
                        <div className="text-sm text-muted-foreground">
                          Show notifications for real-time events
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Document Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Alert when new documents are generated
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sound Alerts</Label>
                        <div className="text-sm text-muted-foreground">
                          Play sound for important notifications
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-3">Notification Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailFrequency">Email Digest Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="emailFrequency">
                        <SelectValue placeholder="Select Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quiet-hours">Quiet Hours</Label>
                    <Select defaultValue="none">
                      <SelectTrigger id="quiet-hours">
                        <SelectValue placeholder="Select Hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No quiet hours</SelectItem>
                        <SelectItem value="night">10 PM - 7 AM</SelectItem>
                        <SelectItem value="work">9 AM - 5 PM</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage application data and backups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Database Connections</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure database connections and settings
                      </p>
                    </div>
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Data Backup</h3>
                      <p className="text-sm text-muted-foreground">
                        Create and manage data backups
                      </p>
                    </div>
                    <Button variant="outline">
                      <CloudLightning className="h-4 w-4 mr-2" />
                      Backup Now
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Data Export</h3>
                      <p className="text-sm text-muted-foreground">
                        Export data in various formats
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">CSV</Button>
                      <Button variant="outline" size="sm">JSON</Button>
                      <Button variant="outline" size="sm">PDF</Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Data Retention Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vesselRetention">Vessel History</Label>
                      <Select defaultValue="1year">
                        <SelectTrigger id="vesselRetention">
                          <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3months">3 Months</SelectItem>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="forever">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logsRetention">System Logs</Label>
                      <Select defaultValue="1month">
                        <SelectTrigger id="logsRetention">
                          <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1week">1 Week</SelectItem>
                          <SelectItem value="1month">1 Month</SelectItem>
                          <SelectItem value="3months">3 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Data Settings
                </Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                  <CardDescription>
                    Current data storage utilization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Database Storage</span>
                        <span>35%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        178 MB of 500 MB used
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Document Storage</span>
                        <span>12%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        245 MB of 2 GB used
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Backup Storage</span>
                        <span>68%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        3.4 GB of 5 GB used
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertTitle>Data Privacy</AlertTitle>
                <AlertDescription>
                  Data is stored securely and in compliance with relevant regulations. See our privacy policy for details.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}