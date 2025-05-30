import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  const { language, setLanguage, t } = useLanguage();
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
          <h1 className="text-3xl font-bold">
            {t("settings.title")}
            {language === "en" && <span className="text-primary/70 text-xl mr-2 rtl:mr-0 rtl:ml-2">الإعدادات</span>}
          </h1>
          <p className="text-muted-foreground">
            {language === "en" ? "Configure application preferences and integrations" : "تكوين تفضيلات التطبيق والتكاملات"}
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="general" className="flex items-center justify-center">
            <SettingsIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{language === "en" ? "General" : "عام"}</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center justify-center">
            <Key className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{language === "en" ? "API Integration" : "واجهة API"}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center">
            <Bell className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{language === "en" ? "Notifications" : "الإشعارات"}</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center justify-center">
            <Database className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{language === "en" ? "Data" : "البيانات"}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <form onSubmit={handleSaveGeneralSettings}>
                <CardHeader>
                  <CardTitle>
                    {language === "en" ? (
                      <div className="flex items-center justify-between">
                        <span>General Settings</span>
                        <span className="text-primary/70">الإعدادات العامة</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span>الإعدادات العامة</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {language === "en" ? (
                      <div className="flex justify-between">
                        <span>Customize the application appearance and behavior</span>
                        <span className="text-primary/70">تخصيص مظهر وسلوك التطبيق</span>
                      </div>
                    ) : (
                      <div>تخصيص مظهر وسلوك التطبيق</div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="flex justify-between">
                      <span>{t("settings.language")}</span>
                      <span className={language === "ar" ? "font-semibold" : "text-primary/70"}>
                        {language === "ar" ? "اللغة" : ""}
                      </span>
                    </Label>
                    <div className="py-2">
                      <LanguageSwitcher variant="button" showLabel={false} />
                    </div>
                    <p className="text-sm text-muted-foreground pt-1">
                      {t("settings.language_description")}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="flex justify-between">
                      <span>{t("settings.timezone")}</span>
                      <span className={language === "ar" ? "font-semibold" : "text-primary/70"}>
                        {language === "ar" ? "المنطقة الزمنية" : ""}
                      </span>
                    </Label>
                    <Select defaultValue="utc">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder={language === "en" ? "Select Time Zone" : "اختر المنطقة الزمنية"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">
                          {language === "en" ? "UTC (Coordinated Universal Time)" : "التوقيت العالمي المنسق (UTC)"}
                        </SelectItem>
                        <SelectItem value="est">
                          {language === "en" ? "Eastern Time (EST)" : "التوقيت الشرقي (EST)"}
                        </SelectItem>
                        <SelectItem value="gmt">
                          {language === "en" ? "Greenwich Mean Time (GMT)" : "توقيت غرينتش (GMT)"}
                        </SelectItem>
                        <SelectItem value="ast">
                          {language === "en" ? "Arabia Standard Time (AST)" : "التوقيت العربي (AST)"}
                        </SelectItem>
                        <SelectItem value="cet">
                          {language === "en" ? "Central European Time (CET)" : "توقيت وسط أوروبا (CET)"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground pt-1">
                      {t("settings.timezone_description")}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="flex justify-between">
                      <span>{t("settings.theme")}</span>
                      <span className={language === "ar" ? "font-semibold" : "text-primary/70"}>
                        {language === "ar" ? "السمة" : ""}
                      </span>
                    </Label>
                    <div className="py-2">
                      <ThemeToggle />
                    </div>
                    <p className="text-sm text-muted-foreground pt-1">
                      {t("settings.theme_description")}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoRefresh" className="flex gap-2">
                        <span>Auto Refresh Data</span>
                        <span className="text-primary/70">تحديث البيانات تلقائيًا</span>
                      </Label>
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>Automatically refresh vessel and refinery data</span>
                        <span>تحديث بيانات السفن والمصافي تلقائيًا</span>
                      </div>
                    </div>
                    <Switch id="autoRefresh" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="confirmations" className="flex gap-2">
                        <span>Confirmation Dialogs</span>
                        <span className="text-primary/70">حوارات التأكيد</span>
                      </Label>
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>Show confirmation before performing destructive actions</span>
                        <span>عرض التأكيد قبل تنفيذ الإجراءات الحساسة</span>
                      </div>
                    </div>
                    <Switch id="confirmations" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                    <span className="text-xs opacity-75">حفظ التغييرات</span>
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Account Information</span>
                    <span className="text-primary/70">معلومات الحساب</span>
                  </CardTitle>
                  <CardDescription className="flex justify-between">
                    <span>Details about your user account</span>
                    <span>تفاصيل حسابك</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground flex gap-1">
                      <span>Username:</span>
                      <span className="text-primary/70">اسم المستخدم:</span>
                    </span>
                    <span className="font-medium">admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground flex gap-1">
                      <span>Role:</span>
                      <span className="text-primary/70">الدور:</span>
                    </span>
                    <span className="font-medium">Administrator</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground flex gap-1">
                      <span>Last Login:</span>
                      <span className="text-primary/70">آخر تسجيل دخول:</span>
                    </span>
                    <span className="font-medium">Today, 9:42 AM</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <span>Change Password</span>
                    <span className="text-xs opacity-75">تغيير كلمة المرور</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <Alert>
                <Languages className="h-4 w-4" />
                <AlertTitle className="flex justify-between items-center">
                  <span>Language Settings</span>
                  <span className="text-primary/70">إعدادات اللغة</span>
                </AlertTitle>
                <AlertDescription className="flex flex-col">
                  <span>Some translations may be incomplete. If you notice any issues, please contact support.</span>
                  <span className="text-primary/70 text-sm mt-1">قد تكون بعض الترجمات غير مكتملة. إذا لاحظت أي مشاكل، يرجى الاتصال بالدعم.</span>
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