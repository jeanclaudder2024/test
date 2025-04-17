import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { AIQueryResponse } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<AIQueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setResponse(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a question or command",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await apiRequest('POST', '/api/ai/query', { query });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error processing AI query:", error);
      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleAssistant}
          className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isOpen ? 'bg-secondary hover:bg-secondary-dark' : 'bg-primary hover:bg-primary-dark'}`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
        </Button>
      </div>
      
      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md z-50">
          <Card className="shadow-xl">
            <CardHeader className="bg-primary text-white py-4">
              <CardTitle className="text-lg flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                ShipBoat AI Assistant
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="min-h-[200px] max-h-[400px] overflow-y-auto mb-4">
                {/* Default welcome message */}
                {!response && !isLoading && (
                  <div className="p-3 bg-gray-100 rounded-lg mb-3">
                    <p className="text-sm">
                      Hello! I'm your vessel tracking assistant. You can ask me about vessels, 
                      refineries, or cargo information.
                    </p>
                  </div>
                )}
                
                {/* Loading state */}
                {isLoading && (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
                
                {/* AI Response */}
                {response && (
                  <div className="p-3 bg-gray-100 rounded-lg mb-3">
                    <p className="text-sm">{response.content}</p>
                    
                    {/* If there's a vessel in the response, display some info */}
                    {response.type === 'vessel' && response.vessel && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs">
                        <p className="font-medium">{response.vessel.name}</p>
                        <p>Type: {response.vessel.vesselType}</p>
                        <p>Flag: {response.vessel.flag}</p>
                      </div>
                    )}
                    
                    {/* If there's a refinery in the response, display some info */}
                    {response.type === 'refinery' && response.refinery && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs">
                        <p className="font-medium">{response.refinery.name}</p>
                        <p>Location: {response.refinery.country}</p>
                        <p>Status: {response.refinery.status}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="Ask about vessels, cargos, routes..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              
              <div className="mt-2 text-xs text-gray-500 text-center">
                Type your query and press enter
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
