import { useState } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { AIQueryResponse } from '@/types';
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
import { Sparkles, Send, MessageCircle, Search, Clock, AlertCircle, Ship, Factory, FileText } from 'lucide-react';

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
      // For demonstration, we'll simulate a response
      // In a real implementation, this would be an API call to the AI service
      
      setTimeout(() => {
        const simulatedResponse: AIQueryResponse = {
          type: 'text',
          content: "I've found information about vessels in the fleet. There are currently " + 
                   vessels.length + " vessels and " + refineries.length + 
                   " refineries in the system. Would you like me to provide more specific information about a particular vessel or refinery?",
        };
        
        setConversation(prev => [
          ...prev,
          {
            type: 'assistant',
            content: simulatedResponse.content,
            response: simulatedResponse,
            timestamp: new Date()
          }
        ]);
        
        setProcessing(false);
      }, 1500);
      
      // Clear the input
      setQuery('');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive"
      });
      setProcessing(false);
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
                    <Link href={`/vessels/${response.vessel.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    IMO: {response.vessel.imo} | Flag: {response.vessel.flag}
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
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                Ask questions or request analysis
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {conversation.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
                    <p className="text-muted-foreground max-w-md">
                      Ask me about vessel locations, cargo information, refineries, or generate shipping documents.
                    </p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
                      <Button variant="outline" className="justify-start" onClick={() => setQuery("Where is vessel Oceanic Pioneer?")}>
                        <Search className="h-4 w-4 mr-2" />
                        Find a vessel
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setQuery("Show me refineries in Europe")}>
                        <Factory className="h-4 w-4 mr-2" />
                        List refineries by region
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setQuery("Generate bill of lading for vessel with ID 3")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate a document
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setQuery("What's the total oil capacity of our fleet?")}>
                        <Clock className="h-4 w-4 mr-2" />
                        Fleet analysis
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {conversation.map((message, index) => (
                      <Message key={index} message={message} />
                    ))}
                    
                    {processing && (
                      <div className="flex justify-start mb-4">
                        <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                          <div className="rounded-full bg-background w-6 h-6 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                          <div className="animate-pulse flex space-x-1">
                            <div className="w-2 h-2 bg-foreground/30 rounded-full"></div>
                            <div className="w-2 h-2 bg-foreground/30 rounded-full"></div>
                            <div className="w-2 h-2 bg-foreground/30 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="border-t pt-4">
              <form onSubmit={handleSubmit} className="w-full">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about vessels, refineries, or cargo..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={processing}
                  />
                  <Button type="submit" disabled={processing || !query.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Capabilities</CardTitle>
              <CardDescription>
                What the AI assistant can do
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <Search className="h-4 w-4 text-primary mt-0.5" />
                  <span>Search for vessels and refineries</span>
                </li>
                <li className="flex gap-2">
                  <Ship className="h-4 w-4 text-primary mt-0.5" />
                  <span>Track vessel locations and status</span>
                </li>
                <li className="flex gap-2">
                  <Factory className="h-4 w-4 text-primary mt-0.5" />
                  <span>Get refinery information and capacity</span>
                </li>
                <li className="flex gap-2">
                  <FileText className="h-4 w-4 text-primary mt-0.5" />
                  <span>Generate shipping documents</span>
                </li>
                <li className="flex gap-2">
                  <Clock className="h-4 w-4 text-primary mt-0.5" />
                  <span>Analyze historical vessel data</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>OpenAI Integration</AlertTitle>
            <AlertDescription>
              To fully enable AI capabilities, an OpenAI API key is required. Your data will be processed securely.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}