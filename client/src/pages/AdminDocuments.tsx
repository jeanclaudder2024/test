import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Eye, Edit, Trash2, Clock, Settings } from "lucide-react";
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

export default function AdminDocuments() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ProfessionalDocument | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch all professional documents
  const { data: documents = [], isLoading } = useQuery<ProfessionalDocument[]>({
    queryKey: ['/api/admin/documents'],
  });

  // Mutation to create new document
  const createDocumentMutation = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      return await apiRequest('/api/admin/documents', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      setIsCreating(false);
      setDocumentTitle("");
      setDocumentDescription("");
      toast({
        title: "Success",
        description: "Professional document created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create document",
        variant: "destructive",
      });
    },
  });

  // Mutation to update document status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ documentId, status }: { documentId: number; status: string }) => {
      return await apiRequest(`/api/admin/documents/${documentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      toast({
        title: "Success",
        description: "Document status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update document status",
        variant: "destructive",
      });
    },
  });

  const handleCreateDocument = () => {
    if (!documentTitle.trim() || !documentDescription.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and description",
        variant: "destructive",
      });
      return;
    }

    createDocumentMutation.mutate({
      title: documentTitle,
      description: documentDescription,
    });
  };

  const handleStatusChange = (documentId: number, newStatus: string) => {
    updateStatusMutation.mutate({ documentId, status: newStatus });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const getStatusActions = (document: ProfessionalDocument) => {
    const actions = [];
    
    switch (document.status) {
      case 'draft':
        actions.push(
          <Button
            key="review"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(document.id, 'under_review')}
          >
            Send for Review
          </Button>
        );
        break;
      case 'under_review':
        actions.push(
          <Button
            key="approve"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(document.id, 'approved')}
            className="text-blue-700 border-blue-200 hover:bg-blue-50"
          >
            Approve
          </Button>
        );
        actions.push(
          <Button
            key="reject"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(document.id, 'draft')}
            className="text-red-700 border-red-200 hover:bg-red-50"
          >
            Reject
          </Button>
        );
        break;
      case 'approved':
        actions.push(
          <Button
            key="publish"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(document.id, 'published')}
            className="text-green-700 border-green-200 hover:bg-green-50"
          >
            Publish
          </Button>
        );
        break;
      case 'published':
        actions.push(
          <Button
            key="unpublish"
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(document.id, 'approved')}
            className="text-orange-700 border-orange-200 hover:bg-orange-50"
          >
            Unpublish
          </Button>
        );
        break;
    }
    
    return actions;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading documents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Professional Document Management</h1>
        <p className="text-muted-foreground">
          Manage AI-generated professional documents for maritime operations
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Document Management
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              disabled={createDocumentMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </CardTitle>
          <CardDescription>
            Create and manage professional maritime documents with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-4">Create New Professional Document</h3>
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
                    onClick={handleCreateDocument}
                    disabled={createDocumentMutation.isPending}
                  >
                    {createDocumentMutation.isPending ? "Creating..." : "Create Document"}
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
                Create your first professional document template
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <Card key={document.id} className="border">
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
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Created: {formatDate(document.createdAt)}
                        </div>
                        {document.updatedAt !== document.createdAt && (
                          <div>Updated: {formatDate(document.updatedAt)}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingDocument(document)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Content
                      </Button>
                      {getStatusActions(document)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      {editingDocument && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <Card className="fixed inset-4 z-50 bg-background border shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{editingDocument.title}</CardTitle>
                  <CardDescription>
                    {formatDate(editingDocument.createdAt)} • {getStatusBadge(editingDocument.status)}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingDocument(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-200px)] overflow-auto">
                <div className="p-6 prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{editingDocument.content}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}