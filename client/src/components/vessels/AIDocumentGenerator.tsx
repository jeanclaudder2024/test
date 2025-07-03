import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, FileText, Download, Eye, Sparkles, Bot, AlertTriangle, FileIcon, File } from "lucide-react";

interface DocumentTemplate {
  id: number;
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface GeneratedDocument {
  id: number;
  templateId: number;
  vesselId: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  format?: string;
  downloadUrl?: string;
  pdfPath?: string;
  wordPath?: string;
}

interface AIDocumentGeneratorProps {
  vesselId: number;
  vesselName: string;
}

export default function AIDocumentGenerator({ vesselId, vesselName }: AIDocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [viewingDocument, setViewingDocument] = useState<GeneratedDocument | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch document templates
  const { data: templates = [], isLoading: isLoadingTemplates, error: templatesError } = useQuery({
    queryKey: ["/api/document-templates"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/document-templates");
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching templates:", error);
        return [];
      }
    },
    retry: false
  });

  // Fetch generated documents for this vessel
  const { data: generatedDocuments = [], isLoading: isLoadingDocuments, error: documentsError } = useQuery({
    queryKey: ["/api/generated-documents", vesselId],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/generated-documents?vesselId=${vesselId}`);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching generated documents:", error);
        return [];
      }
    },
    retry: false
  });

  // Generate document mutation
  const generateDocumentMutation = useMutation({
    mutationFn: async ({ templateId, format }: { templateId: number; format: string }) => {
      const response = await apiRequest("/api/generate-document", {
        method: "POST",
        body: JSON.stringify({ templateId, vesselId, format })
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/generated-documents", vesselId] });
      setSelectedTemplate(null);
      toast({
        title: "Document Generated!",
        description: `AI has successfully generated "${data.document.title}" using vessel data.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate document. Please check if AI service is configured.",
        variant: "destructive"
      });
    }
  });

  const getCategoryBadge = (category: string) => {
    const colors = {
      general: "bg-gray-100 text-gray-800",
      technical: "bg-blue-100 text-blue-800",
      safety: "bg-red-100 text-red-800",
      commercial: "bg-green-100 text-green-800"
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const handleDownloadDocument = (document: GeneratedDocument) => {
    if (document.format === 'pdf' || document.format === 'word') {
      // For PDF and Word documents, use the downloadUrl
      if (document.downloadUrl) {
        window.open(document.downloadUrl, '_blank');
        toast({
          title: "Download Started", 
          description: `${document.format.toUpperCase()} document opened in new tab`
        });
      } else {
        toast({
          title: "Download Error",
          description: "Download link not available for this document",
          variant: "destructive"
        });
      }
    } else {
      // For text documents, create a blob download
      const element = window.document.createElement('a');
      const file = new Blob([document.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${document.title.replace(/\s+/g, '_')}.txt`;
      window.document.body.appendChild(element);
      element.click();
      window.document.body.removeChild(element);

      toast({
        title: "Download Started",
        description: "Text document downloaded successfully"
      });
    }
  };

  if (isLoadingTemplates || isLoadingDocuments) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show setup message if database tables don't exist
  if (templatesError || documentsError) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-800">Database Setup Required</h3>
        </div>
        <p className="text-yellow-700 mb-4">
          The AI document template system needs database tables to be created. Please run the following SQL schema in your Supabase database:
        </p>
        <div className="bg-white rounded border p-4 mb-4">
          <code className="text-sm text-gray-600">
            See DOCUMENT_TEMPLATES_SCHEMA.sql file for the complete schema
          </code>
        </div>
        <p className="text-sm text-yellow-600">
          Once the database schema is applied, the AI document generation system will be ready to use.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Bot className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">AI Document Generator</h2>
        </div>
        <p className="text-gray-600">Generate professional maritime documents using AI and real vessel data</p>
      </div>

      {/* Available Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Available Templates
        </h3>
        
        {templates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No document templates available. Contact admin to create templates.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template: DocumentTemplate) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        {template.title}
                      </CardTitle>
                      <Badge className={`mt-2 ${getCategoryBadge(template.category)}`}>
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">
                    {template.description}
                  </CardDescription>
                  <Dialog open={selectedTemplate?.id === template.id} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedTemplate(template)}
                        disabled={generateDocumentMutation.isPending}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Documents
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-blue-600" />
                          Generate AI Document
                        </DialogTitle>
                        <DialogDescription>
                          This will generate "{template.title}" using {vesselName}'s data and AI processing.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Template Description:</h4>
                          <p className="text-blue-800 text-sm">{template.description}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">What will be included:</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Complete vessel specifications and details</li>
                            <li>• Current operational status and position</li>
                            <li>• Technical capabilities and certifications</li>
                            <li>• Professional maritime formatting</li>
                          </ul>
                        </div>
                        
                        {/* Format Selection */}
                        <div className="bg-amber-50 p-4 rounded-lg mt-4">
                          <h4 className="font-semibold text-amber-900 mb-2">Choose Document Format:</h4>
                          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Text (.txt) - Simple text format
                                </div>
                              </SelectItem>
                              <SelectItem value="pdf">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4" />
                                  PDF (.pdf) - Beautiful formatted document with logos
                                </div>
                              </SelectItem>
                              <SelectItem value="word">
                                <div className="flex items-center gap-2">
                                  <FileIcon className="h-4 w-4" />
                                  Word (.docx) - Microsoft Word document format
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => generateDocumentMutation.mutate({ templateId: template.id, format: selectedFormat })}
                          disabled={generateDocumentMutation.isPending}
                          className="flex-1"
                        >
                          {generateDocumentMutation.isPending ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Now
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Generated Documents */}
      {generatedDocuments.length > 0 && (
        <div>
          <Separator className="mb-6" />
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Generated Documents ({generatedDocuments.length})
          </h3>
          
          <div className="grid gap-4">
            {generatedDocuments.map((document: GeneratedDocument) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        {document.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={document.status === 'generated' ? 'default' : 'secondary'}>
                          {document.status}
                        </Badge>
                        {document.format && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {document.format.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={viewingDocument?.id === document.id} onOpenChange={(open) => !open && setViewingDocument(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setViewingDocument(document)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{document.title}</DialogTitle>
                            <DialogDescription>
                              Generated on {new Date(document.createdAt).toLocaleDateString()}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            {document.format === 'pdf' || document.format === 'word' ? (
                              <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <div className="flex flex-col items-center gap-4">
                                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    {document.format === 'pdf' ? (
                                      <FileText className="h-8 w-8 text-blue-600" />
                                    ) : (
                                      <File className="h-8 w-8 text-blue-600" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {document.format === 'pdf' ? 'PDF Document Generated' : 'Word Document Generated'}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {document.format === 'pdf' 
                                        ? 'Professional PDF with PetroDealHub branding and formatting' 
                                        : 'Microsoft Word document (.docx) ready for download'
                                      }
                                    </p>
                                  </div>
                                  {document.downloadUrl && (
                                    <Button 
                                      onClick={() => window.open(document.downloadUrl, '_blank')}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download {document.format.toUpperCase()}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                  {document.content}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    Generated: {new Date(document.createdAt).toLocaleDateString()} at {new Date(document.createdAt).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}