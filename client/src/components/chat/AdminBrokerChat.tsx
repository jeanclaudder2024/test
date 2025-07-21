import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';

interface BrokerUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface Conversation {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  lastMessageAt: string;
  brokerId: number;
  adminId: number;
}

interface Message {
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

interface AdminBrokerChatProps {
  brokerId: number;
  broker: BrokerUser;
}

export default function AdminBrokerChat({ brokerId, broker }: AdminBrokerChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations for this specific broker
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: [`/api/admin/broker/${brokerId}/conversations`],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/broker/${brokerId}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    retry: false,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: [`/api/chat/conversations/${selectedConversation}/messages`],
    enabled: !!selectedConversation,
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/chat/conversations/${selectedConversation}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, messageText }: { conversationId: number, messageText: string }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageText })
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: [`/api/chat/conversations/${selectedConversation}/messages`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/broker/${brokerId}/conversations`] });
      toast({
        title: "Message sent",
        description: "Your message has been sent to the broker.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async ({ title }: { title: string }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/broker/${brokerId}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, priority: 'normal' })
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: (data) => {
      setNewConversationTitle('');
      setShowNewConversation(false);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/broker/${brokerId}/conversations`] });
      toast({
        title: "Conversation created",
        description: "New conversation started with broker.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({ 
      conversationId: selectedConversation, 
      messageText: newMessage.trim() 
    });
  };

  const handleCreateConversation = () => {
    if (!newConversationTitle.trim()) return;
    createConversationMutation.mutate({ title: newConversationTitle.trim() });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'urgent': return 'bg-red-600';
      default: return 'bg-green-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Broker Info Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {broker.firstName && broker.lastName ? `${broker.firstName} ${broker.lastName}` : broker.email}
              </h3>
              <p className="text-sm text-gray-600">{broker.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {broker.phone && (
              <Button size="sm" variant="outline" className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowNewConversation(!showNewConversation)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </CardHeader>
          <CardContent>
            {/* New Conversation Form */}
            {showNewConversation && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <Input
                  placeholder="Conversation title..."
                  value={newConversationTitle}
                  onChange={(e) => setNewConversationTitle(e.target.value)}
                  className="mb-2"
                />
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={handleCreateConversation}
                    disabled={!newConversationTitle.trim() || createConversationMutation.isPending}
                  >
                    Create
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowNewConversation(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Conversations List */}
            <ScrollArea className="h-96">
              {conversationsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new conversation with this broker</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {conversation.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(conversation.priority)} text-white border-transparent`}
                        >
                          <span className="flex items-center gap-1">
                            {getPriorityIcon(conversation.priority)}
                            {conversation.priority}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(conversation.lastMessageAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedConversation ? 'Messages' : 'Select a Conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedConversation ? (
              <div className="text-center py-16 text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p>Select a conversation from the list to view messages</p>
              </div>
            ) : (
              <>
                {/* Messages Area */}
                <ScrollArea className="h-96 mb-4 border rounded-lg p-4">
                  {messagesLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation below</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderRole === 'admin' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderRole === 'admin'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.messageText}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderRole === 'admin'
                                  ? 'text-blue-200'
                                  : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message to the broker..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}