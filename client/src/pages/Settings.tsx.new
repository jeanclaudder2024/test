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
  AlertTitle 
} from "@/components/ui/alert";
import { 
  SettingsIcon, Bell, Database, AlertCircle, Globe, Save, Languages
} from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  
  // Handle form submission
  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
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
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
          <TabsTrigger value="general" className="flex items-center justify-center">
            <SettingsIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{language === "en" ? "General" : "عام"}</span>
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
        
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Notification Settings</span>
                  <span className="text-primary/70">إعدادات الإشعارات</span>
                </CardTitle>
                <CardDescription className="flex justify-between">
                  <span>Configure how and when you receive notifications</span>
                  <span className="text-primary/70">تكوين كيفية ووقت تلقي الإشعارات</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Vessel Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notification preferences for vessel position and status updates
                      </p>
                    </div>
                    <Select defaultValue="realtime">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Critical system notifications and security alerts
                      </p>
                    </div>
                    <Switch id="systemAlerts" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Updates about new features and product announcements
                      </p>
                    </div>
                    <Switch id="marketingAlerts" />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch id="emailAlerts" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Save Notification Preferences</Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Center</CardTitle>
                  <CardDescription>Recent activity and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border rounded-lg p-3 bg-muted/50 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">System Update</span>
                      <span className="text-sm text-muted-foreground">Today</span>
                    </div>
                    <p className="text-sm">
                      The system has been updated to version 2.3.0 with new features.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-muted/50 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Vessel Alert</span>
                      <span className="text-sm text-muted-foreground">Yesterday</span>
                    </div>
                    <p className="text-sm">
                      Arctic Aurora has reached its destination port ahead of schedule.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-muted/50 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Maintenance Notice</span>
                      <span className="text-sm text-muted-foreground">3 days ago</span>
                    </div>
                    <p className="text-sm">
                      Scheduled maintenance will occur on April 30th from 2-4 AM UTC.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Notifications</Button>
                </CardFooter>
              </Card>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Do Not Disturb</AlertTitle>
                <AlertDescription>
                  Enable Do Not Disturb mode to temporarily pause all notifications for a specified period.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="data">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Control data storage, caching, and export options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Cache Settings</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="localCache">Local Data Cache</Label>
                      <p className="text-sm text-muted-foreground">
                        Store vessel and refinery data locally for faster access
                      </p>
                    </div>
                    <Switch id="localCache" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="cacheExpiry">Cache Expiry</Label>
                      <p className="text-sm text-muted-foreground">
                        How long to keep cached data before refreshing
                      </p>
                    </div>
                    <Select defaultValue="1h">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15m">15 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="6h">6 hours</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Data Export</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <Globe className="mr-2 h-4 w-4" />
                      Export Vessel Data
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      Export Refinery Data
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Export User Activity
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Bell className="mr-2 h-4 w-4" />
                      Export System Logs
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Data will be exported in CSV format and may take a few minutes to generate
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Privacy Settings</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="anonymousData">Anonymous Usage Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Send anonymous usage statistics to help improve the application
                      </p>
                    </div>
                    <Switch id="anonymousData" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="crashReports">Automatic Crash Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically send error reports when the application crashes
                      </p>
                    </div>
                    <Switch id="crashReports" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button variant="destructive" className="sm:flex-1">
                    Clear All Cached Data
                  </Button>
                  <Button className="sm:flex-1">
                    Save Data Settings
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                  <CardDescription>
                    Browser storage utilization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Local Storage</span>
                      <span className="font-medium">8.2 MB / 10 MB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "82%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      82% of available local storage used
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Session Storage</span>
                      <span className="font-medium">1.4 MB / 5 MB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "28%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      28% of available session storage used
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>IndexedDB</span>
                      <span className="font-medium">24.6 MB / 50 MB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "49%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      49% of available IndexedDB storage used
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Data Deletion Warning</AlertTitle>
                <AlertDescription>
                  Clearing cached data will remove all locally stored information and may affect application performance.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}