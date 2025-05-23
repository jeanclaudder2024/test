import React, { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Globe,
  Shield,
  Bell,
  Database,
  Key,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Save,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Paintbrush,
  Mail,
  Ship,
  Download
} from "lucide-react";

export function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
  
  // Application settings state
  const [settings, setSettings] = useState({
    general: {
      siteName: "PetroDealHub",
      siteDescription: "Advanced Maritime Oil Brokerage Platform",
      adminEmail: "admin@example.com",
      supportEmail: "support@example.com",
      defaultLanguage: "en",
      defaultTimezone: "UTC",
      theme: "light"
    },
    api: {
      shipTrackingApiKey: "********",
      shipTrackingEnabled: true,
      mapApiKey: "********",
      mapApiEnabled: true,
      openAIApiKey: "********",
      openAIEnabled: true,
      maxApiCallsPerMinute: 60,
      apiTimeout: 30
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumber: true,
      passwordRequireSymbol: true,
      sessionTimeout: 60,
      allowUserRegistration: true,
      requireEmailVerification: true,
      twoFactorAuthenticationEnabled: false,
      loginAttempts: 5,
      loginLockoutMinutes: 15
    },
    notifications: {
      emailNotificationsEnabled: true,
      adminAlertEmailEnabled: true,
      vesselUpdateNotifications: true,
      userRegistrationNotifications: true,
      documentGenerationNotifications: true,
      systemAlertEmails: [
        "admin@example.com",
        "alerts@example.com"
      ]
    },
    customization: {
      primaryColor: "#F97316",
      accentColor: "#EA580C",
      logoUrl: "/assets/petrodealhub-logo.png",
      faviconUrl: "/favicon.ico",
      customCss: "",
      customJavaScript: ""
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: "The system is currently undergoing scheduled maintenance. Please check back later.",
      allowAdminAccess: true,
      scheduledMaintenance: null,
      autoBackupEnabled: true,
      backupFrequency: "daily",
      autoUpdateEnabled: true
    }
  });

  const handleSaveSettings = () => {
    // This would be an API call to save settings in a real app
    console.log("Saving settings:", settings);
    
    // Show success message
    setSaveStatus('success');
    
    // Clear the message after a few seconds
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const handleInputChange = (section, key, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    });
  };

  const handleSwitchChange = (section, key) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: !settings[section][key]
      }
    });
  };

  const renderTextField = (section, key, label, placeholder = "", description = "", type = "text") => (
    <div className="grid gap-2 mb-4">
      <Label htmlFor={`${section}-${key}`}>{label}</Label>
      <Input
        id={`${section}-${key}`}
        type={type}
        placeholder={placeholder}
        value={settings[section][key]}
        onChange={(e) => handleInputChange(section, key, e.target.value)}
      />
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );

  const renderSwitch = (section, key, label, description = "") => (
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-0.5">
        <Label htmlFor={`${section}-${key}`}>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch
        id={`${section}-${key}`}
        checked={settings[section][key]}
        onCheckedChange={() => handleSwitchChange(section, key)}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2 text-xs sm:text-sm">
            <SettingsIcon className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2 text-xs sm:text-sm">
            <Key className="h-4 w-4" />
            <span>API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-xs sm:text-sm">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs sm:text-sm">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="customization" className="flex items-center gap-2 text-xs sm:text-sm">
            <Paintbrush className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2 text-xs sm:text-sm">
            <Database className="h-4 w-4" />
            <span>Maintenance</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderTextField("general", "siteName", "Platform Name", "Enter site name", "The name displayed in the browser title and throughout the application")}
              {renderTextField("general", "siteDescription", "Platform Description", "Enter site description", "Short description of your platform")}
              
              <div className="grid gap-4 md:grid-cols-2">
                {renderTextField("general", "adminEmail", "Admin Email", "admin@example.com", "Primary administrator email address", "email")}
                {renderTextField("general", "supportEmail", "Support Email", "support@example.com", "Email address for user support inquiries", "email")}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <select 
                    id="defaultLanguage"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={settings.general.defaultLanguage}
                    onChange={(e) => handleInputChange("general", "defaultLanguage", e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="defaultTimezone">Default Timezone</Label>
                  <select 
                    id="defaultTimezone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={settings.general.defaultTimezone}
                    onChange={(e) => handleInputChange("general", "defaultTimezone", e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Default Theme</Label>
                <div className="flex space-x-2">
                  <Button 
                    variant={settings.general.theme === "light" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleInputChange("general", "theme", "light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button 
                    variant={settings.general.theme === "dark" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleInputChange("general", "theme", "dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button 
                    variant={settings.general.theme === "system" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleInputChange("general", "theme", "system")}
                    className="flex items-center gap-2"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configurations</CardTitle>
              <CardDescription>Manage external API integrations and keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="ship-tracking">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-blue-500" />
                      <span>Ship Tracking API</span>
                      {settings.api.shipTrackingEnabled ? (
                        <Badge className="ml-2 bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge className="ml-2 bg-red-100 text-red-800" variant="outline">Disabled</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {renderTextField("api", "shipTrackingApiKey", "Ship Tracking API Key", "Enter API key", "API key for vessel tracking services", "password")}
                      {renderSwitch("api", "shipTrackingEnabled", "Enable Ship Tracking Integration", "When disabled, the system will use fallback data")}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="map-api">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-500" />
                      <span>Map API</span>
                      {settings.api.mapApiEnabled ? (
                        <Badge className="ml-2 bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge className="ml-2 bg-red-100 text-red-800" variant="outline">Disabled</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {renderTextField("api", "mapApiKey", "Map API Key", "Enter API key", "API key for map services", "password")}
                      {renderSwitch("api", "mapApiEnabled", "Enable Map API Integration", "When disabled, the system will use a basic map implementation")}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="openai-api">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-purple-500" />
                      <span>OpenAI API</span>
                      {settings.api.openAIEnabled ? (
                        <Badge className="ml-2 bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge className="ml-2 bg-red-100 text-red-800" variant="outline">Disabled</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {renderTextField("api", "openAIApiKey", "OpenAI API Key", "Enter API key", "API key for OpenAI services", "password")}
                      {renderSwitch("api", "openAIEnabled", "Enable OpenAI Integration", "When disabled, AI features will not be available")}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                {renderTextField("api", "maxApiCallsPerMinute", "Max API Calls Per Minute", "60", "Rate limiting for external API calls", "number")}
                {renderTextField("api", "apiTimeout", "API Timeout (seconds)", "30", "Timeout for external API requests", "number")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure platform security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {renderTextField("security", "passwordMinLength", "Minimum Password Length", "8", "Minimum required length for user passwords", "number")}
                {renderTextField("security", "loginAttempts", "Max Login Attempts", "5", "Number of failed login attempts before lockout", "number")}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {renderTextField("security", "sessionTimeout", "Session Timeout (minutes)", "60", "User session timeout duration", "number")}
                {renderTextField("security", "loginLockoutMinutes", "Login Lockout Duration (minutes)", "15", "Duration of account lockout after max failed login attempts", "number")}
              </div>
              
              <div className="space-y-4">
                {renderSwitch("security", "passwordRequireUppercase", "Require Uppercase Characters", "Passwords must contain at least one uppercase letter")}
                {renderSwitch("security", "passwordRequireNumber", "Require Numbers", "Passwords must contain at least one number")}
                {renderSwitch("security", "passwordRequireSymbol", "Require Special Characters", "Passwords must contain at least one special character")}
              </div>
              
              <div className="space-y-4 border-t pt-4 mt-4">
                {renderSwitch("security", "allowUserRegistration", "Allow User Registration", "When disabled, only administrators can create new accounts")}
                {renderSwitch("security", "requireEmailVerification", "Require Email Verification", "Users must verify their email address before accessing the platform")}
                {renderSwitch("security", "twoFactorAuthenticationEnabled", "Enable Two-Factor Authentication", "Allow users to set up 2FA for their accounts")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and in-app notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderSwitch("notifications", "emailNotificationsEnabled", "Enable Email Notifications", "Send notifications via email")}
              {renderSwitch("notifications", "adminAlertEmailEnabled", "Send Admin Alert Emails", "Send system alert emails to administrators")}
              
              <div className="space-y-4 border-t pt-4 mt-4">
                <h3 className="text-lg font-medium">Event Notifications</h3>
                {renderSwitch("notifications", "vesselUpdateNotifications", "Vessel Updates", "Send notifications when vessel data is updated")}
                {renderSwitch("notifications", "userRegistrationNotifications", "User Registration", "Send notifications when new users register")}
                {renderSwitch("notifications", "documentGenerationNotifications", "Document Generation", "Send notifications when documents are generated")}
              </div>
              
              <div className="space-y-4 border-t pt-4 mt-4">
                <div className="grid gap-2">
                  <Label>System Alert Recipients</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.notifications.systemAlertEmails.map((email, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {email}
                        <button 
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            const newEmails = [...settings.notifications.systemAlertEmails];
                            newEmails.splice(index, 1);
                            setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                systemAlertEmails: newEmails
                              }
                            });
                          }}
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                    <div className="flex">
                      <Input 
                        id="newEmail" 
                        placeholder="Add email..." 
                        type="email"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const email = input.value.trim();
                            if (email && !settings.notifications.systemAlertEmails.includes(email)) {
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  systemAlertEmails: [...settings.notifications.systemAlertEmails, email]
                                }
                              });
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button 
                        className="ml-2"
                        onClick={() => {
                          const input = document.getElementById('newEmail') as HTMLInputElement;
                          const email = input.value.trim();
                          if (email && !settings.notifications.systemAlertEmails.includes(email)) {
                            setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                systemAlertEmails: [...settings.notifications.systemAlertEmails, email]
                              }
                            });
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Emails that will receive system alerts and critical notifications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customization Settings */}
        <TabsContent value="customization">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the platform's look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex">
                    <input
                      type="color"
                      id="primaryColor"
                      value={settings.customization.primaryColor}
                      onChange={(e) => handleInputChange("customization", "primaryColor", e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-md border border-input"
                    />
                    <Input
                      value={settings.customization.primaryColor}
                      onChange={(e) => handleInputChange("customization", "primaryColor", e.target.value)}
                      className="ml-2"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex">
                    <input
                      type="color"
                      id="accentColor"
                      value={settings.customization.accentColor}
                      onChange={(e) => handleInputChange("customization", "accentColor", e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-md border border-input"
                    />
                    <Input
                      value={settings.customization.accentColor}
                      onChange={(e) => handleInputChange("customization", "accentColor", e.target.value)}
                      className="ml-2"
                    />
                  </div>
                </div>
              </div>
              
              {renderTextField("customization", "logoUrl", "Logo URL", "/assets/petrodealhub-logo.png", "URL to the site logo image")}
              {renderTextField("customization", "faviconUrl", "Favicon URL", "/favicon.ico", "URL to the site favicon")}
              
              <div className="grid gap-2 mb-4">
                <Label htmlFor="customCss">Custom CSS</Label>
                <textarea
                  id="customCss"
                  rows={5}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="/* Add custom CSS here */"
                  value={settings.customization.customCss}
                  onChange={(e) => handleInputChange("customization", "customCss", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Custom CSS that will be applied to the entire platform</p>
              </div>
              
              <div className="grid gap-2 mb-4">
                <Label htmlFor="customJavaScript">Custom JavaScript</Label>
                <textarea
                  id="customJavaScript"
                  rows={5}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="// Add custom JavaScript here"
                  value={settings.customization.customJavaScript}
                  onChange={(e) => handleInputChange("customization", "customJavaScript", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Custom JavaScript that will be loaded on all pages</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
              <CardDescription>Configure system maintenance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4 bg-amber-50 mb-4">
                <div className="flex gap-2 items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800">Maintenance Options</h3>
                    <p className="text-sm text-amber-700">
                      These settings control critical system functions. Use with caution.
                    </p>
                  </div>
                </div>
              </div>
              
              {renderSwitch("maintenance", "maintenanceMode", "Enable Maintenance Mode", "When enabled, the site will display a maintenance message to all non-admin users")}
              
              {settings.maintenance.maintenanceMode && (
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <textarea
                    id="maintenanceMessage"
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="The system is currently undergoing scheduled maintenance. Please check back later."
                    value={settings.maintenance.maintenanceMessage}
                    onChange={(e) => handleInputChange("maintenance", "maintenanceMessage", e.target.value)}
                  />
                </div>
              )}
              
              {renderSwitch("maintenance", "allowAdminAccess", "Allow Admin Access During Maintenance", "Administrators can still access the site during maintenance mode")}
              
              <div className="grid gap-4 md:grid-cols-2 border-t pt-4 mt-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Backup Settings</h3>
                  {renderSwitch("maintenance", "autoBackupEnabled", "Enable Automatic Backups", "Automatically backup the database on a scheduled basis")}
                  
                  <div className="grid gap-2 mt-4">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <select 
                      id="backupFrequency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={settings.maintenance.backupFrequency}
                      onChange={(e) => handleInputChange("maintenance", "backupFrequency", e.target.value)}
                      disabled={!settings.maintenance.autoBackupEnabled}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" disabled={!settings.maintenance.autoBackupEnabled}>
                      <Download className="h-4 w-4 mr-2" />
                      Manual Backup
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">System Updates</h3>
                  {renderSwitch("maintenance", "autoUpdateEnabled", "Enable Automatic Updates", "Automatically install system updates when available")}
                  
                  <div className="mt-4">
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check for Updates
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Alerts */}
      {saveStatus === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Settings Saved</AlertTitle>
          <AlertDescription className="text-green-700">
            Your settings have been successfully saved.
          </AlertDescription>
        </Alert>
      )}
      
      {saveStatus === 'error' && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error Saving Settings</AlertTitle>
          <AlertDescription className="text-red-700">
            There was a problem saving your settings. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}