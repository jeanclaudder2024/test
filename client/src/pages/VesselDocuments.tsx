import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tabs, 
  TabsContent,
  TabsList,
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  ArrowUpDown, 
  ChevronLeft, 
  Copy, 
  File, 
  FileText, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  Search, 
  Ship, 
  Store, 
  GanttChart 
} from 'lucide-react';
import { LawJustice } from "@/components/icons/LawJustice";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DOCUMENT_TYPES } from '@shared/constants';

interface Document {
  id: number;
  vesselId: number;
  type: string;
  title: string;
  content: string;
  status: string;
  issueDate: string;
  expiryDate?: string;
  reference?: string;
  issuer?: string;
  recipientName?: string;
  recipientOrg?: string;
}

interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
}

// Document list component
const DocumentList = ({ 
  documents, 
  isLoading, 
  onViewDocument 
}: { 
  documents: Document[], 
  isLoading: boolean,
  onViewDocument: (doc: Document) => void
}) => {
  if (isLoading) {
    return (
      <div className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-4 p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!documents.length) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium">No documents found</h3>
        <p className="mt-2 text-sm text-gray-500">
          There are no documents matching your current filters.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-amber-500 text-white">Expired</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-blue-500 text-white">Pending</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('bill') || lowerType.includes('lading')) {
      return <File className="w-5 h-5 text-blue-500" />;
    }
    
    if (lowerType.includes('certificate') || lowerType.includes('legal')) {
      return <LawJustice className="w-5 h-5 text-red-500" />;
    }
    
    if (lowerType.includes('invoice') || lowerType.includes('commercial')) {
      return <GanttChart className="w-5 h-5 text-green-500" />;
    }
    
    if (lowerType.includes('manifest') || lowerType.includes('cargo')) {
      return <Ship className="w-5 h-5 text-purple-500" />;
    }
    
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="divide-y">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onViewDocument(doc)}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {getDocumentIcon(doc.type)}
              </div>
              <div>
                <h4 className="font-medium">{doc.title}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {doc.type}
                  </Badge>
                  {getStatusBadge(doc.status || 'Active')}
                  {doc.reference && (
                    <Badge variant="outline" className="text-xs">
                      Ref: {doc.reference}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {doc.issueDate && (
                    <span className="mr-4">Issued: {formatDate(doc.issueDate)}</span>
                  )}
                  {doc.expiryDate && (
                    <span>Expires: {formatDate(doc.expiryDate)}</span>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(doc.content);
                }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Content
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onViewDocument(doc);
                }}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {doc.content.substring(0, 150)}...
          </p>
        </div>
      ))}
    </div>
  );
};

export default function VesselDocuments() {
  const { id } = useParams<{ id: string }>();
  const vesselId = parseInt(id);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [documentType, setDocumentType] = useState<string>('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Query to fetch vessel details
  const {
    data: vessel,
    isLoading: isLoadingVessel,
  } = useQuery({
    queryKey: [`/api/vessels/${vesselId}`],
    queryFn: async () => {
      const response = await apiRequest(`/api/vessels/${vesselId}`);
      return response;
    },
  });

  // Query to fetch vessel documents
  const { 
    data: documents = [], 
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: [`/api/vessels/${vesselId}/documents`],
    queryFn: async () => {
      return apiRequest(`/api/vessels/${vesselId}/documents`);
    }
  });

  // Mutation to generate new document
  const generateDocumentMutation = useMutation({
    mutationFn: ({ documentType }: { documentType: string }) => {
      return apiRequest('/api/ai/generate-document', {
        method: 'POST',
        body: JSON.stringify({ vesselId, documentType }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Document generated',
        description: 'The document was successfully generated.',
      });
      setShowGenerateDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/vessels/${vesselId}/documents`] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to generate document. Please try again.',
        variant: 'destructive',
      });
      console.error('Error generating document:', error);
    }
  });

  // Filter documents based on search term, active tab, and status
  const documentArray = Array.isArray(documents) ? documents : [];
  const filteredDocuments = documentArray.filter((doc: Document) => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || (doc.status || 'active') === statusFilter;
    
    // Only proceed if it passes both search and status filters
    if (!matchesSearch || !matchesStatus) return false;
    
    // Apply tab filter based on document categories
    if (activeTab === 'all') return true;
    
    // Legal document types
    if (activeTab === 'legal') {
      return doc.type.toLowerCase().includes('contract') || 
             doc.type.toLowerCase().includes('agreement') || 
             doc.type.toLowerCase().includes('certificate') ||
             doc.type.toLowerCase().includes('compliance') ||
             doc.type.toLowerCase().includes('legal');
    }
    
    // Commercial document types
    if (activeTab === 'commercial') {
      return doc.type.toLowerCase().includes('invoice') || 
             doc.type.toLowerCase().includes('commercial') || 
             doc.type.toLowerCase().includes('sales') ||
             doc.type.toLowerCase().includes('purchase') ||
             doc.type.toLowerCase().includes('trading');
    }
    
    // Shipping document types
    if (activeTab === 'shipping') {
      return doc.type.toLowerCase().includes('shipping') || 
             doc.type.toLowerCase().includes('transport') || 
             doc.type.toLowerCase().includes('delivery') ||
             doc.type.toLowerCase().includes('cargo');
    }
    
    // Bills of Lading
    if (activeTab === 'bills' && doc.type.toLowerCase().includes('bill')) return true;
    
    // Letters of Intent
    if (activeTab === 'loi' && (
      doc.type.toLowerCase().includes('loi') || 
      doc.type.toLowerCase().includes('letter of intent') ||
      doc.type.toLowerCase().includes('letter of indemnity')
    )) return true;
    
    // Sales/Purchase Agreements
    if (activeTab === 'spa' && (
      doc.type.toLowerCase().includes('spa') || 
      doc.type.toLowerCase().includes('sales and purchase') ||
      doc.type.toLowerCase().includes('purchase agreement')
    )) return true;
    
    // Manifests
    if (activeTab === 'manifests' && doc.type.toLowerCase().includes('manifest')) return true;
    
    // Others - anything that doesn't fit in above categories
    if (activeTab === 'others') {
      const commonTypes = [
        'bill', 'manifest', 'inspection', 'loading',
        'contract', 'agreement', 'certificate', 'compliance', 'legal',
        'invoice', 'commercial', 'sales', 'purchase', 'trading',
        'shipping', 'transport', 'delivery', 'cargo',
        'loi', 'letter of intent', 'letter of indemnity',
        'spa', 'sales and purchase', 'purchase agreement'
      ];
      
      return !commonTypes.some(type => doc.type.toLowerCase().includes(type));
    }
    return false;
  });

  const handleGenerateDocument = () => {
    if (!documentType) {
      toast({
        title: 'Missing information',
        description: 'Please select a document type.',
        variant: 'destructive',
      });
      return;
    }

    generateDocumentMutation.mutate({ documentType });
  };

  if (isLoadingVessel) {
    return (
      <div className="container py-6 mx-auto">
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="container py-6 mx-auto">
        <div className="text-center py-12">
          <Ship className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium">Vessel not found</h3>
          <p className="mt-2 text-sm text-gray-500">
            The requested vessel could not be found.
          </p>
          <Button asChild className="mt-4">
            <Link href="/vessels">Back to Vessels</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/vessels/${vesselId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Vessel
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">{vessel.name} - Documents</h1>
            <p className="text-muted-foreground">
              IMO: {vessel.imo} • {vessel.vesselType} • {vessel.flag}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => refetchDocuments()}
              disabled={isLoadingDocuments}
              className="flex-1 sm:flex-initial"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            
            <Button 
              onClick={() => setShowGenerateDialog(true)}
              className="flex-1 sm:flex-initial"
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate Document
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="col-span-1 lg:sticky lg:top-4 lg:self-start h-auto">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium mb-3">Document Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <Select 
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="expired">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                          Expired
                        </div>
                      </SelectItem>
                      <SelectItem value="revoked">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          Revoked
                        </div>
                      </SelectItem>
                      <SelectItem value="draft">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                          Draft
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 lg:col-span-3">
            <Card className="bg-white">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 pt-4 gap-2">
                  <TabsList className="overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="legal" className="whitespace-nowrap">
                      <div className="flex items-center">
                        <LawJustice className="w-3 h-3 mr-1" />
                        Legal
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="commercial" className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Store className="w-3 h-3 mr-1" />
                        Commercial
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="shipping" className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Ship className="w-3 h-3 mr-1" />
                        Shipping
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="bills" className="whitespace-nowrap">Bills of Lading</TabsTrigger>
                    <TabsTrigger value="loi" className="whitespace-nowrap">LOI</TabsTrigger>
                    <TabsTrigger value="manifests" className="whitespace-nowrap">Manifests</TabsTrigger>
                    <TabsTrigger value="others">Others</TabsTrigger>
                  </TabsList>
                  
                  <div className="text-sm text-gray-500 w-full sm:w-auto text-right">
                    {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <TabsContent value="all" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>
                
                {['bills', 'legal', 'commercial', 'shipping', 'loi', 'spa', 'manifests', 'others'].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <DocumentList 
                      documents={filteredDocuments} 
                      isLoading={isLoadingDocuments}
                      onViewDocument={setSelectedDocument}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Generate Document Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Document</DialogTitle>
            <DialogDescription>
              Generate a new document for {vessel?.name}. Select the type of document you need.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="documentType">Document Type</label>
              <Select
                value={documentType}
                onValueChange={setDocumentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowGenerateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateDocument}
              disabled={generateDocumentMutation.isPending}
            >
              {generateDocumentMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Document'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedDocument.title}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{selectedDocument.type}</Badge>
                  {selectedDocument.issueDate && (
                    <Badge variant="outline">
                      Issued: {formatDate(selectedDocument.issueDate)}
                    </Badge>
                  )}
                  {selectedDocument.expiryDate && (
                    <Badge variant="outline">
                      Expires: {formatDate(selectedDocument.expiryDate)}
                    </Badge>
                  )}
                  {selectedDocument.reference && (
                    <Badge variant="outline">
                      Ref: {selectedDocument.reference}
                    </Badge>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="whitespace-pre-wrap p-4 bg-gray-50 rounded-md">
                {selectedDocument.content}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(selectedDocument.content)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Content
              </Button>
              <Button onClick={() => setSelectedDocument(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}