import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, FileText, Layout, Type, Sparkles, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { LandingPageContent, InsertLandingPageContent } from "@shared/schema";

// Content section definitions matching the actual landing page structure
const CONTENT_SECTIONS = [
  { value: "hero", label: "Hero Section", icon: Type },
  { value: "industry", label: "Industry Showcase Section", icon: Layout },
  { value: "why-us", label: "Why PetroDealHub Section", icon: Sparkles },
  { value: "features", label: "Platform Features Section", icon: Layout },
  { value: "how-it-works", label: "How It Works Section", icon: FileText },
  { value: "results", label: "Results & Testimonials Section", icon: Sparkles },
  { value: "cta", label: "Call to Action Section", icon: Type },
  { value: "pricing", label: "Subscription Plans Section", icon: Layout },
];

export default function LandingPageManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LandingPageContent | null>(null);
  const [formData, setFormData] = useState<Partial<InsertLandingPageContent>>({
    section: "",
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    displayOrder: 1,
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch landing page content
  const { data: landingContent, isLoading } = useQuery({
    queryKey: ["/api/admin/landing-content"],
    staleTime: 0,
  });

  // Create content mutation
  const createContentMutation = useMutation({
    mutationFn: (data: InsertLandingPageContent) => 
      apiRequest("POST", "/api/admin/landing-content", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-content"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Landing page content created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create content",
        variant: "destructive",
      });
    },
  });

  // Update content mutation
  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertLandingPageContent> }) =>
      apiRequest("PUT", `/api/admin/landing-content/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-content"] });
      setIsEditDialogOpen(false);
      setSelectedContent(null);
      resetForm();
      toast({
        title: "Success",
        description: "Landing page content updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update content",
        variant: "destructive",
      });
    },
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/landing-content/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-content"] });
      toast({
        title: "Success",
        description: "Landing page content deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      section: "",
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      displayOrder: 1,
      isActive: true,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.section || !formData.title) {
      toast({
        title: "Error",
        description: "Please fill in section and title fields",
        variant: "destructive",
      });
      return;
    }
    createContentMutation.mutate(formData as InsertLandingPageContent);
  };

  const handleEdit = (content: LandingPageContent) => {
    setSelectedContent(content);
    setFormData({
      section: content.section,
      title: content.title || "",
      subtitle: content.subtitle || "",
      description: content.description || "",
      buttonText: content.buttonText || "",
      buttonLink: content.buttonLink || "",
      displayOrder: content.displayOrder || 1,
      isActive: content.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent || !formData.section || !formData.title) {
      toast({
        title: "Error",
        description: "Please fill in section and title fields",
        variant: "destructive",
      });
      return;
    }
    updateContentMutation.mutate({
      id: selectedContent.id,
      data: formData as Partial<InsertLandingPageContent>,
    });
  };

  const getSectionInfo = (section: string) => {
    return CONTENT_SECTIONS.find(s => s.value === section) || { 
      label: section, 
      icon: FileText 
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Landing Page Content</h2>
          <p className="text-gray-600">Manage all text content and sections on the landing page</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Landing Page Content</DialogTitle>
              <DialogDescription>
                Add new content section to the landing page
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Section *</label>
                  <Select 
                    value={formData.section} 
                    onValueChange={(value) => setFormData({ ...formData, section: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_SECTIONS.map((section) => (
                        <SelectItem key={section.value} value={section.value}>
                          <div className="flex items-center gap-2">
                            <section.icon className="w-4 h-4" />
                            {section.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter section title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Enter section subtitle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter section description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Button Text</label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Enter button text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Button Link</label>
                  <Input
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="Enter button link (e.g. /register)"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContentMutation.isPending}>
                  {createContentMutation.isPending ? "Creating..." : "Create Content"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content List */}
      <div className="grid gap-4">
        {landingContent && Array.isArray(landingContent) && landingContent.length > 0 ? (
          landingContent
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((content) => {
              const sectionInfo = getSectionInfo(content.section);
              return (
                <div key={content.id} className="bg-white border rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <sectionInfo.icon className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">{sectionInfo.label}</h3>
                        <span className="text-sm text-gray-500">#{content.displayOrder}</span>
                        {content.isActive ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        {content.title && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Title:</span>
                            <p className="text-gray-900">{content.title}</p>
                          </div>
                        )}
                        {content.subtitle && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Subtitle:</span>
                            <p className="text-gray-700">{content.subtitle}</p>
                          </div>
                        )}
                        {content.description && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Description:</span>
                            <p className="text-gray-700">{content.description}</p>
                          </div>
                        )}
                        {content.buttonText && (
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Button:</span>
                              <span className="ml-2 text-gray-900">{content.buttonText}</span>
                            </div>
                            {content.buttonLink && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Link:</span>
                                <span className="ml-2 text-blue-600">{content.buttonLink}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(content)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContentMutation.mutate(content.id)}
                        disabled={deleteContentMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No landing page content found. Create your first content section.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Landing Page Content</DialogTitle>
            <DialogDescription>
              Update the content section details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section *</label>
                <Select 
                  value={formData.section} 
                  onValueChange={(value) => setFormData({ ...formData, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_SECTIONS.map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        <div className="flex items-center gap-2">
                          <section.icon className="w-4 h-4" />
                          {section.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter section title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Enter section subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter section description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Button Text</label>
                <Input
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Enter button text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Link</label>
                <Input
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  placeholder="Enter button link (e.g. /register)"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="editIsActive" className="text-sm font-medium">Active</label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateContentMutation.isPending}>
                {updateContentMutation.isPending ? "Updating..." : "Update Content"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}