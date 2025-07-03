import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, FileText, Eye, Brain } from "lucide-react";

interface DocumentTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDocumentTemplates() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "general"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch document templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/document-templates"],
    queryFn: async () => {
      const response = await apiRequest("/api/document-templates");
      return Array.isArray(response) ? response : [];
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: typeof newTemplate) => {
      return await apiRequest("/api/document-templates", {
        method: "POST",
        body: JSON.stringify(template)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-templates"] });
      setIsCreateDialogOpen(false);
      setNewTemplate({ name: "", description: "", category: "general" });
      toast({
        title: "Success",
        description: "Document template created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive"
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<DocumentTemplate> & { id: number }) => {
      return await apiRequest(`/api/document-templates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-templates"] });
      setEditingTemplate(null);
      toast({
        title: "Success",
        description: "Template updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive"
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/document-templates/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive"
      });
    }
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.description.trim()) {
      toast({
        title: "Error",
        description: "Name and description are required",
        variant: "destructive"
      });
      return;
    }
    createTemplateMutation.mutate(newTemplate);
  };

  const handleUpdateTemplate = (template: DocumentTemplate) => {
    if (!template.name.trim() || !template.description.trim()) {
      toast({
        title: "Error",
        description: "Name and description are required",
        variant: "destructive"
      });
      return;
    }
    updateTemplateMutation.mutate(template);
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      general: "bg-gray-100 text-gray-800",
      technical: "bg-blue-100 text-blue-800",
      safety: "bg-red-100 text-red-800",
      commercial: "bg-green-100 text-green-800"
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Document Templates</h1>
              <p className="text-lg text-gray-600">Create and manage AI-powered document templates for vessel documentation</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Create AI Document Template
                  </DialogTitle>
                  <DialogDescription>
                    Create a new template with an AI prompt that will generate customized documents using vessel data.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="e.g., Vessel Safety Certificate"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">AI Prompt Description</Label>
                    <Textarea
                      id="description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      placeholder="Describe what kind of document the AI should generate. This will be used as the AI prompt along with vessel data to create customized documents."
                      rows={6}
                    />
                    <p className="text-sm text-gray-500">
                      This description will be used as an AI prompt. The vessel data will be automatically included when generating documents.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
                    {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Templates Created</h3>
                <p className="text-gray-600 mb-4">Create your first AI document template to get started.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            templates.map((template: DocumentTemplate) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        {template.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryBadge(template.category)}>
                          {template.category}
                        </Badge>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>{template.name}</DialogTitle>
                            <DialogDescription>AI Prompt Description</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.description}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={editingTemplate?.id === template.id} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Edit Template</DialogTitle>
                            <DialogDescription>
                              Update the template details and AI prompt description.
                            </DialogDescription>
                          </DialogHeader>
                          {editingTemplate && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Template Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editingTemplate.name}
                                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Select value={editingTemplate.category} onValueChange={(value) => setEditingTemplate({ ...editingTemplate, category: value })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="safety">Safety</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-description">AI Prompt Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={editingTemplate.description}
                                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                                  rows={6}
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => editingTemplate && handleUpdateTemplate(editingTemplate)}
                              disabled={updateTemplateMutation.isPending}
                            >
                              {updateTemplateMutation.isPending ? "Updating..." : "Update Template"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTemplateMutation.mutate(template.id)}
                        disabled={deleteTemplateMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3">{template.description}</p>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}