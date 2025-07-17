import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Search,
  Filter,
  Calendar,
  User,
  Building,
  FileIcon,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrokerDocument {
  id: number;
  stepId: number;
  dealId: number;
  documentType: string;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: number;
  uploadedAt: string;
  dealTitle: string;
  stepName: string;
  stepNumber: number;
  brokerEmail: string;
  brokerName: string;
}

export function BrokerDocumentsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dealFilter, setDealFilter] = useState('all');
  const [stepFilter, setStepFilter] = useState('all');
  const { toast } = useToast();

  // Fetch all broker documents
  const { data: documents = [], isLoading } = useQuery<BrokerDocument[]>({
    queryKey: ['/api/admin/broker-documents'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/broker-documents', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) throw new Error('Failed to fetch broker documents');
      return response.json();
    },
    staleTime: 0
  });

  // Get unique deals and steps for filtering
  const uniqueDeals = [...new Set(documents.map(doc => doc.dealTitle))];
  const uniqueSteps = [...new Set(documents.map(doc => doc.stepName))];

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.brokerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDeal = dealFilter === 'all' || doc.dealTitle === dealFilter;
    const matchesStep = stepFilter === 'all' || doc.stepName === stepFilter;
    
    return matchesSearch && matchesDeal && matchesStep;
  });

  const downloadDocument = async (document: BrokerDocument) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/broker-documents/${document.id}/download`, {
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
      a.download = document.originalFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-400">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Broker Documents</h2>
          <p className="text-gray-400">Manage documents uploaded by brokers through transaction steps</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {filteredDocuments.length} Documents
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/90 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Deal Filter */}
            <Select value={dealFilter} onValueChange={setDealFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by deal" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Deals</SelectItem>
                {uniqueDeals.map((deal) => (
                  <SelectItem key={deal} value={deal}>
                    {deal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Step Filter */}
            <Select value={stepFilter} onValueChange={setStepFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by step" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Steps</SelectItem>
                {uniqueSteps.map((step) => (
                  <SelectItem key={step} value={step}>
                    {step}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setDealFilter('all');
                setStepFilter('all');
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="bg-gray-800/90 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Documents</CardTitle>
          <CardDescription className="text-gray-300">
            All documents uploaded by brokers through transaction steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No documents found</p>
              <p className="text-sm text-gray-500 mt-2">
                Documents will appear here when brokers upload them through transaction steps
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <div 
                  key={document.id} 
                  className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{getDocumentIcon(document.mimeType)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{document.originalFilename}</h3>
                        <p className="text-sm text-gray-400">{document.documentType}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {document.dealTitle}
                          </span>
                          <span className="flex items-center">
                            <FileIcon className="h-3 w-3 mr-1" />
                            Step {document.stepNumber}: {document.stepName}
                          </span>
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {document.brokerEmail}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {formatFileSize(document.fileSize)}
                      </Badge>
                      <Button 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => downloadDocument(document)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/90 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Documents</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/90 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Deals</p>
                <p className="text-2xl font-bold text-white">{uniqueDeals.length}</p>
              </div>
              <Building className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/90 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Transaction Steps</p>
                <p className="text-2xl font-bold text-white">{uniqueSteps.length}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/90 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Size</p>
                <p className="text-2xl font-bold text-white">
                  {formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0))}
                </p>
              </div>
              <FileIcon className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}