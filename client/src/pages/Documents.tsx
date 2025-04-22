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
import { ArrowUpDown, Copy, File, FileText, Filter, MoreHorizontal, Plus, RefreshCw, Search } from 'lucide-react';
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
        title: 'Document generated',
        description: 'The document was successfully generated.',
      });
      setShowGenerateDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
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

  // Filter documents based on search term and active tab
  const documentArray = Array.isArray(documents) ? documents : [];
  const filteredDocuments = documentArray.filter((doc: Document) => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply tab filter (all, bills, manifests, inspections, others)
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'bills' && doc.type.toLowerCase().includes('bill')) return matchesSearch;
    if (activeTab === 'manifests' && doc.type.toLowerCase().includes('manifest')) return matchesSearch;
    if (activeTab === 'inspections' && doc.type.toLowerCase().includes('inspection')) return matchesSearch;
    if (activeTab === 'loading' && doc.type.toLowerCase().includes('loading')) return matchesSearch;
    if (activeTab === 'others') {
      return matchesSearch && 
        !doc.type.toLowerCase().includes('bill') && 
        !doc.type.toLowerCase().includes('manifest') && 
        !doc.type.toLowerCase().includes('inspection') &&
        !doc.type.toLowerCase().includes('loading');
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
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedVesselId(null);
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
                    <TabsTrigger value="bills" className="whitespace-nowrap">Bills of Lading</TabsTrigger>
                    <TabsTrigger value="manifests">Manifests</TabsTrigger>
                    <TabsTrigger value="inspections">Inspections</TabsTrigger>
                    <TabsTrigger value="loading">Loading</TabsTrigger>
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

      {/* Generate Document Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Document</DialogTitle>
            <DialogDescription>
              Select a vessel and document type to generate using AI.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="vessel" className="text-sm font-medium">
                Vessel
              </label>
              <Select 
                value={selectedVesselId?.toString() || 'select'} 
                onValueChange={(value) => value !== 'select' ? setSelectedVesselId(parseInt(value)) : null}
              >
                <SelectTrigger id="vessel">
                  <SelectValue placeholder="Select a vessel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select" disabled>Select a vessel</SelectItem>
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
                  {DOCUMENT_TYPES.map((docType) => {
                    // Extract English part of document type (before the dash)
                    const englishDocType = docType.split(' - ')[0];
                    // Use a simplified value for the backend API
                    const valueForAPI = englishDocType.split(' (')[0].toLowerCase();
                    
                    return (
                      <SelectItem key={docType} value={valueForAPI}>
                        {docType}
                      </SelectItem>
                    );
                  })}
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
              {generateDocumentMutation.isPending ? 'Generating...' : 'Generate'}
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
                  <Badge variant="outline">{selectedDocument.type}</Badge>
                  <span className="text-sm text-gray-500">
                    Created: {formatDate(selectedDocument.createdAt)}
                  </span>
                </div>
              </DialogHeader>
              
              <div className="font-mono text-sm bg-gray-50 p-3 sm:p-4 rounded-md whitespace-pre-wrap overflow-x-auto">
                {selectedDocument.content}
              </div>
              
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
          className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
          onClick={(e) => {
            // Prevent triggering when clicking on buttons
            if ((e.target as HTMLElement).closest('button')) return;
            onViewDocument(doc);
          }}
        >
          <div className="bg-blue-50 p-2 rounded-md shrink-0">
            <File className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0 order-1 sm:order-none w-[calc(100%-85px)] sm:w-auto">
            <h4 className="text-sm font-medium truncate">{doc.title}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {doc.type}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDate(doc.createdAt)}
              </span>
            </div>
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