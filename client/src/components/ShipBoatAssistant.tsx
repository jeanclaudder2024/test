import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  MoveRight, 
  Ship, 
  Anchor, 
  HelpCircle, 
  MapPin, 
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Sample suggested questions
const suggestedQuestions = [
  "How many vessels are currently tracked?",
  "Show me the closest vessels to Singapore",
  "What's the status of the Ever Given vessel?",
  "Generate a report for Jamnagar Refinery",
  "What is the latest voyage from Saudi Arabia?"
];

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

export function ShipBoatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm ShipBoat AI Assistant. How can I help you with maritime tracking today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    
    // Simulate AI typing
    setIsTyping(true);
    
    // In a real implementation, you would send the message to your backend API
    // that integrates with OpenAI. For now, we'll simulate a response.
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getSimulatedResponse(message),
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // This is just for demo purposes, in a real app you'd call your actual API
  const getSimulatedResponse = (userMessage: string) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes("vessel") && lowerCaseMessage.includes("tracked")) {
      return "We are currently tracking 2,499 vessels across global waters. Would you like to see the most active shipping lanes?";
    }
    
    if (lowerCaseMessage.includes("singapore")) {
      return "I found 15 vessels within 50 nautical miles of Singapore. The closest is the 'Maersk Edmonton' which is currently at berth at Singapore Container Terminal.";
    }
    
    if (lowerCaseMessage.includes("ever given")) {
      return "The vessel 'Ever Given' is currently en route to Rotterdam from Yantian. It's carrying container cargo and is estimated to arrive on May 10, 2025.";
    }
    
    if (lowerCaseMessage.includes("jamnagar")) {
      return "Jamnagar Refinery processed approximately 890,000 barrels per day in the last quarter. There are currently 4 vessels en route to deliver crude oil. Would you like me to generate a detailed report?";
    }
    
    if (lowerCaseMessage.includes("saudi arabia")) {
      return "The latest voyage from Saudi Arabia was the 'Nordic Aurora' tanker, which departed Ras Tanura Terminal on May 3, 2025, carrying 2 million barrels of crude oil, bound for Jamnagar, India.";
    }
    
    return "I'll look into that for you. Would you like me to provide more specific information about vessels, ports, or refineries?";
  };

  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={cn(
          "fixed z-50 bottom-6 right-6 rounded-full p-4 shadow-lg",
          "bg-primary hover:bg-primary/90 text-white",
          "flex items-center gap-2",
          isOpen ? "hidden" : "flex"
        )}
        size="icon"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed z-50 bottom-6 right-6 bg-card border border-border rounded-lg shadow-xl",
          "transition-all duration-200 ease-in-out transform origin-bottom-right",
          "flex flex-col",
          isOpen ? "scale-100" : "scale-0 opacity-0 pointer-events-none",
          isMinimized ? "h-14 w-80" : "w-96 md:w-[450px] h-[600px] max-h-[80vh]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-8 w-8 bg-primary/20">
                <AvatarImage src="" alt="ShipBoat AI" />
                <AvatarFallback className="bg-primary text-white">
                  <Ship className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h3 className="text-sm font-medium leading-none">ShipBoat AI</h3>
              <p className="text-xs text-muted-foreground">Maritime Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Chat body - only visible when not minimized */}
        {!isMinimized && (
          <>
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%] mb-4",
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex max-w-[85%] mr-auto">
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex space-x-1 items-center h-6">
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            <div className="px-4 py-2 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center gap-1 max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    <HelpCircle className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{question}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
              <div className="relative">
                <Textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask ShipBoat AI a question..."
                  className="min-h-12 w-full p-3 pr-12 text-sm resize-none bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/50"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 bottom-1 h-10 w-10 bg-primary text-white hover:bg-primary/90 rounded-md"
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Powered by OpenAI {/* Note: In production, credit the actual AI model */}
              </p>
            </form>
          </>
        )}
      </div>
    </>
  );
}