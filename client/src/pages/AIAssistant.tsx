import { useState, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { AIQueryResponse, Vessel, Refinery, Region } from '@/types';
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from 'wouter';
import WorldMap from '@/components/map/WorldMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Send, MessageCircle, Search, Clock, AlertCircle, Ship, Factory, FileText, Map, Navigation } from 'lucide-react';

export default function AIAssistantPage() {
  const { vessels, refineries, loading } = useDataStream();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [conversation, setConversation] = useState<{
    type: 'user' | 'assistant';
    content: string;
    response?: AIQueryResponse;
    timestamp: Date;
  }[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [trackedVessel, setTrackedVessel] = useState<Vessel | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  
  // Handle vessel selection for tracking
  const handleVesselSelect = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setTrackedVessel(vessel);
    setSelectedRefinery(null);
  };
  
  // Handle refinery selection
  const handleRefinerySelect = (refinery: Refinery) => {
    setSelectedRefinery(refinery);
    setSelectedVessel(null);
    setTrackedVessel(null);
  };
  
  // Keep tracked vessel updated with real-time data
  useEffect(() => {
    if (trackedVessel && vessels.length > 0) {
      const updatedVessel = vessels.find(v => v.id === trackedVessel.id);
      if (updatedVessel) {
        setTrackedVessel(updatedVessel);
        if (selectedVessel?.id === updatedVessel.id) {
          setSelectedVessel(updatedVessel);
        }
      }
    }
  }, [vessels, trackedVessel]);
  
  // Function to handle AI query submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || processing) return;
    
    // Add user message to conversation
    setConversation(prev => [
      ...prev,
      {
        type: 'user',
        content: query,
        timestamp: new Date()
      }
    ]);
    
    setProcessing(true);
    
    try {
      // Process with pattern matching first to handle specific actions
      const lowerQuery = query.toLowerCase();
      
      // Vessel tracking requests
      if ((lowerQuery.includes('track') || lowerQuery.includes('follow')) && 
          (lowerQuery.includes('vessel') || lowerQuery.includes('ship'))) {
        const vesselNameMatch = query.match(/track\s+(?:vessel|ship)?\s*([A-Za-z0-9\s]+)/) || 
                                query.match(/follow\s+(?:vessel|ship)?\s*([A-Za-z0-9\s]+)/);
        
        if (vesselNameMatch && vesselNameMatch[1]) {
          const name = vesselNameMatch[1].trim();
          const foundVessel = vessels.find(v => 
            v.name.toLowerCase().includes(name.toLowerCase()) || 
            v.imo.toLowerCase().includes(name.toLowerCase())
          );
          
          if (foundVessel) {
            // Start tracking this vessel
            setTrackedVessel(foundVessel);
            
            const response: AIQueryResponse = {
              type: 'vessel',
              content: `I'm now tracking vessel ${foundVessel.name}. You can see its current position on the map.`,
              vessel: foundVessel
            };
            
            setConversation(prev => [
              ...prev,
              {
                type: 'assistant',
                content: response.content,
                response: response,
                timestamp: new Date()
              }
            ]);
            
            setProcessing(false);
            setQuery('');
            return;
          }
        }
      }
      
      // For vessel lookup queries
      if ((lowerQuery.includes('where is') || lowerQuery.includes('find')) && 
          (lowerQuery.includes('vessel') || lowerQuery.includes('ship'))) {
        const vesselNameMatch = query.match(/where is\s+(?:vessel|ship)?\s*([A-Za-z0-9\s]+)/) || 
                                query.match(/find\s+(?:vessel|ship)?\s*([A-Za-z0-9\s]+)/);
        
        if (vesselNameMatch && vesselNameMatch[1]) {
          const name = vesselNameMatch[1].trim();
          const foundVessel = vessels.find(v => 
            v.name.toLowerCase().includes(name.toLowerCase()) || 
            v.imo.toLowerCase().includes(name.toLowerCase())
          );
          
          if (foundVessel) {
            // Start tracking this vessel
            setTrackedVessel(foundVessel);
            
            const response: AIQueryResponse = {
              type: 'vessel',
              content: `I found vessel ${foundVessel.name}. It's a ${foundVessel.vesselType} currently ${(foundVessel.currentLat && foundVessel.currentLng) ? 'located at coordinates ' + foundVessel.currentLat + '°, ' + foundVessel.currentLng + '°' : 'with unknown location'}.${foundVessel.destinationPort ? ' Heading to ' + foundVessel.destinationPort + '.' : ''}`,
              vessel: foundVessel
            };
            
            setConversation(prev => [
              ...prev,
              {
                type: 'assistant',
                content: response.content,
                response: response,
                timestamp: new Date()
              }
            ]);
            
            setProcessing(false);
            setQuery('');
            return;
          }
        }
      }
      
      // For refinery lookup by region queries
      if (lowerQuery.includes('refinery') || lowerQuery.includes('refineries')) {
        const regionMatch = query.match(/refineries in ([A-Za-z\s]+)/) || 
                          query.match(/refineries\s+([A-Za-z\s]+)/);
        
        if (regionMatch && regionMatch[1]) {
          const region = regionMatch[1].trim();
          const matchingRefineries = refineries.filter(r => 
            r.region.toLowerCase().includes(region.toLowerCase()) || 
            r.country.toLowerCase().includes(region.toLowerCase())
          );
          
          if (matchingRefineries.length > 0) {
            const refinery = matchingRefineries[0]; // Take the first match
            
            // Show this region on the map
            setSelectedRegion(refinery.region as Region);
            
            const response: AIQueryResponse = {
              type: 'refinery',
              content: `I found ${matchingRefineries.length} refineries in ${region}. Here's one of them: ${refinery.name} in ${refinery.country}. It has a capacity of ${refinery.capacity?.toLocaleString() || 'unknown'} bpd and is currently ${refinery.status}.`,
              refinery: refinery
            };
            
            setConversation(prev => [
              ...prev,
              {
                type: 'assistant',
                content: response.content,
                response: response,
                timestamp: new Date()
              }
            ]);
            
            setProcessing(false);
            setQuery('');
            return;
          }
        }
      }
      
      // For all other queries, use the OpenAI API
      const response = await fetch('/api/ai/analyze-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          context: {
            vesselsCount: vessels.length,
            refineriesCount: refineries.length,
            trackedVessel: trackedVessel ? {
              name: trackedVessel.name,
              imo: trackedVessel.imo,
              location: trackedVessel.currentLat && trackedVessel.currentLng ? 
                `${trackedVessel.currentLat}°, ${trackedVessel.currentLng}°` : 'unknown',
              destination: trackedVessel.destinationPort || 'unknown'
            } : null
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Construct our display response
      let aiResponse: AIQueryResponse = {
        type: 'text',
        content: data.response
      };
      
      // If the API suggested a vessel to track, find and attach it
      if (data.vesselToTrack) {
        const foundVessel = vessels.find(v => 
          v.name.toLowerCase().includes(data.vesselToTrack.toLowerCase())
        );
        
        if (foundVessel) {
          aiResponse.type = 'vessel';
          aiResponse.vessel = foundVessel;
          setTrackedVessel(foundVessel);
        }
      }
      
      // If the API suggested a refinery to show, find and attach it
      if (data.refineryToShow) {
        const foundRefinery = refineries.find(r => 
          r.name.toLowerCase().includes(data.refineryToShow.toLowerCase())
        );
        
        if (foundRefinery) {
          aiResponse.type = 'refinery';
          aiResponse.refinery = foundRefinery;
        }
      }
      
      setConversation(prev => [
        ...prev,
        {
          type: 'assistant',
          content: aiResponse.content,
          response: aiResponse,
          timestamp: new Date()
        }
      ]);
      
      setProcessing(false);
      setQuery('');
    } catch (error) {
      console.error('Error processing AI query:', error);
      
      // Fallback response in case of API failure
      const fallbackResponse: AIQueryResponse = {
        type: 'text',
        content: "I'm having trouble connecting to my AI engine right now. I can still help with basic vessel and refinery information. Try asking something like 'Where is vessel Oceanic Pioneer?' or 'Show refineries in Europe'."
      };
      
      setConversation(prev => [
        ...prev,
        {
          type: 'assistant',
          content: fallbackResponse.content,
          response: fallbackResponse,
          timestamp: new Date()
        }
      ]);
      
      setProcessing(false);
      setQuery('');
      
      toast({
        title: "AI Service Error",
        description: "Failed to process your query. Using basic response instead.",
        variant: "destructive"
      });
    }
  };
  
  // Message component
  const Message = ({ message }: { message: typeof conversation[0] }) => {
    const isUser = message.type === 'user';
    const response = message.response;
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[75%] ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-full bg-background w-6 h-6 flex items-center justify-center">
              {isUser ? 
                <MessageCircle className="h-4 w-4" /> : 
                <Sparkles className="h-4 w-4 text-primary" />
              }
            </div>
            <div className="text-sm font-medium">
              {isUser ? 'You' : 'AI Assistant'}
            </div>
            <div className="text-xs opacity-70 ml-auto">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <div className="text-sm">{message.content}</div>
          
          {/* Display vessel or refinery card if available in the response */}
          {response && response.type !== 'text' && (
            <div className="mt-2 bg-card rounded-md p-2">
              {response.type === 'vessel' && response.vessel && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Ship className="h-4 w-4 mr-1.5 text-primary" />
                      <span className="font-medium">{response.vessel.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2 text-xs"
                        onClick={() => response.vessel && setTrackedVessel(response.vessel)}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Track
                      </Button>
                      <Link href={`/vessels/${response.vessel.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    IMO: {response.vessel.imo} | Flag: {response.vessel.flag}
                    {response.vessel.currentLat && response.vessel.currentLng && (
                      <span> | Position: {response.vessel.currentLat}°, {response.vessel.currentLng}°</span>
                    )}
                  </div>
                </div>
              )}
              
              {response.type === 'refinery' && response.refinery && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Factory className="h-4 w-4 mr-1.5 text-primary" />
                      <span className="font-medium">{response.refinery.name}</span>
                    </div>
                    <Link href={`/refineries/${response.refinery.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {response.refinery.country}, {response.refinery.region}
                  </div>
                </div>
              )}
              
              {response.type === 'document' && response.document && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1.5 text-primary" />
                      <span className="font-medium">{response.document.title}</span>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {response.document.type} | Created: {new Date(response.document.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <div className="bg-primary/10 p-2 rounded-full mr-3">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about vessels, refineries, or cargo
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="conversation" className="mb-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversation
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Live Map
            </TabsTrigger>
          </TabsList>
          
          {trackedVessel && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Navigation className="h-3 w-3 text-primary" />
                Tracking: {trackedVessel.name}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => setTrackedVessel(null)}
              >
                Stop
              </Button>
            </div>
          )}
        </div>
      
        <TabsContent value="conversation" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-250px)] flex flex-col">
                <CardHeader>
                  <CardTitle>AI Assistant</CardTitle>
                  <CardDescription>
                    Ask questions or request analysis about vessels, refineries, or cargo
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    {conversation.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
                        <p className="text-muted-foreground max-w-md">
                          Ask me about vessels, refineries, shipping routes, or oil cargo. 
                          I can provide information, analyze data, and help you track vessels.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-md">
                          <Button variant="outline" className="justify-start" onClick={() => setQuery("Show active vessels in Europe")}>
                            <Ship className="mr-2 h-4 w-4" />
                            Vessels in Europe
                          </Button>
                          <Button variant="outline" className="justify-start" onClick={() => setQuery("List refineries in Middle East")}>
                            <Factory className="mr-2 h-4 w-4" />
                            Middle East Refineries
                          </Button>
                          <Button variant="outline" className="justify-start" onClick={() => setQuery("Track vessel Arctic Aurora")}>
                            <Navigation className="mr-2 h-4 w-4" />
                            Track a Vessel
                          </Button>
                          <Button variant="outline" className="justify-start" onClick={() => setQuery("Analyze oil shipping trends")}>
                            <Search className="mr-2 h-4 w-4" />
                            Shipping Analysis
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pb-2">
                        {conversation.map((message, index) => (
                          <Message key={index} message={message} />
                        ))}
                        {processing && (
                          <div className="flex justify-start mb-4">
                            <div className="max-w-[75%] bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <div className="rounded-full bg-background w-6 h-6 flex items-center justify-center">
                                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                </div>
                                <div className="text-sm font-medium">AI Assistant</div>
                              </div>
                              <div className="mt-2 flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                
                <CardFooter className="border-t pt-4">
                  <form onSubmit={handleSubmit} className="w-full flex gap-2">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask about vessels, refineries, or shipping..."
                      disabled={processing}
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={processing || !query.trim()}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    AI Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Badge className="mb-1 bg-blue-100 text-blue-800 hover:bg-blue-100">OpenAI Powered</Badge>
                    <p className="text-sm">This AI assistant uses OpenAI's powerful language models to analyze maritime data and provide intelligent responses.</p>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <h4 className="font-medium">Ask me about:</h4>
                    <ul className="space-y-1 text-sm list-disc list-inside">
                      <li>Vessel locations and details</li>
                      <li>Refinery information and capacity</li>
                      <li>Shipping route recommendations</li>
                      <li>Oil cargo and transportation</li>
                      <li>Maritime regulations and standards</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Vessel Tracking</AlertTitle>
                <AlertDescription>
                  You can track vessels by asking the AI to "track" or "follow" a specific vessel by name. The vessel's location will be displayed on the map.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="map">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-250px)]">
                <CardContent className="p-0 h-full">
                  <WorldMap 
                    trackedVessel={trackedVessel}
                    selectedVessel={selectedVessel}
                    selectedRefinery={selectedRefinery}
                    onVesselSelect={handleVesselSelect}
                    onRefinerySelect={handleRefinerySelect}
                    selectedRegion={selectedRegion}
                    showTrackingLine={!!trackedVessel}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {trackedVessel && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Ship className="h-5 w-5 mr-2" />
                      {trackedVessel.name}
                    </CardTitle>
                    <CardDescription>
                      {trackedVessel.vesselType || "Vessel"} | IMO: {trackedVessel.imo}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Flag:</span>
                      <span>{trackedVessel.flag || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cargo:</span>
                      <span>{trackedVessel.cargoType || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Heading to:</span>
                      <span>{trackedVessel.destinationPort || "Unknown"}</span>
                    </div>
                    {trackedVessel.currentLat && trackedVessel.currentLng && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Position:</span>
                        <span>{trackedVessel.currentLat}°, {trackedVessel.currentLng}°</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Region:</span>
                      <span>{trackedVessel.currentRegion || "Unknown"}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setTrackedVessel(null)}
                    >
                      Stop Tracking
                    </Button>
                    <Link href={`/vessels/${trackedVessel.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
              
              {selectedRefinery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Factory className="h-5 w-5 mr-2" />
                      {selectedRefinery.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedRefinery.country} | {selectedRefinery.region}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span>{selectedRefinery.status || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Capacity:</span>
                      <span>{selectedRefinery.capacity?.toLocaleString() || "Unknown"} bpd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span>{selectedRefinery.type || "Standard"}</span>
                    </div>
                    {selectedRefinery.lat && selectedRefinery.lng && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Position:</span>
                        <span>{selectedRefinery.lat}°, {selectedRefinery.lng}°</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link href={`/refineries/${selectedRefinery.id}`} className="w-full">
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
              
              {!trackedVessel && !selectedRefinery && (
                <Alert>
                  <Map className="h-4 w-4" />
                  <AlertTitle>Interactive Map</AlertTitle>
                  <AlertDescription>
                    Click on vessels or refineries on the map to view their details. You can also ask the AI to track a specific vessel.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}