import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Plus, Eye, BookOpen, Clock, Loader2, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Vessel } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DocumentTemplate {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  canGenerate: boolean;
  accessMessage: string;
}

interface GeneratedDocument {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  vesselId: number;
  templateId: number;
}

interface AIDocumentGeneratorProps {
  vesselId: number;
  vesselName: string;
}

export default function AIDocumentGenerator({ vesselId, vesselName }: AIDocumentGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [expandedDocument, setExpandedDocument] = useState<number | null>(null);

  // Fetch available document templates based on user access level
  const { data: templates = [], isLoading: templatesLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/document-templates'],
    queryFn: async () => {
      const response = await fetch('/api/document-templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
    staleTime: 0
  });

  // Fetch generated documents for this vessel
  const { data: generatedDocuments = [], isLoading: documentsLoading } = useQuery<GeneratedDocument[]>({
    queryKey: ['/api/generated-documents', vesselId],
    queryFn: async () => {
      const response = await fetch(`/api/generated-documents?vesselId=${vesselId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch generated documents');
      }
      return response.json();
    },
    staleTime: 0
  });

  // Generate document mutation
  const generateDocumentMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          templateId,
          vesselId,
          vesselName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to generate document: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document Created Successfully",
        description: "Professional document has been created and is ready for download.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/generated-documents', vesselId] });
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Download document function
  const downloadDocument = async (doc: GeneratedDocument, format: 'pdf' | 'docx' = 'pdf') => {
    try {
      const response = await fetch(`/api/download-document/${doc.id}?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.${format}`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${doc.title} is being downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (templatesLoading || documentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Professional Documentation
          </CardTitle>
          <CardDescription>
            Loading available document templates...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Available Document Templates
          </CardTitle>
          <CardDescription>
            Select a template to create professional maritime documentation for {vesselName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Templates Available</p>
              <p className="text-sm">Contact your administrator to add document templates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template: DocumentTemplate) => (
                <Card key={template.id} className="border hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {template.title}
                      {template.canGenerate ? (
                        <Button
                          size="sm"
                          onClick={() => generateDocumentMutation.mutate(template.id)}
                          disabled={generateDocumentMutation.isPending}
                          className="ml-2"
                        >
                          {generateDocumentMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          Create
                        </Button>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                disabled
                                className="ml-2 bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-400"
                                onClick={() => {
                                  toast({
                                    title: "Access Required",
                                    description: template.accessMessage,
                                    variant: "destructive",
                                  });
                                }}
                              >
                                <Lock className="h-4 w-4" />
                                Locked
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>{template.accessMessage}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                    {!template.canGenerate && (
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-orange-700 text-xs">
                        <Lock className="h-3 w-3 inline mr-1" />
                        {template.accessMessage}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Created {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downloaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Downloaded Documents
          </CardTitle>
          <CardDescription>
            Professional documents created for {vesselName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Documents Created Yet</p>
              <p className="text-sm">Create your first document using the templates above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedDocuments.map((document: GeneratedDocument) => (
                <Card key={document.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{document.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Clock className="h-4 w-4 mr-1" />
                          Created {new Date(document.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedDocument(
                            expandedDocument === document.id ? null : document.id
                          )}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {expandedDocument === document.id ? 'Hide' : 'Preview'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDocument(document, 'pdf')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDocument(document, 'docx')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Word
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {expandedDocument === document.id && (
                    <CardContent>
                      <ScrollArea className="h-64 w-full rounded border p-4">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: document.content }}
                        />
                      </ScrollArea>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}