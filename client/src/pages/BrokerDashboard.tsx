import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
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
  const { toast } = useToast();

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
      const response = await fetch(`/api/broker/documents/${documentId}/download`);
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
      
      const response = await fetch('/api/broker/documents/upload', {
        method: 'POST',
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
      const response = await fetch(`/api/broker/admin-files/${fileId}/mark-read`, {
        method: 'POST',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Broker Dashboard</h1>
          <p className="text-gray-300">Manage your deals, documents, and client communications</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/90 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Active Deals</p>
                  <p className="text-2xl font-bold text-white">{stats?.activeDeals || 0}</p>
                </div>
                <Handshake className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Value</p>
                  <p className="text-2xl font-bold text-white">${stats?.totalValue || '0'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Documents</p>
                  <p className="text-2xl font-bold text-white">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{stats?.successRate || '0'}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="deals" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Handshake className="h-4 w-4 mr-2" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="admin-files" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Paperclip className="h-4 w-4 mr-2" />
              Admin Files
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
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
            </div>

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
                        onClick={() => setSelectedDeal(deal)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Upload a new document to your broker account
                    </DialogDescription>
                  </DialogHeader>
                  {/* Upload form would go here */}
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="bg-gray-800/90 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{doc.name}</h3>
                          <p className="text-sm text-gray-400">{doc.type}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{doc.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Downloads:</span>
                        <span>{doc.downloadCount}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                      onClick={() => downloadMutation.mutate(doc.id)}
                      disabled={downloadMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
        </Tabs>

        {/* Deal Details Modal */}
        {selectedDeal && (
          <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
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