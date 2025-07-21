import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Plus, AlertCircle, Clock, User, Shield } from 'lucide-react';

interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  messageText: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  senderName: string;
  senderRole: string;
}

interface ChatConversation {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  lastMessageAt: string;
  adminId: number | null;
}

export default function BrokerAdminChat() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/broker/conversations'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/broker/conversations', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    staleTime: 0
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/conversations', selectedConversation, 'messages'],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/chat/conversations/${selectedConversation}/messages`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversation,
    staleTime: 0
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, messageText }: { conversationId: number; messageText: string }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ messageText })
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/broker/conversations'] });
      setNewMessage('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async ({ title, priority }: { title: string; priority: string }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/broker/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title, priority })
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/broker/conversations'] });
      setSelectedConversation(data.conversation.id);
      setNewChatTitle('');
      setShowNewChat(false);
      toast({
        title: "Success",
        description: "New chat conversation created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      messageText: newMessage.trim()
    });
  };

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;
    
    createConversationMutation.mutate({
      title: newChatTitle.trim(),
      priority: 'normal'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Support Chat
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowNewChat(!showNewChat)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {showNewChat && (
            <form onSubmit={handleCreateChat} className="space-y-2">
              <Input
                placeholder="Chat title..."
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={!newChatTitle.trim()}>
                  Create
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewChat(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversationsLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet. Create one to start chatting with support!
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {conversations.map((conversation: ChatConversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">{conversation.title}</span>
                      <Badge className={`${getPriorityColor(conversation.priority)} text-white text-xs`}>
                        {conversation.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(conversation.lastMessageAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {conversations.find((c: ChatConversation) => c.id === selectedConversation)?.title || 'Chat'}
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages Area */}
              <ScrollArea className="flex-1 h-[400px] p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: ChatMessage) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.senderRole === 'admin' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${
                            message.senderRole === 'admin' 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            {message.senderRole === 'admin' ? (
                              <Shield className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-xs lg:max-w-md ${
                          message.senderRole === 'admin' ? 'text-right' : ''
                        }`}>
                          <div className={`rounded-lg p-3 ${
                            message.senderRole === 'admin'
                              ? 'bg-orange-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}>
                            <p className="text-sm">{message.messageText}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <span>{message.senderName}</span>
                            <span>•</span>
                            <span>{formatTime(message.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the left to start chatting with support</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}