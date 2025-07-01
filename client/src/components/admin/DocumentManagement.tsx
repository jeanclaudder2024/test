import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Plus, Edit, Trash2, Search, Sparkles, Ship } from "lucide-react";

interface Document {
  id: number;
  title: string;
  description: string | null;
  content: string;
  documentType: string;
  status: string;
  category: string;
  tags: string | null;
  isTemplate: boolean;
  isActive: boolean;
  vesselId: number | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Vessel {
  id: number;
  name: string;
  imo: string;
}

const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  documentType: z.string().min(1, "Document type is required"),
  status: z.enum(["active", "inactive", "draft"]),
  category: z.enum(["general", "technical", "legal", "commercial"]),
  tags: z.string().optional(),
  isTemplate: z.boolean().default(false),
  vesselId: z.coerce.number().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

export default function DocumentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      documentType: "",
      status: "draft",
      category: "general",
      tags: "",
      isTemplate: false,
    },
  });

  // Fetch documents
  const { data: documentsResponse, isLoading, error } = useQuery({
    queryKey: ["/api/documents"],
    retry: 1,
  });

  // Extract documents from API response
  const documents = Array.isArray(documentsResponse?.data) ? documentsResponse.data : [];

  // Fetch vessels for association
  const { data: vesselsResponse, isLoading: isLoadingVessels } = useQuery({
    queryKey: ["/api/vessels"],
  });
  
  const vesselData = Array.isArray(vesselsResponse) ? vesselsResponse : 
                     Array.isArray(vesselsResponse?.data) ? vesselsResponse.data : [];

  // Generate content with AI
  const generateContent = async (documentId: number) => {
    setIsGeneratingContent(true);
    try {
      const response = await apiRequest(`/api/documents/${documentId}/generate`, {
        method: "POST",
      });
      
      if (response.success && response.data) {
        // Update form with generated content
        form.setValue("content", response.data.content);
        toast({
          title: "Success",
          description: "Content generated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Create document mutation
  const createMutation = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      return await apiRequest("/api/documents", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Document created successfully",
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

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async (data: DocumentFormData & { id: number }) => {
      return await apiRequest(`/api/documents/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsDialogOpen(false);
      setEditingDocument(null);
      form.reset();
      toast({
        title: "Success",
        description: "Document updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update document",
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/documents/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DocumentFormData) => {
    if (editingDocument) {
      updateMutation.mutate({ ...data, id: editingDocument.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    form.reset({
      title: document.title,
      description: document.description || "",
      content: document.content,
      vesselId: document.vesselId || undefined,
      documentType: document.documentType,
      status: document.status as "active" | "inactive" | "draft",
      category: document.category as "general" | "technical" | "legal" | "commercial",
      tags: document.tags || "",
      isTemplate: document.isTemplate,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingDocument(null);
    form.reset();
    setIsDialogOpen(true);
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load documents</h3>
          <p className="text-gray-500">{error.message}</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/documents"] })}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Document Management</h3>
          <p className="text-sm text-gray-500">Create and manage administrative documents</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? "Edit Document" : "Create New Document"}
              </DialogTitle>
              <DialogDescription>
                {editingDocument 
                  ? "Update the document information below." 
                  : "Fill in the details to create a new document."
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Document title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  {...form.register("description")}
                  placeholder="Brief description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Input
                    id="documentType"
                    {...form.register("documentType")}
                    placeholder="e.g., Certificate, Report"
                  />
                  {form.formState.errors.documentType && (
                    <p className="text-sm text-red-600">{form.formState.errors.documentType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    {...form.register("tags")}
                    placeholder="Comma-separated tags"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as "active" | "inactive" | "draft")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value as "general" | "technical" | "legal" | "commercial")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vesselId">Associated Vessel (Optional)</Label>
                <Select 
                  value={form.watch("vesselId")?.toString() || ""} 
                  onValueChange={(value) => form.setValue("vesselId", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vessel">
                      {form.watch("vesselId") ? (
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4" />
                          <span>{vesselData?.find(v => v.id === form.watch("vesselId"))?.name || "Select vessel"}</span>
                        </div>
                      ) : (
                        "No vessel selected"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No vessel</SelectItem>
                    {isLoadingVessels ? (
                      <div className="p-2 text-center text-sm text-gray-500">Loading vessels...</div>
                    ) : (
                      vesselData?.map((vessel) => (
                        <SelectItem key={vessel.id} value={vessel.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Ship className="h-4 w-4" />
                            <span>{vessel.name}</span>
                            <span className="text-xs text-gray-500">({vessel.imo})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  {editingDocument && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateContent(editingDocument.id)}
                      disabled={isGeneratingContent}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-3 w-3" />
                      {isGeneratingContent ? "Generating..." : "Generate with AI"}
                    </Button>
                  )}
                </div>
                <Textarea
                  id="content"
                  {...form.register("content")}
                  placeholder="Document content"
                  rows={8}
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isTemplate"
                  {...form.register("isTemplate")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isTemplate">Use as template</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingDocument ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg font-medium line-clamp-1">
                  {document.title}
                </CardTitle>
                {document.description && (
                  <CardDescription className="line-clamp-2 mt-1">
                    {document.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(document)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(document.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={document.status === "active" ? "default" : document.status === "draft" ? "secondary" : "outline"}>
                  {document.status}
                </Badge>
                <Badge variant="outline">{document.category}</Badge>
                <Badge variant="outline">{document.documentType}</Badge>
                {document.vesselId && vesselData && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Ship className="h-3 w-3" />
                    {vesselData.find(v => v.id === document.vesselId)?.name || `Vessel ${document.vesselId}`}
                  </Badge>
                )}
                {document.isTemplate && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Template
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">
                {document.content}
              </p>
              {document.tags && (
                <div className="mt-2 text-xs text-gray-500">
                  Tags: {document.tags}
                </div>
              )}
              <div className="mt-3 text-xs text-gray-400">
                Created: {new Date(document.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {documents.length === 0 
              ? "Get started by creating your first document."
              : "Try adjusting your search filters."
            }
          </p>
        </div>
      )}
    </div>
  );
}