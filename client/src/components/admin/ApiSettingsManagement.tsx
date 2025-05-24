import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  RefreshCw, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Key, 
  Ship, 
  Brain,
  Anchor,
  Factory
} from "lucide-react";

export function ApiSettingsManagement() {
  const [openAiKey, setOpenAiKey] = useState("");
  const [shipTrackingKey, setShipTrackingKey] = useState("");
  const [isTestingOpenAi, setIsTestingOpenAi] = useState(false);
  const [isTestingShipTracking, setIsTestingShipTracking] = useState(false);
  const [openAiTestResult, setOpenAiTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [shipTrackingTestResult, setShipTrackingTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current API keys (masked)
  const { data: apiSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/settings/api'],
    queryFn: () => apiRequest('/api/admin/settings/api'),
    onSuccess: (data) => {
      // Set placeholder masked values for UI
      if (data?.openAiKeyMasked) {
        setOpenAiKey(data.openAiKeyMasked);
      }
      if (data?.shipTrackingKeyMasked) {
        setShipTrackingKey(data.shipTrackingKeyMasked);
      }
    }
  });
  
  // Test OpenAI API Key
  const testOpenAiMutation = useMutation({
    mutationFn: (key: string) => apiRequest('/api/admin/test/openai', {
      method: 'POST',
      data: { key }
    }),
    onMutate: () => {
      setIsTestingOpenAi(true);
      setOpenAiTestResult(null);
    },
    onSuccess: (data) => {
      setOpenAiTestResult({
        success: true,
        message: data.message || "OpenAI API key is valid!"
      });
      toast({
        title: "API Test Successful",
        description: "OpenAI API key is valid and working properly.",
      });
    },
    onError: (error: any) => {
      setOpenAiTestResult({
        success: false,
        message: error.message || "Failed to validate OpenAI API key."
      });
      toast({
        title: "API Test Failed",
        description: error.message || "Failed to validate OpenAI API key.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTestingOpenAi(false);
    }
  });
  
  // Test Ship Tracking API Key
  const testShipTrackingMutation = useMutation({
    mutationFn: (key: string) => apiRequest('/api/admin/test/shiptracking', {
      method: 'POST',
      data: { key }
    }),
    onMutate: () => {
      setIsTestingShipTracking(true);
      setShipTrackingTestResult(null);
    },
    onSuccess: (data) => {
      setShipTrackingTestResult({
        success: true,
        message: data.message || "Ship Tracking API key is valid!"
      });
      toast({
        title: "API Test Successful",
        description: "Ship Tracking API key is valid and working properly.",
      });
    },
    onError: (error: any) => {
      setShipTrackingTestResult({
        success: false,
        message: error.message || "Failed to validate Ship Tracking API key."
      });
      toast({
        title: "API Test Failed",
        description: error.message || "Failed to validate Ship Tracking API key.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTestingShipTracking(false);
    }
  });
  
  // Save API Keys
  const saveApiKeysMutation = useMutation({
    mutationFn: (data: { 
      openAiKey?: string; 
      shipTrackingKey?: string; 
    }) => apiRequest('/api/admin/settings/api', {
      method: 'POST',
      data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/api'] });
      toast({
        title: "API Settings Saved",
        description: "Your API configuration has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Save Settings",
        description: error.message || "There was an error saving your API settings.",
        variant: "destructive",
      });
    }
  });
  
  // Handle saving OpenAI key
  const handleSaveOpenAiKey = () => {
    if (openAiKey && !openAiKey.includes("*")) { // Only save if not masked
      saveApiKeysMutation.mutate({ openAiKey });
    } else {
      toast({
        title: "No Changes Made",
        description: "You didn't change the OpenAI API key.",
      });
    }
  };
  
  // Handle saving Ship Tracking key
  const handleSaveShipTrackingKey = () => {
    if (shipTrackingKey && !shipTrackingKey.includes("*")) { // Only save if not masked
      saveApiKeysMutation.mutate({ shipTrackingKey });
    } else {
      toast({
        title: "No Changes Made",
        description: "You didn't change the Ship Tracking API key.",
      });
    }
  };
  
  // Handle testing OpenAI key
  const handleTestOpenAiKey = () => {
    if (openAiKey && !openAiKey.includes("*")) {
      testOpenAiMutation.mutate(openAiKey);
    } else if (apiSettings?.hasOpenAiKey) {
      // Test the existing key in the backend
      testOpenAiMutation.mutate("");
    } else {
      toast({
        title: "No API Key",
        description: "Please enter an OpenAI API key first.",
        variant: "destructive",
      });
    }
  };
  
  // Handle testing Ship Tracking key
  const handleTestShipTrackingKey = () => {
    if (shipTrackingKey && !shipTrackingKey.includes("*")) {
      testShipTrackingMutation.mutate(shipTrackingKey);
    } else if (apiSettings?.hasShipTrackingKey) {
      // Test the existing key in the backend
      testShipTrackingMutation.mutate("");
    } else {
      toast({
        title: "No API Key",
        description: "Please enter a Ship Tracking API key first.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys Management
          </CardTitle>
          <CardDescription>
            Configure third-party API integrations for enhanced platform functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="openai" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="openai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                OpenAI Integration
              </TabsTrigger>
              <TabsTrigger value="vessel" className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Vessel Tracking
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="openai" className="space-y-6">
              <div className="flex items-start justify-between mb-8 p-4 border rounded-lg bg-muted/50">
                <div>
                  <h3 className="text-lg font-medium mb-1">OpenAI API Key</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Used for AI document processing and smart maritime insights
                  </p>
                  <Badge variant={apiSettings?.hasOpenAiKey ? "outline" : "destructive"} className="mb-2">
                    {apiSettings?.hasOpenAiKey ? "Configured" : "Not Configured"}
                  </Badge>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="openai-enabled" 
                      checked={apiSettings?.openAiEnabled}
                      disabled={!apiSettings?.hasOpenAiKey} 
                    />
                    <Label htmlFor="openai-enabled">
                      {apiSettings?.openAiEnabled ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                  {openAiTestResult && (
                    <Badge variant={openAiTestResult.success ? "success" : "destructive"}>
                      {openAiTestResult.success ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {openAiTestResult.success ? "Valid" : "Invalid"}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="openai-key"
                        type="password"
                        value={openAiKey}
                        onChange={(e) => setOpenAiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleTestOpenAiKey}
                        disabled={isTestingOpenAi}
                      >
                        {isTestingOpenAi ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Test"
                        )}
                      </Button>
                      <Button 
                        variant="default" 
                        onClick={handleSaveOpenAiKey}
                        disabled={saveApiKeysMutation.isPending}
                      >
                        {saveApiKeysMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="openai-details">
                      <AccordionTrigger>OpenAI API Details</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 py-2">
                          <div>
                            <h4 className="font-medium mb-1">Integration Status</h4>
                            <p className="text-sm text-muted-foreground">
                              {apiSettings?.openAiStatus || "Not available"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">OpenAI Models Used</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline">gpt-4</Badge>
                              <Badge variant="outline">gpt-3.5-turbo</Badge>
                              <Badge variant="outline">text-embedding-ada-002</Badge>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">API Usage</h4>
                            <p className="text-sm text-muted-foreground">
                              Used for document analysis, ship routing optimization,
                              and natural language processing of maritime communications.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="vessel" className="space-y-6">
              <div className="flex items-start justify-between mb-8 p-4 border rounded-lg bg-muted/50">
                <div>
                  <h3 className="text-lg font-medium mb-1">Vessel Tracking API Key</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Required for real-time vessel tracking and maritime data
                  </p>
                  <Badge variant={apiSettings?.hasShipTrackingKey ? "outline" : "destructive"} className="mb-2">
                    {apiSettings?.hasShipTrackingKey ? "Configured" : "Not Configured"}
                  </Badge>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="ship-tracking-enabled" 
                      checked={apiSettings?.shipTrackingEnabled}
                      disabled={!apiSettings?.hasShipTrackingKey} 
                    />
                    <Label htmlFor="ship-tracking-enabled">
                      {apiSettings?.shipTrackingEnabled ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                  {shipTrackingTestResult && (
                    <Badge variant={shipTrackingTestResult.success ? "success" : "destructive"}>
                      {shipTrackingTestResult.success ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {shipTrackingTestResult.success ? "Valid" : "Invalid"}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ship-tracking-key">Ship Tracking API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ship-tracking-key"
                        type="password"
                        value={shipTrackingKey}
                        onChange={(e) => setShipTrackingKey(e.target.value)}
                        placeholder="Enter API key for vessel tracking"
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleTestShipTrackingKey}
                        disabled={isTestingShipTracking}
                      >
                        {isTestingShipTracking ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Test"
                        )}
                      </Button>
                      <Button 
                        variant="default" 
                        onClick={handleSaveShipTrackingKey}
                        disabled={saveApiKeysMutation.isPending}
                      >
                        {saveApiKeysMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="vessel-tracking-details">
                      <AccordionTrigger>Vessel Tracking API Details</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 py-2">
                          <div>
                            <h4 className="font-medium mb-1">Integration Status</h4>
                            <p className="text-sm text-muted-foreground">
                              {apiSettings?.shipTrackingStatus || "Not available"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Data Sources</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline">AIS Data</Badge>
                              <Badge variant="outline">Satellite Tracking</Badge>
                              <Badge variant="outline">Port Authorities</Badge>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Tracked Assets</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <Ship className="h-3 w-3" /> 
                                <span className="text-sm">Vessels: {apiSettings?.vesselCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Anchor className="h-3 w-3" /> 
                                <span className="text-sm">Ports: {apiSettings?.portCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Factory className="h-3 w-3" /> 
                                <span className="text-sm">Refineries: {apiSettings?.refineryCount || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}