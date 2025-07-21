import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ArrowUpDown, Copy, File, FileText, Filter, MoreHorizontal, Plus, RefreshCw, Search, Ship, Store, GanttChart } from 'lucide-react';
import { LawJustice } from "@/components/icons/LawJustice";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useVessels } from '@/hooks/useVessels';
import type { Document } from '@/types';
import { DOCUMENT_TYPES } from '@shared/constants';

export default function Documents() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Query to fetch documents
  const { 
    data: documents = [], 
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['/api/documents', selectedVesselId],
    queryFn: async () => {
      const url = selectedVesselId 
        ? `/api/documents?vesselId=${selectedVesselId}` 
        : '/api/documents';
      return apiRequest(url, { method: 'GET' });
    }
  });

  // Query to fetch vessels for the dropdown
  const { data: vessels = [], isLoading: isLoadingVessels } = useVessels();

  // Mutation to generate new document
  const generateDocumentMutation = useMutation({
    mutationFn: ({ vesselId, documentType }: { vesselId: number, documentType: string }) => {
      return apiRequest('/api/ai/generate-document', {
        method: 'POST',
        body: JSON.stringify({ vesselId, documentType }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Document created',
        description: 'The document was successfully created.',
      });
      setShowGenerateDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create document. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating document:', error);
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
    
    // Manifests (keeping for backward compatibility)
    if (activeTab === 'manifests' && doc.type.toLowerCase().includes('manifest')) return true;
    
    // Inspections (keeping for backward compatibility)
    if (activeTab === 'inspections' && doc.type.toLowerCase().includes('inspection')) return true;
    
    // Loading (keeping for backward compatibility)
    if (activeTab === 'loading' && doc.type.toLowerCase().includes('loading')) return true;
    
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
    if (!selectedVesselId || !documentType) {
      toast({
        title: 'Missing information',
        description: 'Please select a vessel and document type.',
        variant: 'destructive',
      });
      return;
    }

    generateDocumentMutation.mutate({ 
      vesselId: selectedVesselId, 
      documentType 
    });
  };

  return (
    <div className="container py-6 mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <h1 className="text-2xl font-bold">Shipping Documents</h1>
          
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
                  <label className="text-sm text-gray-500">Vessel</label>
                  <Select 
                    value={selectedVesselId?.toString() || 'all'}
                    onValueChange={(value) => setSelectedVesselId(value !== 'all' ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All vessels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All vessels</SelectItem>
                      {vessels.map((vessel) => (
                        <SelectItem key={vessel.id} value={vessel.id.toString()}>
                          {vessel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      setSelectedVesselId(null);
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-3">
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
                    <TabsTrigger value="spa" className="whitespace-nowrap">SPA</TabsTrigger>
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
                
                <TabsContent value="bills" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>
                
                <TabsContent value="legal" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>

                <TabsContent value="commercial" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>

                <TabsContent value="shipping" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>

                <TabsContent value="loi" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>

                <TabsContent value="spa" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>
                
                <TabsContent value="manifests" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>
                
                <TabsContent value="inspections" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>
                
                <TabsContent value="loading" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>
                
                <TabsContent value="others" className="mt-0">
                  <DocumentList 
                    documents={filteredDocuments} 
                    isLoading={isLoadingDocuments}
                    onViewDocument={setSelectedDocument}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Document Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>
              Select a vessel and document type to create professional documentation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="vessel" className="text-sm font-medium">
                Vessel
              </label>
              <Select 
                value={selectedVesselId?.toString() || ''} 
                onValueChange={(value) => value ? setSelectedVesselId(parseInt(value)) : setSelectedVesselId(null)}
              >
                <SelectTrigger id="vessel">
                  <SelectValue placeholder="Select a vessel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>Select a vessel</SelectItem>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id.toString()}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="documentType" className="text-sm font-medium">
                Document Type
              </label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="placeholder" disabled>Select document type</SelectItem>
                  
                  {/* Legal Document Category */}
                  <SelectItem value="legal-separator" disabled className="font-bold text-primary bg-muted">
                    <div className="flex items-center">
                      <LawJustice className="w-4 h-4 mr-2" />
                      Legal Documents
                    </div>
                  </SelectItem>
                  {DOCUMENT_TYPES
                    .filter(docType => {
                      const lowerDocType = docType.toLowerCase();
                      return lowerDocType.includes('contract') || 
                             lowerDocType.includes('agreement') || 
                             lowerDocType.includes('loi') || 
                             lowerDocType.includes('letter of intent') ||
                             lowerDocType.includes('letter of indemnity') ||
                             lowerDocType.includes('legal') ||
                             lowerDocType.includes('certificate') ||
                             lowerDocType.includes('spa');
                    })
                    .map((docType) => {
                      // Extract English part of document type (before the dash)
                      const englishDocType = docType.split(' - ')[0];
                      // Use a simplified value for the backend API
                      const valueForAPI = englishDocType.split(' (')[0].toLowerCase();
                      
                      return (
                        <SelectItem key={docType} value={valueForAPI} className="pl-6">
                          {docType}
                        </SelectItem>
                      );
                    })
                  }
                  
                  {/* Commercial Document Category */}
                  <SelectItem value="commercial-separator" disabled className="font-bold text-primary bg-muted">
                    <div className="flex items-center">
                      <Store className="w-4 h-4 mr-2" />
                      Commercial Documents
                    </div>
                  </SelectItem>
                  {DOCUMENT_TYPES
                    .filter(docType => {
                      const lowerDocType = docType.toLowerCase();
                      return lowerDocType.includes('invoice') || 
                             lowerDocType.includes('commercial') || 
                             lowerDocType.includes('sale') ||
                             lowerDocType.includes('purchase') && !lowerDocType.includes('agreement');
                    })
                    .map((docType) => {
                      // Extract English part of document type (before the dash)
                      const englishDocType = docType.split(' - ')[0];
                      // Use a simplified value for the backend API
                      const valueForAPI = englishDocType.split(' (')[0].toLowerCase();
                      
                      return (
                        <SelectItem key={docType} value={valueForAPI} className="pl-6">
                          {docType}
                        </SelectItem>
                      );
                    })
                  }
                  
                  {/* Shipping Document Category */}
                  <SelectItem value="shipping-separator" disabled className="font-bold text-primary bg-muted">
                    <div className="flex items-center">
                      <Ship className="w-4 h-4 mr-2" />
                      Shipping Documents
                    </div>
                  </SelectItem>
                  {DOCUMENT_TYPES
                    .filter(docType => {
                      const lowerDocType = docType.toLowerCase();
                      return lowerDocType.includes('bill') || 
                             lowerDocType.includes('lading') || 
                             lowerDocType.includes('manifest') ||
                             lowerDocType.includes('shipping') ||
                             lowerDocType.includes('cargo') ||
                             lowerDocType.includes('inspection') ||
                             lowerDocType.includes('loading');
                    })
                    .map((docType) => {
                      // Extract English part of document type (before the dash)
                      const englishDocType = docType.split(' - ')[0];
                      // Use a simplified value for the backend API
                      const valueForAPI = englishDocType.split(' (')[0].toLowerCase();
                      
                      return (
                        <SelectItem key={docType} value={valueForAPI} className="pl-6">
                          {docType}
                        </SelectItem>
                      );
                    })
                  }
                  
                  {/* Other Document Category */}
                  <SelectItem value="other-separator" disabled className="font-bold text-primary bg-muted">
                    <div className="flex items-center">
                      <File className="w-4 h-4 mr-2" />
                      Other Documents
                    </div>
                  </SelectItem>
                  {DOCUMENT_TYPES
                    .filter(docType => {
                      const lowerDocType = docType.toLowerCase();
                      return !lowerDocType.includes('contract') && 
                             !lowerDocType.includes('agreement') && 
                             !lowerDocType.includes('loi') && 
                             !lowerDocType.includes('letter of intent') &&
                             !lowerDocType.includes('letter of indemnity') &&
                             !lowerDocType.includes('legal') &&
                             !lowerDocType.includes('certificate') &&
                             !lowerDocType.includes('spa') &&
                             !lowerDocType.includes('invoice') && 
                             !lowerDocType.includes('commercial') && 
                             !lowerDocType.includes('sale') &&
                             !lowerDocType.includes('purchase') &&
                             !lowerDocType.includes('bill') && 
                             !lowerDocType.includes('lading') && 
                             !lowerDocType.includes('manifest') &&
                             !lowerDocType.includes('shipping') &&
                             !lowerDocType.includes('cargo') &&
                             !lowerDocType.includes('inspection') &&
                             !lowerDocType.includes('loading');
                    })
                    .map((docType) => {
                      // Extract English part of document type (before the dash)
                      const englishDocType = docType.split(' - ')[0];
                      // Use a simplified value for the backend API
                      const valueForAPI = englishDocType.split(' (')[0].toLowerCase();
                      
                      return (
                        <SelectItem key={docType} value={valueForAPI} className="pl-6">
                          {docType}
                        </SelectItem>
                      );
                    })
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateDocument} 
              disabled={generateDocumentMutation.isPending}
            >
              {generateDocumentMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] h-full sm:h-auto overflow-y-auto w-full sm:max-w-4xl">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl break-words">{selectedDocument.title}</DialogTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className="font-medium">{selectedDocument.type}</Badge>
                  
                  {selectedDocument.status && (
                    <Badge className={
                      selectedDocument.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' : 
                      selectedDocument.status === 'expired' ? 'bg-amber-100 text-amber-800 border-amber-300' : 
                      selectedDocument.status === 'revoked' ? 'bg-red-100 text-red-800 border-red-300' : 
                      selectedDocument.status === 'pending' ? 'bg-blue-100 text-blue-800 border-blue-300' : 
                      selectedDocument.status === 'draft' ? 'bg-gray-100 text-gray-800 border-gray-300' : 
                      ''
                    }>
                      {selectedDocument.status}
                    </Badge>
                  )}
                  
                  {selectedDocument.reference && (
                    <Badge variant="outline" className="bg-zinc-100">
                      Ref: {selectedDocument.reference}
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              
              {/* Document Metadata Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Document Information</h4>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-sm text-slate-500">Issue Date:</dt>
                      <dd className="text-sm font-medium">
                        {selectedDocument.issueDate 
                          ? formatDate(selectedDocument.issueDate) 
                          : formatDate(selectedDocument.createdAt)}
                      </dd>
                    </div>
                    
                    {selectedDocument.expiryDate && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Expiry Date:</dt>
                        <dd className="text-sm font-medium">
                          {formatDate(selectedDocument.expiryDate)}
                        </dd>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <dt className="text-sm text-slate-500">Last Modified:</dt>
                      <dd className="text-sm font-medium">
                        {selectedDocument.lastModified 
                          ? formatDate(selectedDocument.lastModified) 
                          : formatDate(selectedDocument.createdAt)}
                      </dd>
                    </div>
                    
                    {selectedDocument.language && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Language:</dt>
                        <dd className="text-sm font-medium">
                          {selectedDocument.language === 'en' ? 'English' : 
                           selectedDocument.language === 'ar' ? 'العربية' : 
                           selectedDocument.language}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Authority Information</h4>
                  <dl className="space-y-1">
                    {selectedDocument.issuer && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Issuing Authority:</dt>
                        <dd className="text-sm font-medium">
                          {selectedDocument.issuer}
                        </dd>
                      </div>
                    )}
                    
                    {selectedDocument.recipientName && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Recipient:</dt>
                        <dd className="text-sm font-medium">
                          {selectedDocument.recipientName}
                        </dd>
                      </div>
                    )}
                    
                    {selectedDocument.recipientOrg && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Recipient Organization:</dt>
                        <dd className="text-sm font-medium">
                          {selectedDocument.recipientOrg}
                        </dd>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <dt className="text-sm text-slate-500">Vessel ID:</dt>
                      <dd className="text-sm font-medium">
                        {selectedDocument.vesselId}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Legal Document Template for LOI, SPA, and other legal documents */}
              {(selectedDocument.type.toLowerCase().includes('loi') || 
                selectedDocument.type.toLowerCase().includes('letter of intent') || 
                selectedDocument.type.toLowerCase().includes('letter of indemnity') ||
                selectedDocument.type.toLowerCase().includes('spa') || 
                selectedDocument.type.toLowerCase().includes('sale') || 
                selectedDocument.type.toLowerCase().includes('purchase agreement') ||
                selectedDocument.type.toLowerCase().includes('contract') ||
                selectedDocument.type.toLowerCase().includes('legal')
               ) ? (
                <div className="border border-slate-200 rounded-md overflow-hidden mt-4">
                  {/* Legal Document Header */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <LawJustice className="h-5 w-5 text-slate-700 mr-2" />
                        <span className="font-semibold text-slate-800">
                          {selectedDocument.type} - {selectedDocument.reference || 'Confidential'}
                        </span>
                      </div>
                      <Badge variant="outline" className="border-slate-400">
                        {selectedDocument.language === 'ar' ? 'وثيقة قانونية' : 'Legal Document'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Legal Document Content with professional styling */}
                  <div className="p-5 bg-white">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedDocument.content.split('\n').map((paragraph, idx) => {
                        // Format section headers
                        if (paragraph.toUpperCase() === paragraph && paragraph.trim().length > 0) {
                          return (
                            <h3 key={idx} className="font-bold text-slate-800 my-3">
                              {paragraph}
                            </h3>
                          );
                        } 
                        // Format article numbers (e.g., "1.", "Article 1:", etc.)
                        else if (/^(Article\s+)?\d+[\.:]\s/.test(paragraph) || /^[A-Z][\.:]\s/.test(paragraph)) {
                          return (
                            <h4 key={idx} className="font-semibold text-slate-700 mt-3 mb-2">
                              {paragraph}
                            </h4>
                          );
                        }
                        // Regular paragraphs
                        else if (paragraph.trim()) {
                          return (
                            <p key={idx} className="mb-2 text-slate-700">
                              {paragraph}
                            </p>
                          );
                        }
                        // Empty lines for spacing
                        return <div key={idx} className="h-2"></div>;
                      })}
                    </div>
                    
                    {/* Signatures section if document has signatures */}
                    {selectedDocument.content.toLowerCase().includes('sign') && (
                      <div className="mt-8 pt-6 border-t border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-xs uppercase text-slate-500 mb-1">ISSUER</h5>
                            <div className="h-16 border border-dashed border-slate-300 rounded-md flex items-center justify-center">
                              <span className="text-slate-400 text-sm">{selectedDocument.issuer || 'Authorized Signature'}</span>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs uppercase text-slate-500 mb-1">RECIPIENT</h5>
                            <div className="h-16 border border-dashed border-slate-300 rounded-md flex items-center justify-center">
                              <span className="text-slate-400 text-sm">{selectedDocument.recipientName || 'Authorized Signature'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Standard document view for non-legal documents
                <div className="font-mono text-sm bg-white border p-3 sm:p-4 rounded-md whitespace-pre-wrap overflow-x-auto mt-4">
                  {selectedDocument.content}
                </div>
              )}
              
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDocument(null)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // Copy to clipboard
                    navigator.clipboard.writeText(selectedDocument.content);
                    toast({
                      title: 'Copied to clipboard',
                      description: 'Document content has been copied to clipboard.',
                    });
                  }}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onViewDocument: (document: Document) => void;
}

function DocumentList({ documents, isLoading, onViewDocument }: DocumentListProps) {
  const { toast } = useToast();
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="bg-gray-100 p-3 rounded-md">
              <Skeleton className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium">No documents found</h3>
        <p className="text-gray-500 mt-1">
          Try adjusting your filters or generate a new document.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 ${
            doc.status === 'expired' ? 'border-amber-300 bg-amber-50' : 
            doc.status === 'revoked' ? 'border-red-300 bg-red-50' : 
            doc.status === 'pending' ? 'border-blue-300 bg-blue-50' : 
            'border-gray-200'
          }`}
          onClick={(e) => {
            // Prevent triggering when clicking on buttons
            if ((e.target as HTMLElement).closest('button')) return;
            onViewDocument(doc);
          }}
        >
          <div className={`p-2 rounded-md shrink-0 ${
            doc.status === 'active' ? 'bg-green-50' : 
            doc.status === 'expired' ? 'bg-amber-50' : 
            doc.status === 'revoked' ? 'bg-red-50' : 
            doc.status === 'pending' ? 'bg-blue-50' : 
            doc.status === 'draft' ? 'bg-gray-50' : 
            'bg-blue-50'
          }`}>
            {/* Use specific icons based on document type */}
            {doc.type.toLowerCase().includes('loi') || 
             doc.type.toLowerCase().includes('letter of intent') || 
             doc.type.toLowerCase().includes('letter of indemnity') ||
             doc.type.toLowerCase().includes('contract') || 
             doc.type.toLowerCase().includes('legal') ? (
              <LawJustice className={`h-6 w-6 ${
                doc.status === 'active' ? 'text-green-600' : 
                doc.status === 'expired' ? 'text-amber-600' : 
                doc.status === 'revoked' ? 'text-red-600' : 
                doc.status === 'pending' ? 'text-blue-600' : 
                doc.status === 'draft' ? 'text-gray-600' : 
                'text-blue-600'
              }`} />
            ) : doc.type.toLowerCase().includes('spa') || 
                doc.type.toLowerCase().includes('sale') || 
                doc.type.toLowerCase().includes('purchase') || 
                doc.type.toLowerCase().includes('invoice') ||
                doc.type.toLowerCase().includes('commercial') ? (
              <Store className={`h-6 w-6 ${
                doc.status === 'active' ? 'text-green-600' : 
                doc.status === 'expired' ? 'text-amber-600' : 
                doc.status === 'revoked' ? 'text-red-600' : 
                doc.status === 'pending' ? 'text-blue-600' : 
                doc.status === 'draft' ? 'text-gray-600' : 
                'text-blue-600'
              }`} />
            ) : doc.type.toLowerCase().includes('shipping') || 
                doc.type.toLowerCase().includes('bill') || 
                doc.type.toLowerCase().includes('lading') ||
                doc.type.toLowerCase().includes('manifest') ||
                doc.type.toLowerCase().includes('cargo') ? (
              <Ship className={`h-6 w-6 ${
                doc.status === 'active' ? 'text-green-600' : 
                doc.status === 'expired' ? 'text-amber-600' : 
                doc.status === 'revoked' ? 'text-red-600' : 
                doc.status === 'pending' ? 'text-blue-600' : 
                doc.status === 'draft' ? 'text-gray-600' : 
                'text-blue-600'
              }`} />
            ) : (
              <File className={`h-6 w-6 ${
                doc.status === 'active' ? 'text-green-600' : 
                doc.status === 'expired' ? 'text-amber-600' : 
                doc.status === 'revoked' ? 'text-red-600' : 
                doc.status === 'pending' ? 'text-blue-600' : 
                doc.status === 'draft' ? 'text-gray-600' : 
                'text-blue-600'
              }`} />
            )}
          </div>
          
          <div className="flex-1 min-w-0 order-1 sm:order-none w-[calc(100%-85px)] sm:w-auto">
            <div className="flex justify-between">
              <h4 className="text-sm font-medium truncate">{doc.title}</h4>
              {doc.reference && (
                <span className="text-xs text-gray-500 hidden sm:inline">
                  Ref: {doc.reference}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {doc.type}
              </Badge>
              
              {doc.status && (
                <Badge variant="outline" className={`text-xs ${
                  doc.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                  doc.status === 'expired' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                  doc.status === 'revoked' ? 'bg-red-50 text-red-700 border-red-200' : 
                  doc.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                  doc.status === 'draft' ? 'bg-gray-50 text-gray-700 border-gray-200' : 
                  ''
                }`}>
                  {doc.status}
                </Badge>
              )}
              
              <span className="text-xs text-gray-500">
                {doc.issueDate ? formatDate(doc.issueDate) : formatDate(doc.createdAt)}
              </span>
              
              {doc.expiryDate && (
                <span className="text-xs text-gray-500">
                  Exp: {formatDate(doc.expiryDate)}
                </span>
              )}
            </div>
            {doc.issuer && (
              <span className="text-xs text-gray-500 block mt-1">
                Issuer: {doc.issuer}
              </span>
            )}
          </div>
          
          <div className="flex gap-1 ml-auto shrink-0">
            <Button
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={() => onViewDocument(doc)}
            >
              View
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDocument(doc)}>
                  View document
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    navigator.clipboard.writeText(doc.content);
                    toast({
                      title: 'Copied to clipboard',
                      description: 'Document content has been copied to clipboard.',
                    });
                  }}
                >
                  Copy content
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}