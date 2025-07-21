import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import PaymentReminder from '@/components/PaymentReminder';
import CreateDealDialog from '@/components/broker/CreateDealDialog';
import SimpleOilTradingPrices from '@/pages/SimpleOilTradingPrices';
import { StepManagement } from '@/components/broker/StepManagement';
import BrokerAdminChat from '@/components/chat/BrokerAdminChat';
import { 
  Handshake, 
  FileText, 
  Download, 
  Upload, 
  Building2, 
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Paperclip,
  TrendingUp,
  BarChart3,
  Plus,
  X
} from 'lucide-react';

// Types
interface Deal {
  id: number;
  dealTitle: string;
  companyName: string;
  companyId: number;
  dealValue: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  progress: number;
  startDate: string;
  expectedCloseDate: string;
  oilType: string;
  quantity: string;
  notes?: string;
  documentsCount: number;
}

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  downloadCount: number;
  dealId?: number;
  isAdminFile: boolean;
}

interface AdminFile {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: string;
  sentDate: string;
  sentBy: string;
  description: string;
  category: 'contract' | 'compliance' | 'legal' | 'technical' | 'other';
}

export default function BrokerDashboard() {
  const [activeTab, setActiveTab] = useState('deals');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { trialDaysRemaining, isTrialExpired, hasActiveTrial, canAccessBrokerFeatures } = useSubscription();

  // Check if user needs to complete upgrade first
  const { data: brokerProfile } = useQuery({
    queryKey: ['/api/broker/profile'],
    retry: false,
  });

  useEffect(() => {
    // Redirect to upgrade page if broker profile is incomplete
    if (brokerProfile && !brokerProfile.isProfileComplete) {
      setLocation('/broker-upgrade');
    }
  }, [brokerProfile, setLocation]);

  // Show payment reminder if trial is ending or expired
  const shouldShowPaymentReminder = hasActiveTrial && (trialDaysRemaining <= 2 || isTrialExpired);

  // Transaction Documents Section Component
  const TransactionDocumentsSection = () => {
    const { data: allTransactionDocuments = [], isLoading: documentsLoading } = useQuery({
      queryKey: ['/api/broker/all-transaction-documents'],
      queryFn: async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/broker/all-transaction-documents', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!response.ok) throw new Error('Failed to fetch transaction documents');
        return response.json();
      },
      staleTime: 0
    });

    const downloadTransactionDocument = useMutation({
      mutationFn: async (documentId: number) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/transaction-documents/${documentId}/download`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!response.ok) throw new Error('Failed to download document');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `transaction-document-${documentId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Document downloaded successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Download Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getDocumentIcon = (mimeType: string) => {
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
      if (mimeType.includes('image')) return '🖼️';
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
      return '📄';
    };

    if (documentsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-400">Loading documents...</span>
        </div>
      );
    }

    if (allTransactionDocuments.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No documents uploaded yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Documents will appear here when you upload them through transaction steps
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {allTransactionDocuments.map((doc) => (
          <div key={doc.id} className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{getDocumentIcon(doc.mimeType)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{doc.originalFilename}</h3>
                  <p className="text-sm text-gray-400">{doc.documentType}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>Deal: {doc.dealTitle}</span>
                    <span>Step: {doc.stepName}</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Uploaded
                </Badge>
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => downloadTransactionDocument.mutate(doc.id)}
                  disabled={downloadTransactionDocument.isPending}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Fetch broker deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ['/api/broker/deals'],
    retry: false,
  });

  // Fetch broker documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ['/api/broker/documents'],
    retry: false,
  });

  // Fetch admin files sent to broker
  const { data: adminFiles = [], isLoading: adminFilesLoading } = useQuery<AdminFile[]>({
    queryKey: ['/api/broker/admin-files'],
    retry: false,
  });

  // Fetch broker statistics
  const { data: stats } = useQuery<{
    activeDeals: number;
    totalValue: string;
    successRate: number;
    completionRate: number;
    averageDealSize: string;
    totalCommission: string;
  }>({
    queryKey: ['/api/broker/stats'],
    retry: false,
  });

  // Download document mutation
  const downloadMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/broker/documents/${documentId}/download`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) throw new Error('Download failed');
      return response.blob();
    },
    onSuccess: (blob, documentId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${documentId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your document is being downloaded.",
      });
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, dealId, description }: { file: File; dealId?: number; description: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (dealId) formData.append('dealId', dealId.toString());
      formData.append('description', description);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/broker/documents/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/broker/documents'] });
      toast({
        title: "Upload Successful",
        description: "Your document has been uploaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Could not upload the document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark admin file as read
  const markAsReadMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/broker/admin-files/${fileId}/mark-read`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/broker/admin-files'] });
    },
  });

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter documents
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Broker Dashboard</h1>
          <p className="text-gray-600">Manage your deals, documents, and client communications</p>
        </div>

        {/* Payment Reminder - Show when trial is ending or expired */}
        {shouldShowPaymentReminder && (
          <PaymentReminder
            trialDaysRemaining={trialDaysRemaining}
            isTrialExpired={isTrialExpired}
            planName="Professional Plan"
            planPrice="$150"
          />
        )}

        {/* Rejected Steps Alert */}
        {(() => {
          const rejectedStepsCount = deals.reduce((count, deal) => {
            // This would need to be updated to check actual steps data
            // For now, we'll simulate some rejected steps
            return count + (deal.status === 'active' ? Math.floor(Math.random() * 2) : 0);
          }, 0);
          
          if (rejectedStepsCount > 0) {
            return (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="font-medium text-red-800">
                      {rejectedStepsCount} Step{rejectedStepsCount > 1 ? 's' : ''} Require{rejectedStepsCount === 1 ? 's' : ''} Attention
                    </h3>
                    <p className="text-red-700 text-sm">
                      You have rejected transaction steps that need to be addressed. Click "Manage Steps" on the affected deals to review and resubmit.
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => setActiveTab('steps')}
                  >
                    Review Steps
                  </Button>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeDeals || 0}</p>
                </div>
                <Handshake className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${stats?.totalValue || '0'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.successRate || '0'}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Clear selected deal when switching away from steps tab
          if (value !== 'steps') {
            setSelectedDeal(null);
          }
        }}>
          <TabsList className="grid w-full grid-cols-7 bg-gray-800 border-gray-700">
            <TabsTrigger value="deals" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Handshake className="h-4 w-4 mr-2" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="steps" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Steps
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="admin-files" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Paperclip className="h-4 w-4 mr-2" />
              Admin Files
            </TabsTrigger>
            <TabsTrigger value="oil-prices" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Oil Prices
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="support-chat" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Support Chat
            </TabsTrigger>
            <TabsTrigger value="support-chat" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Support Chat
            </TabsTrigger>
          </TabsList>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CreateDealDialog />
            </div>

            {filteredDeals.length === 0 ? (
              <div className="text-center py-12">
                <Handshake className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Deals Found</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No deals match your current filters.' 
                    : 'Start by creating your first deal to begin tracking your broker activities.'}
                </p>
                <CreateDealDialog />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDeals.map((deal) => (
                  <Card key={deal.id} className="bg-gray-800/90 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white">{deal.dealTitle}</CardTitle>
                          <CardDescription className="text-gray-300">{deal.companyName}</CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(deal.status)} text-white`}>
                          {getStatusIcon(deal.status)}
                          <span className="ml-1 capitalize">{deal.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Deal Value</p>
                          <p className="font-semibold text-white">{deal.dealValue}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Oil Type</p>
                          <p className="font-semibold text-white">{deal.oilType}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Quantity</p>
                          <p className="font-semibold text-white">{deal.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Documents</p>
                          <p className="font-semibold text-white">{deal.documentsCount}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{deal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${deal.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            setSelectedDeal(deal);
                            setShowDealModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('Setting selected deal:', deal);
                            setSelectedDeal(deal);
                            console.log('Switching to steps tab');
                            setActiveTab('steps');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          View Steps
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Steps Tab */}
          <TabsContent value="steps" className="space-y-6">
            <StepManagement selectedDeal={selectedDeal} />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Admin Files Section */}
            <Card className="bg-gray-800/90 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Admin Files</CardTitle>
                <CardDescription className="text-gray-300">
                  Files sent to you by the administration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminFiles.map((file) => (
                    <div key={file.id} className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            file.priority === 'urgent' ? 'bg-red-600' : 
                            file.priority === 'high' ? 'bg-orange-600' : 
                            file.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                          }`}>
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{file.originalName}</h3>
                            <p className="text-sm text-gray-400">{file.description}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>{file.fileSize}</span>
                              <span>Category: {file.category}</span>
                              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={file.priority === 'urgent' ? 'destructive' : 'default'}>
                            {file.priority}
                          </Badge>
                          <Badge variant={file.isRead ? 'default' : 'secondary'}>
                            {file.isRead ? 'Read' : 'New'}
                          </Badge>
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              window.open(`/api/broker-files/${file.id}/download`, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {adminFiles.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No admin files available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction Documents Section */}
            <Card className="bg-gray-800/90 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your Documents</CardTitle>
                <CardDescription className="text-gray-300">
                  Documents you have uploaded through transaction steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionDocumentsSection />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Files Tab */}
          <TabsContent value="admin-files" className="space-y-6">
            <Card className="bg-gray-800/90 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Files from Admin</CardTitle>
                <CardDescription className="text-gray-300">
                  Documents and files sent to you by the admin team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                          <Paperclip className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{file.fileName}</h4>
                          <p className="text-sm text-gray-400">{file.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            <span>From: {file.sentBy}</span>
                            <span>•</span>
                            <span>{file.sentDate}</span>
                            <span>•</span>
                            <span>{file.fileSize}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {file.category}
                        </Badge>
                        <Button 
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => markAsReadMutation.mutate(file.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Oil Prices Tab */}
          <TabsContent value="oil-prices" className="space-y-6">
            <SimpleOilTradingPrices />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/90 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Deal Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Completion Rate</span>
                      <span className="text-white font-semibold">{stats?.completionRate || '0'}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Average Deal Size</span>
                      <span className="text-white font-semibold">${stats?.averageDealSize || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Commission</span>
                      <span className="text-white font-semibold">${stats?.totalCommission || '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/90 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-400">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                    <p>Performance charts will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Chat Tab */}
          <TabsContent value="support-chat" className="space-y-6">
            <BrokerAdminChat />
          </TabsContent>
        </Tabs>

        {/* Deal Details Modal */}
        {selectedDeal && (
          <Dialog open={showDealModal} onOpenChange={(open) => {
            setShowDealModal(open);
            if (!open) {
              // Don't clear selectedDeal here - this allows Steps tab to keep working
            }
          }}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedDeal.dealTitle}</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Deal details and documentation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Company</Label>
                    <p className="text-white font-semibold">{selectedDeal.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Deal Value</Label>
                    <p className="text-white font-semibold">{selectedDeal.dealValue}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Oil Type</Label>
                    <p className="text-white font-semibold">{selectedDeal.oilType}</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Quantity</Label>
                    <p className="text-white font-semibold">{selectedDeal.quantity}</p>
                  </div>
                </div>
                
                {selectedDeal.notes && (
                  <div>
                    <Label className="text-gray-300">Notes</Label>
                    <p className="text-white mt-1">{selectedDeal.notes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedDeal(null)}>
                    Close
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Company
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}