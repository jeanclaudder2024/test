import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  Send, 
  Download, 
  Clock, 
  User, 
  Mail, 
  Phone,
  Building,
  MapPin,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  ExternalLink
} from 'lucide-react';
import AdminBrokerChat from '@/components/chat/AdminBrokerChat';

interface BrokerDetailsProps {
  broker: any;
  onBack: () => void;
}

export default function BrokerDetails({ broker, onBack }: BrokerDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  // Fetch broker documents (transaction documents)
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['broker-documents', broker.id],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/admin/broker-documents/${broker.id}`);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
    },
    staleTime: 0
  });

  // Fetch broker messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['broker-messages', broker.id],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/admin/broker/${broker.id}/messages`);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
    },
    staleTime: 0
  });

  // Fetch broker deals for context
  const { data: brokerDeals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['broker-deals', broker.id],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/admin/broker-deals`);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching deals:', error);
        return [];
      }
    },
    staleTime: 0
  });

  // Filter deals for this broker
  const thisBrokerDeals = brokerDeals.filter((deal: any) => deal.brokerId === broker.id);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest('POST', `/api/admin/broker/${broker.id}/messages`, messageData);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      setNewMessage('');
      setSelectedDeal(null);
      queryClient.invalidateQueries({ queryKey: ['broker-messages', broker.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      dealId: selectedDeal?.id || null,
      message: newMessage,
      receiverId: broker.id
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      approved: { variant: "default" as const, icon: CheckCircle, label: "Approved" },
      rejected: { variant: "destructive" as const, icon: AlertCircle, label: "Rejected" },
      completed: { variant: "default" as const, icon: CheckCircle, label: "Completed" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Broker Management
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {broker.firstName} {broker.lastName}
          </h2>
          <p className="text-gray-600">{broker.email}</p>
        </div>
      </div>

      {/* Broker Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Broker Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {broker.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {broker.phone || 'Not provided'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {broker.company || 'Not provided'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {broker.location || 'Not provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Active Deals</span>
              <span className="font-semibold">{thisBrokerDeals.filter(d => d.status === 'approved').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Deals</span>
              <span className="font-semibold">{thisBrokerDeals.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Documents</span>
              <span className="font-semibold">{documents.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Messages</span>
              <span className="font-semibold">{messages.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Deals ({thisBrokerDeals.length})
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat ({messages.length})
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Broker Documents</CardTitle>
              <CardDescription>Documents uploaded by the broker</CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.originalFilename}</p>
                          <p className="text-sm text-gray-500">
                            {doc.mimeType} • {formatDate(doc.uploadedAt)}
                          </p>
                          {doc.dealTitle && (
                            <p className="text-xs text-blue-600">Deal: {doc.dealTitle}</p>
                          )}
                          {doc.stepName && (
                            <p className="text-xs text-green-600">Step: {doc.stepName}</p>
                          )}
                          {doc.documentType && (
                            <p className="text-xs text-purple-600">Type: {doc.documentType}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/api/admin/transaction-documents/${doc.id}/view`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/api/admin/transaction-documents/${doc.id}/download`, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Broker Deals</CardTitle>
              <CardDescription>All deals associated with this broker</CardDescription>
            </CardHeader>
            <CardContent>
              {dealsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading deals...</p>
                </div>
              ) : thisBrokerDeals.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No deals found for this broker</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {thisBrokerDeals.map((deal: any) => (
                    <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Building className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{deal.dealTitle}</p>
                          <p className="text-sm text-gray-500">
                            {deal.oilType} • {deal.requestedAmount}
                          </p>
                          <p className="text-xs text-gray-400">
                            Created: {formatDate(deal.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-medium">{deal.totalValue}</p>
                          <p className="text-sm text-gray-500">Step {deal.currentStep}/8</p>
                        </div>
                        {getStatusBadge(deal.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <AdminBrokerChat brokerId={broker.id} broker={broker} />
        </TabsContent>
      </Tabs>
    </div>
  );
}