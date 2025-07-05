import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Plus, Eye, BookOpen, Clock } from "lucide-react";
import type { Vessel } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProfessionalDocument {
  id: number;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'under_review' | 'approved' | 'published';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  pdfPath?: string;
}

interface ProfessionalDocumentViewerProps {
  vessel: Vessel;
}

export function ProfessionalDocumentViewer({ vessel }: ProfessionalDocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<ProfessionalDocument | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch vessel documents
  const { data: documents = [], isLoading } = useQuery<ProfessionalDocument[]>({
    queryKey: [`/api/vessels/${vessel.id}/documents`],
    enabled: !!vessel.id,
  });

  // Mutation to generate new document (admin only)
  const generateDocumentMutation = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      return await apiRequest(`/api/admin/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
    },
    onSuccess: (newDocument) => {
      // Associate the document with the vessel
      associateDocumentMutation.mutate({
        vesselId: vessel.id,
        documentId: newDocument.id,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate document",
        variant: "destructive",
      });
    },
  });

  // Mutation to associate document with vessel
  const associateDocumentMutation = useMutation({
    mutationFn: async ({ vesselId, documentId }: { vesselId: number; documentId: number }) => {
      return await apiRequest(`/api/admin/vessels/${vesselId}/documents/${documentId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vessels/${vessel.id}/documents`] });
      setIsCreating(false);
      setDocumentTitle("");
      setDocumentDescription("");
      toast({
        title: "Success",
        description: "Professional document generated and associated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to associate document with vessel",
        variant: "destructive",
      });
    },
  });

  // Mutation to download document as PDF
  const downloadPdfMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/vessels/${vessel.id}/documents/${documentId}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${selectedDocument?.title || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to download PDF",
        variant: "destructive",
      });
    },
  });

  const handleGenerateDocument = () => {
    if (!documentTitle.trim() || !documentDescription.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and description",
        variant: "destructive",
      });
      return;
    }

    generateDocumentMutation.mutate({
      title: documentTitle,
      description: documentDescription,
    });
  };

  const handleDownloadPdf = (documentId: number) => {
    downloadPdfMutation.mutate(documentId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, color: "text-gray-700 bg-gray-100" },
      under_review: { variant: "secondary" as const, color: "text-yellow-700 bg-yellow-100" },
      approved: { variant: "secondary" as const, color: "text-blue-700 bg-blue-100" },
      published: { variant: "secondary" as const, color: "text-green-700 bg-green-100" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Professional Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading documents...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Professional Documents
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              disabled={generateDocumentMutation.isPending}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Document
            </Button>
          </CardTitle>
          <CardDescription>
            AI-generated professional documents for {vessel.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-4">Generate New Document</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document-title">Document Title</Label>
                  <Input
                    id="document-title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="document-description">Document Description</Label>
                  <Textarea
                    id="document-description"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="Provide a brief description of the document content..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateDocument}
                    disabled={generateDocumentMutation.isPending || associateDocumentMutation.isPending}
                  >
                    {generateDocumentMutation.isPending || associateDocumentMutation.isPending ? "Generating..." : "Generate Document"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setDocumentTitle("");
                      setDocumentDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Documents Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first professional document for this vessel
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((document) => (
                <Card key={document.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{document.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {document.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {getStatusBadge(document.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(document.createdAt)}
                        </div>
                      </div>
                      <div>Updated: {formatDate(document.updatedAt)}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocument(document)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {document.status === 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPdf(document.id)}
                          disabled={downloadPdfMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedDocument.title}</CardTitle>
                <CardDescription>
                  {formatDate(selectedDocument.createdAt)} • {getStatusBadge(selectedDocument.status)}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDocument(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-6 prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{selectedDocument.content}</div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}